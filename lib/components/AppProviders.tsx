'use client';

import { ReactNode } from 'react';
import { ThemeContextProvider } from './ThemeContext';
import MuiThemeProvider from './MuiThemeProvider';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { DataProvider } from '@/lib/contexts/DataContext';
import ProtectedRoute from './ProtectedRoute';
import Navbar from './Navbar';
import PageHeader from './PageHeader';
import ThemeUpdater from './ThemeUpdater';

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeContextProvider>
      <MuiThemeProvider>
        <AuthProvider>
          <DataProvider>
            <ProtectedRoute>
              <ThemeUpdater />
              <div style={{ display: 'flex', minHeight: '100vh' }}>
                <Navbar />
                <main className="main-content">
                  <PageHeader />
                  {children}
                </main>
              </div>
            </ProtectedRoute>
          </DataProvider>
        </AuthProvider>
      </MuiThemeProvider>
    </ThemeContextProvider>
  );
}
