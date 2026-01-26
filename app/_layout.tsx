import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from './utils/AuthContext';

// 🎨 Custom themes
const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#CC561E',
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#CC561E',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider
        value={colorScheme === 'light' ? CustomLightTheme : CustomDarkTheme}
      >
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', title: 'Modal' }}
          />
          <Stack.Screen
            name="category/[CatId]"
            options={{ title: 'Category', headerTintColor: '#fff', headerStyle: { backgroundColor: '#CC561E' } }}
          />
          <Stack.Screen
            name="detailPost/[id]"
            options={{ title: 'Recipe Detail', headerTintColor: '#fff', headerStyle: { backgroundColor: '#CC561E' } }}
          />
        </Stack>

        {/* Optional: status bar color */}
        <StatusBar style="light" backgroundColor="#CC561E" />
      </ThemeProvider>
    </AuthProvider>
  );
}
