import { ActivityIndicator, View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";
import { Text } from "./Text";
import { Pressable } from "./Pressable";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive";
export type ButtonSize = "default" | "compact";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** When true (default for primary), disabled state shows an outline instead of a faded fill. */
  outlineWhenDisabled?: boolean;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "default",
  disabled,
  loading,
  fullWidth = true,
  leadingIcon,
  trailingIcon,
  style,
  outlineWhenDisabled,
}: Props) {
  const theme = useTheme();
  const height = size === "compact" ? 40 : 50;
  const isDisabled = disabled || loading;
  const useOutline =
    isDisabled && (outlineWhenDisabled ?? variant === "primary");

  type V = { background: string; textColor: Parameters<typeof Text>[0]["color"]; border?: string };

  const variantStyles: Record<ButtonVariant, V> = {
    primary: { background: theme.colors.green, textColor: "bone" },
    secondary: { background: theme.colors.boneShade, textColor: "ink" },
    tertiary: { background: "transparent", textColor: "greenSoft" },
    destructive: { background: theme.colors.terra, textColor: "bone" },
  };

  const v = variantStyles[variant];
  const isPrimary = variant === "primary";
  const isDestructive = variant === "destructive";

  const background = useOutline ? "transparent" : v.background;
  const textColor: Parameters<typeof Text>[0]["color"] = useOutline ? "inkFaint" : v.textColor;
  const border = useOutline
    ? { borderWidth: 1, borderColor: theme.colors.greenLine }
    : { borderWidth: 0 };

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      haptic="selection"
      feedback={variant === "tertiary" ? "opacity" : "scale"}
      style={[
        {
          height,
          backgroundColor: background,
          borderRadius: theme.radii.button,
          paddingHorizontal: theme.spacing.lg,
          alignItems: "center",
          justifyContent: "center",
          opacity: isDisabled && !useOutline ? 0.4 : 1,
          alignSelf: fullWidth ? "stretch" : "auto",
          borderCurve: "continuous",
          ...border,
        } as ViewStyle,
        style,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
        {loading ? (
          <ActivityIndicator
            color={
              isDestructive || isPrimary ? theme.colors.bone : theme.colors.green
            }
          />
        ) : leadingIcon ? (
          leadingIcon
        ) : null}
        <Text
          variant={size === "compact" ? "subhead" : "headline"}
          color={textColor}
        >
          {label}
        </Text>
        {trailingIcon ?? null}
      </View>
    </Pressable>
  );
}
