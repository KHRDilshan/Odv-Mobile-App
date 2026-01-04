
import React, { useState, useMemo, useRef, useEffect } from "react";
import { WebView } from "react-native-webview";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  Dimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { environment } from "@/environment/environment";
import { LineChart } from "react-native-chart-kit";
import * as ScreenOrientation from 'expo-screen-orientation';
const SCREEN_WIDTH = Dimensions.get("window").width;

// Define sensor structure
type SensorKey = {
  label: string;
  key: keyof SensorRecord; // strong typing for dynamic access
  color: string;
};

// Each data record
type SensorRecord = {
  time: string;
  localTemperature: number;
  temperature: number;
  pressure: number;
  humidity: number;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MIN_SEC = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

// All sensor keys
const SENSOR_KEYS: SensorKey[] = [
  { label: "Local Temperature", key: "localTemperature", color: "#10b981" },
  { label: "Temperature", key: "temperature", color: "#e71831" },
  { label: "Pressure", key: "pressure", color: "#f59e0b" },
  { label: "Humidity", key: "humidity", color: "#006de8" },
];

// Mock function to generate many records
const generateData = (): SensorRecord[] => {
  const data: SensorRecord[] = [];
  const startTime = new Date("2026-01-01T14:57:19");
  for (let i = 0; i < 4339; i++) {
    const d = new Date(startTime.getTime() + i * 60 * 1000); // 1-minute interval
    data.push({
      time: d.toISOString(),
      localTemperature: Math.random() * 10 + 20,
      temperature: Math.random() * 10 + 18,
      pressure: Math.random() * 20 + 980,
      humidity: Math.random() * 30 + 40,
    });
  }
  return data;
};

export default function AnalyzeScreen() {
  const [filters, setFilters] = useState<string[]>([]);
  const webViewRef = useRef<WebView>(null);


  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [fromTime, setFromTime] = useState({ h: "14", m: "57", s: "19" });
  const [toTime, setToTime] = useState({ h: "14", m: "58", s: "19" });

  const [showDate, setShowDate] = useState<"from" | "to" | null>(null);
  const [picker, setPicker] = useState<{ type: "h" | "m" | "s"; target: "from" | "to" } | null>(null);

  const [params, setParams] = useState<string[]>([]);
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]); // chart filtered data

  const screenWidth = Dimensions.get("window").width - 40;
  const navigation = useNavigation();

  // Format time object to HH:MM:SS string
  const formatTime = (time: { h: string; m: string; s: string }) =>
    `${time.h}:${time.m}:${time.s}`;

  // Select single parameter
  const selectSingle = (value: string, list: string[], set: any) => {
    if (list.includes(value)) set([]);
    else set([value]);
  };

  // Toggle filters like JS version
  const toggleFilter = (filter: string) => {
    setFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Fetch sensor data
  const getSensorData = async () => {
    if (!params.length) {
      Alert.alert("Select at least one parameter!");
      return;
    }

    const startTime = formatTime(fromTime);
    const endTime = formatTime(toTime);
    const parameter = params[0];

    const startDate = fromDate.toISOString().split("T")[0];
    const endDate = toDate.toISOString().split("T")[0];

    try {
      const query = `?startDate=${startDate}&startTime=${startTime}&endDate=${endDate}&endTime=${endTime}&parameter=${parameter}`;
      const response = await fetch(`${environment.API_BASE_URL}/sensorReadingsByDateTime${query}`);
      const data = await response.json();

      if (!response.ok) {
        Alert.alert(data.error || "Failed to fetch sensor data");
        return;
      }

      setSensorData(data);
      setFilteredData(data); // initially show all
    } catch (err) {
      console.error(err);
      Alert.alert("Error connecting to server");
    }
  };

  // Filter chart data based on selected filters
  useEffect(() => {
    if (!filters.length) setFilteredData(sensorData);
    else {
      const lowerFilters = filters.map(f => f.toLowerCase());
      const filtered = sensorData.map(item => {
        const newItem: any = { time: item.time };
        SENSOR_KEYS.forEach(sensor => {
          if (lowerFilters.includes(sensor.label.toLowerCase())) {
            newItem[sensor.key] = item[sensor.key];
          }
        });
        return newItem;
      });
      setFilteredData(filtered);
    }
  }, [filters, sensorData]);

  // Prepare chart data
  const chartData = {
    labels: filteredData.map(item => item.time.slice(0,20)), // HH:MM
    datasets: SENSOR_KEYS.filter(s => filters.includes(s.label) || filters.length === 0).map(sensor => ({
      data: filteredData.map(item => item[sensor.key] ?? 0),
      color: () => sensor.color,
    })),
  };
const rotateToLandscape = async () => {
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
};

const rotateToPortrait = async () => {
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
};

  const [isLandscape, setIsLandscape] = useState(false); 
  const toggleOrientation = async () => {
    if (isLandscape) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      setIsLandscape(false);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setIsLandscape(true);
    }
  };
  const [isHorizontalModal, setIsHorizontalModal] = useState(false);
  // Toggle filters



  // Downsample if too many points
  const MAX_POINTS = 600;
  const reducedData = useMemo(() => {
    if (filteredData.length <= MAX_POINTS) return filteredData;
    const step = Math.ceil(filteredData.length / MAX_POINTS);
    return filteredData.filter((_, i) => i % step === 0);
  }, [filteredData]);



  // HTML + Chart.js code
  const chartHtml = useMemo(
    () => `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
  body { margin:0; background:#061420; }
  canvas { width:100%; height:100%; }
</style>
</head>
<body>
<canvas id="chart"></canvas>
<script>
  const ctx = document.getElementById('chart').getContext('2d');
  const data = ${JSON.stringify(chartData)};
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: data.datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        borderColor: ds.borderColor,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
           legend: {
      display: false // ✅ hides the default legend / filters
    }
      },
     scales: {
        x: {
          ticks: {
            color: '#94a3b8',
            maxTicksLimit: 8,
            maxRotation: 90, // rotate labels more
            minRotation: 45
          }
        },
        y: { ticks: { color: '#94a3b8' } }
      }
    }
  });
</script>
</body>
</html>
`,
    [chartData]
  );

  return (
        <LinearGradient colors={["#040e16", "#061420"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} className="flex-1">
      {/* HEADER */}
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

      <ScrollView className="px-4">
        {/* TIME SELECTION */}
        <View className="bg-[#071b2a] border border-[#0b2a3c] rounded-2xl p-4 mb-4">
          <Text className="text-white text-lg font-semibold text-center mb-2">Select Time Range</Text>

          {/* Date & Time Pickers */}
          <Text className="text-white mb-2 font-semibold">From</Text>
          <View className="flex-row items-center justify-center mb-4">
            <DateBox date={fromDate} onPress={() => setShowDate("from")} />
            <TimeBox value={fromTime.h} onPress={() => setPicker({ type: "h", target: "from" })} />
            <Colon />
            <TimeBox value={fromTime.m} onPress={() => setPicker({ type: "m", target: "from" })} />
            <Colon />
            <TimeBox value={fromTime.s} onPress={() => setPicker({ type: "s", target: "from" })} />
          </View>

          <Text className="text-white mb-2 font-semibold">To</Text>
          <View className="flex-row items-center justify-center mb-6">
            <DateBox date={toDate} onPress={() => setShowDate("to")} />
            <TimeBox value={toTime.h} onPress={() => setPicker({ type: "h", target: "to" })} />
            <Colon />
            <TimeBox value={toTime.m} onPress={() => setPicker({ type: "m", target: "to" })} />
            <Colon />
            <TimeBox value={toTime.s} onPress={() => setPicker({ type: "s", target: "to" })} />
          </View>

          {/* PARAMETERS */}
          <Text className="text-white text-center font-semibold mb-3">Select Parameters</Text>
          <View className="flex-row flex-wrap gap-3 justify-center mb-6">
            {["INIT", "REINIT", "ENDTREATMENT", "TREATMENT", "HEATING"].map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => selectSingle(p, params, setParams)}
                className={`px-5 py-3 rounded-lg ${params.includes(p) ? "bg-emerald-500/30 border border-emerald-500" : "bg-[#0a2234]"}`}
              >
                <Text className="text-white text-xs font-semibold">{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity className="bg-emerald-500 py-3 rounded-lg items-center" onPress={getSensorData}>
            <Text className="text-white font-semibold">Get Data</Text>
          </TouchableOpacity>
        </View>

        {/* DATA FILTER */}
        <View className="bg-[#071b2a] border border-[#0b2a3c] rounded-2xl p-4 mb-6">
          <Text className="text-white text-lg font-semibold mb-2 text-center">Data Filter</Text>
          <View className="flex-row flex-wrap gap-3 justify-center">
            {SENSOR_KEYS.map(f => (
              <TouchableOpacity
                key={f.label}
                onPress={() => toggleFilter(f.label)}
                className={`px-4 py-3 rounded-lg ${filters.includes(f.label) ? "bg-emerald-500/30 border border-emerald-500" : "bg-[#0a2234]"}`}
              >
                <Text className="text-white text-xs font-semibold">{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      <View
      className=""
>
  {/* Fullscreen Button */}
  <TouchableOpacity
    onPress={toggleOrientation}
    style={{
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: "#1e293b",
      padding: 6,
      borderRadius: 6,
      zIndex: 10,
    }}
  >
    <Text style={{ color: "#fff", fontWeight: "bold" }}>⤢</Text>
  </TouchableOpacity>

  {chartData.labels.length > 0 ? (
   
      <View
        style={{
          height: 500,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: chartHtml }}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={true}
        />
      </View>
  ) : (
    <Text className="text-center text-gray-400 mt-6">No data yet</Text>
  )}
  <Text
    style={{ textAlign: "center", color: "#94a3b8", marginTop: 8, fontWeight: "500" }}
  >
    Sensor History
  </Text>
</View>
   
      
      </ScrollView>

      {/* DATE PICKER */}
      {showDate && (
        <DateTimePicker
          value={showDate === "from" ? fromDate : toDate}
          mode="date"
          onChange={(_, d) => {
            setShowDate(null);
            if (d) showDate === "from" ? setFromDate(d) : setToDate(d);
          }}
        />
      )}

      {/* TIME PICKER MODAL */}
      {picker && (
        <Modal transparent animationType="fade">
          <View className="flex-1 bg-black/70 items-center justify-center">
            <View className="bg-[#071b2a] rounded-xl w-40 max-h-72">
              <FlatList
                data={picker.type === "h" ? HOURS : MIN_SEC}
                keyExtractor={i => i}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="py-3 items-center border-b border-[#0b2a3c]"
                    onPress={() => {
                      const setTime = picker.target === "from" ? setFromTime : setToTime;
                      setTime((prev: any) => ({ ...prev, [picker.type]: item }));
                      setPicker(null);
                    }}
                  >
                    <Text className="text-white">{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      )}
    </LinearGradient>




  );
}
const DateBox = ({ date, onPress }: any) => (
  <TouchableOpacity onPress={onPress} className="bg-[#0a2234] border border-emerald-500 rounded-lg p-8 py-3">
    <Text className="text-white text-xs font-semibold">{date.toLocaleDateString()}</Text>
  </TouchableOpacity>
);

const TimeBox = ({ value, onPress }: any) => (
  <TouchableOpacity onPress={onPress} className="bg-[#0a2234] border border-emerald-500 rounded-lg p-5 py-3">
    <Text className="text-white text-sm font-semibold">{value}</Text>
  </TouchableOpacity>
);

const Colon = () => <Text className="text-white font-semibold">:</Text>;
