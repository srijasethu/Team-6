import { useState } from "react";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import Login from "./pages/Login";

function App() {
  const [activePage, setActivePage] = useState("login");

  if (activePage === "employee-dashboard") {
    return (
      <EmployeeDashboard
        onLogout={() => setActivePage("login")}
      />
    );
  }

  if (activePage === "manager-dashboard") {
    return <ManagerDashboard onLogout={() => setActivePage("login")} />;
  }

  return (
    <Login
      onEmployeeLogin={() => setActivePage("employee-dashboard")}
      onManagerLogin={() => setActivePage("manager-dashboard")}
    />
  );
}

export default App;
