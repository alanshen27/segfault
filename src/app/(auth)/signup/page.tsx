import { SignupForm } from "@/components/AuthForms";
import Logo from "@/components/Logo";

export default function SignupPage() {
  return (
    <div className="max-w-sm mx-auto px-4 py-24">
      <div className="text-center mb-8">
        <Logo size={32} className="mx-auto mb-2" />
        <h1 className="text-2xl font-display font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-neutral-500 mt-1">Get started with buildwith.coffee</p>
      </div>
      <SignupForm />
    </div>
  );
}
