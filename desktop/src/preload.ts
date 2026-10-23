import { contextBridge, ipcRenderer } from 'electron';
import type { DesktopAPI } from './catalog';

const api: DesktopAPI = {
  listCourses: () => ipcRenderer.invoke('catalog:list'),
  courseDetail: (slug) => ipcRenderer.invoke('catalog:detail', slug),
  signIn: () => ipcRenderer.invoke('auth:sign-in'),
  cancelSignIn: () => ipcRenderer.invoke('auth:cancel-sign-in'),
  signOut: () => ipcRenderer.invoke('auth:sign-out'),
};
contextBridge.exposeInMainWorld('buildment', api);
