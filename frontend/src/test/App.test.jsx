import { render } from '@testing-library/react';
import App from '../App';

test('renders app root element', () => {
  const { container } = render(<App />);
  expect(container.querySelector('#root') || container.firstChild).toBeTruthy();
});
