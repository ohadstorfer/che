import { forwardRef, useState } from "react";
import {
  Platform,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { useTheme, type TypeVariant } from "@/lib/theme";

export type UnderlineInputProps = TextInputProps & {
  variant?: Extract<TypeVariant, "title3" | "callout" | "body" | "subhead">;
  weight?: "regular" | "medium" | "semibold";
  color?: "green" | "ink";
  containerStyle?: StyleProp<ViewStyle>;
  leadingIcon?: React.ReactNode;
};

const weightMap = { regular: "400" as const, medium: "500" as const, semibold: "600" as const };

export const UnderlineInput = forwardRef<TextInput, UnderlineInputProps>(function UnderlineInput(
  {
    variant = "title3",
    weight = "medium",
    color = "green",
    containerStyle,
    leadingIcon,
    style,
    onFocus,
    onBlur,
    placeholderTextColor,
    ...rest
  },
  ref,
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const t = theme.typography[variant];

  const borderColor = focused ? theme.colors.green : theme.colors.greenLine;
  const borderWidth = focused ? 1.5 : 1;
  const textColor = color === "green" ? theme.colors.green : theme.colors.ink;

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          borderBottomColor: borderColor,
          borderBottomWidth: borderWidth,
          paddingTop: 6,
          paddingBottom: 10 - (focused ? 0.5 : 0),
          gap: theme.spacing.sm,
        },
        containerStyle,
      ]}
    >
      {leadingIcon}
      <TextInput
        ref={ref}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        placeholderTextColor={placeholderTextColor ?? theme.colors.inkFaint}
        style={[
          {
            flex: 1,
            color: textColor,
            fontSize: t.fontSize,
            lineHeight: t.lineHeight,
            fontWeight: weightMap[weight],
            letterSpacing: t.letterSpacing ?? 0,
            fontFamily: theme.fontFamily,
            padding: 0,
          },
          Platform.OS === "web" ? ({ outlineStyle: "none" } as never) : null,
          style,
        ]}
        {...rest}
      />
    </View>
  );
});
