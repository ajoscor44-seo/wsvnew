const fs = require('fs');
const path = require('path');

function migrateImagesSafe(filePath) {
    console.log(`Processing ${filePath}...`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const urlRegex = /https:\/\/wsv\.com\.ng\/wp-content\/uploads\/[^\s"'>]+/g;

    function processObject(obj) {
        if (!obj || typeof obj !== 'object') return;
        
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                // Update URLs in the string
                obj[key] = obj[key].replace(urlRegex, (url) => {
                    const fileName = url.split('/').pop();
                    return `/uploads/${fileName}`;
                });
            } else if (typeof obj[key] === 'object') {
                processObject(obj[key]);
            }
        }
    }

    processObject(data);
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Successfully updated ${filePath}`);
}

migrateImagesSafe('./src/data/posts.json');
migrateImagesSafe('./src/data/pages.json');
