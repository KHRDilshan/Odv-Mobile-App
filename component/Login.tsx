import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  BackHandler,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "./types";
import { environment } from "@/environment/environment";

type LoginNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

interface LoginProps {
  navigation: LoginNavigationProp;
}

const Login: React.FC<LoginProps> = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const showAlert = (message: string) => {
    setError(message);
    setShowError(true);
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!username || !password) {
      showAlert("Username and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${environment.API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        showAlert(data.error || "Login failed");
        return;
      }
      await AsyncStorage.setItem(
        "loginData",
        JSON.stringify({ username, password })
      );

      navigation.navigate("MainDrawer", { screen: "Dashboard" });
    } catch (err) {
      showAlert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const backAction = () => {
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);
  return (
    <LinearGradient
      colors={["#040e16", "#061420"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <StatusBar barStyle="light-content" />

          <Image
            source={require("../assets/icon2.png")}
            style={{ width: "100%", height: 256 }}
            resizeMode="contain"
          />

          <Text
            style={{
              color: "#fff",
              fontSize: 28,
              fontWeight: "bold",
              letterSpacing: 2,
            }}
          >
            ODV - Project LAB
          </Text>
          <Text style={{ color: "#2dab87", fontSize: 22, fontWeight: "bold" }}>
            DS18B20
          </Text>

          <LinearGradient
            colors={["#040e16", "#071927"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderWidth: 2,
              borderColor: "#0b1d2c",
              width: "90%",
              borderRadius: 24,
              padding: 24,
              marginTop: 24,
            }}
          >
            {/* USERNAME */}
            <Text
              className="text-base"
              style={{ color: "#9ca3af", fontSize: 12, letterSpacing: 1 }}
            >
              USER NAME
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#374151",
                borderRadius: 16,
                paddingHorizontal: 12,
                height: 48,
                marginTop: 8,
              }}
            >
              <Ionicons name="person" size={18} color="#9ca3af" />
              <TextInput
                className="text-base"
                placeholder="Enter username"
                placeholderTextColor="#6b7280"
                style={{ flex: 1, color: "#fff", marginLeft: 8 }}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <Text
              className="text-base"
              style={{
                color: "#9ca3af",
                fontSize: 12,
                letterSpacing: 1,
                marginTop: 16,
              }}
            >
              PASSWORD
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#374151",
                borderRadius: 16,
                paddingHorizontal: 12,
                height: 48,
                marginTop: 8,
              }}
            >
              <Ionicons name="lock-closed" size={18} color="#9ca3af" />

              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#6b7280"
                secureTextEntry={!showPassword} // 👈 toggle here
                style={{ flex: 1, color: "#fff", marginLeft: 8 }}
                value={password}
                onChangeText={setPassword}
                className="text-base"
              />

              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={{
                marginTop: 24,
                backgroundColor: "#2dab87",
                borderRadius: 999,
                height: 56,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="settings" size={20} color="#fff" />
                  <Text
                    style={{ color: "#fff", fontWeight: "bold", marginLeft: 8 }}
                    className="text-base"
                  >
                    LOGING TO SESSION
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showError}
        transparent
        animationType="fade"
        onRequestClose={() => setShowError(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#071927",
              borderColor: "#2dab87",
              borderWidth: 1,
              padding: 20,
              borderRadius: 16,
              width: "80%",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#2dab87",
                fontWeight: "bold",
                textAlign: "center",
                fontSize: 16,
              }}
            >
              {error}
            </Text>

            <TouchableOpacity
              onPress={() => setShowError(false)}
              style={{
                marginTop: 16,
                backgroundColor: "#2dab87",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default Login;
