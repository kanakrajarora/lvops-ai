import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { TrendingDown, TrendingUp, Minus, Cloud, Eye, Droplet, AreaChart as ChartIcon } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface WeatherData {
  taf_min_vis_km: number;
  taf_mean_vis_km: number;
  taf_trend: number;
  taf_volatility: number;
  taf_fog_probability: number;
  taf_change_intensity: number;
  weather_source: string;
}

interface WeatherComparisonProps {
  origin: WeatherData;
  destination: WeatherData;
  originCode: string;
  destCode: string;
}

export function WeatherComparison({ origin, destination, originCode, destCode }: WeatherComparisonProps) {
  const getTrendIcon = (trend: number) => {
    if (trend > 0.1) return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    if (trend < -0.1) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const renderWeatherCard = (data: WeatherData, code: string, label: string) => {
    const volatilityData = Array.from({ length: 10 }, (_, i) => ({
      x: i,
      value: Math.random() * data.taf_volatility + (1 - data.taf_volatility) * 0.5,
    }));

    const isFoggy = data.taf_fog_probability > 0.5;

    return (
      <div className="flex-1 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h3 className="font-semibold text-lg text-foreground">{label}</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-semibold text-muted-foreground">{code}</span>
            <Badge variant="outline" className="text-xs font-medium px-2.5 py-1">
              {data.weather_source}
            </Badge>
          </div>
        </div>

        {/* Mean Visibility */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Mean Visibility
            </span>
            <span className="text-sm font-semibold text-foreground">{data.taf_mean_vis_km.toFixed(2)} km</span>
          </div>
          <Progress value={(data.taf_mean_vis_km / 10) * 100} className="h-2.5" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>0 km</span>
            <span className="font-medium">Min: {data.taf_min_vis_km.toFixed(2)} km</span>
            <span>10 km</span>
          </div>
        </div>

        {/* Fog Probability */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              Fog Probability
            </span>
            <span className="text-sm font-semibold text-foreground">{(data.taf_fog_probability * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${isFoggy ? 'bg-amber-500' : 'bg-purple-500'}`}
              style={{ width: `${data.taf_fog_probability * 100}%` }}
            />
          </div>
        </div>

        {/* Visibility Trend */}
        <div className="flex justify-between items-center p-4 bg-accent rounded-xl border border-border">
          <span className="text-sm font-medium text-muted-foreground">Visibility Trend</span>
          <div className="flex items-center gap-2">
            {getTrendIcon(data.taf_trend)}
            <span className="text-sm font-mono font-semibold text-foreground">
              {data.taf_trend > 0 ? "+" : ""}{(data.taf_trend * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Volatility */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ChartIcon className="h-4 w-4" />
              Volatility
            </span>
            <span className="text-sm font-semibold text-foreground">{(data.taf_volatility * 100).toFixed(0)}%</span>
          </div>
          <ResponsiveContainer width="100%" height={45}>
            <AreaChart data={volatilityData}>
              <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#818cf8" fillOpacity={0.25} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Change Intensity */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-muted-foreground">Change Intensity</span>
            <span className="text-sm font-semibold text-foreground">{(data.taf_change_intensity * 100).toFixed(0)}%</span>
          </div>
          <Progress value={data.taf_change_intensity * 100} className="h-2.5" />
        </div>

        {/* Warning for high fog probability */}
        {isFoggy && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
              <Cloud className="h-4 w-4" />
              <span>High Fog Probability Detected</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="border-border shadow-md">
      <CardHeader className="border-b border-border pb-6">
        <CardTitle className="text-xl font-semibold">Weather Intelligence Comparison</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">TAF-derived visibility and weather metrics</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex gap-10">
          {renderWeatherCard(origin, originCode, "Origin")}
          
          <div className="w-px bg-border" />
          
          {renderWeatherCard(destination, destCode, "Destination")}
        </div>
      </CardContent>
    </Card>
  );
}
