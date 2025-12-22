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
// import React, { useState, useEffect } from "react";
// import { View, Text, ScrollView, TouchableOpacity, useColorScheme, Dimensions } from "react-native";
// import { MaterialIcons } from "@expo/vector-icons";
// import Swiper from "react-native-swiper";
// import { LineChart } from "react-native-chart-kit";
// import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from "react-native-svg";
// import { SafeAreaView } from "react-native-safe-area-context";

// const screenWidth = Dimensions.get("window").width - 40; // padding from main view

// export default function Dashboard() {
//   const colorScheme = useColorScheme();
//   const [isDark, setIsDark] = useState(colorScheme === "dark");

//   const labels = ['21:52','21:53','21:54','21:55','21:56','21:57'];
//   const chartData = {
//     labels,
//     datasets: [
//       {
//         data: [23, 24, 23.5, 24.2, 24.5, 24.5],
//         color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
//         strokeWidth: 2,
//       },
//     ],
//   };

//   const gradientColors = ["rgba(16, 185, 129, 0.5)", "rgba(16, 185, 129, 0)"];

//   const [needleDeg, setNeedleDeg] = useState(-90);

//   useEffect(() => {
//     // Animate needle after mount
//     setTimeout(() => {
//       const value = 24.5;
//       const deg = -90 + (value / 100) * 180;
//       setNeedleDeg(deg);
//     }, 500);
//   }, []);

//   return (
//       <SafeAreaView className={`${isDark ? "bg-slate-950" : "bg-gray-100"} flex-1`}>
//         {/* Header */}
//         <View className="flex-row justify-between items-center p-4 glass-card rounded-b-xl">
//           <View className="flex-row items-center gap-3">
//             <View className="bg-gradient-to-tr from-cyan-500 to-blue-500 w-10 h-10 rounded-lg flex items-center justify-center">
//               <MaterialIcons name="sensors" size={24} color="#fff" />
//             </View>
//             <View>
//               <Text className="text-base font-bold text-gray-900 dark:text-white">SensorDash</Text>
//               <Text className="text-xs text-gray-500 dark:text-gray-400">LAB DS18B20</Text>
//             </View>
//           </View>
//           <TouchableOpacity onPress={() => setIsDark(!isDark)}>
//             <MaterialIcons
//               name={isDark ? "dark-mode" : "light-mode"}
//               size={24}
//               color={isDark ? "#fff" : "#000"}
//             />
//           </TouchableOpacity>
//         </View>

//         <ScrollView contentContainerStyle={{ padding: 20 }} className="space-y-6">
//           {/* Gauge Section */}
//           <View className="bg-slate-800 dark:bg-gray-200 rounded-3xl p-6 relative overflow-hidden">
//             <Svg width={screenWidth} height={120} viewBox="0 0 200 110">
//               <Defs>
//                 <LinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
//                   <Stop offset="0%" stopColor="#38bdf8" />
//                   <Stop offset="50%" stopColor="#818cf8" />
//                   <Stop offset="100%" stopColor="#f472b6" />
//                 </LinearGradient>
//               </Defs>
//               <Path
//                 d="M 20 100 A 80 80 0 0 1 180 100"
//                 stroke={isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}
//                 strokeWidth={16}
//                 fill="none"
//                 strokeLinecap="round"
//               />
//               <Path
//                 d="M 20 100 A 80 80 0 0 1 180 100"
//                 stroke="url(#gaugeGradient)"
//                 strokeWidth={16}
//                 strokeDasharray="251"
//                 strokeDashoffset={251 - (24.5 / 100) * 251}
//                 fill="none"
//                 strokeLinecap="round"
//               />
//               {/* Needle */}
//               <G rotation={needleDeg} origin="100,100">
//                 <Path d="M100 100 L102 30 L98 30 Z" fill="#000" />
//               </G>
//             </Svg>
//             <Text className="text-center text-5xl font-bold text-cyan-400 mt-2">24.5°C</Text>
//           </View>

