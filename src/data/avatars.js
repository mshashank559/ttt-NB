// Catalog of 100+ categorized high-quality SVG / illustration avatars
// Powered by fast, reliable DiceBear vector endpoints (100% SVG, cached, no auth required)

export const AVATAR_CATEGORIES = [
  { id: 'notionists', label: 'Tech & Notionists' },
  { id: 'lorelei', label: 'Modern Portraits' },
  { id: 'avataaars', label: '3D Avataaars' },
  { id: 'personas', label: 'Creative Personas' },
];

const generateCategoryAvatars = (style, prefix, count) => {
  const seeds = [
    'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Logan',
    'Quinn', 'Skyler', 'Cameron', 'Dakota', 'Reese', 'Rowan', 'Harper', 'Peyton',
    'Kendall', 'Emerson', 'Finley', 'Hayden', 'Kai', 'Sawyer', 'Eden', 'Amari',
    'River', 'Blake', 'Charlie', 'Drew', 'Elliott', 'Francis'
  ];
  return Array.from({ length: count }).map((_, i) => {
    const seed = `${prefix}_${seeds[i % seeds.length]}_${i + 1}`;
    return {
      id: `${style}-${i + 1}`,
      url: `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
      name: `${seeds[i % seeds.length]} #${i + 1}`,
    };
  });
};

export const ALL_AVATARS = [
  ...generateCategoryAvatars('notionists', 'tech', 28),
  ...generateCategoryAvatars('lorelei', 'port', 28),
  ...generateCategoryAvatars('avataaars', 'avt', 28),
  ...generateCategoryAvatars('personas', 'crea', 28),
];

export const DEFAULT_AVATAR = ALL_AVATARS[0].url;
