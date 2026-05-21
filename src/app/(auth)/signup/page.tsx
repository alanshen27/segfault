import { SignupForm } from "@/components/AuthForms";
import Image from "next/image";

export default function SignupPage() {
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
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-sm text-neutral-500 mt-1">Get started with segfault</p>
      </div>
      <SignupForm />
    </div>
  );
}
