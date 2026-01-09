import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState, useContext } from "react";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Ionicons,
  Entypo,
  FontAwesome6,
  FontAwesome,
} from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/services/store";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/authSlice";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useDrawerStatus } from "@react-navigation/drawer";

import { RootStackParamList } from "@/component/types";
import { LinearGradient } from "expo-linear-gradient";
interface ProfileData {
  firstName: string;
  lastName: string;
  profileImg: string;
  firstNameSinhala: string;
  lastNameSinhala: string;
  firstNameTamil: string;
  lastNameTamil: string;
  empId: string;
}
type CustomDrawerNavigationProp =
  NativeStackNavigationProp<RootStackParamList> &
    DrawerNavigationProp<RootStackParamList>;

export default function CustomDrawerContent(props: any) {
  const navigation = props.navigation;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLanguageDropdownOpen, setLanguageDropdownOpen] =
    useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  console.log("se lng", selectedLanguage);
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(
    null
  );
  const [isComplaintDropdownOpen, setComplaintDropdownOpen] =
    useState<boolean>(false);

  const userProfile = useSelector((state: RootState) => state.auth.userProfile);

  const isDrawerOpen = useDrawerStatus() === "open";

  useEffect(() => {
    setLanguageDropdownOpen(false);
    setComplaintDropdownOpen(false);
  }, [isDrawerOpen]);

  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      await new Promise((resolve) => {
        setTimeout(resolve, 100); // small delay for Redux to finish
      });
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <LinearGradient
      colors={["#040e16", "#061420"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      <View style={{ flex: 1 }}>
        <DrawerContentScrollView {...props}>
          <View style={{ padding: 0 }}>
            <DrawerItemList {...props} />
            <View className="flex-row items-center gap-3">
              <View>
                <Text className="text-base font-bold text-white">
                  ODV - Project LAB
                </Text>
                <Text className="text-sm text-white">DS18B20</Text>
              </View>
            </View>
            <TouchableOpacity
              className={`p-4 rounded-md mt-6 mb-2 ${
                navigation.getState().routes[navigation.getState().index]
                  .name === "Dashboard"
                  ? "bg-[#09253a]"
                  : ""
              }`}
              onPress={() => navigation.navigate("Dashboard")}
            >
              <Text className="text-white font-semibold">Dashboard</Text>
            </TouchableOpacity>
{/* 
            <TouchableOpacity
              className={`p-4 rounded-md mt-6 mb-2 ${
                navigation.getState().routes[navigation.getState().index]
                  .name === "Analyze"
                  ? "bg-[#09253a]"
                  : ""
              }`}
              onPress={() => navigation.navigate("Analyze")}
            >
              <Text className="text-white font-semibold">Analyze</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`p-4 rounded-md mt-6 mb-2 ${
                navigation.getState().routes[navigation.getState().index]
                  .name === "ChartOption2"
                  ? "bg-[#09253a]"
                  : ""
              }`}
              onPress={() => navigation.navigate("ChartOption2")}
            >
              <Text className="text-white font-semibold">Analyze2</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              className={`p-4 rounded-md mt-6 mb-2 ${
                navigation.getState().routes[navigation.getState().index]
                  .name === "ChartOption3"
                  ? "bg-[#09253a]"
                  : ""
              }`}
              onPress={() => navigation.navigate("ChartOption3")}
            >
              <Text className="text-white font-semibold">Analyze</Text>
            </TouchableOpacity>

            <View className="flex-1 p-4 "></View>
          </View>
        </DrawerContentScrollView>
        <View className="p-4  border-t border-gray-600">
          <TouchableOpacity
            className="flex-row items-center py-3"
            onPress={handleLogout}
          >
            <View className="bg-[#10b981] rounded-full p-1">
              <Ionicons name="log-out-outline" size={20} color="white" />
            </View>
            <Text className="flex-1 text-lg ml-2 text-white font-semibold">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}
