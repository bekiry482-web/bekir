const {app, BrowserWindow, Menu, dialog} = require('electron');
const path = require('node:path');

app.setName('Fizyo Takip');
app.setAppUserModelId('com.fizyo.takip');
const locked = app.requestSingleInstanceLock();
if (!locked) app.quit();
let window;
function openWindow() {
  window = new BrowserWindow({
    width: 1320, height: 900, minWidth: 800, minHeight: 600,
    title: 'Fizyo Takip', backgroundColor: '#f6f8f7',
    webPreferences: {nodeIntegration: false, contextIsolation: true, sandbox: true, devTools: !app.isPackaged}
  });
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {label: 'Dosya', submenu: [{label: 'Çıkış', role: 'quit'}]},
    {label: 'Görünüm', submenu: [{label: 'Büyüt', role: 'zoomIn'}, {label: 'Küçült', role: 'zoomOut'}, {label: 'Varsayılan boyut', role: 'resetZoom'}]},
    {label: 'Yardım', submenu: [{label: 'Fizyo Takip hakkında', click: () => dialog.showMessageBox(window, {type: 'info', title: 'Fizyo Takip', message: 'Fizyo Takip', detail: 'Hasta ve seans takibi · 1.2.0\n\nİnternet bağlantısı gerekmez. Kayıtlar bu Windows kullanıcısının uygulama veri alanında saklanır. Düzenli yedek alın. Veriler ve yedekler şifrelenmemiştir.\n\nTarayıcı sürümündeki kayıtlar otomatik aktarılmaz. Önce Yedek indir, ardından masaüstü uygulamasında Yedekten geri yükle seçeneklerini kullanın.'})}]}
  ]));
  window.webContents.setWindowOpenHandler(() => ({action: 'deny'}));
  window.webContents.on('will-navigate', event => event.preventDefault());
  window.webContents.session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  window.loadFile(path.join(__dirname, '..', 'Fizyo.html'));
  window.on('closed', () => {window = null;});
}
if (locked) {
  app.on('second-instance', () => {if (window) {if (window.isMinimized()) window.restore(); window.show(); window.focus();}});
  app.whenReady().then(openWindow);
  app.on('window-all-closed', () => app.quit());
}
