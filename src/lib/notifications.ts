/**
 * Service de notifications push Alpes in Bike.
 *
 * Couvre 7 types de notifications :
 *   1. Ride : detection de chute, batterie VAE faible, GPS perdu
 *   2. Famille : Lucas est arrete depuis 2 min, batterie Marie faible
 *   3. Sortie groupe : nouveau participant, rappel J-1, annulation
 *   4. Invitations : nouvelle invit recue, acceptee, refusee
 *   5. Antivol : alerte vol pres de chez vous, votre velo retrouve
 *   6. Classement : depasse par X, podium semaine, badge debloque
 *   7. Reservation : confirmation, rappel livraison, evaluation
 *
 * En prod : Expo Push Token enregistre dans table user_devices Supabase,
 * Edge function envoie via Expo Push API ou directement APNs/FCM.
 */

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

export type NotificationType =
  | "ride.fall"
  | "ride.battery"
  | "ride.gps_lost"
  | "family.stopped"
  | "family.low_battery"
  | "group.new_member"
  | "group.reminder"
  | "group.cancelled"
  | "invite.received"
  | "invite.accepted"
  | "invite.declined"
  | "antitheft.nearby"
  | "antitheft.found"
  | "leaderboard.passed"
  | "leaderboard.podium"
  | "badge.unlocked"
  | "booking.confirmed"
  | "booking.delivery"
  | "booking.review";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Demande la permission notif et recupere l Expo Push Token.
 * Enregistrer ce token dans Supabase user_devices.expo_push_token.
 */
export async function registerForPushNotifications(): Promise<{ token?: string; error?: string }> {
  if (Platform.OS === "web") return { error: "Web ne supporte pas les push" };
  if (!Device.isDevice) return { error: "Simulateur, push indisponible" };

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return { error: "Permission refusée" };

    // Setup channels Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Notifications générales",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#E15A23",
      });
      await Notifications.setNotificationChannelAsync("urgent", {
        name: "Sécurité et urgence",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: "#EF4444",
        sound: "default",
      });
      await Notifications.setNotificationChannelAsync("family", {
        name: "Famille",
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: "#0D4F3D",
      });
      await Notifications.setNotificationChannelAsync("social", {
        name: "Sortie groupe et invitations",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
      await Notifications.setNotificationChannelAsync("booking", {
        name: "Réservations",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as any).easConfig?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    return { token };
  } catch (e: any) {
    return { error: e?.message ?? "Erreur push" };
  }
}

/**
 * Envoie une notification locale immediatement (test ou rappel).
 */
export async function sendLocalNotification(opts: {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}): Promise<void> {
  const channelId = channelForType(opts.type);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: opts.title,
      body: opts.body,
      data: { type: opts.type, ...opts.data },
      sound: opts.type.startsWith("ride.") || opts.type.startsWith("antitheft.") ? "default" : undefined,
    },
    trigger: null,
    ...(Platform.OS === "android" ? { identifier: channelId } : {}),
  });
}

function channelForType(type: NotificationType): string {
  if (type.startsWith("ride.")) return "urgent";
  if (type === "antitheft.nearby" || type === "antitheft.found") return "urgent";
  if (type.startsWith("family.")) return "family";
  if (type.startsWith("group.") || type.startsWith("invite.")) return "social";
  if (type.startsWith("booking.")) return "booking";
  return "default";
}

/**
 * Lecteur d evenements push pour la navigation contextuelle.
 * A appeler dans _layout.tsx racine pour ouvrir la bonne route quand
 * l user clique sur une notification.
 */
export function attachNotificationListeners(handlers: {
  onReceive?: (n: Notifications.Notification) => void;
  onTap?: (data: Record<string, any>) => void;
}): () => void {
  const sub1 = Notifications.addNotificationReceivedListener((n) => {
    handlers.onReceive?.(n);
  });
  const sub2 = Notifications.addNotificationResponseReceivedListener((r) => {
    handlers.onTap?.(r.notification.request.content.data ?? {});
  });
  return () => {
    sub1.remove();
    sub2.remove();
  };
}
