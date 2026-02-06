import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area } from "recharts";
import { format, parseISO, addHours, subHours } from "date-fns";

interface VisibilityTimelineProps {
  origin: {
    taf_min_vis_km: number;
    taf_mean_vis_km: number;
    taf_fog_probability: number;
    taf_valid_from_utc?: string;
    taf_valid_to_utc?: string;
  };
  destination: {
    taf_min_vis_km: number;
    taf_mean_vis_km: number;
    taf_fog_probability: number;
    taf_valid_from_utc?: string;
    taf_valid_to_utc?: string;
  };
  scheduledDeparture: string;
  scheduledArrival: string;
}

export function VisibilityTimeline({
  origin,
  destination,
  scheduledDeparture,
  scheduledArrival,
}: VisibilityTimelineProps) {
  const generateTimelineData = () => {
    const depTime = parseISO(scheduledDeparture);
    const arrTime = parseISO(scheduledArrival);
    
    const startTime = origin.taf_valid_from_utc 
      ? parseISO(origin.taf_valid_from_utc)
      : subHours(depTime, 6);
    
    const data = [];
    const hours = 18;
    
    for (let i = 0; i < hours; i++) {
      const currentTime = addHours(startTime, i);
      const timestamp = currentTime.getTime();
      const depTimestamp = depTime.getTime();
      const arrTimestamp = arrTime.getTime();
      
      let originVis = origin.taf_mean_vis_km;
      let destVis = destination.taf_mean_vis_km;
      
      const timeRatio = i / hours;
      const originVariation = (origin.taf_mean_vis_km - origin.taf_min_vis_km) * 
        (Math.sin(timeRatio * Math.PI * 2) + 1) / 2;
      const destVariation = (destination.taf_mean_vis_km - destination.taf_min_vis_km) * 
        (Math.cos(timeRatio * Math.PI * 2 + Math.PI / 2) + 1) / 2;
      
      originVis = origin.taf_min_vis_km + originVariation;
      destVis = destination.taf_min_vis_km + destVariation;
      
      originVis = Math.max(0.1, Math.min(10, originVis));
      destVis = Math.max(0.1, Math.min(10, destVis));
      
      const fogZone = (origin.taf_fog_probability > 0.5 || destination.taf_fog_probability > 0.5 || originVis < 2 || destVis < 2) ? 2 : 0;
      
      data.push({
        time: format(currentTime, "HH:mm"),
        timestamp,
        originVis: parseFloat(originVis.toFixed(2)),
        destVis: parseFloat(destVis.toFixed(2)),
        fogZone,
        isDeparture: Math.abs(timestamp - depTimestamp) < 900000,
        isArrival: Math.abs(timestamp - arrTimestamp) < 900000,
      });
    }
    
    return data;
  };

  const timelineData = generateTimelineData();
  const depTime = parseISO(scheduledDeparture);
  const arrTime = parseISO(scheduledArrival);

  return (
    <Card className="border-border shadow-md">
      <CardHeader className="border-b border-border pb-6">
        <CardTitle className="text-xl font-semibold">Visibility Timeline (18h Forecast)</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Projected visibility progression based on TAF data
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={timelineData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.6} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 11, fill: '#64748B' }}
              interval={2}
            />
            <YAxis 
              label={{ value: 'Visibility (km)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 12 }}
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fontSize: 11, fill: '#64748B' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '8px 12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}
              formatter={(value: number, name: string) => {
                const label = name === 'originVis' ? 'Origin' : name === 'destVis' ? 'Destination' : name;
                return [`${value} km`, label];
              }}
              labelFormatter={(label) => `Time: ${label} UTC`}
            />
            
            {/* Fog zones */}
            <Area
              type="monotone"
              dataKey="fogZone"
              fill="#FCA5A5"
              fillOpacity={0.15}
              stroke="none"
            />
            
            {/* Critical visibility threshold */}
            <ReferenceLine
              y={2}
              stroke="#EF4444"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={{ value: 'Critical: 2km', position: 'right', fill: '#EF4444', fontSize: 11, fontWeight: 500 }}
            />
            
            {/* Visibility lines */}
            <Line
              type="monotone"
              dataKey="originVis"
              stroke="#3B82F6"
              strokeWidth={2.5}
              dot={false}
              name="Origin"
            />
            <Line
              type="monotone"
              dataKey="destVis"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              dot={false}
              name="Destination"
            />
            
            {/* Departure and Arrival markers */}
            <ReferenceLine
              x={format(depTime, "HH:mm")}
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{ value: 'STD', position: 'top', fill: '#10B981', fontWeight: 'bold', fontSize: 11 }}
            />
            <ReferenceLine
              x={format(arrTime, "HH:mm")}
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{ value: 'STA', position: 'top', fill: '#F59E0B', fontWeight: 'bold', fontSize: 11 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="flex justify-center gap-8 mt-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-blue-500 rounded" />
            <span className="text-muted-foreground">Origin Visibility</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-purple-500 rounded" />
            <span className="text-muted-foreground">Destination Visibility</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-red-300 rounded opacity-30" />
            <span className="text-muted-foreground">Fog/Low Visibility Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 border-t-2 border-dashed border-emerald-500" />
            <span className="text-muted-foreground">Departure (STD)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 border-t-2 border-dashed border-amber-500" />
            <span className="text-muted-foreground">Arrival (STA)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
