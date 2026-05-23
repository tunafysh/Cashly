import { SignupForm } from "@/components/elements/forms/signup-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signup - Cashly",
  description:
    "Create a new Cashly account to start managing your finances effectively.",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm />
      </div>
    </div>
  );
}
