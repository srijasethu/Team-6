import { useState } from "react";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Login from "./pages/Login";

function App() {
  const [activePage, setActivePage] = useState("login");

  if (activePage === "employee-dashboard") {
    return <EmployeeDashboard onLogout={() => setActivePage("login")} />;
  }

  return <Login onEmployeeLogin={() => setActivePage("employee-dashboard")} />;
}

export default App;
