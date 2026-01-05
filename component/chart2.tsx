import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
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
import {
  useNavigation,
  DrawerActions,
  useFocusEffect,
} from "@react-navigation/native";
import { environment } from "@/environment/environment";
import { LineChart } from "react-native-chart-kit";
import * as ScreenOrientation from "expo-screen-orientation";
import LottieView from "lottie-react-native";
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

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
);
const MIN_SEC = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0")
);

// All sensor keys
const SENSOR_KEYS: SensorKey[] = [
  { label: "Local Temperature", key: "localTemperature", color: "#10b981" },
  { label: "Temperature", key: "temperature", color: "#e71831" },
  { label: "Pressure", key: "pressure", color: "#f59e0b" },
  { label: "Humidity", key: "humidity", color: "#006de8" },
];

const CHART_COLORS: { [key: string]: string } = {
  "Local Temperature": "#10b981",
  Temperature: "#ef4444",
  Pressure: "#dd9e36",
  Humidity: "#3b82f6",
};
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
  // const [fromTime, setFromTime] = useState({ h: "14", m: "57", s: "19" });
  // const [toTime, setToTime] = useState({ h: "14", m: "58", s: "19" });
  const getCurrentTime = () => {
    const now = new Date();
    return {
      h: now.getHours().toString().padStart(2, "0"),
      m: now.getMinutes().toString().padStart(2, "0"),
      s: now.getSeconds().toString().padStart(2, "0"),
    };
  };
  const [fromTime, setFromTime] = useState(getCurrentTime());
  const [toTime, setToTime] = useState(getCurrentTime());
  useFocusEffect(
    useCallback(() => {
      // Update time immediately on focus
      setFromTime(getCurrentTime());
      setToTime(getCurrentTime());
      setFilteredData([]);
      setFilters([]);
      setParams([]);
      setSensorData([]);
    }, [])
  );

  const [showDate, setShowDate] = useState<"from" | "to" | null>(null);
  const [picker, setPicker] = useState<{
    type: "h" | "m" | "s";
    target: "from" | "to";
  } | null>(null);

  const [params, setParams] = useState<string[]>([]);
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]); // chart filtered data

  const screenWidth = Dimensions.get("window").width - 40;
  const navigation = useNavigation();
  const [errorMsg, setErrorMsg] = useState("");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };
  const showAlert = (message: string) => {
    setErrorMsg(message);
    setShowError(true);
  };
  // Fetch sensor data
  const getSensorData = async () => {
    if (!params.length) {
      showAlert("Select at least one parameter!");
      return;
    }

    setLoading(true);
    const startTime = formatTime(fromTime);
    const endTime = formatTime(toTime);
    const parameter = params[0];

    const startDate = fromDate.toISOString().split("T")[0];
    const endDate = toDate.toISOString().split("T")[0];

    try {
      const query = `?startDate=${startDate}&startTime=${startTime}&endDate=${endDate}&endTime=${endTime}&parameter=${parameter}`;
      const response = await fetch(
        `${environment.API_BASE_URL}/sensorReadingsByDateTime${query}`
      );
      const data = await response.json();

      if (!response.ok) {
        showAlert(data.error || "Failed to fetch sensor data");
        return;
      }

      setSensorData(data);
      setFilteredData(data); // initially show all
    } catch (err) {
      console.error(err);
      showAlert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  // Filter chart data based on selected filters
  useEffect(() => {
    if (!filters.length) setFilteredData(sensorData);
    else {
      const lowerFilters = filters.map((f) => f.toLowerCase());
      const filtered = sensorData.map((item) => {
        const newItem: any = { time: item.time };
        SENSOR_KEYS.forEach((sensor) => {
          if (lowerFilters.includes(sensor.label.toLowerCase())) {
            newItem[sensor.key] = item[sensor.key];
          }
        });
        return newItem;
      });
      setFilteredData(filtered);
    }
  }, [filters, sensorData]);

  const chartData = {
    labels: filteredData.map((item) => item.time.slice(0, 20)),
    datasets: SENSOR_KEYS.filter(
      (s) => filters.includes(s.label) || filters.length === 0
    ).map((sensor) => ({
      label: sensor.label,
      data: filteredData.map((item) => item[sensor.key] ?? 0),
      borderColor: sensor.color, // ✅ add borderColor here
      backgroundColor: sensor.color + "33", // optional: semi-transparent fill
    })),
  };

  const rotateToLandscape = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
  };

  const rotateToPortrait = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT
    );
  };

  const [isLandscape, setIsLandscape] = useState(false);
  const toggleOrientation = async () => {
    if (isLandscape) {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT
      );
      setIsLandscape(false);
    } else {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
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
    <LinearGradient
      colors={["#040e16", "#061420"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
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
            <Text className="text-base font-bold text-white">
              ODV - Project LAB
            </Text>
            <Text className="text-sm text-white">DS18B20</Text>
          </View>
        </View>
      </View>

      <ScrollView className="px-4">
        {/* TIME SELECTION */}
        <View className="bg-[#071b2a] border border-[#0b2a3c] rounded-2xl p-4 mb-4">
          <Text className="text-white text-lg font-semibold text-center mb-2">
            Select Time Range
          </Text>

          {/* Date & Time Pickers */}
          <Text className="text-white mb-2 font-semibold">From</Text>
          <View className="flex-row items-center justify-center mb-4">
            <View className="mr-2">
              <DateBox date={fromDate} onPress={() => setShowDate("from")} />
            </View>

            <View className="flex-row items-center gap-x-1">
              <TimeBox
                value={fromTime.h}
                onPress={() => setPicker({ type: "h", target: "from" })}
              />
              <Colon />
              <TimeBox
                value={fromTime.m}
                onPress={() => setPicker({ type: "m", target: "from" })}
              />
              <Colon />
              <TimeBox
                value={fromTime.s}
                onPress={() => setPicker({ type: "s", target: "from" })}
              />
            </View>
          </View>

          <Text className="text-white mb-2 font-semibold">To</Text>
          <View className="flex-row items-center justify-center mb-6">
            <View className="mr-2">
              <DateBox date={toDate} onPress={() => setShowDate("to")} />
            </View>
            <View className="flex-row items-center gap-x-1">
              <TimeBox
                value={toTime.h}
                onPress={() => setPicker({ type: "h", target: "to" })}
              />
              <Colon />
              <TimeBox
                value={toTime.m}
                onPress={() => setPicker({ type: "m", target: "to" })}
              />
              <Colon />
              <TimeBox
                value={toTime.s}
                onPress={() => setPicker({ type: "s", target: "to" })}
              />
            </View>
          </View>

          {/* PARAMETERS */}
          <Text className="text-white text-center font-semibold mb-3">
            Select Parameters
          </Text>
          <View className="flex-row flex-wrap gap-3 justify-center mb-6">
            {["INIT", "REINIT", "ENDTREATMENT", "TREATMENT", "HEATING"].map(
              (p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => selectSingle(p, params, setParams)}
                  className={`px-5 py-3 rounded-lg ${
                    params.includes(p)
                      ? "bg-emerald-500/30 border border-emerald-500"
                      : "bg-[#0a2234]"
                  }`}
                >
                  <Text className="text-white text-xs font-semibold">{p}</Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <TouchableOpacity
            className="bg-emerald-500 py-3 rounded-lg items-center"
            onPress={getSensorData}
          >
            <Text className="text-white font-semibold">Get Data</Text>
          </TouchableOpacity>
        </View>

        {/* DATA FILTER */}
        <View className="bg-[#071b2a] border border-[#0b2a3c] rounded-2xl p-4 mb-6">
          <View className="items-center ">
            <LottieView
              source={{
                uri: "https://lottie.host/014e40d0-aeba-4241-8f35-1d3b7cd3a6e9/6JfMsDElEc.lottie",
              }}
              autoPlay
              loop
              style={{ width: 500, height: 200 }}
              speed={1}
            />
          </View>
          <Text className="text-white text-lg font-semibold mb-2 text-center">
            Data Filter
          </Text>
          <View className="flex-row flex-wrap gap-3 justify-center">
            {SENSOR_KEYS.map((f) => (
              <TouchableOpacity
                key={f.label}
                onPress={() => toggleFilter(f.label)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  borderWidth: filters.includes(f.label) ? 1 : 0,
                  borderColor: CHART_COLORS[f.label],
                  backgroundColor: filters.includes(f.label)
                    ? CHART_COLORS[f.label] + "33"
                    : "#0a2234",
                }}
              >
                <Text className="text-white text-xs font-semibold">
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="">
          <View
            style={{
              width: screenWidth,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#0b1d2c",
              padding: 10,
              backgroundColor: "#061420",
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              onPress={toggleOrientation}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "#1e293b",
                width: 36, // fixed width
                height: 36, // fixed height
                borderRadius: 8,
                zIndex: 10,
                justifyContent: "center",
                alignItems: "center", // center the child
              }}
            >
              <Text
                className="-mt-2"
                style={{ color: "#fff", fontWeight: "bold", fontSize: 20 }}
              >
                ⤢
              </Text>
            </TouchableOpacity>

            {chartData.labels.length > 0 ? (
              <View
                style={{
                  height: isLandscape ? 500 : 200, // dynamic height
                  borderRadius: 16,
                  marginBottom: isLandscape ? -120 : -25,
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
              <Text className="text-center text-gray-400 mt-6">
                No data yet
              </Text>
            )}
            <Text
              className=""
              style={{
                textAlign: "center",
                color: "#94a3b8",
                marginTop: 2,
                fontWeight: "500",
              }}
            >
              Sensor History
            </Text>
          </View>
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
                keyExtractor={(i) => i}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="py-3 items-center border-b border-[#0b2a3c]"
                    onPress={() => {
                      const setTime =
                        picker.target === "from" ? setFromTime : setToTime;
                      setTime((prev: any) => ({
                        ...prev,
                        [picker.type]: item,
                      }));
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
              {errorMsg}
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

      {loading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 10,
          }}
        >
          <LottieView
            source={{
              uri: "https://assets1.lottiefiles.com/packages/lf20_usmfx6bp.json",
            }}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
            colorFilters={[
              {
                keypath: "*", // apply to all shapes
                color: "#10b981",
              },
            ]}
          />
        </View>
      )}
    </LinearGradient>
  );
}
const DateBox = ({ date, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-[#0a2234] border border-emerald-500 rounded-lg p-8 py-3"
  >
    <Text className="text-white text-xs font-semibold">
      {date.toLocaleDateString()}
    </Text>
  </TouchableOpacity>
);

const TimeBox = ({ value, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-[#0a2234] border border-emerald-500 rounded-lg p-5 py-3"
  >
    <Text className="text-white text-sm font-semibold">{value}</Text>
  </TouchableOpacity>
);

const Colon = () => <Text className="text-white font-semibold">:</Text>;
