import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { View } from 'react-native';

import { TabBar } from '@/components/tab-bar';
import { useAuth } from '@/lib/auth';
import { usePremium } from '@/lib/premium';
import { colors } from '@/lib/theme';

export default function TabsLayout() {
  const { session, loading } = useAuth();
  const { limited, hardPaywall } = usePremium();
  if (!loading && !session) return <Redirect href="/welcome" />;
  // The store can switch the free tier off (offering metadata `hard_paywall`):
  // then a free account sees the paywall, with no way around it.
  if (limited && hardPaywall) return <Redirect href="/paywall?from=gate" />;

  return (
    // Opaque wrapper: the tab screens are flat oat `bg`, but the zone behind
    // the floating tab bar belongs to this layout, not the scenes — left
    // transparent it shows the root gradient, seaming against the flat pages
    // above it.
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Tabs
      // The stock bar is a flat slab welded to the bottom edge; ours is a
      // floating card that matches the rest of the app. See components/tab-bar.
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Opaque scenes: on web, inactive tab screens stay mounted in the DOM
        // and would bleed through a transparent background.
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Course',
          // Outline at rest, solid when selected: the glyph fills in as the
          // outlined pill slides behind it.
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="words"
        options={{
          title: 'Words',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'albums' : 'albums-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="culture"
        options={{
          title: 'Culture',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'cafe' : 'cafe-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="hablar"
        options={{
          title: 'Speaking',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}
