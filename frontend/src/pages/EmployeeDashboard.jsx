import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBuilding,
  FaCalendarAlt,
  FaCheck,
  FaChevronDown,
  FaEnvelope,
  FaExclamationTriangle,
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
  FaShieldAlt,
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

const TIME_OPTIONS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM",
];

function formatDDMMYYYY(date) {
  if (!date) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

function toMySQLDate(date) {
  if (!date) return null;
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${y}-${m}-${d}`;
}

function calcLeaveDays(from, to) {
  if (!from || !to) return 0;
  const msPerDay = 86400000;
  const diff = Math.round((to - from) / msPerDay) + 1;
  return diff > 0 ? diff : 0;
}

function ApplyLeaveForm({ onApplyLeave, onBack }) {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [fromTime, setFromTime] = useState("09:00 AM");
  const [toTime, setToTime] = useState("05:00 PM");
  const [leaveType, setLeaveType] = useState("Personal Leave");
  const [reason, setReason] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [balance, setBalance] = useState({ total: 36, remaining: 36 });
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  const isFlexibleLeave = leaveType === "Medical Leave" || leaveType === "Personal Leave";
  const fromMinDate = isFlexibleLeave ? startOfCurrentMonth : today;
  const fromMaxDate = isFlexibleLeave ? null : endOfNextMonth;
  const toMinDate = fromDate ? fromDate : fromMinDate;
  const toMaxDate = isFlexibleLeave ? null : endOfNextMonth;

  const leaveDays = calcLeaveDays(fromDate, toDate);
  const exceedsBalance = leaveDays > balance.remaining;
  const canSubmit = fromDate && toDate && reason.trim() && !exceedsBalance && !submitting;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    fetch(`http://localhost:5000/api/leave/summary/${user.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setBalance({
            total: d.summary.totalAllowed,
            remaining: d.summary.remaining,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleReset = () => {
    setLeaveType("Personal Leave");
    setFromDate(null);
    setToDate(null);
    setFromTime("09:00 AM");
    setToTime("05:00 PM");
    setReason("");
    setCharCount(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) { alert("User not found. Please login again."); return; }

    setSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/leave/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: user.id,
          leave_type: leaveType,
          start_date: toMySQLDate(fromDate),
          end_date: toMySQLDate(toDate),
          reason,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Leave applied successfully");
        handleReset();
        if (onApplyLeave) onApplyLeave();
      } else {
        alert(data.message || "Leave application failed. Please try again.");
      }
    } catch (err) {
      console.error("Apply leave error:", err);
      alert("Backend connection failed. Please check your network.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="leave-content">
      <form className="new-leave-form" onSubmit={handleSubmit}>
        <div className="apply-leave-header-row">
          <div className="section-title leave-form-title">
            <FaRegEdit />
            <div>
              <h1>Apply Leave</h1>
              <p className="leave-form-subtitle">Fill in the details below to request a leave</p>
            </div>
          </div>
          <div className="apply-leave-header-right">
            {onBack && (
              <button
                type="button"
                className="apply-leave-back-btn"
                onClick={onBack}
              >
                <FaArrowLeft /> Back to History
              </button>
            )}
            <div className="available-balance-card">
              <div className="balance-card-icon"><FaRegCalendarAlt /></div>
              <div className="balance-card-text">
                <span className="balance-card-label">Available Balance</span>
                <span className="balance-card-days">{balance.remaining} Days</span>
                <span className="balance-card-total">out of {balance.total} Days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="leave-form-step">
          <div className="step-badge">1</div>
          <span className="step-label">Leave Type</span>
        </div>
        <div className="leave-form-field leave-form-field-wide leave-type-field">
          <div className="select-icon-wrap">
            <FaRegUser className="select-prefix-icon" />
            <select
              value={leaveType}
              onChange={(e) => {
                setLeaveType(e.target.value);
                setFromDate(null);
                setToDate(null);
              }}
            >
              <option>Personal Leave</option>
              <option>Medical Leave</option>
              <option>Vacation Leave</option>
              <option>Maternity Leave</option>
              <option>Paternity Leave</option>
              <option>Marriage Leave</option>
            </select>
            <FaChevronDown className="select-suffix-icon" />
          </div>
        </div>

        <div className="leave-date-time-grid">
          <div className="date-time-group">
            <div className="leave-form-step">
              <div className="step-badge">2</div>
              <span className="step-label">From Date &amp; Time</span>
            </div>
            <div className="date-time-row">
              <div className="leave-form-field datepicker-field">
                <div className="datepicker-wrap">
                  <FaRegCalendarAlt className="datepicker-icon" />
                  <DatePicker
                    selected={fromDate}
                    onChange={(date) => {
                      setFromDate(date);
                      if (toDate && date && toDate < date) setToDate(null);
                    }}
                    minDate={fromMinDate}
                    maxDate={fromMaxDate}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="dd-MM-yyyy"
                    placeholderText="DD-MM-YYYY"
                    className="datepicker-input"
                    popperPlacement="bottom-start"
                    showPopperArrow={false}
                  />
                </div>
              </div>
              <div className="leave-form-field">
                <div className="select-icon-wrap time-select-wrap">
                  <FaRegClock className="select-prefix-icon" />
                  <select value={fromTime} onChange={(e) => setFromTime(e.target.value)}>
                    {TIME_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <FaChevronDown className="select-suffix-icon" />
                </div>
              </div>
            </div>
          </div>

          <div className="date-time-group">
            <div className="leave-form-step">
              <div className="step-badge">3</div>
              <span className="step-label">To Date &amp; Time</span>
            </div>
            <div className="date-time-row">
              <div className="leave-form-field datepicker-field">
                <div className="datepicker-wrap">
                  <FaRegCalendarAlt className="datepicker-icon" />
                  <DatePicker
                    selected={toDate}
                    onChange={(date) => setToDate(date)}
                    minDate={toMinDate}
                    maxDate={toMaxDate}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="dd-MM-yyyy"
                    placeholderText="DD-MM-YYYY"
                    className="datepicker-input"
                    popperPlacement="bottom-start"
                    showPopperArrow={false}
                  />
                </div>
              </div>
              <div className="leave-form-field">
                <div className="select-icon-wrap time-select-wrap">
                  <FaRegClock className="select-prefix-icon" />
                  <select value={toTime} onChange={(e) => setToTime(e.target.value)}>
                    {TIME_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <FaChevronDown className="select-suffix-icon" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {leaveDays > 0 && (
          <div className={`leave-days-summary ${exceedsBalance ? "exceeds" : ""}` }>
            <span className="leave-days-count">
              {leaveDays} {leaveDays === 1 ? "Day" : "Days"} Selected
            </span>
            {exceedsBalance && (
              <span className="leave-days-warning">
                <FaExclamationTriangle />
                Requested leave exceeds your available balance.
              </span>
            )}
          </div>
        )}

        <div className="leave-form-step">
          <div className="step-badge">4</div>
          <span className="step-label">Reason for Leave</span>
        </div>
        <div className="leave-form-field leave-form-field-wide reason-field">
          <div className="reason-wrap">
            <div className="reason-icon-box"><FaFileAlt /></div>
            <textarea
              value={reason}
              maxLength={300}
              onChange={(e) => { setReason(e.target.value); setCharCount(e.target.value.length); }}
              placeholder="Enter reason for leave..."
            />
          </div>
          <span className="reason-char-count">{charCount} / 300</span>
        </div>

        <div className="leave-form-actions">
          <button
            className="apply-leave-submit"
            type="submit"
            disabled={!canSubmit}
          >
            {submitting ? "Submitting..." : "Apply Leave"}
          </button>
          <button
            className="apply-leave-reset"
            type="button"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>

        <div className="apply-leave-notice">
          <FaShieldAlt />
          Please ensure all details are correct before applying. You can track your leave status in Leave Summary.
        </div>
      </form>
    </div>
  );
}

// Format ISO date → "22 June 2026"
function fmtDate(raw) {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function ProfileView({
  profileData,
  profilePhoto,
  profilePhotoInputRef,
  handleProfilePhotoChange,
  handleProfilePhotoRemove,
}) {
  const [stats, setStats] = useState({ total: 36, taken: 0, pending: 0, approved: 0 });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    fetch(`http://localhost:5000/api/leave/summary/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) return;
        setStats({
          total: data.summary.totalAllowed,
          taken: data.summary.leavesTaken,
          pending: data.summary.pendingRequests,
          approved: data.summary.approvedRequests,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="profile-content">
      {/* Heading */}
      <div className="section-title">
        <FaRegUser />
        <h1>My Profile</h1>
      </div>

      {/* ── Hero card ─────────────────────────── */}
      <div className="profile-hero-card">
        {/* Left */}
        <div className="profile-hero-left">
          <EmployeeAvatar
            large
            photoUrl={profilePhoto}
            fileInputRef={profilePhotoInputRef}
            onPhotoChange={handleProfilePhotoChange}
            onRemovePhoto={handleProfilePhotoRemove}
          />
          <div className="hero-details">
            <div className="employee-name">
              <h2>{profileData.name}</h2>
              <span className="role-badge">{profileData.designation}</span>
            </div>
            <div className="employee-meta">
              <span>
                <FaRegCalendarAlt />
                Employee ID:&nbsp;<strong className="emp-id-val">{profileData.employeeId}</strong>
              </span>
              <span>
                <FaBuilding />
                {profileData.department} Department
              </span>
            </div>
          </div>
        </div>

        {/* Right: quote box */}
        <div className="profile-hero-right">
          <span className="pq-icon">&ldquo;</span>
          <p className="pq-text">
            {profileData.about || "Every successful team is built on responsibility, trust, and consistency. — LeaveWise"}
          </p>
        </div>
      </div>

      {/* ── Account Details ───────────────────── */}
      <p className="account-details-heading">Account Details</p>

      <div className="info-grid">
        <div className="info-card">
          <div className="ic-icon-wrap ic-blue"><FaEnvelope /></div>
          <div className="card-body">
            <strong>Email</strong>
            <span>{profileData.email}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="ic-icon-wrap ic-blue"><FaPhoneAlt /></div>
          <div className="card-body">
            <strong>Phone</strong>
            <span>{profileData.phone}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="ic-icon-wrap ic-blue"><FaRegCalendarAlt /></div>
          <div className="card-body">
            <strong>Joining Date</strong>
            <span>{fmtDate(profileData.joiningDate)}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="ic-icon-wrap ic-blue"><FaRegBuilding /></div>
          <div className="card-body">
            <strong>Department</strong>
            <span>{profileData.department}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="ic-icon-wrap ic-blue"><FaSuitcase /></div>
          <div className="card-body">
            <strong>Designation</strong>
            <span>{profileData.designation}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="ic-icon-wrap ic-blue"><FaUser /></div>
          <div className="card-body">
            <strong>Employee Type</strong>
            <span>{profileData.employeeType || "Full-Time"}</span>
          </div>
        </div>
      </div>

      {/* ── Stats bar ─────────────────────────── */}
      <div className="profile-stats-bar">
        <div className="ps-item">
          <div className="ps-icon ps-blue"><FaRegCalendarAlt /></div>
          <div>
            <div className="ps-num">{stats.total}</div>
            <div className="ps-label">Total Leave<br/>Allowed</div>
          </div>
        </div>
        <div className="ps-divider" />
        <div className="ps-item">
          <div className="ps-icon ps-green"><FaCheck /></div>
          <div>
            <div className="ps-num">{stats.taken}</div>
            <div className="ps-label">Leaves<br/>Taken</div>
          </div>
        </div>
        <div className="ps-divider" />
        <div className="ps-item">
          <div className="ps-icon ps-orange"><FaRegClock /></div>
          <div>
            <div className="ps-num">{stats.pending}</div>
            <div className="ps-label">Pending<br/>Requests</div>
          </div>
        </div>
        <div className="ps-divider" />
        <div className="ps-item">
          <div className="ps-icon ps-purple"><FaRegCalendarAlt /></div>
          <div>
            <div className="ps-num">{stats.approved}</div>
            <div className="ps-label">Approved<br/>Requests</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaveSummaryView() {
  const [summary, setSummary] = useState({
    approved: 0,
    rejected: 0,
    pending: 0,
    cancelled: 0,
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
        `http://localhost:5000/api/leave/summary/${user.id}`
      );

      const data = await response.json();

      if (data.success) {
        setSummary({
          approved: data.summary.approvedRequests,
          rejected: data.summary.rejectedRequests,
          pending: data.summary.pendingRequests,
          cancelled: data.summary.cancelledRequests,
          totalTaken: data.summary.leavesTaken,
          remaining: data.summary.remaining,
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

          <div className="summary-item">
            <div className="left">
              <div className="icon-wrap cancelled">
                <FaTimes />
              </div>
              <div className="labels">
                <strong>Cancelled Requests</strong>
              </div>
            </div>
            <div className="right">
              <div className="count">{summary.cancelled}</div>
              <span className="badge cancelled">Cancelled</span>
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchLeaveHistory();
  }, [refreshKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedRange, leaveHistory, itemsPerPage]);

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

  const handleCancelClick = async (leaveId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this leave request?");
    if (!confirmCancel) return;

    try {
      const response = await fetch(`http://localhost:5000/api/leaves/cancel/${leaveId}`, {
        method: "PUT",
      });
      const data = await response.json();
      if (data.success) {
        alert("Leave cancelled successfully");
        fetchLeaveHistory();
      } else {
        alert(data.message || "Failed to cancel leave");
      }
    } catch (error) {
      console.error("Error cancelling leave:", error);
      alert("Backend connection failed.");
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

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pagedRows = filteredRows.slice(startIndex, startIndex + itemsPerPage);

  const getDayOfWeek = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return "";
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const getLeaveTypeIcon = (type) => {
    const lower = type.toLowerCase();
    if (lower.includes("personal")) {
      return (
        <div className="leave-type-icon-box personal">
          <FaRegUser />
        </div>
      );
    }
    if (lower.includes("medical") || lower.includes("sick")) {
      return (
        <div className="leave-type-icon-box medical">
          <FaShieldAlt />
        </div>
      );
    }
    if (lower.includes("vacation")) {
      return (
        <div className="leave-type-icon-box vacation">
          <FaSuitcase />
        </div>
      );
    }
    return (
      <div className="leave-type-icon-box other">
        <FaRegCalendarAlt />
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const lower = status.toLowerCase();
    if (lower === "pending") {
      return (
        <span className="status-pill pending">
          <FaRegClock className="status-icon" /> Pending
        </span>
      );
    }
    if (lower === "approved") {
      return (
        <span className="status-pill approved">
          <FaCheck className="status-icon" /> Approved
        </span>
      );
    }
    if (lower === "rejected") {
      return (
        <span className="status-pill rejected">
          <FaTimes className="status-icon" /> Rejected
        </span>
      );
    }
    if (lower === "cancelled") {
      return (
        <span className="status-pill cancelled">
          <FaTimes className="status-icon" /> Cancelled
        </span>
      );
    }
    return <span className={`status-pill ${lower}`}>{status}</span>;
  };

  return (
    <div className="leave-content">
      <div className="leave-history-header-card">
        <div className="header-card-left">
          <div className="header-icon-box">
            <FaRegCalendarAlt className="header-icon" />
          </div>
          <div className="header-text">
            <h1>Leave History</h1>
            <p>View and manage all your leave requests</p>
          </div>
        </div>
      </div>

      <div className="leave-top-bar">
        <button
          className="new-leave-btn-primary"
          type="button"
          onClick={onNewLeaveClick}
        >
          <FaPlus />
          New Leave
        </button>

        <div className="leave-filters-group">
          <div className="filter-select-wrap">
            <select
              aria-label="Filter leave status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <FaChevronDown className="filter-select-chevron" />
          </div>

          <div className="filter-select-wrap date-range-filter">
            <FaRegCalendarAlt className="filter-select-calendar-icon" />
            <select
              aria-label="Select date range"
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
            >
              <option value="all">Select Date Range</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <FaChevronDown className="filter-select-chevron" />
          </div>
        </div>
      </div>

      <div className="leave-table-container">
        <table className="leave-table-modern">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>S.No</th>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data-td">No leave history found</td>
              </tr>
            ) : (
              pagedRows.map((leave, index) => (
                <tr key={leave.id}>
                  <td>
                    <span className="sno-circle-badge">
                      {startIndex + index + 1}
                    </span>
                  </td>
                  <td>
                    <div className="leave-type-td-cell">
                      {getLeaveTypeIcon(leave.leave_type)}
                      <span className="leave-type-text-span">{leave.leave_type}</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-td-cell">
                      <span className="date-main-span">{leave.start_date}</span>
                      <span className="date-day-span">{getDayOfWeek(leave.start_date)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-td-cell">
                      <span className="date-main-span">{leave.end_date}</span>
                      <span className="date-day-span">{getDayOfWeek(leave.end_date)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="days-highlight-blue">
                      {leave.leave_days} {leave.leave_days === 1 ? 'Day' : 'Days'}
                    </span>
                  </td>
                  <td className="reason-td-cell">{leave.reason}</td>
                  <td>{getStatusBadge(leave.status)}</td>
                  <td>
                    {leave.status.toLowerCase() === "pending" ? (
                      <button
                        className="cancel-leave-btn-red"
                        onClick={() => handleCancelClick(leave.id)}
                      >
                        <FaTimes className="cancel-icon-btn" /> Cancel
                      </button>
                    ) : (
                      <span className="no-action-hyphen">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="leave-footer-bar">
        <div className="entries-count-display">
          Showing {filteredRows.length > 0 ? startIndex + 1 : 0} to{" "}
          {Math.min(startIndex + itemsPerPage, filteredRows.length)} of{" "}
          {filteredRows.length} entries
        </div>

        <div className="pagination-controls-modern">
          <button
            type="button"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="pag-btn"
          >
            <FaArrowLeft />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              className={`pag-btn ${page === currentPage ? "active" : ""}`}
              type="button"
              key={page}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            aria-label="Next page"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="pag-btn"
          >
            <FaArrowRight />
          </button>
        </div>

        <div className="rows-per-page-container">
          <span className="rows-label">Rows per page:</span>
          <div className="rows-select-wrap">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <FaChevronDown className="rows-select-chevron" />
          </div>
        </div>
      </div>

      <div className="leave-info-alert-banner">
        <div className="info-alert-icon-box">
          <span>i</span>
        </div>
        <div className="info-alert-message">
          <strong>Note:</strong> You can only cancel leave requests that are currently pending.
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
    employeeType: loggedInUser?.employee_type || "Full-Time",
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
          employeeType: data.user.employee_type || "Full-Time",
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
              onBack={() => setActiveView("leave")}
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
