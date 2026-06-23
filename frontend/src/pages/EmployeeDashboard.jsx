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

function ProfileView({ profileData, tempProfileData, isEditing, onEdit, onSave, onCancel, onChange }) {
  return (
    <div className="profile-content">
      <div className="section-title">
        <FaRegUser />
        <h1>My Profile</h1>
      </div>

      <div className="profile-hero">
        <EmployeeAvatar large />
        <div className="hero-details">
          <div className="employee-name">
            {isEditing ? (
              <input
                type="text"
                className="edit-name-input"
                value={tempProfileData.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="Enter name"
              />
            ) : (
              <h2>{profileData.name}</h2>
            )}
            <span className="role-badge">{profileData.designation}</span>
          </div>
          <div className="employee-meta">
            <span>
              <FaRegCalendarAlt />
              Employee ID: {profileData.employeeId}
            </span>
            <span>
              <FaBuilding />
              {isEditing ? (
                <input
                  type="text"
                  className="edit-meta-input"
                  value={tempProfileData.department}
                  onChange={(e) => onChange("department", e.target.value)}
                  placeholder="Enter department"
                />
              ) : (
                `${profileData.department} Department`
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="info-grid">
        {/* Email */}
        <div className="info-card">
          <FaEnvelope />
          <div className="card-body">
            <strong>Email</strong>
            {isEditing ? (
              <input
                type="email"
                className="edit-card-input"
                value={tempProfileData.email}
                onChange={(e) => onChange("email", e.target.value)}
              />
            ) : (
              <span>{profileData.email}</span>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="info-card">
          <FaPhoneAlt />
          <div className="card-body">
            <strong>Phone</strong>
            {isEditing ? (
              <input
                type="text"
                className="edit-card-input"
                value={tempProfileData.phone}
                onChange={(e) => onChange("phone", e.target.value)}
              />
            ) : (
              <span>{profileData.phone}</span>
            )}
          </div>
        </div>

        {/* Joining Date */}
        <div className="info-card">
          <FaRegCalendarAlt />
          <div className="card-body">
            <strong>Joining Date</strong>
            {isEditing ? (
              <input
                type="text"
                className="edit-card-input"
                value={tempProfileData.joiningDate}
                onChange={(e) => onChange("joiningDate", e.target.value)}
              />
            ) : (
              <span>{profileData.joiningDate}</span>
            )}
          </div>
        </div>

        {/* Department */}
        <div className="info-card">
          <FaRegBuilding />
          <div className="card-body">
            <strong>Department</strong>
            {isEditing ? (
              <input
                type="text"
                className="edit-card-input"
                value={tempProfileData.department}
                onChange={(e) => onChange("department", e.target.value)}
              />
            ) : (
              <span>{profileData.department}</span>
            )}
          </div>
        </div>

        {/* Designation */}
        <div className="info-card">
          <FaSuitcase />
          <div className="card-body">
            <strong>Designation</strong>
            {isEditing ? (
              <input
                type="text"
                className="edit-card-input"
                value={tempProfileData.designation}
                onChange={(e) => onChange("designation", e.target.value)}
              />
            ) : (
              <span>{profileData.designation}</span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="action-buttons-container">
        {isEditing ? (
          <div className="edit-actions-group">
            <button className="save-profile-btn" type="button" onClick={onSave}>
              Save Changes
            </button>
            <button className="cancel-edit-btn" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="edit-profile" type="button" onClick={onEdit}>
            <FaPencilAlt />
            Edit Profile
          </button>
        )}
      </div>
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
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "Srija S",
    employeeId: "EMP001",
    department: "IT",
    email: "srija@gmail.com",
    phone: "9876543210",
    joiningDate: "01-06-2025",
    designation: "Software Engineer",
  });

  const [tempProfileData, setTempProfileData] = useState({ ...profileData });

  const handleEditClick = () => {
    setTempProfileData({ ...profileData });
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setProfileData({ ...tempProfileData });
    setIsEditing(false);
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

  return (
    <main className="employee-dashboard">
      <div className="dashboard-shell">
        <aside className="sidebar" aria-label="Employee dashboard navigation">
          <div className="brand">
            <BrandIcon />
            <div className="brand-text">
              <span className="brand-title-main">Employee</span>
              <span className="brand-title-sub">Dashboard</span>
            </div>
          </div>

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
          {activeView === "profile" && (
            <ProfileView
              profileData={profileData}
              tempProfileData={tempProfileData}
              isEditing={isEditing}
              onEdit={handleEditClick}
              onSave={handleSaveClick}
              onCancel={handleCancelClick}
              onChange={handleChange}
            />
          )}
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
