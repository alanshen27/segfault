import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 20, className = "" }: LogoProps) {
  return (
    <>
      <Image
        height={size}
        width={size}
        src="/logo:light.png"
        alt="segfault logo"
        className={`dark:hidden ${className}`.trim()}
      />
      <Image
        height={size}
        width={size}
        src="/logo:dark.png"
        alt="segfault logo"
        className={`hidden dark:block ${className}`.trim()}
      />
    </>
  );
}
