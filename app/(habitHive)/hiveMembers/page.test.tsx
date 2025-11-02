import { render, screen } from '@testing-library/react';
import HiveMembers from './page';

describe('HiveMembers Page', () => {
  it('should render the hive members page title', () => {
    render(<HiveMembers />);
    expect(screen.getByText('Hive Members')).toBeInTheDocument();
  });

  it('should render with correct styling', () => {
    render(<HiveMembers />);
    const title = screen.getByText('Hive Members');
    expect(title).toHaveClass('text-black');
  });
});
