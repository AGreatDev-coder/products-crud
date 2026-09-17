// ============================================================
// server.js
// This is the WHOLE backend. It's one file on purpose, so you
// can read it from top to bottom without jumping around.
//
// What this file does:
//   1. Sets up an Express server (a small web server).
//   2. Keeps our "database" as a plain JavaScript array.
//      (No real database — when you restart the server,
//       any changes you made are gone and it resets to the
//       list below.)
//   3. Defines 5 routes (URLs the frontend can talk to) that
//      let us Create, Read, Update, and Delete products.
//      That's where the word "CRUD" comes from.
// ============================================================

// --- Step 1: Import the tools we need ---
const express = require("express"); // the web server framework
const cors = require("cors");       // lets the React app (different port) talk to us

const app = express();
const PORT = process.env.PORT || 5000;

// This lets our server understand JSON sent from the frontend
app.use(express.json());

// This lets the React app (running on a different port) send requests here
app.use(cors());

// --- Step 2: Our "database" ---
// This is just an array of objects living in memory.
// Every product has: id, name, category, price, stock, color, rating
let products = [
  { id: 1, name: "Enamel Camp Mug", category: "Kitchen", price: 18, stock: 42, color: "#2B6E68", rating: 4 },
  { id: 2, name: "Waxed Canvas Tool Roll", category: "Workshop", price: 64, stock: 15, color: "#8A5A34", rating: 5 },
  { id: 3, name: "Brass Pocket Compass", category: "Outdoors", price: 32, stock: 27, color: "#B8860B", rating: 4 },
  { id: 4, name: "Cast Iron Skillet", category: "Kitchen", price: 45, stock: 33, color: "#3A3A3A", rating: 5 },
  { id: 5, name: "Wool Felt Coasters", category: "Home", price: 22, stock: 61, color: "#7A4B8A", rating: 3 }
];

// We use this number to give every NEW product a unique id.
// Every time we add a product, we increase it by 1.
let nextId = 6;

// Health check / welcome route
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Shelf Simple Backend API is running!",
    endpoints: {
      getAllProducts: "GET /products",
      getProductById: "GET /products/:id",
      createProduct: "POST /products",
      updateProduct: "PUT /products/:id",
      deleteProduct: "DELETE /products/:id"
    }
  });
});

// --- Step 3: The 5 CRUD routes ---

// (R)EAD — get the full list of products
// Try it in your browser: http://localhost:5000/products
app.get("/products", (req, res) => {
  res.json(products);
});

// (R)EAD — get a single product by ID
app.get("/products/:id", (req, res) => {
  const { id } = req.params;
  const product = products.find((p) => p.id === Number(id));
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

// (C)REATE — add a new product
app.post("/products", (req, res) => {
  const { name, category, price, stock, color, rating } = req.body;
  if (!name || price === undefined || price === "") {
    return res.status(400).json({ error: "Product name and price are required." });
  }

  const newProduct = {
    id: nextId++,
    name: String(name).trim(),
    category: category || "Other",
    price: Number(price) || 0,
    stock: Number(stock) || 0,
    color: color || "#2B6E68",
    rating: Math.max(1, Math.min(5, Number(rating) || 3))
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// (U)PDATE — edit an existing product
app.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const productId = Number(id);
  const index = products.findIndex((p) => p.id === productId);

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const existing = products[index];
  const updatedProduct = {
    ...existing,
    ...req.body,
    id: productId, // keep id intact
    price: req.body.price !== undefined && req.body.price !== "" ? Number(req.body.price) : existing.price,
    stock: req.body.stock !== undefined && req.body.stock !== "" ? Number(req.body.stock) : existing.stock,
    rating: req.body.rating !== undefined ? Math.max(1, Math.min(5, Number(req.body.rating) || existing.rating)) : existing.rating
  };

  products[index] = updatedProduct;
  res.json(updatedProduct);
});

// (D)ELETE — remove a product
app.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  const productId = Number(id);
  const index = products.findIndex((p) => p.id === productId);

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  products = products.filter((p) => p.id !== productId);
  res.json({ message: "Product deleted", id: productId });
});

// --- Step 4: Start the server ---
app.listen(PORT, () => {
  console.log(`Server is running! Open http://localhost:${PORT}/products in your browser.`);
});