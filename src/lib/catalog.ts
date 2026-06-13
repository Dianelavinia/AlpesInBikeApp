/**
 * Catalogue de vélos pour l'app mobile.
 * Aligné sur le web. À synchroniser via Supabase plus tard.
 */

export type BikeAudience = "adult" | "child";

export type BikeModel = {
  slug: string;
  name: string;
  brand: string;
  tagline: string;
  category: "vttae" | "vtt" | "kid" | "road" | "city";
  audience: BikeAudience;
  pricePerDay: number;
  sizes: string[];
  available: number;
  color: string;
  emoji: string;
};

export const BIKES: BikeModel[] = [
  {
    slug: "giant-trance-x-e-plus",
    name: "Trance X E+ 2",
    brand: "GIANT",
    tagline: "L'arme absolue pour grimper sans souffrir.",
    category: "vttae",
    audience: "adult",
    pricePerDay: 79,
    sizes: ["S", "M", "L", "XL"],
    available: 12,
    color: "#E15A23",
    emoji: "🚵",
  },
  {
    slug: "liv-intrigue-x",
    name: "Intrigue X Advanced E+",
    brand: "LIV",
    tagline: "Le VTTAE pensé pour les femmes.",
    category: "vttae",
    audience: "adult",
    pricePerDay: 79,
    sizes: ["XS", "S", "M", "L"],
    available: 6,
    color: "#0D4F3D",
    emoji: "🚵‍♀️",
  },
  {
    slug: "marin-rift-zone",
    name: "Rift Zone 2",
    brand: "Marin",
    tagline: "Le trail bike pour les puristes.",
    category: "vtt",
    audience: "adult",
    pricePerDay: 45,
    sizes: ["S", "M", "L", "XL"],
    available: 5,
    color: "#4B916D",
    emoji: "🚴",
  },
  {
    slug: "woom-up-5",
    name: "Up 5",
    brand: "Woom",
    tagline: "Le VTTAE qui suit les parents partout.",
    category: "vttae",
    audience: "child",
    pricePerDay: 39,
    sizes: ["S", "M"],
    available: 4,
    color: "#F6B595",
    emoji: "🚲",
  },
  {
    slug: "woom-explore-5",
    name: "Explore 5",
    brand: "Woom",
    tagline: "Pour les voies vertes en famille.",
    category: "vtt",
    audience: "child",
    pricePerDay: 29,
    sizes: ["S", "M"],
    available: 8,
    color: "#B8431A",
    emoji: "🚲",
  },
  {
    slug: "giant-tcr",
    name: "TCR Advanced Pro 1",
    brand: "GIANT",
    tagline: "Pour le tour du lac et les cols.",
    category: "road",
    audience: "adult",
    pricePerDay: 65,
    sizes: ["M", "L"],
    available: 2,
    color: "#0A0A0A",
    emoji: "🚴‍♂️",
  },
];
