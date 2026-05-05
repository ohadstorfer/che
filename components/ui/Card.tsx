import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";

type Props = ViewProps & {
  padded?: boolean;
  padding?: number;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Card({ padded = true, padding, elevated, style, children, ...rest }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: "transparent",
          borderRadius: theme.radii.card,
          padding: padded ? padding ?? theme.spacing.md : 0,
          borderWidth: elevated ? 1 : 0,
          borderColor: theme.colors.greenLine,
          borderCurve: "continuous",
        } as ViewStyle,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
