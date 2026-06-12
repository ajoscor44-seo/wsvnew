const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const UPLOADS_DIR = './public/uploads';

async function fixBrokenImages() {
    console.log("🔍 Finding broken (0-byte) images...");
    const files = fs.readdirSync(UPLOADS_DIR);
    const brokenFiles = files.filter(f => fs.statSync(path.join(UPLOADS_DIR, f)).size === 0);
    
    console.log(`Found ${brokenFiles.length} broken files.`);
    
    let cdxData = [];
    try {
        const raw = fs.readFileSync('./scripts/image-urls.json', 'utf8');
        cdxData = JSON.parse(raw);
        // cdxData is [[original], [url1], [url2]...]
        cdxData.shift(); // remove header
    } catch (e) {
        console.error("Failed to load image-urls.json");
        return;
    }

    for (const fileName of brokenFiles) {
        console.log(`Attempting to rescue: ${fileName}`);
        
        // Find matching original URL from CDX data
        const match = cdxData.find(row => row[0].endsWith(fileName));
        
        if (match) {
            const originalUrl = match[0];
            const waybackUrl = `https://web.archive.org/web/20240000000000im_/${originalUrl}`;
            
            try {
                console.log(`  Downloading from ${waybackUrl}...`);
                execSync(`curl.exe -L -s -o "${path.join(UPLOADS_DIR, fileName)}" "${waybackUrl}"`);
                const size = fs.statSync(path.join(UPLOADS_DIR, fileName)).size;
                if (size > 100) { 
                    console.log(`  ✅ Recovered ${fileName}!`);
                } else {
                    console.log(`  ⚠️ Downloaded file too small (${size} bytes)`);
                }
            } catch (e) {
                console.error(`  ❌ Error downloading ${fileName}: ${e.message}`);
            }
        } else {
            console.log(`  ❌ No historical URL found for ${fileName}`);
        }
    }
}

fixBrokenImages();
