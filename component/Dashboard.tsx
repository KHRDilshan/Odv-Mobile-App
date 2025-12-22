import { View, Text, ScrollView } from "react-native"
import { BlurView } from "expo-blur"
import { MaterialIcons } from "@expo/vector-icons"
import Swiper from "react-native-swiper"

export default function DashboardScreen() {
  return (
    <ScrollView className="flex-1 bg-slate-950 px-5 pt-6">

      {/* Header */}
      <View className="rounded-2xl mb-5 overflow-hidden">
        <BlurView intensity={40} tint="dark" style={{ padding: 16 }}>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-3">
              <View className="bg-cyan-500 w-8 h-8 rounded-lg items-center justify-center">
                <MaterialIcons name="sensors" size={18} color="white" />
              </View>
              <View>
                <Text className="text-white font-bold">SensorDash</Text>
                <Text className="text-xs text-slate-400">LAB DS18B20</Text>
              </View>
            </View>
            <MaterialIcons name="dark-mode" size={22} color="#94a3b8" />
          </View>
        </BlurView>
      </View>

      {/* Charts */}
      <Swiper
        height={220}
        showsPagination
        dotColor="#334155"
        activeDotColor="#38bdf8"
      >
        <View className="bg-slate-900 rounded-2xl p-4 justify-center items-center">
          <Text className="text-white">Chart Placeholder</Text>
        </View>
      </Swiper>

    </ScrollView>
  )
}