//           {/* Cards */}
//           <View className="grid grid-cols-2 gap-3">
//             <View className="col-span-2 bg-emerald-500/10 p-4 rounded-2xl flex-row justify-between items-center border-l-4 border-emerald-500">
//               <View className="flex-row items-center gap-3">
//                 <MaterialIcons name="power-settings-new" size={24} color="#10b981" />
//                 <View>
//                   <Text className="font-bold text-gray-900 dark:text-white">System Status</Text>
//                   <Text className="text-xs text-gray-500 dark:text-gray-400">Monitoring Active</Text>
//                 </View>
//               </View>
//               <View className="w-10 h-5 bg-emerald-500 rounded-full relative shadow-inner">
//                 <View className="absolute right-1 top-1 bottom-1 w-3 h-3 bg-white rounded-full shadow-sm" />
//               </View>
//             </View>
//           </View>

//           {/* Swiper Charts */}
//           <Swiper showsPagination={true} height={250} style={{ marginTop: 20 }}>
//             <View className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl">
//               <LineChart
//                 data={chartData}
//                 width={320} // from react-native
//                 height={200}
//                 chartConfig={{
//                   backgroundColor: isDark ? "#0f172a" : "#fff",
//                   backgroundGradientFrom: isDark ? "#0f172a" : "#fff",
//                   backgroundGradientTo: isDark ? "#0f172a" : "#fff",
//                   decimalPlaces: 1,
//                   color: (opacity = 1) => `rgba(16,185,129,${opacity})`,
//                   labelColor: (opacity = 1) => (isDark ? "#94a3b8" : "#64748b"),
//                   propsForDots: { r: "3", strokeWidth: "2", stroke: "#10b981" },
//                 }}
//                 bezier
//                 style={{ borderRadius: 16 }}
//               />
//             </View>
//           </Swiper>
//         </ScrollView>
//       </SafeAreaView>
//   );
// }


// import React, { useState, useEffect } from "react";
// import { View, Text, ScrollView, TouchableOpacity, useColorScheme, Dimensions } from "react-native";
// import { MaterialIcons } from "@expo/vector-icons";
// import Swiper from "react-native-swiper";
// import { LineChart } from "react-native-chart-kit";
// import Svg, { Path, Defs, LinearGradient, Stop, G, Circle } from "react-native-svg";
// import { SafeAreaView } from "react-native-safe-area-context";

// const screenWidth = Dimensions.get("window").width - 40;

// export default function Dashboard() {
//   const colorScheme = useColorScheme();
//   const [isDark, setIsDark] = useState(colorScheme === "dark");

//   // --- Realtime Data States ---
//   const [localTemp, setLocalTemp] = useState(24.5);
//   const [chartData, setChartData] = useState({
//     labels: ['21:52','21:53','21:54','21:55','21:56','21:57'],
//     datasets: [
//       { data: [60, 24, 23.5, 24.2, 24.5, 24.5] }
//     ]
//   });

//   const [needleDeg, setNeedleDeg] = useState(-190);

//   // --- Simulate Realtime Updates ---
//   useEffect(() => {
//     const interval = setInterval(() => {
//       // Generate new random value (replace this with your sensor API / Firebase)
//       const newTemp = +(22 + Math.random() * 5).toFixed(1);
//       setLocalTemp(newTemp);

//       // Update chart data: push new value and remove oldest
//       setChartData(prev => {
//         const newDataset = [...prev.datasets[0].data.slice(1), newTemp];
//         const newLabels = [...prev.labels.slice(1), new Date().toLocaleTimeString().slice(3,8)];
//         return { labels: newLabels, datasets: [{ data: newDataset }] };
//       });

