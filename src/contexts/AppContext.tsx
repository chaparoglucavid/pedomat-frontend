import React, { createContext, useContext, useState, useEffect } from 'react';

export type PageType = 'dashboard' | 'equipments' | 'users' | 'transactions' | 'brands' | 'categories' | 'forum' | 'stories' | 'banners' | 'map';

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: true,
  toggleSidebar: () => {},
  currentPage: 'dashboard',
  setCurrentPage: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        currentPage,
        setCurrentPage,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
