import { useRouter } from "expo-router";
import { View, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";
import { Button, Eyebrow, Screen, Text } from "@/components/ui";

export default function NotFound() {
  const router = useRouter();
  const theme = useTheme();
  return (
    <Screen background="primary" padded={false} scroll={false}>
      <View
        style={
          {
            flex: 1,
            paddingHorizontal: theme.screenPadding.primary,
            paddingTop: 4,
            paddingBottom: 28,
            alignItems: "center",
            justifyContent: "center",
            gap: theme.spacing.md,
          } as ViewStyle
        }
      >
        <Eyebrow color="greenSoft">404</Eyebrow>
        <Text variant="largeTitle" color="green" align="center">
          Página no encontrada
        </Text>
        <Text variant="subhead" color="inkSoft" align="center">
          La ruta que buscás no existe.
        </Text>
        <View style={{ height: theme.spacing.md }} />
        <Button
          label="Volver al inicio"
          onPress={() => router.replace("/home")}
          fullWidth={false}
        />
      </View>
    </Screen>
  );
}
