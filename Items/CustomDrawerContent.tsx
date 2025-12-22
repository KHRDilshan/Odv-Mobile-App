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
import { useDrawerStatus } from '@react-navigation/drawer';

import { RootStackParamList } from "@/component/types";
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
type CustomDrawerNavigationProp = NativeStackNavigationProp<RootStackParamList> & DrawerNavigationProp< RootStackParamList>;


export default function CustomDrawerContent(props: any) {
  const navigation = props.navigation;
    const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLanguageDropdownOpen, setLanguageDropdownOpen] =
    useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  console.log("se lng", selectedLanguage)
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(
    null
  );
  const [isComplaintDropdownOpen, setComplaintDropdownOpen] =
    useState<boolean>(false);

  const userProfile = useSelector((state: RootState) => state.auth.userProfile);


  const isDrawerOpen = useDrawerStatus() === 'open';



  useEffect(() => {
    setLanguageDropdownOpen(false);
    setComplaintDropdownOpen(false);
  }, [isDrawerOpen]);



  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
    await new Promise((resolve) => {
      dispatch(logoutUser());
      setTimeout(resolve, 100); // small delay for Redux to finish
    });      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={{ padding: 0 }}>
        
          <DrawerItemList {...props} />

          <View className="flex-1 p-4 ">
            <View className="bg-[#D2D2D2] my-2 h-0.5  " />



        
        </View>
        </View>
      </DrawerContentScrollView>
      <View className="p-4 ml-2 border-t border-gray-300">
        <TouchableOpacity
          className="flex-row items-center py-3"
          onPress={handleLogout}
        >
                        <View className="bg-[#FFF2EE] rounded-full p-1">

          <Ionicons name="log-out-outline" size={20} color="red" />
          </View>
          <Text className="flex-1 text-lg ml-2 text-red-500">
           Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
