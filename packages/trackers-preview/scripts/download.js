import { writeFileSync } from 'fs';
import { URL, fileURLToPath } from 'url';
import { resolve } from 'path';

const DATA_URL = 'https://whotracks.me/data/trackers-preview.json';
const OUTPUT_FILE = fileURLToPath(new URL(
  '../src/background/trackers-preview-generated.js',
  import.meta.url,
));

const data = await fetch(DATA_URL).then((res) => {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.text();
});

writeFileSync(OUTPUT_FILE, `export default ${data}`);

console.log(
  `Trackers preview data downloaded and saved in "${OUTPUT_FILE.replace(
    process.cwd(),
    '.',
  )}"`,
);
