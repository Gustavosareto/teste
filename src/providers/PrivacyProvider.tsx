import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PrivacyContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [isPrivacyMode, setIsPrivacyMode] = useState(() => {
    const saved = localStorage.getItem("myfinance:privacy");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("myfinance:privacy", JSON.stringify(isPrivacyMode));
  }, [isPrivacyMode]);

  const togglePrivacyMode = () => setIsPrivacyMode((prev: boolean) => !prev);

  return (
    <PrivacyContext.Provider value={{ isPrivacyMode, togglePrivacyMode }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacyMode() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error("usePrivacyMode must be used within a PrivacyProvider");
  }
  return context;
}