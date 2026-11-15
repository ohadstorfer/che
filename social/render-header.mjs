// Renders the App Store header/search-results asset: out/store/header/posta-header-16x9.png (5244 × 2950).
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id: 'store-header'});
await renderStill({composition, serveUrl, output: 'out/store/header/posta-header-16x9.png', imageFormat: 'png'});
console.log('done');
