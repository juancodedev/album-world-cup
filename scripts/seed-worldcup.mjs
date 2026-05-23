const ALBUM_ID = '00000000-0000-0000-0000-000000000001';
const BATCH_SIZE = 100;

const GROUPS_DATA = [
  { id: 'A', teams: [
    { id: 'MEX', name: 'Mexico' }, { id: 'RSA', name: 'South Africa' },
    { id: 'KOR', name: 'South Korea' }, { id: 'CZE', name: 'Czech Republic' },
  ]},
  { id: 'B', teams: [
    { id: 'CAN', name: 'Canada' }, { id: 'BIH', name: 'Bosnia and Herzegovina' },
    { id: 'QAT', name: 'Qatar' }, { id: 'SUI', name: 'Switzerland' },
  ]},
  { id: 'C', teams: [
    { id: 'BRA', name: 'Brazil' }, { id: 'MAR', name: 'Morocco' },
    { id: 'HAI', name: 'Haiti' }, { id: 'SCO', name: 'Scotland' },
  ]},
  { id: 'D', teams: [
    { id: 'USA', name: 'United States' }, { id: 'PAR', name: 'Paraguay' },
    { id: 'AUS', name: 'Australia' }, { id: 'TUR', name: 'Turkiye' },
  ]},
  { id: 'E', teams: [
    { id: 'GER', name: 'Germany' }, { id: 'CUW', name: 'Curacao' },
    { id: 'CIV', name: "Cote d'Ivoire" }, { id: 'ECU', name: 'Ecuador' },
  ]},
  { id: 'F', teams: [
    { id: 'NED', name: 'Netherlands' }, { id: 'JPN', name: 'Japan' },
    { id: 'SWE', name: 'Sweden' }, { id: 'TUN', name: 'Tunisia' },
  ]},
  { id: 'G', teams: [
    { id: 'BEL', name: 'Belgium' }, { id: 'EGY', name: 'Egypt' },
    { id: 'IRN', name: 'Iran' }, { id: 'NZL', name: 'New Zealand' },
  ]},
  { id: 'H', teams: [
    { id: 'ESP', name: 'Spain' }, { id: 'CPV', name: 'Cape Verde' },
    { id: 'KSA', name: 'Saudi Arabia' }, { id: 'URU', name: 'Uruguay' },
  ]},
  { id: 'I', teams: [
    { id: 'FRA', name: 'France' }, { id: 'SEN', name: 'Senegal' },
    { id: 'IRQ', name: 'Iraq' }, { id: 'NOR', name: 'Norway' },
  ]},
  { id: 'J', teams: [
    { id: 'ARG', name: 'Argentina' }, { id: 'ALG', name: 'Algeria' },
    { id: 'AUT', name: 'Austria' }, { id: 'JOR', name: 'Jordan' },
  ]},
  { id: 'K', teams: [
    { id: 'POR', name: 'Portugal' }, { id: 'COD', name: 'DR Congo' },
    { id: 'UZB', name: 'Uzbekistan' }, { id: 'COL', name: 'Colombia' },
  ]},
  { id: 'L', teams: [
    { id: 'ENG', name: 'England' }, { id: 'CRO', name: 'Croatia' },
    { id: 'GHA', name: 'Ghana' }, { id: 'PAN', name: 'Panama' },
  ]},
];

const SPECIAL_SECTIONS = [
  { code: 'FWC', name: 'Introduction', count: 20 },
  { code: 'MUS', name: 'FIFA Museum', count: 11 },
  { code: 'COC', name: 'Coca-Cola Exclusivos', count: 14 },
];

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function getTeamMap(supabaseUrl, serviceKey) {
  const url = `${supabaseUrl}/rest/v1/teams?album_id=eq.${ALBUM_ID}&select=id,code`;
  const data = await fetchJson(url, {
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
  });

  const teamMap = {};
  for (const team of data) {
    teamMap[team.code] = team.id;
  }

  const allCodes = GROUPS_DATA.flatMap(g => g.teams.map(t => t.id));
  const missing = allCodes.filter(c => !teamMap[c]);

  if (missing.length > 0) {
    console.error('Missing teams in database:', missing.join(', '));
    process.exit(1);
  }

  console.log(`Found ${data.length} teams in database`);
  return teamMap;
}

function generateStickers(teamMap) {
  let number = 0;
  const stickers = [];

  for (const group of GROUPS_DATA) {
    for (const team of group.teams) {
      const teamId = teamMap[team.id];
      for (let i = 1; i <= 20; i++) {
        number++;
        stickers.push({
          album_id: ALBUM_ID,
          number,
          team_id: teamId,
          code: `${team.id}${i}`,
          rarity: 'common',
          is_special: false,
          special_attribute: null,
          image_url: `https://qwlopuygvhkopgsatdcl.supabase.co/storage/v1/object/public/stickers/2026/${team.id}/${i}.webp`,
        });
      }
    }
  }

  for (const section of SPECIAL_SECTIONS) {
    for (let i = 1; i <= section.count; i++) {
      number++;
      stickers.push({
        album_id: ALBUM_ID,
        number,
        team_id: null,
        code: `${section.code}${i}`,
        rarity: 'common',
        is_special: true,
        special_attribute: section.code,
        image_url: `https://qwlopuygvhkopgsatdcl.supabase.co/storage/v1/object/public/stickers/2026/special/${section.code}/${i}.webp`,
      });
    }
  }

  return stickers;
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function insertStickers(supabaseUrl, serviceKey, stickers) {
  const url = `${supabaseUrl}/rest/v1/stickers`;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Prefer': 'resolution=merge-duplicates',
  };

  const chunks = chunkArray(stickers, BATCH_SIZE);
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      await fetchJson(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(chunk),
      });
      inserted += chunk.length;
      console.log(`Batch ${i + 1}/${chunks.length}: ${inserted}/${stickers.length} inserted`);
    } catch (err) {
      console.error(`Batch ${i + 1}/${chunks.length} failed:`, err.message);
      errors++;
    }
  }

  return { inserted, errors };
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    process.exit(1);
  }

  console.log('Fetching teams from database...');
  const teamMap = await getTeamMap(supabaseUrl, supabaseKey);

  const stickers = generateStickers(teamMap);
  console.log(`Generated ${stickers.length} stickers`);

  const { inserted, errors } = await insertStickers(supabaseUrl, supabaseKey, stickers);

  if (errors > 0) {
    console.log(`\nDone with ${errors} errors. ${inserted}/${stickers.length} stickers inserted.`);
    process.exit(1);
  }

  console.log(`\nSuccessfully inserted all ${stickers.length} stickers!`);
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
