import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const inputPath = path.resolve('public/icons/email-3d.png');
const outputPath = path.resolve('public/icons/email-3d-transparent.png');

// Treat near-white pixels as background and make them transparent.
// This keeps anti-aliased edges by using a soft alpha ramp.
const WHITE_CUTOFF = 245; // 0-255; higher means less removal
const SOFTNESS = 12; // alpha ramp range

const inputBuffer = await fs.readFile(inputPath);
const image = sharp(inputBuffer, { failOn: 'none' }).ensureAlpha();
const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
	const r = data[i];
	const g = data[i + 1];
	const b = data[i + 2];

	const min = Math.min(r, g, b);
	const distFromWhite = 255 - min;

	if (min >= WHITE_CUTOFF) {
		data[i + 3] = 0;
	} else if (min >= WHITE_CUTOFF - SOFTNESS) {
		const t = (WHITE_CUTOFF - min) / SOFTNESS; // 0..1
		data[i + 3] = Math.round(255 * t);
	} else if (distFromWhite <= SOFTNESS) {
		// Additional guard for slightly tinted whites
		const t = distFromWhite / SOFTNESS;
		data[i + 3] = Math.min(data[i + 3], Math.round(255 * t));
	}
}

await sharp(data, { raw: info })
	.png()
	.toFile(outputPath);

// eslint-disable-next-line no-console
console.log(`Wrote: ${outputPath}`);

