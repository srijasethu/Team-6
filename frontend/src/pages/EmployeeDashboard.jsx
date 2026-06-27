import { useState, useRef, useEffect } from "react";
const MONTHLY_PAID_LIMIT = 3;
const ANNUAL_PAID_ALLOCATION = 36;
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
  FaInfoCircle,
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
  const [balance, setBalance] = useState({ total: ANNUAL_PAID_ALLOCATION, remaining: ANNUAL_PAID_ALLOCATION });
  const [existingLeaves, setExistingLeaves] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, type: null, paid: 0, unpaid: 0 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  const isFlexibleLeave = leaveType === "Medical Leave" || leaveType === "Personal Leave";
  // Medical & Personal: can go back to start of current month, no future cap
  // All other leave types: current month + next month only
  const fromMinDate = startOfCurrentMonth;
  const fromMaxDate = isFlexibleLeave ? null : endOfNextMonth;
  const toMinDate = fromDate ? fromDate : fromMinDate;
  const toMaxDate = isFlexibleLeave ? null : endOfNextMonth;

  const calculatePreview = (from, to) => {
    if (!from || !to) return { total: 0, paid: 0, unpaid: 0 };
    
    const parseLocal = (dVal) => {
      if (!dVal) return null;
      const d = new Date(dVal);
      if (isNaN(d.getTime())) return null;
      if (typeof dVal === 'string') {
        const parts = dVal.split('T')[0].split('-');
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          } else if (parts[2].length === 4) {
            return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
          }
        }
      }
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    const toYYYYMM = (d) => {
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0');
    };

    const toYYYYMMDD = (d) => {
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
    };

    const approvedOrPendingDaysByMonth = {};
    existingLeaves.forEach((leave) => {
      const status = leave.status.toLowerCase();
      if (status !== "approved" && status !== "pending") return;

      let curr = parseLocal(leave.start_date);
      const end = parseLocal(leave.end_date);
      if (!curr || !end) return;

      while (curr <= end) {
        const monthKey = toYYYYMM(curr);
        if (!approvedOrPendingDaysByMonth[monthKey]) {
          approvedOrPendingDaysByMonth[monthKey] = new Set();
        }
        approvedOrPendingDaysByMonth[monthKey].add(toYYYYMMDD(curr));
        curr.setDate(curr.getDate() + 1);
      }
    });

    let paid = 0;
    let unpaid = 0;
    let total = 0;

    let curr = parseLocal(from);
    const end = parseLocal(to);
    while (curr <= end) {
      const monthKey = toYYYYMM(curr);
      if (!approvedOrPendingDaysByMonth[monthKey]) {
        approvedOrPendingDaysByMonth[monthKey] = new Set();
      }
      const dateStr = toYYYYMMDD(curr);
      const countInMonth = approvedOrPendingDaysByMonth[monthKey].size;
      if (countInMonth < MONTHLY_PAID_LIMIT) {
        paid++;
        approvedOrPendingDaysByMonth[monthKey].add(dateStr);
      } else {
        unpaid++;
      }
      total++;
      curr.setDate(curr.getDate() + 1);
    }

    return { total, paid, unpaid };
  };

  const preview = calculatePreview(fromDate, toDate);
  const canSubmit = fromDate && toDate && reason.trim() && !submitting;

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
          setExistingLeaves(d.leaves || []);
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

  // The actual API call — invoked either directly (Paid) or after modal confirmation
  const doSubmit = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) { alert("User not found. Please login again."); return; }
    setConfirmModal({ show: false, type: null, paid: 0, unpaid: 0 });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const paid = preview.paid;
    const unpaid = preview.unpaid;
    // Paid → submit directly, no popup needed
    if (unpaid === 0) { doSubmit(); return; }
    // Partly Paid or Unpaid → show styled modal
    const type = paid > 0 ? "partly" : "unpaid";
    setConfirmModal({ show: true, type, paid, unpaid });
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
                <span className="balance-card-total">out of {balance.total} Paid Days</span>
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

        {preview.total > 0 && (
          <div className="leave-days-summary" style={{ padding: "16px", borderRadius: "10px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", marginTop: "20px" }}>
            <div className="preview-row" style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", fontSize: "15px", fontWeight: "600", color: "#1e293b" }}>
              <span>Selected Leave:</span>
              <span>{preview.total} {preview.total === 1 ? "Day" : "Days"}</span>
            </div>
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

      {/* ── Confirmation Modal ──────────────────────────────────── */}
      {confirmModal.show && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.50)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            maxWidth: "440px", width: "90%",
            boxShadow: "0 24px 64px rgba(0,0,0,0.20)",
            fontFamily: "'Poppins', sans-serif",
            overflow: "hidden",
            borderLeft: "5px solid #dc2626"
          }}>

            {/* Header strip */}
            <div style={{
              padding: "22px 28px 18px",
              background: "linear-gradient(135deg, #fff1f2 0%, #fff 100%)",
              borderBottom: "1px solid #fecaca"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "42px", height: "42px", borderRadius: "10px",
                  background: "#fecaca",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#b91c1c",
                  fontSize: "18px", flexShrink: 0
                }}>
                  <FaExclamationTriangle />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#b91c1c" }}>
                    {confirmModal.type === "partly" ? "Partly Paid Leave" : "Unpaid Leave"}
                  </h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "#ef4444", fontWeight: "500", marginTop: "2px" }}>
                    {confirmModal.type === "unpaid"
                      ? "This leave will not reduce your paid balance"
                      : "This leave is partially unpaid"}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "22px 28px" }}>
              {confirmModal.type === "partly" ? (
                <div style={{ color: "#475569", fontSize: "14px", lineHeight: "1.7", marginBottom: "20px" }}>
                  <p style={{ margin: "0 0 14px", color: "#334155" }}>Your selected dates span across the <strong>{MONTHLY_PAID_LIMIT}-day monthly paid leave limit</strong>.</p>
                  <div style={{
                    background: "#f8fafc", borderRadius: "10px",
                    padding: "14px 18px", marginBottom: "14px",
                    border: "1px solid #e2e8f0",
                    display: "flex", justifyContent: "space-around"
                  }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "22px", fontWeight: "800", color: "#16a34a" }}>{confirmModal.paid}</div>
                      <div style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>Paid day(s)</div>
                    </div>
                    <div style={{ width: "1px", background: "#e2e8f0" }} />
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "22px", fontWeight: "800", color: "#dc2626" }}>{confirmModal.unpaid}</div>
                      <div style={{ fontSize: "12px", color: "#dc2626", fontWeight: "600" }}>Unpaid day(s)</div>
                    </div>
                  </div>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                    The unpaid days are beyond your monthly paid leave limit of {MONTHLY_PAID_LIMIT} days.
                  </p>
                  <p style={{ margin: "10px 0 0", fontWeight: "700", color: "#1e293b", fontSize: "13px" }}>Are you sure you want to apply this leave?</p>
                </div>
              ) : (
                <div style={{ color: "#475569", fontSize: "14px", lineHeight: "1.7", marginBottom: "20px" }}>
                  <p style={{ margin: "0 0 10px", fontWeight: "600", color: "#b91c1c" }}>
                    Your monthly paid leave limit has already been fully used.
                  </p>
                  <p style={{ margin: "0 0 10px", color: "#64748b", fontSize: "13px" }}>
                    This leave will be marked as <strong>Unpaid</strong> and will not reduce your yearly paid leave balance.
                  </p>
                  <p style={{ margin: 0, fontWeight: "700", color: "#1e293b", fontSize: "13px" }}>Are you sure you want to apply this leave?</p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setConfirmModal({ show: false, type: null, paid: 0, unpaid: 0 })}
                  style={{
                    padding: "10px 22px", borderRadius: "8px", border: "1.5px solid #cbd5e1",
                    background: "#ffffff", color: "#475569", fontFamily: "inherit",
                    fontSize: "14px", fontWeight: "600", cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={doSubmit}
                  disabled={submitting}
                  style={{
                    padding: "10px 22px", borderRadius: "8px", border: "none",
                    background: "#dc2626",
                    color: "#ffffff", fontFamily: "inherit",
                    fontSize: "14px", fontWeight: "700",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? "Submitting..." : "Apply Anyway"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
  const [stats, setStats] = useState({ total: ANNUAL_PAID_ALLOCATION, taken: 0, pending: 0, approved: 0 });

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
            <div className="ps-num">{stats.total} Days</div>
            <div className="ps-label">Total Leave<br/>Allowed</div>
          </div>
        </div>
        <div className="ps-divider" />
        <div className="ps-item">
          <div className="ps-icon ps-green"><FaCheck /></div>
          <div>
            <div className="ps-num">{stats.taken} Days</div>
            <div className="ps-label">Leaves<br/>Taken</div>
          </div>
        </div>
        <div className="ps-divider" />
        <div className="ps-item">
          <div className="ps-icon ps-orange"><FaRegChartBar /></div>
          <div>
            <div className="ps-num">{Math.max(0, stats.total - stats.taken)} Days</div>
            <div className="ps-label">Total Balance<br/>Leave</div>
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
    totalPaidTakenThisYear: 0,
    totalUnpaidTakenThisYear: 0,
    remainingPaid: ANNUAL_PAID_ALLOCATION,
    totalRequests: 0
  });
  const [allLeaves, setAllLeaves] = useState([]);
  
  const todayDate = new Date();
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth()); // 0-indexed

  useEffect(() => {
    fetchLeaveSummary();
  }, []);

  const fetchLeaveSummary = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:5000/api/leave/summary/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setSummary({
          approved: data.summary.approvedRequests,
          rejected: data.summary.rejectedRequests,
          pending: data.summary.pendingRequests,
          cancelled: data.summary.cancelledRequests,
          totalPaidTakenThisYear: data.summary.totalPaidTakenThisYear,
          totalUnpaidTakenThisYear: data.summary.totalUnpaidTakenThisYear,
          remainingPaid: data.summary.remaining,
          totalRequests: data.summary.totalRequests,
        });
        setAllLeaves(data.leaves || []);
      }
    } catch (error) {
      console.error("Fetch leave summary error:", error);
    }
  };

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getMonthlyLeaveDaysDetail = () => {
    const parseLocal = (dVal) => {
      if (!dVal) return null;
      const d = new Date(dVal);
      if (isNaN(d.getTime())) return null;
      if (typeof dVal === 'string') {
        const parts = dVal.split('T')[0].split('-');
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          } else if (parts[2].length === 4) {
            return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
          }
        }
      }
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    const days = [];
    allLeaves.forEach((leave) => {
      if (leave.status.toLowerCase() !== "approved") return;
      
      let curr = parseLocal(leave.start_date);
      const end = parseLocal(leave.end_date);
      if (!curr || !end) return;

      while (curr <= end) {
        if (curr.getFullYear() === currentYear && curr.getMonth() === currentMonth) {
          days.push(new Date(curr));
        }
        curr.setDate(curr.getDate() + 1);
      }
    });

    days.sort((a, b) => a - b);

    const detail = {};
    let paidCount = 0;
    let unpaidCount = 0;

    days.forEach((d, idx) => {
      const dateStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
      if (idx < MONTHLY_PAID_LIMIT) {
        detail[dateStr] = "Paid";
        paidCount++;
      } else {
        detail[dateStr] = "Unpaid";
        unpaidCount++;
      }
    });

    return { detail, paidCount, unpaidCount, totalCount: days.length };
  };

  const { detail: leaveDaysDetail, paidCount, unpaidCount, totalCount } = getMonthlyLeaveDaysDetail();

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();
  
  const cells = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    cells.push({
      day: prevMonthTotalDays - i,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth - 1, prevMonthTotalDays - i)
    });
  }
  for (let i = 1; i <= totalDays; i++) {
    cells.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(currentYear, currentMonth, i)
    });
  }
  const totalCells = cells.length;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remainingCells; i++) {
    cells.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth + 1, i)
    });
  }

  return (
    <div className="leave-content">
      <div className="leave-summary-header">
        <h1>Leave Summary</h1>
        <p>Overview of your leave balance, usage and requests</p>
      </div>

      <div className="leave-summary">
        {/* Top 5 Summary Cards */}
        <div className="summary-cards" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "24px" }}>
          <div className="card" style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div className="card-head" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#2563eb", marginBottom: "8px" }}>
              <div className="card-icon" style={{ backgroundColor: "#eff6ff", padding: "6px", borderRadius: "8px" }}><FaRegCalendarAlt /></div>
              <strong style={{ fontSize: "12px", fontWeight: "600" }}>Paid Leave Allowed Per Month</strong>
            </div>
            <div className="value" style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: "4px 0" }}>{MONTHLY_PAID_LIMIT} Days</div>
            <div className="muted" style={{ fontSize: "11px", color: "#64748b" }}>Maximum paid leave every month</div>
          </div>
          
          <div className="card" style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div className="card-head" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#16a34a", marginBottom: "8px" }}>
              <div className="card-icon" style={{ backgroundColor: "#f0fdf4", padding: "6px", borderRadius: "8px" }}><FaRegCalendarAlt /></div>
              <strong style={{ fontSize: "12px", fontWeight: "600" }}>Annual Allocated Leave (Paid)</strong>
            </div>
            <div className="value" style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: "4px 0" }}>{ANNUAL_PAID_ALLOCATION} Days</div>
            <div className="muted" style={{ fontSize: "11px", color: "#64748b" }}>Total paid leave allocated for this year</div>
          </div>

          <div className="card" style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div className="card-head" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ea580c", marginBottom: "8px" }}>
              <div className="card-icon" style={{ backgroundColor: "#fff7ed", padding: "6px", borderRadius: "8px" }}><FaCheck /></div>
              <strong style={{ fontSize: "12px", fontWeight: "600" }}>Total Paid Leave Taken (This Year)</strong>
            </div>
            <div className="value" style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: "4px 0" }}>{summary.totalPaidTakenThisYear} Days</div>
            <div className="muted" style={{ fontSize: "11px", color: "#64748b" }}>Includes all approved paid leaves</div>
          </div>

          <div className="card" style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div className="card-head" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0d9488", marginBottom: "8px" }}>
              <div className="card-icon" style={{ backgroundColor: "#f0fdfa", padding: "6px", borderRadius: "8px" }}><FaRegChartBar /></div>
              <strong style={{ fontSize: "12px", fontWeight: "600" }}>Total Balance Leave (Paid Yearly)</strong>
            </div>
            <div className="value" style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: "4px 0" }}>{summary.remainingPaid} Days</div>
            <div className="muted" style={{ fontSize: "11px", color: "#64748b" }}>{ANNUAL_PAID_ALLOCATION} - {summary.totalPaidTakenThisYear} = {summary.remainingPaid} days remaining</div>
          </div>

          <div className="card" style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div className="card-head" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7c3aed", marginBottom: "8px" }}>
              <div className="card-icon" style={{ backgroundColor: "#f5f3ff", padding: "6px", borderRadius: "8px" }}><FaRegClock /></div>
              <strong style={{ fontSize: "12px", fontWeight: "600" }}>Total Unpaid Leave (This Year)</strong>
            </div>
            <div className="value" style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: "4px 0" }}>{summary.totalUnpaidTakenThisYear} Days</div>
            <div className="muted" style={{ fontSize: "11px", color: "#64748b" }}>Days taken beyond paid limit</div>
          </div>
        </div>

        {/* Calendar-style Monthly Display and Side Summary */}
        <div className="calendar-section" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px", marginBottom: "24px", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", backgroundColor: "#ffffff" }}>
          
          <div className="calendar-container">
            <div className="calendar-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#2563eb" }}><FaRegCalendarAlt /></span>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Leave Usage Calendar (This Month)</span>
              </div>
              <div className="calendar-nav-controls" style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "4px 12px" }}>
                <button onClick={handlePrevMonth} style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#64748b" }}><FaArrowLeft /></button>
                <span style={{ fontWeight: "700", color: "#1e293b", minWidth: "100px", textAlign: "center" }}>{MONTHS[currentMonth]} {currentYear}</span>
                <button onClick={handleNextMonth} style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#64748b" }}><FaArrowRight /></button>
              </div>
            </div>

            {/* Calendar Legend */}
            <div className="calendar-legend" style={{ display: "flex", gap: "16px", marginBottom: "16px", fontSize: "12px", fontWeight: "600", color: "#64748b" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#16a34a" }} />
                <span>Paid Leave (Within {MONTHLY_PAID_LIMIT} days)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                <span>Unpaid Leave (Beyond {MONTHLY_PAID_LIMIT} days)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#94a3b8" }} />
                <span>No Leave Taken</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} style={{ textAlign: "center", fontWeight: "700", color: "#475569", fontSize: "13px", padding: "8px 0" }}>{day}</div>
              ))}
              {cells.map((cell, index) => {
                const dateStr = cell.date.getFullYear() + "-" + String(cell.date.getMonth() + 1).padStart(2, '0') + "-" + String(cell.date.getDate()).padStart(2, '0');
                const leaveStatus = cell.isCurrentMonth ? leaveDaysDetail[dateStr] : null;
                const isToday = cell.date.toDateString() === new Date().toDateString();
                
                return (
                  <div 
                    key={index} 
                    style={{ 
                      position: "relative",
                      height: "54px", 
                      border: leaveStatus === "Paid" ? "1px solid #bbf7d0" : leaveStatus === "Unpaid" ? "1px solid #fecaca" : (isToday ? "2px solid #2563eb" : "1px solid #e2e8f0"), 
                      borderRadius: "8px", 
                      padding: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      backgroundColor: leaveStatus === "Paid" ? "#f0fdf4" : leaveStatus === "Unpaid" ? "#fef2f2" : (cell.isCurrentMonth ? "#ffffff" : "#f8fafc"),
                      opacity: cell.isCurrentMonth ? 1 : 0.4
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: "700", color: leaveStatus === "Paid" ? "#16a34a" : leaveStatus === "Unpaid" ? "#dc2626" : (cell.isCurrentMonth ? "#1e293b" : "#94a3b8") }}>{cell.day}</span>
                    {leaveStatus === "Paid" && (
                      <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#16a34a", alignSelf: "center" }} />
                    )}
                    {leaveStatus === "Unpaid" && (
                      <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444", alignSelf: "center" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Monthly Summary Panel */}
          <div className="calendar-side-summary" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                This Month Summary ({MONTHS[currentMonth]} {currentYear})
              </h4>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", padding: "10px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "13px", fontWeight: "600" }}>
                  <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#16a34a" }} />
                  <span>Paid Leave Used</span>
                </div>
                <strong style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{paidCount} Days</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", padding: "10px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "13px", fontWeight: "600" }}>
                  <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                  <span>Unpaid Leave Used</span>
                </div>
                <strong style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{unpaidCount} {unpaidCount === 1 ? "Day" : "Days"}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "13px", fontWeight: "600" }}>
                  <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#3b82f6" }} />
                  <span>Total Leave Used</span>
                </div>
                <strong style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{totalCount} {totalCount === 1 ? "Day" : "Days"}</strong>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px", backgroundColor: "#eff6ff", color: "#2563eb", borderRadius: "8px", fontSize: "12px", fontWeight: "600", marginTop: "16px" }}>
              <FaInfoCircle />
              <span>Monthly paid leave limit: {MONTHLY_PAID_LIMIT} Days</span>
            </div>
          </div>
        </div>

        {/* Request Summary (All Time) at the bottom */}
        <div style={{ marginTop: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", marginBottom: "16px" }}>Request Summary (All Time)</h3>
          
          <div className="summary-cards" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "24px" }}>
            <div className="card" style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <div className="card-head" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#16a34a", marginBottom: "8px" }}>
                <FaCheck />
                <strong style={{ fontSize: "12px", fontWeight: "600" }}>Approved Requests</strong>
              </div>
              <div className="value" style={{ fontSize: "20px", fontWeight: "800", color: "#16a34a" }}>{summary.approved}</div>
              <div className="muted" style={{ fontSize: "11px", color: "#16a34a", opacity: 0.8 }}>Total approved leaves</div>
            </div>

            <div className="card" style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
              <div className="card-head" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#dc2626", marginBottom: "8px" }}>
                <FaTimes />
                <strong style={{ fontSize: "12px", fontWeight: "600" }}>Rejected Requests</strong>
              </div>
              <div className="value" style={{ fontSize: "20px", fontWeight: "800", color: "#dc2626" }}>{summary.rejected}</div>
              <div className="muted" style={{ fontSize: "11px", color: "#dc2626", opacity: 0.8 }}>Total rejected requests</div>
            </div>

            <div className="card" style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#fff7ed", border: "1px solid #ffedd5" }}>
              <div className="card-head" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ea580c", marginBottom: "8px" }}>
                <FaRegClock />
                <strong style={{ fontSize: "12px", fontWeight: "600" }}>Pending Requests</strong>
              </div>
              <div className="value" style={{ fontSize: "20px", fontWeight: "800", color: "#ea580c" }}>{summary.pending}</div>
              <div className="muted" style={{ fontSize: "11px", color: "#ea580c", opacity: 0.8 }}>Awaiting approval</div>
            </div>

            <div className="card" style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#faf5ff", border: "1px solid #f3e8ff" }}>
              <div className="card-head" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7c3aed", marginBottom: "8px" }}>
                <FaTimes />
                <strong style={{ fontSize: "12px", fontWeight: "600" }}>Cancelled Requests</strong>
              </div>
              <div className="value" style={{ fontSize: "20px", fontWeight: "800", color: "#7c3aed" }}>{summary.cancelled}</div>
              <div className="muted" style={{ fontSize: "11px", color: "#7c3aed", opacity: 0.8 }}>Total cancelled requests</div>
            </div>

            <div className="card" style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <div className="card-head" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#2563eb", marginBottom: "8px" }}>
                <FaFileAlt />
                <strong style={{ fontSize: "12px", fontWeight: "600" }}>Total Requests</strong>
              </div>
              <div className="value" style={{ fontSize: "20px", fontWeight: "800", color: "#2563eb" }}>{summary.totalRequests}</div>
              <div className="muted" style={{ fontSize: "11px", color: "#2563eb", opacity: 0.8 }}>All time requests</div>
            </div>
          </div>
        </div>

        {/* Notice Section */}
        <div className="apply-leave-notice" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", borderRadius: "10px", backgroundColor: "#fffbeb", border: "1px solid #fef3c7", color: "#d97706", fontSize: "13px", fontWeight: "500", marginTop: "16px" }}>
          <span>💡</span>
          <strong>Note:</strong> If you take more than {MONTHLY_PAID_LIMIT} days of leave in a month, the extra days will be marked as unpaid leave.
        </div>
      </div>
    </div>
  );
}

