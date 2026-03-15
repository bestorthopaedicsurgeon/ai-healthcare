"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { PatientProvider } from "@/context/PatientContext";
import { usePathname } from "next/navigation";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <div className="flex bg-background min-h-screen text-foreground">
      <PatientProvider>
        {!isAuthPage && <Sidebar />}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {children}
        </main>
      </PatientProvider>
    </div>
  );
}
