import {
  app,
  BrowserWindow,
  ipcMain,
  nativeTheme,
  shell,
  type IpcMainInvokeEvent,
} from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { backendBase, fetchCatalog } from './api';
import { createPreviewClient } from './preview-api';
import { createBrowserAuth } from './browser-auth';

let mainWindow: BrowserWindow | null = null;
const apiBase = process.env.BUILDMENT_API_URL || 'http://localhost:4000';
const previewClient = createPreviewClient(apiBase);
const browserAuth = createBrowserAuth(
  process.env.BUILDMENT_WEB_URL || 'http://localhost:3000',
  previewClient.exchange,
  (url) => shell.openExternal(url),
);
function cancelBrowserAuth() {
  previewClient.cancelSignIn();
  browserAuth.cancel();
}
app.on('before-quit', cancelBrowserAuth);
function requireRenderer(event: IpcMainInvokeEvent) {
  if (
    !mainWindow ||
    event.sender !== mainWindow.webContents ||
    event.senderFrame !== mainWindow.webContents.mainFrame
  )
    throw new Error('Untrusted request');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'Buildment',
    width: 1240,
    height: 840,
    minWidth: 760,
    minHeight: 600,
    // Never expose the native window's empty surface before the first paint.
    show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#141310' : '#ffffff',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  const window = mainWindow;
  window.once('ready-to-show', () => {
    if (!window.isDestroyed()) window.show();
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());
  mainWindow.webContents.session.setPermissionRequestHandler(
    (_contents, _permission, callback) => callback(false),
  );
  mainWindow.webContents.session.setPermissionCheckHandler(() => false);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  const showLoadError = (error: unknown) => {
    console.error('Could not load the Buildment renderer:', error);
    if (window.isDestroyed()) return;
    const html =
      '<!doctype html><html><head><meta charset="utf-8"><title>Buildment</title></head><body style="background:#ffffff;color:#171717;padding:48px;font:16px Segoe UI,sans-serif"><h1>Buildment could not open</h1><p>The local interface could not be loaded.</p><p>Close this window, stop the development command with Ctrl+C, and run <strong>pnpm start</strong> again from the desktop folder.</p></body></html>';
    void window.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
    );
  };
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL)
    void mainWindow
      .loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
      .catch(showLoadError);
  else
    void mainWindow
      .loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      )
      .catch(showLoadError);
}

if (started) app.quit();
else {
  app.whenReady().then(() => {
    ipcMain.handle('catalog:detail', (event, slug) => {
      requireRenderer(event);
      return previewClient.courseDetail(slug);
    });
    ipcMain.handle('auth:sign-in', async (event) => {
      requireRenderer(event);
      const result = await browserAuth.start();
      if (result.ok && mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
      return result;
    });
    ipcMain.handle('auth:cancel-sign-in', (event) => {
      requireRenderer(event);
      cancelBrowserAuth();
    });
    ipcMain.handle('auth:sign-out', (event) => {
      requireRenderer(event);
      cancelBrowserAuth();
      return previewClient.signOut();
    });
    ipcMain.handle('catalog:list', (event) => {
      if (
        !mainWindow ||
        event.sender !== mainWindow.webContents ||
        event.senderFrame !== mainWindow.webContents.mainFrame
      ) {
        throw new Error('Untrusted request');
      }
      try {
        backendBase(apiBase);
      } catch (error) {
        return {
          ok: false,
          message:
            error instanceof Error
              ? error.message
              : 'Invalid backend configuration.',
        };
      }
      return fetchCatalog(apiBase);
    });
    createWindow();
    app.on('activate', () => {
      if (!mainWindow) createWindow();
    });
  });
}
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
