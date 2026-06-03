import { LogBox } from 'react-native';

// Must run before moti is imported (its barrel re-exports the legacy
// react-native SafeAreaView, which warns on load). Our own code uses
// react-native-safe-area-context. Imported first in the root layout.
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);
