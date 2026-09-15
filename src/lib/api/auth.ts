import "server-only";
import type { User } from "@/types";
import type { RawLoginResponse, RawUser } from "./raw";
import { apiFetch } from "./client";
import { toUser } from "./adapters";

export type AuthResult = { token: string; user: User };

function fromLogin(data: RawLoginResponse): AuthResult {
  const kind = data.auth_kind === "user" ? "user" : "client";
  return { token: data.access_token, user: toUser(data.user, kind) };
}

/** `email` accepts an e-mail address or a phone number (the backend field is named `email`). */
export async function login(email: string, password: string): Promise<AuthResult> {
  const { data } = await apiFetch<RawLoginResponse>("/api/auth/login", { method: "POST", body: { email, password } });
  return fromLogin(data);
}

export async function register(input: { firstName: string; lastName: string; email: string | null; phone: string | null; password: string }): Promise<AuthResult> {
  const { data } = await apiFetch<RawLoginResponse>("/api/client-auth/register", {
    method: "POST",
    body: {
      name: input.firstName.toLowerCase(),
      lastName: input.lastName.toLowerCase(),
      email: input.email,
      phone: input.phone,
      password: input.password,
    },
  });
  return fromLogin(data);
}

export async function me(token: string, kind: "client" | "user"): Promise<User> {
  const { data } = await apiFetch<{ data?: RawUser } | RawUser>(kind === "user" ? "/api/me" : "/api/client-auth/me", { token });
  const raw = ("data" in data && data.data ? data.data : data) as RawUser;
  return toUser(raw, kind);
}

export async function updateProfile(
  token: string,
  userId: string | number,
  input: { firstName: string; lastName: string; phone: string; district: string; address: string; password?: string; newPassword?: string },
): Promise<void> {
  await apiFetch(`/api/users/me/${encodeURIComponent(String(userId))}`, {
    method: "PUT",
    token,
    body: {
      name: input.firstName.toLowerCase(),
      lastName: input.lastName.toLowerCase(),
      password: input.password || null,
      newPassword: input.newPassword || null,
      number: input.phone,
      district: input.district,
      address: input.address,
    },
  });
}

export async function forgotPassword(email: string): Promise<void> {
  await apiFetch("/api/auth/forgotPassword", { method: "POST", body: { email } });
}

export async function resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<void> {
  await apiFetch(`/api/auth/resetPassword/${encodeURIComponent(token)}`, { method: "POST", body: { newPassword, confirmPassword } });
}

export async function deleteAccount(token: string, userId: string | number): Promise<void> {
  await apiFetch(`/api/auth/suppression/${encodeURIComponent(String(userId))}`, { method: "DELETE", token });
}

export async function sendContact(input: { name: string; email: string; topic: string; subject: string; message: string }): Promise<void> {
  await apiFetch("/api/contact", {
    method: "POST",
    body: { userEmail: input.email, userMessage: input.message, userName: input.name, subject: `${input.topic}:${input.subject}` },
  });
}