//       // Update needle
//       const deg = -90 + (newTemp / 100) * 180;
//       setNeedleDeg(deg);
//     }, 2000); // update every 2 seconds

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <SafeAreaView className={`${isDark ? "bg-slate-950" : "bg-gray-100"} flex-1`}>
//       {/* Header */}
//       <View className="flex-row justify-between items-center p-4 bg-white/10 dark:bg-gray-800 rounded-b-xl">
//         <View className="flex-row items-center gap-3">
//           <View className="bg-gradient-to-tr from-cyan-500 to-blue-500 w-10 h-10 rounded-lg flex items-center justify-center">
//             <MaterialIcons name="sensors" size={24} color="#fff" />
//           </View>
//           <View>
//             <Text className="text-base font-bold text-gray-900 dark:text-white">SensorDash</Text>
//             <Text className="text-xs text-gray-500 dark:text-gray-400">LAB DS18B20</Text>
//           </View>
//         </View>
//         <TouchableOpacity onPress={() => setIsDark(!isDark)}>
//           <MaterialIcons name={isDark ? "dark-mode" : "light-mode"} size={24} color={isDark ? "#fff" : "#000"} />
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={{ padding: 20 }} className="space-y-6">
//         {/* Gauge Section */}
//         <View className="bg-slate-800 dark:bg-gray-200 rounded-3xl p-6 relative overflow-hidden">
//           <Svg width={screenWidth} height={120} viewBox="0 0 200 110">
//             <Defs>
//               <LinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
//                 <Stop offset="0%" stopColor="#38bdf8" />
//                 <Stop offset="50%" stopColor="#818cf8" />
//                 <Stop offset="100%" stopColor="#f472b6" />
//               </LinearGradient>
//             </Defs>
//             <Path d="M 20 100 A 80 80 0 0 1 180 100"
//               stroke={isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"} strokeWidth={16} fill="none" strokeLinecap="round"/>
//             <Path d="M 20 100 A 80 80 0 0 1 180 100"
//               stroke="url(#gaugeGradient)" strokeWidth={16} strokeDasharray="251" strokeDashoffset={251 - (localTemp / 100) * 251} fill="none" strokeLinecap="round"/>
//             {/* Needle */}
//           {/* Needle */}
// <G rotation={needleDeg} origin="100,100">
//   {/* Base circle */}
//   <Circle cx="101" cy="102" r="4" fill="#fff" />
//   {/* Needle triangle */}
//   <Path
//     d="M100 100 L97 20 L103 102 Z"
//     fill="#fff"
//   />
// </G>

//           </Svg>
//           <Text className="text-center text-5xl font-bold text-cyan-400 mt-2">{localTemp}°C</Text>
//         </View>

//         {/* Swiper Chart */}
//         <Swiper showsPagination height={250} style={{ marginTop: 20 }}>
//           <View className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl">
//             <LineChart
//               data={chartData}
//               width={screenWidth}
//               height={200}
//               chartConfig={{
//                 backgroundColor: isDark ? "#0f172a" : "#fff",
//                 backgroundGradientFrom: isDark ? "#0f172a" : "#fff",
//                 backgroundGradientTo: isDark ? "#0f172a" : "#fff",
//                 decimalPlaces: 1,
//                 color: (opacity = 1) => `rgba(16,185,129,${opacity})`,
//                 labelColor: (opacity = 1) => (isDark ? "#94a3b8" : "#64748b"),
//                 propsForDots: { r: "3", strokeWidth: "2", stroke: "#10b981" },
//               }}
//               bezier
//               style={{ borderRadius: 16 }}
//             />
//           </View>
//         </Swiper>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Swiper from "react-native-swiper";
import { LineChart } from "react-native-chart-kit";
import Svg, { Path, Defs, LinearGradient, Stop, G, Circle, Text as SvgText } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width - 40;
const GAUGE_WIDTH = 200;
const GAUGE_HEIGHT = 100;
const RADIUS = 80;
const CENTER_X = 100;
const CENTER_Y = 100;

