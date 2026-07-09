import { useState, useEffect } from "react";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import Login from "./pages/Login";

// Safe localStorage helper
const safeGetItem = (key, fallback = null) => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (e) {
    console.warn("localStorage.getItem failed:", e);
    return fallback;
  }
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("localStorage.setItem failed:", e);
  }
};

const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("localStorage.removeItem failed:", e);
  }
};

const safeJsonParse = (str, fallback = null) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str) || fallback;
  } catch (e) {
    console.warn("JSON.parse failed:", e);
    return fallback;
  }
};

// Apply saved theme immediately to prevent flash
const savedTheme = safeGetItem("appTheme", "light");
try {
  document.documentElement.setAttribute("data-theme", savedTheme);
} catch (e) {
  console.warn("Failed to set data-theme:", e);
}

function App() {
  const [activePage, setActivePage] = useState(() => {
    return safeGetItem("activePage", "login");
  });

  useEffect(() => {
    safeSetItem("activePage", activePage);
  }, [activePage]);

  // Check if a user is logged in
  const user = safeJsonParse(safeGetItem("user"));

  // If dashboard is active but user data is missing, fallback to login page
  const currentActivePage = (activePage !== "login" && !user) ? "login" : activePage;

  if (currentActivePage === "employee-dashboard") {
    return (
      <EmployeeDashboard
        onLogout={() => {
          setActivePage("login");
          safeRemoveItem("activePage");
          safeRemoveItem("employeeActiveView");
          safeRemoveItem("user");
        }}
      />
    );
  }

  if (currentActivePage === "manager-dashboard") {
    return (
      <ManagerDashboard 
        onLogout={() => {
          setActivePage("login");
          safeRemoveItem("activePage");
          safeRemoveItem("managerActiveView");
          safeRemoveItem("user");
        }} 
      />
    );
  }

  return (
    <Login
      onEmployeeLogin={() => setActivePage("employee-dashboard")}
      onManagerLogin={() => setActivePage("manager-dashboard")}
    />
  );
}

export default App;
