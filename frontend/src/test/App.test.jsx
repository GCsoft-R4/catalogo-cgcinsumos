import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

test('renders app without crashing', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText('GCinsumos')).toBeInTheDocument();
  }, { timeout: 5000 });
});
