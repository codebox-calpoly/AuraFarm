import { useCallback, useState } from "react";
import {
  View,
  type LayoutChangeEvent,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { Video, ResizeMode } from "expo-av";

import { isVideoUrl } from "@/lib/media";
import { tailwindColors } from "@/constants/tailwind-colors";

type Props = {
  uri: string;
  /** Merged with base frame (width 100%, aspect ratio, etc.) */
  frameStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/**
 * Renders a feed/post image or video from a remote URL (same `imageUri` field for both).
 */
export function PostMedia({
  uri,
  frameStyle,
  accessibilityLabel = "Challenge submission",
}: Props) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  const onFrameLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width <= 0 || height <= 0) return;
    setSize((prev) =>
      prev && prev.w === width && prev.h === height ? prev : { w: width, h: height },
    );
  }, []);

  const trimmed = uri.trim();
  const video = isVideoUrl(trimmed);

  return (
    <View style={[styles.baseFrame, frameStyle]} onLayout={onFrameLayout}>
      {size && video ? (
        <Video
          source={{ uri: trimmed }}
          style={{ width: size.w, height: size.h }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          isLooping={false}
          accessibilityLabel={accessibilityLabel}
        />
      ) : size ? (
        <Image
          source={{ uri: trimmed }}
          style={{ width: size.w, height: size.h }}
          contentFit="cover"
          transition={200}
          accessibilityLabel={accessibilityLabel}
          onError={(event) => {
            console.warn(
              "[PostMedia] image failed:",
              trimmed.slice(0, 96),
              "error" in event ? event.error : event,
            );
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  baseFrame: {
    overflow: "hidden",
    backgroundColor: tailwindColors["aura-gray-100"],
  },
});
