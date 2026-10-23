import { createRoot } from 'react-dom/client';
import { App } from './ui/App';

createRoot(document.getElementById('root')!, {
  onUncaughtError(error) {
    console.error('Workspace render failed:', error);
    delete document.documentElement.dataset.appReady;
    window.dispatchEvent(new Event('workspace-startup-error'));
  },
}).render(<App />);
