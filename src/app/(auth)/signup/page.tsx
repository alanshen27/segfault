import { SignupForm } from "@/components/AuthForms";

export default function SignupPage() {
  return (
    <div className="max-w-sm mx-auto px-4 py-24">
      <h1 className="text-2xl font-bold text-center mb-8">Create Account</h1>
      <SignupForm />
    </div>
  );
}
