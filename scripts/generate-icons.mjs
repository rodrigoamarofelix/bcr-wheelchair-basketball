import Jimp from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SIZES = [192, 512];
const COLORS = ['#1d4ed8', '#1e3a8a'];

async function generate() {
  for (const size of SIZES) {
    const img = new Jimp(size, size, '#1d4ed8');
    const font = await Jimp.loadFont(
      size >= 256
        ? Jimp.FONT_SANS_64_WHITE
        : Jimp.FONT_SANS_32_WHITE
    );
    img.print(
      font,
      0,
      0,
      {
        text: 'BCR',
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      size,
      size
    );
    const outPath = path.resolve(__dirname, `../frontend/public/icon-${size}.png`);
    await img.writeAsync(outPath);
    console.log(`Generated ${outPath}`);
  }
  process.exit(0);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
