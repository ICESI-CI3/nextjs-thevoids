import { render, screen } from '@testing-library/react';
import Hives from './page';

describe('Hives Page', () => {
  it('should render the hives page title', () => {
    render(<Hives />);
    expect(screen.getByText('Hives')).toBeInTheDocument();
  });

  it('should render with correct styling', () => {
    render(<Hives />);
    const title = screen.getByText('Hives');
    expect(title).toHaveClass('text-black');
  });
});
