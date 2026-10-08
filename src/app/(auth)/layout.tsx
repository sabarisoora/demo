import { Logo } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ledger flex min-h-screen flex-col items-center px-4 py-10">
      <Logo />
      <div className="rise mt-8 w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-[0_1px_0_var(--line),0_20px_40px_-24px_rgba(0,0,0,0.25)] sm:p-8">
        {children}
      </div>
    </div>
  );
}
