/**
 * Transient (in-memory only) handoff between the signup screen and the
 * verification screen so we can sign the user in immediately after OTP without
 * asking them to retype their password. Cleared on success or app restart.
 */
let pending: { email: string; password: string } | null = null;

export function setPendingSignup(email: string, password: string): void {
  pending = { email: email.trim().toLowerCase(), password };
}

export function getPendingSignupPassword(email: string): string | null {
  if (!pending) return null;
  return pending.email === email.trim().toLowerCase() ? pending.password : null;
}

export function clearPendingSignup(): void {
  pending = null;
}
