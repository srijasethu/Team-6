import { useState, useRef, useEffect, useMemo } from "react";
const MONTHLY_PAID_LIMIT = 3;
const ANNUAL_PAID_ALLOCATION = 36;
import {
  FaUser,
  FaUsers,
  FaEnvelope,
  FaPhoneAlt,
  FaCalendarAlt,
  FaBuilding,
  FaSuitcase,
  FaMapMarkerAlt,
  FaPencilAlt,
  FaSignOutAlt,
  FaRegUser,
  FaRegCalendarAlt,
  FaRegChartBar,
  FaFileAlt,
  FaCheck,
  FaExclamationTriangle,
  FaRegClock,
  FaCheckCircle,
  FaRegCheckCircle,
  FaThumbsDown,
  FaRegTimesCircle,
  FaInfoCircle,
  FaTimes,
  FaSearch,
  FaCoins,
  FaChartPie,
  FaFolder,
  FaHistory,
  FaChevronDown,
  FaPlus,
  FaArrowLeft,
  FaArrowRight,
  FaFilePdf,
  FaBell,
  FaBellSlash,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { jsPDF } from "jspdf";
import arunKumarAvatar from "../assets/arun_kumar.png";
import defaultManagerAvatar from "../assets/default_manager_avatar.png";
import aaravPatelAvatar from "../assets/aarav_patel.png";
import sarahRamanAvatar from "../assets/sarah_raman.png";
import rinaSharmaAvatar from "../assets/rina_sharma.png";
import sarahPamestAvatar from "../assets/sarah_pamest.png";
import "../styles/ManagerDashboard.css";
const API_BASE_URL = import.meta.env.VITE_API_URL;

const formatDate = (dateString) => {
  if (!dateString) return "Not Available";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatDateNicely = (dateStr) => {
  if (!dateStr) return "N/A";
  let dateObj;
  if (typeof dateStr === "string" && dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
      }
    }
  }
  if (!dateObj || isNaN(dateObj.getTime())) dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

function EmployeeLeaveHistoryList({ empId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReason, setSelectedReason] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/manager/reports/employee/${empId}`,
        );
        const data = await res.json();
        if (data.success) {
          setHistory(data.history || []);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [empId]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#f25c05", fontWeight: "600" }}>
        Loading history...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        No recent leave requests found.
      </div>
    );
  }

  return (
    <>
      <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
        <table className="report-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-color, #cbd5e1)" }}>
              <th style={{ textAlign: "left", padding: "12px 8px", fontWeight: "600" }}>Leave Type</th>
              <th style={{ textAlign: "left", padding: "12px 8px", fontWeight: "600" }}>From Date</th>
              <th style={{ textAlign: "left", padding: "12px 8px", fontWeight: "600" }}>To Date</th>
              <th style={{ textAlign: "center", padding: "12px 8px", fontWeight: "600" }}>Total Days</th>
              <th style={{ textAlign: "center", padding: "12px 8px", fontWeight: "600" }}>Breakdown</th>
              <th style={{ textAlign: "left", padding: "12px 8px", fontWeight: "600" }}>Reason</th>
              <th style={{ textAlign: "center", padding: "12px 8px", fontWeight: "600" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((hist, idx) => {
              const totalDays = hist.total_days ?? hist.leave_days ?? 0;
              const paidDays = hist.paid_days ?? 0;
              const unpaidDays = hist.unpaid_days ?? 0;
              const reasonText = hist.reason || "—";
              const isLong = reasonText.length > 60;
              const displayedReason = isLong ? `${reasonText.slice(0, 60)}...` : reasonText;

              return (
                <tr key={hist.id || idx} style={{ borderBottom: "1px solid var(--border-color, #e2e8f0)" }}>
                  <td style={{ padding: "12px 8px", fontWeight: "600", color: "var(--text-main, #334155)" }}>
                    {hist.leave_type}
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    {formatDateNicely(hist.start_date)}
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    {formatDateNicely(hist.end_date)}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: "700" }}>
                    {totalDays} Days
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#15803d",
                          background: "#f0fdf4",
                          border: "1px solid #86efac",
                          borderRadius: "999px",
                          padding: "2px 8px"
                        }}
                      >
                        {paidDays} Paid
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#b91c1c",
                          background: "#fef2f2",
                          border: "1px solid #fca5a5",
                          borderRadius: "999px",
                          padding: "2px 8px"
                        }}
                      >
                        {unpaidDays} Unpaid
                      </span>
                    </div>
                  </td>
                  <td style={{ 
                    padding: "12px 8px", 
                    maxWidth: "280px", 
                    wordBreak: "break-word", 
                    whiteSpace: "normal" 
                  }}>
                    <span>{displayedReason}</span>
                    {isLong && (
                      <button
                        type="button"
                        onClick={() => setSelectedReason(reasonText)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#f25c05",
                          cursor: "pointer",
                          fontWeight: "700",
                          fontSize: "12px",
                          padding: "0",
                          marginLeft: "6px",
                          textDecoration: "underline",
                          display: "inline-block",
                          fontFamily: "inherit"
                        }}
                      >
                        View More
                      </button>
                    )}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center" }}>
                    <span className={`status-badge-pill ${(hist.status || "").toLowerCase()}`}>
                      {hist.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedReason && (
        <div className="modal-overlay" onClick={() => setSelectedReason(null)}>
          <div 
            className="modal-card" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: "500px", 
              width: "90%", 
              padding: "28px", 
              borderRadius: "16px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
              border: "1px solid var(--border-color, #e2e8f0)",
              background: "var(--bg-card, #ffffff)"
            }}
          >
            <h3 
              className="modal-title" 
              style={{ 
                margin: "0 0 16px", 
                fontSize: "18px", 
                fontWeight: "800", 
                color: "var(--text-main, #0f172a)" 
              }}
            >
              Leave Reason
            </h3>
            <div 
              className="modal-desc" 
              style={{ 
                fontSize: "14px", 
                lineHeight: "1.6", 
                wordBreak: "break-word", 
                whiteSpace: "pre-wrap", 
                color: "var(--text-main, #334155)",
                maxHeight: "300px",
                overflowY: "auto",
                marginBottom: "24px",
                textAlign: "left"
              }}
            >
              {selectedReason}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button 
                type="button" 
                className="modal-cancel-btn" 
                onClick={() => setSelectedReason(null)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "1.5px solid var(--border-color, #cbd5e1)",
                  background: "var(--bg-card, #ffffff)",
                  color: "var(--text-main, #334155)",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "inherit"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function HistoryLoader({ empId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/manager/reports/employee/${empId}`,
        );
        const data = await res.json();
        if (data.success) {
          setHistory(data.history || []);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [empId]);

  if (loading)
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "#f25c05",
          fontWeight: "600",
        }}
      >
        Loading history...
      </div>
    );
  if (history.length === 0)
    return (
      <p
        className="empty-history-text"
        style={{ padding: "20px", textAlign: "center", color: "#64748b" }}
      >
        No recent leave requests found.
      </p>
    );

  return (
    <div className="modal-history-list">
      {history.map((hist, idx) => (
        <div
          key={hist.id || idx}
          className="history-list-item"
          style={{
            padding: "12px",
            borderBottom: "1px solid #e2e8f0",
            marginBottom: "8px",
          }}
        >
          <div
            className="item-meta"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              className="history-item-dates"
              style={{ fontWeight: "600", fontSize: "13px" }}
            >
              {formatDateNicely(hist.start_date)} —{" "}
              {formatDateNicely(hist.end_date)}
            </span>
            <span
              className="history-item-type"
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "12px",
                backgroundColor: "#f1f5f9",
                color: "#475569",
                fontWeight: "600",
              }}
            >
              {hist.leave_type}
            </span>
          </div>
          <div
            className="item-status-reason"
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
            <span
              className={`status-badge-pill ${(hist.status || "").toLowerCase()}`}
            >
              {hist.status}
            </span>
            <p
              className="history-item-reason"
              style={{ margin: 0, fontSize: "12px", color: "#475569" }}
            >
              {hist.reason}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardGreetingCard({ name, leaveRequests, holidaysList }) {
  const getGreetingText = () => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) {
      return { text: "Good Morning", emoji: "🌅" };
    } else if (hr >= 12 && hr < 17) {
      return { text: "Good Afternoon", emoji: "☀️" };
    } else if (hr >= 17 && hr < 21) {
      return { text: "Good Evening", emoji: "🌇" };
    } else {
      return { text: "Good Night", emoji: "🌙" };
    }
  };

  const greeting = getGreetingText();
  const todayStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Calculate statistics dynamically
  const pendingCount = leaveRequests.filter(
    (r) => r.status === "Pending",
  ).length;

  const todayStrISO = new Date().toISOString().substring(0, 10);
  const onLeaveCount = leaveRequests.filter((r) => {
    if (r.status !== "Approved") return false;
    const parts = r.dates ? r.dates.split(" - ") : [];
    if (parts.length !== 2) return false;
    const startStr = parts[0].trim().substring(0, 10);
    const endStr = parts[1].trim().substring(0, 10);
    return startStr <= todayStrISO && todayStrISO <= endStr;
  }).length;

  const todayDateObj = new Date();
  const currentMonth = todayDateObj.getMonth();
  const currentYear = todayDateObj.getFullYear();
  const hasHolidayThisMonth = holidaysList.some((h) => {
    if (!h.holiday_date) return false;
    const hDate = new Date(h.holiday_date);
    return (
      hDate.getMonth() === currentMonth && hDate.getFullYear() === currentYear
    );
  });

  let subtext = "Everything looks up to date today.";
  if (pendingCount > 0) {
    subtext = `You have ${pendingCount} pending leave request${pendingCount > 1 ? "s" : ""} today.`;
  } else if (onLeaveCount > 0) {
    subtext = `${onLeaveCount} employee${onLeaveCount > 1 ? "s are" : " is"} currently on leave.`;
  } else if (hasHolidayThisMonth) {
    subtext = "Company holiday scheduled this month.";
  }

  const motivationalMessage = useMemo(() => {
    const messages = [
      "Hope you have a productive day ahead!",
      "Every great achievement begins with a well-planned day.",
      "Stay organized, stay productive.",
      "Let's make today count!",
      "Plan your leaves wisely and stay balanced.",
      "Consistency turns small efforts into big results.",
      "A well-managed day leads to a well-managed team.",
      "Stay focused and make progress today.",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  return (
    <div className="dashboard-greeting-card">
      <div className="greeting-text-section">
        <h1
          className="greeting-title"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <span>
            {greeting.emoji} {greeting.text}, {name}
          </span>
        </h1>
        <p className="greeting-subtext">{subtext}</p>
        <p className="greeting-motivation">"{motivationalMessage}"</p>
      </div>
      <div className="greeting-date-section">
        <FaRegClock />
        <span>Today • {todayStr}</span>
      </div>
    </div>
  );
}

function formatRelativeTimeManager(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 0) return "Just now";
  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

function NotificationBellManager({
  refreshCountTrigger,
  setRefreshCountTrigger,
}) {
  const [enabled, setEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Helper to safely get the user id of the currently logged in user
  const getLoggedInUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.id || null;
    } catch (e) {
      return null;
    }
  };

  const fetchSettingsAndCount = async () => {
    const activeUserId = getLoggedInUserId();
    if (!activeUserId) return;
    try {
      const sRes = await fetch(
        `${API_BASE_URL}/api/notifications/settings/${activeUserId}`,
      );
      const sData = await sRes.json();
      if (sData.success) setEnabled(sData.notifications_enabled);

      const cRes = await fetch(
        `${API_BASE_URL}/api/notifications/unread-count/${activeUserId}`,
      );
      const cData = await cRes.json();
      if (cData.success) setUnreadCount(cData.count);
    } catch (err) {
      console.error("Notif settings/count error:", err);
    }
  };

  const fetchNotificationsList = async () => {
    const activeUserId = getLoggedInUserId();
    if (!activeUserId) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/notifications/${activeUserId}`,
      );
      const data = await res.json();
      if (data.success) setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Notif list error:", err);
    }
  };

  useEffect(() => {
    fetchSettingsAndCount();
  }, [refreshCountTrigger]);

  useEffect(() => {
    if (dropdownOpen) {
      fetchNotificationsList();
      if (
        enabled &&
        "Notification" in window &&
        Notification.permission === "default"
      ) {
        Notification.requestPermission();
      }
    }
  }, [dropdownOpen, enabled]);

  useEffect(() => {
    fetchSettingsAndCount();
    if (enabled) fetchNotificationsList();
    const timer = setInterval(() => {
      fetchSettingsAndCount();
      if (enabled) fetchNotificationsList();
    }, 10000);
    return () => clearInterval(timer);
  }, [enabled]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleToggle = async () => {
    const activeUserId = getLoggedInUserId();
    if (!activeUserId) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/notifications/toggle/${activeUserId}`,
        { method: "PUT" },
      );
      const data = await res.json();
      if (data.success) {
        setEnabled(data.notifications_enabled);
        if (data.notifications_enabled && "Notification" in window)
          Notification.requestPermission();
        if (setRefreshCountTrigger) setRefreshCountTrigger((prev) => prev + 1);
        else fetchSettingsAndCount();
      }
    } catch (err) {
      console.error("Toggle notif error:", err);
    }
  };

  const handleMarkAllRead = async () => {
    const activeUserId = getLoggedInUserId();
    if (!activeUserId) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/notifications/read-all/${activeUserId}`,
        { method: "PUT" },
      );
      const data = await res.json();
      if (data.success) {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
        if (setRefreshCountTrigger) setRefreshCountTrigger((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/read/${id}`, {
        method: "PUT",
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        if (setRefreshCountTrigger) setRefreshCountTrigger((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Mark single read error:", err);
    }
  };

  const [prevUnreadList, setPrevUnreadList] = useState([]);
  useEffect(() => {
    if (enabled && notifications.length > 0) {
      const currentUnreads = notifications.filter((n) => !n.is_read);
      const newUnreads = currentUnreads.filter(
        (n) => !prevUnreadList.some((p) => p.id === n.id),
      );
      if (
        newUnreads.length > 0 &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        newUnreads.forEach(
          (n) =>
            new Notification(n.title, {
              body: n.message,
              icon: "/favicon.ico",
            }),
        );
      }
      setPrevUnreadList(currentUnreads);
    }
  }, [notifications, enabled]);

  useEffect(() => {
    if (dropdownOpen)
      setPrevUnreadList(notifications.filter((n) => !n.is_read));
  }, [notifications, dropdownOpen]);

  const getNotifIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheck />;
      case "warning":
        return <FaExclamationTriangle />;
      case "error":
        return <FaTimes />;
      default:
        return <FaInfoCircle />;
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        type="button"
        className={`notification-bell-btn ${!enabled ? "muted" : ""}`}
        onClick={() => setDropdownOpen((prev) => !prev)}
        title={enabled ? "View Notifications" : "Notifications Disabled"}
      >
        {enabled ? <FaBell /> : <FaBellSlash />}
        {enabled && unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {dropdownOpen && (
        <div className="notification-dropdown">
          <div className="notif-header">
            <h3>Notifications</h3>
            {enabled && unreadCount > 0 && (
              <button
                type="button"
                className="notif-mark-all-btn"
                onClick={handleMarkAllRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          {!enabled ? (
            <div className="notif-muted-message-box">
              <p>Notifications are turned off.</p>
              <button
                type="button"
                className="notif-enable-btn"
                onClick={handleToggle}
              >
                Enable Notifications
              </button>
            </div>
          ) : (
            <div className="notif-list">
              {notifications.length === 0 ? (
                <div className="notif-empty-state">
                  <span className="notif-empty-icon">🔔</span>
                  <span>No notifications yet.</span>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notif-card ${!notif.is_read ? "unread" : ""}`}
                    onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                  >
                    <div
                      className={`notif-icon-container ${notif.type || "info"}`}
                    >
                      {getNotifIcon(notif.type)}
                    </div>
                    <div className="notif-body">
                      <h4 className="notif-title">{notif.title}</h4>
                      <p className="notif-message">{notif.message}</p>
                      <span className="notif-time">
                        {formatRelativeTimeManager(notif.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ManagerDashboard({ onLogout }) {
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem("managerActiveView") || "profile";
  });

  useEffect(() => {
    localStorage.setItem("managerActiveView", activeView);
  }, [activeView]);

  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notifRefreshTrigger, setNotifRefreshTrigger] = useState(0);
  const [toast, setToast] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null);

  // ── Theme ────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("appTheme") === "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
    localStorage.setItem("appTheme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Holiday Calendar states
  const [holidaysList, setHolidaysList] = useState([]);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addHolidayForm, setAddHolidayForm] = useState({
    name: "",
    date: "",
    type: "Public Holiday",
    description: "",
  });
  const [addError, setAddError] = useState("");

  const todayDate = new Date();
  const [calYear, setCalYear] = useState(todayDate.getFullYear());
  const [calMonth, setCalMonth] = useState(todayDate.getMonth()); // 0-indexed
  const [holidaysLoading, setHolidaysLoading] = useState(false);

  const fetchHolidays = async () => {
    setHolidaysLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/holidays`);
      const data = await response.json();
      if (data.success) {
        setHolidaysList(data.holidays || []);
      }
    } catch (error) {
      console.error("Fetch holidays error:", error);
    } finally {
      setHolidaysLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // Employee Report states — all real backend data, no mock data
  const [reportSearchQuery, setReportSearchQuery] = useState("");
  const [reportLeaveTypeFilter, setReportLeaveTypeFilter] = useState("");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [selectedEmpReport, setSelectedEmpReport] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyEmpData, setHistoryEmpData] = useState(null);
  // Real backend report summary + employees table
  const [reportSummary, setReportSummary] = useState(null);
  const [reportEmployees, setReportEmployees] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSelectedMonth, setReportSelectedMonth] = useState("");
  // Real backend report data for the View Report modal
  const [reportEmpData, setReportEmpData] = useState(null);
  const [reportEmpDataLoading, setReportEmpDataLoading] = useState(false);

  const handleMonthChange = (e) => {
    const selectedMonth = e.target.value;
    setReportSelectedMonth(selectedMonth);

    if (!selectedMonth) {
      setReportStartDate("");
      setReportEndDate("");
      fetchReportData("", "");
      return;
    }

    const currentYear = new Date().getFullYear();
    const monthIndex = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ].indexOf(selectedMonth);

    const formatNum = (n) => String(n).padStart(2, "0");
    const startDateStr = `${currentYear}-${formatNum(monthIndex + 1)}-01`;

    const lastDay = new Date(currentYear, monthIndex + 1, 0).getDate();
    const endDateStr = `${currentYear}-${formatNum(monthIndex + 1)}-${formatNum(lastDay)}`;

    setReportStartDate(startDateStr);
    setReportEndDate(endDateStr);
    fetchReportData(startDateStr, endDateStr);
  };

  const fetchReportData = async (startDate = "", endDate = "") => {
    setReportLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const qs = params.toString() ? `?${params.toString()}` : "";
      const [summaryRes, empRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/manager/reports/summary${qs}`),
        fetch(`${API_BASE_URL}/api/manager/reports/employees${qs}`),
      ]);
      const summaryData = await summaryRes.json();
      const empData = await empRes.json();
      if (summaryData.success) setReportSummary(summaryData);
      if (empData.success) setReportEmployees(empData.employees || []);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setReportLoading(false);
    }
  };

  const handleViewReport = async (empDbId) => {
    setReportEmpData(null);
    setReportEmpDataLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/manager/reports/employee/${empDbId}`,
      );
      const data = await response.json();
      if (data.success) {
        setReportEmpData(data);
      } else {
        showToast(data.message || "Failed to load report.", "error");
      }
    } catch (error) {
      console.error("Error fetching employee report:", error);
      showToast("Error connecting to backend.", "error");
    } finally {
      setReportEmpDataLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!reportEmpData) return;
    const { employee, leaveTypeUsage, history } = reportEmpData;

    const doc = new jsPDF();
    const primaryColor = [242, 92, 5];
    const textColor = [30, 41, 59];
    const greyColor = [100, 116, 139];
    const lightBgColor = [248, 250, 252];
    const borderColor = [203, 213, 225];

    const drawSectionHeader = (title, y) => {
      doc.setFillColor(...primaryColor);
      doc.rect(14, y, 3, 6, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...textColor);
      doc.text(title, 20, y + 5);
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.5);
      doc.line(14, y + 9, 196, y + 9);
      return y + 15;
    };

    // Orange header bar
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 8, "F");

    // Brand
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text("LeaveWise", 14, 24);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...greyColor);
    doc.text("Touchmark Technologies | Leave Management System", 14, 29);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...textColor);
    doc.text("Employee Leave Report", 115, 25);

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1.5);
    doc.line(14, 34, 196, 34);

    // 1. Employee Info
    let currentY = 42;
    currentY = drawSectionHeader("Employee Information", currentY);

    doc.setFontSize(10);
    doc.setTextColor(...textColor);

    const infoCol1 = [
      ["Employee Name", employee.name],
      ["Employee ID", employee.employee_id],
      ["Department", employee.department || "N/A"],
    ];
    const infoCol2 = [
      ["Designation", employee.designation || "Employee"],
      ["Gender", employee.gender || "N/A"],
      [
        "Joining Date",
        employee.joining_date
          ? new Date(employee.joining_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
          : "N/A",
      ],
    ];

    infoCol1.forEach((item, index) => {
      const y = currentY + index * 8;
      doc.setFont("helvetica", "bold");
      doc.text(`${item[0]}:`, 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(item[1]), 50, y);
    });
    infoCol2.forEach((item, index) => {
      const y = currentY + index * 8;
      doc.setFont("helvetica", "bold");
      doc.text(`${item[0]}:`, 110, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(item[1]), 140, y);
    });

    currentY += 28;

    // 2. Leave Summary
    currentY = drawSectionHeader("Leave Summary", currentY);

    const summaryCards = [
      {
        label: "Total Annual Entitlement",
        val: `${employee.totalEntitlement} Days`,
        x: 14,
        w: 42,
      },
      {
        label: "Paid Leave Used",
        val: `${employee.paidLeavesTaken} Days`,
        x: 60,
        w: 42,
      },
      {
        label: "Remaining Balance",
        val: `${employee.remainingBalance} Days`,
        x: 106,
        w: 42,
      },
      {
        label: "Unpaid Leave Used",
        val: `${employee.unpaidLeavesTaken} Days`,
        x: 152,
        w: 44,
      },
    ];
    summaryCards.forEach((card) => {
      doc.setFillColor(...lightBgColor);
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.5);
      doc.roundedRect(card.x, currentY, card.w, 22, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...greyColor);
      doc.text(
        doc.splitTextToSize(card.label, card.w - 4),
        card.x + 3,
        currentY + 6,
      );
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text(card.val, card.x + 3, currentY + 16);
    });
    currentY += 32;

    // 3. Leave Type Distribution
    currentY = drawSectionHeader("Leave Type Distribution", currentY);
    const leaveTypes = [
      "Personal Leave",
      "Medical Leave",
      "Maternity Leave",
      "Paternity Leave",
    ];
    let distCount = 0;
    leaveTypes.forEach((type) => {
      const usage = leaveTypeUsage[type] || 0;
      if (
        (type === "Maternity Leave" || type === "Paternity Leave") &&
        usage === 0
      )
        return;
      const x = 14 + distCount * 45;
      doc.setDrawColor(...borderColor);
      doc.setFillColor(...lightBgColor);
      doc.rect(x, currentY, 40, 16, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...textColor);
      doc.text(type.replace(" Leave", ""), x + 3, currentY + 6);
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text(`${usage} Days`, x + 3, currentY + 12);
      distCount++;
    });
    currentY += 26;

    // 4. Recent Leave History Table
    currentY = drawSectionHeader("Recent Leave History", currentY);
    const headers = [
      "Leave Type",
      "From Date",
      "To Date",
      "Actual Leave Days",
      "Paid Days",
      "Unpaid Days",
      "Status",
      "Reason",
    ];
    const colWidths = [28, 20, 20, 26, 16, 18, 16, 38];

    doc.setFillColor(...textColor);
    doc.rect(14, currentY, 182, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    let currentX = 14;
    headers.forEach((h, i) => {
      doc.text(h, currentX + 2, currentY + 5.5);
      currentX += colWidths[i];
    });
    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textColor);
    if (history.length === 0) {
      doc.setDrawColor(...borderColor);
      doc.rect(14, currentY, 182, 10, "D");
      doc.text("No leave history records found.", 20, currentY + 6.5);
      currentY += 10;
    } else {
      history.forEach((row, rowIndex) => {
        if (currentY > 265) {
          doc.addPage();
          doc.setFillColor(...primaryColor);
          doc.rect(0, 0, 210, 8, "F");
          currentY = 20;
          doc.setFillColor(...textColor);
          doc.rect(14, currentY, 182, 8, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          let tempX = 14;
          headers.forEach((h, i) => {
            doc.text(h, tempX + 2, currentY + 5.5);
            tempX += colWidths[i];
          });
          currentY += 8;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...textColor);
        }
        if (rowIndex % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, currentY, 182, 10, "F");
        }
        doc.setDrawColor(...borderColor);
        doc.rect(14, currentY, 182, 10, "D");
        let rowX = 14;
        const rowData = [
          row.leave_type || "N/A",
          row.start_date || "N/A",
          row.end_date || "N/A",
          String(row.actual_leave_days || row.total_days || 0),
          String(row.paid_days || 0),
          String(row.unpaid_days || 0),
          row.status || "N/A",
          row.reason || "N/A",
        ];
        rowData.forEach((val, i) => {
          let text = String(val);
          if (i === 7 && text.length > 28) text = text.substring(0, 25) + "...";
          doc.line(rowX, currentY, rowX, currentY + 10);
          doc.setFontSize(7.5);
          if (i === 6) {
            doc.setFont("helvetica", "bold");
            if (val === "Approved") doc.setTextColor(16, 185, 129);
            else if (val === "Rejected" || val === "Cancelled")
              doc.setTextColor(239, 68, 68);
            else doc.setTextColor(245, 158, 11);
          } else {
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...textColor);
          }
          doc.text(text, rowX + 2, currentY + 6);
          rowX += colWidths[i];
        });
        currentY += 10;
      });
    }

    // Footer
    if (currentY > 250) {
      doc.addPage();
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 8, "F");
      currentY = 25;
    } else {
      currentY += 15;
    }
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);
    doc.line(14, currentY, 196, currentY);
    currentY += 8;

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textColor);
    doc.text("Generated On:", 14, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }) +
      " at " +
      new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      38,
      currentY,
    );

    const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};
    doc.setFont("helvetica", "bold");
    doc.text("Manager Name:", 110, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(loggedInUser.name || "System Manager", 135, currentY);
    currentY += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text("LeaveWise / Touchmark Technologies", 14, currentY);
    currentY += 7;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...greyColor);
    doc.text(
      "This report is system generated by LeaveWise / Touchmark Technologies Leave Management System.",
      14,
      currentY,
    );

    doc.save(`Employee_Report_${employee.employee_id}.pdf`);
    showToast("Report downloaded successfully", "success");
  };

  // Profile photo
  const managerLoggedInUser = JSON.parse(localStorage.getItem("user"));
  const [profilePhoto, setProfilePhoto] = useState(
    managerLoggedInUser?.profile_photo || null,
  );
  const profilePhotoInputRef = useRef(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const photoMenuRef = useRef(null);

  // Notification settings for profile toggle
  const [notifToggleEnabled, setNotifToggleEnabled] = useState(true);
  useEffect(() => {
    if (!managerLoggedInUser?.id) return;
    fetch(
      `${API_BASE_URL}/api/notifications/settings/${managerLoggedInUser.id}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setNotifToggleEnabled(data.notifications_enabled);
      })
      .catch(() => { });
  }, [notifRefreshTrigger]);

  const handleManagerNotifToggle = async () => {
    if (!managerLoggedInUser?.id) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/notifications/toggle/${managerLoggedInUser.id}`,
        { method: "PUT" },
      );
      const data = await res.json();
      if (data.success) {
        setNotifToggleEnabled(data.notifications_enabled);
        if (data.notifications_enabled && "Notification" in window)
          Notification.requestPermission();
        setNotifRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Manager notif toggle error:", err);
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (photoMenuRef.current && !photoMenuRef.current.contains(e.target)) {
        setShowPhotoMenu(false);
      }
    }
    if (showPhotoMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPhotoMenu]);

  // Scroll-triggered orange glow on profile cards
  useEffect(() => {
    if (activeView !== "profile") return;
    const timeout = setTimeout(() => {
      const cards = document.querySelectorAll(
        ".profile-hero-card, .info-card-ro",
      );
      if (!cards.length) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
            } else {
              entry.target.classList.remove("in-view");
            }
          });
        },
        { threshold: 0.15 },
      );
      cards.forEach((card) => observer.observe(card));
      return () => observer.disconnect();
    }, 100);
    return () => clearTimeout(timeout);
  }, [activeView]);

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileExt = file.name.split(".").pop().toLowerCase();

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExt)
    ) {
      showToast("Only JPG, JPEG, and PNG images are allowed.", "error");
      if (e.target) e.target.value = "";
      return;
    }

    setPendingPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    if (e.target) e.target.value = "";
  };

  const handleUploadConfirm = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!pendingPhotoFile || !user) return;

    const formData = new FormData();
    formData.append("profile_photo", pendingPhotoFile);

    try {
      showToast("Uploading profile photo...", "info");
      const response = await fetch(
        `${API_BASE_URL}/api/profile/upload-photo/${user.id}`,
        {
          method: "PUT",
          body: formData,
        },
      );
      const data = await response.json();
      if (data.success) {
        const updatedUser = { ...user, profile_photo: data.profile_photo };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setProfilePhoto(data.profile_photo);
        showToast("Profile photo updated successfully", "success");
        setPhotoPreview(null);
        setPendingPhotoFile(null);
      } else {
        showToast("Failed to upload profile photo", "error");
      }
    } catch (error) {
      console.error("Photo upload error:", error);
      showToast("Something went wrong. Backend connection failed.", "error");
    }
  };

  const handleProfilePhotoRemove = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/profile/remove-photo/${user.id}`,
        {
          method: "DELETE",
        },
      );
      const data = await response.json();
      if (data.success) {
        const updatedUser = { ...user, profile_photo: null };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setProfilePhoto(null);
        showToast("Profile photo removed successfully", "success");
      } else {
        showToast("Failed to remove profile photo", "error");
      }
    } catch (error) {
      console.error("Photo removal error:", error);
      showToast("Something went wrong. Backend connection failed.", "error");
    }
  };

  // Active Take Action Modal Request
  const [activeRequestModal, setActiveRequestModal] = useState(null);
  const [deleteHolidayConfirmation, setDeleteHolidayConfirmation] = useState({
    show: false,
    holidayId: null,
  });
  const [approveConfirmation, setApproveConfirmation] = useState({
    show: false,
    dbId: null,
    requestName: "",
  });
  const [rejectConfirmation, setRejectConfirmation] = useState({
    show: false,
    dbId: null,
    requestName: "",
  });

  // Leave Approval inline action popup
  const [approvalActionPopup, setApprovalActionPopup] = useState(null); // stores the request object

  // Leave Approval states
  const [approvalSearchQuery, setApprovalSearchQuery] = useState("");
  const [approvalStatusFilter, setApprovalStatusFilter] = useState(""); // "", "Pending", "Approved", "Rejected"
  const [approvalPaymentTypeFilter, setApprovalPaymentTypeFilter] =
    useState(""); // "", "Paid", "Partly Paid", "Unpaid"

  // Leave Requests state for Mockup 2 & 3
  const [requestsList, setRequestsList] = useState([
    {
      id: "MGR001",
      name: "Arun Kumar",
      photo: arunKumarAvatar,
      leaveType: "Manager",
      leaveDates: "01 days - 06 days",
      duration: "6 days",
      reason: "Family Function",
      remainingBalance: "22 days",
      status: "Pending",
    },
    {
      id: "EMP021",
      name: "Sarah Raman",
      photo: sarahRamanAvatar,
      leaveType: "Personal Leave",
      leaveDates: "01 days - 06 days",
      duration: "6 days",
      reason: "Family Gathering",
      remainingBalance: "10 days",
      status: "Pending",
    },
    {
      id: "EMP088",
      name: "Rina Sharma",
      photo: rinaSharmaAvatar,
      leaveType: "Medical Leave",
      leaveDates: "01 days - 06 days",
      duration: "6 days",
      reason: "Medical Checkup",
      remainingBalance: "10 days",
      status: "Pending",
    },
    {
      id: "EMP101",
      name: "David Chen",
      photo: null,
      leaveType: "Personal Leave",
      leaveDates: "01 days - 06 days",
      duration: "6 days",
      reason: "Annual Vacation",
      remainingBalance: "15 days",
      status: "Pending",
    },
    {
      id: "EMP115",
      name: "Kenji Tanaka",
      photo: null,
      leaveType: "Personal Leave",
      leaveDates: "01 days - 06 days",
      duration: "6 days",
      reason: "Personal Work",
      remainingBalance: "13 days",
      status: "Pending",
    },
    {
      id: "EMP073",
      name: "Sarah Pamest",
      photo: sarahPamestAvatar,
      leaveType: "Sick Leave",
      leaveDates: "01 days - 06 days",
      duration: "6 days",
      reason: "Doctor Visit",
      remainingBalance: "14 days",
      status: "Pending",
    },
  ]);

  // Fetch real report data when employee-report view becomes active
  useEffect(() => {
    if (activeView === "employee-report") {
      fetchReportData(reportStartDate, reportEndDate);
    }
  }, [activeView]);

  const [profileData, setProfileData] = useState({
    name: managerLoggedInUser?.name || "",
    managerId: managerLoggedInUser?.employee_id || "",
    department: managerLoggedInUser?.department || "",
    email: managerLoggedInUser?.email || "",
    phone: managerLoggedInUser?.phone || "",
    joiningDate: managerLoggedInUser?.joining_date || "",
    designation: managerLoggedInUser?.designation || "Manager",
    teamSize: "15 Employees",
    officeLocation: "Chennai, India",
  });
  const [tempProfileData, setTempProfileData] = useState({ ...profileData });

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leavesLoading, setLeavesLoading] = useState(false);

  const fetchManagerLeaves = async () => {
    setLeavesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/manager/leaves`);
      const data = await response.json();
      console.log("Manager leaves:", data.leaves);
      if (data.success) {
        const formattedLeaves = data.leaves.map((leave) => ({
          dbId: leave.id,
          id: leave.employee_code,
          name: leave.employee_name,
          type: leave.leave_type,
          dates: `${leave.start_date} - ${leave.end_date}`,
          leaveDays: leave.leave_days,
          total_days: leave.total_days ?? leave.leave_days,
          excluded_days: leave.excluded_days ?? 0,
          actual_leave_days:
            leave.actual_leave_days ?? leave.total_days ?? leave.leave_days,
          paid_days: leave.paid_days ?? leave.leave_days,
          unpaid_days: leave.unpaid_days ?? 0,
          payment_type: leave.payment_type || "Paid",
          alert_message: leave.alert_message,
          photo: null,
          description: leave.reason,
          status: leave.status,
        }));
        setLeaveRequests(formattedLeaves);
      }
    } catch (error) {
      console.error("Fetch manager leaves error:", error);
    } finally {
      setLeavesLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerLeaves();
  }, []);

  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleEditClick = () => {
    setTempProfileData({ ...profileData });
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/profile/update/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: tempProfileData.name,
            email: tempProfileData.email,
            phone: tempProfileData.phone,
            department: tempProfileData.department,
            joining_date: tempProfileData.joiningDate || null,
            designation: tempProfileData.designation,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        const updatedUser = {
          ...user,
          ...data.user,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));

        setProfileData({
          name: data.user.name || "",
          managerId: data.user.employee_id || "",
          department: data.user.department || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          joiningDate: data.user.joining_date || "",
          designation: data.user.designation || "Manager",
          teamSize: tempProfileData.teamSize,
          officeLocation: tempProfileData.officeLocation,
        });

        setIsEditing(false);
        showToast("Manager profile updated successfully", "success");
      } else {
        showToast("Manager profile update failed", "error");
      }
    } catch (error) {
      console.error("Manager profile update error:", error);
      showToast("Something went wrong. Backend connection failed.", "error");
    }
  };

  const handleCancelClick = () => {
    setTempProfileData({ ...profileData });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setTempProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApproveRequest = async (dbId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/manager/approve/${dbId}`,
        { method: "PUT" },
      );
      const data = await response.json();
      if (data.success) {
        if (
          selectedRequest &&
          (selectedRequest.dbId === dbId || selectedRequest.id === dbId)
        ) {
          setSelectedRequest(null);
        }
        showToast("Leave approved successfully", "success");
        await fetchManagerLeaves();
      } else {
        showToast(
          data.message || "Unable to approve this leave request.",
          "error",
        );
      }
    } catch (error) {
      console.error("Error approving request:", error);
      showToast("Backend connection failed. Please try again.", "error");
    }
  };

  const handleRejectRequest = async (dbId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/manager/reject/${dbId}`,
        { method: "PUT" },
      );
      const data = await response.json();
      if (data.success) {
        if (
          selectedRequest &&
          (selectedRequest.dbId === dbId || selectedRequest.id === dbId)
        ) {
          setSelectedRequest(null);
        }
        showToast("Leave rejected successfully", "success");
        await fetchManagerLeaves();
      } else {
        showToast(
          data.message || "Unable to reject this leave request.",
          "error",
        );
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      showToast("Backend connection failed. Please try again.", "error");
    }
  };

  const handleAddHolidaySubmit = async (e) => {
    e.preventDefault();
    setAddError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/holidays`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holiday_name: addHolidayForm.name,
          holiday_date: addHolidayForm.date,
          holiday_type: addHolidayForm.type,
          description: addHolidayForm.description,
        }),
      });
      const data = await response.json();
      if (data.success) {
        showToast("Holiday added successfully", "success");
        setShowAddModal(false);
        setAddHolidayForm({
          name: "",
          date: "",
          type: "Public Holiday",
          description: "",
        });
        await fetchHolidays();
      } else {
        setAddError(data.message || "Failed to add holiday.");
      }
    } catch (err) {
      console.error(err);
      setAddError("Backend connection failed.");
    }
  };

  const handleDeleteHoliday = (id) => {
    setDeleteHolidayConfirmation({ show: true, holidayId: id });
  };

  // Computed stats from actual leave requests data
  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter((r) => r.status === "Pending").length,
    approved: leaveRequests.filter((r) => r.status === "Approved").length,
    rejected: leaveRequests.filter((r) => r.status === "Rejected").length,
    cancelled: leaveRequests.filter((r) => r.status === "Cancelled").length,
  };

  // Filter real employees from backend
  const filteredEmployees = reportEmployees.filter((emp) => {
    const matchesSearch =
      (emp.name || "")
        .toLowerCase()
        .includes(reportSearchQuery.toLowerCase()) ||
      (emp.employee_id || "")
        .toLowerCase()
        .includes(reportSearchQuery.toLowerCase());
    const matchesLeaveType = reportLeaveTypeFilter
      ? (emp.leaveTypesTaken || []).includes(reportLeaveTypeFilter)
      : true;
    return matchesSearch && matchesLeaveType;
  });

  // Filter leave requests for Leave Approval view
  const filteredLeaveRequests = leaveRequests.filter((req) => {
    const matchesSearch =
      req.name.toLowerCase().includes(approvalSearchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(approvalSearchQuery.toLowerCase());

    const matchesStatus =
      approvalStatusFilter === "" ? true : req.status === approvalStatusFilter;

    const matchesPaymentType =
      approvalPaymentTypeFilter === ""
        ? true
        : req.payment_type === approvalPaymentTypeFilter;

    return matchesSearch && matchesStatus && matchesPaymentType;
  });

  // Body scroll lock — prevents page scroll when any modal is open
  useEffect(() => {
    const anyModalOpen =
      showLogoutModal ||
      !!photoPreview ||
      showAddModal ||
      showHistoryModal ||
      !!selectedRequest ||
      deleteHolidayConfirmation.show ||
      approveConfirmation.show ||
      rejectConfirmation.show ||
      !!selectedEmpReport;
    if (anyModalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [
    showLogoutModal,
    photoPreview,
    showAddModal,
    showHistoryModal,
    selectedRequest,
    deleteHolidayConfirmation.show,
    approveConfirmation.show,
    rejectConfirmation.show,
    selectedEmpReport,
  ]);

  return (
    <main className="manager-dashboard">
      <div className="dashboard-shell">
        <aside className="sidebar" aria-label="Manager dashboard navigation">
          {/* Logo Brand area */}
          <div className="brand">
            <div className="brand-logo-container">
              <div className="brand-icon-wrapper">
                <FaUsers className="brand-icon-users" />
                <div className="brand-icon-gear-overlay">
                  <span className="gear-dot"></span>
                </div>
              </div>
            </div>
            <div className="brand-text">
              <span className="brand-title-manager">Manager</span>
              <span className="brand-title-dashboard">Dashboard</span>
            </div>
            <button
              className="theme-toggle-emoji-btn"
              type="button"
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? "🌞" : "🌙"}
            </button>
          </div>

          <nav className="nav-list">
            <button
              className={`nav-item ${activeView === "profile" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveView("profile")}
            >
              <FaRegUser className="profile-nav-icon" />
              <span>My Profile</span>
            </button>
            <button
              className={`nav-item ${activeView === "leave-approval" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveView("leave-approval")}
            >
              <FaFileAlt />
              <span>Leave Approval</span>
            </button>
            <button
              className={`nav-item ${activeView === "employee-report" ? "active" : ""}`}
              type="button"
              onClick={() => {
                setActiveView("employee-report");
                setReportSearchQuery("");
                setReportLeaveTypeFilter("");
              }}
            >
              <FaRegChartBar />
              <span>View Employee Report</span>
            </button>
            <button
              className={`nav-item ${activeView === "holiday-calendar" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveView("holiday-calendar")}
            >
              <FaCalendarAlt />
              <span>Holiday Calendar</span>
            </button>
          </nav>

          <span className="sidebar-dot-grid" />

          <button
            className="logout"
            type="button"
            onClick={() => setShowLogoutModal(true)}
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </aside>

        <section className="profile-panel">
          {/* Top Header Bar with Notification Bell */}
          <div className="dashboard-top-header">
            <div className="top-header-left" />
            <div className="top-header-right">
              <NotificationBellManager
                refreshCountTrigger={notifRefreshTrigger}
                setRefreshCountTrigger={setNotifRefreshTrigger}
              />
            </div>
          </div>

          <div key={activeView} className="page-transition-wrapper">
            {activeView === "profile" && (
              <>
                <DashboardGreetingCard
                  name={profileData.name}
                  leaveRequests={leaveRequests}
                  holidaysList={holidaysList}
                />
                <div className="profile-content">
                  {/* Profile Hero Card */}
                  <div className="profile-hero-card">
                    {/* Left — Avatar + Name */}
                    <div className="profile-hero-left">
                      <div className="avatar-wrapper" ref={photoMenuRef}>
                        <img
                          src={profilePhoto || defaultManagerAvatar}
                          alt="Manager Avatar"
                          className="manager-avatar"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = defaultManagerAvatar;
                          }}
                        />
                        <input
                          ref={profilePhotoInputRef}
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          style={{ display: "none" }}
                          onChange={handleProfilePhotoChange}
                        />
                        <button
                          type="button"
                          className="avatar-edit-btn"
                          title="Edit profile photo"
                          onClick={() => setShowPhotoMenu((prev) => !prev)}
                        >
                          <FaPencilAlt />
                        </button>
                        {showPhotoMenu && (
                          <div className="manager-avatar-menu">
                            <button
                              type="button"
                              className="manager-avatar-menu-item"
                              onClick={() => {
                                setShowPhotoMenu(false);
                                if (
                                  profilePhotoInputRef &&
                                  profilePhotoInputRef.current
                                ) {
                                  profilePhotoInputRef.current.click();
                                }
                              }}
                            >
                              Change Profile Picture
                            </button>
                            {profilePhoto && (
                              <button
                                type="button"
                                className="manager-avatar-menu-item remove"
                                onClick={() => {
                                  setShowPhotoMenu(false);
                                  handleProfilePhotoRemove();
                                }}
                              >
                                Remove Profile Picture
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="hero-details">
                        <h2 className="profile-name">{profileData.name}</h2>
                        <div className="manager-meta">
                          <span>
                            <FaRegCalendarAlt />
                            Manager ID: {profileData.managerId}
                          </span>
                          <span>
                            <FaBuilding />
                            {profileData.department} Department
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right — Role Card */}
                    <div className="profile-role-card">
                      <div className="role-icon-wrap">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="role-shield-icon"
                        >
                          <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6L12 2z" />
                          <path d="M9 12l2 2 4-4" />
                        </svg>
                      </div>
                      <span className="role-label">Role</span>
                      <span className="role-value">Manager</span>
                    </div>
                  </div>

                  {/* Info Cards Grid */}
                  <div className="info-grid">
                    <div className="info-card info-card-ro">
                      <FaEnvelope />
                      <div className="card-body">
                        <strong>Email</strong>
                        <span>{profileData.email}</span>
                      </div>
                    </div>

                    <div className="info-card info-card-ro">
                      <FaPhoneAlt />
                      <div className="card-body">
                        <strong>Phone</strong>
                        <span>{profileData.phone}</span>
                      </div>
                    </div>

                    <div className="info-card info-card-ro">
                      <FaRegCalendarAlt />
                      <div className="card-body">
                        <strong>Joining Date</strong>
                        <span>{formatDate(profileData.joiningDate)}</span>
                      </div>
                    </div>

                    <div className="info-card info-card-ro">
                      <FaBuilding />
                      <div className="card-body">
                        <strong>Department</strong>
                        <span>{profileData.department}</span>
                      </div>
                    </div>

                    <div className="info-card info-card-ro">
                      <FaSuitcase />
                      <div className="card-body">
                        <strong>Designation</strong>
                        <span>{profileData.designation}</span>
                      </div>
                    </div>

                    <div className="info-card info-card-ro">
                      <FaUsers />
                      <div className="card-body">
                        <strong>Team Size</strong>
                        <span>{profileData.teamSize}</span>
                      </div>
                    </div>

                    {/* Office Location — full width with skyline decoration */}
                    <div className="info-card info-card-ro full-width office-card">
                      <FaMapMarkerAlt />
                      <div className="card-body">
                        <strong>Office Location</strong>
                        <span>{profileData.officeLocation}</span>
                      </div>
                      {/* Decorative City Skyline SVG */}
                      <svg
                        className="skyline-deco"
                        viewBox="0 0 600 120"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        {/* Buildings */}
                        <rect x="10" y="60" width="30" height="60" rx="2" />
                        <rect x="15" y="50" width="20" height="10" rx="1" />
                        <rect x="18" y="40" width="14" height="10" rx="1" />
                        <rect x="21" y="33" width="8" height="7" rx="1" />
                        <rect x="48" y="70" width="24" height="50" rx="2" />
                        <rect x="52" y="58" width="16" height="12" rx="1" />
                        <rect x="80" y="45" width="36" height="75" rx="2" />
                        <rect x="85" y="35" width="26" height="10" rx="1" />
                        <rect x="90" y="25" width="16" height="10" rx="1" />
                        <rect x="95" y="15" width="6" height="10" rx="1" />
                        <rect x="98" y="8" width="2" height="7" rx="1" />
                        <rect x="124" y="65" width="28" height="55" rx="2" />
                        <rect x="128" y="55" width="20" height="10" rx="1" />
                        <rect x="160" y="55" width="40" height="65" rx="2" />
                        <rect x="165" y="40" width="30" height="15" rx="1" />
                        <rect x="170" y="30" width="20" height="10" rx="1" />
                        <rect x="208" y="72" width="22" height="48" rx="2" />
                        <rect x="238" y="50" width="32" height="70" rx="2" />
                        <rect x="242" y="38" width="24" height="12" rx="1" />
                        <rect x="246" y="28" width="16" height="10" rx="1" />
                        <rect x="250" y="20" width="8" height="8" rx="1" />
                        <rect x="278" y="68" width="26" height="52" rx="2" />
                        <rect x="312" y="48" width="38" height="72" rx="2" />
                        <rect x="317" y="36" width="28" height="12" rx="1" />
                        <rect x="322" y="26" width="18" height="10" rx="1" />
                        <rect x="327" y="18" width="8" height="8" rx="1" />
                        <rect x="330" y="10" width="2" height="8" rx="1" />
                        <rect x="358" y="62" width="28" height="58" rx="2" />
                        <rect x="362" y="52" width="20" height="10" rx="1" />
                        <rect x="394" y="55" width="34" height="65" rx="2" />
                        <rect x="398" y="43" width="26" height="12" rx="1" />
                        <rect x="402" y="32" width="18" height="11" rx="1" />
                        <rect x="436" y="70" width="24" height="50" rx="2" />
                        <rect x="468" y="52" width="36" height="68" rx="2" />
                        <rect x="472" y="40" width="28" height="12" rx="1" />
                        <rect x="476" y="28" width="20" height="12" rx="1" />
                        <rect x="480" y="18" width="12" height="10" rx="1" />
                        <rect x="512" y="65" width="26" height="55" rx="2" />
                        <rect x="516" y="53" width="18" height="12" rx="1" />
                        <rect x="546" y="58" width="30" height="62" rx="2" />
                        <rect x="550" y="46" width="22" height="12" rx="1" />
                        {/* Windows */}
                        <rect
                          x="84"
                          y="52"
                          width="5"
                          height="5"
                          rx="1"
                          fill="white"
                          fillOpacity="0.4"
                        />
                        <rect
                          x="93"
                          y="52"
                          width="5"
                          height="5"
                          rx="1"
                          fill="white"
                          fillOpacity="0.4"
                        />
                        <rect
                          x="102"
                          y="52"
                          width="5"
                          height="5"
                          rx="1"
                          fill="white"
                          fillOpacity="0.4"
                        />
                        <rect
                          x="84"
                          y="62"
                          width="5"
                          height="5"
                          rx="1"
                          fill="white"
                          fillOpacity="0.4"
                        />
                        <rect
                          x="93"
                          y="62"
                          width="5"
                          height="5"
                          rx="1"
                          fill="white"
                          fillOpacity="0.4"
                        />
                        <rect
                          x="102"
                          y="62"
                          width="5"
                          height="5"
                          rx="1"
                          fill="white"
                          fillOpacity="0.4"
                        />
                        <rect
                          x="165"
                          y="62"
                          width="5"
                          height="5"
                          rx="1"
                          fill="white"
                          fillOpacity="0.4"
                        />
                        <rect
                          x="175"
                          y="62"
                          width="5"
                          height="5"
                          rx="1"
                          fill="white"
                          fillOpacity="0.4"
                        />
                        <rect
                          x="185"
                          y="62"
                          width="5"
                          height="5"
                          rx="1"
                          fill="white"
                          fillOpacity="0.4"
                        />
                        <rect
                          x="316"
                          y="56"
                          width="5"
                          height="5"
                          rx="1"
                          fill="white"
                          fillOpacity="0.4"
                        />
                        <rect
                          x="326"
                          y="56"
                          width="5"
                          height="5"
                          rx="1"
                          fill="white"
                          fillOpacity="0.4"
                        />
                        <rect
                          x="336"
                          y="56"
                          width="5"
                          height="5"
                          rx="1"
                          fill="white"
                          fillOpacity="0.4"
                        />
                        <rect
                          x="316"
                          y="66"
                          width="5"
                          height="5"
                          rx="1"
                          fill="white"
                          fillOpacity="0.4"
                        />
                        <rect
                          x="326"
                          y="66"
                          width="5"
                          height="5"
                          rx="1"
                          fill="white"
                          fillOpacity="0.4"
                        />
                        <rect
                          x="472"
                          y="48"
                          width="5"
                          height="5"
                          rx="1"
                          fill="white"
                          fillOpacity="0.4"
                        />
                        <rect
                          x="482"
                          y="48"
                          width="5"
                          height="5"
                          rx="1"
                          fill="white"
                          fillOpacity="0.4"
                        />
                        <rect
                          x="492"
                          y="48"
                          width="5"
                          height="5"
                          rx="1"
                          fill="white"
                          fillOpacity="0.4"
                        />
                        {/* Ground line */}
                        <line
                          x1="0"
                          y1="120"
                          x2="600"
                          y2="120"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        {/* Trees */}
                        <circle cx="70" cy="113" r="6" />
                        <rect
                          cx="70"
                          cy="115"
                          width="2"
                          height="5"
                          x="-1"
                          fill="currentColor"
                        />
                        <circle cx="230" cy="112" r="7" />
                        <circle cx="302" cy="114" r="5" />
                        <circle cx="450" cy="113" r="6" />
                        <circle cx="565" cy="112" r="7" />
                      </svg>
                    </div>
                  </div>

                  {/* ── Notification Settings Card ──── */}
                  <p
                    className="account-details-heading"
                    style={{ marginTop: "28px" }}
                  >
                    System Settings
                  </p>
                  <div className="settings-section-card">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <h4
                          style={{
                            margin: 0,
                            fontSize: "15px",
                            fontWeight: "700",
                          }}
                        >
                          Desktop Notifications
                        </h4>
                        <p
                          style={{
                            margin: "5px 0 0",
                            fontSize: "13px",
                            color: "#64748b",
                            lineHeight: "1.5",
                          }}
                        >
                          Receive browser alerts for leave requests, approvals,
                          rejections, and holiday announcements.
                        </p>
                      </div>
                      <label className="toggle-switch-label">
                        <input
                          type="checkbox"
                          checked={notifToggleEnabled}
                          onChange={handleManagerNotifToggle}
                        />
                        <span className="toggle-switch-slider" />
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeView === "leave-approval" && (
              <div className="leave-approval-content">
                <div className="section-title">
                  <FaFileAlt className="profile-title-icon" />
                  <h1>Leave Approval</h1>
                </div>
                {/* Stats Panel */}
                <div className="stats-grid">
                  {/* Stats Card 1: Total Requests */}
                  <div className="stats-card total-card">
                    <div className="stats-card-header total-header">
                      <FaUsers />
                      <span>Total Requests</span>
                    </div>
                    <div className="stats-card-body">
                      <div className="stats-circle total-circle">
                        <FaUsers />
                      </div>
                      <span className="stats-number">{stats.total}</span>
                    </div>
                  </div>

                  {/* Stats Card 2: Pending Requests */}
                  <div className="stats-card pending-card">
                    <div className="stats-card-header pending-header">
                      <FaExclamationTriangle />
                      <span>Pending Requests</span>
                    </div>
                    <div className="stats-card-body">
                      <div className="stats-circle pending-circle">
                        <FaRegClock />
                      </div>
                      <span className="stats-number">{stats.pending}</span>
                    </div>
                  </div>

                  {/* Stats Card 3: Approved Requests */}
                  <div className="stats-card approved-card">
                    <div className="stats-card-header approved-header">
                      <FaCheckCircle />
                      <span>Approved Requests</span>
                    </div>
                    <div className="stats-card-body">
                      <div className="stats-circle approved-circle">
                        <FaRegCheckCircle />
                      </div>
                      <span className="stats-number">{stats.approved}</span>
                    </div>
                  </div>

                  {/* Stats Card 4: Rejected Requests */}
                  <div className="stats-card rejected-card">
                    <div className="stats-card-header rejected-header">
                      <FaThumbsDown />
                      <span>Rejected Requests</span>
                    </div>
                    <div className="stats-card-body">
                      <div className="stats-circle rejected-circle">
                        <FaRegTimesCircle />
                      </div>
                      <span className="stats-number">{stats.rejected}</span>
                    </div>
                  </div>

                  {/* Stats Card 5: Cancelled Requests */}
                  <div className="stats-card cancelled-card">
                    <div className="stats-card-header cancelled-header">
                      <FaTimes />
                      <span>Cancelled Requests</span>
                    </div>
                    <div className="stats-card-body">
                      <div className="stats-circle cancelled-circle">
                        <FaTimes />
                      </div>
                      <span className="stats-number">{stats.cancelled}</span>
                    </div>
                  </div>
                </div>

                {/* Filters Bar */}
                <div className="approval-filters-bar">
                  {/* Search */}
                  <div className="filter-search-wrapper approval-search">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search by employee name or ID..."
                      value={approvalSearchQuery}
                      onChange={(e) => setApprovalSearchQuery(e.target.value)}
                      className="report-search-input"
                    />
                  </div>

                  {/* Payment Type Filter */}
                  <div className="filter-select-field-wrapper">
                    <FaCoins
                      className="field-icon"
                      style={{ color: "#64748b" }}
                    />
                    <select
                      value={approvalPaymentTypeFilter}
                      onChange={(e) =>
                        setApprovalPaymentTypeFilter(e.target.value)
                      }
                      className="report-select-input"
                      aria-label="Filter by payment type"
                    >
                      <option value="">Payment Type: All</option>
                      <option value="Paid">Paid</option>
                      <option value="Partly Paid">Partly Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                    <FaChevronDown className="select-chevron" />
                  </div>

                  {/* Status Pills */}
                  <div className="approval-status-pills">
                    <button
                      type="button"
                      className={`approval-pill all ${approvalStatusFilter === "" ? "active" : ""}`}
                      onClick={() => setApprovalStatusFilter("")}
                    >
                      All
                      <span className="pill-count">{leaveRequests.length}</span>
                    </button>
                    <button
                      type="button"
                      className={`approval-pill pending ${approvalStatusFilter === "Pending" ? "active" : ""}`}
                      onClick={() => setApprovalStatusFilter("Pending")}
                    >
                      Pending
                      <span className="pill-count">
                        {
                          leaveRequests.filter((r) => r.status === "Pending")
                            .length
                        }
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`approval-pill approved ${approvalStatusFilter === "Approved" ? "active" : ""}`}
                      onClick={() => setApprovalStatusFilter("Approved")}
                    >
                      Approved
                      <span className="pill-count">
                        {
                          leaveRequests.filter((r) => r.status === "Approved")
                            .length
                        }
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`approval-pill rejected ${approvalStatusFilter === "Rejected" ? "active" : ""}`}
                      onClick={() => setApprovalStatusFilter("Rejected")}
                    >
                      Rejected
                      <span className="pill-count">
                        {
                          leaveRequests.filter((r) => r.status === "Rejected")
                            .length
                        }
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`approval-pill cancelled ${approvalStatusFilter === "Cancelled" ? "active" : ""}`}
                      onClick={() => setApprovalStatusFilter("Cancelled")}
                    >
                      Cancelled
                      <span className="pill-count">
                        {
                          leaveRequests.filter((r) => r.status === "Cancelled")
                            .length
                        }
                      </span>
                    </button>
                  </div>
                </div>

                {/* Leave Requests Section */}
                <div className="requests-table-section">
                  <div className="requests-table-scroll">
                    <table className="requests-table">
                      <colgroup>
                        <col style={{ width: "18%" }} />
                        {/* Employee Name */}
                        <col style={{ width: "11%" }} />
                        {/* Employee ID */}
                        <col style={{ width: "24%" }} />
                        {/* Leave Type */}
                        <col style={{ width: "20%" }} />
                        {/* Date Range */}
                        <col style={{ width: "11%" }} />
                        {/* Days */}
                        <col style={{ width: "9%" }} />
                        {/* Status */}
                        <col style={{ width: "7%" }} />
                        {/* Action */}
                      </colgroup>
                      <thead>
                        <tr>
                          <th className="th-employee-name">Employee Name</th>
                          <th className="th-employee-id">Employee ID</th>
                          <th className="th-leave-type">Leave Type</th>
                          <th className="th-date-range">Date Range</th>
                          <th className="th-days">Days</th>
                          <th className="th-status">Status</th>
                          <th className="th-action">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leavesLoading ? (
                          <tr className="manager-loading-row">
                            <td colSpan={7}>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "32px 0",
                                  color: "#ea580c",
                                  fontWeight: "600",
                                }}
                              >
                                <svg
                                  width="36"
                                  height="36"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#ea580c"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M12 6v6l4 2" />
                                </svg>
                                <span>Loading leave requests...</span>
                              </div>
                            </td>
                          </tr>
                        ) : filteredLeaveRequests.length === 0 ? (
                          <tr className="manager-empty-row">
                            <td colSpan={7}>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: "12px",
                                  padding: "48px 0",
                                  color: "#94a3b8",
                                }}
                              >
                                <svg
                                  width="52"
                                  height="52"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#cbd5e1"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M9 11l3 3L22 4" />
                                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                                </svg>
                                <div
                                  style={{
                                    fontWeight: "700",
                                    fontSize: "15px",
                                    color: "#64748b",
                                  }}
                                >
                                  No leave requests available
                                </div>
                                <div
                                  style={{ fontSize: "13px", color: "#94a3b8" }}
                                >
                                  Pending employee requests will appear here.
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredLeaveRequests.map((request, index) => {
                            const isMaternity = (request.type || "").toLowerCase().includes("maternity");
                            const isPaternity = (request.type || "").toLowerCase().includes("paternity");
                            const isSpecialLeave = isMaternity || isPaternity;

                            const getDetailBadges = () => {
                              const badges = [];

                              // 1. Primary payment type badge (Paid / Partly Paid / Unpaid)
                              const pType = request.payment_type || "Paid";
                              let primaryBadgeStyle = {};
                              let dotColor = "";

                              if (pType === "Paid") {
                                primaryBadgeStyle = {
                                  backgroundColor: "#f0fdf4",
                                  color: "#15803d",
                                  border: "1px solid #86efac",
                                };
                                dotColor = "#22c55e";
                              } else if (pType === "Partly Paid") {
                                // Orange style per user request
                                primaryBadgeStyle = {
                                  backgroundColor: "#fff7ed",
                                  color: "#c2410c",
                                  border: "1px solid #fed7aa",
                                };
                                dotColor = "#f97316";
                              } else {
                                // Unpaid
                                primaryBadgeStyle = {
                                  backgroundColor: "#fef2f2",
                                  color: "#b91c1c",
                                  border: "1px solid #fecaca",
                                };
                                dotColor = "#ef4444";
                              }

                              badges.push(
                                <span
                                  key="primary-badge"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "3px 9px",
                                    borderRadius: "999px",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    letterSpacing: "0.02em",
                                    ...primaryBadgeStyle,
                                  }}
                                >
                                  <span
                                    style={{
                                      width: "6px",
                                      height: "6px",
                                      borderRadius: "50%",
                                      background: dotColor,
                                      flexShrink: 0,
                                      display: "inline-block",
                                    }}
                                  />
                                  {pType}
                                </span>,
                              );

                              // 2. Secondary/Breakdown badges
                              const msg = request.alert_message || "";
                              const isBenefitBreakdown =
                                msg.includes("Paternity") ||
                                msg.includes("Maternity") ||
                                msg.includes("Monthly");

                              if (isBenefitBreakdown) {
                                const parts = msg
                                  .split("+")
                                  .map((p) => p.trim());
                                parts.forEach((part, idx) => {
                                  let badgeStyle = {};

                                  if (part.includes("Paternity")) {
                                    badgeStyle = {
                                      backgroundColor: "#f5f3ff",
                                      color: "#7c3aed",
                                      border: "1px solid #ddd6fe",
                                    };
                                  } else if (part.includes("Maternity")) {
                                    badgeStyle = {
                                      backgroundColor: "#fdf2f8",
                                      color: "#db2777",
                                      border: "1px solid #f9a8d4",
                                    };
                                  } else if (part.includes("Monthly")) {
                                    badgeStyle = {
                                      backgroundColor: "#eff6ff",
                                      color: "#1d4ed8",
                                      border: "1px solid #bfdbfe",
                                    };
                                  } else {
                                    badgeStyle = {
                                      backgroundColor: "#fef2f2",
                                      color: "#b91c1c",
                                      border: "1px solid #fecaca",
                                    };
                                  }

                                  badges.push(
                                    <span
                                      key={`benefit-badge-${idx}`}
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        padding: "3px 9px",
                                        borderRadius: "999px",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                        letterSpacing: "0.02em",
                                        ...badgeStyle,
                                      }}
                                    >
                                      {part}
                                    </span>,
                                  );
                                });
                              } else {
                                if (pType === "Unpaid") {
                                  badges.push(
                                    <span
                                      key="fully-unpaid"
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        backgroundColor: "#fff5f5",
                                        color: "#dc2626",
                                        border: "1px solid #fca5a5",
                                        padding: "3px 9px",
                                        borderRadius: "999px",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                      }}
                                    >
                                      <FaExclamationTriangle
                                        style={{
                                          fontSize: "10px",
                                          flexShrink: 0,
                                        }}
                                      />
                                      Fully Unpaid
                                    </span>,
                                  );
                                } else if (pType === "Partly Paid") {
                                  badges.push(
                                    <span
                                      key="partly-paid-split"
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        backgroundColor: "#fff1f2",
                                        color: "#be123c",
                                        border: "1px solid #fda4af",
                                        padding: "3px 9px",
                                        borderRadius: "999px",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                      }}
                                    >
                                      <FaExclamationTriangle
                                        style={{
                                          fontSize: "10px",
                                          flexShrink: 0,
                                        }}
                                      />
                                      {`${request.paid_days} Paid + ${request.unpaid_days} Unpaid`}
                                    </span>,
                                  );
                                }
                              }

                              return badges;
                            };

                            const formatMaternityPaternityText = () => {
                              const paidVal = request.paid_days ?? 0;
                              const unpaidVal = request.unpaid_days ?? 0;
                              if (isMaternity) {
                                return `+182 Paid Maternity • ${unpaidVal} Unpaid`;
                              }
                              if (isPaternity) {
                                return `+15 Paid Paternity • ${unpaidVal} Unpaid`;
                              }
                              return "";
                            };

                            const rowStyle = isSpecialLeave ? {
                              background: isMaternity
                                ? "linear-gradient(90deg, rgba(253, 242, 248, 0.5) 0%, rgba(255, 255, 255, 1) 100%)"
                                : "linear-gradient(90deg, rgba(245, 243, 255, 0.5) 0%, rgba(255, 255, 255, 1) 100%)",
                              borderLeft: isMaternity ? "4px solid #f9a8d4" : "4px solid #ddd6fe"
                            } : {};

                            return (
                              <tr
                                key={`${request.dbId || request.id}-${index}`}
                                style={rowStyle}
                              >
                                {/* Employee Name column */}
                                <td>
                                  <div className="employee-info-cell">
                                    <span className="employee-name-label">
                                      {request.name}
                                    </span>
                                  </div>
                                </td>
                                {/* Employee ID column */}
                                <td className="td-employee-id">
                                  <span className="employee-id-badge">
                                    {request.id}
                                  </span>
                                </td>
                                {/* Leave Type column */}
                                <td className="leave-type-col-td">
                                  <div className="leave-type-col-wrapper">
                                    {/* Title row: info icon + leave type name */}
                                    <div className="leave-type-title-row">
                                      <button
                                        className="info-icon-btn"
                                        type="button"
                                        onClick={() =>
                                          setSelectedRequest(request)
                                        }
                                        aria-label="Show leave description"
                                      >
                                        <FaInfoCircle />
                                      </button>
                                      <span className="leave-type-name" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                        {request.type} {isSpecialLeave && <span style={{ fontSize: "12px" }}>⭐</span>}
                                      </span>
                                    </div>
                                    {/* Badges row: all payment/type badges in a horizontal row */}
                                    <div className="leave-type-badges-row">
                                      {getDetailBadges()}
                                    </div>
                                  </div>
                                </td>
                                {/* Date Range column */}
                                <td>
                                  <span className="date-range-label">
                                    {(() => {
                                      const parts = (request.dates || "").split(
                                        " - ",
                                      );
                                      if (parts.length === 2) {
                                        return `${formatDateNicely(parts[0].trim())} – ${formatDateNicely(parts[1].trim())}`;
                                      }
                                      return request.dates;
                                    })()}
                                  </span>
                                </td>
                                {/* Days column */}
                                <td>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "2px",
                                    }}
                                  >
                                    <span
                                      className="days-label"
                                      style={{ display: "block" }}
                                      title="Total calendar days selected"
                                    >
                                      {request.total_days || request.leaveDays}{" "}
                                      {(request.total_days ||
                                        request.leaveDays) === 1
                                        ? "Day"
                                        : "Days"}
                                    </span>
                                    {request.excluded_days > 0 && (
                                      <span
                                        style={{
                                          fontSize: "11px",
                                          color: "#ea580c",
                                          fontWeight: "600",
                                        }}
                                        title="Sundays and holidays excluded"
                                      >
                                        −{request.excluded_days} Excl.
                                      </span>
                                    )}
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        color: "#2563eb",
                                        fontWeight: "600",
                                      }}
                                      title="Actual working leave days"
                                    >
                                      {request.actual_leave_days} Actual
                                    </span>
                                    {request.unpaid_days > 0 && !isSpecialLeave && (
                                      <span
                                        style={{
                                          fontSize: "11px",
                                          color: "#64748b",
                                          fontWeight: "600",
                                        }}
                                      >
                                        ({request.paid_days} Paid +{" "}
                                        {request.unpaid_days} Unpaid)
                                      </span>
                                    )}
                                    {isSpecialLeave && (
                                      <span
                                        style={{
                                          fontSize: "11px",
                                          color: isMaternity ? "#db2777" : "#7c3aed",
                                          fontWeight: "700",
                                          background: isMaternity ? "#fdf2f8" : "#f5f3ff",
                                          border: isMaternity ? "1px solid #f9a8d4" : "1px solid #ddd6fe",
                                          borderRadius: "6px",
                                          padding: "2px 6px",
                                          marginTop: "2px",
                                          display: "inline-block",
                                          width: "max-content"
                                        }}
                                      >
                                        {formatMaternityPaternityText()}
                                      </span>
                                    )}
                                    {!isSpecialLeave &&
                                      request.unpaid_days === 0 &&
                                      request.alert_message &&
                                      (() => {
                                        const msg = request.alert_message;
                                        const isBreakdown =
                                          msg.includes("Paternity") ||
                                          msg.includes("Maternity") ||
                                          msg.includes("Monthly");
                                        return isBreakdown ? (
                                          <span
                                            style={{
                                              fontSize: "11px",
                                              color: "#64748b",
                                              fontWeight: "600",
                                            }}
                                          >
                                            ({msg})
                                          </span>
                                        ) : null;
                                      })()}
                                  </div>
                                </td>
                                {/* Status column */}
                                <td>
                                  <span
                                    className={`approval-status-badge ${request.status.toLowerCase()}`}
                                  >
                                    {request.status === "Pending" && (
                                      <span className="status-dot pending-dot" />
                                    )}
                                    {request.status === "Approved" && (
                                      <span className="status-dot approved-dot" />
                                    )}
                                    {request.status === "Rejected" && (
                                      <span className="status-dot rejected-dot" />
                                    )}
                                    {request.status === "Cancelled" && (
                                      <span className="status-dot cancelled-dot" />
                                    )}
                                    {request.status}
                                  </span>
                                </td>
                                {/* Action column */}
                                <td className="action-col-cell">
                                  {request.status === "Pending" ? (
                                    <div className="action-popup-wrapper">
                                      <button
                                        type="button"
                                        className="action-trigger-btn"
                                        title="Take Action"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setApprovalActionPopup(
                                            approvalActionPopup &&
                                              approvalActionPopup.dbId ===
                                              request.dbId
                                              ? null
                                              : request,
                                          );
                                        }}
                                      >
                                        Take Action
                                      </button>
                                      {approvalActionPopup &&
                                        approvalActionPopup.dbId ===
                                        request.dbId && (
                                          <div
                                            className="action-inline-popup"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <div className="action-popup-arrow" />
                                            <button
                                              type="button"
                                              className="popup-action-btn approve-action"
                                              onClick={() => {
                                                setApproveConfirmation({
                                                  show: true,
                                                  dbId:
                                                    request.dbId || request.id,
                                                  requestName:
                                                    request.name ||
                                                    "this employee",
                                                });
                                                setApprovalActionPopup(null);
                                              }}
                                            >
                                              ✓ Approve
                                            </button>
                                            <button
                                              type="button"
                                              className="popup-action-btn reject-action"
                                              onClick={() => {
                                                setRejectConfirmation({
                                                  show: true,
                                                  dbId:
                                                    request.dbId || request.id,
                                                  requestName:
                                                    request.name ||
                                                    "this employee",
                                                });
                                                setApprovalActionPopup(null);
                                              }}
                                            >
                                              ✗ Reject
                                            </button>
                                          </div>
                                        )}
                                    </div>
                                  ) : request.status === "Cancelled" ? (
                                    <span
                                      style={{
                                        color: "#64748b",
                                        fontWeight: 600,
                                        fontSize: "14px",
                                      }}
                                    >
                                      Cancelled by Employee
                                    </span>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* end .requests-table-scroll */}
                  {/* Close action popup when clicking outside */}
                  {approvalActionPopup && (
                    <div
                      className="action-popup-backdrop"
                      onClick={() => setApprovalActionPopup(null)}
                    />
                  )}
                </div>

                {/* Details Popup Modal */}
                {selectedRequest && (
                  <div
                    className="popup-overlay"
                    onClick={() => setSelectedRequest(null)}
                  >
                    <div
                      className="details-popup-card"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="popup-card-header">
                        <h3>
                          {selectedRequest.type} ({selectedRequest.id}) - Leave
                        </h3>
                        <button
                          className="close-popup-btn"
                          type="button"
                          onClick={() => setSelectedRequest(null)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                      <div className="popup-card-body">
                        {(selectedRequest.payment_type === "Partly Paid" ||
                          selectedRequest.payment_type === "Unpaid" ||
                          (selectedRequest.alert_message &&
                            (selectedRequest.alert_message.includes(
                              "Paternity",
                            ) ||
                              selectedRequest.alert_message.includes(
                                "Maternity",
                              ) ||
                              selectedRequest.alert_message.includes(
                                "Monthly",
                              )))) && (
                            <div
                              style={{
                                padding: "14px 16px",
                                borderRadius: "10px",
                                backgroundColor: "#fff1f2",
                                border: "1.5px solid #fda4af",
                                marginBottom: "18px",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "12px",
                              }}
                            >
                              <div
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "8px",
                                  flexShrink: 0,
                                  backgroundColor: "#fecdd3",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#be123c",
                                  fontSize: "15px",
                                }}
                              >
                                <FaExclamationTriangle />
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontWeight: "700",
                                    fontSize: "13px",
                                    color:
                                      selectedRequest.payment_type === "Paid"
                                        ? "#15803d"
                                        : "#be123c",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {selectedRequest.payment_type === "Unpaid"
                                    ? "Unpaid Leave"
                                    : selectedRequest.payment_type === "Paid"
                                      ? "Payment Breakdown"
                                      : "Partly Paid Leave"}
                                </div>
                                {selectedRequest.payment_type !== "Paid" && (
                                  <div
                                    style={{
                                      fontSize: "12.5px",
                                      color: "#64748b",
                                      lineHeight: "1.5",
                                    }}
                                  >
                                    {selectedRequest.alert_message ||
                                      (selectedRequest.payment_type === "Unpaid"
                                        ? "This leave is unpaid because the monthly paid leave limit has already been used."
                                        : "This leave is partly unpaid because the monthly paid leave limit is exceeded.")}
                                  </div>
                                )}
                                {selectedRequest.unpaid_days > 0 &&
                                  (() => {
                                    const msg =
                                      selectedRequest.alert_message || "";
                                    const isBreakdown =
                                      msg.includes("Paternity") ||
                                      msg.includes("Maternity") ||
                                      msg.includes("Monthly");
                                    if (isBreakdown) {
                                      return (
                                        <div
                                          style={{
                                            marginTop: "8px",
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: "6px",
                                          }}
                                        >
                                          {msg.split(" + ").map((part, i) => {
                                            const isUnpaid =
                                              part.includes("Unpaid");
                                            const isMonthly =
                                              part.includes("Monthly");
                                            return (
                                              <span
                                                key={i}
                                                style={{
                                                  fontSize: "12px",
                                                  fontWeight: "700",
                                                  color: isUnpaid
                                                    ? "#b91c1c"
                                                    : isMonthly
                                                      ? "#2563eb"
                                                      : "#15803d",
                                                  background: isUnpaid
                                                    ? "#fef2f2"
                                                    : isMonthly
                                                      ? "#eff6ff"
                                                      : "#f0fdf4",
                                                  border: `1px solid ${isUnpaid ? "#fca5a5" : isMonthly ? "#bfdbfe" : "#86efac"}`,
                                                  borderRadius: "999px",
                                                  padding: "2px 10px",
                                                }}
                                              >
                                                {isUnpaid ? "✕" : "✓"}{" "}
                                                {part.trim()}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      );
                                    }
                                    return (
                                      <div
                                        style={{
                                          marginTop: "8px",
                                          display: "flex",
                                          gap: "10px",
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: "12px",
                                            fontWeight: "700",
                                            color: "#15803d",
                                            background: "#f0fdf4",
                                            border: "1px solid #86efac",
                                            borderRadius: "999px",
                                            padding: "2px 10px",
                                          }}
                                        >
                                          ✓ {selectedRequest.paid_days ?? 0} Paid
                                        </span>
                                        <span
                                          style={{
                                            fontSize: "12px",
                                            fontWeight: "700",
                                            color: "#b91c1c",
                                            background: "#fef2f2",
                                            border: "1px solid #fca5a5",
                                            borderRadius: "999px",
                                            padding: "2px 10px",
                                          }}
                                        >
                                          ✕ {selectedRequest.unpaid_days} Unpaid
                                        </span>
                                      </div>
                                    );
                                  })()}

                                {/* Show breakdown for fully-paid Maternity/Paternity */}
                                {selectedRequest.unpaid_days === 0 &&
                                  selectedRequest.alert_message &&
                                  (() => {
                                    const msg = selectedRequest.alert_message;
                                    const isBreakdown =
                                      msg.includes("Paternity") ||
                                      msg.includes("Maternity") ||
                                      msg.includes("Monthly");
                                    return isBreakdown ? (
                                      <div
                                        style={{
                                          marginTop: "8px",
                                          display: "flex",
                                          flexWrap: "wrap",
                                          gap: "6px",
                                        }}
                                      >
                                        {msg.split(" + ").map((part, i) => {
                                          const isUnpaid =
                                            part.includes("Unpaid");
                                          const isMonthly =
                                            part.includes("Monthly");
                                          return (
                                            <span
                                              key={i}
                                              style={{
                                                fontSize: "12px",
                                                fontWeight: "700",
                                                color: isUnpaid
                                                  ? "#b91c1c"
                                                  : isMonthly
                                                    ? "#2563eb"
                                                    : "#15803d",
                                                background: isUnpaid
                                                  ? "#fef2f2"
                                                  : isMonthly
                                                    ? "#eff6ff"
                                                    : "#f0fdf4",
                                                border: `1px solid ${isUnpaid ? "#fca5a5" : isMonthly ? "#bfdbfe" : "#86efac"}`,
                                                borderRadius: "999px",
                                                padding: "2px 10px",
                                              }}
                                            >
                                              {isUnpaid ? "✕" : "✓"} {part.trim()}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    ) : null;
                                  })()}
                              </div>
                            </div>
                          )}

                        <div
                          style={{
                            marginBottom: "16px",
                            display: "flex",
                            gap: "16px",
                            fontSize: "14px",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <strong>Total Days:</strong>{" "}
                            {selectedRequest.total_days ||
                              selectedRequest.leaveDays}
                            {selectedRequest.excluded_days > 0 && (
                              <span
                                style={{
                                  marginLeft: "8px",
                                  fontSize: "12px",
                                  color: "#ea580c",
                                  fontWeight: "600",
                                }}
                              >
                                (−{selectedRequest.excluded_days} excl.)
                              </span>
                            )}
                          </div>
                          <div>
                            <strong>Actual Leave Days:</strong>{" "}
                            <span
                              style={{ color: "#2563eb", fontWeight: "700" }}
                            >
                              {selectedRequest.actual_leave_days}
                            </span>
                          </div>
                          <div>
                            <strong>Payment Type:</strong>{" "}
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                backgroundColor:
                                  selectedRequest.payment_type === "Partly Paid"
                                    ? "#ffe4e6"
                                    : selectedRequest.payment_type === "Unpaid"
                                      ? "#fef2f2"
                                      : "#f0fdf4",
                                color:
                                  selectedRequest.payment_type === "Partly Paid"
                                    ? "#be123c"
                                    : selectedRequest.payment_type === "Unpaid"
                                      ? "#b91c1c"
                                      : "#15803d",
                                border: `1px solid ${selectedRequest.payment_type === "Partly Paid" ? "#fecaca" : selectedRequest.payment_type === "Unpaid" ? "#fecaca" : "#86efac"}`,
                                padding: "3px 10px",
                                borderRadius: "999px",
                                fontSize: "12px",
                                fontWeight: "700",
                              }}
                            >
                              <span
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  background:
                                    selectedRequest.payment_type ===
                                      "Partly Paid"
                                      ? "#e11d48"
                                      : selectedRequest.payment_type ===
                                        "Unpaid"
                                        ? "#ef4444"
                                        : "#22c55e",
                                  display: "inline-block",
                                  flexShrink: 0,
                                }}
                              />
                              {selectedRequest.payment_type || "Paid"}
                            </span>
                          </div>
                        </div>

                        <p className="popup-desc-label">
                          <strong>Description:</strong>
                        </p>
                        <p className="popup-desc-text">
                          {selectedRequest.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeView === "employee-report" && (
              <div className="employee-report-content">
                <div className="section-title">
                  <FaRegChartBar className="profile-title-icon" />
                  <h1>View Employee Report</h1>
                </div>
                {/* ── Top 4 Summary Cards ── */}
                <div className="report-summary-cards">
                  <div className="report-sum-card orange">
                    <div className="report-sum-icon">
                      <FaUsers />
                    </div>
                    <div className="report-sum-info">
                      <span className="report-sum-label">Total Employees</span>
                      <span className="report-sum-value">
                        {reportSummary
                          ? reportSummary.summary.totalEmployees
                          : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="report-sum-card blue">
                    <div className="report-sum-icon">
                      <FaCalendarAlt />
                    </div>
                    <div className="report-sum-info">
                      <span className="report-sum-label">
                        Total Leaves Taken
                      </span>
                      <span className="report-sum-value">
                        {reportSummary
                          ? reportSummary.summary.totalLeavesTaken
                          : "—"}{" "}
                        Days
                      </span>
                    </div>
                  </div>
                  <div className="report-sum-card green">
                    <div className="report-sum-icon">
                      <FaCheckCircle />
                    </div>
                    <div className="report-sum-info">
                      <span className="report-sum-label">Paid Leave Taken</span>
                      <span className="report-sum-value">
                        {reportSummary
                          ? reportSummary.summary.paidLeaveTaken
                          : "—"}{" "}
                        Days
                      </span>
                    </div>
                  </div>
                  <div className="report-sum-card red">
                    <div className="report-sum-icon">
                      <FaExclamationTriangle />
                    </div>
                    <div className="report-sum-info">
                      <span className="report-sum-label">
                        Unpaid Leave Taken
                      </span>
                      <span className="report-sum-value">
                        {reportSummary
                          ? reportSummary.summary.unpaidLeaveTaken
                          : "—"}{" "}
                        Days
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── 2 Chart Cards ── */}
                <div className="report-charts-row">
                  {/* Chart 1: Leave Type Distribution */}
                  <div className="report-chart-card">
                    <div className="report-chart-title">
                      <FaChartPie
                        style={{ color: "#f25c05", marginRight: "8px" }}
                      />
                      Leave Type Distribution
                    </div>
                    {reportSummary &&
                      Object.keys(reportSummary.typeDistribution || {}).length >
                      0 ? (
                      (() => {
                        const originalDist = reportSummary.typeDistribution;
                        const dist = {
                          "Personal Leave": 0,
                          "Medical Leave": 0,
                          "Maternity Leave": 0,
                          "Paternity Leave": 0,
                          ...originalDist,
                        };
                        const total = Object.values(originalDist).reduce(
                          (a, b) => a + b,
                          0,
                        );
                        const TYPE_COLORS = {
                          "Personal Leave": "#f25c05",
                          "Medical Leave": "#4f46e5",
                          "Maternity Leave": "#10b981",
                          "Paternity Leave": "#e11d48",
                        };
                        const entries = Object.entries(dist).sort(
                          (a, b) => b[1] - a[1],
                        );
                        const conicEntries = entries.filter((e) => e[1] > 0);
                        return (
                          <div className="dist-chart-flex">
                            <div className="dist-donut-wrap">
                              <div
                                className="dist-donut"
                                style={{
                                  background:
                                    conicEntries.length > 0
                                      ? `conic-gradient(${conicEntries
                                        .map((e, i) => {
                                          const color =
                                            TYPE_COLORS[e[0]] || "#64748b";
                                          const startPct = conicEntries
                                            .slice(0, i)
                                            .reduce(
                                              (a, ee) =>
                                                a +
                                                (total > 0
                                                  ? (ee[1] / total) * 100
                                                  : 0),
                                              0,
                                            );
                                          const endPct = conicEntries
                                            .slice(0, i + 1)
                                            .reduce(
                                              (a, ee) =>
                                                a +
                                                (total > 0
                                                  ? (ee[1] / total) * 100
                                                  : 0),
                                              0,
                                            );
                                          return `${color} ${startPct}% ${endPct}%`;
                                        })
                                        .join(", ")})`
                                      : "#cbd5e1",
                                }}
                              >
                                <div className="dist-donut-center">
                                  <span className="dist-donut-num">
                                    {total}
                                  </span>
                                  <span className="dist-donut-lbl">Days</span>
                                </div>
                              </div>
                            </div>
                            <div className="dist-legend">
                              {entries.map(([type, days]) => {
                                const pct =
                                  total > 0
                                    ? Math.round((days / total) * 100)
                                    : 0;
                                const color = TYPE_COLORS[type] || "#64748b";
                                return (
                                  <div key={type} className="dist-legend-row">
                                    <span
                                      className="dist-legend-dot"
                                      style={{ backgroundColor: color }}
                                    />
                                    <span className="dist-legend-label">
                                      {type} — {days} days — {pct}%
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="chart-empty-msg">
                        No approved leave data yet.
                      </div>
                    )}
                  </div>

                  {/* Chart 2: Paid vs Unpaid */}
                  <div className="report-chart-card">
                    <div className="report-chart-title">
                      <FaCoins
                        style={{ color: "#f25c05", marginRight: "8px" }}
                      />
                      Paid vs Unpaid Leave
                    </div>
                    {reportSummary ? (
                      (() => {
                        const paid = reportSummary.summary.paidLeaveTaken || 0;
                        const unpaid =
                          reportSummary.summary.unpaidLeaveTaken || 0;
                        const total = paid + unpaid || 1;
                        const paidPct = Math.round((paid / total) * 100);
                        const unpaidPct = 100 - paidPct;
                        return (
                          <div className="pvu-chart-wrap">
                            <div className="pvu-bar-section">
                              <div className="pvu-bar-label-row">
                                <span className="pvu-bar-label paid-lbl">
                                  Paid Leave
                                </span>
                                <span className="pvu-bar-days">
                                  {paid} Days
                                </span>
                              </div>
                              <div className="pvu-bar-track">
                                <div
                                  className="pvu-bar-fill paid-fill"
                                  style={{ width: `${paidPct}%` }}
                                />
                              </div>
                              <div className="pvu-bar-pct">{paidPct}%</div>
                            </div>
                            <div
                              className="pvu-bar-section"
                              style={{ marginTop: "20px" }}
                            >
                              <div className="pvu-bar-label-row">
                                <span className="pvu-bar-label unpaid-lbl">
                                  Unpaid Leave
                                </span>
                                <span className="pvu-bar-days">
                                  {unpaid} Days
                                </span>
                              </div>
                              <div className="pvu-bar-track">
                                <div
                                  className="pvu-bar-fill unpaid-fill"
                                  style={{ width: `${unpaidPct}%` }}
                                />
                              </div>
                              <div className="pvu-bar-pct">{unpaidPct}%</div>
                            </div>
                            <div className="pvu-total-row">
                              <span>Total Approved Leave Days</span>
                              <strong>{paid + unpaid}</strong>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="chart-empty-msg">Loading data...</div>
                    )}
                  </div>
                </div>

                {/* ── Filters Bar ── */}
                <div className="report-filters-bar">
                  <div className="filter-search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search Employee"
                      value={reportSearchQuery}
                      onChange={(e) => setReportSearchQuery(e.target.value)}
                      className="report-search-input"
                    />
                  </div>

                  <div className="filter-select-field-wrapper">
                    <FaFolder className="field-icon" />
                    <select
                      value={reportLeaveTypeFilter}
                      onChange={(e) => setReportLeaveTypeFilter(e.target.value)}
                      className="report-select-input"
                    >
                      <option value="">Filter by Leave Type</option>
                      <option value="Personal Leave">Personal Leave</option>
                      <option value="Medical Leave">Medical Leave</option>
                      <option value="Maternity Leave">Maternity Leave</option>
                      <option value="Paternity Leave">Paternity Leave</option>
                    </select>
                    <FaChevronDown className="select-chevron" />
                  </div>

                  <div className="filter-select-field-wrapper">
                    <FaCalendarAlt
                      className="field-icon"
                      style={{ color: "#f25c05" }}
                    />
                    <select
                      value={reportSelectedMonth}
                      onChange={handleMonthChange}
                      className="report-select-input"
                    >
                      <option value="">All Months</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                    <FaChevronDown className="select-chevron" />
                  </div>
                </div>

                {/* ── Employee Table ── */}
                <div className="report-table-section">
                  {reportLoading ? (
                    <div className="report-loading-msg">
                      Loading employee data...
                    </div>
                  ) : (
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>Employee Name</th>
                          <th>Employee ID</th>
                          <th>Total Entitlement</th>
                          <th>Leaves Taken (Paid)</th>
                          <th>Remaining Balance</th>
                          <th>Leaves Taken (Unpaid)</th>
                          <th>History</th>
                          <th>Report</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportLoading ? (
                          <tr className="manager-loading-row">
                            <td colSpan="8">
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "32px 0",
                                  color: "#ea580c",
                                  fontWeight: "600",
                                }}
                              >
                                <svg
                                  width="36"
                                  height="36"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#ea580c"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M12 6v6l4 2" />
                                </svg>
                                <span>Loading employee data...</span>
                              </div>
                            </td>
                          </tr>
                        ) : filteredEmployees.length === 0 ? (
                          <tr className="manager-empty-row">
                            <td colSpan="8">
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: "12px",
                                  padding: "48px 0",
                                  color: "#94a3b8",
                                }}
                              >
                                <svg
                                  width="52"
                                  height="52"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#cbd5e1"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                                </svg>
                                <div
                                  style={{
                                    fontWeight: "700",
                                    fontSize: "15px",
                                    color: "#64748b",
                                  }}
                                >
                                  No employee report data found
                                </div>
                                <div
                                  style={{ fontSize: "13px", color: "#94a3b8" }}
                                >
                                  Search for an employee or check if data is
                                  available.
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredEmployees.map((emp) => {
                            const initials = (emp.name || "?")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase();
                            const bgColors = [
                              "#ff5722",
                              "#4f46e5",
                              "#0d9488",
                              "#e11d48",
                              "#7c3aed",
                              "#2563eb",
                            ];
                            const charSum = (emp.name || "")
                              .split("")
                              .reduce((acc, c) => acc + c.charCodeAt(0), 0);
                            const initialsBg =
                              bgColors[charSum % bgColors.length];
                            return (
                              <tr key={emp.id} className="report-row">
                                <td>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                    }}
                                  >
                                    <div
                                      className="emp-initials-badge"
                                      style={{ backgroundColor: initialsBg }}
                                    >
                                      {initials}
                                    </div>
                                    <div>
                                      <div
                                        style={{
                                          fontWeight: "600",
                                          color: "#1e293b",
                                        }}
                                      >
                                        {emp.name}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: "11px",
                                          color: "#64748b",
                                        }}
                                      >
                                        {emp.department}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className="emp-id-chip">
                                    {emp.employee_id}
                                  </span>
                                </td>
                                <td>
                                  <span className="entitlement-badge">
                                    {emp.totalEntitlement} Days
                                  </span>
                                </td>
                                <td>
                                  <span
                                    style={{
                                      fontWeight: "700",
                                      color: "#10b981",
                                    }}
                                  >
                                    {emp.paidLeavesTaken} Days
                                  </span>
                                </td>
                                <td>
                                  <span
                                    style={{
                                      fontWeight: "700",
                                      color:
                                        emp.remainingBalance <= 5
                                          ? "#ef4444"
                                          : "#f25c05",
                                    }}
                                  >
                                    {emp.remainingBalance} Days
                                  </span>
                                </td>
                                <td>
                                  <span
                                    style={{
                                      fontWeight: "700",
                                      color:
                                        emp.unpaidLeavesTaken > 0
                                          ? "#ef4444"
                                          : "#64748b",
                                    }}
                                  >
                                    {emp.unpaidLeavesTaken} Days
                                  </span>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="report-action-btn history-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setHistoryEmpData(emp);
                                      setActiveView("employee-leave-history");
                                    }}
                                  >
                                    <FaHistory />
                                    View History
                                  </button>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="report-action-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEmpReport(emp);
                                      handleViewReport(emp.id);
                                      setActiveView("employee-leave-report");
                                    }}
                                  >
                                    <FaRegChartBar />
                                    View Report
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Old showHistoryModal popup removed */}

                {/* Old View Report Modal Removed */}
              </div>
            )}
            {activeView === "employee-leave-report" && selectedEmpReport && (
              <div className="employee-report-content">
                <div className="section-title">
                  <FaRegChartBar className="profile-title-icon" />
                  <div>
                    <h1>Employee Leave Report — {selectedEmpReport.name}</h1>
                    <p className="profile-subtitle">
                      Detailed leave report for {selectedEmpReport.name}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "24px",
                    flexWrap: "wrap",
                    gap: "16px"
                  }}
                >
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => {
                      setSelectedEmpReport(null);
                      setReportEmpData(null);
                      setActiveView("employee-report");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 20px",
                      background: "var(--bg-card, #ffffff)",
                      border: "1.5px solid var(--border-color, #cbd5e1)",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      color: "var(--text-main, #334155)"
                    }}
                  >
                    <FaArrowLeft /> Back to Report
                  </button>

                  <button
                    type="button"
                    className="report-download-btn"
                    onClick={handleDownloadPDF}
                    disabled={reportEmpDataLoading || !reportEmpData}
                    title="Download as PDF"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 20px",
                      background: "linear-gradient(135deg, #f25c05, #ff7e33)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    <FaFilePdf />
                    {reportEmpDataLoading ? "Loading..." : "Download Report"}
                  </button>
                </div>

                <div
                  className="profile-hero-card"
                  style={{
                    marginBottom: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    padding: "20px",
                    background: "var(--bg-card, #ffffff)",
                    borderRadius: "16px",
                    border: "1.5px solid var(--border-color, #e2e8f0)"
                  }}
                >
                  <div
                    className="popup-employee-initials"
                    style={{
                      backgroundColor: "#f25c05",
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontSize: "20px",
                      fontWeight: "700"
                    }}
                  >
                    {(selectedEmpReport.name || "?")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="popup-employee-info" style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: "18px", color: "var(--text-main, #1e293b)" }}>{selectedEmpReport.name}</h3>
                    <span className="popup-employee-id" style={{ fontSize: "14px", color: "var(--text-muted, #64748b)" }}>
                      Employee ID: <strong>{selectedEmpReport.employee_id}</strong> — {selectedEmpReport.department}
                    </span>
                    {(reportEmpData?.employee?.designation || selectedEmpReport.designation) && (
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#f25c05",
                          fontWeight: "600",
                          display: "block",
                          marginTop: "2px"
                        }}
                      >
                        {reportEmpData?.employee?.designation || selectedEmpReport.designation}
                      </span>
                    )}
                  </div>
                </div>

                {/* 4 Summary Cards */}
                <div className="report-modal-stats-grid" style={{ marginBottom: "24px" }}>
                  <div className="modal-stat-card entitlement-card">
                    <span className="modal-stat-label">Total Entitlement</span>
                    <span className="modal-stat-value">
                      {reportEmpData
                        ? reportEmpData.employee.totalEntitlement
                        : selectedEmpReport.totalEntitlement}{" "}
                      Days
                    </span>
                  </div>
                  <div className="modal-stat-card used-card">
                    <span className="modal-stat-label">Paid Leave Used</span>
                    <span className="modal-stat-value">
                      {reportEmpData
                        ? reportEmpData.employee.paidLeavesTaken
                        : selectedEmpReport.paidLeavesTaken}{" "}
                      Days
                    </span>
                  </div>
                  <div className="modal-stat-card remaining-card">
                    <span className="modal-stat-label">Remaining Balance</span>
                    <span className="modal-stat-value">
                      {reportEmpData
                        ? reportEmpData.employee.remainingBalance
                        : selectedEmpReport.remainingBalance}{" "}
                      Days
                    </span>
                  </div>
                  <div
                    className="modal-stat-card attendance-card"
                    style={{ borderLeft: "4px solid #ef4444" }}
                  >
                    <span className="modal-stat-label">Unpaid Leave Used</span>
                    <span className="modal-stat-value" style={{ color: "#ef4444" }}>
                      {reportEmpData
                        ? reportEmpData.employee.unpaidLeavesTaken
                        : selectedEmpReport.unpaidLeavesTaken}{" "}
                      Days
                    </span>
                  </div>
                </div>

                {/* Breakdown and History Row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "24px",
                    marginBottom: "24px",
                    alignItems: "stretch"
                  }}
                >
                  {/* Left: Leave Type Breakdown */}
                  <div
                    style={{
                      background: "var(--bg-card, #ffffff)",
                      borderRadius: "16px",
                      border: "1.5px solid var(--border-color, #e2e8f0)",
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      flexGrow: 1
                    }}
                  >
                    {reportEmpData &&
                      (() => {
                        const total = Object.values(
                          reportEmpData.leaveTypeUsage || {},
                        ).reduce((a, b) => a + b, 0);
                        if (total === 0) {
                          return (
                            <div className="leave-breakdown-section" style={{ border: "none", background: "none", padding: 0, margin: 0, height: "100%", display: "flex", flexDirection: "column" }}>
                              <h5 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>Leave Type Breakdown</h5>
                              <div className="empty-chart-message" style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                No approved leaves recorded yet.
                              </div>
                            </div>
                          );
                        }
                        const dist = {
                          "Personal Leave": 0,
                          "Medical Leave": 0,
                          "Maternity Leave": 0,
                          "Paternity Leave": 0,
                          ...(reportEmpData.leaveTypeUsage || {}),
                        };
                        const TYPE_COLORS = {
                          "Personal Leave": "#f25c05",
                          "Medical Leave": "#4f46e5",
                          "Maternity Leave": "#10b981",
                          "Paternity Leave": "#e11d48",
                        };
                        const entries = Object.entries(dist);
                        const conicEntries = entries.filter(
                          (e) => e[1] > 0,
                        );
                        return (
                          <div className="leave-breakdown-section" style={{ border: "none", background: "none", padding: 0, margin: 0, height: "100%", display: "flex", flexDirection: "column" }}>
                            <h5 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>Leave Type Breakdown</h5>
                            <div className="breakdown-chart-flex" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "32px", flexGrow: 1, padding: "10px 0" }}>
                              <div className="donut-chart-container" style={{ flexShrink: 0 }}>
                                <div
                                  className="donut-chart"
                                  style={{
                                    width: "185px",
                                    height: "185px",
                                    borderRadius: "50%",
                                    position: "relative",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
                                    background:
                                      conicEntries.length > 0
                                        ? `conic-gradient(${conicEntries
                                          .map((e, i) => {
                                            const color =
                                              TYPE_COLORS[e[0]] ||
                                              "#64748b";
                                            const startPct = conicEntries
                                              .slice(0, i)
                                              .reduce(
                                                (a, ee) =>
                                                  a +
                                                  (total > 0
                                                    ? (ee[1] / total) *
                                                    100
                                                    : 0),
                                                0,
                                              );
                                            const endPct = conicEntries
                                              .slice(0, i + 1)
                                              .reduce(
                                                (a, ee) =>
                                                  a +
                                                  (total > 0
                                                    ? (ee[1] / total) *
                                                    100
                                                    : 0),
                                                0,
                                              );
                                            return `${color} ${startPct}% ${endPct}%`;
                                          })
                                          .join(", ")})`
                                        : "#cbd5e1",
                                  }}
                                >
                                  <div className="donut-center" style={{ width: "130px", height: "130px", borderRadius: "50%", background: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.06)" }}>
                                    <span className="donut-number" style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a" }}>
                                      {total}
                                    </span>
                                    <span className="donut-label" style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                      Days
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="donut-chart-legend" style={{ display: "flex", flexDirection: "column", gap: "12px", flexGrow: 1, minWidth: "160px" }}>
                                {entries.map(([type, days]) => {
                                  const pct =
                                    total > 0
                                      ? Math.round((days / total) * 100)
                                      : 0;
                                  const color =
                                    TYPE_COLORS[type] || "#64748b";
                                  return (
                                    <div key={type} className="legend-row" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                                      <span
                                        className="legend-indicator"
                                        style={{ backgroundColor: color, width: "11px", height: "11px", borderRadius: "50%", flexShrink: 0 }}
                                      />
                                      <span className="legend-label" style={{ fontSize: "13.5px", fontWeight: "700", color: "#334155" }}>
                                        {type} — {days} days — {pct}%
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                  </div>

                  {/* Right: Recent Leave History */}
                  <div
                    style={{
                      background: "var(--bg-card, #ffffff)",
                      borderRadius: "16px",
                      border: "1.5px solid var(--border-color, #e2e8f0)",
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      flexGrow: 1
                    }}
                  >
                    {reportEmpData && (
                      <div className="modal-history-section" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                        <h5 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>Recent Leave History</h5>
                        <div className="modal-history-list" style={{ maxHeight: "300px", overflowY: "auto", flexGrow: 1 }}>
                          {(reportEmpData.history || []).length === 0 ? (
                            <p className="empty-history-text" style={{ margin: "auto", textAlign: "center", color: "#94a3b8" }}>
                              No leave history records found.
                            </p>
                          ) : (
                            reportEmpData.history.map((hist, idx) => (
                              <div
                                key={hist.id || idx}
                                className="history-list-item"
                                style={{
                                  padding: "12px",
                                  borderBottom: "1px solid var(--border-color, #e2e8f0)",
                                  marginBottom: "8px",
                                }}
                              >
                                <div
                                  className="item-meta"
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "6px",
                                  }}
                                >
                                  <span className="history-item-dates" style={{ fontWeight: "600", fontSize: "13px" }}>
                                    {formatDateNicely(hist.start_date)} — {formatDateNicely(hist.end_date)}
                                  </span>
                                  <span className="history-item-type" style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "12px", backgroundColor: "#f1f5f9", color: "#475569", fontWeight: "600" }}>
                                    {hist.leave_type}
                                  </span>
                                </div>
                                <div className="item-status-reason" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <span
                                    className={`status-badge-pill ${(hist.status || "").toLowerCase()}`}
                                  >
                                    {hist.status}
                                  </span>
                                  <p className="history-item-reason" style={{ margin: 0, fontSize: "12px", color: "#475569" }}>
                                    {hist.reason || "—"}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeView === "employee-leave-history" && historyEmpData && (
              <div className="employee-report-content">
                <div className="section-title">
                  <FaHistory className="profile-title-icon" />
                  <div>
                    <h1>Leave History — {historyEmpData.name}</h1>
                    <p className="profile-subtitle">
                      Detailed leave record for {historyEmpData.name}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "24px",
                    flexWrap: "wrap",
                    gap: "16px"
                  }}
                >
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setActiveView("employee-report")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 20px",
                      background: "var(--bg-card, #ffffff)",
                      border: "1.5px solid var(--border-color, #cbd5e1)",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      color: "var(--text-main, #334155)"
                    }}
                  >
                    <FaArrowLeft /> Back to Report
                  </button>
                </div>

                <div
                  className="profile-hero-card"
                  style={{
                    marginBottom: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    padding: "20px",
                    background: "var(--bg-card, #ffffff)",
                    borderRadius: "16px",
                    border: "1.5px solid var(--border-color, #e2e8f0)"
                  }}
                >
                  <div
                    className="popup-employee-initials"
                    style={{
                      backgroundColor: "#f25c05",
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontSize: "20px",
                      fontWeight: "700"
                    }}
                  >
                    {(historyEmpData.name || "?")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="popup-employee-info" style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: "18px", color: "var(--text-main, #1e293b)" }}>{historyEmpData.name}</h3>
                    <span className="popup-employee-id" style={{ fontSize: "14px", color: "var(--text-muted, #64748b)" }}>
                      Employee ID: <strong>{historyEmpData.employee_id}</strong> — {historyEmpData.department}
                    </span>
                    {historyEmpData.designation && (
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#f25c05",
                          fontWeight: "600",
                          display: "block",
                          marginTop: "2px"
                        }}
                      >
                        {historyEmpData.designation}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="report-table-card"
                  style={{
                    background: "var(--bg-card, #ffffff)",
                    borderRadius: "16px",
                    border: "1.5px solid var(--border-color, #e2e8f0)",
                    overflow: "hidden",
                    padding: "20px"
                  }}
                >
                  <EmployeeLeaveHistoryList empId={historyEmpData.id} />
                </div>
              </div>
            )}



            {activeView === "holiday-calendar" && (
              <div className="holiday-calendar-content">
                {/* Header section consistent with other pages */}
                <div className="section-title">
                  <FaCalendarAlt className="profile-title-icon" />
                  <div>
                    <h1>Holiday Calendar</h1>
                    <p className="profile-subtitle">
                      Manage company holidays and schedule
                    </p>
                  </div>
                </div>

                {/* Top actions/controls row */}
                <div
                  className="calendar-controls-row"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div className="calendar-nav-wrapper">
                    <button
                      type="button"
                      onClick={() => {
                        if (calMonth === 0) {
                          setCalMonth(11);
                          setCalYear(calYear - 1);
                        } else {
                          setCalMonth(calMonth - 1);
                        }
                      }}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        color: "#475569",
                      }}
                      aria-label="Previous month"
                    >
                      <FaArrowLeft />
                    </button>
                    <span
                      style={{
                        fontWeight: "700",
                        color: "#1e293b",
                        minWidth: "130px",
                        textAlign: "center",
                        fontSize: "16px",
                      }}
                    >
                      {
                        [
                          "January",
                          "February",
                          "March",
                          "April",
                          "May",
                          "June",
                          "July",
                          "August",
                          "September",
                          "October",
                          "November",
                          "December",
                        ][calMonth]
                      }{" "}
                      {calYear}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (calMonth === 11) {
                          setCalMonth(0);
                          setCalYear(calYear + 1);
                        } else {
                          setCalMonth(calMonth + 1);
                        }
                      }}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        color: "#475569",
                      }}
                      aria-label="Next month"
                    >
                      <FaArrowRight />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="add-holiday-btn"
                    onClick={() => {
                      setAddError("");
                      setShowAddModal(true);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "linear-gradient(135deg, #f25c05, #ff7e33)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 20px",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(242, 92, 5, 0.2)",
                    }}
                  >
                    <FaPlus /> Add Holiday
                  </button>
                </div>

                {/* Main content grid: Calendar + Details card */}
                <div
                  className="calendar-main-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr clamp(300px, 25vw, 360px)",
                    gap: "24px",
                  }}
                >
                  {/* Left side: Calendar container */}
                  <div className="calendar-card">
                    <div
                      className="calendar-legend-bar"
                      style={{
                        display: "flex",
                        gap: "16px",
                        marginBottom: "20px",
                        flexWrap: "wrap",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: "#3b82f6",
                          }}
                        />
                        <span style={{ color: "#475569" }}>Public Holiday</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: "#eab308",
                          }}
                        />
                        <span style={{ color: "#475569" }}>Festival</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: "#ec4899",
                          }}
                        />
                        <span style={{ color: "#475569" }}>
                          Company Holiday
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: "#ea580c",
                          }}
                        />
                        <span style={{ color: "#475569" }}>
                          Sunday / Weekly Off
                        </span>
                      </div>
                    </div>

                    <div
                      className="manager-calendar-grid"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "10px",
                      }}
                    >
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                          <div
                            key={day}
                            style={{
                              textAlign: "center",
                              fontWeight: "800",
                              color: "#475569",
                              fontSize: "14px",
                              paddingBottom: "10px",
                              borderBottom: "2px solid #f1f5f9",
                            }}
                          >
                            {day}
                          </div>
                        ),
                      )}
                      {(() => {
                        const firstDayIdx = new Date(
                          calYear,
                          calMonth,
                          1,
                        ).getDay();
                        const totalDaysCount = new Date(
                          calYear,
                          calMonth + 1,
                          0,
                        ).getDate();
                        const prevMonthDaysCount = new Date(
                          calYear,
                          calMonth,
                          0,
                        ).getDate();

                        const dayCells = [];
                        // Prev month trailing days
                        for (let i = firstDayIdx - 1; i >= 0; i--) {
                          dayCells.push({
                            dayNum: prevMonthDaysCount - i,
                            isCurr: false,
                            dateObj: new Date(
                              calYear,
                              calMonth - 1,
                              prevMonthDaysCount - i,
                            ),
                          });
                        }
                        // Current month days
                        for (let i = 1; i <= totalDaysCount; i++) {
                          dayCells.push({
                            dayNum: i,
                            isCurr: true,
                            dateObj: new Date(calYear, calMonth, i),
                          });
                        }
                        const remaining =
                          dayCells.length % 7 === 0
                            ? 0
                            : 7 - (dayCells.length % 7);
                        for (let i = 1; i <= remaining; i++) {
                          dayCells.push({
                            dayNum: i,
                            isCurr: false,
                            dateObj: new Date(calYear, calMonth + 1, i),
                          });
                        }

                        return dayCells.map((cell, idx) => {
                          const cellDateStr =
                            cell.dateObj.getFullYear() +
                            "-" +
                            String(cell.dateObj.getMonth() + 1).padStart(
                              2,
                              "0",
                            ) +
                            "-" +
                            String(cell.dateObj.getDate()).padStart(2, "0");
                          const dayHoliday = holidaysList.find(
                            (h) => h.holiday_date === cellDateStr,
                          );
                          const isSelected =
                            selectedHoliday &&
                            selectedHoliday.holiday_date === cellDateStr;
                          const isToday =
                            cell.dateObj.toDateString() ===
                            new Date().toDateString();
                          const isSunday = cell.dateObj.getDay() === 0;

                          let cellBg = "#ffffff";
                          let dotColors = [];
                          let textColor = "#1e293b";

                          // Determine standard holiday style:
                          let holidayBg = null;
                          let holidayDotColor = null;
                          let holidayTextColor = null;

                          if (dayHoliday) {
                            if (dayHoliday.holiday_type === "Public Holiday") {
                              holidayBg = "#eff6ff";
                              holidayDotColor = "#3b82f6";
                              holidayTextColor = "#1d4ed8";
                            } else if (dayHoliday.holiday_type === "Festival") {
                              holidayBg = "#fef9c3";
                              holidayDotColor = "#eab308";
                              holidayTextColor = "#a16207";
                            } else if (
                              dayHoliday.holiday_type === "Company Holiday"
                            ) {
                              holidayBg = "#fdf2f8";
                              holidayDotColor = "#ec4899";
                              holidayTextColor = "#be185d";
                            }
                          }

                          // Determine final cellBg, dotColors, textColor
                          if (isSunday) {
                            dotColors.push("#ea580c"); // Sunday / Weekly Off indicator (Orange)
                            if (holidayBg) {
                              // Show both by using linear gradient
                              cellBg = `linear-gradient(135deg, #fff7ed 50%, ${holidayBg} 50%)`;
                              textColor = holidayTextColor;
                              dotColors.push(holidayDotColor);
                            } else {
                              cellBg = "#fff7ed"; // Highlight Sunday in orange
                              textColor = "#c2410c";
                            }
                          } else if (dayHoliday) {
                            cellBg = holidayBg;
                            textColor = holidayTextColor;
                            dotColors.push(holidayDotColor);
                          } else if (!cell.isCurr) {
                            cellBg = "#f8fafc";
                            textColor = "#94a3b8";
                          }

                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                if (isSunday) {
                                  if (dayHoliday) {
                                    setSelectedHoliday({
                                      ...dayHoliday,
                                      isSunday: true,
                                    });
                                  } else {
                                    setSelectedHoliday({
                                      holiday_name: "Weekly Off",
                                      holiday_type: "Sunday Holiday",
                                      holiday_date: cellDateStr,
                                      description:
                                        "Sundays are company weekly holidays.",
                                      isSunday: true,
                                    });
                                  }
                                } else if (dayHoliday) {
                                  setSelectedHoliday(dayHoliday);
                                } else {
                                  setSelectedHoliday({
                                    holiday_name: "No Holiday Scheduled",
                                    holiday_date: cellDateStr,
                                    holiday_type: null,
                                    description:
                                      "This is a regular working day.",
                                  });
                                }
                              }}
                              style={{
                                position: "relative",
                                height: "64px",
                                border: isSelected
                                  ? "2.5px solid #f25c05"
                                  : isToday
                                    ? "2px solid #3b82f6"
                                    : "1px solid #e2e8f0",
                                borderRadius: "12px",
                                padding: "8px 10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                background: cellBg,
                                opacity: cell.isCurr ? 1 : 0.5,
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                transform: isSelected ? "scale(1.02)" : "none",
                                boxShadow: isSelected
                                  ? "0 4px 12px rgba(242, 92, 5, 0.12)"
                                  : "none",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  width: "100%",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "15px",
                                    fontWeight: "800",
                                    color: textColor,
                                  }}
                                >
                                  {cell.dayNum}
                                </span>
                                {dotColors.length > 0 && (
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "3px",
                                      alignItems: "center",
                                    }}
                                  >
                                    {dotColors.map((color, i) => (
                                      <span
                                        key={i}
                                        style={{
                                          display: "inline-block",
                                          width: "7px",
                                          height: "7px",
                                          borderRadius: "50%",
                                          backgroundColor: color,
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                              {isSunday && cell.isCurr && (
                                <span
                                  style={{
                                    fontSize: "9px",
                                    fontWeight: "800",
                                    color: dayHoliday ? "#ea580c" : "#c2410c",
                                    marginTop: "auto",
                                    alignSelf: "flex-start",
                                  }}
                                >
                                  Weekly Off
                                </span>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Monthly Holiday List */}
                  {(() => {
                    const MONTH_NAMES = [
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ];
                    const monthHolidays = holidaysList.filter((h) => {
                      if (!h.holiday_date) return false;
                      const parts = h.holiday_date.split("-");
                      if (parts.length < 2) return false;
                      const hYear = parseInt(parts[0], 10);
                      const hMonth = parseInt(parts[1], 10) - 1;
                      return hYear === calYear && hMonth === calMonth;
                    });
                    return (
                      <div className="monthly-holidays-card">
                        <h4>
                          Holidays in {MONTH_NAMES[calMonth]} {calYear}
                        </h4>
                        {holidaysLoading ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "10px",
                              padding: "24px 0",
                              color: "#ea580c",
                              fontWeight: "600",
                              fontSize: "13px",
                            }}
                          >
                            <svg
                              width="28"
                              height="28"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#ea580c"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </svg>
                            Loading holidays...
                          </div>
                        ) : monthHolidays.length === 0 ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "10px",
                              padding: "24px 0",
                              color: "#94a3b8",
                            }}
                          >
                            <svg
                              width="36"
                              height="36"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#cbd5e1"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="3"
                                y="4"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                              <line x1="9" y1="15" x2="15" y2="15" />
                            </svg>
                            <div
                              style={{
                                fontWeight: "700",
                                fontSize: "13px",
                                color: "#64748b",
                              }}
                            >
                              No holidays this month
                            </div>
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                              Add holidays using the form below.
                            </div>
                          </div>
                        ) : (
                          <ul
                            style={{
                              margin: 0,
                              padding: 0,
                              listStyle: "none",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            {monthHolidays.map((h) => (
                              <li
                                key={h.id || h.holiday_date}
                                className="holiday-list-item"
                              >
                                <span
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: "700",
                                    color: "#ea580c",
                                    minWidth: "72px",
                                  }}
                                >
                                  {formatDateNicely(h.holiday_date)}
                                </span>
                                <span
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    color: "#1e293b",
                                  }}
                                  className="holiday-name-text"
                                >
                                  {h.holiday_name}
                                </span>
                                <span className="holiday-type-badge">
                                  {h.holiday_type}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })()}

                  {/* Right side: Selected day/holiday details */}
                  <div className="details-card">
                    <h3
                      style={{
                        margin: "0 0 16px",
                        fontSize: "16px",
                        fontWeight: "800",
                        color: "#0f172a",
                        borderBottom: "1px solid #f1f5f9",
                        paddingBottom: "12px",
                      }}
                    >
                      Selected Date Details
                    </h3>

                    {selectedHoliday ? (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "14px",
                            flexWrap: "wrap",
                          }}
                        >
                          {selectedHoliday.holiday_type &&
                            selectedHoliday.holiday_type !==
                            "Sunday Holiday" && (
                              <span
                                className={`detail-type-badge detail-type-badge--${selectedHoliday.holiday_type ===
                                    "Public Holiday"
                                    ? "public"
                                    : selectedHoliday.holiday_type ===
                                      "Festival"
                                      ? "festival"
                                      : selectedHoliday.holiday_type ===
                                        "Company Holiday"
                                        ? "company"
                                        : "default"
                                  }`}
                              >
                                {selectedHoliday.holiday_type}
                              </span>
                            )}

                          {selectedHoliday.isSunday && (
                            <span className="detail-type-badge detail-type-badge--sunday">
                              Sunday Holiday
                            </span>
                          )}

                          {!selectedHoliday.holiday_type &&
                            !selectedHoliday.isSunday && (
                              <span className="detail-type-badge detail-type-badge--working">
                                Working Day
                              </span>
                            )}
                        </div>

                        <h4 className="detail-holiday-title">
                          {selectedHoliday.holiday_name}
                          {selectedHoliday.isSunday &&
                            selectedHoliday.holiday_type &&
                            selectedHoliday.holiday_type !==
                            "Sunday Holiday" && (
                              <span className="detail-weekly-off-tag">
                                (Weekly Off)
                              </span>
                            )}
                        </h4>

                        <p className="detail-holiday-date">
                          📅{" "}
                          {(() => {
                            const parts =
                              selectedHoliday.holiday_date.split("-");
                            if (parts.length === 3) {
                              const d = new Date(
                                parseInt(parts[0], 10),
                                parseInt(parts[1], 10) - 1,
                                parseInt(parts[2], 10),
                              );
                              return d.toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              });
                            }
                            return selectedHoliday.holiday_date;
                          })()}
                        </p>

                        <p className="selected-holiday-desc">
                          {selectedHoliday.description ||
                            "No description provided."}
                          {selectedHoliday.isSunday &&
                            selectedHoliday.holiday_type &&
                            selectedHoliday.holiday_type !==
                            "Sunday Holiday" && (
                              <span className="sunday-note-text">
                                Note: Sundays are company weekly holidays.
                              </span>
                            )}
                        </p>

                        {/* Delete button only for manager-added holidays, i.e., ID > 20 */}
                        {selectedHoliday.id && selectedHoliday.id > 20 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteHoliday(selectedHoliday.id)
                            }
                            className="delete-holiday-btn"
                          >
                            Delete Holiday
                          </button>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "40px 0",
                          color: "#94a3b8",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{ fontSize: "36px", marginBottom: "12px" }}
                        >
                          📅
                        </span>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: "600",
                          }}
                        >
                          Click on any day in the calendar to view its holiday
                          details.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Holiday Popup Modal */}
                {showAddModal && (
                  <div className="modal-overlay">
                    <div className="add-holiday-modal-body">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "20px",
                          borderBottom: "1px solid #f1f5f9",
                          paddingBottom: "12px",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "20px",
                            fontWeight: "800",
                            color: "#0f172a",
                          }}
                        >
                          ➕ Add Holiday
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            fontSize: "18px",
                            color: "#64748b",
                          }}
                        >
                          <FaTimes />
                        </button>
                      </div>

                      <form
                        onSubmit={handleAddHolidaySubmit}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                        }}
                      >
                        {addError && (
                          <div
                            style={{
                              padding: "10px 14px",
                              borderRadius: "8px",
                              backgroundColor: "#fef2f2",
                              border: "1px solid #fecaca",
                              color: "#ef4444",
                              fontSize: "13px",
                              fontWeight: "600",
                            }}
                          >
                            ⚠️ {addError}
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          <label
                            htmlFor="holiday-name"
                            style={{
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#475569",
                            }}
                          >
                            Holiday Name *
                          </label>
                          <input
                            id="holiday-name"
                            type="text"
                            required
                            placeholder="e.g. New Year's Day"
                            value={addHolidayForm.name}
                            onChange={(e) =>
                              setAddHolidayForm({
                                ...addHolidayForm,
                                name: e.target.value,
                              })
                            }
                            style={{
                              padding: "10px 14px",
                              borderRadius: "8px",
                              border: "1.5px solid #cbd5e1",
                              outline: "none",
                              fontFamily: "inherit",
                              fontSize: "14px",
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          <label
                            htmlFor="holiday-date"
                            style={{
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#475569",
                            }}
                          >
                            Holiday Date *
                          </label>
                          <input
                            id="holiday-date"
                            type="date"
                            required
                            value={addHolidayForm.date}
                            onChange={(e) =>
                              setAddHolidayForm({
                                ...addHolidayForm,
                                date: e.target.value,
                              })
                            }
                            style={{
                              padding: "10px 14px",
                              borderRadius: "8px",
                              border: "1.5px solid #cbd5e1",
                              outline: "none",
                              fontFamily: "inherit",
                              fontSize: "14px",
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          <label
                            htmlFor="holiday-type"
                            style={{
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#475569",
                            }}
                          >
                            Holiday Type *
                          </label>
                          <select
                            id="holiday-type"
                            value={addHolidayForm.type}
                            onChange={(e) =>
                              setAddHolidayForm({
                                ...addHolidayForm,
                                type: e.target.value,
                              })
                            }
                            className="modal-form-select"
                          >
                            <option value="Public Holiday">
                              Public Holiday
                            </option>
                            <option value="Festival">Festival</option>
                            <option value="Company Holiday">
                              Company Holiday
                            </option>
                          </select>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          <label
                            htmlFor="holiday-desc"
                            style={{
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#475569",
                            }}
                          >
                            Description
                          </label>
                          <textarea
                            id="holiday-desc"
                            placeholder="Optional details about this holiday..."
                            value={addHolidayForm.description}
                            onChange={(e) =>
                              setAddHolidayForm({
                                ...addHolidayForm,
                                description: e.target.value,
                              })
                            }
                            style={{
                              padding: "10px 14px",
                              borderRadius: "8px",
                              border: "1.5px solid #cbd5e1",
                              outline: "none",
                              fontFamily: "inherit",
                              fontSize: "14px",
                              minHeight: "80px",
                              resize: "vertical",
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            marginTop: "10px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="modal-cancel-btn"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            style={{
                              flex: 1,
                              padding: "12px",
                              borderRadius: "10px",
                              border: "none",
                              background:
                                "linear-gradient(135deg, #f25c05, #ff7e33)",
                              color: "#ffffff",
                              fontWeight: "700",
                              fontSize: "14px",
                              cursor: "pointer",
                              boxShadow: "0 4px 12px rgba(242, 92, 5, 0.2)",
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="logout-modal-overlay"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="logout-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="logout-modal-icon-wrap">
              <FaSignOutAlt className="logout-modal-icon" />
            </div>
            <h2 className="logout-modal-title">Logout</h2>
            <p className="logout-modal-desc">
              Are you sure you want to logout from the system?
            </p>
            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-cancel-btn"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="logout-confirm-btn"
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Holiday Confirmation Modal */}
      {deleteHolidayConfirmation.show && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-card confirm-modal-card--orange">
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon confirm-modal-icon--orange">
                <FaExclamationTriangle />
              </div>
              <h3 className="confirm-modal-title">Delete Holiday</h3>
            </div>
            <p className="confirm-modal-body">
              Are you sure you want to delete this holiday?
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() =>
                  setDeleteHolidayConfirmation({ show: false, holidayId: null })
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-modal-confirm-btn confirm-modal-confirm-btn--orange"
                onClick={async () => {
                  const holidayId = deleteHolidayConfirmation.holidayId;
                  setDeleteHolidayConfirmation({
                    show: false,
                    holidayId: null,
                  });
                  try {
                    const response = await fetch(
                      `${API_BASE_URL}/api/holidays/${holidayId}`,
                      {
                        method: "DELETE",
                      },
                    );
                    const data = await response.json();
                    if (data.success) {
                      showToast("Holiday deleted successfully", "success");
                      setSelectedHoliday(null);
                      await fetchHolidays();
                    } else {
                      showToast(
                        data.message || "Failed to delete holiday.",
                        "error",
                      );
                    }
                  } catch (err) {
                    console.error(err);
                    showToast(
                      "Something went wrong. Backend connection failed.",
                      "error",
                    );
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className={`manager-toast-container ${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === "success"
                ? "✓"
                : toast.type === "error"
                  ? "✗"
                  : "ℹ"}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        </div>
      )}
      {/* Approve Leave Confirmation Modal */}
      {approveConfirmation.show && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-card confirm-modal-card--green">
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon confirm-modal-icon--green">
                ✓
              </div>
              <h3 className="confirm-modal-title">Approve Leave Request</h3>
            </div>
            <p className="confirm-modal-body">
              Are you sure you want to <strong>approve</strong> the leave
              request for <strong>{approveConfirmation.requestName}</strong>?
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() =>
                  setApproveConfirmation({
                    show: false,
                    dbId: null,
                    requestName: "",
                  })
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-modal-confirm-btn confirm-modal-confirm-btn--green"
                onClick={() => {
                  const dbId = approveConfirmation.dbId;
                  setApproveConfirmation({
                    show: false,
                    dbId: null,
                    requestName: "",
                  });
                  handleApproveRequest(dbId);
                }}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Leave Confirmation Modal */}
      {rejectConfirmation.show && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-card confirm-modal-card--red">
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon confirm-modal-icon--red">
                ✗
              </div>
              <h3 className="confirm-modal-title">Reject Leave Request</h3>
            </div>
            <p className="confirm-modal-body">
              Are you sure you want to <strong>reject</strong> the leave request
              for <strong>{rejectConfirmation.requestName}</strong>? This action
              cannot be undone.
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() =>
                  setRejectConfirmation({
                    show: false,
                    dbId: null,
                    requestName: "",
                  })
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-modal-confirm-btn confirm-modal-confirm-btn--red"
                onClick={() => {
                  const dbId = rejectConfirmation.dbId;
                  setRejectConfirmation({
                    show: false,
                    dbId: null,
                    requestName: "",
                  });
                  handleRejectRequest(dbId);
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {photoPreview && (
        <div className="profile-preview-modal-overlay">
          <div className="profile-preview-modal-card">
            <div className="profile-preview-modal-header">
              <h3>Preview Photo</h3>
            </div>
            <div className="profile-preview-modal-body">
              <div className="profile-preview-avatar-container">
                <img
                  src={photoPreview}
                  alt="Profile Preview"
                  className="profile-preview-avatar"
                />
              </div>
            </div>
            <div className="profile-preview-modal-actions">
              <button
                type="button"
                className="preview-cancel-btn"
                onClick={() => {
                  setPhotoPreview(null);
                  setPendingPhotoFile(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="preview-upload-btn"
                onClick={handleUploadConfirm}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ManagerDashboard;
