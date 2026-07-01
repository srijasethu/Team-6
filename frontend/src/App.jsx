import { useState, useEffect } from "react";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import Login from "./pages/Login";

// Apply saved theme immediately to prevent flash
const savedTheme = localStorage.getItem("appTheme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

function App() {
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem("activePage") || "login";
  });

  useEffect(() => {
    localStorage.setItem("activePage", activePage);
  }, [activePage]);

  if (activePage === "employee-dashboard") {
    return (
      <EmployeeDashboard
        onLogout={() => {
          setActivePage("login");
          localStorage.removeItem("activePage");
          localStorage.removeItem("employeeActiveView");
        }}
      />
    );
  }

  if (activePage === "manager-dashboard") {
    return (
      <ManagerDashboard 
        onLogout={() => {
          setActivePage("login");
          localStorage.removeItem("activePage");
          localStorage.removeItem("managerActiveView");
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
