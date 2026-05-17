import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Defs, Filter, FeFlood, FeColorMatrix, FeComposite, FeOffset, FeGaussianBlur, FeBlend } from "react-native-svg";
import { tailwindColors, tailwindFonts } from "@/constants/tailwind-colors";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface AuraDiamondIconProps {
  color: string;
  points?: number;
  width?: number;
  height?: number;
  style?: object;
}

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const sparkleSizes = [15, 15, 15, 15, 15, 15, 15, 12, 12, 12, 12, 10, 10, 10, 8, 8, 8, 6, 6, 6, 3, 3, 3];

/**
 * AuraDiamond rendered with a dynamic colour. The original SVG has the colour
 * hardcoded to red (#CC0A19); this component accepts any hex/rgb colour string.
 */
export function AuraDiamondIcon({ color, points, width = 270, height = 426, style }: AuraDiamondIconProps) {
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);
  const scale4 = useSharedValue(1);

  useEffect(() => {
    // Loop the animation infinitely back and forth (equivalent to 10s ease-in-out infinite)
    scale1.value = withRepeat(
      withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    scale2.value = withRepeat(
      withTiming(0.85, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    scale3.value = withRepeat(
      withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    scale4.value = withRepeat(
      withTiming(0.85, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale1.value },
      ],
    };
  });
  const animatedStyle2 = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale2.value },
      ],
    };
  });
  const animatedStyle3 = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale3.value },
      ],
    };
  });
  const animatedStyle4 = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale4.value },
      ],
    };
  });

  return (
    <View style={[{ width, height, position: "relative" }, style]}>

      {/* <Svg
        style={diamondStyles.smallSparkle1}
        width={width/4}
        height={height/4}
        viewBox="0 0 312 464"
      >
        <Path
          d="M156 87.5393L161.245 129.099C167.479 178.497 205.782 217.944 255.371 226.035L267.414 228L255.371 229.965C205.782 238.056 167.479 277.503 161.245 326.901L156 368.461L150.755 326.901C144.521 277.503 106.218 238.056 56.6289 229.965L44.5864 228L56.6289 226.035C106.218 217.944 144.521 178.497 150.755 129.099L156 87.5393Z"
          fill="#fff"
          fillOpacity={0.55}
        />
      </Svg>
      <Svg
        style={diamondStyles.smallSparkle2}
        width={width/6}
        height={height/6}
        viewBox="0 0 312 464"
      >
        <Path
          d="M156 87.5393L161.245 129.099C167.479 178.497 205.782 217.944 255.371 226.035L267.414 228L255.371 229.965C205.782 238.056 167.479 277.503 161.245 326.901L156 368.461L150.755 326.901C144.521 277.503 106.218 238.056 56.6289 229.965L44.5864 228L56.6289 226.035C106.218 217.944 144.521 178.497 150.755 129.099L156 87.5393Z"
          fill="#fff"
          fillOpacity={0.4}
        />
      </Svg>
      <Svg
        style={diamondStyles.smallSparkle3}
        width={width/8}
        height={height/8}
        viewBox="0 0 312 464"
      >
        <Path
          d="M156 87.5393L161.245 129.099C167.479 178.497 205.782 217.944 255.371 226.035L267.414 228L255.371 229.965C205.782 238.056 167.479 277.503 161.245 326.901L156 368.461L150.755 326.901C144.521 277.503 106.218 238.056 56.6289 229.965L44.5864 228L56.6289 226.035C106.218 217.944 144.521 178.497 150.755 129.099L156 87.5393Z"
          fill="#fff"
          fillOpacity={0.25}
        />
      </Svg>
      <Svg
        style={diamondStyles.smallSparkle4}
        width={width/6}
        height={height/6}
        viewBox="0 0 312 464"
      >
        <Path
          d="M156 87.5393L161.245 129.099C167.479 178.497 205.782 217.944 255.371 226.035L267.414 228L255.371 229.965C205.782 238.056 167.479 277.503 161.245 326.901L156 368.461L150.755 326.901C144.521 277.503 106.218 238.056 56.6289 229.965L44.5864 228L56.6289 226.035C106.218 217.944 144.521 178.497 150.755 129.099L156 87.5393Z"
          fill="#fff"
          fillOpacity={0.35}
        />
      </Svg>
      <Svg
        style={diamondStyles.smallSparkle3}
        width={width/8}
        height={height/8}
        viewBox="0 0 312 464"
      >
        <Path
          d="M156 87.5393L161.245 129.099C167.479 178.497 205.782 217.944 255.371 226.035L267.414 228L255.371 229.965C205.782 238.056 167.479 277.503 161.245 326.901L156 368.461L150.755 326.901C144.521 277.503 106.218 238.056 56.6289 229.965L44.5864 228L56.6289 226.035C106.218 217.944 144.521 178.497 150.755 129.099L156 87.5393Z"
          fill="#fff"
          fillOpacity={0.25}
        />
      </Svg> */}

      {sparkleSizes.map((size, i) => (
        <AnimatedSvg
          style={[diamondStyles.smallSparkle, i % 4 === 0 ? animatedStyle1 : i % 4 === 1 ? animatedStyle2 : i % 4 === 2 ? animatedStyle3 : animatedStyle4, { left: Math.random() * (250 - (-50)) + (-50), top: Math.random() * (650 - (0)) + (0) }]}
          width={width / size}
          height={height / size}
          viewBox="0 0 312 464"
          key={i}
        >
          <Path
            d="M156 87.5393L161.245 129.099C167.479 178.497 205.782 217.944 255.371 226.035L267.414 228L255.371 229.965C205.782 238.056 167.479 277.503 161.245 326.901L156 368.461L150.755 326.901C144.521 277.503 106.218 238.056 56.6289 229.965L44.5864 228L56.6289 226.035C106.218 217.944 144.521 178.497 150.755 129.099L156 87.5393Z"
            fill="#fff"
            fillOpacity={Math.random() * (0.5 - (0.1)) + (0.1)}
          />
        </AnimatedSvg>
      ))}

      <AnimatedSvg
        width={width}
        height={height}
        viewBox="0 0 312 464"
        style={animatedStyle1}
      >
        <Defs>
          <Filter id="shadow" x="0" y="0" width="312" height="464" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <FeFlood floodOpacity="0" result="BackgroundImageFix" />
            <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <FeOffset dy="4" />
            <FeGaussianBlur stdDeviation="2" />
            <FeComposite in2="hardAlpha" operator="out" />
            <FeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </Filter>
        </Defs>

        {/* Outer diamond */}
        <Path
          d="M161.664 67.6191C170.223 148.311 222.849 212.998 291.285 226.283L300.128 228L291.285 229.717C222.849 243.002 170.223 307.689 161.664 388.381L156 441.782L150.336 388.381C141.777 307.689 89.151 243.002 20.7148 229.717L11.8711 228L20.7148 226.283C89.151 212.998 141.777 148.311 150.336 67.6191L156 14.2168L161.664 67.6191Z"
          fill={color}
          fillOpacity={0.47}
          stroke={color}
          strokeWidth={3}
        />
        {/* Inner diamond */}
        <Path
          d="M156 87.5393L161.245 129.099C167.479 178.497 205.782 217.944 255.371 226.035L267.414 228L255.371 229.965C205.782 238.056 167.479 277.503 161.245 326.901L156 368.461L150.755 326.901C144.521 277.503 106.218 238.056 56.6289 229.965L44.5864 228L56.6289 226.035C106.218 217.944 144.521 178.497 150.755 129.099L156 87.5393Z"
          fill={color}
          fillOpacity={0.47}
        />
      </AnimatedSvg>

      {points != null && (
        <View style={diamondStyles.overlay}>
          <Text style={[diamondStyles.pointsText, { color: tailwindColors["aura-gray-100"] }]}>{points}</Text>
          <Text style={[diamondStyles.ptsLabel, { color: tailwindColors["aura-gray-300"] }]}>Aura</Text>
        </View>
      )}
    </View>
  );
}

const diamondStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  pointsText: {
    fontSize: 32,
    fontFamily: tailwindFonts["bold"],
  },
  ptsLabel: {
    fontSize: 14,
    fontFamily: tailwindFonts["regular"],
    marginTop: -6,
  },
  smallSparkle: {
    position: "absolute",
    zIndex: -1,
  },
});
