import { SignupForm } from "@/components/AuthForms";

export default function SignupPage() {
  return (
    <div className="max-w-sm mx-auto px-4 py-24">
      <div className="text-center mb-8">
        <div className="text-primary font-bold text-2xl mb-2">&gt;_</div>
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-sm text-neutral-500 mt-1">Get started with segfault</p>
      </div>
      <SignupForm />
    </div>
  );
}
