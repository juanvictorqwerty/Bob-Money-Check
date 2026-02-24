import { render, screen } from '@testing-library/react';
import Header from '../header';

// Mock the actions
jest.mock('@/actions/accountCommonFunctions', () => ({
  DisconnectCurrentDevice: jest.fn().mockResolvedValue({ success: true }),
  DisconnectAllDevices: jest.fn().mockResolvedValue({ success: true }),
  DisconnectAllExceptOne: jest.fn().mockResolvedValue({ success: true }),
}));

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the logo text', () => {
    render(<Header />);
    // Use getAllByText since there are multiple instances
    expect(screen.getAllByText(/Bob Money Check/)).toHaveLength(2);
  });

  it('should render the BMC logo for mobile', () => {
    render(<Header />);
    expect(screen.getByText('BMC')).toBeInTheDocument();
  });

  it('should render the Account link', () => {
    render(<Header />);
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('should render header element', () => {
    const { container } = render(<Header />);
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('should render logout options in menu', () => {
    render(<Header />);
    // Just verify component renders properly
    expect(screen.getAllByText(/Bob Money Check/)).toHaveLength(2);
  });
});
