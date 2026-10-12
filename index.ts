// The app's entry. Expo Router's own entry first, then the Android widget's
// background task, which has to be registered before anything renders.
import 'expo-router/entry';
import './src/lib/widget-task';
