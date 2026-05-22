import { createClient } from '../database/supabase.client';

const supabase = createClient();

const stickerTypes = [
  { code: 'player', name: 'Jugador', description: 'Lámina de jugador' },
  { code: 'team', name: 'Selección', description: 'Lámina de selección' },
  { code: 'stadium', name: 'Estadio', description: 'Lámina de estadio' },
  { code: 'emblem', name: 'Escudo', description: 'Lámina de escudo' },
  { code: 'special', name: 'Especial', description: 'Lámina especial' },
  { code: 'action', name: 'Acción', description: 'Lámina de acción' },
  { code: 'legend', name: 'Leyenda', description: 'Lámina de leyenda' },
];

const confederations = [
  { code: 'CONMEBOL', name: 'Sudamérica', region: 'América del Sur', color: '#10b981' },
  { code: 'UEFA', name: 'Europa', region: 'Europa', color: '#3b82f6' },
  { code: 'CONCACAF', name: 'Norteamérica', region: 'Norteamérica, Centroamérica y Caribe', color: '#f59e0b' },
  { code: 'CAF', name: 'África', region: 'África', color: '#ef4444' },
  { code: 'AFC', name: 'Asia', region: 'Asia', color: '#8b5cf6' },
  { code: 'OFC', name: 'Oceanía', region: 'Oceanía', color: '#06b6d4' },
];

export async function seedDatabase() {
  // Seed sticker types
  for (const type of stickerTypes) {
    const { error } = await supabase
      .from('sticker_types')
      .upsert(type, { onConflict: 'code' });
    if (error) console.error(`Error seeding sticker type ${type.code}:`, error);
  }

  // Seed confederations
  for (const conf of confederations) {
    const { error } = await supabase
      .from('confederations')
      .upsert(conf, { onConflict: 'code' });
    if (error) console.error(`Error seeding confederation ${conf.code}:`, error);
  }

  console.log('Database seeded successfully');
}

// Run if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
