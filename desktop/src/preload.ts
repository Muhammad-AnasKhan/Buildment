import { contextBridge, ipcRenderer } from 'electron';
import type { DesktopAPI } from './domain/catalog';

const api: DesktopAPI = {
  integrityRequest: (path, method, body) =>
    ipcRenderer.invoke('learning:integrity', path, method, body),
  learning: {
    quiz: (id) => ipcRenderer.invoke('learning:quiz', id),
    submitQuiz: (id, answers) =>
      ipcRenderer.invoke('learning:submit-quiz', id, answers),
    lesson: (course, chapter) =>
      ipcRenderer.invoke('learning:lesson', course, chapter),
    overview: (course) => ipcRenderer.invoke('learning:overview', course),
    block: (id) => ipcRenderer.invoke('learning:block', id),
    answer: (id, payload) => ipcRenderer.invoke('learning:answer', id, payload),
    complete: (id) => ipcRenderer.invoke('learning:complete', id),
    saveLog: (id, answers) =>
      ipcRenderer.invoke('learning:save-log', id, answers),
    checklist: (id, item, checked) =>
      ipcRenderer.invoke('learning:checklist', id, item, checked),
  },
  startLearning: (slug) => ipcRenderer.invoke('course:start-learning', slug),
  enroll: (courseId) => ipcRenderer.invoke('enrollment:create', courseId),
  listCourses: () => ipcRenderer.invoke('catalog:list'),
  courseDetail: (slug) => ipcRenderer.invoke('catalog:detail', slug),
  signIn: () => ipcRenderer.invoke('auth:sign-in'),
  cancelSignIn: () => ipcRenderer.invoke('auth:cancel-sign-in'),
  signOut: () => ipcRenderer.invoke('auth:sign-out'),
};
contextBridge.exposeInMainWorld('buildment', api);
