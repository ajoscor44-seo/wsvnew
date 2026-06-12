const posts = require('./src/data/posts.json');
const p = posts.find(p => p.slug === 'hybrid-vs-petrol-cars');
if (p) {
    const urls = p.content.rendered.match(/https?:\/\/[^\s"'>]+/g) || [];
    console.log("URLs found in content:", urls);
} else {
    console.log("Post not found");
}
