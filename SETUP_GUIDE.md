# Guide de mise en service Alpes in Bike

De zéro à backend connecté en 30 minutes. Aucune ligne de code à écrire.

---

## Étape 1 : Créer le projet Supabase (10 min)

1. Aller sur https://supabase.com et créer un compte (avec ton email pro `desaintlegerdiane@gmail.com` par exemple)
2. Cliquer sur **New Project**
3. Renseigner :
   - **Name** : `alpes-in-bike-prod`
   - **Database Password** : générer un mot de passe fort et le sauvegarder dans 1Password
   - **Region** : `Frankfurt` (RGPD, Europe)
   - **Pricing Plan** : `Free` pour commencer (jusqu'à 500 Mo de DB, suffisant pour les 1000 premiers utilisateurs)
4. Attendre 1-2 minutes que le projet soit provisionné

## Étape 2 : Coller le schéma SQL (5 min)

1. Dans le dashboard, ouvrir **SQL Editor** dans la sidebar gauche
2. Cliquer sur **New query**
3. Ouvrir le fichier `supabase/sql/SETUP_ALL.sql` dans VS Code
4. Tout sélectionner (Cmd+A) et copier (Cmd+C)
5. Coller dans le SQL Editor Supabase
6. Cliquer sur **Run** (en bas à droite)
7. Vérifier qu'il n'y a pas d'erreur en rouge en bas

À la fin tu devrais voir dans **Table Editor** ces tables créées :
- `profiles`, `clubs`, `friendships`
- `rides`, `ride_likes`, `ride_comments`
- `badges_earned`
- `user_connectors`, `sensor_sessions`, `widget_snapshots`
- `user_devices`, `notifications_outbox`
- `blocked_users`, `user_reports`
- `conversations`, `messages`

## Étape 3 : Récupérer les clés API (2 min)

1. Dans le dashboard Supabase, ouvrir **Settings** → **API**
2. Copier :
   - **Project URL** (commence par `https://xxxxx.supabase.co`)
   - **anon public** key (commence par `eyJhbGc...`)

## Étape 4 : Connecter l'app (1 min)

1. Dans le dossier `~/Desktop/AlpesInBikeApp`, créer un fichier `.env` :

```bash
cp .env.example .env
```

2. Ouvrir `.env` dans VS Code et remplir les deux premières lignes :

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

3. Sauvegarder

## Étape 5 : Tester (5 min)

```bash
cd ~/Desktop/AlpesInBikeApp
npx expo start --web --clear
```

1. Ouvrir l'app dans le navigateur
2. Cliquer sur "Continuer par email"
3. Entrer ton email
4. Tu reçois un magic link par mail Supabase
5. Cliquer dessus → tu es connecté avec un VRAI compte

Tester que ça persiste :
- Modifier ton pseudo dans Réglages
- Fermer l'app
- Rouvrir → le pseudo est toujours là, c'est sauvegardé dans Supabase

## Étape 6 : Activer l'auth Apple et Google (15 min)

### Apple

1. Aller sur https://developer.apple.com/account (compte Apple Developer 99 €/an obligatoire)
2. Identifiers → créer un Service ID `com.alpesinbike.app.signin`
3. Activer Sign in with Apple
4. Configurer les domaines : `xxxxx.supabase.co`
5. Configurer le return URL : `https://xxxxx.supabase.co/auth/v1/callback`
6. Créer une clé `.p8` sous Keys → Sign in with Apple
7. Dans Supabase Dashboard → Authentication → Providers → Apple :
   - Coller le Service ID, Team ID, Key ID et le contenu de la `.p8`
   - Activer

### Google

1. Aller sur https://console.cloud.google.com
2. Créer un projet OAuth
3. APIs & Services → Credentials → Create OAuth client ID
   - Type Web application
   - Redirect URI : `https://xxxxx.supabase.co/auth/v1/callback`
4. Copier Client ID + Client Secret
5. Dans Supabase Dashboard → Authentication → Providers → Google :
   - Coller les deux clés
   - Activer

## Étape 7 : Email magic link (2 min)

Par défaut Supabase utilise son SMTP de démo (limité à 4 emails/heure).
Pour aller au-delà :

1. Dashboard Supabase → Authentication → SMTP Settings
2. Configurer un SMTP perso (Resend, Brevo, SendGrid…)

Resend gratuit jusqu'à 3000 emails/mois : https://resend.com

## Étape 8 : Notifications push (10 min)

1. Créer un compte Expo : https://expo.dev/signup
2. Lancer `eas init` dans le dossier → ça crée le project ID
3. Le mettre dans `.env` : `EXPO_PUBLIC_EXPO_PROJECT_ID=xxxxxxxx-...`
4. Pour iOS, il faut un certificat APNs depuis Apple Developer
5. Pour Android, Firebase Cloud Messaging gratuit

## Étape 9 : Build sur device (30 min)

```bash
cd ~/Desktop/AlpesInBikeApp
npx eas build --platform ios --profile preview
```

EAS construit l'app dans le cloud, ça prend 20 minutes. Tu reçois un lien pour télécharger sur ton iPhone via TestFlight.

---

## Connecteurs montres et capteurs (chacun ~30 min)

Activer un connecteur par un :

| Connecteur | Portail développeur | Délai approval |
|---|---|---|
| Strava | https://www.strava.com/settings/api | Immédiat |
| Apple Santé | Inclus iOS, rien à faire | — |
| Google Fit | https://console.cloud.google.com (Health Connect) | Immédiat |
| Garmin | https://developer.garmin.com | 1-2 jours |
| Polar | https://admin.polaraccesslink.com | Immédiat |
| Suunto | https://www.suunto.com/sports/suunto-app/developer-portal | Quelques jours |
| Wahoo | https://cloud.wahooligan.com | Immédiat |
| Whoop | https://developer.whoop.com | Immédiat |
| Oura | https://cloud.ouraring.com/oauth/applications | Immédiat |
| Ultrahuman | dev@ultrahuman.com | Quelques jours |
| Fitbit | https://dev.fitbit.com | Immédiat |

Pour chaque, après avoir créé l'app sur leur portail :
1. Copier le Client ID dans `.env`
2. Mettre le Client Secret dans Supabase Edge Function Settings (jamais dans `.env` qui est bundlé)
3. Le tag connecteur passe vert dans `/settings/appareils`

---

## Checklist soumission App Store

Quand tout marche en TestFlight :

- [ ] Captures écran 8 formats prêtes (iPhone 15 Pro Max 6.7")
- [ ] Icône 1024x1024 PNG sans canal alpha
- [ ] Compte Apple Developer 99 €/an actif
- [ ] App créée dans App Store Connect avec Bundle ID `com.alpesinbike.app`
- [ ] Textes prêts (voir `store-metadata.md`)
- [ ] URL politique de confidentialité publiée sur `alpesinbike.fr/confidentialite`
- [ ] Tester en TestFlight avec 5-10 utilisateurs externes
- [ ] Compte de test pour Apple Review (email + mot de passe dédiés)
- [ ] EAS Build production signé
- [ ] Soumettre via App Store Connect

Apple répond sous 24-48h en moyenne.

---

## Aide

Si tu bloques sur une étape :
- Vérifier les logs Supabase Dashboard → Logs
- Logs Expo : terminal où tourne `npx expo start`
- Issue GitHub : https://github.com/Dianelavinia/AlpesInBikeApp/issues

Pour la suite (paiement Stripe, Stripe Identity, SMS Twilio), des guides dédiés peuvent être ajoutés sur demande.
