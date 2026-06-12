const fs = require('fs');
const path = require('path');

const postsPath = path.join(__dirname, '../src/data/posts.json');
const publicDir = path.join(__dirname, '../public');

// Format date helper
function getFormattedDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  try {
    return dateStr.split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

function generate() {
  console.log("Generating sitemaps...");
  
  // 1. Read blog posts from src/data/posts.json
  if (!fs.existsSync(postsPath)) {
    console.error(`Error: posts.json not found at ${postsPath}`);
    process.exit(1);
  }
  const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
  console.log(`Found ${posts.length} blog posts.`);

  // 2. Generate blog-sitemap.xml
  let blogSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (const post of posts) {
    const slug = post.slug;
    const lastmod = getFormattedDate(post.modified || post.date);
    blogSitemapXml += `
  <url>
    <loc>https://wsv.com.ng/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }

  blogSitemapXml += `
</urlset>
`;
  
  fs.writeFileSync(path.join(publicDir, 'blog-sitemap.xml'), blogSitemapXml, 'utf8');
  console.log("Written public/blog-sitemap.xml");

  // 3. Generate main-sitemap.xml
  const today = new Date().toISOString().split('T')[0];
  const mainSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://wsv.com.ng/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://wsv.com.ng/download-vcf</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://wsv.com.ng/whatsapp-tvs</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://wsv.com.ng/csv-vcf</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://wsv.com.ng/vcf-csv</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://wsv.com.ng/knowledge-base</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://wsv.com.ng/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://wsv.com.ng/premium</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
`;

  fs.writeFileSync(path.join(publicDir, 'main-sitemap.xml'), mainSitemapXml, 'utf8');
  console.log("Written public/main-sitemap.xml");

  // 4. Generate/Overwrite public/sitemap.xml as a Sitemap Index
  const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://wsv.com.ng/main-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://wsv.com.ng/blog-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`;

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndexXml, 'utf8');
  console.log("Written public/sitemap.xml as Sitemap Index");
}

generate();
