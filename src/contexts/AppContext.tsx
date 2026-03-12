import React, { createContext, useContext, useState, useEffect } from 'react';

export type PageType = 'dashboard' | 'equipments' | 'users' | 'user-details' | 'transactions' | 'brands' | 'categories' | 'forum' | 'stories' | 'banners' | 'packages' | 'map';

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedUserId: number | null;
  setSelectedUserId: (id: number | null) => void;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: true,
  toggleSidebar: () => {},
  currentPage: 'dashboard',
  setCurrentPage: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
  selectedUserId: null,
  setSelectedUserId: () => {},
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
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

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
        selectedUserId,
        setSelectedUserId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
