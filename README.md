# Thread & Co.

Thread & Co. is a modern e-commerce clothing website built as a university project.

The project combines a responsive frontend storefront with an Express.js backend, PostgreSQL database, JWT-based authentication, and a small React feature.

---

## Project Overview

Thread & Co. is designed as an editorial-style online clothing store.

Users can:

- Browse clothing products
- Search and filter products
- View detailed product information
- Add products to cart
- Manage wishlist items
- Proceed through checkout
- Create an account and log in
- View their account
- Use the AI Stylist interface for outfit guidance

The frontend is primarily built with HTML, CSS, and JavaScript, while the backend provides product and authentication APIs.

---

## Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript
- React 18 (used for a small isolated UI component)

### Backend

- Node.js
- Express.js
- PostgreSQL
- JWT
- bcrypt
- CORS
- Express Rate Limit

### Development

- Git
- GitHub
- VS Code
- Nodemon

---

## Project Structure

```text
ecommerce-clothing/
│
├── index.html
├── products.html
├── product-details.html
├── cart.html
├── wishlist.html
├── checkout.html
├── login.html
├── account.html
└── help.html
│
├── css/
│   ├── variables.css
│   ├── base.css
│   ├── components.css
│   ├── navbar.css
│   ├── home.css
│   ├── products.css
│   ├── product-details.css
│   ├── cart.css
│   ├── checkout.css
│   ├── wishlist.css
│   ├── login.css
│   ├── account.css
│   ├── help.css
│   ├── footer.css
│   ├── loading.css
│   └── ai-stylist.css
│
├── js/
│   ├── data/
│   │   └── products.js
│   │
│   ├── shared/
│   │   ├── footer.js
│   │   ├── navbar-badges.js
│   │   └── product-card.js
│   │
│   ├── store/
│   │   └── cart-store.js
│   │
│   ├── main.js
│   ├── home.js
│   ├── products.js
│   ├── product-details.js
│   ├── cart.js
│   ├── checkout.js
│   ├── wishlist.js
│   ├── login.js
│   ├── account.js
│   ├── loading.js
│   └── ai-stylist.js
│
├── assets/
│   └── images/
│
├── IMG/
│
└── server/
    ├── src/
    │   ├── index.js
    │   ├── db/
    │   │   ├── pool.js
    │   │   ├── schema.sql
    │   │   └── products.seed.json
    │   │
    │   ├── middleware/
    │   │   └── auth.js
    │   │
    │   └── routes/
    │       ├── auth.js
    │       └── products.js
    │
    ├── scripts/
    │   ├── setup-db.js
    │   ├── seed.js
    │   └── extract-products.js
    │
    ├── .env.example
    ├── package.json
    └── README.md