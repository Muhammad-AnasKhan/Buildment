import { createRoot } from 'react-dom/client';
import { App } from './ui/App';

const theme = window.matchMedia('(prefers-color-scheme: dark)');
const syncTheme = () =>
  document.documentElement.classList.toggle('dark', theme.matches);
syncTheme();
theme.addEventListener('change', syncTheme);

createRoot(document.getElementById('root')!, {
  onUncaughtError(error) {
    console.error('Workspace render failed:', error);
    delete document.documentElement.dataset.appReady;
    window.dispatchEvent(new Event('workspace-startup-error'));
  },
}).render(<App />);
