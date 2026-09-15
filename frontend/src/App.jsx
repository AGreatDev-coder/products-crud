import { useState, useEffect } from "react";

// The categories a product can belong to.
// We reuse this list in the dropdown menus below.
const CATEGORIES = ["Kitchen", "Workshop", "Outdoors", "Home", "Other"];

// A few color choices the user can pick from for a product's "swatch".
const COLORS = ["#2B6E68", "#8A5A34", "#B8860B", "#3A3A3A", "#7A4B8A", "#B5533C"];

// This is the shape of an "empty" form — what the Add form starts as.
const BLANK_PRODUCT = {
  name: "",
  category: "Kitchen",
  price: "",
  stock: "",
  color: COLORS[0],
  rating: 3
};

export default function App() {
  // ---- STATE ----
  // "products" holds the list we get back from the backend.
  const [products, setProducts] = useState([]);

  // "newProduct" holds whatever the user is currently typing
  // into the "Add a product" form at the top of the page.
  const [newProduct, setNewProduct] = useState(BLANK_PRODUCT);

  // "editingId" tells us WHICH product (by id) is currently being
  // edited. If it's null, nothing is being edited.
  const [editingId, setEditingId] = useState(null);

  // "editForm" holds the values while a product is being edited.
  const [editForm, setEditForm] = useState(BLANK_PRODUCT);

  // ---- LOAD PRODUCTS WHEN THE PAGE FIRST OPENS ----
  useEffect(() => {
    loadProducts();
  }, []); // the empty [] means "run this only once, when the page loads"

  function loadProducts() {
    fetch("https://products-crud-d6c1.onrender.com/products")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Could not load products:", error));
  }

  // ---- ADD A NEW PRODUCT ----
  function handleAddSubmit(event) {
    event.preventDefault(); // stops the page from refreshing

    if (!newProduct.name || !newProduct.price) {
      alert("Please fill in at least a name and a price.");
      return;
    }

    fetch("https://products-crud-d6c1.onrender.com/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct)
    })
      .then((response) => response.json())
      .then(() => {
        setNewProduct(BLANK_PRODUCT); // clear the form
        loadProducts();               // refresh the list
      })
      .catch((error) => console.error("Could not add product:", error));
  }

  // ---- START EDITING A PRODUCT ----
  function startEditing(product) {
    setEditingId(product.id);
    setEditForm(product); // fill the edit form with this product's current values
  }

  function cancelEditing() {
    setEditingId(null);
  }

  // ---- SAVE CHANGES TO A PRODUCT ----
  function handleEditSubmit(event, id) {
    event.preventDefault();

    fetch(`https://products-crud-d6c1.onrender.com/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm)
    })
      .then((response) => response.json())
      .then(() => {
        setEditingId(null); // close the edit form
        loadProducts();     // refresh the list
      })
      .catch((error) => console.error("Could not update product:", error));
  }

  // ---- DELETE A PRODUCT ----
  function handleDelete(id) {
    const sure = window.confirm("Remove this product?");
    if (!sure) return;

    fetch(`https://products-crud-d6c1.onrender.com/products/${id}`, { method: "DELETE" })
      .then(() => loadProducts())
      .catch((error) => console.error("Could not delete product:", error));
  }

  // ---- WHAT GETS SHOWN ON THE PAGE ----
  return (
    <div className="page">
      <header className="header">
        <h1>Product Shelf</h1>
        <p>{products.length} products on the shelf</p>
      </header>

      {/* ---------- ADD PRODUCT FORM ---------- */}
      <form className="add-form" onSubmit={handleAddSubmit}>
        <h2>Add a product</h2>

        <div className="form-grid">
          <label>
            Name
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="e.g. Wool Blanket"
            />
          </label>

          <label>
            Category
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label>
            Price ($)
            <input
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              placeholder="0"
            />
          </label>

          <label>
            Stock
            <input
              type="number"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              placeholder="0"
            />
          </label>

          <label>
            Rating (1–5)
            <select
              value={newProduct.rating}
              onChange={(e) => setNewProduct({ ...newProduct, rating: e.target.value })}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>

          <label>
            Color
            <div className="color-picker">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={c === newProduct.color ? "swatch swatch-selected" : "swatch"}
                  style={{ backgroundColor: c }}
                  onClick={() => setNewProduct({ ...newProduct, color: c })}
                />
              ))}
            </div>
          </label>
        </div>

        <button type="submit" className="btn btn-primary">Add product</button>
      </form>

      {/* ---------- PRODUCT LIST ---------- */}
      <div className="product-list">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            {editingId === product.id ? (
              // ----- EDIT MODE for this product -----
              <form onSubmit={(e) => handleEditSubmit(e, product.id)} className="edit-form">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                />
                <input
                  type="number"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                />
                <select
                  value={editForm.rating}
                  onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>

                <div className="edit-actions">
                  <button type="submit" className="btn btn-primary">Save</button>
                  <button type="button" className="btn" onClick={cancelEditing}>Cancel</button>
                </div>
              </form>
            ) : (
              // ----- NORMAL DISPLAY MODE for this product -----
              <>
                <div className="swatch-block" style={{ backgroundColor: product.color }}>
                  <span className="badge">{product.category}</span>
                  <span className="price">${product.price}</span>
                </div>

                <div className="card-body">
                  <h3>{product.name}</h3>
                  <p className="stock-line">{product.stock} in stock</p>
                  <p className="rating-line">{"★".repeat(product.rating)}{"☆".repeat(5 - product.rating)}</p>

                  <div className="card-actions">
                    <button className="btn" onClick={() => startEditing(product)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(product.id)}>Delete</button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}