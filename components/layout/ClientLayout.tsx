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
  const hasAppChrome = !isAuthPage && !isMarketingPage;

  return (
    <AuthProvider>
      <div className={cn("flex min-h-screen", isMarketingPage ? "bg-canvas text-ink" : "bg-background text-foreground")}>
        <PatientProvider>
          <ReLoginModal />
          <CreateSessionModal />
          {hasAppChrome && <Sidebar />}
          <main
            className={cn(
              "flex-1 flex flex-col",
              isMarketingPage ? "min-h-screen" : "h-screen overflow-hidden"
            )}
          >
            {hasAppChrome && <SessionHeader />}
            <div
              className={cn(
                "flex-1 page-transition",
                !isMarketingPage && "overflow-y-auto"
              )}
            >
              {children}
            </div>
          </main>
        </PatientProvider>
      </div>
    </AuthProvider>
  );
}
