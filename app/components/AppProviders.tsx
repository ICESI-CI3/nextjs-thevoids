'use client';

import { ReactNode } from 'react';
import { ThemeContextProvider } from './ThemeContext';
import MuiThemeProvider from './MuiThemeProvider';
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
        <ThemeUpdater />
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Navbar />
          <main className="main-content">
            <PageHeader />
            {children}
          </main>
        </div>
      </MuiThemeProvider>
    </ThemeContextProvider>
  );
}
