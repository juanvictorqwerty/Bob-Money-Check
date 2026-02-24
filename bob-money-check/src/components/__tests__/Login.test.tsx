import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';

// Mock the loginStudent action
jest.mock('@/actions/student', () => ({
  loginStudent: jest.fn(),
}));

describe('Login', () => {
  const mockLoginStudent = require('@/actions/student').loginStudent;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the login form heading', () => {
    render(<Login />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });

  it('should render email input', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText('email')).toBeInTheDocument();
  });

  it('should render password input', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('should render login button', () => {
    render(<Login />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should render sign up link', () => {
    render(<Login />);
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('should render have an account text', () => {
    render(<Login />);
    expect(screen.getByText('Have an account?')).toBeInTheDocument();
  });

  it('should update email field on change', () => {
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText('email');
    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('should update password field on change', () => {
    render(<Login />);
    
    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    
    expect(passwordInput).toHaveValue('password123');
  });

  it('should call loginStudent on form submit', async () => {
    (mockLoginStudent as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Invalid credentials',
    });

    render(<Login />);
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('email'), { 
      target: { name: 'email', value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { name: 'password', value: 'wrongpassword' } 
    });
    
    // Submit the form
    fireEvent.submit(screen.getByRole('button', { name: /login/i }));
    
    // Wait for loginStudent to be called
    await waitFor(() => {
      expect(mockLoginStudent).toHaveBeenCalled();
    });
  });
});
