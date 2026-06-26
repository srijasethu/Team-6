import { useState, useRef, useEffect } from "react";
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
  FaRegClock,
  FaRegEdit,
  FaRegUser,
  FaSignOutAlt,
  FaSuitcase,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import "../styles/EmployeeDashboard.css";

const leaveRows = [
  [
    "1",
    "LV2026/001",
    "Casual Leave",
    "22-06-2026\n09:00 AM",
    "24-06-2026\n05:00 PM",
    "1",
    "Family function",
    "Approved",
  ],
  [
    "2",
    "LV2026/002",
    "Medical Leave",
    "15-06-2026\n10:00 AM",
    "16-06-2026\n05:00 PM",
    "1",
    "Fever",
    "Approved",
  ],
  [
    "3",
    "LV2026/003",
    "Casual Leave",
    "05-06-2026\n09:00 AM",
    "05-06-2026\n05:00 PM",
    "0",
    "Personal work",
    "Approved",
  ],
  [
    "4",
    "LV2026/004",
    "General Permission",
    "01-06-2026\n02:00 PM",
    "01-06-2026\n06:00 PM",
    "0",
    "College event",
    "Rejected",
  ],
  [
    "5",
    "LV2026/005",
    "Medical Leave",
    "28-05-2026\n09:00 AM",
    "30-05-2026\n05:00 PM",
    "2",
    "Stomach pain",
    "Approved",
  ],
];

function EmployeeAvatar({
  large = false,
  photoUrl = null,
  fileInputRef = null,
  onPhotoChange = null,
  onRemovePhoto = null,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className={`avatar-wrapper${large ? " large" : ""}`} ref={menuRef}>
      <img
        src={photoUrl || "/default-profile.png"}
        alt="Employee Avatar"
        className={`employee-avatar-img${large ? " large" : ""}`}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/default-profile.png";
        }}
      />
      {fileInputRef && onPhotoChange && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            onPhotoChange(e);
            setShowMenu(false);
          }}
        />
      )}
      <button
        type="button"
        className="avatar-edit-btn"
        title="Edit profile photo"
        onClick={() => setShowMenu((prev) => !prev)}
      >
        <FaPencilAlt />
      </button>

      {showMenu && (
        <div className="avatar-menu">
          <button
            type="button"
            className="avatar-menu-item"
            onClick={() => {
              if (fileInputRef && fileInputRef.current) {
                fileInputRef.current.click();
              }
              setShowMenu(false);
            }}
          >
            Change profile photo
          </button>
          <button
            type="button"
            className="avatar-menu-item remove"
            onClick={() => {
              if (onRemovePhoto) {
                onRemovePhoto();
              }
              setShowMenu(false);
            }}
          >
            Remove photo
          </button>
        </div>
      )}
    </div>
  );
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

