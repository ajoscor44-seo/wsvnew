const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = './public/uploads';

function cleanupFakeImages() {
    console.log("🔍 Identifying fake (HTML) images...");
    const files = fs.readdirSync(UPLOADS_DIR);
    let fakeCount = 0;
    
    for (const f of files) {
        const filePath = path.join(UPLOADS_DIR, f);
        if (fs.statSync(filePath).isDirectory()) continue;
        
        const content = fs.readFileSync(filePath, 'utf8').substring(0, 100);
        if (content.includes('<!DOCTYPE') || content.includes('<html') || content.includes('<HTML')) {
            console.log(`  🗑️ Replacing fake image: ${f}`);
            fs.copyFileSync(path.join(UPLOADS_DIR, 'placeholder.png'), filePath);
            fakeCount++;
        }
    }
    
    console.log(`Cleanup complete. Replaced ${fakeCount} fake images.`);
}

cleanupFakeImages();
