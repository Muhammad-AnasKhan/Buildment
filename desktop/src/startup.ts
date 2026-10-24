// Keep this independent of React so module-load failures are visible too.

import './styles/index.css';
const status = document.getElementById('startup-status');
const message = document.getElementById('startup-message');
const retry = document.getElementById('startup-retry');

function showFailure() {
  if (!status || !message || document.documentElement.dataset.appReady) return;
  status.hidden = false;
  status.dataset.failed = 'true';
  message.textContent =
    'The workspace could not start. Reload to try again. If this continues during development, restart pnpm start.';
  if (retry) retry.hidden = false;
}

retry?.addEventListener('click', () => window.location.reload());
window.addEventListener('error', showFailure);
window.addEventListener('unhandledrejection', showFailure);
window.addEventListener('workspace-startup-error', showFailure);
void import('./renderer').catch((error) => {
  console.error('Could not load the workspace:', error);
  showFailure();
});
