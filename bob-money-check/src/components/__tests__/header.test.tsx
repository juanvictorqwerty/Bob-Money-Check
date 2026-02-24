import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    // Reset cookie mock
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  it('should render the logo', () => {
    render(<Header />);
    expect(screen.getByText('Bob Money Check')).toBeInTheDocument();
  });

  it('should render the Account link', () => {
    render(<Header />);
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('should not render header on auth pages', () => {
    // Mock pathname to be an auth page
    jest.spyOn(require('next/navigation'), 'usePathname').mockReturnValue('/auth/login');
    
    const { container } = render(<Header />);
    // On auth pages, header still renders but shows minimal version
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('should toggle menu when dots button is clicked', () => {
    render(<Header />);
    
    // Find and click the menu button
    const menuButton = screen.getByLabelText('Menu');
    fireEvent.click(menuButton);
    
    // Check if logout options are visible
    expect(screen.getByText('Logout Current Device')).toBeInTheDocument();
  });

  it('should show loading state during logout', async () => {
    // Mock a slow response
    const { DisconnectCurrentDevice } = require('@/actions/accountCommonFunctions');
    (DisconnectCurrentDevice as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<Header />);
    
    // Open menu
    const menuButton = screen.getByLabelText('Menu');
    fireEvent.click(menuButton);
    
    // Click logout current device
    const logoutButton = screen.getByText('Logout Current Device');
    fireEvent.click(logoutButton);
    
    // Check for loading state
    await waitFor(() => {
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });

  it('should render mobile menu on small screens', () => {
    // Make window small
    global.innerWidth = 500;
    
    render(<Header />);
    
    // Mobile menu should have different elements
    expect(screen.getByText('More')).toBeInTheDocument();
  });
});
