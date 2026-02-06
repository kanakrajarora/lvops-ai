import { useParams, Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle, Plane, Calendar, Clock } from "lucide-react";
import { DelayProbabilityGauge } from "@/app/components/DelayProbabilityGauge";
import { WeatherComparison } from "@/app/components/WeatherComparison";
import { VisibilityTimeline } from "@/app/components/VisibilityTimeline";
import { ExplainabilityPanel } from "@/app/components/ExplainabilityPanel";
import { getFlightByTraceId } from "@/app/services/api";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import type { FlightPredictionResponse } from "@/app/services/api";

export function FlightResults() {
  const { traceId } = useParams();
  const [flight, setFlight] = useState<FlightPredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (traceId) {
      loadFlight(traceId);
    }
  }, [traceId]);

  const loadFlight = async (id: string) => {
    setLoading(true);
    try {
      const flightData = await getFlightByTraceId(id);
      setFlight(flightData);
    } catch (error) {
      console.error('Error loading flight:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground text-sm">Loading flight data...</p>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="text-center py-16">
        <div className="h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Flight Not Found</h2>
        <p className="text-muted-foreground mb-6 text-sm">The requested flight data could not be found.</p>
        <Link to="/search">
          <Button className="shadow-md">Search New Flight</Button>
        </Link>
      </div>
    );
  }

  const getActionBadge = (action: string) => {
    const actionMap: Record<string, { variant: "default" | "destructive" | "secondary" | "outline", label: string }> = {
      "NO_ACTION": { variant: "secondary", label: "No Action Required" },
      "MONITOR": { variant: "outline", label: "Monitor Conditions" },
      "MONITOR_AND_PREPARE": { variant: "default", label: "Monitor & Prepare" },
      "PROACTIVE_RESCHEDULE": { variant: "destructive", label: "Consider Rescheduling" },
      "CANCEL": { variant: "destructive", label: "High Delay Risk" },
    };
    
    const config = actionMap[action] || { variant: "outline" as const, label: action.replace(/_/g, ' ') };
    return <Badge variant={config.variant} className="px-3 py-1.5 font-medium">{config.label}</Badge>;
  };

  const getDispatchStatus = () => {
    const { origin_takeoff_ok, destination_landing_ok } = flight.operational_feasibility;
    if (origin_takeoff_ok && destination_landing_ok) {
      return {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
        text: "Operations Supported",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      };
    }
    return {
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      text: "Operations Not Supported",
      color: "text-red-700 bg-red-50 border-red-200",
    };
  };

  const dispatchStatus = getDispatchStatus();

  const getRiskCategory = (probability: number): string => {
    if (probability >= 0.6) return "HIGH";
    if (probability >= 0.3) return "MEDIUM";
    return "LOW";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/app/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-accent transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="text-xs text-muted-foreground">
          Trace ID: <span className="font-mono text-foreground">{flight.trace_id}</span>
        </div>
      </div>

      {/* Flight Header Card */}
      <Card className="border-border shadow-md">
        <CardHeader className="border-b border-border pb-6">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-semibold tracking-tight mb-3">
                {flight.flight.flight_number}
              </CardTitle>
              <div className="flex items-center gap-5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4" />
                  <span className="font-medium">
                    {flight.flight.airline} • {flight.flight.origin.icao} → {flight.flight.destination.icao}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(parseISO(flight.flight.scheduled_departure), "MMM dd, yyyy")}</span>
                </div>
              </div>
            </div>
            {getActionBadge(flight.decision.action)}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-8">
            {/* Route */}
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Route</div>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-foreground tracking-tight">{flight.flight.origin.icao}</div>
                <div className="text-2xl text-muted-foreground">→</div>
                <div className="text-3xl font-bold text-foreground tracking-tight">{flight.flight.destination.icao}</div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Source: <span className="font-medium">{flight.flight.source}</span>
              </div>
            </div>

            {/* Departure */}
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Scheduled Departure (STD)</div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-semibold text-foreground">
                  {format(parseISO(flight.flight.scheduled_departure), "HH:mm")} UTC
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {format(parseISO(flight.flight.scheduled_departure), "MMM dd, yyyy")}
              </div>
            </div>

            {/* Arrival */}
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Scheduled Arrival (STA)</div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-semibold text-foreground">
                  {format(parseISO(flight.flight.scheduled_arrival), "HH:mm")} UTC
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {format(parseISO(flight.flight.scheduled_arrival), "MMM dd, yyyy")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Delay Probability */}
        <Card className="border-border shadow-md">
          <CardHeader className="border-b border-border pb-5">
            <CardTitle className="text-lg font-semibold">Delay Probability</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <DelayProbabilityGauge probability={flight.prediction.delay_probability} />
            <div className="mt-6 p-4 bg-accent rounded-xl border border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Risk Category</span>
                <Badge variant={
                  getRiskCategory(flight.prediction.delay_probability) === "HIGH" ? "destructive" : 
                  getRiskCategory(flight.prediction.delay_probability) === "MEDIUM" ? "default" : 
                  "secondary"
                } className="px-3 py-1.5 font-semibold">
                  {getRiskCategory(flight.prediction.delay_probability)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operational Status */}
        <Card className="border-border shadow-md">
          <CardHeader className="border-b border-border pb-5">
            <CardTitle className="text-lg font-semibold">Operational Feasibility</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${dispatchStatus.color}`}>
              {dispatchStatus.icon}
              <span className="font-semibold">{dispatchStatus.text}</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Origin Takeoff</span>
                {flight.operational_feasibility.origin_takeoff_ok ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1">
                    ✓ Feasible
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="px-3 py-1">✗ Not Feasible</Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Destination Landing</span>
                {flight.operational_feasibility.destination_landing_ok ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1">
                    ✓ Feasible
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="px-3 py-1">✗ Not Feasible</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Decision */}
        <Card className="border-border shadow-md">
          <CardHeader className="border-b border-border pb-5">
            <CardTitle className="text-lg font-semibold">Operational Decision</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="font-semibold text-blue-900 mb-3 text-base">
                  {flight.decision.action.replace(/_/g, ' ')}
                </div>
                <p className="text-sm text-blue-800 leading-relaxed">
                  {flight.decision.reason}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weather Comparison */}
      <WeatherComparison
        origin={flight.origin_weather}
        destination={flight.destination_weather}
        originCode={flight.flight.origin.icao}
        destCode={flight.flight.destination.icao}
      />

      {/* Visibility Timeline */}
      <VisibilityTimeline
        origin={flight.origin_weather}
        destination={flight.destination_weather}
        scheduledDeparture={flight.flight.scheduled_departure}
        scheduledArrival={flight.flight.scheduled_arrival}
      />

      {/* Explainability */}
      <ExplainabilityPanel features={flight.explainability} />

      {/* Raw TAF Data */}
      {(flight.origin_weather.taf_raw || flight.destination_weather.taf_raw) && (
        <Card className="border-border shadow-md">
          <CardHeader className="border-b border-border pb-5">
            <CardTitle className="text-lg font-semibold">Raw TAF Data</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {flight.origin_weather.taf_raw && (
              <div>
                <div className="text-sm font-semibold text-foreground mb-3">
                  Origin ({flight.flight.origin.icao})
                </div>
                <pre className="text-xs bg-slate-50 p-4 rounded-xl border border-border overflow-x-auto font-mono leading-relaxed text-slate-800">
                  {flight.origin_weather.taf_raw}
                </pre>
                {flight.origin_weather.taf_issue_time_utc && (
                  <div className="mt-3 text-xs text-muted-foreground flex gap-4">
                    <span>Issued: <span className="font-medium text-foreground">{format(parseISO(flight.origin_weather.taf_issue_time_utc), "MMM dd, HH:mm")}</span> UTC</span>
                    {flight.origin_weather.taf_valid_from_utc && flight.origin_weather.taf_valid_to_utc && (
                      <span>
                        Valid: <span className="font-medium text-foreground">{format(parseISO(flight.origin_weather.taf_valid_from_utc), "HH:mm")} - {format(parseISO(flight.origin_weather.taf_valid_to_utc), "HH:mm")}</span> UTC
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
            {flight.destination_weather.taf_raw && (
              <div>
                <div className="text-sm font-semibold text-foreground mb-3">
                  Destination ({flight.flight.destination.icao})
                </div>
                <pre className="text-xs bg-slate-50 p-4 rounded-xl border border-border overflow-x-auto font-mono leading-relaxed text-slate-800">
                  {flight.destination_weather.taf_raw}
                </pre>
                {flight.destination_weather.taf_issue_time_utc && (
                  <div className="mt-3 text-xs text-muted-foreground flex gap-4">
                    <span>Issued: <span className="font-medium text-foreground">{format(parseISO(flight.destination_weather.taf_issue_time_utc), "MMM dd, HH:mm")}</span> UTC</span>
                    {flight.destination_weather.taf_valid_from_utc && flight.destination_weather.taf_valid_to_utc && (
                      <span>
                        Valid: <span className="font-medium text-foreground">{format(parseISO(flight.destination_weather.taf_valid_from_utc), "HH:mm")} - {format(parseISO(flight.destination_weather.taf_valid_to_utc), "HH:mm")}</span> UTC
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
