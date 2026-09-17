import { Redirect } from 'expo-router';

// The lexicon is now the words screen, where every word can be edited.
export default function AdminLexicon() {
  return <Redirect href="/admin/words" />;
}
