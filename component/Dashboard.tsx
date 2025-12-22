// import React, { useState } from "react";

// import { View, Text, ScrollView } from "react-native"
// import { BlurView } from "expo-blur"
// import { MaterialIcons } from "@expo/vector-icons"
// import Swiper from "react-native-swiper"
// import HistoryAnalysisCard from "../component/HistoryAnalysisCard"
// import Speedometer from "react-native-speedometer-chart";

// export default function DashboardScreen() {

//     const [value, setValue] = useState(0);

//   const increaseSpeed = () => {
//     setValue(prev => (prev + 10 <= 180 ? prev + 10 : 180)); // max 180
//   };

//   const decreaseSpeed = () => {
//     setValue(prev => (prev - 10 >= 0 ? prev - 10 : 0)); // min 0
//   };
//   return (
//     <ScrollView className="flex-1 bg-slate-950 px-5 pt-6">

//       {/* Header */}
//       <View className="rounded-2xl mb-5 overflow-hidden">
//         <BlurView intensity={40} tint="dark" style={{ padding: 16 }}>
//           <View className="flex-row justify-between items-center">
//             <View className="flex-row items-center gap-3">
//               <View className="bg-cyan-500 w-8 h-8 rounded-lg items-center justify-center">
//                 <MaterialIcons name="sensors" size={18} color="white" />
//               </View>
//               <View>
//                 <Text className="text-white font-bold">SensorDash</Text>
//                 <Text className="text-xs text-slate-400">LAB DS18B20</Text>
//               </View>
//             </View>
//             <MaterialIcons name="dark-mode" size={22} color="#94a3b8" />
//           </View>
//         </BlurView>
//   <View style={{ backgroundColor: "#1e293b", padding: 16, borderRadius: 20 }}>
//     <Speedometer
//       value={value}
//       totalValue={180}
//       size={250}
//       outerColor="#475569"
//       internalColor="#06b6d4"
//       showText
//       text={`${value} km/h`}
//       showLabels

//       labelStyle={{ color: "#facc15" }}
//       labelFormatter={(number) => `${number} km/h`}
//     />
//   </View>
//       </View>

//       {/* Charts */}
// <Swiper
//   height={300}
//   dotColor="#334155"
//   activeDotColor="#38bdf8"
//   showsPagination
// >
//   <HistoryAnalysisCard />
// </Swiper>

//     </ScrollView>
//   )
// }
import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Magnetometer } from 'expo-sensors';

export default function Compass() {
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState(null);

  const _slow = () => Magnetometer.setUpdateInterval(1000);
  const _fast = () => Magnetometer.setUpdateInterval(16);

  const _subscribe = () => {
    setSubscription(
      Magnetometer.addListener(result => {
        setData(result);
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Magnetometer:</Text>
      <Text style={styles.text}>x: {x}</Text>
      <Text style={styles.text}>y: {y}</Text>
      <Text style={styles.text}>z: {z}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
          <Text>{subscription ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
          <Text>Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_fast} style={styles.button}>
          <Text>Fast</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  text: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
});
