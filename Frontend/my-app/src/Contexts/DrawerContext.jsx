import React, { createContext, useState } from 'react';

export const DrawerContext = createContext();

export const DrawerProvider = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  return (
    <DrawerContext.Provider value={{ mobileOpen, toggleDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
};