"use client";

import { useState } from "react";
import RoleSelector from "../components/auth/role-selector";
import PhysicianLogin from "../components/auth/physician-login";
import AdminLogin from "../components/auth/admin-login";
import PhysicianDashboard from "../components/physician/dashboard";
import AdminDashboard from "../components/admin/dashboard";
import type { UserRole } from "../lib/types";

type AppState = "role-select" | "login" | "dashboard";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("role-select");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setAppState("login");
  };

  const handleLoginSuccess = (userData: any, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    setAppState("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setSelectedRole(null);
    setAppState("role-select");
  };

  if (appState === "role-select") {
    return <RoleSelector onSelectRole={handleRoleSelect} />;
  }

  if (appState === "login") {
    return (
      <>
        {selectedRole === "physician" && (
          <PhysicianLogin onLoginSuccess={handleLoginSuccess} />
        )}
        {selectedRole === "admin" && (
          <AdminLogin onLoginSuccess={handleLoginSuccess} />
        )}
      </>
    );
  }

  if (appState === "dashboard" && user && token) {
    return (
      <>
        {selectedRole === "physician" && (
          <PhysicianDashboard
            user={user}
            token={token}
            onLogout={handleLogout}
          />
        )}
        {selectedRole === "admin" && (
          <AdminDashboard user={user} token={token} onLogout={handleLogout} />
        )}
      </>
    );
  }

  return null;
}
