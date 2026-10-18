import React, { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { getToken, getUser, logout } from "./api";

export default function App() {
  const [user, setUser] = useState(getUser());
  const token = getToken();

  useEffect(() => {
    if (!token) {
      setUser(null);
    }
  }, [token]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  return (
    <div>
      {user && token ? (
        <DashboardPage user={user} onLogout={logout} onUpdateUser={setUser} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
