import { render, screen } from '@testing-library/react';
import Header from '../header';

// Mock the db module
jest.mock('@/utils/db', () => ({
  __esModule: true,
  default: {},
}));

// Mock the authFunction module
jest.mock('@/utils/authFunction', () => ({
  __esModule: true,
  logout: jest.fn().mockResolvedValue({ success: true }),
}));

describe('Header', () => {
  it('should render the logo text BMC', () => {
    render(<Header />);
    expect(screen.getAllByText('BMC')[0]).toBeInTheDocument();
  });

  it('should render the Account link', () => {
    render(<Header />);
    // Account appears twice (desktop and mobile), so use getAllByText
    const accountLinks = screen.getAllByText('Account');
    expect(accountLinks.length).toBeGreaterThan(0);
  });

  it('should render header element', () => {
    const { container } = render(<Header />);
    expect(container.querySelector('header')).toBeInTheDocument();
  });
});
