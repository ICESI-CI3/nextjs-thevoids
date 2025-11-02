import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormBuilder from './FormBuilder';

describe('FormBuilder', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const basicFields = [
    { name: 'name', label: 'Name', type: 'text' as const, required: true },
    { name: 'email', label: 'Email', type: 'email' as const, required: true },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<FormBuilder fields={basicFields} onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should render submit button with custom label', () => {
      render(
        <FormBuilder
          fields={basicFields}
          onSubmit={mockOnSubmit}
          submitLabel="Create"
        />
      );

      expect(
        screen.getByRole('button', { name: /create/i })
      ).toBeInTheDocument();
    });

    it('should render cancel button when onCancel is provided', () => {
      render(
        <FormBuilder
          fields={basicFields}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          cancelLabel="Close"
        />
      );

      expect(
        screen.getByRole('button', { name: /close/i })
      ).toBeInTheDocument();
    });

    it('should show required indicator for required fields', () => {
      render(<FormBuilder fields={basicFields} onSubmit={mockOnSubmit} />);

      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators).toHaveLength(2);
    });

    it('should render with initial values', () => {
      const initialValues = { name: 'John Doe', email: 'john@test.com' };

      render(
        <FormBuilder
          fields={basicFields}
          onSubmit={mockOnSubmit}
          initialValues={initialValues}
        />
      );

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@test.com')).toBeInTheDocument();
    });
  });

  describe('Field Types', () => {
    it('should render text input correctly', () => {
      const fields = [
        { name: 'username', label: 'Username', type: 'text' as const },
      ];
      render(<FormBuilder fields={fields} onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/username/i);
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render email input correctly', () => {
      const fields = [
        { name: 'email', label: 'Email', type: 'email' as const },
      ];
      render(<FormBuilder fields={fields} onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input correctly', () => {
      const fields = [
        { name: 'password', label: 'Password', type: 'password' as const },
      ];
      render(<FormBuilder fields={fields} onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/password/i);
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render textarea correctly', () => {
      const fields = [
        {
          name: 'description',
          label: 'Description',
          type: 'textarea' as const,
        },
      ];
      render(<FormBuilder fields={fields} onSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText(/description/i);
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should render select field with options', () => {
      const fields = [
        {
          name: 'role',
          label: 'Role',
          type: 'select' as const,
          options: [
            { value: 'admin', label: 'Administrator' },
            { value: 'user', label: 'User' },
          ],
        },
      ];

      render(<FormBuilder fields={fields} onSubmit={mockOnSubmit} />);

      const select = screen.getByLabelText(/role/i);
      expect(select.tagName).toBe('SELECT');
      expect(screen.getByText('Administrator')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('should render checkbox field', () => {
      const fields = [
        { name: 'isActive', label: 'Active', type: 'checkbox' as const },
      ];
      render(<FormBuilder fields={fields} onSubmit={mockOnSubmit} />);

      const checkbox = screen.getByLabelText(/active/i);
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with form values', async () => {
      render(<FormBuilder fields={basicFields} onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /guardar/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
        });
      });
    });

    it('should prevent default form submission', () => {
      render(<FormBuilder fields={basicFields} onSubmit={mockOnSubmit} />);

      const form = screen
        .getByRole('button', { name: /guardar/i })
        .closest('form');
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');

      form?.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should disable submit button when loading', () => {
      render(
        <FormBuilder
          fields={basicFields}
          onSubmit={mockOnSubmit}
          isLoading={true}
        />
      );

      const submitButton = screen.getByRole('button', { name: /guardando/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Interaction', () => {
    it('should update values when inputs change', () => {
      render(<FormBuilder fields={basicFields} onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'New Name' } });

      expect(nameInput.value).toBe('New Name');
    });

    it('should handle checkbox toggle', () => {
      const fields = [
        { name: 'isActive', label: 'Active', type: 'checkbox' as const },
      ];
      render(<FormBuilder fields={fields} onSubmit={mockOnSubmit} />);

      const checkbox = screen.getByLabelText(/active/i) as HTMLInputElement;

      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);

      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });

    it('should handle select change', () => {
      const fields = [
        {
          name: 'status',
          label: 'Status',
          type: 'select' as const,
          options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ],
        },
      ];

      render(<FormBuilder fields={fields} onSubmit={mockOnSubmit} />);

      const select = screen.getByLabelText(/status/i) as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'inactive' } });

      expect(select.value).toBe('inactive');
    });
  });

  describe('Cancel Functionality', () => {
    it('should call onCancel when cancel button is clicked', () => {
      render(
        <FormBuilder
          fields={basicFields}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not render cancel button when onCancel is not provided', () => {
      render(<FormBuilder fields={basicFields} onSubmit={mockOnSubmit} />);

      expect(
        screen.queryByRole('button', { name: /cancelar/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Placeholder Text', () => {
    it('should render placeholder for text inputs', () => {
      const fields = [
        {
          name: 'username',
          label: 'Username',
          type: 'text' as const,
          placeholder: 'Enter your username',
        },
      ];

      render(<FormBuilder fields={fields} onSubmit={mockOnSubmit} />);

      const input = screen.getByPlaceholderText('Enter your username');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty fields array', () => {
      render(<FormBuilder fields={[]} onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /guardar/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('should submit with empty values when no input is provided', async () => {
      const optionalFields = [
        { name: 'name', label: 'Name', type: 'text' as const },
        { name: 'email', label: 'Email', type: 'email' as const },
      ];

      render(<FormBuilder fields={optionalFields} onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /guardar/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: '',
          email: '',
        });
      });
    });
  });
});
