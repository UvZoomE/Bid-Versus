import React from "react";
import { Shield, User, Briefcase, Bell, Trash2, Scale } from "lucide-react";
import "../css/NavBar.css";

export default function Navbar({
  currentUser,
  viewMode,
  setViewMode,
  setCurrentScreen,
  resetBidForms,
  showNotifications,
  setShowNotifications,
  unreadCount,
  notifications,
  setNotifications,
  activeNotifications,
  jobs,
  setSelectedJob,
  handleLogout,
  triggerDeleteAccount,
}) {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Brand Logo - Top Left */}
        <div
          className="navbar-brand"
          onClick={() => {
            setCurrentScreen("dashboard");
            resetBidForms();
          }}
        >
          <Scale style={{ width: "2rem", height: "2rem", color: "#2563eb" }} />
          <span>Bid Versus</span>
        </div>

        {/* Universal Role Toggle - Wraps to bottom row on mobile, center on desktop */}
        <div className="role-toggle">
          <button
            onClick={() => {
              setViewMode("customer");
              setCurrentScreen("dashboard");
              resetBidForms();
            }}
            className={`role-btn ${viewMode === "customer" ? "active" : ""}`}
          >
            <User className="w-4 h-4" /> Customer
          </button>
          <button
            onClick={() => {
              setViewMode("provider");
              setCurrentScreen("dashboard");
              resetBidForms();
            }}
            className={`role-btn ${viewMode === "provider" ? "active" : ""}`}
          >
            <Briefcase className="w-4 h-4" /> Provider
          </button>
        </div>

        {/* Right Actions - Top Right */}
        <div className="navbar-right">
          {/* Notifications Bell */}
          {currentUser && (
            <div className="notif-container">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="notif-btn"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && viewMode === "provider" && (
                  <span className="notif-badge">{unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span>Notifications</span>
                    {unreadCount > 0 && viewMode === "provider" && (
                      <button
                        onClick={() =>
                          setNotifications(
                            notifications.map((n) => ({ ...n, read: true })),
                          )
                        }
                        className="notif-mark-read"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="notif-list">
                    {viewMode !== "provider" ? (
                      <div className="notif-empty">
                        Switch to Provider view to see bid alerts.
                      </div>
                    ) : activeNotifications.length === 0 ? (
                      <div className="notif-empty">No notifications yet.</div>
                    ) : (
                      activeNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            setNotifications(
                              notifications.map((n) =>
                                n.id === notif.id ? { ...n, read: true } : n,
                              ),
                            );

                            const job = jobs.find(
                              (j) => (j._id || j.id) === notif.jobId,
                            );

                            if (job) {
                              setSelectedJob(job);
                              setCurrentScreen("job_details");
                              resetBidForms();
                            }
                            setShowNotifications(false);
                          }}
                          className={`notif-item ${!notif.read ? "unread" : ""}`}
                        >
                          <p className="notif-message">{notif.message}</p>
                          <span className="notif-date">{notif.date}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Menu / Login Button */}
          {currentUser ? (
            <div className="user-menu">
              <span className="user-name">Hi, {currentUser.name}</span>
              <button
                onClick={triggerDeleteAccount}
                className="icon-btn"
                title="Delete Account"
                style={{
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={handleLogout} className="logout-link">
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentScreen("auth")}
              className="btn-primary"
              style={{ padding: "0.375rem 1rem", fontSize: "0.875rem" }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
