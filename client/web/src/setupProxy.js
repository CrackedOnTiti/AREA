const fs = require('fs');
const path = require('path');

module.exports = function(app) {
  app.get('/client.apk', (req, res) => {
    const apkPath = '/mobile_build/client.apk';

    if (fs.existsSync(apkPath)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="area-client.apk"');
      res.sendFile(apkPath);
    } else {
      res.status(404).json({ error: 'APK not found' });
    }
  });
};
