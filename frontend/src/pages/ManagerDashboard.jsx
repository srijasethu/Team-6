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
  FaSearch,
  FaCoins,
  FaChartPie,
  FaFolder,
  FaHistory,
  FaChevronDown,
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Employee Report states
  const [reportSearchQuery, setReportSearchQuery] = useState("");
  const [reportDateFilter, setReportDateFilter] = useState("");
  const [reportLeaveTypeFilter, setReportLeaveTypeFilter] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState(""); // "", "Pending", "Approved", "Rejected"
  const [reportSelectedEmpId, setReportSelectedEmpId] = useState("EMP045"); // Highlight Aarav Patel by default
  const [showDetailedHistory, setShowDetailedHistory] = useState(false);

  // Active Take Action Modal Request
  const [activeRequestModal, setActiveRequestModal] = useState(null);

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
      leaveType: "Casual Leave",
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
      leaveType: "Sick Leave",
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
      leaveType: "Vacation Leave",
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
      leaveType: "Casual Leave",
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

  // Mock employee summary data
  const [employeesData, setEmployeesData] = useState([
    {
      id: "EMP045",
      name: "Aarav Patel",
      department: "Sales Dept",
      totalEntitlement: 20,
      usedLeaves: 12,
      remainingBalance: 8,
      attendance: "95%",
      photo: aaravPatelAvatar,
    },
    {
      id: "EMP021",
      name: "Sarah Raman",
      department: "HR Dept",
      totalEntitlement: 20,
      usedLeaves: 10,
      remainingBalance: 10,
      attendance: "97%",
      photo: sarahRamanAvatar,
    },
    {
      id: "EMP088",
      name: "Rina Sharma",
      department: "IT Dept",
      totalEntitlement: 20,
      usedLeaves: 5,
      remainingBalance: 15,
      attendance: "99%",
      photo: rinaSharmaAvatar,
    },
    {
      id: "EMP101",
      name: "David Chen",
      department: "R&D Dept",
      totalEntitlement: 20,
      usedLeaves: 7,
      remainingBalance: 13,
      attendance: "96%",
      photo: null,
    },
    {
      id: "EMP115",
      name: "Kenji Tanaka",
      department: "Marketing",
      totalEntitlement: 20,
      usedLeaves: 17,
      remainingBalance: 3,
      attendance: "90%",
      photo: null,
    },
    {
      id: "EMP073",
      name: "Sarah Pamest",
      department: "Sales Dept",
      totalEntitlement: 20,
      usedLeaves: 6,
      remainingBalance: 14,
      attendance: "98%",
      photo: sarahPamestAvatar,
    },
  ]);

  // Mock detailed leave history database
  const [leaveHistoryData, setLeaveHistoryData] = useState([
    {
      id: "LH001",
      employeeId: "EMP045",
      name: "Aarav Patel",
      department: "Sales Dept",
      type: "Sick Leave",
      dates: "Oct 15 - Oct 17, 2026",
      days: 3,
      status: "Pending",
      reason: "Medical checkup and dentist appointment.",
      photo: aaravPatelAvatar,
    },
    {
      id: "LH002",
      employeeId: "EMP021",
      name: "Sarah Raman",
      department: "HR Dept",
      type: "Casual Leave",
      dates: "Oct 15 - Oct 17, 2026",
      days: 3,
      status: "Pending",
      reason: "Going to my hometown for family gathering.",
      photo: sarahRamanAvatar,
    },
    {
      id: "LH003",
      employeeId: "EMP088",
      name: "Rina Sharma",
      department: "IT Dept",
      type: "Vacation Leave",
      dates: "Oct 15 - Oct 17, 2026",
      days: 3,
      status: "Pending",
      reason: "Annual vacation trip with family. Will be available on phone if needed.",
      photo: rinaSharmaAvatar,
    },
    {
      id: "LH004",
      employeeId: "EMP101",
      name: "David Chen",
      department: "R&D Dept",
      type: "Sick Leave",
      dates: "Sep 20 - Sep 21, 2026",
      days: 2,
      status: "Approved",
      reason: "Medical checkup and dentist appointment.",
      photo: null,
    },
    {
      id: "LH005",
      employeeId: "EMP115",
      name: "Kenji Tanaka",
      department: "Marketing",
      type: "Casual Leave",
      dates: "Sep 15 - Sep 18, 2026",
      days: 4,
      status: "Rejected",
      reason: "Urgent project delivery requirement.",
      photo: null,
    },
    {
      id: "LH006",
      employeeId: "EMP073",
      name: "Sarah Pamest",
      department: "Sales Dept",
      type: "Sick Leave",
      dates: "Oct 15 - Oct 17, 2026",
      days: 3,
      status: "Pending",
      reason: "Doctor's appointment for checking fever.",
      photo: sarahPamestAvatar,
    },
    {
      id: "LH007",
      employeeId: "EMP045",
      name: "Aarav Patel",
      department: "Sales Dept",
      type: "Casual Leave",
      dates: "Sep 01 - Sep 03, 2026",
      days: 3,
      status: "Approved",
      reason: "Family event trip.",
      photo: aaravPatelAvatar,
    },
  ]);

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

  // Filter employee summaries
  const filteredEmployees = employeesData.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(reportSearchQuery.toLowerCase());

    const matchesLeaveType = reportLeaveTypeFilter
      ? leaveHistoryData.some((h) => h.employeeId === emp.id && h.type === reportLeaveTypeFilter)
      : true;

    const matchesStatus = reportStatusFilter
      ? leaveHistoryData.some((h) => h.employeeId === emp.id && h.status === reportStatusFilter)
      : true;

    return matchesSearch && matchesLeaveType && matchesStatus;
  });

  // Filter detailed history log
  const filteredHistory = leaveHistoryData.filter((hist) => {
    const matchesSearch =
      hist.name.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
      hist.employeeId.toLowerCase().includes(reportSearchQuery.toLowerCase());

    const matchesLeaveType = reportLeaveTypeFilter
      ? hist.type === reportLeaveTypeFilter
      : true;

    const matchesStatus = reportStatusFilter
      ? hist.status === reportStatusFilter
      : true;

    return matchesSearch && matchesLeaveType && matchesStatus;
  });

  // Filter leave requests list
  const filteredRequests = requestsList.filter((req) => {
    const matchesSearch =
      req.name.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(reportSearchQuery.toLowerCase());

    const matchesLeaveType = reportLeaveTypeFilter
      ? req.leaveType === reportLeaveTypeFilter
      : true;

    const matchesStatus = reportStatusFilter
      ? req.status === reportStatusFilter
      : true;

    return matchesSearch && matchesLeaveType && matchesStatus;
  });

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
              onClick={() => {
                setActiveView("employee-report");
                setReportStatusFilter("");
                setReportSearchQuery("");
                setReportLeaveTypeFilter("");
                setReportDateFilter("");
                setShowDetailedHistory(false);
              }}
            >
              <FaRegChartBar />
              <span>View Employee Report</span>
            </button>
          </nav>
          
          <span className="sidebar-dot-grid" />
          
          <button className="logout logout-red" type="button" onClick={() => setShowLogoutModal(true)}>
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
            <div className="employee-report-content">
              <div className="section-title">
                <FaRegChartBar className="profile-title-icon" />
                <h1>View Employee Report</h1>
              </div>

              {/* Stats Cards */}
              <div className="report-stats-grid">
                {/* Card 1: Aggregate Team Balance */}
                <div className="report-stats-card team-balance">
                  <div className="report-card-header orange-bg">
                    <FaCoins />
                    <span>Aggregate Team Balance</span>
                  </div>
                  <div className="report-card-body">
                    <div className="report-card-icon-wrap orange-tint">
                      <FaCoins />
                    </div>
                    <div className="report-card-text">
                      <span className="report-card-num">1,420</span>
                      <span className="report-card-unit">Days</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Leave Type Breakdown */}
                <div className="report-stats-card type-breakdown">
                  <div className="report-card-header yellow-bg">
                    <FaChartPie />
                    <span>Leave Type Breakdown</span>
                  </div>
                  <div className="report-card-body flex-row">
                    <div className="pie-chart-visual" />
                    <div className="pie-chart-legend">
                      <div className="legend-item">
                        <span className="legend-dot sick" />
                        <span>Sick (25%)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot casual" />
                        <span>Casual (35%)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot annual" />
                        <span>Annual (40%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Top Departmental Usage */}
                <div className="report-stats-card dept-usage">
                  <div className="report-card-header green-bg">
                    <FaRegChartBar />
                    <span>Top Departmental Usage</span>
                  </div>
                  <div className="report-card-body flex-row">
                    <div className="report-card-icon-wrap green-tint">
                      <FaRegChartBar />
                    </div>
                    <div className="dept-stats-list">
                      <div className="dept-stat-row">
                        <span className="dept-name">Sales</span>
                        <span className="dept-value">(35 days avg)</span>
                      </div>
                      <div className="dept-stat-row">
                        <span className="dept-name">R&D</span>
                        <span className="dept-value">(28 days avg)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 4: High Balance Alerts */}
                <div className="report-stats-card balance-alerts">
                  <div className="report-card-header red-bg">
                    <FaExclamationTriangle />
                    <span>High Balance Alerts</span>
                  </div>
                  <div className="report-card-body">
                    <div className="report-card-icon-wrap red-tint">
                      <FaExclamationTriangle />
                    </div>
                    <div className="report-card-text">
                      <span className="report-card-num">18</span>
                      <span className="report-card-unit">Employees</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="report-filters-bar">
                {/* Search */}
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

                {/* Date Filter */}
                <div className="filter-input-field-wrapper">
                  <FaRegCalendarAlt className="field-icon" />
                  <input
                    type="text"
                    placeholder="Filter by Date"
                    value={reportDateFilter}
                    onChange={(e) => setReportDateFilter(e.target.value)}
                    className="report-text-input"
                  />
                </div>

                {/* Leave Type Filter */}
                <div className="filter-select-field-wrapper">
                  <FaFolder className="field-icon" />
                  <select
                    value={reportLeaveTypeFilter}
                    onChange={(e) => setReportLeaveTypeFilter(e.target.value)}
                    className="report-select-input"
                  >
                    <option value="">Filter by Leave Type</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Vacation Leave">Vacation Leave</option>
                  </select>
                  <FaChevronDown className="select-chevron" />
                </div>

                {/* Status Pills */}
                <div className="filter-status-group">
                  <span className="status-label">Status</span>
                  <button
                    type="button"
                    className={`status-pill pending ${reportStatusFilter === "Pending" ? "active" : ""}`}
                    onClick={() => setReportStatusFilter(prev => prev === "Pending" ? "" : "Pending")}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    className={`status-pill approved ${reportStatusFilter === "Approved" ? "active" : ""}`}
                    onClick={() => setReportStatusFilter(prev => prev === "Approved" ? "" : "Approved")}
                  >
                    Approved
                  </button>
                  <button
                    type="button"
                    className={`status-pill rejected ${reportStatusFilter === "Rejected" ? "active" : ""}`}
                    onClick={() => setReportStatusFilter(prev => prev === "Rejected" ? "" : "Rejected")}
                  >
                    Rejected
                  </button>
                </div>

                {/* Leave History Button */}
                <button
                  type="button"
                  className={`toggle-history-btn ${showDetailedHistory ? "active" : ""}`}
                  onClick={() => setShowDetailedHistory(!showDetailedHistory)}
                >
                  <FaHistory />
                  <span>Leave History</span>
                </button>
              </div>

              {/* Data Table */}
              <div className="report-table-section">
                {reportStatusFilter === "" && !showDetailedHistory ? (
                  // Summary Table (Mockup 1)
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Employee Name</th>
                        <th>Department</th>
                        <th>Total Entitlement</th>
                        <th>Used Leaves</th>
                        <th>Remaining Balance</th>
                        <th>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="empty-table-message">
                            No employees match current filters.
                          </td>
                        </tr>
                      ) : (
                        filteredEmployees.map((emp) => {
                          const isSelected = reportSelectedEmpId === emp.id;
                          const bgColors = ["#ff5722", "#4f46e5", "#0d9488", "#e11d48", "#7c3aed", "#2563eb"];
                          const charSum = emp.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                          const initialsBg = bgColors[charSum % bgColors.length];
                          const initials = emp.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("");

                          return (
                            <tr
                              key={emp.id}
                              className={`report-row ${isSelected ? "selected-active-row" : ""}`}
                              onClick={() => setReportSelectedEmpId(emp.id)}
                            >
                              <td>
                                <div className="employee-info-cell">
                                  {emp.photo ? (
                                    <img
                                      src={emp.photo}
                                      alt={emp.name}
                                      className="employee-photo-circle"
                                    />
                                  ) : (
                                    <div
                                      className="employee-initials-circle"
                                      style={{ backgroundColor: initialsBg }}
                                    >
                                      {initials}
                                    </div>
                                  )}
                                  <div className="employee-name-id">
                                    <span className="employee-name-label">{emp.name}</span>
                                    <span className="employee-id-label">{emp.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td>{emp.department}</td>
                              <td>{emp.totalEntitlement} days</td>
                              <td>{emp.usedLeaves} days</td>
                              <td>{emp.remainingBalance} days</td>
                              <td>
                                <span className="attendance-percentage">{emp.attendance}</span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                ) : (
                  // Leave Requests Table (Mockup 2 & 3)
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Employee Name</th>
                        <th>Employee ID</th>
                        <th>Leave Type</th>
                        <th>Leave Dates</th>
                        <th>Remaining Balance</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="empty-table-message">
                            No leave requests found.
                          </td>
                        </tr>
                      ) : (
                        filteredRequests.map((req) => {
                          const bgColors = ["#ff5722", "#4f46e5", "#0d9488", "#e11d48", "#7c3aed", "#2563eb"];
                          const charSum = req.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                          const initialsBg = bgColors[charSum % bgColors.length];
                          const initials = req.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("");

                          return (
                            <tr key={req.id} className="report-row">
                              <td>
                                <div className="employee-info-cell">
                                  {req.photo ? (
                                    <img
                                      src={req.photo}
                                      alt={req.name}
                                      className="employee-photo-circle"
                                    />
                                  ) : (
                                    <div
                                      className="employee-initials-circle"
                                      style={{ backgroundColor: initialsBg }}
                                    >
                                      {initials}
                                    </div>
                                  )}
                                  <span className="employee-name-label">{req.name}</span>
                                </div>
                              </td>
                              <td>
                                <span className="employee-id-badge">{req.id}</span>
                              </td>
                              <td>{req.leaveType}</td>
                              <td>{req.leaveDates}</td>
                              <td>{req.remainingBalance}</td>
                              <td>
                                <span className={`status-badge-pill ${req.status.toLowerCase()}`}>
                                  {req.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="take-action-btn"
                                  onClick={() => setActiveRequestModal(req)}
                                >
                                  Take Action
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

              {/* Dynamic Action Modals */}
              {activeRequestModal && (
                <div className="popup-overlay" onClick={() => setActiveRequestModal(null)}>
                  <div className="details-popup-card action-modal-card" onClick={(e) => e.stopPropagation()}>
                    <div className="popup-card-header">
                      <h3>
                        {activeRequestModal.status === "Pending"
                          ? "Take Action"
                          : "Leave Request Details"}
                      </h3>
                      <button
                        className="close-popup-btn"
                        type="button"
                        onClick={() => setActiveRequestModal(null)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="popup-card-body">
                      {/* Avatar & Name */}
                      <div className="popup-employee-header">
                        {activeRequestModal.photo ? (
                          <img
                            src={activeRequestModal.photo}
                            alt={activeRequestModal.name}
                            className="popup-employee-avatar"
                          />
                        ) : (
                          <div className="popup-employee-initials">
                            {activeRequestModal.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                        )}
                        <div className="popup-employee-info">
                          <h4>{activeRequestModal.name}</h4>
                          <span className="popup-employee-id">{activeRequestModal.id}</span>
                        </div>
                      </div>

                      {/* Fields details */}
                      <div className="popup-fields-grid">
                        <div className="popup-field-row">
                          <span className="field-label">Leave Type</span>
                          <span className="field-separator">:</span>
                          <span className="field-value">{activeRequestModal.leaveType}</span>
                        </div>
                        <div className="popup-field-row">
                          <span className="field-label">Leave Dates</span>
                          <span className="field-separator">:</span>
                          <span className="field-value">
                            {activeRequestModal.status === "Rejected"
                              ? "01 Jun - 06 Jun"
                              : activeRequestModal.leaveDates}
                          </span>
                        </div>
                        <div className="popup-field-row">
                          <span className="field-label">Duration</span>
                          <span className="field-separator">:</span>
                          <span className="field-value">{activeRequestModal.duration}</span>
                        </div>
                        <div className="popup-field-row">
                          <span className="field-label">Reason</span>
                          <span className="field-separator">:</span>
                          <span className="field-value">{activeRequestModal.reason}</span>
                        </div>
                        <div className="popup-field-row">
                          <span className="field-label">Current Status</span>
                          <span className="field-separator">:</span>
                          <span className={`status-badge-pill ${activeRequestModal.status.toLowerCase()}`}>
                            {activeRequestModal.status}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="popup-modal-actions">
                        {activeRequestModal.status === "Pending" ? (
                          <>
                            <button
                              type="button"
                              className="modal-reject-action-btn"
                              onClick={() => {
                                setRequestsList((prev) =>
                                  prev.map((r) =>
                                    r.id === activeRequestModal.id
                                      ? { ...r, status: "Rejected" }
                                      : r
                                  )
                                );
                                setActiveRequestModal(null);
                              }}
                            >
                              <FaTimes /> Reject
                            </button>
                            <button
                              type="button"
                              className="modal-approve-action-btn"
                              onClick={() => {
                                setRequestsList((prev) =>
                                  prev.map((r) =>
                                    r.id === activeRequestModal.id
                                      ? { ...r, status: "Approved" }
                                      : r
                                  )
                                );
                                setActiveRequestModal(null);
                              }}
                            >
                              <FaCheck /> Approve
                            </button>
                          </>
                        ) : activeRequestModal.status === "Rejected" ? (
                          <>
                            <button
                              type="button"
                              className="modal-reject-action-btn"
                              onClick={() => setActiveRequestModal(null)}
                            >
                              <FaTimes /> Close
                            </button>
                            <button
                              type="button"
                              className="modal-approve-action-btn"
                              onClick={() => {
                                setRequestsList((prev) =>
                                  prev.map((r) =>
                                    r.id === activeRequestModal.id
                                      ? { ...r, status: "Approved" }
                                      : r
                                  )
                                );
                                setActiveRequestModal(null);
                              }}
                            >
                              <FaCheck /> Approve Leave
                            </button>
                          </>
                        ) : (
                          // Approved
                          <>
                            <button
                              type="button"
                              className="modal-reject-action-btn"
                              onClick={() => {
                                setRequestsList((prev) =>
                                  prev.map((r) =>
                                    r.id === activeRequestModal.id
                                      ? { ...r, status: "Rejected" }
                                      : r
                                  )
                                );
                                setActiveRequestModal(null);
                              }}
                            >
                              <FaTimes /> Reject Leave
                            </button>
                            <button
                              type="button"
                              className="modal-approve-action-btn"
                              onClick={() => setActiveRequestModal(null)}
                            >
                              <FaCheck /> Close
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon-wrap">
              <FaSignOutAlt className="logout-modal-icon" />
            </div>
            <h2 className="logout-modal-title">Logout</h2>
            <p className="logout-modal-desc">Are you sure you want to logout from the system?</p>
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
                onClick={() => { setShowLogoutModal(false); onLogout(); }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ManagerDashboard;
