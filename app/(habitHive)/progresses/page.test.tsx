import { render, screen } from '@testing-library/react';
import Progresses from './page';

describe('Progresses Page', () => {
  it('should render the progresses page title', () => {
    render(<Progresses />);
    expect(screen.getByText('Progresses')).toBeInTheDocument();
  });

  it('should render with correct styling', () => {
    render(<Progresses />);
    const title = screen.getByText('Progresses');
    expect(title).toHaveClass('text-black');
  });
});
