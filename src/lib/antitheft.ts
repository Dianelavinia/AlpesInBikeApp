/**
 * Antivol communautaire : enregistrement, déclaration vol, alerte communauté.
 */

export type BikeStatus = "ok" | "stolen" | "recovered";

export type RegisteredBike = {
  id: string;
  ownerName: string;
  ownerAvatar: string;
  brand: string;
  model: string;
  color: string;
  serialNumber: string;
  photos: string[];
  registeredAt: string;
  status: BikeStatus;
  stolenAt?: string;
  stolenLocation?: { lat: number; lon: number; label: string };
  description?: string;
  reward?: number;
};

export const REGISTERED_BIKES: RegisteredBike[] = [
  {
    id: "b-1",
    ownerName: "Marie Roche (vous)",
    ownerAvatar: "MR",
    brand: "Giant",
    model: "Trance X E+ 2",
    color: "Vert forêt",
    serialNumber: "AIB-238A-9921",
    photos: ["https://images.unsplash.com/photo-1591619759638-36921634f97e?w=600&q=85"],
    registeredAt: "2026-04-15",
    status: "ok",
  },
];

export const STOLEN_NEARBY: RegisteredBike[] = [
  {
    id: "b-2",
    ownerName: "Julie M.",
    ownerAvatar: "JM",
    brand: "Specialized",
    model: "Stumpjumper",
    color: "Noir mat avec liserés rouges",
    serialNumber: "SP-2023-12K",
    photos: ["https://images.unsplash.com/photo-1668106401134-ff9c584a507b?w=600&q=85"],
    registeredAt: "2026-03-10",
    status: "stolen",
    stolenAt: "hier 22h",
    stolenLocation: { lat: 45.569, lon: 5.926, label: "Parking gare Chambéry" },
    description: "Cadenas U coupé, batterie absente. Selle Brooks marron caractéristique.",
    reward: 200,
  },
  {
    id: "b-3",
    ownerName: "Anonymous",
    ownerAvatar: "AN",
    brand: "Cannondale",
    model: "Topstone",
    color: "Bleu turquoise",
    serialNumber: "CN-9821",
    photos: ["https://images.unsplash.com/photo-1668620997342-8d847135ff42?w=600&q=85"],
    registeredAt: "2026-02-12",
    status: "stolen",
    stolenAt: "il y a 3 jours",
    stolenLocation: { lat: 45.692, lon: 5.916, label: "Aix-les-Bains centre" },
    description: "Bagages sur porte-bagage volés avec le vélo.",
    reward: 100,
  },
];
