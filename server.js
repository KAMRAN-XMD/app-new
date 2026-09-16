const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/output', express.static(path.join(__dirname, 'output')));

// Multer storage for App Icons
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// API Endpoint to Build APK Simulation / Generation
app.post('/api/build-apk', upload.single('appIcon'), (req, res) => {
    try {
        const { webUrl, appName, packageName, appVersion } = req.body;
        const iconFile = req.file;

        if (!webUrl || !appName) {
            return res.status(400).json({ success: false, message: 'Website URL and App Name are required.' });
        }

        // Generate sanitized package name if not provided
        const finalPkg = packageName && packageName.trim() !== '' 
            ? packageName 
            : `com.${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}.app`;

        const version = appVersion || '1.0.0';

        // Simulate real APK compilation package building
        const outputDir = path.join(__dirname, 'output');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        
        const apkFileName = `${appName.replace(/[^a-zA-Z0-9]/g, '_')}_v${version}.apk`;
        const apkPath = path.join(outputDir, apkFileName);

        // Create a dummy placeholder APK file for live download functionality
        fs.writeFileSync(apkPath, `KAMRAN-MD APK Builder Output\nApp Name: ${appName}\nURL: ${webUrl}\nPackage: ${finalPkg}\nVersion: ${version}`);

        // Response with generated app details
        res.json({
            success: true,
            message: 'APK Built Successfully!',
            data: {
                appName: appName,
                packageName: finalPkg,
                version: version,
                website: webUrl,
                downloadUrl: `/output/${apkFileName}`
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error during APK generation.' });
    }
});

app.listen(PORT, () => {
    console.log(`KAMRAN-MD APK Builder server is running on port ${PORT}`);
});
