import axios from 'axios';

const API_BASE = 'http://localhost:4000';
const API = axios.create({ baseURL: API_BASE, timeout: 10000 });

// Fetch current points table
export async function fetchPointsTable() {
  const res = await API.get('/api/points-table');
  return res.data;
}

// Simulate a match outcome
export async function calculateMatch(payload) {
  const res = await API.post('/api/calculate', payload);
  return res.data;
}

export default API;
