const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const MAX_SIZE_MB = 4;

const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

for (const file of files) {
  const fp = path.join(DATA_DIR, file);
  const stat = fs.statSync(fp);
  const sizeMB = stat.size / (1024 * 1024);

  if (sizeMB <= MAX_SIZE_MB) {
    console.log(`SKIP ${file} (${sizeMB.toFixed(2)}MB)`);
    continue;
  }

  console.log(`\nSPLIT ${file} (${sizeMB.toFixed(2)}MB)...`);
  const raw = fs.readFileSync(fp, 'utf-8');
  const jobs = JSON.parse(raw);
  const CHUNK = 1000;
  const baseName = file.replace('.json', '');

  // Backup
  fs.copyFileSync(fp, path.join(DATA_DIR, `${baseName}_backup.json`));

  const chunks = [];
  for (let i = 0; i < jobs.length; i += CHUNK) {
    const page = Math.floor(i / CHUNK) + 1;
    const chunk = jobs.slice(i, i + CHUNK);
    const chunkFile = `${baseName}_p${page}.json`;
    fs.writeFileSync(path.join(DATA_DIR, chunkFile), JSON.stringify(chunk));
    chunks.push(chunkFile);
    console.log(`  + ${chunkFile} (${chunk.length} jobs)`);
  }

  // Write index
  const index = {
    original: file,
    totalJobs: jobs.length,
    chunkSize: CHUNK,
    chunks,
    totalPages: chunks.length,
  };
  fs.writeFileSync(
    path.join(DATA_DIR, `${baseName}_index.json`),
    JSON.stringify(index)
  );
  console.log(`  INDEX: ${baseName}_index.json (${chunks.length} pages)`);

  // Remove original
  fs.unlinkSync(fp);
  console.log(`  REMOVED original: ${file}`);
}

console.log('\nDone!');
