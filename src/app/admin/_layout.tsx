import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The admin dashboard (docs/course-spec.md §5): reviewers and admins only.
// RLS is what actually protects the content; this only keeps learners from
// landing on screens that would show them nothing.
// ---------------------------------------------------------------------------
export default function AdminLayout() {
  const { session, profile, loading } = useAuth();
  if (loading || (session && !profile)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!session) return <Redirect href="/login" />;
  if (profile?.role === 'student') return <Redirect href="/home" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
