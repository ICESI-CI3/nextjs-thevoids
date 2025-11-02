import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { useRouter } from 'next/navigation';
import LoginPage from './page';
import { useAuth } from '@/lib/contexts/AuthContext';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('LoginPage', () => {
  const mockLogin = jest.fn();
  const mockPush = jest.fn();
  const mockRouter = { push: mockPush };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('Rendering', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isAuthenticated: false,
      });
    });

    it('should render the login form', () => {
      render(<LoginPage />);

      expect(screen.getByText('🌿 HabitHive')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /iniciar sesión/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /iniciar sesión/i })
      ).toBeInTheDocument();
    });

    it('should render form fields with correct attributes', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);

      expect(emailInput).toHaveAttribute('type', 'text');
      expect(emailInput).toHaveAttribute('required');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
    });
  });

  describe('Authentication Flow', () => {
    it('should redirect to users page when already authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isAuthenticated: true,
      });

      render(<LoginPage />);

      expect(mockPush).toHaveBeenCalledWith('/users');
    });

    it('should not redirect when not authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isAuthenticated: false,
      });

      render(<LoginPage />);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isAuthenticated: false,
      });
    });

    it('should call login with form data on submit', async () => {
      mockLogin.mockResolvedValue({ success: true });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', {
        name: /iniciar sesión/i,
      });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should redirect to users page on successful login', async () => {
      mockLogin.mockResolvedValue({ success: true });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', {
        name: /iniciar sesión/i,
      });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/users');
      });
    });

    it('should show error message on login failure', async () => {
      const errorMessage = 'Credenciales inválidas';
      mockLogin.mockResolvedValue({ success: false, error: errorMessage });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', {
        name: /iniciar sesión/i,
      });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should show default error message when login fails without specific error', async () => {
      mockLogin.mockResolvedValue({ success: false });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', {
        name: /iniciar sesión/i,
      });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error al iniciar sesión')).toBeInTheDocument();
      });
    });

    it('should disable submit button while loading', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise(resolve => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValue(loginPromise);

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', {
        name: /iniciar sesión/i,
      });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument();

      resolveLogin!({ success: false, error: 'Test error' });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(submitButton).toHaveTextContent('Iniciar Sesión');
      });
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isAuthenticated: false,
      });
    });

    it('should require email and password fields', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);

      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('should prevent form submission when fields are empty', () => {
      render(<LoginPage />);

      const form = screen
        .getByRole('button', { name: /iniciar sesión/i })
        .closest('form');
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');

      form?.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });
});
