import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Activity, Thermometer, Droplets, Volume2, Wind, TrendingUp } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import Card from '../components/Card'

export default function DashboardPage() {
  // Mock sensor data
  const pm25Data = [
    { time: '08:00', value: 12.5 },
    { time: '09:00', value: 15.3 },
    { time: '10:00', value: 18.7 },
    { time: '11:00', value: 22.1 },
    { time: '12:00', value: 25.8 },
    { time: '13:00', value: 28.4 },
    { time: '14:00', value: 31.2 },
    { time: '15:00', value: 33.5 },
    { time: '16:00', value: 35.8 },
    { time: '17:00', value: 37.2 },
  ]
  
  const pm10Data = [
    { time: '08:00', value: 18.2 },
    { time: '09:00', value: 22.1 },
    { time: '10:00', value: 25.4 },
    { time: '11:00', value: 28.9 },
    { time: '12:00', value: 32.5 },
    { time: '13:00', value: 35.7 },
    { time: '14:00', value: 38.9 },
    { time: '15:00', value: 41.2 },
    { time: '16:00', value: 43.8 },
    { time: '17:00', value: 45.6 },
  ]
  
  const tempHumidityData = [
    { time: '08:00', temp: 21.3, humidity: 45.2 },
    { time: '09:00', temp: 21.8, humidity: 47.3 },
    { time: '10:00', temp: 22.1, humidity: 48.9 },
    { time: '11:00', temp: 22.6, humidity: 50.2 },
    { time: '12:00', temp: 23.1, humidity: 52.1 },
    { time: '13:00', temp: 23.4, humidity: 54.3 },
    { time: '14:00', temp: 23.8, humidity: 56.8 },
    { time: '15:00', temp: 24.2, humidity: 58.9 },
    { time: '16:00', temp: 24.5, humidity: 60.5 },
    { time: '17:00', temp: 24.8, humidity: 62.1 },
  ]
  
  const airQualityScore = 68
  const scoreColor = airQualityScore >= 75 ? 'good' : airQualityScore >= 50 ? 'normal' : 'warning'
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white pt-28 pb-20">
      <div className="section-container">
        <div className="mb-12">
          <h1 className="text-4xl font-bold font-display text-neutral-900 mb-4">
            Sensor Dashboard
          </h1>
          <p className="text-lg text-neutral-600">
            Real-time monitoring of your indoor environment metrics
          </p>
        </div>
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <MetricCard
            icon={Activity}
            label="Air Quality Score"
            value={airQualityScore}
            unit="/100"
            trend={-3}
            status={scoreColor}
          />
          <MetricCard
            icon={Wind}
            label="PM2.5"
            value={37.2}
            unit="µg/m³"
            trend={12}
            status="warning"
          />
          <MetricCard
            icon={Thermometer}
            label="Temperature"
            value={24.8}
            unit="°C"
            trend={2}
            status="good"
          />
          <MetricCard
            icon={Droplets}
            label="Humidity"
            value={62.1}
            unit="%"
            trend={5}
            status="normal"
          />
          <MetricCard
            icon={Volume2}
            label="Noise Level"
            value={45}
            unit="dB"
            status="good"
          />
        </div>
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* PM2.5 Trend */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Wind className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">PM2.5 Levels</h3>
                <p className="text-sm text-neutral-500">Last 10 hours</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={pm25Data}>
                <defs>
                  <linearGradient id="colorPM25" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#737373" fontSize={12} />
                <YAxis stroke="#737373" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPM25)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
          
          {/* PM10 Trend */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">PM10 Levels</h3>
                <p className="text-sm text-neutral-500">Last 10 hours</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pm10Data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#737373" fontSize={12} />
                <YAxis stroke="#737373" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
        
        {/* Temperature & Humidity Chart */}
        <Card className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-800">Temperature & Humidity</h3>
              <p className="text-sm text-neutral-500">Environmental conditions over time</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tempHumidityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#737373" fontSize={12} />
              <YAxis yAxisId="left" stroke="#737373" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#737373" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="temp" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Temperature (°C)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="humidity" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Humidity (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Air Quality Guidelines */}
        <Card variant="gradient">
          <h3 className="text-xl font-semibold text-neutral-800 mb-4">Air Quality Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="font-semibold text-neutral-800">Good</span>
              </div>
              <p className="text-sm text-neutral-600">PM2.5: 0-12 µg/m³</p>
              <p className="text-sm text-neutral-600">PM10: 0-54 µg/m³</p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="font-semibold text-neutral-800">Moderate</span>
              </div>
              <p className="text-sm text-neutral-600">PM2.5: 12-35 µg/m³</p>
              <p className="text-sm text-neutral-600">PM10: 54-154 µg/m³</p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="font-semibold text-neutral-800">Unhealthy</span>
              </div>
              <p className="text-sm text-neutral-600">PM2.5: &gt;35 µg/m³</p>
              <p className="text-sm text-neutral-600">PM10: &gt;154 µg/m³</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
