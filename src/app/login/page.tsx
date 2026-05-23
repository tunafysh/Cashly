import { LoginForm } from "@/components/elements/forms/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Cashly",
  description: "Access your Cashly account by logging in with your credentials."
}

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  );
}
