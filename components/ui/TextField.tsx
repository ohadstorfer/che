import { forwardRef, useState } from "react";
import {
  Platform,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { useTheme } from "@/lib/theme";
import { Text } from "./Text";

export type TextFieldProps = TextInputProps & {
  label?: string;
  helperText?: string;
  errorText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  multilineMinHeight?: number;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    helperText,
    errorText,
    leadingIcon,
    trailingIcon,
    containerStyle,
    style,
    onFocus,
    onBlur,
    multiline,
    multilineMinHeight = 120,
    placeholderTextColor,
    ...rest
  },
  ref,
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const showError = Boolean(errorText);

  const borderColor = showError
    ? theme.colors.error
    : focused
      ? theme.colors.primary
      : "transparent";

  return (
    <View style={[{ gap: theme.spacing.xs }, containerStyle]}>
      {label ? (
        <Text variant="footnote" color="labelSecondary" weight="medium">
          {label}
        </Text>
      ) : null}
      <View
        style={
          {
            flexDirection: "row",
            alignItems: multiline ? "flex-start" : "center",
            backgroundColor: theme.colors.backgroundSecondary,
            borderRadius: theme.radii.input,
            borderWidth: 2,
            borderColor,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: multiline ? 12 : 0,
            minHeight: multiline ? multilineMinHeight : 44,
            borderCurve: "continuous",
          } as ViewStyle
        }
      >
        {leadingIcon ? (
          <View style={{ marginRight: theme.spacing.sm, paddingTop: multiline ? 2 : 0 }}>{leadingIcon}</View>
        ) : null}
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
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          placeholderTextColor={placeholderTextColor ?? theme.colors.labelTertiary}
          style={[
            {
              flex: 1,
              color: theme.colors.label,
              fontSize: theme.typography.body.fontSize,
              lineHeight: theme.typography.body.lineHeight,
              fontFamily: theme.fontFamily,
              paddingVertical: multiline ? 0 : 10,
            },
            Platform.OS === "web" ? ({ outlineStyle: "none" } as never) : null,
            style,
          ]}
          {...rest}
        />
        {trailingIcon ? (
          <View style={{ marginLeft: theme.spacing.sm, paddingTop: multiline ? 2 : 0 }}>{trailingIcon}</View>
        ) : null}
      </View>
      {showError ? (
        <Text variant="caption1" color="error">
          {errorText}
        </Text>
      ) : helperText ? (
        <Text variant="caption1" color="labelSecondary">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});
