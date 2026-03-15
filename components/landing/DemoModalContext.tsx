"use client";

import { createContext, useContext, useState } from "react";

const DemoModalContext = createContext({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function DemoModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DemoModalContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </DemoModalContext.Provider>
  );
}

export function useBookDemo() {
  return useContext(DemoModalContext);
}
