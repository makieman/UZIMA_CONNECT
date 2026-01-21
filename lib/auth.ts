// Authentication utilities for Uzimacare

import { db } from "./db";
import type { UserRole } from "./types";

interface LoginCredentials {
  email?: string;
  phoneNumber?: string;
  password?: string;
}

interface AuthResponse {
  success: boolean;
  user?: any;
  token?: string;
  error?: string;
}

// Simulate session storage (in production, use JWT + httpOnly cookies)
const sessions = new Map<
  string,
  { userId: string; role: UserRole; expiresAt: number }
>();

export async function login(
  credentials: LoginCredentials,
  role: UserRole,
): Promise<AuthResponse> {
  // Mock validation - in production, validate against hashed passwords
  if (role === "patient") {
    if (credentials.phoneNumber === "+254712345678") {
      const user = db.patients.get("patient-001");
      if (!user) {
        return { success: false, error: "User not found in database" };
      }
      const token = generateToken();
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      sessions.set(token, { userId: user.id, role, expiresAt });
      return { success: true, user, token };
    }
  } else if (role === "admin") {
    if (credentials.email === "admin@uzimacare.ke") {
      const user = db.users.get("admin-001");
      if (!user) {
        return { success: false, error: "User not found in database" };
      }
      const token = generateToken();
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      sessions.set(token, { userId: user.id, role, expiresAt });
      return { success: true, user, token };
    }
  } else if (role === "physician") {
    if (credentials.email === "dr.kipchoge@hospital.ke") {
      const user = db.physicians.get("physician-001");
      if (!user) {
        return { success: false, error: "Physician not found in database" };
      }
      const token = generateToken();
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      sessions.set(token, { userId: user.id, role, expiresAt });
      return { success: true, user, token };
    }
  }

  return { success: false, error: "Invalid credentials" };
}

export function generateToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function getSession(token: string) {
  const session = sessions.get(token);
  if (session && session.expiresAt > Date.now()) {
    return session;
  }
  sessions.delete(token);
  return null;
}

export function logout(token: string) {
  sessions.delete(token);
}

export function isAuthenticated(token?: string): boolean {
  if (!token) return false;
  return !!getSession(token);
}
