import { View } from "react-native";
import { useTheme } from "@/lib/theme";
import { Eyebrow, Text } from "@/components/ui";
import { Pressable } from "@/components/ui/Pressable";

type Props = {
  title: string;
  date: string;
  preview: string;
  onPress: () => void;
  isLast?: boolean;
};

export function NoteRow({ title, date, preview, onPress, isLast }: Props) {
  const theme = useTheme();
  return (
    <View>
      <Pressable
        onPress={onPress}
        feedback="opacity"
        haptic="selection"
        style={{
          paddingVertical: theme.spacing.sm + 4,
          gap: 4,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text variant="body" color="ink" numberOfLines={1} style={{ flex: 1, paddingRight: theme.spacing.sm }}>
            {title}
          </Text>
          <Eyebrow color="inkFaint">{date}</Eyebrow>
        </View>
        <Text variant="subhead" color="inkSoft" numberOfLines={1}>
          {preview}
        </Text>
      </Pressable>
      {!isLast ? (
        <View
          style={{
            height: 1,
            backgroundColor: theme.colors.greenLine,
          }}
        />
      ) : null}
    </View>
  );
}