function ApplyLeaveForm({ onApplyLeave }) {
  const [formData, setFormData] = useState({
    leaveType: "Personal Leave",
    fromDate: "",
    fromTime: "09:00",
    toDate: "",
    toTime: "17:00",
    reason: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const formatDateForMySQL = (date) => {
    if (!date) return null;

    if (date.includes("-")) {
      const parts = date.split("-");
      if (parts[0].length === 4) return date;
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return date;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("User not found. Please login again.");
      return;
    }

    if (!formData.fromDate || !formData.toDate || !formData.reason) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/leave/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: user.id,
          leave_type: formData.leaveType,
          start_date: formatDateForMySQL(formData.fromDate),
          end_date: formatDateForMySQL(formData.toDate),
          reason: formData.reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Leave applied successfully");
        if (onApplyLeave) onApplyLeave();
      } else {
        alert("Leave application failed");
      }
    } catch (error) {
      console.error("Apply leave error:", error);
      alert("Backend connection failed");
    }
  };

  return (
    <div className="leave-content">
      <form className="new-leave-form" onSubmit={handleSubmit}>
        <div className="section-title leave-form-title">
          <FaRegEdit />
          <h1>Apply Leave</h1>
        </div>

        <label className="leave-form-field leave-form-field-wide">
          <span>Leave Type</span>
          <select
            value={formData.leaveType}
            onChange={(e) => handleChange("leaveType", e.target.value)}
          >
            <option>Personal Leave</option>
            <option>Medical Leave</option>
            <option>Vacation Leave</option>
            <option>Maternity Leave</option>
            <option>Paternity Leave</option>
            <option>Marriage Leave</option>
          </select>
        </label>

        <div className="leave-form-grid">
          <label className="leave-form-field">
            <span>From Date</span>
            <input
              type="date"
              value={formData.fromDate}
              onChange={(e) => handleChange("fromDate", e.target.value)}
            />
          </label>
          <label className="leave-form-field">
            <span>From Time</span>
            <input
              type="time"
              value={formData.fromTime}
              onChange={(e) => handleChange("fromTime", e.target.value)}
            />
          </label>
          <label className="leave-form-field">
            <span>To Date</span>
            <input
              type="date"
              value={formData.toDate}
              onChange={(e) => handleChange("toDate", e.target.value)}
            />
          </label>
          <label className="leave-form-field">
            <span>To Time</span>
            <input
              type="time"
              value={formData.toTime}
              onChange={(e) => handleChange("toTime", e.target.value)}
            />
          </label>
        </div>

        <label className="leave-form-field leave-form-field-wide">
          <span>Reason</span>
          <textarea
            value={formData.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            placeholder="Enter reason for leave..."
          />
        </label>

        <button className="apply-leave-submit" type="submit">
          <FaPlus />
          Apply Leave
        </button>
      </form>
    </div>
  );
}

function ProfileView({
  profileData,
  tempProfileData,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onChange,
  profilePhoto,
  profilePhotoInputRef,
  handleProfilePhotoChange,
  handleProfilePhotoRemove,
}) {
  return (
    <div className="profile-content">
      <div className="section-title">
        <FaRegUser />
        <h1>My Profile</h1>
      </div>

      <div className="profile-hero">
        <EmployeeAvatar
          large
          photoUrl={profilePhoto}
          fileInputRef={profilePhotoInputRef}
          onPhotoChange={handleProfilePhotoChange}
          onRemovePhoto={handleProfilePhotoRemove}
        />
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
            <button
              className="cancel-edit-btn"
              type="button"
              onClick={onCancel}
            >
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

function LeaveSummaryView() {
  const [summary, setSummary] = useState({
    approved: 0,
    rejected: 0,
    pending: 0,
    totalTaken: 0,
    remaining: 36,
  });

  useEffect(() => {
    fetchLeaveSummary();
  }, []);

  const fetchLeaveSummary = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/leave/history/${user.id}`
      );

      const data = await response.json();

      if (data.success) {
        const leaves = data.leaves;

        const approved = leaves.filter(
          (leave) => leave.status.toLowerCase() === "approved"
        ).length;

        const rejected = leaves.filter(
          (leave) => leave.status.toLowerCase() === "rejected"
        ).length;

        const pending = leaves.filter(
          (leave) => leave.status.toLowerCase() === "pending"
        ).length;

        setSummary({
          approved,
          rejected,
          pending,
          totalTaken: approved,
          remaining: 36 - approved,
        });
      }
    } catch (error) {
      console.error("Fetch leave summary error:", error);
    }
  };

  return (
    <div className="leave-content">
      <div className="leave-summary-header">
        <h1>Leave Summary</h1>
        <p>Overview of your leave balance and requests</p>
      </div>

      <div className="leave-summary">
        <div className="summary-cards">
          <div className="card">
            <div className="card-head">
              <div className="card-icon">
                <FaRegCalendarAlt />
              </div>
              <strong>Total Allowed</strong>
            </div>
            <div className="value">36 Days</div>
            <div className="muted">Annual leave allocation</div>
          </div>
          <div className="card">
            <div className="card-head">
              <div className="card-icon orange">
                <FaCheck />
              </div>
              <strong>Leaves Taken</strong>
            </div>
            <div className="value">{summary.totalTaken} Days</div>
            <div className="muted">Already used</div>
          </div>
          <div className="card">
            <div className="card-head">
              <div className="card-icon green">
                <FaRegChartBar />
              </div>
              <strong>Remaining</strong>
            </div>
            <div className="value">{summary.remaining} Days</div>
            <div className="muted">Available balance</div>
          </div>
          <div className="card">
            <div className="card-head">
              <div className="card-icon purple">
                <FaRegCalendarAlt />
              </div>
              <strong>Pending Requests</strong>
            </div>
            <div className="value">{summary.pending}</div>
            <div className="muted">Awaiting approval</div>
          </div>
        </div>

        <div className="summary-list">
          <div className="summary-item">
            <div className="left">
              <div className="icon-wrap approved">
                <FaCheck />
              </div>
              <div className="labels">
                <strong>Approved Requests</strong>
              </div>
            </div>
            <div className="right">
              <div className="count">{summary.approved}</div>
              <span className="badge approved">Approved</span>
            </div>
          </div>

          <div className="summary-item">
            <div className="left">
              <div className="icon-wrap rejected">
                <FaTimes />
              </div>
              <div className="labels">
                <strong>Rejected Requests</strong>
              </div>
            </div>
            <div className="right">
              <div className="count">{summary.rejected}</div>
              <span className="badge rejected">Rejected</span>
            </div>
          </div>

          <div className="summary-item">
            <div className="left">
              <div className="icon-wrap pending">
                <FaRegClock />
              </div>
              <div className="labels">
                <strong>Pending Requests</strong>
              </div>
            </div>
            <div className="right">
              <div className="count">{summary.pending}</div>
              <span className="badge pending">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaveHistoryView({ onNewLeaveClick, refreshKey }) {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRange, setSelectedRange] = useState("all");
  const [leaveHistory, setLeaveHistory] = useState([]);

  useEffect(() => {
    fetchLeaveHistory();
  }, [refreshKey]);

  const fetchLeaveHistory = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/leave/history/${user.id}`
      );

      const data = await response.json();

      if (data.success) {
        setLeaveHistory(data.leaves);
      }
    } catch (error) {
      console.error("Fetch leave history error:", error);
    }
  };

  const filteredRows = leaveHistory.filter((leave) => {
    const status = leave.status.toLowerCase();
    const statusMatches = selectedStatus === "all" || status === selectedStatus;

    if (!statusMatches) return false;

    if (selectedRange === "all") return true;

    const [day, month, year] = leave.start_date.split("-").map(Number);
    const leaveDate = new Date(year, month - 1, day);
    const today = new Date();

    if (selectedRange === "month") {
      return (
        leaveDate.getMonth() === today.getMonth() &&
        leaveDate.getFullYear() === today.getFullYear()
      );
    }

    if (selectedRange === "year") {
      return leaveDate.getFullYear() === today.getFullYear();
    }

    return true;
  });

  return (
    <div className="leave-content">
      <div className="leave-top">
        <div className="section-title leave-title">
          <FaRegCalendarAlt />
          <h1>Leave History</h1>
        </div>
        <div className="leave-actions">
          <button
            className="new-leave-btn"
            type="button"
            onClick={onNewLeaveClick}
          >
            <FaPlus />
            New Leave
          </button>
          <div className="leave-filters">
            <select
              aria-label="Filter leave status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
            </select>
            <select
              aria-label="Select date range"
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
            >
              <option value="all">Select Date Range</option>
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
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan="6">No leave history found</td>
              </tr>
            ) : (
              filteredRows.map((leave, index) => (
                <tr key={leave.id}>
                  <td>{index + 1}</td>
                  <td>{leave.leave_type}</td>
                  <td>{leave.start_date}</td>
                  <td>{leave.end_date}</td>
                  <td>{leave.reason}</td>
                  <td>
                    <span className={`status-pill ${leave.status.toLowerCase()}`}>
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="pagination">
          <button type="button" aria-label="Previous page">
            <FaArrowLeft />
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              className={page === 1 ? "active" : ""}
              type="button"
              key={page}
            >
              {page}
            </button>
          ))}
          <button type="button" aria-label="Next page">
            <FaArrowRight />
          </button>
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
          <button
            className="confirm-logout-btn"
            type="button"
            onClick={onConfirm}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function EmployeeDashboard({ onLogout }) {
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem("employeeActiveView") || "profile";
  });

  useEffect(() => {
    localStorage.setItem("employeeActiveView", activeView);
  }, [activeView]);

  const [isEditing, setIsEditing] = useState(false);
  const [leaveRefreshKey, setLeaveRefreshKey] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const [profileData, setProfileData] = useState({
    name: loggedInUser?.name || "",
    employeeId: loggedInUser?.employee_id || "",
    department: loggedInUser?.department || "",
    email: loggedInUser?.email || "",
    phone: loggedInUser?.phone || "",
    joiningDate: loggedInUser?.joining_date || "",
    designation: loggedInUser?.designation || "Employee",
  });

  const [tempProfileData, setTempProfileData] = useState({ ...profileData });

  const [profilePhoto, setProfilePhoto] = useState(
    loggedInUser?.profile_photo || null,
  );
  const profilePhotoInputRef = useRef(null);

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    const user = JSON.parse(localStorage.getItem("user"));

    if (!file || !user) return;

    const formData = new FormData();
    formData.append("profile_photo", file);

    try {
      const response = await fetch(
        `http://localhost:5000/api/profile/upload-photo/${user.id}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      const data = await response.json();

      if (data.success) {
        const updatedUser = {
          ...user,
          profile_photo: data.profile_photo,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setProfilePhoto(data.profile_photo);
        alert("Profile photo updated successfully");
      } else {
        alert("Failed to upload profile photo");
      }
    } catch (error) {
      console.error("Photo upload error:", error);
      alert("Backend connection failed");
    }
  };

  const handleProfilePhotoRemove = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/profile/remove-photo/${user.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (data.success) {
        const updatedUser = {
          ...user,
          profile_photo: null,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setProfilePhoto(null);
        alert("Profile photo removed successfully");
      } else {
        alert("Failed to remove profile photo");
      }
    } catch (error) {
      console.error("Photo removal error:", error);
      alert("Backend connection failed");
    }
  };

  const handleEditClick = () => {
    setTempProfileData({ ...profileData });
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/profile/update/${user.id}`,
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
          employeeId: data.user.employee_id || "",
          department: data.user.department || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          joiningDate: data.user.joining_date
            ? data.user.joining_date.substring(0, 10)
            : "",
          designation: data.user.designation || "Employee",
        });

        setIsEditing(false);
        alert("Profile updated successfully");
      } else {
        alert("Profile update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Backend connection failed");
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
              className={`nav-item ${activeView === "profile" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveView("profile")}
            >
              <FaRegUser />
              <span>My Profile</span>
            </button>
            <button
              className={`nav-item ${activeView === "leave" || activeView === "newLeave" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveView("leave")}
            >
              <FaRegEdit />
              <span>Apply Leave</span>
            </button>
            <button
              className={`nav-item ${activeView === "leaveSummary" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveView("leaveSummary")}
            >
              <FaRegChartBar />
              <span>Leave Summary</span>
            </button>
          </nav>

          <span className="sidebar-dot-grid" />

          <button
            className="logout"
            type="button"
            onClick={() => setShowLogoutModal(true)}
          >
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
              profilePhoto={profilePhoto}
              profilePhotoInputRef={profilePhotoInputRef}
              handleProfilePhotoChange={handleProfilePhotoChange}
              handleProfilePhotoRemove={handleProfilePhotoRemove}
            />
          )}
          {activeView === "leave" && (
            <LeaveHistoryView
              onNewLeaveClick={() => setActiveView("newLeave")}
              refreshKey={leaveRefreshKey}
            />
          )}
          {activeView === "newLeave" && (
            <ApplyLeaveForm
              onApplyLeave={() => {
                setLeaveRefreshKey((prev) => prev + 1);
                setActiveView("leave");
              }}
            />
          )}
          {activeView === "leaveSummary" && <LeaveSummaryView />}
        </section>
      </div>
      {showLogoutModal && (
        <LogoutView
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={onLogout}
        />
      )}
    </main>
  );
}

export default EmployeeDashboard;
