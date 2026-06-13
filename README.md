# Alpes in Bike, app mobile

App mobile native iOS et Android pour Alpes in Bike, compagnon du site alpesinbike.com.

## Stack

- **Expo SDK 56** + **Expo Router** (file-based routing)
- **TypeScript**
- **Supabase** (auth, base de données, stockage, partagé avec le web)
- **NativeWind** + **Tailwind**
- **i18n-js** pour les 6 langues : FR, EN, IT, DE, NL, ES
- **expo-linear-gradient**, **@expo/vector-icons**, **react-native-svg**
- **expo-secure-store** pour la session

## Lancer l'app

```bash
cd ~/Desktop/AlpesInBikeApp
npm install
npx expo start
```

Puis ouvre **Expo Go** sur ton iPhone, scanne le QR code, et l'app se lance.

## Variables d'environnement

Crée un fichier `.env.local` à la racine :

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Sans ces variables, l'app tourne en mode démo avec des données factices.

## Structure

```
src/
├── app/                    Expo Router file-based
│   ├── _layout.tsx
│   ├── index.tsx           Redirect vers auth ou tabs
│   ├── (auth)/welcome.tsx  Hero + sign in/up
│   ├── (tabs)/             Tab navigator
│   │   ├── home.tsx        Greeting + hero + actions + parcours
│   │   ├── bikes.tsx       Catalogue filtrable
│   │   ├── bookings.tsx    Réservations (en cours / à venir / passées)
│   │   └── profile.tsx     Compte + préférences + support
│   ├── booking/new.tsx     Wizard 3 étapes en modal
│   ├── bike/[slug].tsx     Détail vélo
│   └── sos.tsx             SAV WhatsApp + appel
├── constants/theme.ts      Design system aligné avec le web
├── lib/
│   ├── supabase.ts         Client Supabase avec SecureStore
│   ├── i18n.ts             6 langues
│   └── catalog.ts          Modèles de vélos
```

## Écrans déjà construits

- ✅ Welcome avec hero photo + 3 actions
- ✅ Home avec greeting, hero CTA, booking actif, actions rapides, carrousel parcours
- ✅ Catalogue avec 4 filtres + cards vélo + prix
- ✅ Mes réservations 3 onglets
- ✅ Compte avec sections personnelles, préférences, support, logout
- ✅ Détail vélo avec hero, tailles, inclus, dispo, CTA
- ✅ Wizard réservation 3 étapes (cyclistes / logistique / récap)
- ✅ SOS avec appel direct + WhatsApp

## Roadmap

### V1 MVP (reste 4 à 6 semaines)
- [ ] Branchement Supabase Auth (magic link + Apple Sign in)
- [ ] Vraies données depuis Supabase
- [ ] Push notifications Expo
- [ ] Téléchargement GPX vers Garmin/Wahoo
- [ ] Carte interactive Mapbox des sentiers
- [ ] Météo Open-Meteo
- [ ] Stripe Mobile SDK

### V2
- [ ] Espace pro (dashboard flotte hôtel)
- [ ] App équipe interne (scan QR vélo)
- [ ] Bluetooth moteur Bosch
- [ ] Tracker GPS intégré

## Déploiement

```bash
npx eas build --platform ios
npx eas build --platform android
npx eas submit
```

Compte Expo + EAS requis.
