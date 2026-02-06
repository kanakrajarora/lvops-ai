import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ExplainabilityFeature {
  feature: string;
  value: number;
  shap_contribution: number;
}

interface ExplainabilityPanelProps {
  features: ExplainabilityFeature[];
}

const featureLabels: Record<string, string> = {
  "origin_visibility": "Origin Visibility",
  "destination_visibility": "Destination Visibility",
  "origin_ceiling": "Origin Ceiling Height",
  "destination_ceiling": "Destination Ceiling Height",
  "weather_conditions": "Weather Conditions",
  "time_of_day": "Time of Day",
  "dest_fog_prob": "Destination Fog Probability",
  "dest_change_intensity": "Destination Change Intensity",
  "dest_volatility": "Destination Volatility",
  "origin_volatility": "Origin Volatility",
  "dep_hour": "Departure Hour",
  "dest_min_vis": "Destination Min Visibility",
  "origin_min_vis": "Origin Min Visibility",
  "dest_mean_vis": "Destination Mean Visibility",
  "origin_mean_vis": "Origin Mean Visibility",
  "origin_fog_prob": "Origin Fog Probability",
  "arr_hour": "Arrival Hour",
};

export function ExplainabilityPanel({ features }: ExplainabilityPanelProps) {
  const sortedFeatures = [...features].sort((a, b) => 
    Math.abs(b.shap_contribution) - Math.abs(a.shap_contribution)
  );

  const chartData = sortedFeatures.map(f => ({
    name: featureLabels[f.feature] || f.feature,
    impact: parseFloat((f.shap_contribution * 100).toFixed(2)),
    value: f.value,
    isPositive: f.shap_contribution > 0,
  }));

  return (
    <Card className="border-border shadow-md">
      <CardHeader className="border-b border-border pb-6">
        <CardTitle className="text-xl font-semibold">Feature Impact Analysis (SHAP)</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Understanding what factors contribute to the delay prediction
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 180, right: 20, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.6} />
            <XAxis 
              type="number" 
              domain={['dataMin', 'dataMax']}
              label={{ value: 'Impact on Delay (%)', position: 'bottom', fill: '#64748B', fontSize: 12 }}
              tick={{ fill: '#64748B', fontSize: 11 }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#334155' }}
              width={170}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '8px 12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}
              formatter={(value: number, name: string, props: any) => [
                `${value > 0 ? '+' : ''}${value}% (Value: ${props.payload.value.toFixed(2)})`,
                'Impact'
              ]}
            />
            <Bar dataKey="impact" radius={[0, 6, 6, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isPositive ? "#EF4444" : "#10B981"} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-8 space-y-3">
          <h4 className="font-semibold text-sm text-foreground mb-4">Key Insights:</h4>
          {sortedFeatures.slice(0, 3).map((feature, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 bg-accent rounded-xl border border-border">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                feature.shap_contribution > 0 ? 'bg-red-500' : 'bg-emerald-500'
              }`} />
              <div className="flex-1">
                <div className="font-semibold text-sm text-foreground">
                  {featureLabels[feature.feature] || feature.feature}
                </div>
                <div className="text-xs text-muted-foreground mt-1.5 space-x-3">
                  <span>Value: <span className="font-medium text-foreground">{feature.value.toFixed(2)}</span></span>
                  <span>•</span>
                  <span>Impact: <span className="font-medium text-foreground">{
                    feature.shap_contribution > 0 ? '+' : ''
                  }{(feature.shap_contribution * 100).toFixed(2)}%</span></span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 italic">
                  {feature.shap_contribution > 0 
                    ? "Increases delay probability" 
                    : "Decreases delay probability"}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-muted-foreground">Increases Delay Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded" />
            <span className="text-muted-foreground">Decreases Delay Risk</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
