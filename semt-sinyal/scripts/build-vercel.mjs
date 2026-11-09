import fs from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const files = {
  'index.html':'text/html; charset=utf-8',
  'style.css':'text/css; charset=utf-8',
  'app.js':'text/javascript; charset=utf-8',
  'sw.js':'text/javascript; charset=utf-8',
  'data.json':'application/json; charset=utf-8',
  'manifest.webmanifest':'application/manifest+json',
  'icons/icon.svg':'image/svg+xml',
  'icons/icon-192.png':'image/png',
  'icons/icon-512.png':'image/png'
};
const assets = {};
for (const [name,type] of Object.entries(files)) {
  const bytes = await fs.readFile(new URL(name, root));
  assets['/'+name] = {type,body:bytes.toString('base64')};
  const output = new URL('public/'+name,root);
  await fs.mkdir(new URL('.',output),{recursive:true});
  await fs.writeFile(output,bytes);
}
assets['/'] = assets['/index.html'];
const template = await fs.readFile(new URL('worker/server-template.js',root),'utf8');
const data = await fs.readFile(new URL('data.json',root),'utf8');
await fs.writeFile(new URL('worker/index.js',root),template.replace('__RECORDS__',data).replace('__ASSETS__',JSON.stringify(assets)));
console.log('Vercel static assets and API worker prepared.');
