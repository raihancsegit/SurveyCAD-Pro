const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openMouzaMap: () => ipcRenderer.invoke('dialog:openMouzaMap'),
  saveProject: (projectData) => ipcRenderer.invoke('dialog:saveProject', projectData),
  openProject: () => ipcRenderer.invoke('dialog:openProject'),
  exportDXF: (dxfContent) => ipcRenderer.invoke('dialog:exportDXF', dxfContent),
  isDesktop: true
});
