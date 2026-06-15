/**
 * Contenu legal de l app, edite par version.
 * A faire valider par un juriste avant publication App Store.
 *
 * Trois documents principaux :
 *   1. Politique de confidentialite (RGPD)
 *   2. Conditions Generales d Utilisation (CGU)
 *   3. Charte communaute (anti-vol, securite sortie groupe)
 *
 * Chaque document a une date de version pour traçabilite acceptation.
 */

export type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDocument = {
  id: "privacy" | "terms" | "community";
  title: string;
  subtitle: string;
  lastUpdated: string;
  version: string;
  sections: LegalSection[];
};

export const PRIVACY_POLICY: LegalDocument = {
  id: "privacy",
  title: "Politique de confidentialité",
  subtitle: "Comment nous utilisons et protégeons vos données",
  lastUpdated: "15 juin 2026",
  version: "1.0",
  sections: [
    {
      title: "Qui sommes-nous",
      paragraphs: [
        "Alpes in Bike est une application éditée par Alpes in Bike SAS, immatriculée au RCS de Chambéry sous le numéro [à compléter], dont le siège social est situé à Chambéry, France.",
        "Le délégué à la protection des données (DPO) est joignable à dpo@alpesinbike.fr.",
      ],
    },
    {
      title: "Quelles données nous collectons",
      paragraphs: [
        "Pour utiliser certaines fonctionnalités de l'application, nous collectons les données suivantes selon le contexte :",
      ],
      bullets: [
        "Identité : prénom, nom, adresse email, photo de profil si fournie",
        "Compte : identifiant utilisateur, méthode d'authentification (Apple, Google, email)",
        "Vérification d'identité (optionnel, pour organiser une sortie) : pièce d'identité et selfie traités par Stripe Identity, jamais stockés par Alpes in Bike",
        "Localisation : tracé GPS pendant l'enregistrement d'un ride, position approximative pour trouver des copains à proximité",
        "Activité physique : distance, dénivelé, durée, vitesse, fréquence cardiaque si capteur connecté",
        "Données techniques : type d'appareil, OS, version de l'application, logs d'erreurs anonymisés",
        "Données de paiement : traitées par Stripe, nous ne stockons ni numéro de carte ni cryptogramme",
      ],
    },
    {
      title: "Pourquoi nous les collectons",
      paragraphs: [
        "Vos données servent exclusivement à :",
      ],
      bullets: [
        "Fournir le service de location de vélos et le suivi de vos rides",
        "Permettre la mise en relation avec d'autres rideurs (avec votre consentement)",
        "Garantir la sécurité communautaire (vérification d'identité optionnelle pour organisateurs)",
        "Calculer votre classement, vos badges et votre impact carbone",
        "Vous envoyer des notifications liées à votre activité",
        "Améliorer l'application via des statistiques anonymisées",
        "Respecter nos obligations légales (facturation, lutte contre la fraude)",
      ],
    },
    {
      title: "Base légale du traitement",
      paragraphs: [
        "Nous traitons vos données sur les bases légales suivantes (article 6 RGPD) :",
      ],
      bullets: [
        "Exécution du contrat : louer un vélo, enregistrer un ride",
        "Consentement : envoi de communications marketing, partage de votre position avec les copains",
        "Intérêt légitime : sécurité (anti-vol, anti-fraude), amélioration du service",
        "Obligation légale : facturation, conservation des données comptables 10 ans",
      ],
    },
    {
      title: "Combien de temps nous les gardons",
      paragraphs: [
        "Les durées de conservation sont les suivantes :",
      ],
      bullets: [
        "Compte actif : tant que vous êtes inscrit",
        "Compte supprimé : suppression sous 30 jours, sauf obligation légale",
        "Données de facturation : 10 ans (Code de commerce)",
        "Tracés GPS : 5 ans, anonymisés au bout de 3 ans",
        "Logs techniques : 6 mois maximum",
        "Données de vérification d'identité (Stripe) : selon politique Stripe, généralement 7 ans",
      ],
    },
    {
      title: "Avec qui nous les partageons",
      paragraphs: [
        "Vos données ne sont jamais vendues. Elles peuvent être transmises uniquement à :",
      ],
      bullets: [
        "Nos sous-traitants techniques sous contrat RGPD : Supabase (hébergement, UE), Stripe (paiement et vérification d'identité), Twilio (SMS), Apple Push, Firebase Cloud Messaging (notifications)",
        "Les autres rideurs : uniquement les informations que vous choisissez de partager (pseudo, ville approximative, niveau)",
        "Les autorités compétentes : sur réquisition judiciaire uniquement",
      ],
    },
    {
      title: "Apple Santé, Google Fit, Strava et autres connecteurs",
      paragraphs: [
        "Si vous connectez Apple Santé, Google Fit, Strava, Garmin, Polar, Suunto ou Wahoo, vous nous autorisez à lire les données nécessaires (rides passés, fréquence cardiaque pendant un ride).",
        "Nous ne lisons que ce qui est strictement nécessaire au service que vous activez. Vous pouvez révoquer l'accès à tout moment depuis les Réglages > Appareils et synchros.",
        "Les données Apple Santé ne quittent jamais votre iPhone, conformément aux exigences Apple HealthKit.",
      ],
    },
    {
      title: "Vos droits",
      paragraphs: [
        "Conformément au RGPD vous disposez des droits suivants :",
      ],
      bullets: [
        "Droit d'accès : obtenir copie de vos données",
        "Droit de rectification : corriger une donnée inexacte",
        "Droit à l'effacement : supprimer votre compte et vos données",
        "Droit à la portabilité : exporter vos données dans un format réutilisable",
        "Droit d'opposition : refuser certains traitements (marketing notamment)",
        "Droit de limitation : geler un traitement contesté",
        "Droit de retirer votre consentement à tout moment",
        "Droit de réclamation auprès de la CNIL (cnil.fr)",
      ],
    },
    {
      title: "Comment exercer vos droits",
      paragraphs: [
        "Depuis Réglages > Données et confidentialité vous pouvez : exporter vos données, supprimer votre compte, gérer vos consentements.",
        "Ou envoyer un email à dpo@alpesinbike.fr en précisant l'objet de votre demande. Réponse sous 1 mois maximum.",
      ],
    },
    {
      title: "Hébergement et sécurité",
      paragraphs: [
        "Vos données sont hébergées dans l'Union Européenne (Supabase, région Frankfurt).",
        "Elles sont chiffrées en transit (TLS 1.3) et au repos (AES-256).",
        "L'authentification est protégée par Apple/Google OAuth, lien magique email ou identifiant Supabase.",
      ],
    },
    {
      title: "Cookies et traceurs",
      paragraphs: [
        "L'application mobile n'utilise pas de cookies tiers. Elle utilise un stockage sécurisé local (SecureStore iOS / Android EncryptedSharedPreferences) pour conserver votre session.",
        "Aucun pixel publicitaire n'est intégré.",
      ],
    },
    {
      title: "Modifications de cette politique",
      paragraphs: [
        "En cas de modification substantielle, nous vous en informerons par notification dans l'application et par email au moins 30 jours avant l'entrée en vigueur.",
      ],
    },
  ],
};

