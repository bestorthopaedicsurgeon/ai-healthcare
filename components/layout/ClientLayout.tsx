"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { SessionHeader } from "@/components/layout/SessionHeader";
import { PatientProvider } from "@/context/PatientContext";
import { AuthProvider } from "@/context/AuthContext";
import { ReLoginModal } from "@/components/ui/ReLoginModal";
import { CreateSessionModal } from "@/components/modals/CreateSessionModal";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isMarketingPage = pathname === "/" || pathname === "/pricing";

  return (
    <AuthProvider>
      <div className={cn("flex min-h-screen", isMarketingPage ? "bg-[#FCFAF8] text-[#28030f]" : "bg-background text-foreground")}>
        <PatientProvider>
          <ReLoginModal />
          <CreateSessionModal />
          {!isAuthPage && !isMarketingPage && <Sidebar />}
          <main className={cn("flex-1 flex flex-col h-screen overflow-hidden", isMarketingPage && "overflow-y-auto h-auto")}>
            {!isAuthPage && !isMarketingPage && <SessionHeader />}
            <div className="flex-1 overflow-y-auto page-transition">
                {children}
            </div>
          </main>
        </PatientProvider>
      </div>
    </AuthProvider>
  );
}
