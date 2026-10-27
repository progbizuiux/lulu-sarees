// Builds the shop page banners (public/images/banners/lulu-*.jpg) from the home page photos.
// Each banner: the photo blurred as a soft background, plus a sharp crop of the subject on the right,
// at 1920x240 (the same size as the template's page-title.jpg).
// Run again after changing a photo below:   node scripts/make-banners.cjs
const path = require("path");
const sharp = require("sharp");

const W = 1920;
const H = 240;
const HOME = path.join(__dirname, "../public/images/home");
const OUT = path.join(__dirname, "../public/images/banners");

// photo: file in public/images/home. top/height: which band of the photo to show (0–1 of its height).
const BANNERS = {
  sarees: { photo: "collection-img.png", top: 0.04, height: 0.5 },
  wedding: { photo: "collection-img2.png", top: 0.04, height: 0.5 },
  festive: { photo: "insta5.png", top: 0.06, height: 0.28 },
  "ready-to-wear": { photo: "collection-img4.png", top: 0.05, height: 0.5 },
  men: { photo: "moments-groom.png", top: 0.08, height: 0.45 },
  women: { photo: "testimonial-4.png", top: 0.04, height: 0.5 },
  kids: { photo: "collection-img3.png", top: 0.12, height: 0.5 },
  collections: { photo: "insta.png", top: 0.04, height: 0.28 },
  shop: { photo: "insta4.png", top: 0.04, height: 0.28 },
};

// Soft edges so the photo blends into the blurred background.
const fadeMask = (width, height) =>
  Buffer.from(
    `<svg width="${width}" height="${height}"><defs><linearGradient id="g" x1="0" x2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.25" stop-color="#fff" stop-opacity="1"/>
      <stop offset="0.85" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`
  );

async function build(name, { photo, top, height }) {
  const source = sharp(path.join(HOME, photo));
  const { width: sw, height: sh } = await source.metadata();

  const background = await sharp(path.join(HOME, photo))
    .resize(W, H, { fit: "cover", position: "centre" })
    .blur(40)
    .composite([{ input: Buffer.from(`<svg width="${W}" height="${H}"><rect width="100%" height="100%" fill="#fff" fill-opacity="0.35"/></svg>`) }])
    .toBuffer();

  const band = { left: 0, top: Math.round(sh * top), width: sw, height: Math.round(sh * height) };
  const subjectWidth = Math.round((band.width / band.height) * H);
  const subject = await sharp(path.join(HOME, photo))
    .extract(band)
    .resize(subjectWidth, H)
    .composite([{ input: fadeMask(subjectWidth, H), blend: "dest-in" }])
    .png()
    .toBuffer();

  const file = path.join(OUT, `lulu-${name}.jpg`);
  await sharp(background)
    .composite([{ input: subject, left: Math.max(0, W - subjectWidth - 260), top: 0 }])
    .jpeg({ quality: 82, progressive: true })
    .toFile(file);
  return file;
}

(async () => {
  require("fs").mkdirSync(OUT, { recursive: true });
  for (const [name, options] of Object.entries(BANNERS)) {
    const file = await build(name, options);
    console.log("made", path.relative(process.cwd(), file), Math.round(require("fs").statSync(file).size / 1024) + " KB");
  }
})();
