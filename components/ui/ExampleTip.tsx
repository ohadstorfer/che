import {
  Modal,
  Pressable as RNPressable,
  View,
  type GestureResponderEvent,
  type ViewStyle,
} from "react-native";
import { useTheme } from "@/lib/theme";
import { Button } from "./Button";
import { Eyebrow } from "./Eyebrow";
import { Text } from "./Text";

type Props = {
  visible: boolean;
  instruction?: string;
  example: string;
  onClose: () => void;
};

export function ExampleTip({ visible, instruction, example, onClose }: Props) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <RNPressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.lg,
        }}
      >
        <View
          onStartShouldSetResponder={() => true}
          onResponderRelease={(e: GestureResponderEvent) => e.stopPropagation?.()}
          style={
            {
              width: "100%",
              maxWidth: 360,
              backgroundColor: theme.colors.bone,
              borderRadius: theme.radii.card,
              borderWidth: 1,
              borderColor: theme.colors.greenLine,
              padding: theme.spacing.lg,
              gap: theme.spacing.md,
            } as ViewStyle
          }
        >
          <View style={{ gap: theme.spacing.xs }}>
            <Eyebrow color="greenSoft">EJEMPLO</Eyebrow>
            {instruction ? (
              <Text variant="subhead" color="inkSoft">
                {instruction}
              </Text>
            ) : null}
          </View>
          <Text variant="bodyEmphasized" color="green">
            {example}
          </Text>
          <Button label="Cerrar" variant="tertiary" onPress={onClose} />
        </View>
      </RNPressable>
    </Modal>
  );
}
