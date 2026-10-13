export function loginErrorMessage(code: string | undefined): string | null {
  switch (code) {
    case "CredentialsSignin":
      return "Invalid email or password, or your email is not verified yet.";
    case "missing":
      return "Enter your email and password.";
    case "verify-missing":
    case "verify-invalid":
      return "That verification link is invalid.";
    case "verify-expired":
      return "That verification link has expired. Sign in and request a new one.";
    default:
      return code ? "Sign in failed. Try again." : null;
  }
}
