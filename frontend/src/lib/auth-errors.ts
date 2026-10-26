// Maps API error codes (and link-flow outcomes) to the copy shown on the login page.
export function loginErrorMessage(code: string | undefined): string | null {
  switch (code) {
    case "INVALID_CREDENTIALS":
      return "Invalid email or password.";
    case "EMAIL_UNVERIFIED":
      return "Verify your email before signing in. Check your inbox for the link.";
    case "RATE_LIMITED":
      return "Too many sign-in attempts. Wait a minute and try again.";
    case "missing":
      return "Enter your email and password.";
    case "missing-email":
      return "Enter your email to receive a sign-in link.";
    case "verify-missing":
    case "verify-invalid":
      return "That verification link is invalid.";
    case "verify-expired":
      return "That verification link has expired. Sign in and request a new one.";
    case "magic-invalid":
      return "That sign-in link is invalid or was already used.";
    case "magic-expired":
      return "That sign-in link has expired. Request a new one.";
    case "ACCOUNT_SUSPENDED":
    case "magic-suspended":
    case "suspended":
      return "This account has been suspended. Contact a platform admin.";
    case "MFA_REQUIRED":
      return "Enter the 6-digit code from your authenticator app, or a backup code.";
    case "MFA_INVALID":
      return "That authenticator code is not valid.";
    default:
      return code ? "Sign in failed. Try again." : null;
  }
}
