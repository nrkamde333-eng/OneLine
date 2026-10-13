import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress known Firebase Auth SDK popup assertion race condition:
// When an OAuth popup is closed by user, Firebase's internal event listener can fire an unhandled assertion
// ("INTERNAL ASSERTION FAILED: Pending promise was never set") because the pending promise was already rejected.
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const msg = event?.message || '';
    if (
      msg.includes('Pending promise was never set') ||
      msg.includes('popup-closed-by-user') ||
      msg.includes('cancelled-popup-request')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reasonMsg = String(event?.reason?.message || event?.reason || '');
    const reasonCode = event?.reason?.code;
    if (
      reasonMsg.includes('Pending promise was never set') ||
      reasonMsg.includes('popup-closed-by-user') ||
      reasonMsg.includes('cancelled-popup-request') ||
      reasonCode === 'auth/popup-closed-by-user' ||
      reasonCode === 'auth/cancelled-popup-request'
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
