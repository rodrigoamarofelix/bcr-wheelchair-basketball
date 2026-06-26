const path = require('path');
const Jimp = require('jimp');

const FONTS_DIR = path.resolve(__dirname, '../node_modules/@jimp/plugin-print/dist/fonts/open-sans');

async function main() {
  for (const size of [192, 512]) {
    const img = new Jimp.Jimp({ width: size, height: size, color: '#1d4ed8' });

    const fontName = size >= 256 ? 'open-sans-64-white' : 'open-sans-32-white';
    const fontPath = path.join(FONTS_DIR, fontName, `${fontName}.fnt`);
    const font = await Jimp.loadFont(fontPath);

    img.print({
      font,
      x: 0,
      y: 0,
      text: 'BCR',
      maxWidth: size,
      maxHeight: size,
      alignmentX: Jimp.HorizontalAlign.CENTER,
      alignmentY: Jimp.VerticalAlign.MIDDLE,
    });

    const outPath = path.resolve(__dirname, `../public/icon-${size}.png`);
    await img.write(outPath);
    console.log('Generated', outPath);
  }
}

main().catch(console.error);
