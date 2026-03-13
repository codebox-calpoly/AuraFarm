import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Defs, Filter, FeFlood, FeColorMatrix, FeComposite, FeOffset, FeGaussianBlur, FeBlend } from "react-native-svg";
import { tailwindFonts } from "@/constants/tailwind-colors";

interface AuraDiamondIconProps {
  color: string;
  points?: number;
  width?: number;
  height?: number;
  style?: object;
}

/**
 * AuraDiamond rendered with a dynamic colour. The original SVG has the colour
 * hardcoded to red (#CC0A19); this component accepts any hex/rgb colour string.
 */
export function AuraDiamondIcon({ color, points, width = 270, height = 426, style }: AuraDiamondIconProps) {
  return (
    <View style={[{ width, height, position: "relative" }, style]}>
    <Svg
      width={width}
      height={height}
      viewBox="0 0 312 464"
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
    </Svg>
    {points != null && (
      <View style={diamondStyles.overlay}>
        <Text style={[diamondStyles.pointsText, { color }]}>{points}</Text>
        <Text style={[diamondStyles.ptsLabel, { color }]}>pts</Text>
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
    fontSize: 28,
    fontFamily: tailwindFonts["bold"],
  },
  ptsLabel: {
    fontSize: 14,
    fontFamily: tailwindFonts["regular"],
    marginTop: -4,
  },
});
