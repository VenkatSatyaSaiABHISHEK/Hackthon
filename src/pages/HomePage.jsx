import Lottie from 'lottie-react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { ArrowRight, Sparkles, Wind, LineChart, FileText, Upload, BarChart3, CheckCircle2 } from 'lucide-react'
import Button from '../components/Button'
import IconCard from '../components/IconCard'

export default function HomePage() {
  // Lottie animation data (placeholder - you would use actual JSON from LottieFiles)
  const airQualityAnimation = {
    v: "5.5.7",
    fr: 30,
    ip: 0,
    op: 60,
    w: 500,
    h: 500,
    nm: "Air Quality",
    ddd: 0,
    assets: [],
    layers: []
  }
  
  const features = [
    {
      icon: Upload,
      title: 'Video Analysis',
      description: 'Upload room videos for AI-powered visual inspection of ventilation, cleanliness, and structural factors.'
    },
    {
      icon: BarChart3,
      title: 'Sensor Integration',
      description: 'Analyze PM2.5, PM10, temperature, humidity, and noise data from IoT sensors with advanced charting.'
    },
    {
      icon: Sparkles,
      title: 'Multimodal AI',
      description: 'Powered by Google Gemini AI to correlate visual and sensor data for comprehensive health insights.'
    },
    {
      icon: FileText,
      title: 'Detailed Reports',
      description: 'Generate professional PDF-style reports with actionable recommendations and risk assessments.'
    }
  ]
  
  const steps = [
    {
      icon: Upload,
      title: 'Upload Data',
      description: 'Upload your room video and sensor CSV file'
    },
    {
      icon: Wind,
      title: 'AI Analysis',
      description: 'Gemini AI processes visual and sensor data'
    },
    {
      icon: LineChart,
      title: 'View Insights',
      description: 'Explore interactive dashboard and trends'
    },
    {
      icon: CheckCircle2,
      title: 'Get Report',
      description: 'Download comprehensive health assessment'
    }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-slide-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-teal-50 border border-primary-200">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">Powered by Google Gemini AI</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold font-display text-neutral-900 leading-tight">
                Indoor Air Health Assessment
              </h1>
              
              <p className="text-xl text-neutral-600 leading-relaxed">
                Analyze your indoor environment using multimodal AI. Combine IoT sensor data with room video analysis for comprehensive air quality insights.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button to="/analysis" size="lg">
                  Start Analysis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button to="/dashboard" variant="secondary" size="lg">
                  View Dashboard
                </Button>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <p className="text-3xl font-bold text-primary-600">99.9%</p>
                  <p className="text-sm text-neutral-500">Accuracy</p>
                </div>
                <div className="w-px h-12 bg-neutral-200"></div>
                <div>
                  <p className="text-3xl font-bold text-primary-600">AI-Powered</p>
                  <p className="text-sm text-neutral-500">Analysis</p>
                </div>
                <div className="w-px h-12 bg-neutral-200"></div>
                <div>
                  <p className="text-3xl font-bold text-primary-600">Real-time</p>
                  <p className="text-sm text-neutral-500">Insights</p>
                </div>
              </div>
            </div>
            
            {/* Right Content - Lottie Animation */}
            <div className="flex items-center justify-center animate-scale-in">
              <div className="relative w-full max-w-15xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-teal-400 rounded-full blur-3xl opacity-30 scale-125"></div>
                <div className="relative">
                  <DotLottieReact
                    src="https://lottie.host/26a9190f-ba3c-4968-a043-d98f8f2938f6/IPd5I8a13M.lottie"
                    loop
                    autoplay
                    className="w-full h-auto"
                    style={{ 
                      width: '100%',
                      height: 'auto',
                      imageRendering: 'crisp-edges'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold font-display text-neutral-900 mb-4">
              Comprehensive Air Quality Analysis
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Advanced technology to monitor, analyze, and improve your indoor environment
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <IconCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-white to-neutral-50">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display text-neutral-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Simple, fast, and accurate air quality assessment in four steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-premium transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-600 to-teal-600 flex items-center justify-center mb-4">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">{step.title}</h3>
                  <p className="text-neutral-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary-300 to-teal-300"></div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button to="/analysis" size="lg">
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="section-container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-teal-600 p-12 md:p-16">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50"></div>
            
            <div className="relative text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-6">
                Ready to Breathe Healthier Air?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Start analyzing your indoor environment today with AI-powered insights
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button to="/analysis" variant="secondary" size="lg" className="bg-white hover:bg-neutral-50">
                  Start Free Analysis
                </Button>
                <Button to="/dashboard" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Explore Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
