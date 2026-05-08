import C from "../../constants/colors";
import type { AdminHeaderProps } from "../../interfaces";
import "./AdminHeader.css";

function AdminHeader({
  title,
  subtitle,
  adminProfile,
  searchTerm,
  searchPlaceholder = "Search...",
  onSearchChange,
  actions,
}: AdminHeaderProps) {
  const shouldShowSearch = typeof searchTerm === "string" && onSearchChange;
  const profile = adminProfile ?? {
    name: "Admin",
    role: "Administrator",
  };

  return (
    <header
      className="admin-page-header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "18px",
        gap: "20px",
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "900",
            color: C.text,
          }}
        >
          {title}
        </h1>

        <p
          style={{
            margin: "4px 0 0",
            fontSize: "12px",
            color: C.text,
          }}
        >
          {subtitle}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {actions}

        {shouldShowSearch && (
          <div className="admin-header-search">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(event) => onSearchChange?.(event.target.value)}
              className="admin-search-input"
            />
            <button
              type="button"
              className="admin-search-button"
              aria-label="Search"
            />
          </div>
        )}

        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "11px",
              fontWeight: "900",
              color: C.text,
            }}
          >
            {profile.name}
          </h3>

          <p
            style={{
              margin: "3px 0 0",
              fontSize: "9px",
              fontWeight: "700",
              color: C.text,
            }}
          >
            {profile.role}
          </p>
        </div>

        <div
          style={{
            width: "38px",
            height: "34px",
            borderRadius: "9px",
            backgroundColor: C.red,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.white,
            fontSize: "18px",
            fontWeight: "900",
          }}
        >
          A
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
