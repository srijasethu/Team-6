import { useState, useRef, useEffect } from "react";
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
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import arunKumarAvatar from "../assets/arun_kumar.png";
import defaultManagerAvatar from "../assets/default_manager_avatar.png";
import aaravPatelAvatar from "../assets/aarav_patel.png";
import sarahRamanAvatar from "../assets/sarah_raman.png";
import rinaSharmaAvatar from "../assets/rina_sharma.png";
import sarahPamestAvatar from "../assets/sarah_pamest.png";
import "../styles/ManagerDashboard.css";

const formatDate = (dateString) => {
  if (!dateString) return "Not Available";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

function ManagerDashboard({ onLogout }) {
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem("managerActiveView") || "profile";
  });

  useEffect(() => {
    localStorage.setItem("managerActiveView", activeView);
  }, [activeView]);

  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const fetchHolidays = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/holidays");
      const data = await response.json();
      if (data.success) {
        setHolidaysList(data.holidays || []);
      }
    } catch (error) {
      console.error("Fetch holidays error:", error);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // Employee Report states
  const [reportSearchQuery, setReportSearchQuery] = useState("");
  const [reportDepartmentFilter, setReportDepartmentFilter] = useState(""); // "" or department name
  const [reportLeaveTypeFilter, setReportLeaveTypeFilter] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState(""); // "", "Pending", "Approved", "Rejected"
  const [reportSelectedEmpId, setReportSelectedEmpId] = useState("EMP045"); // Highlight Aarav Patel by default
  const [showLeaveSummary, setShowLeaveSummary] = useState(true);
  const [selectedEmpReport, setSelectedEmpReport] = useState(null);
  const [showLowBalanceAlert, setShowLowBalanceAlert] = useState(false);

  // Profile photo
  const managerLoggedInUser = JSON.parse(localStorage.getItem("user"));
  const [profilePhoto, setProfilePhoto] = useState(
    managerLoggedInUser?.profile_photo || null,
  );
  const profilePhotoInputRef = useRef(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const photoMenuRef = useRef(null);

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
        const updatedUser = { ...user, profile_photo: data.profile_photo };
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
    setShowPhotoMenu(false);
  };

  const handleProfilePhotoRemove = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    setShowPhotoMenu(false);

    try {
      const response = await fetch(
        `http://localhost:5000/api/profile/remove-photo/${user.id}`,
        {
          method: "DELETE",
        },
      );
      const data = await response.json();
      if (data.success) {
        const updatedUser = { ...user, profile_photo: null };
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

  // Active Take Action Modal Request
  const [activeRequestModal, setActiveRequestModal] = useState(null);

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
      type: "Personal Leave",
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
      type: "Personal Leave",
      dates: "Oct 15 - Oct 17, 2026",
      days: 3,
      status: "Pending",
      reason:
        "Annual vacation trip with family. Will be available on phone if needed.",
      photo: rinaSharmaAvatar,
    },
    {
      id: "LH004",
      employeeId: "EMP101",
      name: "David Chen",
      department: "R&D Dept",
      type: "Medical Leave",
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
      type: "Personal Leave",
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
      type: "Medical Leave",
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
      type: "Personal Leave",
      dates: "Sep 01 - Sep 03, 2026",
      days: 3,
      status: "Approved",
      reason: "Family event trip.",
      photo: aaravPatelAvatar,
    },
  ]);

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

  const fetchManagerLeaves = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/manager/leaves");
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
          actual_leave_days: leave.actual_leave_days ?? (leave.total_days ?? leave.leave_days),
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
        alert("Manager profile updated successfully");
      } else {
        alert("Manager profile update failed");
      }
    } catch (error) {
      console.error("Manager profile update error:", error);
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

  const handleApproveRequest = async (dbId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/manager/approve/${dbId}`,
        {
          method: "PUT",
        },
      );
      const data = await response.json();
      if (data.success) {
        // Close the detail popup and re-fetch fresh recalculated data from server
        if (
          selectedRequest &&
          (selectedRequest.dbId === dbId || selectedRequest.id === dbId)
        ) {
          setSelectedRequest(null);
        }
        await fetchManagerLeaves();
      } else {
        alert(data.message || "Unable to approve this leave request.");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Backend connection failed. Please try again.");
    }
  };

  const handleRejectRequest = async (dbId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/manager/reject/${dbId}`,
        {
          method: "PUT",
        },
      );
      const data = await response.json();
      if (data.success) {
        // Close the detail popup and re-fetch fresh recalculated data from server
        if (
          selectedRequest &&
          (selectedRequest.dbId === dbId || selectedRequest.id === dbId)
        ) {
          setSelectedRequest(null);
        }
        await fetchManagerLeaves();
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleAddHolidaySubmit = async (e) => {
    e.preventDefault();
    setAddError("");
    try {
      const response = await fetch("http://localhost:5000/api/holidays", {
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
        alert("Holiday added successfully");
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

  const handleDeleteHoliday = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this holiday?",
    );
    if (!confirmDelete) return;
    try {
      const response = await fetch(`http://localhost:5000/api/holidays/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        alert("Holiday deleted successfully");
        setSelectedHoliday(null);
        await fetchHolidays();
      } else {
        alert(data.message || "Failed to delete holiday.");
      }
    } catch (err) {
      console.error(err);
      alert("Backend connection failed.");
    }
  };

  // Computed stats from actual leave requests data
  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter((r) => r.status === "Pending").length,
    approved: leaveRequests.filter((r) => r.status === "Approved").length,
    rejected: leaveRequests.filter((r) => r.status === "Rejected").length,
    cancelled: leaveRequests.filter((r) => r.status === "Cancelled").length,
  };

  // Filter employee summaries
  const filteredEmployees = employeesData.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(reportSearchQuery.toLowerCase());

    const matchesLeaveType = reportLeaveTypeFilter
      ? leaveHistoryData.some(
          (h) => h.employeeId === emp.id && h.type === reportLeaveTypeFilter,
        )
      : true;

    const matchesStatus = reportStatusFilter
      ? leaveHistoryData.some(
          (h) => h.employeeId === emp.id && h.status === reportStatusFilter,
        )
      : true;

    const matchesDepartment = reportDepartmentFilter
      ? emp.department === reportDepartmentFilter
      : true;

    return (
      matchesSearch && matchesLeaveType && matchesStatus && matchesDepartment
    );
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

    const matchesDepartment = reportDepartmentFilter
      ? hist.department === reportDepartmentFilter
      : true;

    return (
      matchesSearch && matchesLeaveType && matchesStatus && matchesDepartment
    );
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
                setReportDepartmentFilter("");
                setShowLeaveSummary(true);
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
          {activeView === "profile" && (
            <div className="profile-content">
              {/* Page Title */}
              <div className="section-title">
                <FaRegUser className="profile-title-icon" />
                <div>
                  <h1>My Profile</h1>
                  <p className="profile-subtitle">Profile Information</p>
                </div>
              </div>

              {/* Profile Hero Card */}
              <div className="profile-hero-card">
                {/* Left — Avatar + Name */}
                <div className="profile-hero-left">
                  <div className="avatar-wrapper-ro">
                    <img
                      src={profilePhoto || defaultManagerAvatar}
                      alt="Manager Avatar"
                      className="manager-avatar"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = defaultManagerAvatar;
                      }}
                    />
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
                <div
                  className="filter-select-field-wrapper"
                  style={{
                    marginLeft: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <FaCoins
                    className="field-icon"
                    style={{ marginRight: "8px", color: "#64748b" }}
                  />
                  <select
                    value={approvalPaymentTypeFilter}
                    onChange={(e) =>
                      setApprovalPaymentTypeFilter(e.target.value)
                    }
                    className="report-select-input"
                    style={{
                      border: "none",
                      outline: "none",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1e293b",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      minWidth: "170px",
                    }}
                    aria-label="Filter by payment type"
                  >
                    <option value="">Payment Type: All</option>
                    <option value="Paid">Paid</option>
                    <option value="Partly Paid">Partly Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
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
                <table className="requests-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "center" }}>Employee Name</th>
                      <th style={{ textAlign: "center" }}>Employee ID</th>
                      <th style={{ textAlign: "center" }}>Leave Type</th>
                      <th style={{ textAlign: "center" }}>Date Range</th>
                      <th style={{ textAlign: "center" }}>Days</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                      <th style={{ textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaveRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="empty-table-message">
                          No requests found.
                        </td>
                      </tr>
                    ) : (
                      filteredLeaveRequests.map((request, index) => (
                        <tr key={`${request.dbId || request.id}-${index}`}>
                          {/* Employee Name column */}
                          <td>
                            <div className="employee-info-cell">
                              <span className="employee-name-label">
                                {request.name}
                              </span>
                            </div>
                          </td>
                          {/* Employee ID column */}
                          <td>
                            <span className="employee-id-badge">
                              {request.id}
                            </span>
                          </td>
                          {/* Leave Type column */}{" "}
                          <td>
                            <div className="leave-type-cell">
                              <button
                                className="info-icon-btn"
                                type="button"
                                onClick={() => setSelectedRequest(request)}
                                aria-label="Show leave description"
                              >
                                <FaInfoCircle />
                              </button>
                              <span className="leave-type-text">
                                {request.type}
                              </span>

                              {/* Payment Type Badge */}
                              <div
                                style={{
                                  marginTop: "5px",
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "6px",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    backgroundColor:
                                      request.payment_type === "Partly Paid"
                                        ? "#ffe4e6"
                                        : request.payment_type === "Unpaid"
                                          ? "#fef2f2"
                                          : "#f0fdf4",
                                    color:
                                      request.payment_type === "Partly Paid"
                                        ? "#be123c"
                                        : request.payment_type === "Unpaid"
                                          ? "#b91c1c"
                                          : "#15803d",
                                    border: `1px solid ${
                                      request.payment_type === "Partly Paid"
                                        ? "#fecaca"
                                        : request.payment_type === "Unpaid"
                                          ? "#fecaca"
                                          : "#86efac"
                                    }`,
                                    padding: "3px 9px",
                                    borderRadius: "999px",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    letterSpacing: "0.02em",
                                  }}
                                >
                                  <span
                                    style={{
                                      width: "6px",
                                      height: "6px",
                                      borderRadius: "50%",
                                      background:
                                        request.payment_type === "Partly Paid"
                                          ? "#e11d48"
                                          : request.payment_type === "Unpaid"
                                            ? "#ef4444"
                                            : "#22c55e",
                                      flexShrink: 0,
                                      display: "inline-block",
                                    }}
                                  />
                                  {request.payment_type || "Paid"}
                                </span>

                                {(request.payment_type === "Partly Paid" ||
                                  request.payment_type === "Unpaid") && (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      backgroundColor: "#fff1f2",
                                      color: "#be123c",
                                      border: "1px solid #fda4af",
                                      padding: "3px 8px",
                                      borderRadius: "6px",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    <FaExclamationTriangle
                                      style={{
                                        fontSize: "10px",
                                        flexShrink: 0,
                                      }}
                                    />
                                    {request.payment_type === "Unpaid"
                                      ? "Fully Unpaid"
                                      : `${request.paid_days}P + ${request.unpaid_days}U`}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          {/* Date Range column */}
                          <td>
                            <span className="date-range-label">
                              {request.dates}
                            </span>
                          </td>
                          {/* Days column */}
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span
                                className="days-label"
                                style={{ display: "block" }}
                                title="Total calendar days selected"
                              >
                                {request.total_days || request.leaveDays}{" "}
                                {(request.total_days || request.leaveDays) === 1 ? "Day" : "Days"}
                              </span>
                              {request.excluded_days > 0 && (
                                <span style={{ fontSize: "11px", color: "#ea580c", fontWeight: "600" }}
                                  title="Sundays and holidays excluded">
                                  −{request.excluded_days} Excl.
                                </span>
                              )}
                              <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: "600" }}
                                title="Actual working leave days">
                                {request.actual_leave_days} Actual
                              </span>
                              {request.unpaid_days > 0 && (
                                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
                                  ({request.paid_days} Paid + {request.unpaid_days} Unpaid)
                                </span>
                              )}
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
                                  approvalActionPopup.dbId === request.dbId && (
                                    <div
                                      className="action-inline-popup"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="action-popup-arrow" />
                                      <button
                                        type="button"
                                        className="popup-action-btn approve-action"
                                        onClick={() => {
                                          handleApproveRequest(
                                            request.dbId || request.id,
                                          );
                                          setApprovalActionPopup(null);
                                        }}
                                      >
                                        ✓ Approve
                                      </button>
                                      <button
                                        type="button"
                                        className="popup-action-btn reject-action"
                                        onClick={() => {
                                          handleRejectRequest(
                                            request.dbId || request.id,
                                          );
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
                      ))
                    )}
                  </tbody>
                </table>
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
                        selectedRequest.payment_type === "Unpaid") && (
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
                                color: "#be123c",
                                marginBottom: "3px",
                              }}
                            >
                              {selectedRequest.payment_type === "Unpaid"
                                ? "Unpaid Leave"
                                : "Partly Paid Leave"}
                            </div>
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
                            {selectedRequest.unpaid_days > 0 && (
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
                            )}
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
                          {selectedRequest.total_days || selectedRequest.leaveDays}
                          {selectedRequest.excluded_days > 0 && (
                            <span style={{ marginLeft: "8px", fontSize: "12px", color: "#ea580c", fontWeight: "600" }}>
                              (−{selectedRequest.excluded_days} excl.)
                            </span>
                          )}
                        </div>
                        <div>
                          <strong>Actual Leave Days:</strong>{" "}
                          <span style={{ color: "#2563eb", fontWeight: "700" }}>
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
                                  selectedRequest.payment_type === "Partly Paid"
                                    ? "#e11d48"
                                    : selectedRequest.payment_type === "Unpaid"
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

              {/* Stats Cards — 2 real-data cards */}
              {(() => {
                // Compute leave type breakdown from real leaveRequests (approved)
                const approvedLeaves = leaveRequests.filter(
                  (r) => r.status === "Approved",
                );
                const totalApproved = approvedLeaves.reduce(
                  (sum, r) => sum + (r.leaveDays || 0),
                  0,
                );
                const typeGroups = {};
                approvedLeaves.forEach((r) => {
                  const t = r.type || "Other";
                  typeGroups[t] = (typeGroups[t] || 0) + (r.leaveDays || 0);
                });
                const typeBreakdown = Object.entries(typeGroups)
                  .map(([label, days]) => ({
                    label,
                    days,
                    pct:
                      totalApproved > 0
                        ? Math.round((days / totalApproved) * 100)
                        : 0,
                  }))
                  .sort((a, b) => b.days - a.days)
                  .slice(0, 4);

                // Count employees that have at least one leave request that is Partly Paid or Unpaid
                const unpaidAlertSet = new Set(
                  leaveRequests
                    .filter(
                      (r) =>
                        r.payment_type === "Partly Paid" ||
                        r.payment_type === "Unpaid",
                    )
                    .map((r) => r.id),
                );
                const unpaidAlertCount = unpaidAlertSet.size;

                const DOT_COLORS = ["#4f46e5", "#0d9488", "#e11d48", "#ea580c"];

                return (
                  <div className="report-stats-grid">
                    {/* Card 2: Leave Type Breakdown (dynamic) */}
                    <div className="report-stats-card type-breakdown">
                      <div className="report-card-header yellow-bg">
                        <FaChartPie />
                        <span>Leave Type Breakdown</span>
                      </div>
                      <div className="report-card-body flex-row">
                        <div className="pie-chart-visual" />
                        <div className="pie-chart-legend">
                          {typeBreakdown.length === 0 ? (
                            <span
                              style={{ fontSize: "12px", color: "#64748b" }}
                            >
                              No approved leaves yet
                            </span>
                          ) : (
                            typeBreakdown.map((item, idx) => (
                              <div key={item.label} className="legend-item">
                                <span
                                  className="legend-dot"
                                  style={{
                                    backgroundColor:
                                      DOT_COLORS[idx % DOT_COLORS.length],
                                  }}
                                />
                                <span>
                                  {item.label} ({item.pct}%)
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card 4: Unpaid Leave Alerts (real count) */}
                    <div
                      className="report-stats-card balance-alerts clickable-stat-card"
                      onClick={() => setShowLowBalanceAlert(true)}
                      title="Click to view employees with unpaid leaves"
                    >
                      <div className="report-card-header red-bg">
                        <FaExclamationTriangle />
                        <span>Unpaid Leave Alerts</span>
                      </div>
                      <div className="report-card-body">
                        <div className="report-card-icon-wrap red-tint">
                          <FaExclamationTriangle />
                        </div>
                        <div className="report-card-text">
                          <span className="report-card-num">
                            {unpaidAlertCount}
                          </span>
                          <span className="report-card-unit">Employees</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

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

                {/* Filter by Department */}
                <div className="filter-select-field-wrapper">
                  <FaFolder className="field-icon" />
                  <select
                    value={reportDepartmentFilter}
                    onChange={(e) => setReportDepartmentFilter(e.target.value)}
                    className="report-select-input"
                  >
                    <option value="">Filter by Department</option>
                    {Array.from(
                      new Set(employeesData.map((emp) => emp.department)),
                    ).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="select-chevron" />
                </div>

                {/* Filter by Leave Type */}
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

                {/* Leave Summary Button */}
                <button
                  type="button"
                  className="toggle-history-btn active"
                  onClick={() => {
                    setReportSearchQuery("");
                    setReportDepartmentFilter("");
                    setReportLeaveTypeFilter("");
                    setReportStatusFilter("");
                    setShowLeaveSummary(true);
                  }}
                >
                  <FaHistory />
                  <span>Leave Summary</span>
                </button>
              </div>

              {/* Data Table — Employee Summary */}
              <div className="report-table-section">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Employee ID</th>
                      <th>Total Entitlement</th>
                      <th>Used Leaves</th>
                      <th>Remaining Balance</th>
                      <th>Report</th>
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
                        const bgColors = [
                          "#ff5722",
                          "#4f46e5",
                          "#0d9488",
                          "#e11d48",
                          "#7c3aed",
                          "#2563eb",
                        ];
                        const charSum = emp.name
                          .split("")
                          .reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        const initialsBg = bgColors[charSum % bgColors.length];
                        const initials = emp.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("");
                        const hasUnpaidLeave = leaveRequests.some(
                          (r) =>
                            r.id === emp.id &&
                            (r.payment_type === "Partly Paid" ||
                              r.payment_type === "Unpaid"),
                        );

                        // Calculate actual leave stats dynamically from real leaves database
                        const empLeaves = leaveRequests.filter(
                          (r) => r.id === emp.id && r.status === "Approved",
                        );
                        const totalPaid = empLeaves.reduce(
                          (sum, r) => sum + (r.paid_days || 0),
                          0,
                        );
                        const totalUnpaid = empLeaves.reduce(
                          (sum, r) => sum + (r.unpaid_days || 0),
                          0,
                        );
                        const actualUsed = totalPaid + totalUnpaid;
                        const actualRemaining = Math.max(
                          0,
                          ANNUAL_PAID_ALLOCATION - totalPaid,
                        );

                        return (
                          <tr
                            key={emp.id}
                            className={`report-row ${isSelected ? "selected-active-row" : ""}`}
                            style={
                              hasUnpaidLeave
                                ? {
                                    backgroundColor: "#fff1f2",
                                    borderLeft: "3px solid #ef4444",
                                  }
                                : {}
                            }
                            onClick={() => setReportSelectedEmpId(emp.id)}
                          >
                            <td>{emp.name}</td>
                            <td>{emp.id}</td>
                            <td>{ANNUAL_PAID_ALLOCATION} days</td>
                            <td>
                              <div>{actualUsed} days</div>
                              {totalUnpaid > 0 && (
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#dc2626",
                                    fontWeight: "600",
                                  }}
                                >
                                  ({totalPaid} Paid + {totalUnpaid} Unpaid)
                                </div>
                              )}
                            </td>
                            <td>{actualRemaining} days</td>
                            <td>
                              <button
                                type="button"
                                className="report-action-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEmpReport({
                                    ...emp,
                                    totalEntitlement: ANNUAL_PAID_ALLOCATION,
                                    usedLeaves: actualUsed,
                                    remainingBalance: actualRemaining,
                                  });
                                }}
                              >
                                <FaRegChartBar />
                                Report
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Unpaid Leave Alert Modal */}
              {showLowBalanceAlert && (
                <div
                  className="popup-overlay"
                  onClick={() => setShowLowBalanceAlert(false)}
                >
                  <div
                    className="details-popup-card low-balance-modal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="popup-card-header">
                      <h3
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          color: "#c0392b",
                        }}
                      >
                        <FaExclamationTriangle /> Unpaid Leave Alerts
                      </h3>
                      <button
                        className="close-popup-btn"
                        type="button"
                        onClick={() => setShowLowBalanceAlert(false)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <p className="low-balance-subtitle">
                      Employees with unpaid leave requests
                    </p>
                    <div className="low-balance-list">
                      {leaveRequests.filter((r) => r.unpaid_days > 0).length ===
                      0 ? (
                        <p className="low-balance-empty">
                          No employees with unpaid leave requests.
                        </p>
                      ) : (
                        leaveRequests
                          .filter((r) => r.unpaid_days > 0)
                          .map((req) => {
                            const bgColors = [
                              "#ff5722",
                              "#4f46e5",
                              "#0d9488",
                              "#e11d48",
                              "#7c3aed",
                              "#2563eb",
                            ];
                            const charSum = req.name
                              .split("")
                              .reduce(
                                (acc, char) => acc + char.charCodeAt(0),
                                0,
                              );
                            const initialsBg =
                              bgColors[charSum % bgColors.length];
                            const initials = req.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("");
                            return (
                              <div
                                key={req.dbId}
                                className="low-balance-row low-balance-critical"
                                style={{ borderLeft: "4px solid #ef4444" }}
                              >
                                <div className="employee-info-cell">
                                  <div
                                    className="employee-initials-circle"
                                    style={{ backgroundColor: initialsBg }}
                                  >
                                    {initials}
                                  </div>
                                  <div className="employee-name-id">
                                    <span className="employee-name-label">
                                      {req.name}
                                    </span>
                                    <span className="employee-id-label">
                                      {req.id} &bull; {req.type}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        color: "#e11d48",
                                        fontWeight: "600",
                                        display: "block",
                                      }}
                                    >
                                      {req.alert_message ||
                                        "Leave request for unpaid leave"}
                                    </span>
                                  </div>
                                </div>
                                <div className="low-balance-badge">
                                  <span
                                    className="low-balance-days"
                                    style={{ color: "#ef4444" }}
                                  >
                                    {req.unpaid_days}
                                  </span>
                                  <span className="low-balance-unit">
                                    unpaid days
                                  </span>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Take Action Modal */}
              {activeRequestModal && (
                <div
                  className="popup-overlay"
                  onClick={() => setActiveRequestModal(null)}
                >
                  <div
                    className="details-popup-card action-modal-card"
                    onClick={(e) => e.stopPropagation()}
                  >
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
                          <span className="popup-employee-id">
                            {activeRequestModal.id ||
                              activeRequestModal.employeeId}
                          </span>
                        </div>
                      </div>
                      <div className="popup-fields-grid">
                        <div className="popup-field-row">
                          <span className="field-label">Leave Type</span>
                          <span className="field-separator">:</span>
                          <span className="field-value">
                            {activeRequestModal.leaveType ||
                              activeRequestModal.type}
                          </span>
                        </div>
                        <div className="popup-field-row">
                          <span className="field-label">Leave Dates</span>
                          <span className="field-separator">:</span>
                          <span className="field-value">
                            {activeRequestModal.dates ||
                              activeRequestModal.leaveDates}
                          </span>
                        </div>
                        <div className="popup-field-row">
                          <span className="field-label">Duration</span>
                          <span className="field-separator">:</span>
                          <span className="field-value">
                            {activeRequestModal.duration ||
                              `${activeRequestModal.days} days`}
                          </span>
                        </div>
                        <div className="popup-field-row">
                          <span className="field-label">Reason</span>
                          <span className="field-separator">:</span>
                          <span className="field-value">
                            {activeRequestModal.reason}
                          </span>
                        </div>
                        <div className="popup-field-row">
                          <span className="field-label">Current Status</span>
                          <span className="field-separator">:</span>
                          <span
                            className={`status-badge-pill ${activeRequestModal.status.toLowerCase()}`}
                          >
                            {activeRequestModal.status}
                          </span>
                        </div>
                      </div>
                      <div className="popup-modal-actions">
                        {activeRequestModal.status === "Pending" ? (
                          <>
                            <button
                              type="button"
                              className="modal-reject-action-btn"
                              onClick={() => {
                                handleRejectRequest(
                                  activeRequestModal.id ||
                                    activeRequestModal.employeeId,
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
                                handleApproveRequest(
                                  activeRequestModal.id ||
                                    activeRequestModal.employeeId,
                                );
                                setActiveRequestModal(null);
                              }}
                            >
                              <FaCheck /> Approve
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="modal-approve-action-btn"
                            onClick={() => setActiveRequestModal(null)}
                          >
                            <FaCheck /> Close
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Employee Leave Report Modal */}
              {selectedEmpReport && (
                <div
                  className="popup-overlay"
                  onClick={() => setSelectedEmpReport(null)}
                >
                  <div
                    className="details-popup-card report-detail-modal-card"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="popup-card-header">
                      <h3>Employee Leave Report</h3>
                      <button
                        className="close-popup-btn"
                        type="button"
                        onClick={() => setSelectedEmpReport(null)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="popup-card-body scrollable-modal-body">
                      {/* Section 1: Employee Header Profile */}
                      <div className="popup-employee-header">
                        {selectedEmpReport.photo ? (
                          <img
                            src={selectedEmpReport.photo}
                            alt={selectedEmpReport.name}
                            className="popup-employee-avatar"
                          />
                        ) : (
                          <div
                            className="popup-employee-initials"
                            style={{ backgroundColor: "#ff5722" }}
                          >
                            {selectedEmpReport.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                        )}
                        <div className="popup-employee-info">
                          <h4>{selectedEmpReport.name}</h4>
                          <span className="popup-employee-id">
                            {selectedEmpReport.id} —{" "}
                            {selectedEmpReport.department}
                          </span>
                        </div>
                      </div>

                      {/* Section 2: Summary Stats Row */}
                      <div className="report-modal-stats-grid">
                        <div className="modal-stat-card entitlement-card">
                          <span className="modal-stat-label">
                            Total Entitlement
                          </span>
                          <span className="modal-stat-value">
                            {selectedEmpReport.totalEntitlement} days
                          </span>
                        </div>
                        <div className="modal-stat-card used-card">
                          <span className="modal-stat-label">Used Leaves</span>
                          <span className="modal-stat-value">
                            {selectedEmpReport.usedLeaves} days
                          </span>
                        </div>
                        <div className="modal-stat-card remaining-card">
                          <span className="modal-stat-label">
                            Remaining Balance
                          </span>
                          <span className="modal-stat-value">
                            {selectedEmpReport.remainingBalance} days
                          </span>
                        </div>
                        <div className="modal-stat-card attendance-card">
                          <span className="modal-stat-label">Attendance</span>
                          <span className="modal-stat-value">
                            {selectedEmpReport.attendance}
                          </span>
                        </div>
                      </div>

                      {/* Section 3: Visual Leave Breakdown */}
                      <div className="leave-breakdown-section">
                        <h5>Leave Type Breakdown</h5>
                        {selectedEmpReport.usedLeaves > 0 ? (
                          <div className="breakdown-chart-flex">
                            {/* Conic-gradient donut chart */}
                            {(() => {
                              const breakdown = {
                                medical: Math.max(
                                  1,
                                  Math.round(
                                    selectedEmpReport.usedLeaves * 0.25,
                                  ),
                                ),
                                personal: Math.max(
                                  1,
                                  Math.round(
                                    selectedEmpReport.usedLeaves * 0.35,
                                  ),
                                ),
                              };
                              breakdown.maternityPaternity = Math.max(
                                0,
                                selectedEmpReport.usedLeaves -
                                  breakdown.medical -
                                  breakdown.personal,
                              );

                              const total = selectedEmpReport.usedLeaves;
                              const medicalPct = Math.round(
                                (breakdown.medical / total) * 100,
                              );
                              const personalPct = Math.round(
                                (breakdown.personal / total) * 100,
                              );
                              const matPatPct = 100 - medicalPct - personalPct;

                              return (
                                <>
                                  <div className="donut-chart-container">
                                    <div
                                      className="donut-chart"
                                      style={{
                                        background: `conic-gradient(#ff5722 0% ${medicalPct}%, #4f46e5 ${medicalPct}% ${medicalPct + personalPct}%, #10b981 ${medicalPct + personalPct}% 100%)`,
                                      }}
                                    >
                                      <div className="donut-center">
                                        <span className="donut-number">
                                          {selectedEmpReport.usedLeaves}
                                        </span>
                                        <span className="donut-label">
                                          Used
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="donut-chart-legend">
                                    <div className="legend-row">
                                      <span className="legend-indicator sick" />
                                      <span className="legend-label">
                                        Medical Leave ({breakdown.medical} days —{" "}
                                        {medicalPct}%)
                                      </span>
                                    </div>
                                    <div className="legend-row">
                                      <span className="legend-indicator casual" />
                                      <span className="legend-label">
                                        Personal Leave ({breakdown.personal} days —{" "}
                                        {personalPct}%)
                                      </span>
                                    </div>
                                    <div className="legend-row">
                                      <span className="legend-indicator vacation" />
                                      <span className="legend-label">
                                        Maternity/Paternity Leave ({breakdown.maternityPaternity}{" "}
                                        days — {matPatPct}%)
                                      </span>
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="empty-chart-message">
                            No leaves taken by this employee yet.
                          </div>
                        )}
                      </div>

                      {/* Section 4: Recent History List */}
                      <div className="modal-history-section">
                        <h5>Recent Leave History</h5>
                        <div className="modal-history-list">
                          {leaveHistoryData.filter(
                            (hist) => hist.employeeId === selectedEmpReport.id,
                          ).length === 0 ? (
                            <p className="empty-history-text">
                              No recent leave requests found.
                            </p>
                          ) : (
                            leaveHistoryData
                              .filter(
                                (hist) =>
                                  hist.employeeId === selectedEmpReport.id,
                              )
                              .map((hist) => (
                                <div
                                  key={hist.id}
                                  className="history-list-item"
                                >
                                  <div className="item-meta">
                                    <span className="history-item-dates">
                                      {hist.dates}
                                    </span>
                                    <span className="history-item-type">
                                      {hist.type}
                                    </span>
                                  </div>
                                  <div className="item-status-reason">
                                    <span
                                      className={`status-badge-pill ${hist.status.toLowerCase()}`}
                                    >
                                      {hist.status}
                                    </span>
                                    <p className="history-item-reason">
                                      {hist.reason}
                                    </p>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                <div
                  className="calendar-nav-wrapper"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    padding: "6px 16px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                  }}
                >
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
                <div
                  className="calendar-card"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #f1e4dc",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 4px 20px rgba(242, 92, 5, 0.03)",
                  }}
                >
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
                      <span style={{ color: "#475569" }}>Company Holiday</span>
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
                      // Next month leading days to complete grid rows
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
                          String(cell.dateObj.getMonth() + 1).padStart(2, "0") +
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

                        let cellBg = "#ffffff";
                        let dotColor = null;
                        let textColor = "#1e293b";

                        if (dayHoliday) {
                          if (dayHoliday.holiday_type === "Public Holiday") {
                            cellBg = "#eff6ff";
                            dotColor = "#3b82f6";
                            textColor = "#1d4ed8";
                          } else if (dayHoliday.holiday_type === "Festival") {
                            cellBg = "#fef9c3";
                            dotColor = "#eab308";
                            textColor = "#a16207";
                          } else if (
                            dayHoliday.holiday_type === "Company Holiday"
                          ) {
                            cellBg = "#fdf2f8";
                            dotColor = "#ec4899";
                            textColor = "#be185d";
                          }
                        } else if (!cell.isCurr) {
                          cellBg = "#f8fafc";
                          textColor = "#94a3b8";
                        }

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              if (dayHoliday) {
                                setSelectedHoliday(dayHoliday);
                              } else {
                                setSelectedHoliday({
                                  holiday_name: "No Holiday Scheduled",
                                  holiday_date: cellDateStr,
                                  holiday_type: null,
                                  description: "This is a regular working day.",
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
                              padding: "10px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              backgroundColor: cellBg,
                              opacity: cell.isCurr ? 1 : 0.5,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              transform: isSelected ? "scale(1.02)" : "none",
                              boxShadow: isSelected
                                ? "0 4px 12px rgba(242, 92, 5, 0.12)"
                                : "none",
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
                            {dotColor && (
                              <span
                                style={{
                                  display: "inline-block",
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  backgroundColor: dotColor,
                                  alignSelf: "center",
                                }}
                              />
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Right side: Selected day/holiday details */}
                <div
                  className="details-card"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #f1e4dc",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 4px 20px rgba(242, 92, 5, 0.03)",
                    display: "flex",
                    flexDirection: "column",
                    height: "fit-content",
                  }}
                >
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
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: "700",
                            backgroundColor:
                              selectedHoliday.holiday_type === "Public Holiday"
                                ? "#eff6ff"
                                : selectedHoliday.holiday_type === "Festival"
                                  ? "#fef9c3"
                                  : selectedHoliday.holiday_type ===
                                      "Company Holiday"
                                    ? "#fdf2f8"
                                    : "#f1f5f9",
                            color:
                              selectedHoliday.holiday_type === "Public Holiday"
                                ? "#1d4ed8"
                                : selectedHoliday.holiday_type === "Festival"
                                  ? "#a16207"
                                  : selectedHoliday.holiday_type ===
                                      "Company Holiday"
                                    ? "#be185d"
                                    : "#475569",
                            border: `1px solid ${
                              selectedHoliday.holiday_type === "Public Holiday"
                                ? "#bfdbfe"
                                : selectedHoliday.holiday_type === "Festival"
                                  ? "#fef08a"
                                  : selectedHoliday.holiday_type ===
                                      "Company Holiday"
                                    ? "#fbcfe8"
                                    : "#cbd5e1"
                            }`,
                          }}
                        >
                          {selectedHoliday.holiday_type || "Working Day"}
                        </span>
                      </div>

                      <h4
                        style={{
                          margin: "0 0 10px",
                          fontSize: "20px",
                          fontWeight: "800",
                          color: "#1e293b",
                        }}
                      >
                        {selectedHoliday.holiday_name}
                      </h4>

                      <p
                        style={{
                          margin: "0 0 16px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#64748b",
                        }}
                      >
                        📅{" "}
                        {(() => {
                          const parts = selectedHoliday.holiday_date.split("-");
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

                      <p
                        style={{
                          margin: "0 0 24px",
                          fontSize: "14px",
                          color: "#475569",
                          lineHeight: "1.6",
                          background: "#f8fafc",
                          padding: "12px",
                          borderRadius: "10px",
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        {selectedHoliday.description ||
                          "No description provided."}
                      </p>

                      {/* Delete button only for manager-added holidays, i.e., ID > 20 */}
                      {selectedHoliday.id && selectedHoliday.id > 20 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteHoliday(selectedHoliday.id)
                          }
                          style={{
                            width: "100%",
                            background: "#fef2f2",
                            color: "#ef4444",
                            border: "1px solid #fecaca",
                            borderRadius: "10px",
                            padding: "10px",
                            fontSize: "14px",
                            fontWeight: "700",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#fee2e2";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#fef2f2";
                          }}
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
                      <span style={{ fontSize: "36px", marginBottom: "12px" }}>
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
                <div
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 9999,
                    background: "rgba(15, 23, 42, 0.45)",
                    backdropFilter: "blur(3px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                      width: "100%",
                      maxWidth: "480px",
                      padding: "30px",
                      border: "1px solid #f1e4dc",
                    }}
                  >
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
                          style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1.5px solid #cbd5e1",
                            outline: "none",
                            fontFamily: "inherit",
                            fontSize: "14px",
                            cursor: "pointer",
                            backgroundColor: "#ffffff",
                          }}
                        >
                          <option value="Public Holiday">Public Holiday</option>
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
                          style={{
                            flex: 1,
                            padding: "12px",
                            borderRadius: "10px",
                            border: "1.5px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#475569",
                            fontWeight: "700",
                            fontSize: "14px",
                            cursor: "pointer",
                          }}
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
    </main>
  );
}

export default ManagerDashboard;
