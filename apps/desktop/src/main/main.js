const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#0c1017',
    title: 'Land Survey CAD & Plot Management Platform (বাংলাদেশ ল্যান্ড সার্ভে)',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  // Load the CAD workspace (Directly uses full web workspace when in monorepo, fallback to renderer)
  const webPath = path.join(__dirname, '../../../web/index.html');
  const rendererPath = path.join(__dirname, '../renderer/index.html');
  mainWindow.loadFile(fs.existsSync(webPath) ? webPath : rendererPath);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for Native File Dialogs & Project Storage
ipcMain.handle('dialog:openMouzaMap', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'মৌজা নকশা স্ক্যান ফাইল নির্বাচন করুন (Select Mouza Map Scan)',
    filters: [
      { name: 'Image & Scanned Maps', extensions: ['jpg', 'jpeg', 'png', 'tiff', 'tif', 'bmp', 'pdf'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  const fileData = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const mimeType = ext === 'png' ? 'image/png' : (ext === 'pdf' ? 'application/pdf' : 'image/jpeg');
  const base64 = `data:${mimeType};base64,${fileData.toString('base64')}`;

  return {
    filePath,
    fileName: path.basename(filePath),
    base64
  };
});

ipcMain.handle('dialog:saveProject', async (event, projectData) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'সার্ভে প্রজেক্ট সংরক্ষণ করুন (Save Survey Project)',
    defaultPath: 'মৌজা_জরিপ_নকশা.lscad',
    filters: [
      { name: 'Land Survey CAD Project (*.lscad)', extensions: ['lscad'] },
      { name: 'JSON Data (*.json)', extensions: ['json'] }
    ]
  });

  if (result.canceled || !result.filePath) {
    return { success: false };
  }

  fs.writeFileSync(result.filePath, JSON.stringify(projectData, null, 2), 'utf8');
  return { success: true, filePath: result.filePath };
});

ipcMain.handle('dialog:openProject', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'সার্ভে প্রজেক্ট ওপেন করুন (Open Survey Project)',
    filters: [
      { name: 'Land Survey CAD Project (*.lscad, *.json)', extensions: ['lscad', 'json'] }
    ],
    properties: ['openFile']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const content = fs.readFileSync(result.filePaths[0], 'utf8');
  return {
    filePath: result.filePaths[0],
    data: JSON.parse(content)
  };
});

ipcMain.handle('dialog:exportDXF', async (event, dxfContent) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'AutoCAD DXF ফাইল এক্সপোর্ট করুন (Export DXF)',
    defaultPath: 'মৌজা_দাগ_নকশা.dxf',
    filters: [
      { name: 'AutoCAD 2000 DXF (*.dxf)', extensions: ['dxf'] }
    ]
  });

  if (result.canceled || !result.filePath) {
    return { success: false };
  }

  fs.writeFileSync(result.filePath, dxfContent, 'utf8');
  return { success: true, filePath: result.filePath };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
