import { Platform, Switch as RNSwitch, type SwitchProps } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";

type Props = SwitchProps;

export function Switch({ value, onValueChange, ...rest }: Props) {
  const theme = useTheme();
  return (
    <RNSwitch
      value={value}
      onValueChange={(next) => {
        if (Platform.OS !== "web") {
          try {
            void Haptics.selectionAsync();
          } catch {}
        }
        onValueChange?.(next);
      }}
      trackColor={{
        false: theme.colors.greenLine,
        true: theme.colors.green,
      }}
      thumbColor={theme.colors.bone}
      ios_backgroundColor={theme.colors.greenLine}
      {...rest}
    />
  );
}
