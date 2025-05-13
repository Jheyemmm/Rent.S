import React, { createContext, useContext, useEffect, useState } from 'react';
import { checkAllTenantBalances } from '../utils/balanceChecker';

interface BalanceContextType {
  lastChecked: Date | null;
  checkBalances: () => Promise<number | undefined>;
  isChecking: boolean;
}

const BalanceContext = createContext<BalanceContextType>({
  lastChecked: null,
  checkBalances: async () => undefined,
  isChecking: false
});

export const useBalanceCheck = () => useContext(BalanceContext);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  const checkBalances = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      const updatedCount = await checkAllTenantBalances();
      setLastChecked(new Date());
      return updatedCount;
    } finally {
      setIsChecking(false);
    }
  };
  
  // Check balances when the provider mounts
  useEffect(() => {
    checkBalances();
    
    // Optional: set up a daily check
    const dailyCheckInterval = setInterval(checkBalances, 24 * 60 * 60 * 1000); // 24 hours
    
    return () => clearInterval(dailyCheckInterval);
  }, []);
  
  return (
    <BalanceContext.Provider value={{ lastChecked, checkBalances, isChecking }}>
      {children}
    </BalanceContext.Provider>
  );
};