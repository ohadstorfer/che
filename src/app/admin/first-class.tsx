import { router, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';

import { FirstClassLesson } from '@/components/first-class';

// ---------------------------------------------------------------------------
// Staff replay of the first class (the one inside onboarding), with the admin
// extras. ?part=slang (or culture, pancho) opens it at that part. Nothing is
// graded or saved.
// ---------------------------------------------------------------------------

export default function FirstClassAdmin() {
  const { part } = useLocalSearchParams<{ part?: string }>();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/admin'));
  return (
    <FirstClassLesson
      part={part}
      admin
      onClose={close}
      onFinish={() => Alert.alert('First class done', 'In onboarding, Continue goes to the day 1 streak screen.')}
    />
  );
}
