import { LoginForm } from "@/components/AuthForms";

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto px-4 py-24">
      <h1 className="text-2xl font-bold text-center mb-8">Sign In</h1>
      <LoginForm />
    </div>
  );
}
