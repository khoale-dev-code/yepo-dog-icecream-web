import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export function useAdminAuth() {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);
  const [authError, setAuthError] = useState("");

  async function checkAuth() {
    setChecking(true);
    setAuthError("");

    try {
      const result = await api.getCurrentAdmin();
      setAdmin(result.admin || null);
    } catch {
      setAdmin(null);
    } finally {
      setChecking(false);
    }
  }

  async function login(payload) {
    setAuthError("");

    try {
      const result = await api.loginAdmin(payload);
      setAdmin(result.admin || null);
      return true;
    } catch (err) {
      setAuthError(err.message || "Không đăng nhập được.");
      return false;
    }
  }

  async function logout() {
    await api.logoutAdmin();
    setAdmin(null);
  }

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    admin,
    checking,
    authError,
    login,
    logout,
    checkAuth,
  };
}


