import { Modal, Pressable as RNPressable, View, type GestureResponderEvent, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";
import { Button } from "./Button";
import { Text } from "./Text";

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Sí",
  cancelLabel = "Cancelar",
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <RNPressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.lg,
        }}
      >
        <View
          // Stop the backdrop press from firing when tapping the card itself.
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
            <Text variant="title3" color="green" align="center">
              {title}
            </Text>
            {message ? (
              <Text variant="subhead" color="inkSoft" align="center">
                {message}
              </Text>
            ) : null}
          </View>
          <View style={{ gap: theme.spacing.sm }}>
            <Button
              label={confirmLabel}
              variant={destructive ? "destructive" : "primary"}
              onPress={onConfirm}
            />
            <Button label={cancelLabel} variant="tertiary" onPress={onCancel} />
          </View>
        </View>
      </RNPressable>
    </Modal>
  );
}
