import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ESG Intelligence Engine', () => {
  render(<App />);
  const titleElement = screen.getByText(/ESG Intelligence Engine/i);
  expect(titleElement).toBeInTheDocument();
});
