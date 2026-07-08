import { useState } from "react";
import {
  FaUser,
  FaUsers,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCalendarAlt,
  FaCheck,
  FaSignInAlt,
} from "react-icons/fa";
import "./../styles/Login.css";

const SUPPORT_MAILTO = "mailto:leavetechsupport@gmail.com?subject=LeaveWise%20Support%20Request&body=Hello%20Administrator%2C%0D%0A%0D%0AI%20need%20assistance%20with%20my%20LeaveWise%20account.%0D%0A%0D%0AName%3A%0D%0AEmployee%20ID%3A%0D%0ARole%20(Employee%2FManager)%3A%0D%0AContact%20Number%3A%0D%0AIssue%3A";

function Login({ onEmployeeLogin, onManagerLogin }) {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  async function handleSubmit(event) {
    event.preventDefault();

    if (!role) {
      setError("Please select a role.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email / ID and password.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          role: role,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setError("");

        if (data.user.role === "employee") {
          onEmployeeLogin();
        } else if (data.user.role === "manager") {
          onManagerLogin();
        }
      } else {
        setError("Invalid email, password, or role selected.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Backend connection failed. Please try again.");
    }
  }

  return (
    <div className="login-container">
      <div className="login-split-card">

        {/* ── Left: Welcome Panel ── */}
        <div className="login-left-panel">
          <div className="company-brand">
            <svg className="company-logo-svg" width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="6" width="8" height="20" rx="4" fill="#ffffff" />
              <path d="M14 16C14 10.4772 18.4772 6 24 6V26C18.4772 26 14 21.5228 14 16Z" fill="#ffffff" />
            </svg>
            <span className="company-name">Touchmark Technologies</span>
          </div>

          {/* Enhanced calendar illustration */}
          <div className="calendar-visual-container">
            <svg className="calendar-svg" viewBox="0 0 380 310" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Calendar card background with rounded corners */}
              <rect x="30" y="28" width="320" height="254" rx="18" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

              {/* Ring pulls (filled circles on top) */}
              <circle cx="95" cy="28" r="9" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <circle cx="95" cy="28" r="4" fill="rgba(255,255,255,0.15)" />
              <circle cx="148" cy="28" r="9" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <circle cx="148" cy="28" r="4" fill="rgba(255,255,255,0.15)" />
              <circle cx="201" cy="28" r="9" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <circle cx="201" cy="28" r="4" fill="rgba(255,255,255,0.15)" />
              <circle cx="254" cy="28" r="9" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <circle cx="254" cy="28" r="4" fill="rgba(255,255,255,0.15)" />
              <circle cx="307" cy="28" r="9" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <circle cx="307" cy="28" r="4" fill="rgba(255,255,255,0.15)" />

              {/* Header separator */}
              <line x1="30" y1="72" x2="350" y2="72" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

              {/* Day header labels */}
              <text x="71.4" y="57" fill="rgba(255,255,255,0.7)" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="inherit">Mon</text>
              <text x="117.4" y="57" fill="rgba(255,255,255,0.7)" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="inherit">Tue</text>
              <text x="163.4" y="57" fill="rgba(255,255,255,0.7)" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="inherit">Wed</text>
              <text x="209.4" y="57" fill="rgba(255,255,255,0.7)" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="inherit">Thu</text>
              <text x="255.4" y="57" fill="rgba(255,255,255,0.7)" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="inherit">Fri</text>
              <text x="301.4" y="57" fill="rgba(255,255,255,0.7)" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="inherit">Sat</text>
              <text x="335" y="57" fill="rgba(255,255,255,0.7)" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="inherit">Sun</text>

              {/* Vertical grid lines */}
              <line x1="94.4" y1="72" x2="94.4" y2="282" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <line x1="140.4" y1="72" x2="140.4" y2="282" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <line x1="186.4" y1="72" x2="186.4" y2="282" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <line x1="232.4" y1="72" x2="232.4" y2="282" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <line x1="278.4" y1="72" x2="278.4" y2="282" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <line x1="318" y1="72" x2="318" y2="282" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

              {/* Horizontal grid lines */}
              <line x1="30" y1="112" x2="350" y2="112" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <line x1="30" y1="152" x2="350" y2="152" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <line x1="30" y1="192" x2="350" y2="192" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <line x1="30" y1="232" x2="350" y2="232" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

              {/* Day cells (rounded rectangles, week 1) */}
              <rect x="36" y="78" width="52" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="99" y="78" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="145" y="78" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="191" y="78" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="237" y="78" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="283" y="78" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="323" y="78" width="21" height="28" rx="6" fill="rgba(255,255,255,0.07)" />

              {/* Day cells (week 2) */}
              <rect x="36" y="118" width="52" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="99" y="118" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="145" y="118" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              {/* Wednesday cell highlighted with checkmark */}
              <rect x="191" y="118" width="36" height="28" rx="6" fill="rgba(255,255,255,0.9)" />
              <polyline points="199,133 204,138 214,126" stroke="#1d68d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <rect x="237" y="118" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="283" y="118" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="323" y="118" width="21" height="28" rx="6" fill="rgba(255,255,255,0.07)" />

              {/* Day cells (week 3) */}
              <rect x="36" y="158" width="52" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="99" y="158" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="145" y="158" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="191" y="158" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="237" y="158" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="283" y="158" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="323" y="158" width="21" height="28" rx="6" fill="rgba(255,255,255,0.07)" />

              {/* Day cells (week 4) */}
              <rect x="36" y="198" width="52" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="99" y="198" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="145" y="198" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="191" y="198" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="237" y="198" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="283" y="198" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="323" y="198" width="21" height="28" rx="6" fill="rgba(255,255,255,0.07)" />

              {/* Day cells (week 5) */}
              <rect x="36" y="238" width="52" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="99" y="238" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="145" y="238" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="191" y="238" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="237" y="238" width="36" height="28" rx="6" fill="rgba(255,255,255,0.07)" />
            </svg>
          </div>

          <div className="welcome-message-block">
            <h2>Welcome!</h2>
            <p>LeaveWise · Technology That Works for People.</p>
          </div>
        </div>

        {/* ── Right: Login Form ── */}
        <div className="login-right-panel">
          {/* Subtle wave background overlay */}
          <svg className="right-panel-wave-svg" viewBox="0 0 520 560" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMin meet">
            <path d="M520 0 Q420 80 520 160 Q620 240 520 320 Q420 400 520 480 L520 0Z" fill="rgba(8,104,239,0.04)" />
            <path d="M520 0 Q460 100 520 200 Q580 300 520 400 L520 0Z" fill="rgba(8,104,239,0.03)" />
            <circle cx="490" cy="60" r="40" fill="rgba(8,104,239,0.025)" />
            <circle cx="510" cy="130" r="28" fill="rgba(8,104,239,0.025)" />
            <circle cx="480" cy="190" r="20" fill="rgba(8,104,239,0.02)" />
          </svg>

          <form className="login-form-card" onSubmit={handleSubmit}>
            <div className="login-header-group">
              <h1 className="login-main-title">Log In</h1>
              <p className="login-helper-text">
                Don't have an account?{" "}
                <a href={SUPPORT_MAILTO} className="admin-link">Contact Administrator</a>
              </p>
            </div>

            <div className="login-field-section">
              <h3 className="select-role-label">Select Role</h3>
              <div className="role-cards-container">
                <label className={`role-card ${role === "employee" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="employee"
                    checked={role === "employee"}
                    onChange={(e) => setRole(e.target.value)}
                    className="role-radio-hidden"
                  />
                  <span className="role-radio-indicator"></span>
                  <FaUser className="role-card-icon" />
                  <span className="role-card-text">Employee</span>
                </label>

                <label className={`role-card ${role === "manager" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="manager"
                    checked={role === "manager"}
                    onChange={(e) => setRole(e.target.value)}
                    className="role-radio-hidden"
                  />
                  <span className="role-radio-indicator"></span>
                  <FaUsers className="role-card-icon" />
                  <span className="role-card-text">Manager</span>
                </label>
              </div>
            </div>

            <div className="login-input-group">
              <label className="input-field-label">Email <span className="required-star">*</span></label>
              <div className="login-input-wrapper">
                <FaEnvelope className="login-input-prefix-icon" />
                <input
                  type="text"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="login-field-input"
                />
              </div>
            </div>

            <div className="login-input-group">
              <label className="input-field-label">Password <span className="required-star">*</span></label>
              <div className="login-input-wrapper">
                <FaLock className="login-input-prefix-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="login-field-input"
                />
                <button
                  type="button"
                  className="login-password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error && <p className="login-error-message">{error}</p>}

            <div className="login-action-footer">
              <button className="login-submit-btn" type="submit">
                <FaSignInAlt />
                <span>Log In</span>
              </button>

              <div className="forgot-password-block">
                <span className="forgot-text">Forgot your password?</span>
                <a href={SUPPORT_MAILTO} className="admin-link">Contact Administrator</a>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Login;