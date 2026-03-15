"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { PatientProvider } from "@/context/PatientContext";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isMarketingPage = pathname === "/" || pathname === "/pricing";

  return (
    <div className={cn("flex min-h-screen", isMarketingPage ? "bg-[#FCFAF8] text-[#28030f]" : "bg-background text-foreground")}>
      <PatientProvider>
        {!isAuthPage && !isMarketingPage && <Sidebar />}
        <main className={cn("flex-1 flex flex-col", isMarketingPage ? "overflow-y-auto" : "h-screen overflow-hidden")}>
          {children}
        </main>
      </PatientProvider>
    </div>
  );
}
