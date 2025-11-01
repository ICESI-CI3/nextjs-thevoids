'use client';

import { ReactNode } from 'react';
import { ThemeContextProvider } from './ThemeContext';
import MuiThemeProvider from './MuiThemeProvider';
import Navbar from './Navbar';
import PageHeader from './PageHeader';

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeContextProvider>
      <MuiThemeProvider>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Navbar />
          <main
            style={{
              flexGrow: 1,
              padding: '32px',
            }}
          >
            <PageHeader />
            {children}
          </main>
        </div>
      </MuiThemeProvider>
    </ThemeContextProvider>
  );
}
