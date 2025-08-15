import React, { createContext, useContext, ReactNode } from 'react';
import { ApiService } from '@/lib/services/api';

interface ApiServiceContextType {
  apiService: ApiService | null;
}

const ApiServiceContext = createContext<ApiServiceContextType | undefined>(undefined);

export const useApiService = () => {
  const context = useContext(ApiServiceContext);
  if (!context) {
    throw new Error('useApiService must be used within an ApiServiceProvider');
  }
  return context;
};

interface ApiServiceProviderProps {
  children: ReactNode;
  service: ApiService | null;
}

export const ApiServiceProvider: React.FC<ApiServiceProviderProps> = ({ children, service }) => {
  return (
    <ApiServiceContext.Provider value={{ apiService: service }}>
      {children}
    </ApiServiceContext.Provider>
  );
};
