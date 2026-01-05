import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import Svg, { Path, Defs,  Stop, G, Circle, Text as SvgText } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { environment } from "@/environment/environment";
import { useNavigation, DrawerActions, useFocusEffect } from "@react-navigation/native";
import { useDrawerStatus } from "@react-navigation/drawer";
import * as ScreenOrientation from 'expo-screen-orientation';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList,DrawerParamList } from "./types";

type ChartDataType = {
  labels: string[];
  datasets: {
    data: number[];
  }[];
};

type DashboardNavigationProps = StackNavigationProp<
  DrawerParamList,
  "Dashboard"
>;

interface DashboardProps {
  navigation: DashboardNavigationProps;
}
const screenWidth = Dimensions.get("window").width - 40;
const GAUGE_WIDTH = 200;
const GAUGE_HEIGHT = 100;
const RADIUS = 80;
const CENTER_X = 100;
const CENTER_Y = 100;

const Dashboard: React.FC<DashboardProps> = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === "dark");
  const [time, setTime] = useState("");
  const [needleDeg, setNeedleDeg] = useState(0);
  const [localTemp, setLocalTemp] = useState(24.5);
const [localTempChartData, setLocalTempChartData] = useState<ChartDataType>({
  labels: [],
  datasets: [{ data: [] }]
});
const [temperatureChartData, setTemperatureChartData] = useState<ChartDataType>({
  labels: [],
  datasets: [{ data: [] }]
});
const [pressureChartData, setPressureChartData] = useState<ChartDataType>({
  labels: [],
  datasets: [{ data: [] }]
});
const [humidityChartData, setHumidityChartData] = useState<ChartDataType>({
  labels: [],
  datasets: [{ data: [] }]
});


  const [temperature, setTemperature] = useState(0);
const [humidity, setHumidity] = useState(0);
const [pressure, setPressure] = useState(0);
const [state, setState] = useState("INIT");


useFocusEffect(
  useCallback(() => {
    let isMounted = true;

    const fetchSensorData = async () => {
      console.log("hit dash")
      try {
        const res = await fetch(`${environment.API_BASE_URL}/sensorReadings`);
        const data = await res.json();

        if (!isMounted) return;

        const tempLocal = Number(data.temperature_locale);

        setLocalTemp(tempLocal);
        setTemperature(Number(data.temperature));
        setHumidity(Number(data.humidity));
        setPressure(Number(data.pressure));
        setState(data.state);

        // Gauge
        setNeedleDeg(calculateNeedleAngle(tempLocal));
      } catch (err) {
        console.log("Fetch error:", err);
      }
    };

    fetchSensorData(); // fetch immediately on focus
    const interval = setInterval(fetchSensorData, 1000); // polling every 1s

    return () => {
      isMounted = false;
      clearInterval(interval); // stop polling when screen loses focus
    };
  }, [])
);
// useEffect(() => {
//   let isMounted = true;

//   const fetchSensorData = async () => {
//     try {
//       const res= await fetch(`${environment.API_BASE_URL}/sensorReadings`);    
//         const data = await res.json();

//       if (!isMounted) return;

//       const tempLocal = Number(data.temperature_locale);

//       setLocalTemp(tempLocal);
//       setTemperature(Number(data.temperature));
//       setHumidity(Number(data.humidity));
//       setPressure(Number(data.pressure));
//       setState(data.state);

//       // Gauge
//       setNeedleDeg(calculateNeedleAngle(tempLocal));


//     } catch (err) {
//       console.log("Fetch error:", err);
//     }
//   };

//   fetchSensorData();               // Initial load
//   const interval = setInterval(fetchSensorData, 1000); // 1s polling

//   return () => {
//     isMounted = false;
//     clearInterval(interval);
//   };
// }, [navigation]);
const [chartWidth, setChartWidth] = useState(Dimensions.get("window").width - 40);
useFocusEffect(
  useCallback(() => {
    let isActive = true;

    const lockAndUpdate = async () => {
      if (isActive) {
        // Lock to portrait
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

        // Update chart width dynamically
        const width = Dimensions.get("window").width - 40;
        setChartWidth(width);
      }
    };
    lockAndUpdate();

    // Listen for window size changes
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      if (isActive) setChartWidth(window.width - 40);
    });

    // Cleanup
    return () => {
      isActive = false;
      ScreenOrientation.unlockAsync(); // unlock rotation
      subscription?.remove(); // ✅ remove listener correctly
    };
  }, [])
);
const rotateToLandscape = async () => {
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
};

const rotateToPortrait = async () => {
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
};

