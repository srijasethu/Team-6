import { useState } from "react";
import {
  FaUser,
  FaUsers,
  FaEnvelope,
  FaLock,
  FaEye,
  FaCalendarAlt,
  FaCheck,
  FaSignInAlt,
} from "react-icons/fa";
import "./../styles/Login.css";

function Login({ onEmployeeLogin, onManagerLogin }) {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!role) {
      setError("Please select a role.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email / ID and password.");
      return;
    }

    setError("");
    if (role === "employee") {
      onEmployeeLogin();
    } else if (role === "manager") {
      onManagerLogin();
    }
  }

  return (
    <div className="login-container">
      <div className="dot-pattern dot-pattern-left"></div>
      <div className="dot-pattern dot-pattern-right"></div>
      <div className="soft-circle soft-circle-left"></div>
      <div className="soft-circle soft-circle-right"></div>

      <form className="login-card" onSubmit={handleSubmit}>

        <div className="logo">
          <FaCalendarAlt className="calendar-icon" />
          <FaUser className="logo-user" />
          <span className="logo-check">
            <FaCheck />
          </span>
        </div>

        <h1 className="title">Employee Leave Management</h1>

        <div className="title-line"></div>

        <h3 className="role-title">Select Role</h3>

        <div className="role-container">
          <label className="role-box">
            <input
              type="radio"
              name="role"
              value="employee"
              checked={role === "employee"}
              onChange={(event) => setRole(event.target.value)}
            />
            <FaUser className="role-icon" />
            <span>Employee</span>
          </label>

          <label className="role-box">
            <input
              type="radio"
              name="role"
              value="manager"
              checked={role === "manager"}
              onChange={(event) => setRole(event.target.value)}
            />
            <FaUsers className="role-icon" />
            <span>Manager</span>
          </label>
        </div>

        <div className="input-group">
          <label>Email / ID</label>

          <div className="input-box">
            <FaEnvelope className="input-icon" />
            <input
              type="text"
              placeholder="Enter your email or ID"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label>Password</label>

          <div className="input-box">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <FaEye className="eye-icon" />
          </div>
        </div>

        {error && <p className="login-error">{error}</p>}

        <button className="login-btn" type="submit">
          <FaSignInAlt />
          Login
        </button>

        <div className="footer">
          <p>Don't have an account?</p>
          <a href="/">Contact administrator (email)</a>
        </div>

      </form>
    </div>
  );
}

export default Login;
