import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

function RootLayoutContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      {!user ? (
        // Auth flow (login/signup)
        <>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </>
      ) : !user.verified ? (
        // Verification flow - show verify screen
        <>
          <Stack.Screen name="verify" options={{ headerShown: false }} />
        </>
      ) : !user.profileCompleted ? (
        // Profile setup flow
        <>
          <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
        </>
      ) : (
        // Main app (discover, matches, profile)
        <>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
