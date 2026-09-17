import { useState, useEffect } from "react";

// The categories a product can belong to.
// We reuse this list in the dropdown menus below.
const CATEGORIES = ["Kitchen", "Workshop", "Outdoors", "Home", "Other"];

// A few color choices the user can pick from for a product's "swatch".
const COLORS = ["#2B6E68", "#8A5A34", "#B8860B", "#3A3A3A", "#7A4B8A", "#B5533C"];

// Backend API URL: connects to Render in production or local Express backend on port 5000
const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = rawBaseUrl.replace(/\/+$/, "").replace(/\/products$/, "");
const API_URL = `${API_BASE}/products`;

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

  // Connection & status states
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(null);
  const [actionError, setActionError] = useState(null);

  // ---- LOAD PRODUCTS WHEN THE PAGE FIRST OPENS ----
  useEffect(() => {
    loadProducts();
  }, []); // the empty [] means "run this only once, when the page loads"

  function loadProducts() {
    setLoading(true);
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          setBackendError(null);
        } else {
          setProducts([]);
        }
      })
      .catch((error) => {
        console.error("Could not load products:", error);
        setBackendError(
          `Could not connect to backend at ${API_URL}. Please make sure the backend server is running.`
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // ---- ADD A NEW PRODUCT ----
  function handleAddSubmit(event) {
    event.preventDefault(); // stops the page from refreshing
    setActionError(null);

    if (!newProduct.name || newProduct.price === "") {
      alert("Please fill in at least a name and a price.");
      return;
    }

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock) || 0,
        rating: Number(newProduct.rating) || 3
      })
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(() => {
        setNewProduct(BLANK_PRODUCT); // clear the form
        loadProducts();               // refresh the list
      })
      .catch((error) => {
        console.error("Could not add product:", error);
        setActionError("Failed to add product. Make sure the backend server is running.");
      });
  }

  // ---- START EDITING A PRODUCT ----
  function startEditing(product) {
    setEditingId(product.id);
    setEditForm({
      ...product,
      price: product.price ?? "",
      stock: product.stock ?? "",
      rating: product.rating ?? 3
    });
  }

  function cancelEditing() {
    setEditingId(null);
  }

  // ---- SAVE CHANGES TO A PRODUCT ----
  function handleEditSubmit(event, id) {
    event.preventDefault();
    setActionError(null);

    fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        price: Number(editForm.price),
        stock: Number(editForm.stock) || 0,
        rating: Number(editForm.rating) || 3
      })
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(() => {
        setEditingId(null); // close the edit form
        loadProducts();     // refresh the list
      })
      .catch((error) => {
        console.error("Could not update product:", error);
        setActionError("Failed to update product. Make sure the backend server is running.");
      });
  }

  // ---- DELETE A PRODUCT ----
  function handleDelete(id) {
    const sure = window.confirm("Remove this product?");
    if (!sure) return;
    setActionError(null);

    fetch(`${API_URL}/${id}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(() => loadProducts())
      .catch((error) => {
        console.error("Could not delete product:", error);
        setActionError("Failed to delete product. Make sure the backend server is running.");
      });
  }

  // ---- WHAT GETS SHOWN ON THE PAGE ----
  return (
    <div className="page">
      <header className="header">
        <h1>Product Shelf</h1>
        <p>{products.length} products on the shelf</p>
      </header>

      {/* Backend connection alert */}
      {backendError && (
        <div className="status-banner error-banner">
          <strong>Backend Connection Error:</strong> {backendError}
          <div style={{ marginTop: "8px" }}>
            To run the backend, open a terminal and run: <code>cd backend && npm start</code>
            <button
              onClick={loadProducts}
              className="btn"
              style={{ marginLeft: "12px", padding: "4px 10px" }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Action error alert */}
      {actionError && (
        <div className="status-banner error-banner">
          {actionError}
        </div>
      )}

      {/* Loading state indicator */}
      {loading && products.length === 0 && !backendError && (
        <div className="status-banner info-banner">
          Loading products from backend...
        </div>
      )}

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
              step="any"
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
        {products.map((product) => {
          const ratingVal = Math.max(1, Math.min(5, Math.round(Number(product.rating)) || 1));
          return (
            <div key={product.id} className="product-card">
              {editingId === product.id ? (
                // ----- EDIT MODE for this product -----
                <form onSubmit={(e) => handleEditSubmit(e, product.id)} className="edit-form">
                  <label style={{ fontSize: "0.8rem", color: "#6f6353" }}>Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />

                  <label style={{ fontSize: "0.8rem", color: "#6f6353" }}>Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <label style={{ fontSize: "0.8rem", color: "#6f6353" }}>Price ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  />

                  <label style={{ fontSize: "0.8rem", color: "#6f6353" }}>Stock</label>
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                  />

                  <label style={{ fontSize: "0.8rem", color: "#6f6353" }}>Rating</label>
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
                    <p className="rating-line">{"★".repeat(ratingVal)}{"☆".repeat(5 - ratingVal)}</p>

                    <div className="card-actions">
                      <button className="btn" onClick={() => startEditing(product)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(product.id)}>Delete</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}