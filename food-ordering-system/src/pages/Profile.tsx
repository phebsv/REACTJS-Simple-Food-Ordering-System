import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Profile.css";

export default function Profile() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate("/login");
      return;
    }
    
    const userData = JSON.parse(user);
    setCurrentUser(userData);
    setName(userData.name || "");
    setEmail(userData.email || "");
    setPhone(userData.phone || "");
    setAddress(userData.address || "");
  }, [navigate]);

  const handleSaveChanges = async () => {
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }
    if (!address.trim()) {
      setError("Address is required");
      return;
    }

    setLoading(true);
    try {
      const updatedUser = {
        ...currentUser,
        name,
        phone,
        address
      };

      const res = await fetch(`http://localhost:4001/users/${currentUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser)
      });

      if (!res.ok) throw new Error("Failed to update profile");

      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("adminUser");
    navigate("/login");
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar title="PROFILE" showNavLinks={true} />
      <div className="profile-container">
        <div className="profile-content">
          <h1 className="profile-title">My Profile</h1>

          <div className="profile-card">
            <div className="profile-section">
              <h2>Account Information</h2>

              <div className="profile-form-group">
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                ) : (
                  <div className="profile-value">{name}</div>
                )}
              </div>

              <div className="profile-form-group">
                <label>Email</label>
                <div className="profile-value">{email}</div>
                <p className="profile-hint">Email cannot be changed</p>
              </div>

              <div className="profile-form-group">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                  />
                ) : (
                  <div className="profile-value">{phone}</div>
                )}
              </div>

              <div className="profile-form-group">
                <label>Delivery Address</label>
                {isEditing ? (
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                    rows={3}
                  />
                ) : (
                  <div className="profile-value">{address}</div>
                )}
              </div>

              {error && <div className="profile-error">{error}</div>}

              <div className="profile-actions">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="profile-btn profile-btn-edit"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        setName(currentUser.name || "");
                        setPhone(currentUser.phone || "");
                        setAddress(currentUser.address || "");
                        setError("");
                      }}
                      disabled={loading}
                      className="profile-btn profile-btn-cancel"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveChanges}
                      disabled={loading}
                      className="profile-btn profile-btn-save"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="profile-divider"></div>

            <div className="profile-section">
              <h2>Account Actions</h2>
              
              {!showLogoutConfirm ? (
                <button 
                  onClick={() => setShowLogoutConfirm(true)}
                  className="profile-btn profile-btn-logout"
                >
                  Logout
                </button>
              ) : (
                <div className="logout-confirm">
                  <p>Are you sure you want to logout?</p>
                  <div className="confirm-buttons">
                    <button 
                      onClick={() => setShowLogoutConfirm(false)}
                      className="confirm-btn confirm-btn-cancel"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="confirm-btn confirm-btn-logout"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
