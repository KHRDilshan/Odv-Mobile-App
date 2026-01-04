import React, { useEffect, useRef, useState } from "react";
import { View, Image, Text, Animated } from "react-native";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const llogo = require("../assets/icon2.png");

type SplashNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Splash"
>;

const Splash: React.FC = () => {
  const navigation = useNavigation<SplashNavigationProp>();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);
useEffect(() => {
    // Update progress state on animation change
    const listenerId = progressAnim.addListener(({ value }) => setProgress(value));

    // Animate progress from 0 to 1 over 2 seconds
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      // ✅ Navigate after animation finishes
      navigation.navigate("Login");
    });

    // Cleanup listener
    return () => progressAnim.removeListener(listenerId);
  }, [navigation, progressAnim]);


  return (
    <LinearGradient
      colors={["#040e16", "#061420"]} // gradient colors
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Image
            source={require("../assets/icon2.png")}
            style={{ width: "100%", height: 256 }}
            resizeMode="contain"
          />      <Text style={{ marginTop: 16, color: "#9ca3af" }}>POWERED BY ODV PROJECT LAB</Text>

      <View style={{ marginTop: 24 }}>
        <Progress.Bar
          progress={progress}
          animated={false}
          color="#2dab87"
          unfilledColor="#374151"
          borderWidth={0}
          height={10}
          width={200}
        />
      </View>
    </LinearGradient>
  );
};

export default Splash;
