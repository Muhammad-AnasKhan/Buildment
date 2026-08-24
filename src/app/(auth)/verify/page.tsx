import { MailCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export default function VerifyRequestPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-24">
      <Logo size="lg" />
      <div className="mt-10 w-full max-w-sm text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-indigo-50">
          <MailCheck className="size-5 text-indigo-600" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900">
          Check your email
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          We sent you a one-time sign-in link. It expires shortly, so use it soon. Didn&apos;t
          get it? Check spam, or go back and try again.
        </p>
      </div>
    </div>
  );
}
