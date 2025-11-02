import { render, screen } from '@testing-library/react';
import Transactions from './page';

describe('Transactions Page', () => {
  it('should render the transactions page title', () => {
    render(<Transactions />);
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  it('should render with correct styling', () => {
    render(<Transactions />);
    const title = screen.getByText('Transactions');
    expect(title).toHaveClass('text-black');
  });
});
