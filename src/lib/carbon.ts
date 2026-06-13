/**
 * Calculs et équivalents bilan carbone.
 * Conversions basées sur estimations ADEME et bilan moyen voiture France.
 */

export type CarbonStats = {
  co2Saved: number;
  kmRidden: number;
  carTripsAvoided: number;
  fuelLitersAvoided: number;
  annualGoal: number;
};

export const USER_CARBON: CarbonStats = {
  co2Saved: 312,
  kmRidden: 1450,
  carTripsAvoided: 47,
  fuelLitersAvoided: 118,
  annualGoal: 500,
};

export type FunEquivalent = {
  icon: string;
  emoji: string;
  big: string;
  unit: string;
  desc: string;
  tint: string;
};

/**
 * Équivalents parlants pour donner du sens aux kg CO2 économisés.
 * Basés sur 312 kg de CO2 économisés.
 */
export function getFunEquivalents(co2Kg: number): FunEquivalent[] {
  return [
    {
      icon: "leaf",
      emoji: "🌳",
      big: Math.round(co2Kg / 22).toString(),
      unit: "arbres",
      desc: "qu'il faudrait planter pour absorber autant de CO2 sur un an",
      tint: "#0D4F3D",
    },
    {
      icon: "car-sport-outline",
      emoji: "🚗",
      big: Math.round(co2Kg / 0.193).toString(),
      unit: "km en voiture",
      desc: "que vous n'avez pas faits, soit l'équivalent d'un Chambéry-Marseille",
      tint: "#E15A23",
    },
    {
      icon: "airplane-outline",
      emoji: "✈️",
      big: (co2Kg / 250).toFixed(1),
      unit: "vols Paris-Nice",
      desc: "C'est ce qu'un vol court-courrier émet, pour comparaison",
      tint: "#0369A1",
    },
    {
      icon: "fast-food-outline",
      emoji: "🍔",
      big: Math.round(co2Kg / 4).toString(),
      unit: "burgers boeuf",
      desc: "soit la même empreinte que de manger autant de burgers en moins",
      tint: "#F59E0B",
    },
    {
      icon: "phone-portrait-outline",
      emoji: "📱",
      big: Math.round(co2Kg / 0.5).toString(),
      unit: "heures de streaming HD",
      desc: "évitées (1h Netflix HD = environ 0,5 kg CO2)",
      tint: "#7C3AED",
    },
    {
      icon: "fitness-outline",
      emoji: "🔋",
      big: Math.round(co2Kg * 1.4).toString(),
      unit: "kWh d'électricité",
      desc: "équivalent en consommation, soit 2 mois d'éclairage d'une maison",
      tint: "#FACC15",
    },
  ];
}

/**
 * Projections motivantes selon la tendance actuelle.
 */
export function getProjections(stats: CarbonStats) {
  const monthsToYearEnd = 6;
  const monthlyRate = stats.co2Saved / 6;
  const yearEndProjection = Math.round(stats.co2Saved + monthlyRate * monthsToYearEnd);

  return {
    yearEnd: yearEndProjection,
    yearEndTrees: Math.round(yearEndProjection / 22),
    yearEndCarKm: Math.round(yearEndProjection / 0.193),
    onTrack: stats.co2Saved >= (stats.annualGoal / 12) * 6,
    progressPercent: Math.min(100, Math.round((stats.co2Saved / stats.annualGoal) * 100)),
  };
}

/**
 * Messages motivants selon palier atteint.
 */
export function getMotivationalMessage(co2Kg: number): { headline: string; body: string; emoji: string } {
  if (co2Kg < 50) {
    return { emoji: "🌱", headline: "Vous êtes sur le bon chemin", body: "Chaque kilomètre compte. Continuez et vous serez surpris du résultat à la fin de la saison." };
  }
  if (co2Kg < 150) {
    return { emoji: "💪", headline: "Bravo, vous y êtes vraiment", body: "Vous êtes au-dessus de la moyenne des Français qui pédalent. Continuez et vous atteindrez 500 kg en fin d'année." };
  }
  if (co2Kg < 300) {
    return { emoji: "🔥", headline: "Vous changez les choses", body: "Vos économies de CO2 équivalent à plusieurs allers-retours en voiture évités. Pas mal du tout, vraiment." };
  }
  if (co2Kg < 500) {
    return { emoji: "🌍", headline: "Impact réel sur la planète", body: "À ce rythme, vous comptez parmi les 5% de cyclistes les plus engagés écologiquement de Savoie. Continuez." };
  }
  return { emoji: "🏆", headline: "Vous êtes une star verte", body: "Plus de 500 kg de CO2 évités. C'est l'équivalent d'un arbre adulte planté il y a 25 ans. Inspirez les autres." };
}
