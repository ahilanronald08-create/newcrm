import { createContext, useContext, useState } from "react";

// 1 Create context
const LeadContext = createContext(null);

// Provider
export const LeadProvider = ({ children }) => {
  const [leadDraft, setLeadDraft] = useState({});

  return (
    <LeadContext.Provider value={{ leadDraft, setLeadDraft }}>
      {children}
    </LeadContext.Provider>
  );
};

//  Custom hook
export const useLead = () => {
  const context = useContext(LeadContext);

  if (!context) {
    throw new Error("useLead must be used inside LeadProvider");
  }

  return context;
};
