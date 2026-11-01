import {readFile,writeFile} from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name,root),'utf8');
const [html,css,domain,app] = await Promise.all(['index.html','style.css','domain.js','app.js'].map(read));
const js = domain.replaceAll('export ', '') + '\n' + app.replace(/^import[^\n]+\n/,'');
const result = html.replace('<link rel="stylesheet" href="style.css">', `<style>${css}</style>`).replace('<script type="module" src="app.js"></script>', `<script>\n${js}\n</script>`);
await writeFile(new URL('Fizyo.html',root),result);