const MAX_POINTS = 6;
useEffect(() => {
  const label = new Date().toLocaleTimeString().slice(3, 8);
  const appendData = (prev: ChartDataType, value: number) => ({
    labels: [...prev.labels, label].slice(-MAX_POINTS),
    datasets: [{ data: [...prev.datasets[0].data, value].slice(-MAX_POINTS) }]
  });

  setLocalTempChartData(prev => appendData(prev, localTemp));
  setTemperatureChartData(prev => appendData(prev, temperature));
  setPressureChartData(prev => appendData(prev, pressure));
  setHumidityChartData(prev => appendData(prev, humidity));
}, [localTemp, temperature, pressure, humidity]);


  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString("en-GB"); // HH:MM:SS
      setTime(formatted);
    };

    updateTime(); // initial
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);
  // Color ranges for the gauge (static zones - 180 degrees total)
  const colorRanges = [
    { min: 0, max: 20, color: "#808080", label: "Cold" },   
    { min: 20, max: 50, color: "#e61235", label: "Cool" },   
    { min: 50, max: 70, color: "#f3571d", label: "Warm" },   
    { min: 70, max: 80, color: "#fba223", label: "Hot" }     ,
        { min: 80, max: 90, color: "#fef02f", label: "Warm" },   
    { min: 90, max: 100, color: "#4aff2c", label: "Hot" }     
  ];


  // Calculate needle position based on temperature
  const calculateNeedleAngle = (temp: number) => {
    // Convert temperature to angle (-90 to 90 degrees for 180-degree arc)
    const normalized = temp / 100;
    return -45 + (normalized * 180);
  };


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
          strokeWidth="0.5"
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
      <View className="flex-row mt-6">
        {colorRanges.map((range, index) => (
          <View key={`legend-${index}`} className="items-center flex-1">
            <View className="flex-row items-center mb-1">
              <View 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: range.color, opacity: 0.9 }}
              />

            </View>

          </View>
        ))}
      </View>
    );
  };

  return (
        <LinearGradient
      colors={["#040e16", "#061420"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >



      {/* Header */}
      <View className="flex-row justify-between items-center p-4 bg-[#040e16]/50 rounded-b-xl">
        <View className="flex-row items-center gap-3">
   <TouchableOpacity
  activeOpacity={0.7}
  onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
  className="bg-gradient-to-tr from-cyan-500 to-blue-500 w-10 h-10 rounded-lg flex items-center justify-center"
>
  <MaterialIcons name="sensors" size={24} color="#fff" />
</TouchableOpacity>

          <View>
            <Text className="text-base font-bold text-white">ODV - Project LAB</Text>
            <Text className="text-sm text-white">DS18B20</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} className="space-y-2">
<LinearGradient
  colors={["#040e16", "#071927"]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  className="rounded-2xl p-4 border-2 border-[#0b1d2c]"
>
  <Text className="text-white font-semibold ">State</Text>

  <View className="flex-row items-center justify-between">
    
    <Text className="text-white text-xl font-bold">
      {time}
    </Text>

<View
  className={`w-12 h-12 rounded-full bg-[#061420]  border-2  border-[#0b1d2c] items-center justify-center`}
>      <MaterialIcons name="power-settings-new" size={30} color={
    state === "HEATING" || state === "ENDTREATMENT" || state==="INIT" || state==="REINIT" || "TREATMENT"
      ? "#10b981"
      : "white"
  } />
    </View>

  </View>
</LinearGradient>


                <LinearGradient
      colors={["#061420", "#040e16"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className=" rounded-3xl p-5 border-2 border-[#0b1d2c]"
    >
        <View  >
          <View className="flex-row justify-between ">
                   <Text className="text-white   -mt-2 text-base font-semibold">Temperature Local</Text>
                   <View className="flex-row gap-1">
<View className={`${state==="ENDTREATMENT" ? "bg-[#dd9e36]" : "bg-[#dd9e36]/40"}  h-3 w-3 rounded-full`} />
<View className={`${state==="TREATMENT" ? "bg-[#10b981]" : "bg-[#10b981]/40"}  h-3 w-3 rounded-full`} />
<View className={`${state==="HEATING" ? "bg-[#ef4444]" : "bg-[#ef4444]/40"}  h-3 w-3 rounded-full`}/>

                   </View>

          </View>
     
          <View className="items-center mt-6">
            <Svg width={screenWidth} height={180} viewBox="0 0 200 140">
              <Path
                d={`M 20 100 A ${RADIUS} ${RADIUS} 0 0 1 180 100`}
                stroke={isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}
                strokeWidth={18}
                fill="none"
              />
              
              {renderColorRanges()}
              
              {renderGaugeMarkers()}
              
              {renderNeedle()}
              
              <Circle cx={CENTER_X} cy={CENTER_Y} r="2" fill="#000" />
            </Svg>
            
            <View className=" items-center -mt-6">
              <Text className="text-2xl font-semibold text-white mb-1">{localTemp}°C</Text>
            </View>
            
            {/* Color range legend */}
        
          </View>
        </View>
        
</LinearGradient>

<View className="space-y-4">


  <View className="flex-row flex-wrap justify-between gap-y-4">

    {/* Temperature */}
    <LinearGradient
      colors={["#061420", "#040e16"]}
      className="w-[48%] rounded-2xl p-4 border border-[#0b1d2c] justify-center items-center "
    >
      <Text className="text-sm text-gray-400 font-semibold mb-1">Temperature Local</Text>
      <View className="flex-row items-center gap-2 mb-2 ">
        <MaterialIcons name="device-thermostat" size={22} color="#2dab87" />
      </View>
            <View className="flex-row  items-baseline ">
      <Text className="text-white text-xl font-semibold ">{localTemp}</Text>
      <Text className="text-gray-400 text-base ml-1">°C</Text>

      </View>
      <View className="h-1 w-full bg-[#2dab87] rounded-full" />
    </LinearGradient>

    {/* Pressure */}
        <LinearGradient
      colors={["#061420", "#040e16"]}
      className="w-[48%] rounded-2xl p-4 border border-[#0b1d2c] justify-center items-center"
    >
      <Text className="text-sm text-gray-400 font-semibold mb-1">Temperature</Text>
      <View className="flex-row items-center gap-2 mb-2 ">
        <MaterialIcons name="device-thermostat" size={22} color="#c7564c" />
      </View>
      <View className="flex-row  items-baseline ">
      <Text className="text-white text-xl font-semibold ">{temperature}</Text>
      <Text className="text-gray-400 text-base ml-1">°C</Text>

      </View>
            <View className="h-1 w-full bg-[#c7564c] rounded-full" />

    </LinearGradient>

            <LinearGradient
      colors={["#061420", "#040e16"]}
      className="w-[48%] rounded-2xl p-4 border border-[#0b1d2c] justify-center items-center"
    >
      <Text className="text-sm text-gray-400 font-semibold mb-1">Pressure</Text>
      <View className="flex-row items-center gap-2 mb-2 ">
        <MaterialIcons name="speed" size={22} color="#dd9e36" />
      </View>
      <View className="flex-row  items-baseline ">
      <Text className="text-white text-xl font-semibold ">{pressure}</Text>
      <Text className="text-gray-400 text-base ml-1">hpa</Text>

      </View>
            <View className="h-1 w-full bg-[#dd9e36] rounded-full" />

    </LinearGradient>


            <LinearGradient
      colors={["#061420", "#040e16"]}
      className="w-[48%] rounded-2xl p-4 border border-[#0b1d2c] justify-center items-center"
    >
      <Text className="text-sm text-gray-400 font-semibold mb-1">Humidity</Text>
      <View className="flex-row items-center gap-2 mb-2 ">
        <MaterialIcons name="water-drop" size={22} color="#4692c6" />
      </View>
      <View className="flex-row  items-baseline ">
      <Text className="text-white text-xl font-semibold ">{humidity}</Text>
      <Text className="text-gray-400 text-base ml-1">hpa</Text>

      </View>
            <View className="h-1 w-full bg-[#4692c6] rounded-full" />

    </LinearGradient>

  </View>
</View>


  <ScrollView
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{
    paddingHorizontal: 4,
    gap: 10,
  }}
>
  {[
    { label: "Temperature Local", data: localTempChartData, color: "#10b981" },
    { label: "Temperature", data: temperatureChartData, color: "#ef4444" },
    { label: "Pressure", data: pressureChartData, color: "#dd9e36" },
    { label: "Humidity", data: humidityChartData, color: "#3b82f6" },
  ].map((item, index) => (
    <View
      key={index}
      style={{
        width: screenWidth - 10, // full width minus padding
        marginHorizontal: 0,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#0b1d2c",
        padding: 10,
        backgroundColor: "#061420",
      }}
    >
            <Text
        style={{
          textAlign: "center",
          color: isDark ? "#94a3b8" : "#64748b",
          marginTop: 2,
          fontWeight: "500",
        }}
        className="mb-4"
      >
        {item.label} History
      </Text>
      {item.data.labels.length > 0 ? (
        <LineChart
          data={item.data}
          width={chartWidth - 60}
          height={200}
          chartConfig={{
            backgroundColor: "#061420",
            backgroundGradientFrom: "#061420",
            backgroundGradientTo: "#040e16",
            decimalPlaces: 1,
            color: (opacity = 1) => item.color,
            labelColor: (opacity = 1) => (isDark ? "#94a3b8" : "#64748b"),
            propsForDots: { r: "3", strokeWidth: "2", stroke: item.color },
          }}
          bezier
          style={{ borderRadius: 16 }}
        />
      ) : (
        <Text className="text-center text-gray-400 mt-6">No data yet</Text>
      )}

    </View>
  ))}
</ScrollView>



      </ScrollView>

                </LinearGradient>

  );
}

export default Dashboard;
