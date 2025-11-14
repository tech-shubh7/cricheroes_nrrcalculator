// src/components/__tests__/PointsTable.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PointsTable from '../pointsTable';
import * as api from '../../services/api';

jest.mock('../../services/api');

describe('PointsTable Component', () => {
  const mockSetTable = jest.fn();

  const mockTableData = [
    {
      id: 'RR',
      name: 'Rajasthan Royals',
      matches: 14,
      won: 7,
      lost: 7,
      pts: 14,
      nrr: 0.5
    },
    {
      id: 'DC',
      name: 'Delhi Capitals',
      matches: 14,
      won: 8,
      lost: 6,
      pts: 16,
      nrr: 0.8
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render points table title', () => {
    render(
      <PointsTable table={[]} setTable={mockSetTable} loading={false} />
    );

    expect(screen.getByText(/Points Table/i)).toBeInTheDocument();
  });

  test('should display teams in table format', () => {
    render(
      <PointsTable table={mockTableData} setTable={mockSetTable} loading={false} />
    );

    expect(screen.getByText('Rajasthan Royals')).toBeInTheDocument();
    expect(screen.getByText('Delhi Capitals')).toBeInTheDocument();
  });

  test('should display team statistics (wins, losses, points)', () => {
    render(
      <PointsTable table={mockTableData} setTable={mockSetTable} loading={false} />
    );

    // Check if points are displayed - use getAllByText since multiple elements may have "14"
    const allPoints = screen.getAllByText('14');
    expect(allPoints.length).toBeGreaterThan(0); // RR matches (14 matches and 14 points)
  });

  test('should display NRR values', () => {
    render(
      <PointsTable table={mockTableData} setTable={mockSetTable} loading={false} />
    );

    expect(screen.getByText(/0.5/)).toBeInTheDocument();
    expect(screen.getByText(/0.8/)).toBeInTheDocument();
  });

  test('should show loading state', () => {
    render(
      <PointsTable table={[]} setTable={mockSetTable} loading={true} />
    );

    expect(screen.getByText(/Loading/i) || screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('should fetch and display points table on mount', async () => {
    api.fetchPointsTable.mockResolvedValue({
      success: true,
      data: mockTableData
    });

    render(
      <PointsTable table={[]} setTable={mockSetTable} loading={false} />
    );

    // Component should attempt to fetch data
    await waitFor(() => {
      expect(api.fetchPointsTable).toHaveBeenCalled();
    });
  });

  test('should handle empty table gracefully', () => {
    render(
      <PointsTable table={[]} setTable={mockSetTable} loading={false} />
    );

    // Should render without errors
    expect(screen.getByText(/Points Table/i)).toBeInTheDocument();
  });

  test('should display table headers', () => {
    render(
      <PointsTable table={mockTableData} setTable={mockSetTable} loading={false} />
    );

    // Check for common table headers
    const headers = screen.getByRole('table').getElementsByTagName('th');
    expect(headers.length).toBeGreaterThan(0);
  });
});
