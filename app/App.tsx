import React, { useEffect, useState } from "react";
import { Alert, BackHandler, Text, View, Dimensions, TextInput } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider, useSelector } from "react-redux";
import NetInfo from "@react-native-community/netinfo";
import { useTranslation } from "react-i18next";
import { LogBox } from "react-native";

import { navigationRef } from "../navigationRef";

import { NativeWindStyleSheet } from "nativewind";
import CustomDrawerContent from '@/Items/CustomDrawerContent';
import store, { RootState } from "@/services/store";
import DashboardScreen from "@/component/Dashboard";
import AnalyzeScreen from "@/component/Analyze";

LogBox.ignoreAllLogs(true);
NativeWindStyleSheet.setOutput({ default: "native" });

(Text as any).defaultProps = { ...(Text as any).defaultProps, allowFontScaling: false };
(TextInput as any).defaultProps = { ...(TextInput as any).defaultProps, allowFontScaling: false };

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

// Example Screen
function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-blue-100">
      <Text className="text-2xl font-bold text-blue-800">Home Screen</Text>
    </View>
  );
}


function MainDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: "front", 
               drawerStyle: {
      width: "80%"
    },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      {/* <Drawer.Screen name="Home" component={HomeScreen} /> */}
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="Analyze" component={AnalyzeScreen} options={{ drawerItemStyle: { display: "none" } }}/>
    </Drawer.Navigator>
  );
}


function AppContent() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [isOfflineAlertShown, setIsOfflineAlertShown] = useState(false);

  // Internet Check
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (!state.isConnected && !isOfflineAlertShown) {
        setIsOfflineAlertShown(true);
        Alert.alert(
          t("Main.No Internet Connection"),
          t("Main.Please turn on mobile data or Wi-Fi to continue."),
          [
            {
              text: "OK",
              onPress: () => setIsOfflineAlertShown(false),
            },
          ]
        );
      }
    });
    return () => unsubscribeNetInfo();
  }, [isOfflineAlertShown]);

  // Back Button Handler
  useEffect(() => {
    const backAction = () => {
      if (!navigationRef.isReady()) return false;
      const currentRouteName = navigationRef.getCurrentRoute()?.name ?? "";
      if (currentRouteName === "Dashboard") {
        BackHandler.exitApp();
        return true;
      } else if (navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, paddingBottom: insets.bottom, backgroundColor: "#fff" }}
        edges={["top", "right", "left"]}
      >
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainDrawer" component={MainDrawer} />
           
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
          <AppContent />
      </Provider>
    </SafeAreaProvider>
  );
}
