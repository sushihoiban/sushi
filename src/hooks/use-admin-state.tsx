import { createContext, useContext, useState, useCallback } from 'react';

interface AdminStateContextType {
  bookingTrigger: number;
  refetchBookings: () => void;
}

const AdminStateContext = createContext<AdminStateContextType>({
  bookingTrigger: 0,
  refetchBookings: () => {},
});

export const AdminStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [bookingTrigger, setBookingTrigger] = useState(0);

  const refetchBookings = useCallback(() => {
    setBookingTrigger(prev => prev + 1);
  }, []);

  return (
    <AdminStateContext.Provider value={{ bookingTrigger, refetchBookings }}>
      {children}
    </AdminStateContext.Provider>
  );
};

export const useAdminState = () => useContext(AdminStateContext);
