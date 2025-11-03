import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { DataProvider } from './contexts/DataContext';
import { HabitHiveProvider } from './contexts/HabitHiveContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeContextProvider } from './components/ThemeContext';

interface AllProvidersProps {
  children: React.ReactNode;
}

export const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <DataProvider>
          <HabitHiveProvider>{children}</HabitHiveProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeContextProvider>
  );
};

export const DataContextWrapper: React.FC<AllProvidersProps> = ({
  children,
}) => {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <DataProvider>{children}</DataProvider>
      </AuthProvider>
    </ThemeContextProvider>
  );
};

export const HabitHiveWrapper: React.FC<AllProvidersProps> = ({ children }) => {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <HabitHiveProvider>{children}</HabitHiveProvider>
      </AuthProvider>
    </ThemeContextProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
