import { View, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { Colors, Radius } from "@/constants/theme";

/**
 * Skeleton de chargement reutilisable.
 * Effet pulse subtil pour signaler le chargement.
 */

export default function Skeleton({
  width,
  height = 16,
  radius = Radius.sm,
  style,
}: {
  width: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: any;
}) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.box,
        { width: width as any, height, borderRadius: radius, opacity },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: Colors.border.base },
});
