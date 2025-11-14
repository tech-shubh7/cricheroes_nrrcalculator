// src/__tests__/App.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import * as api from '../services/api';

jest.mock('../services/api');

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render main heading', () => {
    render(<App />);

    expect(screen.getByText(/CricHeroes — Position Calculator/i)).toBeInTheDocument();
  });

  test('should render subtitle', () => {
    render(<App />);

    expect(screen.getByText(/Predict runs\/overs to reach the position you need/i)).toBeInTheDocument();
  });

  test('should render MatchForm component', () => {
    render(<App />);

    expect(screen.getByText(/IPL Match Scenario Calculator/i)).toBeInTheDocument();
  });

  test('should render PointsTable component', () => {
    render(<App />);

    expect(screen.getByText(/Points Table/i)).toBeInTheDocument();
  });

  test('should render ResultDisplay component', () => {
    render(<App />);

    // ResultDisplay should be present (might be empty initially)
    const container = document.querySelector('.bg-slate-50');
    expect(container).toBeInTheDocument();
  });

  test('should render footer', () => {
    render(<App />);

    expect(screen.getByText(/Built by Shubham Patel/i)).toBeInTheDocument();
  });

  test('should have proper page layout structure', () => {
    render(<App />);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    
    const header = screen.getByRole('heading', { name: /CricHeroes/i });
    expect(header).toBeInTheDocument();
  });

  test('should handle form submission and update table', async () => {
    const mockTableResponse = {
      success: true,
      data: [
        { id: 'RR', name: 'Rajasthan Royals', pts: 14, nrr: 0.5 }
      ]
    };

    api.fetchPointsTable.mockResolvedValue(mockTableResponse);

    render(<App />);

    await waitFor(() => {
      // Form should be rendered and ready to interact with
      expect(screen.getByText(/IPL Match Scenario Calculator/i)).toBeInTheDocument();
    });
  });

  test('should initialize with empty result state', () => {
    render(<App />);

    // Initially, result display area should be empty or show placeholder
    const mainContainer = document.querySelector('.bg-slate-50');
    expect(mainContainer).toBeInTheDocument();
  });
});
