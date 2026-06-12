const fs = require('fs');
const path = require('path');

function migrateSafe(filePath) {
    console.log(`Processing ${filePath}...`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const uploadRegex = /https?:\/\/(?:wsv\.com\.ng|whatsappstatusviews\.com\.ng)\/wp-content\/uploads\/[^\s"'>,]+/g;
    const linkRegex = /https?:\/\/(?:www\.)?(?:wsv\.com\.ng|whatsappstatusviews\.com\.ng)\/([a-zA-Z0-9-]+\/?)(?=[^\w-]|$)/g;
    const srcsetRegex = /srcset="[^"]+"/g;
    const sizesRegex = /sizes="[^"]+"/g;

    function processObject(obj) {
        if (!obj || typeof obj !== 'object') return;
        
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].replace(srcsetRegex, '');
                obj[key] = obj[key].replace(sizesRegex, '');
                
                obj[key] = obj[key].replace(uploadRegex, (url) => {
                    // Strip query params
                    const cleanUrl = url.split('?')[0];
                    const fileName = path.basename(cleanUrl);
                    return `/uploads/${fileName}`;
                });
                
                obj[key] = obj[key].replace(linkRegex, (match, slug) => {
                    if (slug === 'blog/' || slug === 'blog') return '/blog';
                    if (!slug || slug === '/') return '/';
                    return `/${slug.replace(/\/$/, '')}`;
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

migrateSafe('./src/data/posts.json');
migrateSafe('./src/data/pages.json');
