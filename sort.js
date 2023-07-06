import fs from 'fs';
import suffixes from './suffixes.json' assert { type: "json" };

// sort by descending string length
Object.keys(suffixes).forEach(l => {
  suffixes[l].sort((a, b) => b.length - a.length);
});

fs.writeFileSync(`./suffixes.json`, JSON.stringify(suffixes, null, 2));
