import { Redirect, useLocalSearchParams } from 'expo-router';

// posta://redeem?code=POSTA50 — a discount code from a link (an influencer, an
// email): the paywall opens with it, and takes it from there.
export default function Redeem() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  return <Redirect href={{ pathname: '/paywall', params: { from: 'home', code: code ?? '' } }} />;
}
