import { View, Text } from "react-native"
import { LineChart } from "react-native-gifted-charts"

export default function HistoryAnalysisCard() {
  const data = [
    { value: 23.2, label: "21:52" },
    { value: 24.0, label: "21:53" },
    { value: 23.4, label: "21:54" },
    { value: 24.2, label: "21:55" },
    { value: 24.6, label: "21:56" },
    { value: 24.5, label: "21:57" },
  ]

  return (
    <View className="bg-[#0b1220] rounded-3xl p-4 border border-emerald-400/30">
      
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-white font-semibold text-sm">
          Local Temp History
        </Text>
        <View className="bg-white/10 px-2 py-1 rounded-lg">
          <Text className="text-[10px] text-slate-300">24h</Text>
        </View>
      </View>

      {/* Chart */}
      <LineChart
        data={data}
        curved
        areaChart
        height={160}
        spacing={40}
        hideDataPoints
        thickness={2}
        startFillColor="rgba(16,185,129,0.5)"
        endFillColor="rgba(16,185,129,0.05)"
        startOpacity={1}
        endOpacity={0.1}
        color="#10b981"
        yAxisColor="transparent"
        xAxisColor="transparent"
        rulesColor="rgba(255,255,255,0.05)"
        yAxisTextStyle={{ color: "#94a3b8", fontSize: 10 }}
        xAxisLabelTextStyle={{ color: "#64748b", fontSize: 10 }}
        noOfSections={5}
        maxValue={25}
        mostNegativeValue={23}
        pointerConfig={{
          pointerStripColor: "#10b981",
          pointerColor: "#10b981",
          radius: 4,
        }}
      />
    </View>
  )
}
