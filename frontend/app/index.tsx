import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to auth flow - the _layout will handle routing based on user state
  return <Redirect href="/(auth)/login" />;
}
