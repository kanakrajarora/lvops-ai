import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface DelayProbabilityGaugeProps {
  probability: number;
}

export function DelayProbabilityGauge({ probability }: DelayProbabilityGaugeProps) {
  const percentage = Math.round(probability * 100);
  
  // Determine color based on probability - refined palette
  const getColor = () => {
    if (probability < 0.2) return "#10b981"; // emerald-500
    if (probability < 0.4) return "#84cc16"; // lime-500
    if (probability < 0.6) return "#f59e0b"; // amber-500
    if (probability < 0.8) return "#f97316"; // orange-500
    return "#ef4444"; // red-500
  };

  const color = getColor();
  const data = [
    { name: "Probability", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={65}
            outerRadius={90}
            paddingAngle={0}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={color} />
            <Cell fill="#F1F5F9" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
        <div className="text-5xl font-bold tracking-tight" style={{ color }}>
          {percentage}%
        </div>
        <div className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-wide">Delay Probability</div>
      </div>
    </div>
  );
}