export default function Dashboard() {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === "dark");

  // Color ranges for the gauge (static zones - 180 degrees total)
  const colorRanges = [
    { min: 0, max: 20, color: "#808080", label: "Cold" },   
    { min: 20, max: 50, color: "#e61235", label: "Cool" },   
    { min: 50, max: 70, color: "#f3571d", label: "Warm" },   
    { min: 70, max: 80, color: "#fba223", label: "Hot" }     ,
        { min: 80, max: 90, color: "#fef02f", label: "Warm" },   
    { min: 90, max: 100, color: "#4aff2c", label: "Hot" }     
  ];

  // --- Realtime Data States ---
  const [localTemp, setLocalTemp] = useState(24.5);
  const [chartData, setChartData] = useState({
    labels: ['21:52', '21:53', '21:54', '21:55', '21:56', '21:57'],
    datasets: [
      { data: [60, 24, 23.5, 24.2, 24.5, 24.5] }
    ]
  });

  const [needleDeg, setNeedleDeg] = useState(0);
  console.log(needleDeg);

  // Calculate needle position based on temperature
  const calculateNeedleAngle = (temp: number) => {
    // Convert temperature to angle (-90 to 90 degrees for 180-degree arc)
    const normalized = temp / 100;
    return -45 + (normalized * 180);
  };

  // --- Simulate Realtime Updates ---
  useEffect(() => {
    setNeedleDeg(calculateNeedleAngle(localTemp));

    const interval = setInterval(() => {
      // Generate new random value
      const newTemp = +(20 + Math.random() * 10).toFixed(1);
      setLocalTemp(newTemp);
      setNeedleDeg(calculateNeedleAngle(newTemp));

      // Update chart data
      setChartData(prev => {
        const newDataset = [...prev.datasets[0].data.slice(1), newTemp];
        const newLabels = [...prev.labels.slice(1), new Date().toLocaleTimeString().slice(3, 8)];
        return { labels: newLabels, datasets: [{ data: newDataset }] };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Function to calculate points on the arc
  const getArcPoint = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: CENTER_X + radius * Math.cos(rad),
      y: CENTER_Y + radius * Math.sin(rad)
    };
  };

  // Render the 4 color range arcs (static, 180 degrees total)
  const renderColorRanges = () => {
    return colorRanges.map((range, index) => {
      const startAngle = -180 + (range.min / 100) * 180;
      const endAngle = -180 + (range.max / 100) * 180;
      
      const startPoint = getArcPoint(startAngle, RADIUS);
      const endPoint = getArcPoint(endAngle, RADIUS);
      
const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
      
      return (
        <Path
          key={`range-${index}`}
          d={`M ${startPoint.x} ${startPoint.y } 
              A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${endPoint.x} ${endPoint.y }`}
          stroke={range.color}
          strokeWidth={16}
          fill="none"
          opacity={1}
        />
      );
    });
  };

  // Render temperature markers
const renderGaugeMarkers = () => {
  const tempScale = Array.from({ length: 11 }, (_, i) => i * 10); 
  return tempScale.map((temp) => {
    const angle = -180 + (temp / 100) * 180; 
    // Tick points
    const innerPoint = getArcPoint(angle, RADIUS - 5);
    const outerPoint = getArcPoint(angle, RADIUS + 5);

    // Label point
    const labelRadius = RADIUS + 20;
    const labelPoint = getArcPoint(angle, labelRadius);

    return (
      <G key={`marker-${temp}`}>
        <Path
          d={`M ${innerPoint.x} ${innerPoint.y} L ${outerPoint.x} ${outerPoint.y}`}
          stroke={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
          strokeWidth="1.5"
        />
        <SvgText
          x={labelPoint.x}
          y={labelPoint.y +5}
          textAnchor="middle"
          fontSize="10"
fill="white"
          alignmentBaseline="middle"
        >
          {temp}
        </SvgText>
      </G>
    );
  });
};

  // Render the needle
  const renderNeedle = () => {
    return (
      <G>
        {/* Needle base circle */}
        <Circle cx={CENTER_X} cy={CENTER_Y} r="8" fill="#1e293b" />
        <Circle cx={CENTER_X} cy={CENTER_Y} r="5" fill="#fff" />
        
        {/* Needle - rotated based on temperature */}
        <G rotation={needleDeg} origin={`${CENTER_X},${CENTER_Y}`}>
          <Path
            d={`M ${CENTER_X} ${CENTER_Y} L ${CENTER_X - 60} ${CENTER_Y - 60}`}
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path
            d={`M ${CENTER_X} ${CENTER_Y} L ${CENTER_X - 60} ${CENTER_Y - 60}`}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </G>
      </G>
    );
  };

  // Render color range legend
  const renderColorRangeLegend = () => {
    return (
      <View className="flex-row justify-between mt-6 px-1">
        {colorRanges.map((range, index) => (
          <View key={`legend-${index}`} className="items-center flex-1">
            <View className="flex-row items-center mb-1">
              <View 
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: range.color, opacity: 0.9 }}
              />
              <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {range.label}
              </Text>
            </View>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {range.min}°-{range.max}°
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className={`${isDark ? "bg-slate-950" : "bg-gray-100"} flex-1`}>
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 bg-white/10 dark:bg-gray-800 rounded-b-xl">
        <View className="flex-row items-center gap-3">
          <View className="bg-gradient-to-tr from-cyan-500 to-blue-500 w-10 h-10 rounded-lg flex items-center justify-center">
            <MaterialIcons name="sensors" size={24} color="#fff" />
          </View>
          <View>
            <Text className="text-base font-bold text-gray-900 dark:text-white">SensorDash</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">LAB DS18B20</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setIsDark(!isDark)}>
          <MaterialIcons name={isDark ? "dark-mode" : "light-mode"} size={24} color={isDark ? "#fff" : "#000"} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} className="space-y-6">
        {/* Gauge Section */}
        <View className="bg-[#071623] dark:bg-gray-200 rounded-3xl p-6">
          <View className="items-center mt-6">
            <Svg width={screenWidth} height={180} viewBox="0 0 200 150">
              {/* Static background arc */}
              <Path
                d={`M 20 100 A ${RADIUS} ${RADIUS} 0 0 1 180 100`}
                stroke={isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}
                strokeWidth={18}
                fill="none"
                // strokeLinecap="round"
              />
              
              {/* 4 Color Ranges */}
              {renderColorRanges()}
              
              {/* Temperature Markers */}
              {renderGaugeMarkers()}
              
              {/* Needle */}
              {renderNeedle()}
              
              {/* Center point */}
              <Circle cx={CENTER_X} cy={CENTER_Y} r="2" fill="#000" />
            </Svg>
            
            {/* Current temperature display */}
            <View className="mt-8 items-center">
              <Text className="text-5xl font-bold text-cyan-400 mb-1">{localTemp}°C</Text>
              <Text className="text-gray-400 dark:text-gray-600 text-sm">Current Temperature</Text>
            </View>
            
            {/* Color range legend */}
            {renderColorRangeLegend()}
          </View>
        </View>


        {/* Chart Section */}
        <Swiper showsPagination height={250} style={{ marginTop: 20 }}>
          <View className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl">
            <LineChart
              data={chartData}
              width={screenWidth}
              height={200}
              chartConfig={{
                backgroundColor: isDark ? "#0f172a" : "#fff",
                backgroundGradientFrom: isDark ? "#0f172a" : "#fff",
                backgroundGradientTo: isDark ? "#0f172a" : "#fff",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(16,185,129,${opacity})`,
                labelColor: (opacity = 1) => (isDark ? "#94a3b8" : "#64748b"),
                propsForDots: { r: "3", strokeWidth: "2", stroke: "#10b981" },
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
            <Text className="text-center text-gray-700 dark:text-gray-300 mt-2 font-medium">
              Temperature History (Last 6 readings)
            </Text>
          </View>
        </Swiper>
      </ScrollView>
    </SafeAreaView>
  );
}