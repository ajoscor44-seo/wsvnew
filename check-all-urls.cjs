const fs = require('fs');
const posts = JSON.parse(fs.readFileSync('./src/data/posts.json', 'utf8'));

let remoteCount = 0;
posts.forEach(p => {
    const urls = p.content.rendered.match(/https?:\/\/[^\s"'>]+/g) || [];
    urls.forEach(url => {
        if (url.includes('wsv.com.ng') || url.includes('whatsappstatusviews.com.ng')) {
            console.log(`Found remote URL in [${p.slug}]: ${url}`);
            remoteCount++;
        }
    });
});

console.log(`Total remote URLs found: ${remoteCount}`);
