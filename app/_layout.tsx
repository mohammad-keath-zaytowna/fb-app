import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import ToastManager from 'expo-react-native-toastify'

import { useColorScheme } from "@/hooks/use-color-scheme";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import "@/global.css";

import "@/lib/i18n";
import { DirectionProvider } from "@/components/direction-provider";

export const unstable_settings = {
  initialRouteName: "(auth)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <DirectionProvider>
      <GluestackUIProvider mode="light">
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <AuthProvider>
            <CartProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen
                  name="(auth)"
                  options={{
                    headerShown: false,
                    // Prevent going back to auth after login
                    gestureEnabled: false,
                  }}
                />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="products" />
                <Stack.Screen name="orders" />
              </Stack>
            </CartProvider>
            <ToastManager />
            <StatusBar style="auto" />
          </AuthProvider>
        </ThemeProvider>
      </GluestackUIProvider>
    </DirectionProvider>
  );
}
