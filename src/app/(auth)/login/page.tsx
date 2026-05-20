import { LoginForm } from "@/components/AuthForms";

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto px-4 py-24">
      <div className="text-center mb-8">
        <div className="text-primary font-bold text-2xl mb-2">&gt;_</div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-neutral-500 mt-1">Sign in to your account</p>
      </div>
      <LoginForm />
    </div>
  );
}
