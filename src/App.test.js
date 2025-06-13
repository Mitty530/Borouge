import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders ESG Intelligence Engine title in header', () => {
  render(<App />);
  const titleElement = screen.getByRole('heading', { level: 1, name: /The ESG Intelligence Engine/i });
  expect(titleElement).toBeInTheDocument();
});

test('renders search interface', () => {
  render(<App />);
  const searchInput = screen.getByPlaceholderText(/Ask about ESG topics/i);
  expect(searchInput).toBeInTheDocument();
});

test('renders welcome message', () => {
  render(<App />);
  const welcomeElement = screen.getByRole('heading', { level: 2, name: /Welcome to the ESG Intelligence Engine/i });
  expect(welcomeElement).toBeInTheDocument();
});

test('renders search mode toggle buttons', () => {
  render(<App />);
  const intelligenceButton = screen.getByRole('button', { name: /ESG Intelligence/i });
  const smartSearchButton = screen.getByRole('button', { name: /Smart Search/i });
  expect(intelligenceButton).toBeInTheDocument();
  expect(smartSearchButton).toBeInTheDocument();
});

test('renders feature grid', () => {
  render(<App />);
  const esgFeature = screen.getByText(/🔍 ESG Intelligence/i);
  const smartSearchFeature = screen.getByText(/📰 Smart Search/i);
  const fastResultsFeature = screen.getByText(/⚡ Fast Results/i);
  expect(esgFeature).toBeInTheDocument();
  expect(smartSearchFeature).toBeInTheDocument();
  expect(fastResultsFeature).toBeInTheDocument();
});
