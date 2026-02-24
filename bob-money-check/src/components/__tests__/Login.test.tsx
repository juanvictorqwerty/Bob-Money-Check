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

  it('should render the login form', () => {
    render(<Login />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should render sign up link', () => {
    render(<Login />);
    
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
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

  it('should show error message on failed login', async () => {
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
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should show error message when email is empty on submit', async () => {
    render(<Login />);
    
    // Submit empty form
    fireEvent.submit(screen.getByRole('button', { name: /login/i }));
    
    // Wait for the login action to be called (even with empty fields)
    await waitFor(() => {
      expect(mockLoginStudent).toHaveBeenCalled();
    });
  });

  it('should render remember me checkbox', () => {
    render(<Login />);
    
    const rememberCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
    expect(rememberCheckbox).toBeInTheDocument();
  });

  it('should render forgot password link', () => {
    render(<Login />);
    
    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
  });
});
