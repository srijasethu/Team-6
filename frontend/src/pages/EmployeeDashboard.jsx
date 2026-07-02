import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
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
}) {
  return (
    <div className={`avatar-wrapper${large ? " large" : ""}`}>
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
          accept="image/png, image/jpeg, image/jpg"
          style={{ display: "none" }}
          onChange={onPhotoChange}
        />
      )}
      <button
        type="button"
        className="avatar-edit-btn"
        title="Edit profile photo"
        onClick={() => {
          if (fileInputRef && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
      >
        <FaPencilAlt />
      </button>
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
  const [leaveType, setLeaveType] = useState("");
  const [reason, setReason] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [balance, setBalance] = useState({ total: ANNUAL_PAID_ALLOCATION, remaining: ANNUAL_PAID_ALLOCATION });
  const [existingLeaves, setExistingLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, type: null, paid: 0, unpaid: 0 });
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Body scroll lock inside ApplyLeaveForm — prevents page scroll when child modals are open
  useEffect(() => {
    const anyModalOpen = confirmModal.show || showPolicyModal;
    if (anyModalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [confirmModal.show, showPolicyModal]);

  // Read gender from localStorage to restrict leave type options
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userGender = storedUser.gender || "";


  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  const twelveMonthsAhead = new Date(today.getFullYear(), today.getMonth() + 12, today.getDate());

  // Date picker rules per leave type
  const getDatePickerRules = () => {
    if (leaveType === "Personal Leave") {
      return { fromMin: today, fromMax: endOfNextMonth, toMax: endOfNextMonth };
    }
    if (leaveType === "Medical Leave") {
      return { fromMin: startOfCurrentMonth, fromMax: endOfNextMonth, toMax: endOfNextMonth };
    }
    if (leaveType === "Maternity Leave" || leaveType === "Paternity Leave") {
      return { fromMin: tomorrow, fromMax: twelveMonthsAhead, toMax: twelveMonthsAhead };
    }
    // Default / no type selected
    return { fromMin: today, fromMax: endOfNextMonth, toMax: endOfNextMonth };
  };

  const { fromMin, fromMax, toMax } = getDatePickerRules();
  const fromMinDate = fromMin;
  const fromMaxDate = fromMax;
  const toMinDate = fromDate ? fromDate : fromMinDate;
  const toMaxDate = toMax;

  const calculatePreview = (from, to) => {
    if (!from || !to) return { total: 0, excluded: 0, actual: 0, paid: 0, unpaid: 0 };
    
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

    const holidayDates = new Set(holidays.map(h => h.holiday_date));

    const approvedOrPendingDaysByMonth = {};
    existingLeaves.forEach((leave) => {
      const status = leave.status.toLowerCase();
      if (status !== "approved" && status !== "pending") return;
      // Skip Maternity/Paternity from monthly counter
      if (leave.leave_type === "Maternity Leave" || leave.leave_type === "Paternity Leave") return;

      let curr = parseLocal(leave.start_date);
      const end = parseLocal(leave.end_date);
      if (!curr || !end) return;

      while (curr <= end) {
        const dateStr = toYYYYMMDD(curr);
        const isSunday = curr.getDay() === 0;
        const isHoliday = holidayDates.has(dateStr);

        if (!isSunday && !isHoliday) {
          const monthKey = toYYYYMM(curr);
          if (!approvedOrPendingDaysByMonth[monthKey]) {
            approvedOrPendingDaysByMonth[monthKey] = new Set();
          }
          approvedOrPendingDaysByMonth[monthKey].add(dateStr);
        }
        curr.setDate(curr.getDate() + 1);
      }
    });

    let paid = 0;
    let unpaid = 0;
    let total = 0;       // total calendar days
    let excluded = 0;   // Sundays + holidays
    let actual = 0;     // working leave days
    let benefitCounter = 0; // counts actual days against benefit quota

    const maxBenefitDays = leaveType === "Maternity Leave" ? 182 : (leaveType === "Paternity Leave" ? 15 : 0);
    const isBenefitType = maxBenefitDays > 0;

    let curr = parseLocal(from);
    const end = parseLocal(to);

    while (curr <= end) {
      total++;
      const dateStr = toYYYYMMDD(curr);
      const isSunday = curr.getDay() === 0;
      const isHoliday = holidayDates.has(dateStr);

      if (isSunday || isHoliday) {
        excluded++;
      } else {
        actual++;
        const monthKey = toYYYYMM(curr);
        if (!approvedOrPendingDaysByMonth[monthKey]) {
          approvedOrPendingDaysByMonth[monthKey] = new Set();
        }

        if (isBenefitType) {
          benefitCounter++;
          if (benefitCounter <= maxBenefitDays) {
            // Within benefit quota — fully paid, does NOT consume monthly balance
            paid++;
          } else {
            // Benefit exhausted — try monthly paid balance
            const countInMonth = approvedOrPendingDaysByMonth[monthKey].size;
            if (countInMonth < MONTHLY_PAID_LIMIT) {
              paid++;
              approvedOrPendingDaysByMonth[monthKey].add(dateStr);
            } else {
              unpaid++;
            }
          }
        } else {
          const countInMonth = approvedOrPendingDaysByMonth[monthKey].size;
          if (countInMonth < MONTHLY_PAID_LIMIT) {
            paid++;
            approvedOrPendingDaysByMonth[monthKey].add(dateStr);
          } else {
            unpaid++;
          }
        }
      }
      curr.setDate(curr.getDate() + 1);
    }

    return { total, excluded, actual, paid, unpaid };
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

    fetch("http://localhost:5000/api/holidays")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setHolidays(d.holidays || []);
        }
      })
      .catch(() => {});
  }, []);

  const handleReset = () => {
    setLeaveType("");
    setFromDate(null);
    setToDate(null);
    setFromTime("09:00 AM");
    setToTime("05:00 PM");
    setReason("");
    setCharCount(0);
    setSubmitError("");
  };

  // The actual API call — invoked either directly (Paid) or after modal confirmation
  const doSubmit = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) { alert("User not found. Please login again."); return; }
    setConfirmModal({ show: false, type: null, paid: 0, unpaid: 0 });
    setSubmitError("");
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
        handleReset();
        if (onApplyLeave) onApplyLeave();
      } else {
        setSubmitError(data.message || "Leave application failed. Please try again.");
      }
    } catch (err) {
      console.error("Apply leave error:", err);
      setSubmitError("Backend connection failed. Please check your network.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const paid = preview.paid;
    const unpaid = preview.unpaid;

    // For Maternity and Paternity leave, submit directly without a confirmation popup since the split is informational and expected.
    if (leaveType === "Maternity Leave" || leaveType === "Paternity Leave") {
      doSubmit();
      return;
    }

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
            <button
              type="button"
              onClick={() => setShowPolicyModal(true)}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "9px 16px", borderRadius: "8px",
                border: "1.5px solid #2563eb", background: "#eff6ff",
                color: "#2563eb", fontWeight: "700", fontSize: "13px",
                cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap"
              }}
            >
              <FaFileAlt /> View Leave Policy
            </button>
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
                setSubmitError("");
              }}
            >
              <option value="" disabled>Select Leave Type</option>
              <option>Personal Leave</option>
              <option>Medical Leave</option>
              <option
                disabled={userGender === "Male"}
                style={userGender === "Male" ? { color: "#9ca3af" } : {}}
              >
                {userGender === "Male" ? "Maternity Leave (Not Applicable)" : "Maternity Leave"}
              </option>
              <option
                disabled={userGender === "Female"}
                style={userGender === "Female" ? { color: "#9ca3af" } : {}}
              >
                {userGender === "Female" ? "Paternity Leave (Not Applicable)" : "Paternity Leave"}
              </option>
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

        {preview.total > 0 && (() => {
          const toYYYYMMDD = (d) =>
            d.getFullYear() + "-" +
            String(d.getMonth() + 1).padStart(2, "0") + "-" +
            String(d.getDate()).padStart(2, "0");

          const holidayDates = new Set(holidays.map((h) => h.holiday_date));
          const holidayNames = {};
          holidays.forEach((h) => { holidayNames[h.holiday_date] = h.holiday_name; });

          const overlapping = [];
          if (fromDate && toDate) {
            let cur = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
            const end = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
            while (cur <= end) {
              const ds = toYYYYMMDD(cur);
              if (cur.getDay() === 0) {
                overlapping.push({ date: ds, label: "Sunday (Weekly Off)" });
              } else if (holidayDates.has(ds)) {
                overlapping.push({ date: ds, label: holidayNames[ds] || "Holiday" });
              }
              cur.setDate(cur.getDate() + 1);
            }
          }

          return (
            <div style={{
              display: "flex", flexDirection: "column", gap: "8px",
              padding: "12px 16px", borderRadius: "10px",
              backgroundColor: "#f0f9ff", border: "1px solid #bae6fd",
              marginTop: "16px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaRegCalendarAlt style={{ color: "#0284c7", fontSize: "14px", flexShrink: 0 }} />
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#0c4a6e" }}>
                  Total Selected: {preview.total} {preview.total === 1 ? "Day" : "Days"}
                </span>
              </div>
              {overlapping.length > 0 && (
                <div style={{ paddingLeft: "24px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#0369a1", marginBottom: "4px" }}>
                    ℹ️ The following dates are holidays / weekly off:
                  </div>
                  <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: "2px" }}>
                    {overlapping.map((item) => (
                      <li key={item.date} style={{ fontSize: "12px", color: "#075985" }}>
                        {item.date} — {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })()}


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

        {submitError && (
          <div className="apply-leave-error-banner">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{submitError}</span>
          </div>
        )}

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
        <div className="confirm-modal-overlay">
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

      {/* ── Leave Policy Modal ──────────────────────────────────── */}
      {showPolicyModal && (
        <div className="modal-overlay" onClick={() => setShowPolicyModal(false)}>
          <div className="policy-modal-card" style={{
            borderRadius: "20px",
            boxShadow: "0 30px 80px rgba(0,0,0,0.18)",
            width: "100%", maxWidth: "680px", maxHeight: "88vh",
            overflowY: "auto", fontFamily: "'Poppins', sans-serif"
          }} onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={{
              background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
              borderRadius: "20px 20px 0 0", padding: "28px 32px 22px",
              color: "#ffffff", position: "sticky", top: 0, zIndex: 1
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "600", opacity: 0.7, letterSpacing: "1.5px", marginBottom: "6px" }}>
                    TOUCHMARK TECHNOLOGIES
                  </div>
                  <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>📄 Company Leave Policy</h2>
                  <p style={{ margin: "6px 0 0", fontSize: "13px", opacity: 0.8 }}>
                    Effective from January 2026 · All employees are subject to this policy
                  </p>
                </div>
                <button type="button" onClick={() => setShowPolicyModal(false)}
                  style={{ border: "none", background: "rgba(255,255,255,0.15)", color: "#fff",
                    borderRadius: "8px", width: "36px", height: "36px", cursor: "pointer",
                    fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "28px 32px" }}>

              {/* Monthly Paid Leave */}
              <PolicySection type="monthly-paid" title="🗓 Monthly Paid Leave Limit" color="#2563eb" bg="#eff6ff" border="#bfdbfe">
                <PolicyRow label="Paid leave days per month" value="3 days" />
                <PolicyRow label="Leave beyond 3 days in a month" value="Becomes Unpaid Leave" highlight="red" />
                <PolicyRow label="Maximum paid leave per year" value="36 days (3 × 12 months)" />
              </PolicySection>

              {/* Use It or Lose It */}
              <PolicySection type="use-or-lose" title="⚠️ Use It or Lose It Policy" color="#b45309" bg="#fffbeb" border="#fde68a">
                <PolicyRow label="Monthly leave expiry" value="End of each calendar month" highlight="red" />
                <PolicyRow label="Carry forward" value="Not allowed" highlight="red" />
                <PolicyRow label="Accumulation" value="Not allowed" highlight="red" />
                <PolicyRow label="Cash conversion" value="Not allowed" highlight="red" />
                <PolicyNote>
                  Unused monthly leave cannot be carried forward, accumulated for future months, or converted into monetary compensation.
                  Employees are encouraged to utilize their allocated leave within the month, otherwise it will expire automatically.
                </PolicyNote>
              </PolicySection>

              {/* Personal Leave */}
              <PolicySection type="personal" title="👤 Personal Leave" color="#0891b2" bg="#ecfeff" border="#a5f3fc">
                <PolicyRow label="Paid days per month" value="3 days (shared monthly pool)" />
                <PolicyRow label="Beyond monthly limit" value="Becomes Unpaid Leave" highlight="red" />
                <PolicyRow label="Past dates" value="Not allowed" highlight="red" />
                <PolicyRow label="Allowed period" value="Current month + next month only" />
                <PolicyNote>Marriage, personal errands, and other personal reasons fall under Personal Leave.</PolicyNote>
              </PolicySection>

              {/* Medical Leave */}
              <PolicySection type="medical" title="🏥 Medical Leave" color="#16a34a" bg="#f0fdf4" border="#bbf7d0">
                <PolicyRow label="Paid days per month" value="3 days (shared with Personal Leave pool)" />
                <PolicyRow label="Beyond monthly limit" value="Becomes Unpaid Leave" highlight="red" />
                <PolicyRow label="Medical certificate" value="Not required" highlight="green" />
                <PolicyRow label="Past dates" value="Allowed (within current month)" highlight="green" />
                <PolicyRow label="Allowed period" value="Past dates + current month + next month" />
              </PolicySection>

              {/* Maternity Leave */}
              <PolicySection type="maternity" title="🤱 Maternity Leave" color="#db2777" bg="#fdf2f8" border="#f9a8d4">
                <PolicyRow label="Eligible employees" value="Female employees" />
                <PolicyRow label="Duration" value="+182 paid days" highlight="green" />
                <PolicyRow label="Payment" value="Fully Paid — independent of monthly limit" highlight="green" />
                <PolicyRow label="Impact on Personal / Medical limit" value="None" />
                <PolicyRow label="Date restrictions" value="Future dates only (up to 12 months in advance)" />
                <PolicyRow label="Frequency limit" value="Can be applied only once in a year" highlight="red" />
              </PolicySection>

              {/* Paternity Leave */}
              <PolicySection type="paternity" title="👨‍👧 Paternity Leave" color="#7c3aed" bg="#f5f3ff" border="#ddd6fe">
                <PolicyRow label="Eligible employees" value="Male employees" />
                <PolicyRow label="Duration" value="+15 paid days" highlight="green" />
                <PolicyRow label="Payment" value="Fully Paid — independent of monthly limit" highlight="green" />
                <PolicyRow label="Impact on Personal / Medical limit" value="None" />
                <PolicyRow label="Date restrictions" value="Future dates only (up to 12 months in advance)" />
                <PolicyRow label="Frequency limit" value="Can be applied only once in a year" highlight="red" />
              </PolicySection>

              {/* Weekly Holidays */}
              <PolicySection type="weekly-off" title="🟠 Weekly Holidays" color="#ea580c" bg="#fff7ed" border="#fed7aa">
                <PolicyRow label="Weekly off day" value="Every Sunday" />
                <PolicyRow label="Counted as leave" value="No — Sundays are not counted as leave days" highlight="green" />
              </PolicySection>

              {/* Public & Company Holidays */}
              <PolicySection type="public-holidays" title="🔵 Public Holidays &amp; Company Holidays" color="#1e40af" bg="#eff6ff" border="#bfdbfe">
                <PolicyRow label="Public / Festival holidays" value="Not counted as leave days" highlight="green" />
                <PolicyRow label="Company holidays" value="Added by manager — not counted as leave days" highlight="green" />
                <PolicyNote>Public, festival, and company holidays do not reduce your paid leave balance.</PolicyNote>
              </PolicySection>

              {/* Leave Approval Process */}
              <PolicySection type="approval-process" title="✅ Leave Approval Process" color="#475569" bg="#f8fafc" border="#e2e8f0">
                <PolicyRow label="Step 1" value="Employee submits leave application" />
                <PolicyRow label="Step 2" value="Manager reviews and approves or rejects" />
                <PolicyRow label="Step 3" value="Employee is notified via Leave Summary" />
                <PolicyNote>Only Pending leaves can be cancelled by the employee.</PolicyNote>
              </PolicySection>

              {/* Calculation Rules */}
              <PolicySection type="calculation" title="📊 Leave Calculation Rules" color="#475569" bg="#f8fafc" border="#e2e8f0">
                <PolicyRow label="Leave days counted" value="Calendar days (weekends included)" />
                <PolicyRow label="Paid limit calculation" value="Per calendar month independently" />
                <PolicyRow label="Personal + Medical share" value="Same 3-day monthly paid pool" />
                <PolicyRow label="Overlapping leave requests" value="Not allowed" />
                <PolicyRow label="Maternity / Paternity" value="Does NOT consume the 3-day monthly quota" />
              </PolicySection>

            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "20px 32px 28px", display: "flex", gap: "12px",
              justifyContent: "flex-end", borderTop: "1px solid #e2e8f0"
            }}>
              <button type="button" onClick={() => setShowPolicyModal(false)}
                className="policy-modal-close-btn"
                style={{
                  padding: "10px 22px", borderRadius: "8px",
                  border: "1.5px solid #cbd5e1",
                  color: "#475569", fontWeight: "600", fontSize: "14px", cursor: "pointer"
                }}>
                Close
              </button>
              <button type="button"
                onClick={() => {
                  const doc = new jsPDF({ unit: "mm", format: "a4" });
                  const W = doc.internal.pageSize.getWidth();
                  let y = 0;

                  const checkPage = (needed = 10) => {
                    if (y + needed > 280) { doc.addPage(); y = 20; }
                  };

                  // Header gradient rectangle
                  doc.setFillColor(37, 99, 235);
                  doc.rect(0, 0, W, 42, "F");
                  doc.setTextColor(255, 255, 255);
                  doc.setFont("helvetica", "bold");
                  doc.setFontSize(9);
                  doc.text("TOUCHMARK TECHNOLOGIES", 14, 14);
                  doc.setFontSize(18);
                  doc.text("Company Leave Policy", 14, 26);
                  doc.setFont("helvetica", "normal");
                  doc.setFontSize(9);
                  doc.text("Effective from January 2026 · All employees are subject to this policy", 14, 35);
                  y = 52;

                  const addSection = (title, rows, notes = []) => {
                    checkPage(20);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(11);
                    doc.setTextColor(30, 58, 138);
                    doc.text(title, 14, y);
                    y += 2;
                    doc.setDrawColor(37, 99, 235);
                    doc.setLineWidth(0.4);
                    doc.line(14, y, W - 14, y);
                    y += 6;

                    rows.forEach(([label, value]) => {
                      checkPage(8);
                      doc.setFont("helvetica", "bold");
                      doc.setFontSize(9);
                      doc.setTextColor(71, 85, 105);
                      doc.text(label + ":", 16, y);
                      doc.setFont("helvetica", "normal");
                      doc.setTextColor(30, 41, 59);
                      doc.text(value, 80, y);
                      y += 7;
                    });

                    notes.forEach((note) => {
                      checkPage(8);
                      doc.setFont("helvetica", "italic");
                      doc.setFontSize(8.5);
                      doc.setTextColor(100, 116, 139);
                      doc.text("* " + note, 16, y);
                      y += 6;
                    });
                    y += 6;
                  };

                  addSection("Monthly Paid Leave Limit", [
                    ["Paid leave days per month", "3 days"],
                    ["Leave beyond 3 days in a month", "Becomes Unpaid Leave"],
                    ["Maximum paid leave per year", "36 days (3 x 12 months)"],
                  ]);

                  addSection("Use It or Lose It Policy", [
                    ["Monthly leave expiry", "End of each calendar month"],
                    ["Carry forward", "Not allowed"],
                    ["Accumulation", "Not allowed"],
                    ["Cash conversion", "Not allowed"],
                  ], [
                    "Unused monthly leave cannot be carried forward, accumulated for future months, or",
                    "converted into monetary compensation. Employees are encouraged to utilize their",
                    "allocated leave within the month, otherwise it will expire automatically."
                  ]);

                  addSection("Personal Leave", [
                    ["Paid days per month", "3 days (shared monthly pool)"],
                    ["Beyond monthly limit", "Becomes Unpaid Leave"],
                    ["Past dates", "Not allowed"],
                    ["Allowed period", "Current month + next month only"],
                  ], ["Marriage and other personal reasons fall under Personal Leave."]);

                  addSection("Medical Leave", [
                    ["Paid days per month", "3 days (shared with Personal Leave pool)"],
                    ["Beyond monthly limit", "Becomes Unpaid Leave"],
                    ["Medical certificate", "Not required"],
                    ["Past dates", "Allowed (within current month)"],
                    ["Allowed period", "Past dates + current month + next month"],
                  ]);

                  addSection("Maternity Leave", [
                    ["Eligible employees", "Female employees"],
                    ["Duration", "+182 paid days"],
                    ["Payment", "Fully Paid — independent of monthly limit"],
                    ["Impact on Personal / Medical limit", "None"],
                    ["Date restrictions", "Future dates only (up to 12 months in advance)"],
                    ["Frequency limit", "Can be applied only once in a year"],
                  ]);

                  addSection("Paternity Leave", [
                    ["Eligible employees", "Male employees"],
                    ["Duration", "+15 paid days"],
                    ["Payment", "Fully Paid — independent of monthly limit"],
                    ["Impact on Personal / Medical limit", "None"],
                    ["Date restrictions", "Future dates only (up to 12 months in advance)"],
                    ["Frequency limit", "Can be applied only once in a year"],
                  ]);

                  addSection("Weekly Holidays", [
                    ["Weekly off day", "Every Sunday"],
                    ["Counted as leave", "No — Sundays are not counted as leave days"],
                  ]);

                  addSection("Public Holidays & Company Holidays", [
                    ["Public / Festival holidays", "Not counted as leave days"],
                    ["Company holidays", "Added by manager — not counted as leave days"],
                  ], ["Public, festival, and company holidays do not reduce your paid leave balance."]);

                  addSection("Leave Approval Process", [
                    ["Step 1", "Employee submits leave application"],
                    ["Step 2", "Manager reviews and approves or rejects"],
                    ["Step 3", "Employee is notified via Leave Summary"],
                  ], ["Only Pending leaves can be cancelled by the employee."]);

                  addSection("Leave Calculation Rules", [
                    ["Leave days counted", "Calendar days (weekends included)"],
                    ["Paid limit calculation", "Per calendar month independently"],
                    ["Personal + Medical share", "Same 3-day monthly paid pool"],
                    ["Overlapping leave requests", "Not allowed"],
                    ["Maternity / Paternity", "Does NOT consume the 3-day monthly quota"],
                  ]);

                  // Footer
                  const pages = doc.internal.getNumberOfPages();
                  for (let i = 1; i <= pages; i++) {
                    doc.setPage(i);
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(`Page ${i} of ${pages}  ·  Touchmark Technologies Leave Policy 2026`, 14, 290);
                  }

                  doc.save("Touchmark_Leave_Policy_2026.pdf");
                }}
                className="policy-modal-download-btn"
                style={{
                  padding: "10px 22px", borderRadius: "8px", border: "none",
                  background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                  color: "#fff", fontWeight: "700", fontSize: "14px",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
                }}>
                <FaFileAlt /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper sub-components for the Leave Policy Modal ──────────
function PolicySection({ title, color, bg, border, children, type }) {
  return (
    <div className={`policy-section policy-section-${type}`} style={{
      marginBottom: "20px", borderRadius: "12px",
      background: bg, border: `1.5px solid ${border}`, overflow: "hidden"
    }}>
      <div className="policy-section-title" style={{
        padding: "12px 20px", fontWeight: "800", fontSize: "14px",
        color, borderBottom: `1px solid ${border}`
      }}>{title}</div>
      <div style={{ padding: "14px 20px 10px" }}>{children}</div>
    </div>
  );
}
function PolicyRow({ label, value, highlight }) {
  return (
    <div className="policy-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      padding: "5px 0", borderBottom: "1px solid rgba(0,0,0,0.04)", gap: "12px" }}>
      <span className="policy-row-label" style={{ fontSize: "13px", fontWeight: "600", flexShrink: 0 }}>{label}</span>
      <span className={`policy-row-value ${highlight ? `highlight-${highlight}` : ''}`}>{value}</span>
    </div>
  );
}
function PolicyNote({ children }) {
  return (
    <p className="policy-note" style={{ margin: "8px 0 0", fontSize: "12px",
      fontStyle: "italic", lineHeight: 1.5 }}>💡 {children}</p>
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
              <span>
                <FaRegUser />
                {profileData.gender || "Male"}
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
  const [holidays, setHolidays] = useState([]);
  const [selectedCalDate, setSelectedCalDate] = useState(null);
  const [showCalDetailModal, setShowCalDetailModal] = useState(false);
  const [employeeGender, setEmployeeGender] = useState("");
  
  const todayDate = new Date();
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth()); // 0-indexed

  // Body scroll lock — prevents page scroll when calendar detail modal is open
  useEffect(() => {
    if (showCalDetailModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [showCalDetailModal]);

  useEffect(() => {
    fetchLeaveSummary();
  }, []);

  const fetchLeaveSummary = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    // Prefer gender from DB (authoritative); fall back to localStorage while loading
    if (user.gender) setEmployeeGender(user.gender);

    try {
      const profileRes = await fetch(`http://localhost:5000/api/profile/get/${user.id}`);
      const profileData = await profileRes.json();
      if (profileData.success && profileData.user) {
        const freshGender = profileData.user.gender || "Male";
        setEmployeeGender(freshGender);
        // Keep localStorage in sync
        const stored = JSON.parse(localStorage.getItem("user")) || {};
        localStorage.setItem("user", JSON.stringify({ ...stored, gender: freshGender }));
      }
    } catch (err) {
      console.error("Fetch gender error:", err);
    }

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

    try {
      const hResponse = await fetch("http://localhost:5000/api/holidays");
      const hData = await hResponse.json();
      if (hData.success) {
        setHolidays(hData.holidays || []);
      }
    } catch (error) {
      console.error("Fetch holidays error:", error);
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

    const holidayDates = new Set(holidays.map(h => h.holiday_date));
    const detail = {};
    let paidCount = 0;
    let unpaidCount = 0;

    // Sort all approved leaves chronologically
    const approvedLeaves = allLeaves
      .filter(leave => leave.status.toLowerCase() === "approved")
      .sort((a, b) => parseLocal(a.start_date) - parseLocal(b.start_date) || a.id - b.id);

    const monthlyUsed = {}; // { 'YYYY-MM': number }

    approvedLeaves.forEach((leave) => {
      const isMaternity = leave.leave_type === "Maternity Leave";
      const isPaternity = leave.leave_type === "Paternity Leave";
      const isBenefitType = isMaternity || isPaternity;
      const maxBenefit = isMaternity ? 182 : 15;
      let benefitCounter = 0;

      let curr = parseLocal(leave.start_date);
      const end = parseLocal(leave.end_date);
      if (!curr || !end) return;

      while (curr <= end) {
        const yyyy = curr.getFullYear();
        const mm = String(curr.getMonth() + 1).padStart(2, '0');
        const dd = String(curr.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const monthKey = `${yyyy}-${mm}`;

        const isSunday = curr.getDay() === 0;
        const isHoliday = holidayDates.has(dateStr);

        if (!isSunday && !isHoliday) {
          let status = "Unpaid";
          if (isBenefitType) {
            benefitCounter++;
            if (benefitCounter <= maxBenefit) {
              status = "Paid";
            } else {
              // Overflow: uses monthly paid leave balance
              if (!monthlyUsed[monthKey]) monthlyUsed[monthKey] = 0;
              if (monthlyUsed[monthKey] < MONTHLY_PAID_LIMIT) {
                status = "Paid";
                monthlyUsed[monthKey]++;
              }
            }
          } else {
            if (!monthlyUsed[monthKey]) monthlyUsed[monthKey] = 0;
            if (monthlyUsed[monthKey] < MONTHLY_PAID_LIMIT) {
              status = "Paid";
              monthlyUsed[monthKey]++;
            }
          }

          if (curr.getFullYear() === currentYear && curr.getMonth() === currentMonth) {
            detail[dateStr] = status;
            if (status === "Paid") paidCount++;
            else unpaidCount++;
          }
        }
        curr.setDate(curr.getDate() + 1);
      }
    });

    return { detail, paidCount, unpaidCount, totalCount: paidCount + unpaidCount };
  };

  const getYearlySummary = () => {
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

    const currentYear = new Date().getFullYear();
    const approvedLeaves = allLeaves.filter(leave => leave.status.toLowerCase() === "approved");
    const holidayDates = new Set(holidays.map(h => h.holiday_date));
    const monthlyUsed = {}; // { 'YYYY-MM': number }

    let totalPaidTakenThisYear = 0;
    let totalUnpaidTakenThisYear = 0;
    let annualPaidTakenThisYear = 0;

    // Process approved leaves chronologically to compute annual/monthly balance usage
    const sortedApprovedLeaves = [...approvedLeaves].sort((a, b) => parseLocal(a.start_date) - parseLocal(b.start_date) || a.id - b.id);

    sortedApprovedLeaves.forEach((leave) => {
      const isMaternity = leave.leave_type === "Maternity Leave";
      const isPaternity = leave.leave_type === "Paternity Leave";
      const isBenefitType = isMaternity || isPaternity;
      const maxBenefit = isMaternity ? 182 : 15;
      let benefitCounter = 0;

      let curr = parseLocal(leave.start_date);
      const end = parseLocal(leave.end_date);
      if (!curr || !end) return;

      const leaveStartYear = curr.getFullYear();

      while (curr <= end) {
        const yyyy = curr.getFullYear();
        const mm = String(curr.getMonth() + 1).padStart(2, '0');
        const dd = String(curr.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const monthKey = `${yyyy}-${mm}`;

        const isSunday = curr.getDay() === 0;
        const isHoliday = holidayDates.has(dateStr);

        if (!isSunday && !isHoliday) {
          let isPaid = false;
          if (isBenefitType) {
            benefitCounter++;
            if (benefitCounter <= maxBenefit) {
              isPaid = true;
            } else {
              // Overflow: uses monthly paid leave balance
              if (!monthlyUsed[monthKey]) monthlyUsed[monthKey] = 0;
              if (monthlyUsed[monthKey] < MONTHLY_PAID_LIMIT) {
                isPaid = true;
                monthlyUsed[monthKey]++;
                if (leaveStartYear === currentYear) {
                  annualPaidTakenThisYear++;
                }
              }
            }
          } else {
            if (!monthlyUsed[monthKey]) monthlyUsed[monthKey] = 0;
            if (monthlyUsed[monthKey] < MONTHLY_PAID_LIMIT) {
              isPaid = true;
              monthlyUsed[monthKey]++;
              if (leaveStartYear === currentYear) {
                annualPaidTakenThisYear++;
              }
            }
          }

          if (leaveStartYear === currentYear) {
            if (isPaid) {
              totalPaidTakenThisYear++;
            } else {
              totalUnpaidTakenThisYear++;
            }
          }
        }
        curr.setDate(curr.getDate() + 1);
      }
    });

    const remainingPaid = Math.max(0, ANNUAL_PAID_ALLOCATION - annualPaidTakenThisYear);

    return {
      totalPaidTakenThisYear,
      totalUnpaidTakenThisYear,
      remainingPaid
    };
  };

  const { detail: leaveDaysDetail, paidCount, unpaidCount, totalCount } = getMonthlyLeaveDaysDetail();
  const yearlySummary = getYearlySummary();

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
            <div className="value" style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: "4px 0" }}>{yearlySummary.totalPaidTakenThisYear} Days</div>
            <div className="muted" style={{ fontSize: "11px", color: "#64748b" }}>Includes all approved paid leaves</div>
          </div>

          <div className="card" style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div className="card-head" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0d9488", marginBottom: "8px" }}>
              <div className="card-icon" style={{ backgroundColor: "#f0fdfa", padding: "6px", borderRadius: "8px" }}><FaRegChartBar /></div>
              <strong style={{ fontSize: "12px", fontWeight: "600" }}>Total Balance Leave (Paid Yearly)</strong>
            </div>
            <div className="value" style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: "4px 0" }}>{yearlySummary.remainingPaid} Days</div>
            <div className="muted" style={{ fontSize: "11px", color: "#64748b" }}>{ANNUAL_PAID_ALLOCATION} - {yearlySummary.totalPaidTakenThisYear} = {yearlySummary.remainingPaid} days remaining</div>
          </div>

          <div className="card" style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div className="card-head" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7c3aed", marginBottom: "8px" }}>
              <div className="card-icon" style={{ backgroundColor: "#f5f3ff", padding: "6px", borderRadius: "8px" }}><FaRegClock /></div>
              <strong style={{ fontSize: "12px", fontWeight: "600" }}>Total Unpaid Leave (This Year)</strong>
            </div>
            <div className="value" style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: "4px 0" }}>{yearlySummary.totalUnpaidTakenThisYear} Days</div>
            <div className="muted" style={{ fontSize: "11px", color: "#64748b" }}>Days taken beyond paid limit</div>
          </div>
        </div>

        {/* Gender-Based Parental Leave Benefit Card */}
        {employeeGender === "Female" && (
          <div
            className="card"
            style={{
              padding: "20px 24px",
              borderRadius: "12px",
              backgroundColor: "#fdf2f8",
              border: "1.5px solid #f9a8d4",
              marginBottom: "24px",
              display: "flex",
              alignItems: "flex-start",
              gap: "18px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                width: "54px", height: "54px", flexShrink: 0,
                borderRadius: "12px",
                background: "#fce7f3",
                border: "1.5px solid #f9a8d4",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "28px",
              }}
            >
              🤱
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#be185d", marginBottom: "2px" }}>
                Maternity Leave
              </div>
              <div style={{ fontSize: "26px", fontWeight: "900", color: "#db2777", lineHeight: 1.1, margin: "4px 0 2px" }}>
                +182 Days
              </div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#db2777", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Paid Leave Benefit
              </div>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#831843", lineHeight: 1.65, borderTop: "1px dashed #f9a8d4", paddingTop: "10px" }}>
                Female employees are eligible for 182 days of fully paid maternity leave. This benefit is independent of the monthly paid leave balance and does not reduce Personal or Medical Leave.
              </p>
            </div>
          </div>
        )}

        {employeeGender === "Male" && (
          <div
            className="card"
            style={{
              padding: "20px 24px",
              borderRadius: "12px",
              backgroundColor: "#eff6ff",
              border: "1.5px solid #bfdbfe",
              marginBottom: "24px",
              display: "flex",
              alignItems: "flex-start",
              gap: "18px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                width: "54px", height: "54px", flexShrink: 0,
                borderRadius: "12px",
                background: "#dbeafe",
                border: "1.5px solid #bfdbfe",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "28px",
              }}
            >
              👨‍👧
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#1d4ed8", marginBottom: "2px" }}>
                Paternity Leave
              </div>
              <div style={{ fontSize: "26px", fontWeight: "900", color: "#2563eb", lineHeight: 1.1, margin: "4px 0 2px" }}>
                +15 Days
              </div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Paid Leave Benefit
              </div>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#1e3a8a", lineHeight: 1.65, borderTop: "1px dashed #bfdbfe", paddingTop: "10px" }}>
                Male employees are eligible for 15 days of fully paid paternity leave. This benefit is independent of the monthly paid leave balance and does not reduce Personal or Medical Leave.
              </p>
            </div>
          </div>
        )}

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
            <div className="calendar-legend" style={{ display: "flex", gap: "16px", marginBottom: "16px", fontSize: "12px", fontWeight: "600", color: "#64748b", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#16a34a" }} />
                <span>Paid Leave</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                <span>Unpaid Leave</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ea580c" }} />
                <span>Sunday / Weekly Off</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#2563eb" }} />
                <span>Public Holiday / Festival</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#7c3aed" }} />
                <span>Company Holiday</span>
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
                const dayHoliday = holidays.find(h => h.holiday_date === dateStr);
                const isSunday = cell.date.getDay() === 0;
                const isToday = cell.date.toDateString() === new Date().toDateString();
                
                // Determine styling based on rules
                let cellBg = cell.isCurrentMonth ? "#ffffff" : "#f8fafc";
                let cellBorder = isToday ? "2px solid #2563eb" : "1px solid #e2e8f0";
                let cellTextColor = cell.isCurrentMonth ? "#1e293b" : "#94a3b8";

                if (leaveStatus === "Paid") {
                  cellBg = "#f0fdf4";
                  cellBorder = "1px solid #bbf7d0";
                  cellTextColor = "#16a34a";
                } else if (leaveStatus === "Unpaid") {
                  cellBg = "#fef2f2";
                  cellBorder = "1px solid #fecaca";
                  cellTextColor = "#dc2626";
                } else if (cell.isCurrentMonth) {
                  if (isSunday) {
                    cellBg = "#fff7ed";
                    cellBorder = "1px solid #fed7aa";
                    cellTextColor = "#ea580c";
                  } else if (dayHoliday) {
                    if (dayHoliday.holiday_type === "Company Holiday") {
                      cellBg = "#f5f3ff";
                      cellBorder = "1px solid #ddd6fe";
                      cellTextColor = "#7c3aed";
                    } else {
                      cellBg = "#eff6ff";
                      cellBorder = "1px solid #bfdbfe";
                      cellTextColor = "#2563eb";
                    }
                  }
                }

                const hasClickableDetails = isSunday || dayHoliday;

                return (
                  <div 
                    key={index} 
                    onClick={() => {
                      if (hasClickableDetails) {
                        setSelectedCalDate(cell.date);
                        setShowCalDetailModal(true);
                      }
                    }}
                    style={{ 
                      position: "relative",
                      height: "64px", 
                      border: cellBorder, 
                      borderRadius: "8px", 
                      padding: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      backgroundColor: cellBg,
                      opacity: cell.isCurrentMonth ? 1 : 0.4,
                      cursor: hasClickableDetails ? "pointer" : "default"
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: "700", color: cellTextColor }}>{cell.day}</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end" }}>
                      {leaveStatus === "Paid" && (
                        <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#16a34a" }} />
                      )}
                      {leaveStatus === "Unpaid" && (
                        <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                      )}
                      {isSunday && (
                        <span style={{
                          display: "inline-block",
                          backgroundColor: "#ffedd5",
                          color: "#ea580c",
                          padding: "1px 4px",
                          borderRadius: "4px",
                          fontSize: "8.5px",
                          fontWeight: "700",
                          whiteSpace: "nowrap"
                        }}>
                          Weekly Off
                        </span>
                      )}
                      {dayHoliday && (
                        <span style={{
                          display: "inline-block",
                          backgroundColor: dayHoliday.holiday_type === "Company Holiday" ? "#f3e8ff" : "#dbeafe",
                          color: dayHoliday.holiday_type === "Company Holiday" ? "#7c3aed" : "#2563eb",
                          padding: "1px 4px",
                          borderRadius: "4px",
                          fontSize: "8.5px",
                          fontWeight: "700",
                          whiteSpace: "nowrap",
                          maxWidth: "75px",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }} title={dayHoliday.holiday_name}>
                          {dayHoliday.holiday_name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Monthly Summary Panel */}
          <div className="calendar-side-summary">
            <div>
              <h4>
                This Month Summary ({MONTHS[currentMonth]} {currentYear})
              </h4>
              
              <div className="summary-row">
                <div className="summary-row-label">
                  <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#16a34a" }} />
                  <span>Paid Leave Used</span>
                </div>
                <strong className="summary-row-value">{paidCount} Days</strong>
              </div>

              <div className="summary-row">
                <div className="summary-row-label">
                  <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                  <span>Unpaid Leave Used</span>
                </div>
                <strong className="summary-row-value">{unpaidCount} {unpaidCount === 1 ? "Day" : "Days"}</strong>
              </div>

              <div className="summary-row">
                <div className="summary-row-label">
                  <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#3b82f6" }} />
                  <span>Total Leave Used</span>
                </div>
                <strong className="summary-row-value">{totalCount} {totalCount === 1 ? "Day" : "Days"}</strong>
              </div>
            </div>

            <div className="monthly-limit-alert">
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

      {/* Calendar Date Detail Modal */}
      {showCalDetailModal && selectedCalDate && (
        <div className="modal-overlay" onClick={() => setShowCalDetailModal(false)}>
          <div style={{
            background: "#ffffff", borderRadius: "20px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.15)", width: "100%", maxWidth: "450px",
            padding: "30px", border: "1px solid #e2e8f0", fontFamily: "'Poppins', sans-serif"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                📅 Date Details
              </h3>
              <button
                type="button"
                onClick={() => setShowCalDetailModal(false)}
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: "18px", color: "#64748b" }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Common Date Header */}
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>
                Date: {selectedCalDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
              </div>

              {/* Sunday Information */}
              {selectedCalDate.getDay() === 0 && (
                <div style={{
                  padding: "16px", borderRadius: "12px",
                  backgroundColor: "#fff7ed", border: "1.5px solid #fed7aa",
                  display: "flex", flexDirection: "column", gap: "8px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "15px", color: "#ea580c" }}>Weekly Off</strong>
                    <span style={{
                      backgroundColor: "#ffedd5", color: "#ea580c",
                      padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700"
                    }}>
                      Sunday Holiday
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", color: "#7c2d12", lineHeight: "1.5" }}>
                    Sundays are company weekly holidays.
                  </p>
                </div>
              )}

              {/* Holiday Information */}
              {(() => {
                const dateStr = selectedCalDate.getFullYear() + "-" + String(selectedCalDate.getMonth() + 1).padStart(2, '0') + "-" + String(selectedCalDate.getDate()).padStart(2, '0');
                const holiday = holidays.find(h => h.holiday_date === dateStr);
                
                if (holiday) {
                  return (
                    <div style={{
                      padding: "16px", borderRadius: "12px",
                      backgroundColor: holiday.holiday_type === "Company Holiday" ? "#f5f3ff" : "#eff6ff",
                      border: `1.5px solid ${holiday.holiday_type === "Company Holiday" ? "#ddd6fe" : "#bfdbfe"}`,
                      display: "flex", flexDirection: "column", gap: "8px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "15px", color: holiday.holiday_type === "Company Holiday" ? "#7c3aed" : "#1e40af" }}>
                          {holiday.holiday_name}
                        </strong>
                        <span style={{
                          backgroundColor: holiday.holiday_type === "Company Holiday" ? "#f3e8ff" : "#dbeafe",
                          color: holiday.holiday_type === "Company Holiday" ? "#7c3aed" : "#2563eb",
                          padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700"
                        }}>
                          {holiday.holiday_type}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "13px", color: holiday.holiday_type === "Company Holiday" ? "#5b21b6" : "#1e3a8a", lineHeight: "1.5" }}>
                        {holiday.description || "No description provided."}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button
                type="button"
                onClick={() => setShowCalDetailModal(false)}
                style={{
                  padding: "10px 20px", borderRadius: "8px", border: "none",
                  background: "#2563eb", color: "#ffffff", fontWeight: "700",
                  fontSize: "14px", cursor: "pointer", transition: "background 0.2s"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
    // alert_message for benefit types contains the breakdown string e.g. "15 Paternity + 1 Monthly"
    const isBreakdownMsg = leave.alert_message &&
      (leave.alert_message.includes("Paternity") || leave.alert_message.includes("Maternity") || leave.alert_message.includes("Monthly"));
    const breakdownText = isBreakdownMsg ? leave.alert_message : null;

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
    let badgeLabel = "Paid";
    let subText = breakdownText || `${paid} Paid`;

    if (paymentType === "Partly Paid") {
      style.backgroundColor = "#ffe4e6";
      style.color = "#be123c";
      style.border = "1px solid #fecaca";
      badgeLabel = "Partly Paid";
      subText = breakdownText || `${paid} Paid + ${unpaid} Unpaid`;
    } else if (paymentType === "Unpaid") {
      style.backgroundColor = "#fef2f2";
      style.color = "#dc2626";
      style.border = "1px solid #fecaca";
      badgeLabel = "Unpaid";
      subText = `${unpaid} Unpaid`;
    }

    return (
      <div style={{ display: "inline-flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
        <span style={style}>{badgeLabel}</span>
        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "500" }}>{subText}</span>
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
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span className="days-highlight-blue" title="Total calendar days selected">
                        {leave.total_days || leave.leave_days} Days
                      </span>
                      {(leave.excluded_days > 0) && (
                        <span style={{ fontSize: "11px", color: "#ea580c", fontWeight: "600" }}
                          title="Sundays and company holidays excluded">
                          −{leave.excluded_days} Excl.
                        </span>
                      )}
                      <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: "600" }}
                        title="Actual working leave days">
                        {leave.actual_leave_days || (leave.total_days - (leave.excluded_days || 0))} Actual
                      </span>
                    </div>
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

  // ── Theme ────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("appTheme") === "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
    localStorage.setItem("appTheme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const [isEditing, setIsEditing] = useState(false);
  const [leaveRefreshKey, setLeaveRefreshKey] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [toast, setToast] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Body scroll lock — prevents page scroll when any modal is open
  useEffect(() => {
    const anyModalOpen = showLogoutModal || !!photoPreview;
    if (anyModalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [showLogoutModal, photoPreview]);

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
    gender: loggedInUser?.gender || "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    fetch(`http://localhost:5000/api/profile/get/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          const freshGender = data.user.gender || "Male";
          const freshProfile = {
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
            gender: freshGender,
          };
          setProfileData(freshProfile);
          setTempProfileData(freshProfile);
          // Keep localStorage in sync
          localStorage.setItem("user", JSON.stringify({ ...user, ...data.user, gender: freshGender }));
        }
      })
      .catch((err) => console.error("Error fetching profile on mount:", err));
  }, []);

  const [tempProfileData, setTempProfileData] = useState({ ...profileData });

  const [profilePhoto, setProfilePhoto] = useState(
    loggedInUser?.profile_photo || null,
  );
  const profilePhotoInputRef = useRef(null);

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileExt = file.name.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
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
        showToast("Profile photo updated successfully", "success");
        setPhotoPreview(null);
        setPendingPhotoFile(null);
      } else {
        showToast(data.message || "Failed to upload profile photo", "error");
      }
    } catch (error) {
      console.error("Photo upload error:", error);
      showToast("Backend connection failed", "error");
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
        showToast("Profile photo removed successfully", "success");
      } else {
        showToast("Failed to remove profile photo", "error");
      }
    } catch (error) {
      console.error("Photo removal error:", error);
      showToast("Backend connection failed", "error");
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
          gender: data.user.gender || "",
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

      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === "success" && <FaCheck style={{ color: "#22c55e" }} />}
          {toast.type === "error" && <FaTimes style={{ color: "#ef4444" }} />}
          {toast.type === "info" && <FaInfoCircle style={{ color: "#3b82f6" }} />}
          <span>{toast.message}</span>
        </div>
      )}
    </main>
  );
}

export default EmployeeDashboard;
