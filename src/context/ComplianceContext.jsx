import React, { createContext, useContext, useState, useEffect } from 'react';

const ComplianceContext = createContext(null);

/**
 * usePersistentState — like useState but synced to localStorage.
 * On mount reads the stored value; writes to storage on every update.
 */
function usePersistentState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored);
    } catch {/* ignore parse errors */}
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {/* ignore write errors */}
  }, [key, value]);

  return [value, setValue];
}

export const ComplianceProvider = ({ children }) => {
  const [inputType, setInputType]           = usePersistentState('compliance.inputType', 'dropdown');
  const [selectedWebsite, setSelectedWebsite] = usePersistentState('compliance.selectedWebsite', '');
  const [manualWebsiteId, setManualWebsiteId] = usePersistentState('compliance.manualWebsiteId', '');
  const [auditResult, setAuditResult]       = usePersistentState('compliance.auditResult', null);
  // Don't persist loading/error — reset them fresh on each page load
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  return (
    <ComplianceContext.Provider value={{
      inputType, setInputType,
      selectedWebsite, setSelectedWebsite,
      manualWebsiteId, setManualWebsiteId,
      auditResult, setAuditResult,
      loading, setLoading,
      error, setError,
    }}>
      {children}
    </ComplianceContext.Provider>
  );
};

export const useCompliance = () => {
  const ctx = useContext(ComplianceContext);
  if (!ctx) throw new Error('useCompliance must be used within a ComplianceProvider');
  return ctx;
};

