import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'subtitle';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const color =
    colorScheme === 'dark'
      ? darkColor ?? Colors.dark.text
      : lightColor ?? Colors.light.text;

  const defaultStyle =
    type === 'title'
      ? { fontSize: 20, fontWeight: 'bold' as const }
      : type === 'subtitle'
        ? { fontSize: 16, fontWeight: '600' as const }
        : {};

  return (
    <Text
      style={[{ color }, defaultStyle, style]}
      {...rest}
    />
  );
}