export const TERMS_OF_USE: LegalDocument = {
  id: "terms",
  title: "Conditions Générales d'Utilisation",
  subtitle: "Les règles d'usage de l'application Alpes in Bike",
  lastUpdated: "15 juin 2026",
  version: "1.0",
  sections: [
    {
      title: "Objet",
      paragraphs: [
        "Les présentes CGU régissent l'utilisation de l'application mobile Alpes in Bike, éditée par Alpes in Bike SAS.",
        "Les conditions générales de vente de la location de vélos sont distinctes et accessibles séparément depuis Réglages > Mentions légales > CGV location.",
      ],
    },
    {
      title: "Accès à l'application",
      paragraphs: [
        "L'application est gratuite à télécharger sur l'App Store et le Google Play Store.",
        "Vous pouvez naviguer sans compte et réserver un vélo en mode invité.",
        "La création d'un compte (Apple, Google ou email) est requise pour : enregistrer vos rides, accéder au classement, recevoir les badges, partager des sorties avec d'autres rideurs.",
      ],
    },
    {
      title: "Compte utilisateur",
      paragraphs: [
        "Vous êtes responsable de la confidentialité de vos identifiants.",
        "Toute activité réalisée depuis votre compte est présumée provenir de vous.",
        "Vous vous engagez à fournir des informations exactes et à les maintenir à jour.",
        "L'âge minimum pour créer un compte est de 15 ans. Pour les mineurs de 15 à 18 ans, l'accord d'un représentant légal est nécessaire pour les fonctions de paiement.",
      ],
    },
    {
      title: "Vérification d'identité",
      paragraphs: [
        "Pour organiser une sortie groupe, une vérification d'identité est requise (pièce d'identité + selfie via Stripe Identity).",
        "Cette vérification est gratuite et a pour seul objectif la sécurité de la communauté : éviter que des personnes mal intentionnées créent de faux profils pour repérer ou voler des vélos lors des rendez-vous.",
        "Vos données d'identité ne sont jamais stockées ou consultées par Alpes in Bike, elles sont traitées par Stripe Identity sous votre contrôle.",
      ],
    },
    {
      title: "Règles d'usage",
      paragraphs: [
        "En utilisant Alpes in Bike vous vous engagez à :",
      ],
      bullets: [
        "Ne pas créer de faux profils ou usurper une identité",
        "Ne pas utiliser l'application à des fins illégales",
        "Respecter le Code de la route et la sécurité des autres usagers pendant vos rides",
        "Ne pas partager de contenu illicite, haineux, à caractère sexuel ou pornographique",
        "Ne pas harceler, intimider ou menacer d'autres utilisateurs",
        "Ne pas utiliser les rendez-vous de sortie groupe pour commettre une infraction",
        "Respecter les conditions de location lorsque vous louez un vélo via l'application",
      ],
    },
    {
      title: "Sanctions",
      paragraphs: [
        "Tout manquement aux règles peut entraîner :",
      ],
      bullets: [
        "Un avertissement par notification",
        "Une suspension temporaire du compte",
        "Une suppression définitive sans préavis en cas de manquement grave",
        "Un signalement aux autorités en cas d'infraction pénale",
      ],
    },
    {
      title: "Responsabilité",
      paragraphs: [
        "Alpes in Bike fournit une plateforme de mise en relation et un outil de suivi sportif. Nous ne sommes pas responsables :",
      ],
      bullets: [
        "Des comportements des autres utilisateurs",
        "Des incidents survenus pendant un ride (accident, vol, blessure)",
        "Des informations partagées par les utilisateurs (rides, événements, conseils)",
        "Des interruptions de service ou pertes de données (sauf à démontrer notre faute)",
        "Des décisions prises sur la base des données affichées (météo, classement, recommandations)",
      ],
      },
    {
      title: "Propriété intellectuelle",
      paragraphs: [
        "L'application, sa marque, son design et son code sont la propriété exclusive d'Alpes in Bike SAS.",
        "Vous restez propriétaire des contenus que vous publiez (photos, descriptions de rides) mais nous accordez une licence non exclusive pour les afficher dans l'application.",
      ],
    },
    {
      title: "Résiliation",
      paragraphs: [
        "Vous pouvez supprimer votre compte à tout moment depuis Réglages > Compte > Supprimer mon compte.",
        "Nous pouvons résilier votre compte en cas de manquement aux CGU, après notification.",
      ],
    },
    {
      title: "Droit applicable",
      paragraphs: [
        "Les présentes CGU sont régies par le droit français.",
        "Tout litige sera soumis aux tribunaux compétents de Chambéry, après tentative de médiation amiable. Vous pouvez recourir à la médiation de la consommation via www.economie.gouv.fr/mediation-conso.",
      ],
    },
  ],
};

