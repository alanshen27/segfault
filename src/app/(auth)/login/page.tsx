import { LoginForm } from "@/components/AuthForms";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto px-4 py-24">
      <div className="text-center mb-8">
        <Image
          height={32}
          width={32}
          src="/logo.png"
          alt="segfault logo"
          className="mx-auto mb-2"
        />
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-neutral-500 mt-1">Sign in to your account</p>
      </div>
      <LoginForm />
    </div>
  );
}
