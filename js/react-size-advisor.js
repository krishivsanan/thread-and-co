/* ==========================================================================
   REACT FIT & SIZE ADVISOR (React 18)
   --------------------------------------------------------------------------
   An interactive sizing assistant built with React 18 that analyzes shopper
   measurements, preferred fit silhouette, and category sizing to recommend
   the optimal size for the current product.
   
   React Hooks Used:
     - React.useState: Controls unit toggle, measurements, fit preference,
       modal/accordion expansion, and applied status.
     - React.useMemo: Dynamically calculates the recommended size, confidence
       score, and rationale from available product sizes.
     - React.useEffect: Persists measurements in localStorage and synchronizes
       with product data.
   ========================================================================== */

(() => {
  const e = React.createElement;

  function FitAdvisor() {
    // 1. Initial Profile from LocalStorage (or sensible defaults)
    const savedProfile = (() => {
      try {
        const raw = localStorage.getItem("threadco_fit_profile");
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();

    const [product, setProduct] = React.useState(window.CURRENT_PRODUCT || null);
    const [isOpen, setIsOpen] = React.useState(true);
    const [unitSystem, setUnitSystem] = React.useState(savedProfile?.unitSystem || "metric"); // "metric" | "imperial"
    const [height, setHeight] = React.useState(savedProfile?.height || (unitSystem === "metric" ? 176 : 69));
    const [weight, setWeight] = React.useState(savedProfile?.weight || (unitSystem === "metric" ? 72 : 158));
    const [fitPreference, setFitPreference] = React.useState(savedProfile?.fitPreference || "regular"); // "slim" | "regular" | "relaxed"
    const [appliedSize, setAppliedSize] = React.useState(null);

    // Synchronize with product details page loading
    React.useEffect(() => {
      if (window.CURRENT_PRODUCT) {
        setProduct(window.CURRENT_PRODUCT);
      }
      const handleProductLoaded = (evt) => {
        setProduct(evt.detail);
      };
      window.addEventListener("product:loaded", handleProductLoaded);
      return () => window.removeEventListener("product:loaded", handleProductLoaded);
    }, []);

    // Persist measurement profile changes
    React.useEffect(() => {
      try {
        localStorage.setItem(
          "threadco_fit_profile",
          JSON.stringify({ unitSystem, height, weight, fitPreference })
        );
      } catch (err) {
        // Safe fallback
      }
    }, [unitSystem, height, weight, fitPreference]);

    // Handle unit system conversion
    const handleUnitChange = (newUnit) => {
      if (newUnit === unitSystem) return;
      if (newUnit === "imperial") {
        setHeight(Math.round(height / 2.54)); // cm to inches
        setWeight(Math.round(weight * 2.20462)); // kg to lbs
      } else {
        setHeight(Math.round(height * 2.54)); // inches to cm
        setWeight(Math.round(weight / 2.20462)); // lbs to kg
      }
      setUnitSystem(newUnit);
    };

    // Calculate optimal size based on measurements & category
    const recommendation = React.useMemo(() => {
      if (!product || !Array.isArray(product.sizes) || product.sizes.length === 0) {
        return null;
      }

      // Normalized Metric Values for calculation
      const hCm = unitSystem === "metric" ? height : height * 2.54;
      const wKg = unitSystem === "metric" ? weight : weight / 2.20462;

      // 1. One-size items (accessories, bags)
      if (product.sizes.length === 1 && (product.sizes[0] === "One Size" || product.sizes[0] === "OS")) {
        return {
          size: product.sizes[0],
          confidence: 100,
          rationale: "Standard universal fit suitable for all sizes.",
          isOneSize: true,
        };
      }

      // 2. Footwear / Shoes
      if (product.category === "shoes") {
        // Approximate EU shoe size estimation from height/body ratio
        const baseShoe = Math.round(36 + (hCm - 150) * 0.22);
        const availableNums = product.sizes.map(Number).filter((n) => !isNaN(n));

        if (availableNums.length > 0) {
          // Find closest available shoe size
          const closest = availableNums.reduce((prev, curr) =>
            Math.abs(curr - baseShoe) < Math.abs(prev - baseShoe) ? curr : prev
          );
          return {
            size: String(closest),
            confidence: 88,
            rationale: `Estimated for your height (${Math.round(hCm)} cm). Shoes fit true to size with standard width.`,
          };
        }
      }

      // 3. Apparel (Men & Women Tops, Bottoms, Outerwear)
      // Body Mass Index estimation
      const heightM = hCm / 100;
      const bmi = wKg / (heightM * heightM);

      // Base size index from BMI: 0 = XS, 1 = S, 2 = M, 3 = L, 4 = XL
      let sizeIdx = 2; // Default M
      if (bmi < 19.5) sizeIdx = 0; // XS
      else if (bmi < 22) sizeIdx = 1; // S
      else if (bmi < 25.5) sizeIdx = 2; // M
      else if (bmi < 28.5) sizeIdx = 3; // L
      else sizeIdx = 4; // XL

      // Adjust based on fit preference
      if (fitPreference === "slim") {
        sizeIdx = Math.max(0, sizeIdx - 1);
      } else if (fitPreference === "relaxed") {
        sizeIdx = Math.min(4, sizeIdx + 1);
      }

      const standardTiers = ["XS", "S", "M", "L", "XL"];
      const targetSizeName = standardTiers[sizeIdx];

      // Match against what is actually in stock for this product
      let matchedSize = product.sizes.includes(targetSizeName)
        ? targetSizeName
        : product.sizes[Math.min(sizeIdx, product.sizes.length - 1)];

      const fitLabels = {
        slim: "tailored, close-to-body look",
        regular: "classic tailored silhouette",
        relaxed: "contemporary, laid-back drape",
      };

      return {
        size: matchedSize,
        confidence: fitPreference === "regular" ? 94 : 89,
        rationale: `Calculated from ${Math.round(wKg)} kg / ${Math.round(hCm)} cm, calibrated for a ${fitLabels[fitPreference]}.`,
      };
    }, [product, height, weight, fitPreference, unitSystem]);

    // Apply recommended size to main product selection
    const handleApplySize = (sizeToApply) => {
      if (typeof window.selectProductSize === "function") {
        const success = window.selectProductSize(sizeToApply);
        if (success) {
          setAppliedSize(sizeToApply);
          setTimeout(() => setAppliedSize(null), 3000);
        }
      }
    };

    if (!product) return null;

    return e(
      "div",
      { className: "fit-advisor-card", "aria-labelledby": "fit-advisor-heading" },
      // Card Header
      e(
        "div",
        { className: "fit-advisor__header", onClick: () => setIsOpen(!isOpen) },
        e(
          "div",
          { className: "fit-advisor__title-group" },
          e("span", { className: "fit-advisor__badge", "aria-hidden": "true" }, "✦"),
          e("h3", { id: "fit-advisor-heading", className: "fit-advisor__title" }, "Fit & Size Advisor"),
          e("span", { className: "fit-advisor__sub" }, "Interactive Smart Sizing")
        ),
        e(
          "button",
          {
            type: "button",
            className: "fit-advisor__toggle-btn",
            "aria-expanded": isOpen,
            "aria-label": isOpen ? "Collapse Fit Advisor" : "Expand Fit Advisor",
          },
          isOpen ? "−" : "+"
        )
      ),

      // Collapsible Content
      isOpen &&
        e(
          "div",
          { className: "fit-advisor__body" },
          // Unit Switcher
          e(
            "div",
            { className: "fit-advisor__unit-row" },
            e("span", { className: "fit-advisor__label" }, "Measurement Units"),
            e(
              "div",
              { className: "fit-advisor__unit-switch" },
              e(
                "button",
                {
                  type: "button",
                  className: `fit-advisor__unit-tab ${unitSystem === "metric" ? "is-active" : ""}`,
                  onClick: () => handleUnitChange("metric"),
                },
                "Metric (cm / kg)"
              ),
              e(
                "button",
                {
                  type: "button",
                  className: `fit-advisor__unit-tab ${unitSystem === "imperial" ? "is-active" : ""}`,
                  onClick: () => handleUnitChange("imperial"),
                },
                "Imperial (in / lbs)"
              )
            )
          ),

          // Sliders & Controls Grid
          e(
            "div",
            { className: "fit-advisor__controls-grid" },
            // Height Control
            e(
              "div",
              { className: "fit-advisor__field" },
              e(
                "div",
                { className: "fit-advisor__field-header" },
                e("label", { htmlFor: "fit-height-slider" }, "Height"),
                e(
                  "span",
                  { className: "fit-advisor__value" },
                  unitSystem === "metric"
                    ? `${height} cm`
                    : `${Math.floor(height / 12)}' ${height % 12}"`
                )
              ),
              e("input", {
                type: "range",
                id: "fit-height-slider",
                min: unitSystem === "metric" ? 140 : 55,
                max: unitSystem === "metric" ? 210 : 83,
                value: height,
                onChange: (ev) => setHeight(Number(ev.target.value)),
                className: "fit-advisor__slider",
              })
            ),

            // Weight Control
            e(
              "div",
              { className: "fit-advisor__field" },
              e(
                "div",
                { className: "fit-advisor__field-header" },
                e("label", { htmlFor: "fit-weight-slider" }, "Weight"),
                e(
                  "span",
                  { className: "fit-advisor__value" },
                  `${weight} ${unitSystem === "metric" ? "kg" : "lbs"}`
                )
              ),
              e("input", {
                type: "range",
                id: "fit-weight-slider",
                min: unitSystem === "metric" ? 40 : 88,
                max: unitSystem === "metric" ? 140 : 308,
                value: weight,
                onChange: (ev) => setWeight(Number(ev.target.value)),
                className: "fit-advisor__slider",
              })
            )
          ),

          // Fit Preference Chips
          e(
            "div",
            { className: "fit-advisor__fit-section" },
            e("span", { className: "fit-advisor__label" }, "Preferred Silhouette"),
            e(
              "div",
              { className: "fit-advisor__chips" },
              ["slim", "regular", "relaxed"].map((f) =>
                e(
                  "button",
                  {
                    key: f,
                    type: "button",
                    className: `fit-advisor__chip ${fitPreference === f ? "is-selected" : ""}`,
                    onClick: () => setFitPreference(f),
                  },
                  f.charAt(0).toUpperCase() + f.slice(1)
                )
              )
            )
          ),

          // Recommendation Output Result
          recommendation &&
            e(
              "div",
              { className: "fit-advisor__result-box" },
              e(
                "div",
                { className: "fit-advisor__result-left" },
                e("span", { className: "fit-advisor__result-label" }, "Recommended Size"),
                e("div", { className: "fit-advisor__size-badge" }, recommendation.size),
                e("span", { className: "fit-advisor__confidence" }, `${recommendation.confidence}% Match`)
              ),
              e(
                "div",
                { className: "fit-advisor__result-right" },
                e("p", { className: "fit-advisor__rationale" }, recommendation.rationale),
                e(
                  "button",
                  {
                    type: "button",
                    className: "btn btn--primary btn--sm fit-advisor__apply-btn",
                    onClick: () => handleApplySize(recommendation.size),
                  },
                  appliedSize === recommendation.size
                    ? "✓ Size Applied"
                    : `Select Size ${recommendation.size}`
                )
              )
            )
        )
    );
  }

  // Mount into the page when DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    const mountPoint = document.getElementById("react-feature");
    if (mountPoint && window.React && window.ReactDOM) {
      const root = ReactDOM.createRoot(mountPoint);
      root.render(e(FitAdvisor));
    }
  });
})();
