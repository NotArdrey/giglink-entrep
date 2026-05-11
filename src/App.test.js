import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./features/navigation', () => ({
  useAppNavigation: () => ({
    isLoadingTransition: true,
  }),
  renderView: jest.fn(),
}));

test('renders the app loading shell', () => {
  render(<App />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
