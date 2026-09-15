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
const PORT = 5000;

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

// --- Step 3: The 5 CRUD routes ---

// (R)EAD — get the full list of products
// Try it in your browser: http://localhost:5000/products

// --- Step 4: Start the server ---
app.listen(PORT, () => {
  console.log(`Server is running! Open http://localhost:${PORT}/products in your browser.`);
});
