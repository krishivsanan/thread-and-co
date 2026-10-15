const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

/**
 * Fallback stylist logic in case GEMINI_API_KEY is not configured
 * or Gemini API rate limit / error occurs.
 */
function getFallbackAdvice(message, products) {
  const lower = (message || "").toLowerCase();
  let matched = [];
  let advice = "";

  if (lower.includes("wedding") || lower.includes("formal") || lower.includes("marriage")) {
    advice = "For a wedding or formal event, a clean structured look with refined fabrics makes a sophisticated statement. Here are tailored pieces from our collection that pair effortlessly:";
    matched = products.filter((p) =>
      p.category === "men" || p.category === "women"
    ).slice(0, 3);
  } else if (lower.includes("party") || lower.includes("night") || lower.includes("evening")) {
    advice = "For evening parties and get-togethers, balanced textures and modern cuts let you stand out while feeling effortless:";
    matched = products.filter((p) =>
      p.category === "women" || p.category === "men" || p.category === "shoes"
    ).slice(1, 4);
  } else if (lower.includes("casual") || lower.includes("everyday") || lower.includes("weekend")) {
    advice = "Everyday comfort looks best with timeless, minimalist essentials that mix and match easily:";
    matched = products.filter((p) =>
      p.price < 60 || p.category === "accessories" || p.category === "shoes"
    ).slice(0, 3);
  } else {
    advice = "Here are curated pieces from our current collection that embody our signature minimalist aesthetic:";
    matched = products.slice(0, 3);
  }

  if (matched.length === 0) {
    matched = products.slice(0, 3);
  }

  return { reply: advice, productIds: matched.map((p) => p.id) };
}

/**
 * POST /api/stylist
 * Body: { message: string, history?: Array<{ role: string, content: string }> }
 */
router.post("/", async (req, res, next) => {
  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Retrieve active product catalog
    const productsResult = await pool.query(
      "SELECT id, name, category, price, colors, sizes, rating, photo_url FROM products ORDER BY id ASC LIMIT 50"
    );
    const catalog = productsResult.rows.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: Number(p.price),
      colors: p.colors,
      photo_url: p.photo_url || `assets/images/products/${p.id}.jpg`,
    }));

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    let reply = "";
    let recommendedIds = [];

    if (apiKey) {
      try {
        const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const catalogSummary = catalog
          .map((p) => `ID ${p.id}: "${p.name}" (${p.category}, $${p.price.toFixed(2)})`)
          .join("\n");

        const systemPrompt = `You are the elevated AI fashion stylist for "Thread & Co.", a modern minimalist clothing boutique.
Your role:
1. Provide warm, knowledgeable, concise, and stylish fashion advice for the customer's request.
2. Select 1 to 4 matching items exclusively from our store catalog below.
3. You MUST respond with ONLY valid JSON (no markdown formatting, no code blocks, no backticks).
JSON structure:
{
  "reply": "Your fashion advice and styling notes (2-4 sentences)",
  "recommendedProductIds": [1, 3]
}

Store Catalog:
${catalogSummary}`;

        // Format conversation history for Gemini contents
        const contents = [];

        if (Array.isArray(history)) {
          for (const item of history.slice(-6)) {
            if (item.role && item.content) {
              contents.push({
                role: item.role === "ai" || item.role === "model" ? "model" : "user",
                parts: [{ text: String(item.content) }],
              });
            }
          }
        }

        contents.push({
          role: "user",
          parts: [{ text: message.trim() }],
        });

        const geminiRes = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            generationConfig: {
              temperature: 0.7,
              responseMimeType: "application/json",
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          try {
            // Strip any accidental markdown formatting if present
            const cleanText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanText);
            if (parsed.reply) reply = parsed.reply;
            if (Array.isArray(parsed.recommendedProductIds)) {
              recommendedIds = parsed.recommendedProductIds.map(Number).filter((n) => !isNaN(n));
            }
          } catch (parseErr) {
            console.warn("Failed to parse Gemini JSON output:", parseErr.message, rawText);
            reply = rawText;
          }
        } else {
          const errText = await geminiRes.text();
          console.warn("Gemini API error:", geminiRes.status, errText);
        }
      } catch (geminiErr) {
        console.warn("Error calling Gemini API:", geminiErr.message);
      }
    }

    // Fallback if Gemini wasn't configured or didn't return recommendations
    if (!reply || recommendedIds.length === 0) {
      const fallback = getFallbackAdvice(message, catalog);
      if (!reply) reply = fallback.reply;
      if (recommendedIds.length === 0) recommendedIds = fallback.productIds;
    }

    // Match recommended IDs with actual catalog product objects
    const recommendedProducts = catalog.filter((p) => recommendedIds.includes(p.id));

    res.json({
      reply,
      products: recommendedProducts,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
