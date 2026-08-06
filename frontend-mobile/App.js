import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import LandingScreen from "./src/screens/LandingScreen";
import ReportsListScreen from "./src/screens/ReportsListScreen";
import CreateReportScreen from "./src/screens/CreateReportScreen";
import ReportDetailScreen from "./src/screens/ReportDetailScreen";
import { theme } from "./src/theme/lapormasTheme";

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.blue,
    background: theme.base,
    card: theme.mantle,
    text: theme.text,
    border: theme.surface1,
    notification: theme.pink,
  },
};

function RootNavigator() {
  const { token, ready } = useAuth();

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={theme.blue} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      key={token ? "app" : "auth"}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.base },
        animation: "slide_from_right",
      }}
    >
      {token ? (
        <>
          <Stack.Screen name="ReportsList" component={ReportsListScreen} />
          <Stack.Screen
            name="CreateReport"
            component={CreateReportScreen}
            options={{
              headerShown: true,
              title: "Buat laporan",
              headerStyle: { backgroundColor: theme.mantle },
              headerTintColor: theme.blue,
              headerTitleStyle: { color: theme.text, fontWeight: "700" },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="ReportDetail"
            component={ReportDetailScreen}
            options={{
              headerShown: true,
              title: "Detail laporan",
              headerStyle: { backgroundColor: theme.mantle },
              headerTintColor: theme.blue,
              headerTitleStyle: { color: theme.text, fontWeight: "700" },
              headerShadowVisible: false,
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              headerShown: true,
              title: "Daftar",
              headerStyle: { backgroundColor: theme.mantle },
              headerTintColor: theme.blue,
              headerTitleStyle: { color: theme.text, fontWeight: "700" },
              headerShadowVisible: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: theme.base,
    alignItems: "center",
    justifyContent: "center",
  },
});
