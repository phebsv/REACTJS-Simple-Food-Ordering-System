import "./Dashboard.css";

export default function Dashboard() {
  return (
    <main className="dashboard-container">
      <section className="dashboard-card">
        <p className="dashboard-eyebrow">Hot spicy</p>
        <h1 className="dashboard-title">Chicken burger</h1>
        <p className="dashboard-offer">Limited offer / $5</p>
        <p className="dashboard-copy">
          Welcome to NomNom. Explore the menu, review your orders, and keep the
          kitchen moving.
        </p>

        <div className="dashboard-actions">
          <button className="dashboard-primary-btn" type="button">
            Open Menu
          </button>
          <button className="dashboard-secondary-btn" type="button">
            View Orders
          </button>
        </div>
      </section>
    </main>
  );
}
