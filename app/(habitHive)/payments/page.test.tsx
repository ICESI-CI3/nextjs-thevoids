import { render, screen } from '@testing-library/react';
import Payments from './page';

describe('Payments Page', () => {
  it('should render the payments page title', () => {
    render(<Payments />);
    expect(screen.getByText('Payments')).toBeInTheDocument();
  });

  it('should render with correct styling', () => {
    render(<Payments />);
    const title = screen.getByText('Payments');
    expect(title).toHaveClass('text-black');
  });
});
