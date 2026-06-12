const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = './public/uploads';

function findMissing() {
    const posts = JSON.parse(fs.readFileSync('./src/data/posts.json', 'utf8'));
    const pages = JSON.parse(fs.readFileSync('./src/data/pages.json', 'utf8'));
    
    const allContent = JSON.stringify(posts) + JSON.stringify(pages);
    const uploadMatches = allContent.match(/\/uploads\/[^\s"'>]+/g) || [];
    
    const uniqueFiles = [...new Set(uploadMatches.map(m => path.basename(m)))];
    
    const missing = uniqueFiles.filter(f => !fs.existsSync(path.join(UPLOADS_DIR, f)));
    
    console.log(`Total unique images referenced: ${uniqueFiles.length}`);
    console.log(`Missing images: ${missing.length}`);
    console.log(missing);
}

findMissing();
