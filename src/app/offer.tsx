import { Redirect } from 'expo-router';

// posta://offer — the day-30 win-back mail (supabase/functions/winback-email):
// the paywall opens on the one-time 40% offer.
export default function Offer() {
  return <Redirect href={{ pathname: '/paywall', params: { from: 'email', offer: 'winback' } }} />;
}
