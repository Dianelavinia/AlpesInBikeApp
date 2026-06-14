/**
 * Helpers pour le partage de rides facon Strava.
 *
 * Formats supportes :
 *   - Story Instagram / TikTok : 9:16 (1080 x 1920)
 *   - Post carre Instagram     : 1:1 (1080 x 1080)
 *   - Post paysage Facebook    : 1.91:1 (1200 x 628)
 *
 * En production :
 *   - react-native-view-shot pour capturer la View en PNG
 *   - expo-sharing pour ouvrir le sheet de partage natif
 *   - expo-image-picker pour permettre une photo perso
 *   - expo-clipboard pour copier la legende auto-generee
 */

export type ShareFormat = "story" | "square" | "landscape";
export type ShareTemplate = "dark-bottom" | "minimal" | "vintage" | "heatmap";

export const FORMAT_META: Record<ShareFormat, { label: string; aspectRatio: number; width: number; height: number; icon: string }> = {
  story:     { label: "Story 9:16",   aspectRatio: 9 / 16,  width: 1080, height: 1920, icon: "phone-portrait-outline" },
  square:    { label: "Post carré",   aspectRatio: 1,        width: 1080, height: 1080, icon: "square-outline" },
  landscape: { label: "Paysage 16:9", aspectRatio: 16 / 9,  width: 1200, height: 675,  icon: "tablet-landscape-outline" },
};

export const TEMPLATE_META: Record<ShareTemplate, { label: string; description: string }> = {
  "dark-bottom":   { label: "Stats en bas",  description: "Photo plein écran, dégradé sombre en bas, stats grandes et lisibles" },
  "minimal":        { label: "Minimal",       description: "Stats discrètes en haut, photo respire" },
  "vintage":        { label: "Vintage",       description: "Style carte postale, cadre crème, typo serif" },
  "heatmap":       { label: "Tracé en vedette", description: "Tracé GPS coloré en grand, photo en arrière-plan flouté" },
};

/** Génère une légende auto-publiable. */
export function generateCaption(ride: {
  title: string;
  zone: string;
  distanceKm: number;
  elevationGain: number;
  durationMin: number;
  avgSpeed: number;
}): string {
  const dur = formatDuration(ride.durationMin);
  return [
    `${ride.title}`,
    `${ride.distanceKm} km · +${ride.elevationGain} m · ${dur} · ${ride.avgSpeed.toFixed(1)} km/h`,
    `Massif ${ride.zone} 🇫🇷`,
    "",
    "#AlpesInBike #ride #cyclisme #Alpes",
  ].join("\n");
}

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${m} min`;
}

/** Banque de photos Unsplash pour les Alpes (libres de droits). */
export const ALPES_PHOTOS: { id: string; url: string; label: string }[] = [
  { id: "p1", url: "https://images.unsplash.com/photo-1591619759638-36921634f97e?w=900&q=85", label: "Sommets Mont-Blanc" },
  { id: "p2", url: "https://images.unsplash.com/photo-1591028889197-3488e003481a?w=900&q=85", label: "Massif des Bauges" },
  { id: "p3", url: "https://images.unsplash.com/photo-1561377718-ebad6e79bc4a?w=900&q=85", label: "Lac du Bourget" },
  { id: "p4", url: "https://images.unsplash.com/photo-1594056466093-52bcbc7f5e4b?w=900&q=85", label: "Voie verte Annecy" },
  { id: "p5", url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=85", label: "Route alpine" },
  { id: "p6", url: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=900&q=85", label: "Col en lacets" },
  { id: "p7", url: "https://images.unsplash.com/photo-1559348349-86f1f65817fe?w=900&q=85", label: "Vallée alpine" },
  { id: "p8", url: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=900&q=85", label: "Vélo au sommet" },
];

/** Genere un trace GPS synthetique pour la preview. */
export function generateRoutePath(seed: number, width: number, height: number): string {
  const points: [number, number][] = [];
  const cx = width / 2;
  const cy = height / 2;
  const baseR = Math.min(width, height) * 0.28;
  const N = 32;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    const wobble1 = Math.sin(t * 3 + seed) * 0.15;
    const wobble2 = Math.cos(t * 5 + seed * 1.3) * 0.08;
    const r = baseR * (1 + wobble1 + wobble2);
    const x = cx + Math.cos(t) * r;
    const y = cy + Math.sin(t) * r * 0.9;
    points.push([x, y]);
  }
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
}