export const COMMUNITY_CHARTER: LegalDocument = {
  id: "community",
  title: "Charte communauté",
  subtitle: "Les règles de respect, sécurité et confiance entre rideurs",
  lastUpdated: "15 juin 2026",
  version: "1.0",
  sections: [
    {
      title: "L'esprit Alpes in Bike",
      paragraphs: [
        "Alpes in Bike rassemble des rideurs passionnés des Alpes : familles, sportifs, aventuriers, débutants. Cette communauté ne fonctionne que si chacun y met du sien.",
      ],
    },
    {
      title: "Respect mutuel",
      paragraphs: [
        "Chaque rideur mérite respect, peu importe son niveau, son âge, son genre, son origine ou son type de vélo.",
        "Pas de jugement public sur les performances des autres. Pas d'insultes, pas de discrimination, pas de harcèlement.",
      ],
    },
    {
      title: "Sécurité avant tout",
      paragraphs: [
        "Pour les sorties groupe, l'organisateur doit avoir vérifié son identité (Stripe Identity).",
        "Le rendez-vous doit toujours être public, en journée, avec un point GPS précis.",
        "Si quelque chose vous semble louche (insistance bizarre, pression pour montrer son vélo, demande de venir seul), signalez-le immédiatement et annulez la sortie.",
      ],
    },
    {
      title: "Anti-vol",
      paragraphs: [
        "Ne laissez jamais votre vélo sans surveillance au point de rendez-vous, même quelques minutes.",
        "Marquez votre vélo (Bicycode, gravure) et enregistrez-le dans l'application sous Antivol > Mon registre.",
        "Signalez immédiatement un vol via /antitheft. La communauté est prévenue dans un rayon de 50 km et peut vous aider à le retrouver.",
      ],
    },
    {
      title: "Sur la route",
      paragraphs: [
        "Respectez le Code de la route et les autres usagers (piétons, automobilistes, randonneurs).",
        "Portez un casque, surtout en VTT et en descente.",
        "Adaptez votre vitesse aux conditions (météo, visibilité, état du terrain).",
        "En groupe, restez derrière le rideur le plus lent. Personne n'est laissé seul.",
      ],
    },
    {
      title: "Partage de contenu",
      paragraphs: [
        "Vos photos et vidéos vous appartiennent. Vous pouvez les partager via Alpes in Bike avec qui vous voulez.",
        "Pour partager une photo où apparaissent d'autres personnes (notamment leurs enfants), demandez leur accord.",
        "Pas de contenu illicite, haineux ou à caractère sexuel.",
      ],
    },
    {
      title: "Modération",
      paragraphs: [
        "Les rides partagés, les commentaires et les profils sont modérés a posteriori.",
        "Tout signalement est traité sous 48 h. Les comptes en infraction grave sont suspendus immédiatement.",
        "Pour signaler : touchez les trois points sur le contenu ou contactez community@alpesinbike.fr.",
      ],
    },
    {
      title: "Devenir Ambassadeur",
      paragraphs: [
        "Après 10 sorties groupe terminées sans incident et avec identité vérifiée, vous devenez Ambassadeur.",
        "Badge premium visible sur votre profil, score de match boosté pour trouver des copains, contact prioritaire pour signaler un problème.",
        "Une seule infraction grave et le statut est retiré.",
      ],
    },
  ],
};

export const LEGAL_DOCS = [PRIVACY_POLICY, TERMS_OF_USE, COMMUNITY_CHARTER];
