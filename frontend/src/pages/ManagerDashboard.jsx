import { useState } from "react";
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
} from "react-icons/fa";
import arunKumarAvatar from "../assets/arun_kumar.png";
import aaravPatelAvatar from "../assets/aarav_patel.png";
import sarahRamanAvatar from "../assets/sarah_raman.png";
import rinaSharmaAvatar from "../assets/rina_sharma.png";
import sarahPamestAvatar from "../assets/sarah_pamest.png";
import "../styles/ManagerDashboard.css";

function ManagerDashboard({ onLogout }) {
  const [activeView, setActiveView] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "Arun Kumar",
    managerId: "MGR001",
    department: "Human Resources",
    email: "arun.kumar@company.com",
    phone: "9876543210",
    joiningDate: "01-01-2022",
    designation: "HR Manager",
    teamSize: "15 Employees",
    officeLocation: "Chennai, India",
  });

  const [tempProfileData, setTempProfileData] = useState({ ...profileData });

  const [stats, setStats] = useState({
    total: 25,
    pending: 8,
    approved: 12,
    rejected: 5,
  });

  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: "EMP045",
      name: "Aarav Patel",
      type: "Sick Leave",
      dates: "Oct 15 - Oct 17, 2026",
      photo: aaravPatelAvatar,
      description: "Taking leave for my younger sister's wedding in Mumbai. I have already coordinated with Sarah (EMP021) for project handovers. Will be available on email for emergencies."
    },
    {
      id: "EMP021",
      name: "Sarah Raman",
      type: "Casual Leave",
      dates: "Oct 15 - Oct 17, 2026",
      photo: sarahRamanAvatar,
      description: "Going to my hometown for family gathering."
    },
    {
      id: "EMP033",
      name: "Rina Sharma",
      type: "Vacation Leave",
      dates: "Oct 15 - Oct 17, 2026",
      photo: rinaSharmaAvatar,
      description: "Annual vacation trip with family. Will be available on phone if needed."
    },
    {
      id: "EMP048",
      name: "Aarav Patel",
      type: "Sick Leave",
      dates: "Oct 15 - Oct 17, 2026",
      photo: aaravPatelAvatar,
      description: "Medical checkup and dentist appointment."
    },
    {
      id: "EMP073",
      name: "Sarah Pamest",
      type: "Sick Leave",
      dates: "Oct 15 - Oct 17, 2026",
      photo: sarahPamestAvatar,
      description: "Doctor's appointment for checking fever."
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState(null);

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

  const handleApproveRequest = (id) => {
    setLeaveRequests((prev) => prev.filter((r) => r.id !== id));
    setStats((prev) => ({
      ...prev,
      pending: prev.pending - 1,
      approved: prev.approved + 1,
    }));
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest(null);
    }
  };

  const handleRejectRequest = (id) => {
    setLeaveRequests((prev) => prev.filter((r) => r.id !== id));
    setStats((prev) => ({
      ...prev,
      pending: prev.pending - 1,
      rejected: prev.rejected + 1,
    }));
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest(null);
    }
  };

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
              onClick={() => setActiveView("employee-report")}
            >
              <FaRegChartBar />
              <span>View Employee Report</span>
            </button>
          </nav>
          
          <span className="sidebar-dot-grid" />
          
          <button className="logout" type="button" onClick={onLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </aside>

        <section className="profile-panel">
          {activeView === "profile" && (
            <div className="profile-content">
              <div className="section-title">
                <FaRegUser className="profile-title-icon" />
                <h1>My Profile</h1>
              </div>

              <div className="profile-hero">
                <div className="avatar-wrapper">
                  <img src={arunKumarAvatar} alt="Arun Kumar" className="manager-avatar" />
                </div>
                <div className="hero-details">
                  <div className="manager-name-row">
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-name-input"
                        value={tempProfileData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Enter name"
                      />
                    ) : (
                      <h2>{profileData.name}</h2>
                    )}
                    <span className="role-badge">Manager</span>
                  </div>
                  <div className="manager-meta">
                    <span>
                      <FaRegCalendarAlt />
                      Manager ID: {profileData.managerId}
                    </span>
                    <span>
                      <FaBuilding />
                      {isEditing ? (
                        <input
                          type="text"
                          className="edit-meta-input"
                          value={tempProfileData.department}
                          onChange={(e) => handleChange("department", e.target.value)}
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
                {/* Email card */}
                <div className="info-card">
                  <FaEnvelope />
                  <div className="card-body">
                    <strong>Email</strong>
                    {isEditing ? (
                      <input
                        type="email"
                        value={tempProfileData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="edit-card-input"
                      />
                    ) : (
                      <span>{profileData.email}</span>
                    )}
                  </div>
                </div>

                {/* Phone card */}
                <div className="info-card">
                  <FaPhoneAlt />
                  <div className="card-body">
                    <strong>Phone</strong>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="edit-card-input"
                      />
                    ) : (
                      <span>{profileData.phone}</span>
                    )}
                  </div>
                </div>

                {/* Joining Date card */}
                <div className="info-card">
                  <FaRegCalendarAlt />
                  <div className="card-body">
                    <strong>Joining Date</strong>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData.joiningDate}
                        onChange={(e) => handleChange("joiningDate", e.target.value)}
                        className="edit-card-input"
                      />
                    ) : (
                      <span>{profileData.joiningDate}</span>
                    )}
                  </div>
                </div>

                {/* Department card */}
                <div className="info-card">
                  <FaBuilding />
                  <div className="card-body">
                    <strong>Department</strong>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData.department}
                        onChange={(e) => handleChange("department", e.target.value)}
                        className="edit-card-input"
                      />
                    ) : (
                      <span>{profileData.department}</span>
                    )}
                  </div>
                </div>

                {/* Designation card */}
                <div className="info-card">
                  <FaSuitcase />
                  <div className="card-body">
                    <strong>Designation</strong>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData.designation}
                        onChange={(e) => handleChange("designation", e.target.value)}
                        className="edit-card-input"
                      />
                    ) : (
                      <span>{profileData.designation}</span>
                    )}
                  </div>
                </div>

                {/* Team Size card */}
                <div className="info-card">
                  <FaUsers />
                  <div className="card-body">
                    <strong>Team Size</strong>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData.teamSize}
                        onChange={(e) => handleChange("teamSize", e.target.value)}
                        className="edit-card-input"
                      />
                    ) : (
                      <span>{profileData.teamSize}</span>
                    )}
                  </div>
                </div>

                {/* Office Location card (Full width) */}
                <div className="info-card full-width">
                  <FaMapMarkerAlt />
                  <div className="card-body">
                    <strong>Office Location</strong>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData.officeLocation}
                        onChange={(e) => handleChange("officeLocation", e.target.value)}
                        className="edit-card-input"
                      />
                    ) : (
                      <span>{profileData.officeLocation}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="action-buttons-container">
                {isEditing ? (
                  <div className="edit-actions-group">
                    <button className="save-profile-btn" type="button" onClick={handleSaveClick}>
                      Save Changes
                    </button>
                    <button className="cancel-edit-btn" type="button" onClick={handleCancelClick}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button className="edit-profile-btn" type="button" onClick={handleEditClick}>
                    <FaPencilAlt />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
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
              </div>

              {/* Pending Requests Section */}
              <div className="requests-table-section">
                <table className="requests-table">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Employee ID</th>
                      <th>Leave Type</th>
                      <th>Date Range</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-table-message">
                          No pending leave requests.
                        </td>
                      </tr>
                    ) : (
                      leaveRequests.map((request) => (
                        <tr key={request.id}>
                          {/* Employee Name column */}
                          <td>
                            <div className="employee-info-cell">
                              <img
                                src={request.photo}
                                alt={request.name}
                                className="employee-photo-circle"
                              />
                              <span className="employee-name-label">{request.name}</span>
                            </div>
                          </td>
                          {/* Employee ID column */}
                          <td>
                            <span className="employee-id-badge">{request.id}</span>
                          </td>
                          {/* Leave Type column */}
                          <td>
                            <div className="leave-type-cell">
                              <span className="leave-type-text">{request.type}</span>
                              <button
                                className="info-icon-btn"
                                type="button"
                                onClick={() => setSelectedRequest(request)}
                                aria-label="Show leave description"
                              >
                                <FaInfoCircle />
                              </button>
                            </div>
                          </td>
                          {/* Date Range column */}
                          <td>
                            <span className="date-range-label">{request.dates}</span>
                          </td>
                          {/* Actions column */}
                          <td>
                            <div className="action-buttons-cell">
                              <button
                                className="approve-btn-outlined"
                                type="button"
                                onClick={() => handleApproveRequest(request.id)}
                              >
                                Approve
                              </button>
                              <button
                                className="reject-btn-outlined"
                                type="button"
                                onClick={() => handleRejectRequest(request.id)}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Details Popup Modal */}
              {selectedRequest && (
                <div className="popup-overlay" onClick={() => setSelectedRequest(null)}>
                  <div className="details-popup-card" onClick={(e) => e.stopPropagation()}>
                    <div className="popup-card-header">
                      <h3>{selectedRequest.type} ({selectedRequest.id}) - Leave</h3>
                      <button
                        className="close-popup-btn"
                        type="button"
                        onClick={() => setSelectedRequest(null)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="popup-card-body">
                      <p className="popup-desc-label"><strong>Description:</strong></p>
                      <p className="popup-desc-text">{selectedRequest.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === "employee-report" && (
            <div className="placeholder-view">
              <h2>Employee Reports</h2>
              <p>Performance and metrics of reportees.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default ManagerDashboard;
