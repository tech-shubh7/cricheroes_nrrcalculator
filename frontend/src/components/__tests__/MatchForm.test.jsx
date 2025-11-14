// src/components/__tests__/MatchForm.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MatchForm from '../matchForm';
import * as api from '../../services/api';

// Mock the API service
jest.mock('../../services/api');

describe('MatchForm Component', () => {
  const mockOnSimulate = jest.fn();
  const mockSetLoading = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render form with all input fields', () => {
    render(<MatchForm onSimulate={mockOnSimulate} setLoading={mockSetLoading} />);

    expect(screen.getByText(/IPL Match Scenario Calculator/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g., RR, MI, CSK/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g., DC, KKR, RCB/i)).toBeInTheDocument();
  });

  test('should have default values for form fields', () => {
    render(<MatchForm onSimulate={mockOnSimulate} setLoading={mockSetLoading} />);

    const yourTeamInput = screen.getByDisplayValue('RR');
    const oppositionInput = screen.getByDisplayValue('DC');

    expect(yourTeamInput).toBeInTheDocument();
    expect(oppositionInput).toBeInTheDocument();
  });

  test('should validate that teams cannot be the same', async () => {
    api.calculateMatch.mockResolvedValue({ success: true });

    render(<MatchForm onSimulate={mockOnSimulate} setLoading={mockSetLoading} />);

    const submitButton = screen.getByRole('button', { name: /calculate/i });
    const yourTeamInput = screen.getByDisplayValue('RR');

    fireEvent.change(yourTeamInput, { target: { value: 'DC' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Teams must be different/i)).toBeInTheDocument();
    });
  });

  test('should validate match overs is positive', async () => {
    api.calculateMatch.mockResolvedValue({ success: true });

    render(<MatchForm onSimulate={mockOnSimulate} setLoading={mockSetLoading} />);

    const submitButton = screen.getByRole('button', { name: /calculate/i });
    const oversInput = screen.getByDisplayValue('20');

    fireEvent.change(oversInput, { target: { value: '-5' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Match overs must be a positive number/i)).toBeInTheDocument();
    });
  });

  test('should call calculateMatch on form submission with valid inputs', async () => {
    const mockResponse = { success: true, data: [] };
    api.calculateMatch.mockResolvedValue(mockResponse);

    render(<MatchForm onSimulate={mockOnSimulate} setLoading={mockSetLoading} />);

    const submitButton = screen.getByRole('button', { name: /calculate/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.calculateMatch).toHaveBeenCalled();
    });
  });

  test('should call onSimulate callback on successful API response', async () => {
    const mockResponse = { success: true, fullTable: [] };
    api.calculateMatch.mockResolvedValue(mockResponse);

    render(<MatchForm onSimulate={mockOnSimulate} setLoading={mockSetLoading} />);

    const submitButton = screen.getByRole('button', { name: /calculate/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSimulate).toHaveBeenCalledWith(mockResponse);
    });
  });

  test('should handle API errors gracefully', async () => {
    api.calculateMatch.mockRejectedValue(new Error('API Error'));

    render(<MatchForm onSimulate={mockOnSimulate} setLoading={mockSetLoading} />);

    const submitButton = screen.getByRole('button', { name: /calculate/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      // Error should be displayed somewhere in the form
      const errorText = screen.queryByText(/API Error|Simulation/i);
      expect(errorText).toBeInTheDocument();
    });
  });

  test('should display success message after successful simulation', async () => {
    const mockResponse = { success: true, fullTable: [] };
    api.calculateMatch.mockResolvedValue(mockResponse);

    render(<MatchForm onSimulate={mockOnSimulate} setLoading={mockSetLoading} />);

    const submitButton = screen.getByRole('button', { name: /calculate/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Simulation successful/i)).toBeInTheDocument();
    });
  });

  test('should update form fields when user types', () => {
    render(<MatchForm onSimulate={mockOnSimulate} setLoading={mockSetLoading} />);

    const yourTeamInput = screen.getByPlaceholderText(/e.g., RR, MI, CSK/i);

    fireEvent.change(yourTeamInput, { target: { value: 'MI' } });

    expect(yourTeamInput.value).toBe('MI');
  });

  test('should toggle between batting and bowling scenarios', () => {
    render(<MatchForm onSimulate={mockOnSimulate} setLoading={mockSetLoading} />);

    // Find the select element by its label or the form context
    const selects = screen.getAllByRole('combobox');
    const tossSelect = selects[0]; // First select is the toss result
    
    fireEvent.change(tossSelect, { target: { value: 'bowling' } });
    expect(tossSelect.value).toBe('bowling');

    fireEvent.change(tossSelect, { target: { value: 'batting' } });
    expect(tossSelect.value).toBe('batting');
  });
});
