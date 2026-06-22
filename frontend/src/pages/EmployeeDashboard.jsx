import { useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBuilding,
  FaCalendarAlt,
  FaCheck,
  FaChevronDown,
  FaEnvelope,
  FaFileAlt,
  FaPencilAlt,
  FaPhoneAlt,
  FaPlus,
  FaRegBuilding,
  FaRegCalendarAlt,
  FaRegChartBar,
  FaRegEdit,
  FaRegUser,
  FaSignOutAlt,
  FaSuitcase,
  FaUser,
} from "react-icons/fa";
import "../styles/EmployeeDashboard.css";

const profileDetails = [
  {
    icon: <FaEnvelope />,
    label: "Email",
    value: "srija@gmail.com",
  },
  {
    icon: <FaPhoneAlt />,
    label: "Phone",
    value: "9876543210",
  },
  {
    icon: <FaRegCalendarAlt />,
    label: "Joining Date",
    value: "01-06-2025",
  },
  {
    icon: <FaRegBuilding />,
    label: "Department",
    value: "IT",
  },
  {
    icon: <FaSuitcase />,
    label: "Designation",
    value: "Software Engineer",
  },
];

const leaveRows = [
  ["1", "LV2026/001", "Casual Leave", "22-06-2026\n09:00 AM", "24-06-2026\n05:00 PM", "1", "Family function", "Approved"],
  ["2", "LV2026/002", "Medical Leave", "15-06-2026\n10:00 AM", "16-06-2026\n05:00 PM", "1", "Fever", "Approved"],
  ["3", "LV2026/003", "Casual Leave", "05-06-2026\n09:00 AM", "05-06-2026\n05:00 PM", "0", "Personal work", "Approved"],
  ["4", "LV2026/004", "General Permission", "01-06-2026\n02:00 PM", "01-06-2026\n06:00 PM", "0", "College event", "Rejected"],
  ["5", "LV2026/005", "Medical Leave", "28-05-2026\n09:00 AM", "30-05-2026\n05:00 PM", "2", "Stomach pain", "Approved"],
];

function EmployeeAvatar({ large = false }) {
  return <div className={`avatar${large ? " large" : ""}`} aria-label="Srija S" />;
}

function BrandIcon() {
  return (
    <div className="brand-icon" aria-hidden="true">
      <FaCalendarAlt className="calendar" />
      <FaUser className="user" />
      <span className="check">
        <FaCheck />
      </span>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="profile-content">
      <div className="section-title">
        <FaRegUser />
        <h1>Employee Profile</h1>
      </div>

      <div className="profile-hero">
        <EmployeeAvatar large />
        <div>
          <div className="employee-name">
            <h2>Srija S</h2>
            <span className="role-badge">Software Engineer</span>
          </div>
          <div className="employee-meta">
            <span>
              <FaRegCalendarAlt />
              Employee ID: EMP001
            </span>
            <span>
              <FaBuilding />
              IT Department
            </span>
          </div>
        </div>
      </div>

      <div className="info-grid">
        {profileDetails.map((detail) => (
          <div className="info-card" key={detail.label}>
            {detail.icon}
            <div>
              <strong>{detail.label}</strong>
              <span>{detail.value}</span>
            </div>
          </div>
        ))}
      </div>

      <button className="edit-profile" type="button">
        <FaPencilAlt />
        Edit Profile
      </button>
    </div>
  );
}

function LeaveHistoryView() {
  return (
    <div className="leave-content">
      <div className="leave-top">
        <div className="section-title leave-title">
          <FaRegCalendarAlt />
          <h1>Leave History</h1>
        </div>
        <div className="leave-actions">
          <button className="new-leave-btn" type="button">
            <FaPlus />
            New Leave
          </button>
          <div className="leave-filters">
            <select aria-label="Filter leave status" defaultValue="all">
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select aria-label="Select date range" defaultValue="range">
              <option value="range">Select Date Range</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="leave-table-wrap">
        <table className="leave-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Application No</th>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Call Count</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leaveRows.map((row) => (
              <tr key={row[1]}>
                {row.slice(0, 7).map((cell, index) => (
                  <td key={`${row[1]}-${index}`}>
                    {String(cell)
                      .split("\n")
                      .map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                  </td>
                ))}
                <td>
                  <span className={`status-pill ${row[7].toLowerCase()}`}>{row[7]}</span>
                </td>
                <td>
                  <button className="details-btn" type="button">
                    <FaFileAlt />
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="pagination">
          <button type="button" aria-label="Previous page">
            <FaArrowLeft />
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button className={page === 1 ? "active" : ""} type="button" key={page}>
              {page}
            </button>
          ))}
          <button type="button" aria-label="Next page">
            <FaArrowRight />
          </button>
        </div>
        <div className="page-size">
          {[10, 25, 50, 100].map((size) => (
            <button className={size === 10 ? "active" : ""} type="button" key={size}>
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogoutView({ onCancel, onConfirm }) {
  return (
    <div className="logout-page">
      <div className="logout-card">
        <div className="logout-icon">
          <FaSignOutAlt />
        </div>
        <h1>Logout</h1>
        <p>Are you sure you want to logout from the system?</p>
        <div className="logout-actions">
          <button className="cancel-btn" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-logout-btn" type="button" onClick={onConfirm}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function EmployeeDashboard({ onLogout }) {
  const [activeView, setActiveView] = useState("profile");

  return (
    <main className="employee-dashboard">
      <header className="dashboard-header">
        <div className="brand">
          <BrandIcon />
          <span>
            Employee
            <br />
            Dashboard
          </span>
        </div>

        <div className="user-menu">
          <EmployeeAvatar />
          <div className="user-copy">
            <strong>Srija S</strong>
            <span>EMP001</span>
          </div>
          <FaChevronDown className="chevron" />
        </div>
      </header>

      <div className="dashboard-shell">
        <aside className="sidebar" aria-label="Employee dashboard navigation">
          <nav className="nav-list">
            <button
              className={`nav-item ${activeView === "profile" || activeView === "logout" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveView("profile")}
            >
              <FaRegUser />
              <span>My Profile</span>
            </button>
            <button
              className={`nav-item ${activeView === "leave" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveView("leave")}
            >
              <FaRegEdit />
              <span>Apply Leave</span>
            </button>
            <button className="nav-item" type="button">
              <FaRegChartBar />
              <span>Leave Summary</span>
            </button>
          </nav>
          <span className="sidebar-dot-grid" />
          <button className="logout" type="button" onClick={() => setActiveView("logout")}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </aside>

        <section className="profile-panel">
          {activeView === "profile" && <ProfileView />}
          {activeView === "leave" && <LeaveHistoryView />}
          {activeView === "logout" && (
            <LogoutView onCancel={() => setActiveView("profile")} onConfirm={onLogout} />
          )}
        </section>
      </div>
    </main>
  );
}

export default EmployeeDashboard;
