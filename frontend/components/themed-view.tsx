import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...rest
}: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const backgroundColor =
    colorScheme === 'dark'
      ? darkColor ?? Colors.dark.background
      : lightColor ?? Colors.light.background;

  return <View style={[{ backgroundColor }, style]} {...rest} />;
}
