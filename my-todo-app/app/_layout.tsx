import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { initializeDummyAuth } from '@/services/authService';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const hasNavigated = useRef(false);
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // 더미 유저 초기화
  useEffect(() => {
    initializeDummyAuth();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (!loading && loaded && !hasNavigated.current) {
      hasNavigated.current = true;
      
      if (user) {
        console.log('사용자 로그인됨, 메인 화면으로 이동');
        router.replace('/(tabs)');
      } else {
        console.log('사용자 로그아웃됨, 로그인 화면으로 이동');
        router.replace('/auth/login');
      }
    }
  }, [user, loading, loaded]);

  // Reset navigation flag when auth state changes
  useEffect(() => {
    if (!loading) {
      hasNavigated.current = false;
    }
  }, [user, loading]);

  if (!loaded || loading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
