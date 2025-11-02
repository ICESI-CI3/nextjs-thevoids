import { render, screen } from '@testing-library/react';
import Habits from './page';

describe('Habits Page', () => {
  it('should render the habits page title', () => {
    render(<Habits />);
    expect(screen.getByText('Habits')).toBeInTheDocument();
  });

  it('should render with correct styling', () => {
    render(<Habits />);
    const title = screen.getByText('Habits');
    expect(title).toHaveClass('text-black');
  });
});
