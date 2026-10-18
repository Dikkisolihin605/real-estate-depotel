import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with auto-update capability
const updateSW = registerSW({
  onNeedRefresh() {
    // Notify user of new version
    window.dispatchEvent(new CustomEvent('pwa-update-available', { detail: { updateSW } }));
  },
  onOfflineReady() {
    console.log('DEPOTEL: Aplikasi siap digunakan saat offline');
  },
});

createRoot(document.getElementById('root')!).render(<App />);

