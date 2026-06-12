const fs = require('fs');
const https = require('https');
const path = require('path');

const UPLOADS_DIR = './public/uploads';

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };
        https.get(url, options, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
                return;
            }
            res.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

async function migrateFile(filePath) {
    console.log(`Processing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    const urlRegex = /https:\/\/wsv\.com\.ng\/wp-content\/uploads\/[^\s"'>]+/g;
    const matches = content.match(urlRegex) || [];
    const uniqueUrls = [...new Set(matches)];

    console.log(`Found ${uniqueUrls.length} unique images in ${filePath}.`);

    for (const url of uniqueUrls) {
        try {
            const fileName = path.basename(url);
            const destPath = path.join(UPLOADS_DIR, fileName);
            
            if (!fs.existsSync(destPath)) {
                console.log(`Downloading ${url}...`);
                await downloadImage(url, destPath);
            }
            
            // Replace in content
            const localPath = `/uploads/${fileName}`;
            content = content.split(url).join(localPath);
            console.log(`✅ Migrated: ${fileName}`);
        } catch (error) {
            console.error(`❌ Failed to migrate ${url}:`, error.message);
        }
    }

    fs.writeFileSync(filePath, content);
}

async function start() {
    await migrateFile('./src/data/posts.json');
    await migrateFile('./src/data/pages.json');
    console.log("🎉 Image Migration Complete!");
}

start();
