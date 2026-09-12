import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { View } from 'react-native';

import { TabBar } from '@/components/tab-bar';
import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/theme';

export default function TabsLayout() {
  const { session, loading } = useAuth();
  if (!loading && !session) return <Redirect href="/login" />;

  return (
    // Opaque wrapper: the tab screens are flat `bg`, but the zone behind the
    // floating tab bar belongs to this layout, not the scenes — left
    // transparent it shows the root gradient, whose bottom is now the lilac
    // pool (the fade is inverted), seaming against the flat pages above it.
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
          title: 'Inicio',
          // Outline while resting, filled once selected — the weight change is
          // what separates the active tab, not just a hue swap.
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="words"
        options={{
          title: 'Palabras',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'albums' : 'albums-outline'} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}
