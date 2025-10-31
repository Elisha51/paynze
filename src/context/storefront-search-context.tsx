'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type StorefrontSearchContextType = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

const StorefrontSearchContext = createContext<StorefrontSearchContextType | undefined>(undefined);

export function StorefrontSearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <StorefrontSearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </StorefrontSearchContext.Provider>
  );
}

export function useStorefrontSearch() {
  const context = useContext(StorefrontSearchContext);
  if (context === undefined) {
    throw new Error('useStorefrontSearch must be used within a StorefrontSearchProvider');
  }
  return context;
}
