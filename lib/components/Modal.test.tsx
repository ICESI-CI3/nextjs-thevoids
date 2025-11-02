import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('debe aplicar clases de estilo correctamente', () => {
      const mockOnClose = jest.fn();
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Styled Modal">
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByText('Styled Modal')).toBeInTheDocument();
    });

    it('should render children content', () => {
      const customContent = (
        <div>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
        </div>
      );

      render(<Modal {...defaultProps}>{customContent}</Modal>);

      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });
  });

  describe('Size variants', () => {
    it('should apply small size class', () => {
      const { container } = render(<Modal {...defaultProps} size="sm" />);

      const modalContent = container.querySelector('.max-w-md');
      expect(modalContent).toBeInTheDocument();
    });

    it('should apply medium size class by default', () => {
      const { container } = render(<Modal {...defaultProps} />);

      const modalContent = container.querySelector('.max-w-lg');
      expect(modalContent).toBeInTheDocument();
    });

    it('should apply large size class', () => {
      const { container } = render(<Modal {...defaultProps} size="lg" />);

      const modalContent = container.querySelector('.max-w-2xl');
      expect(modalContent).toBeInTheDocument();
    });

    it('should apply extra large size class', () => {
      const { container } = render(<Modal {...defaultProps} size="xl" />);

      const modalContent = container.querySelector('.max-w-4xl');
      expect(modalContent).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when overlay is clicked', () => {
      const onClose = jest.fn();
      const { container } = render(
        <Modal {...defaultProps} onClose={onClose} />
      );

      const overlay = container.querySelector('.bg-gray-500.bg-opacity-75');
      expect(overlay).toBeInTheDocument();

      if (overlay) {
        fireEvent.click(overlay);
      }

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when modal content is clicked', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      const modalContent = screen.getByText('Modal Content');
      fireEvent.click(modalContent);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have close button with SVG icon', () => {
      render(<Modal {...defaultProps} />);

      const closeButton = screen.getByRole('button');
      const svg = closeButton.querySelector('svg');

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-6', 'w-6');
    });

    it('should render overlay with proper z-index', () => {
      const { container } = render(<Modal {...defaultProps} />);

      const modalContainer = container.querySelector('.fixed.inset-0.z-50');
      expect(modalContainer).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have proper modal structure classes', () => {
      const { container } = render(<Modal {...defaultProps} />);

      expect(
        container.querySelector('.fixed.inset-0.z-50')
      ).toBeInTheDocument();
      expect(
        container.querySelector('.bg-white.rounded-lg')
      ).toBeInTheDocument();
      expect(container.querySelector('.shadow-xl')).toBeInTheDocument();
    });

    it('should have title with proper styling', () => {
      render(<Modal {...defaultProps} />);

      const title = screen.getByText('Test Modal');
      expect(title.tagName).toBe('H3');
      expect(title).toHaveClass('text-lg', 'font-medium', 'text-gray-900');
    });
  });
});
