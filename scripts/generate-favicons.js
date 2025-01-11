const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function generateFavicons() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, "../public/icon.svg"));

  // Generate favicon.ico (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .toFormat("png")
    .toFile(path.join(__dirname, "../public/favicon.ico"));

  // Generate apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .toFormat("png")
    .toFile(path.join(__dirname, "../public/apple-touch-icon.png"));
}

generateFavicons().catch(console.error);
