import { Colors } from '@/constants/theme';
import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  ...rest
}: ThemedViewProps) {
  const backgroundColor = lightColor ?? Colors.light.background;

  return <View style={[{ backgroundColor }, style]} {...rest} />;
}
