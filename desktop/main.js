const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let backendProcess;

const BACKEND_PORT = 8080;
const JAR_NAME = 'core-application.jar';

function getJarPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'backend', JAR_NAME);
  }
  return path.join(__dirname, '..', 'core-application', 'target', 'core-application-1.0.0.jar');
}

function startBackend() {
  const jarPath = getJarPath();
  console.log('🚀 Starting Spring Boot Backend process from:', jarPath);

  // Spawn Java Spring Boot Process with active local profile flag after -jar
  backendProcess = spawn('java', ['-jar', jarPath, '--spring.profiles.active=local'], {
    cwd: path.dirname(jarPath)
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[Backend STDOUT]: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[Backend STDERR]: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`⚠️ Spring Boot Backend process exited with code ${code}`);
  });
}

function checkBackendHealth(retries = 30, delay = 1000, callback) {
  const req = http.get(`http://localhost:${BACKEND_PORT}/api/v1/routes/nodes`, (res) => {
    if (res.statusCode === 200 || res.statusCode === 404) {
      console.log('✅ Spring Boot REST Backend is ONLINE!');
      callback(true);
    } else {
      if (retries > 0) {
        setTimeout(() => checkBackendHealth(retries - 1, delay, callback), delay);
      } else {
        callback(false);
      }
    }
  });

  req.on('error', () => {
    if (retries > 0) {
      setTimeout(() => checkBackendHealth(retries - 1, delay, callback), delay);
    } else {
      callback(false);
    }
  });

  req.end();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'SDR-DSS Smart Disaster Relief Decision Support System',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.setMenuBarVisibility(false);

  // Configure child windows opened via window.open (e.g. Data Management CRUD Portal)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        width: 1380,
        height: 860,
        autoHideMenuBar: true,
        title: 'RapidResponse-IDSS Data Management CRUD Portal',
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      }
    };
  });

  // Load Frontend App
  const indexPath = path.join(__dirname, 'frontend-dist', 'index.html');
  mainWindow.loadFile(indexPath);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackend();
  
  // Wait for Spring Boot database connection to complete before displaying UI
  checkBackendHealth(60, 500, (online) => {
    console.log('🚀 Spring Boot Backend readiness state:', online);
    createWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    console.log('🛑 Terminating Spring Boot Backend Process...');
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
