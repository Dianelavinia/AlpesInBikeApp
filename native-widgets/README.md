# Widgets téléphone natifs Alpes in Bike

Cette doc cadre la mise en production des vrais widgets WidgetKit (iOS) et Glance (Android).
Les visuels du widget sont déjà construits côté Expo dans `src/components/PhoneWidgetPreview.tsx`,
identiques aux gabarits Swift et Kotlin de ce dossier.

## 1. iOS WidgetKit

Pré-requis : custom dev client Expo (les widgets ne tournent pas dans Expo Go).

```bash
yarn add expo-apple-targets
```

Dans `app.json`, ajouter le plugin :

```json
{
  "expo": {
    "plugins": [
      ["expo-apple-targets", {
        "targets": [{
          "name": "AlpesInBikeWidget",
          "type": "widget",
          "bundleIdentifier": "com.alpesinbike.app.widget",
          "appGroupIdentifier": "group.com.alpesinbike.app"
        }]
      }]
    ]
  }
}
```

Copier `ios/AlpesInBikeWidget.swift` dans `ios/AlpesInBikeWidget/`.

Activer l'App Group `group.com.alpesinbike.app` dans Xcode pour l'app principale
et pour la target widget. Ce groupe partage `UserDefaults` entre l'app et le widget.

Côté app, écrire les valeurs à chaque ouverture et fin de ride :

```ts
import { NativeModules } from "react-native";
// Module natif minimal qui expose UserDefaults(suiteName:)
NativeModules.WidgetBridge.setData({ km: 248, co2: 312, rank: 4, ... });
```

Reload du widget : `WidgetCenter.shared.reloadAllTimelines()` (Swift) appelé
depuis le bridge.

## 2. Android Glance

```bash
yarn add react-native-android-widget
```

Plugin dans `app.json` :

```json
{
  "expo": {
    "plugins": [
      ["react-native-android-widget", {
        "widgets": [{
          "name": "AlpesInBike",
          "label": "Alpes in Bike",
          "minWidth": "180dp",
          "minHeight": "180dp"
        }]
      }]
    ]
  }
}
```

Copier `android/AlpesInBikeWidget.kt` dans
`android/app/src/main/java/com/alpesinbike/widget/`.

Données partagées via `SharedPreferences("alpes_widget", MODE_PRIVATE)`.
Côté JS, écrire à chaque ouverture :

```ts
import { setWidgetData } from "react-native-android-widget";
setWidgetData("AlpesInBike", { km: 248, co2: 312, ... });
```

## 3. Source des données

Au démarrage de l'app, après login et après chaque fin de ride, appeler
la RPC `refresh_widget_snapshot()` (voir `supabase/sql/0002_connectors_widgets.sql`)
puis lire le snapshot et le pousser au widget natif :

```ts
async function syncWidget() {
  await supabase.rpc("refresh_widget_snapshot");
  const { data } = await supabase
    .from("widget_snapshots")
    .select("*")
    .single();
  await pushToNativeWidget(data); // bridge iOS / Android
}
```

## 4. Push refresh à distance

Pour rafraîchir le widget quand l'utilisateur n'ouvre pas l'app (ex. après
qu'un ami le double dans le classement) :

- iOS : envoyer un push silencieux `content-available: 1` via APNs, le service
  d'extension reload `WidgetCenter.shared.reloadAllTimelines()`.
- Android : FCM data message qui déclenche le receiver `Glance.update()`.

À implémenter via une Edge Function Supabase qui réagit aux inserts dans
`rides` et appelle APNs / FCM avec l'API server-side.
