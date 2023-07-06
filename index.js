import fs from 'fs';

import stopwords from './stopwords.json' assert { type: "json" };
import languages from './languages.json' assert { type: "json" };

async function fetchAPI(lang, cmcontinue = undefined) {
  const url = `https://en.wiktionary.org/w/api.php?format=json&action=query&list=categorymembers&cmprop=title&cmlimit=max&cmnamespace=0&cmtitle=Category:${lang}%20suffixes${cmcontinue === undefined ? '' : `&cmcontinue=${cmcontinue}`}`;

  console.log(url);

  const resp = await (await fetch(url)).json();

  return [ ...resp.query.categorymembers, ...( resp.continue?.cmcontinue === undefined ? [] : await fetchAPI(lang, resp.continue.cmcontinue) ) ];
}

async function getSuffixes(lang) {
  const suffixes = [];

  const resp = await fetchAPI(lang);

  suffixes.push(...resp.reduce((acc, cur) => {
    // '^־' is for hebrew specifically
    const s = cur.title.replace(/^-|-$|^־/g, '');
    return [...acc, s];
  }, []));

  console.log('total:', suffixes.length);


  return suffixes;
}

// some languages have a different name in Wiktionary compared to Wikipedia
const diff = { 'Bangla': 'Bengali', 'Slovenian': 'Slovene', 'Croatian': 'Serbo-Croatian' };

// [ [ 'en', 'English' ], ... ]
const langs = Object.keys(stopwords).map(l => [l, diff[languages[l]] ?? languages[l]]);

const all = {};

for (const [lcode, lname] of langs) {
  console.log(lname);

  const suffixes = await getSuffixes(lname);
  fs.writeFileSync(`./suffixes/${lcode.toLowerCase()}.json`, JSON.stringify(suffixes, null, 2));
  all[lcode] = suffixes;

  console.log('\n');
}

fs.writeFileSync(`./suffixes.json`, JSON.stringify(all, null, 2));
