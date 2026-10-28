import { AuthMessage } from "@/components/auth/auth-message";

export default function VerifyRequestPage() {
  return (
    <AuthMessage
      mood="happy"
      line="Almost there."
      title="Check your email"
      text="We sent you a link to sign in. It stops working soon, so use it now. No email? Look in your spam folder, or go back and try again."
    />
  );
}
