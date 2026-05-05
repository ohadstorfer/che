import { View, type ViewStyle } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useTheme } from "@/lib/theme";
import { Text } from "./Text";
import { Pressable } from "./Pressable";

type Props = {
  title: string;
  subtitle?: string;
  leadingIcon?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  alignTitle?: "center" | "left";
};

export function ListRow({
  title,
  subtitle,
  leadingIcon,
  trailing,
  onPress,
  showChevron,
  destructive,
  isLast,
  alignTitle = "left",
}: Props) {
  const theme = useTheme();

  const content = (
    <View
      style={
        {
          minHeight: 44,
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: subtitle ? 12 : 10,
          gap: theme.spacing.sm + 4,
        } as ViewStyle
      }
    >
      {leadingIcon ? <View>{leadingIcon}</View> : null}
      <View style={{ flex: 1, alignItems: alignTitle === "center" ? "center" : "stretch" }}>
        <Text
          variant="body"
          color={destructive ? "terra" : "ink"}
          align={alignTitle === "center" ? "center" : "left"}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" color="inkSoft" style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ?? null}
      {showChevron && !trailing ? (
        <ChevronRight size={16} color={theme.colors.inkFaint} strokeWidth={2} />
      ) : null}
    </View>
  );

  return (
    <View>
      {onPress ? (
        <Pressable onPress={onPress} feedback="opacity" haptic="selection">
          {content}
        </Pressable>
      ) : (
        content
      )}
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

type GroupProps = {
  header?: string;
  footer?: string;
  children: React.ReactNode;
};

export function ListGroup({ header, footer, children }: GroupProps) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      {header ? (
        <Text
          variant="caption2"
          color="greenSoft"
          uppercase
          style={{ letterSpacing: 2, fontWeight: "500" }}
        >
          {header}
        </Text>
      ) : null}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: theme.colors.greenLine,
        }}
      >
        {children}
      </View>
      {footer ? (
        <Text variant="footnote" color="inkFaint">
          {footer}
        </Text>
      ) : null}
    </View>
  );
}