function LeaveHistoryView({ onNewLeaveClick, refreshKey, onRefresh }) {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRange, setSelectedRange] = useState("all");
  const [selectedPaymentType, setSelectedPaymentType] = useState("all");
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchLeaveHistory();
  }, [refreshKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedRange, selectedPaymentType, leaveHistory, itemsPerPage]);

  const fetchLeaveHistory = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:5000/api/leave/history/${user.id}`);
      const data = await response.json();
      if (data.success) setLeaveHistory(data.leaves);
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
        // Re-fetch history (other leaves may have been recalculated)
        fetchLeaveHistory();
        // Also bubble up so parent can refresh balance / summary
        if (onRefresh) onRefresh();
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

    // Filter by payment type
    const paymentType = leave.payment_type || "Paid";
    const paymentTypeMatches =
      selectedPaymentType === "all" ||
      paymentType.toLowerCase() === selectedPaymentType.toLowerCase();

    if (!paymentTypeMatches) return false;

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

  const getPaymentTypeBadge = (leave) => {
    const paymentType = leave.payment_type || "Paid";
    const paid = leave.paid_days ?? leave.leave_days ?? 0;
    const unpaid = leave.unpaid_days ?? 0;

    let style = {
      backgroundColor: "#f0fdf4",
      color: "#16a34a",
      border: "1px solid #bbf7d0",
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "fit-content"
    };
    let text = `${paid} Paid`;

    if (paymentType === "Partly Paid") {
      style.backgroundColor = "#ffe4e6";
      style.color = "#be123c";
      style.border = "1px solid #fecaca";
      text = `${paid} Paid + ${unpaid} Unpaid`;
    } else if (paymentType === "Unpaid") {
      style.backgroundColor = "#fef2f2";
      style.color = "#dc2626";
      style.border = "1px solid #fecaca";
      text = `${unpaid} Unpaid`;
    }

    return (
      <div style={{ display: "inline-flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
        <span style={style}>{paymentType}</span>
        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "500" }}>{text}</span>
      </div>
    );
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
          {/* Status Filter */}
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

          {/* Payment Type Filter */}
          <div className="filter-select-wrap">
            <select
              aria-label="Filter payment type"
              value={selectedPaymentType}
              onChange={(e) => setSelectedPaymentType(e.target.value)}
            >
              <option value="all">Payment Type: All</option>
              <option value="Paid">Paid</option>
              <option value="Partly Paid">Partly Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
            <FaChevronDown className="filter-select-chevron" />
          </div>

          {/* Date Range Filter */}
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
              <th>Payment</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data-td">No leave history found</td>
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
                  <td>
                    {getPaymentTypeBadge(leave)}
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
              onRefresh={() => setLeaveRefreshKey((prev) => prev + 1)}
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
