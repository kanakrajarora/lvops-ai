import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { Search, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Plane, Calendar } from "lucide-react";
import { getTrackedFlights } from "@/app/services/api";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import type { FlightPredictionResponse } from "@/app/services/api";

export function Dashboard() {
  const [trackedFlights, setTrackedFlights] = useState<FlightPredictionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    setLoading(true);
    try {
      const flights = await getTrackedFlights();
      setTrackedFlights(flights);
    } catch (error) {
      console.error('Error loading flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDelayColor = (probability: number) => {
    if (probability < 0.2) return "text-emerald-600";
    if (probability < 0.4) return "text-lime-600";
    if (probability < 0.6) return "text-amber-600";
    if (probability < 0.8) return "text-orange-600";
    return "text-red-600";
  };

  const getActionBadgeVariant = (recommendation: string): "default" | "destructive" | "secondary" | "outline" => {
    if (recommendation === "NO_ACTION") return "secondary";
    if (recommendation === "MONITOR") return "outline";
    if (recommendation === "MONITOR_AND_PREPARE") return "default";
    if (recommendation === "PROACTIVE_RESCHEDULE" || recommendation === "CANCEL") return "destructive";
    return "default";
  };

  const stats = {
    total: trackedFlights.length,
    highRisk: trackedFlights.filter(f => f.prediction.delay_probability >= 0.6).length,
    dispatchable: trackedFlights.filter(f => 
      f.operational_feasibility.origin_takeoff_ok && 
      f.operational_feasibility.destination_landing_ok
    ).length,
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground text-sm">Loading flights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header - Enhanced typography */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Operations Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-sm">Real-time delay predictions and operational intelligence</p>
        </div>
        <Link to="/app/search">
          <Button className="gap-2 shadow-md hover:shadow-lg transition-all">
            <Search className="h-4 w-4" />
            Analyze New Flight
          </Button>
        </Link>
      </div>

      {/* Stats Cards - Enhanced with better spacing and visual hierarchy */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="border-border shadow-md hover:shadow-lg transition-all duration-200 card-hover">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Total Tracked</p>
                <p className="text-4xl font-bold text-foreground tracking-tight">{stats.total}</p>
              </div>
              <div className="h-14 w-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <Plane className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-md hover:shadow-lg transition-all duration-200 card-hover">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">High Risk</p>
                <p className="text-4xl font-bold text-foreground tracking-tight">{stats.highRisk}</p>
              </div>
              <div className="h-14 w-14 bg-red-50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-md hover:shadow-lg transition-all duration-200 card-hover">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Dispatchable</p>
                <p className="text-4xl font-bold text-foreground tracking-tight">{stats.dispatchable}</p>
              </div>
              <div className="h-14 w-14 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-md hover:shadow-lg transition-all duration-200 card-hover">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Avg Delay Prob</p>
                <p className="text-4xl font-bold text-foreground tracking-tight">
                  {trackedFlights.length > 0
                    ? Math.round(
                        (trackedFlights.reduce((acc, f) => acc + f.prediction.delay_probability, 0) /
                          trackedFlights.length) *
                          100
                      )
                    : 0}%
                </p>
              </div>
              <div className="h-14 w-14 bg-amber-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracked Flights - Enhanced card styling */}
      <Card className="border-border shadow-md">
        <CardHeader className="border-b border-border bg-card pb-5">
          <CardTitle className="text-xl font-semibold">Tracked Flights</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {trackedFlights.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plane className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Tracked Flights</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Start analyzing flights to see them appear here
              </p>
              <Link to="/app/search">
                <Button className="shadow-md">
                  <Search className="h-4 w-4 mr-2" />
                  Search Flight
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {trackedFlights.map((flight) => (
                <Link key={flight.trace_id} to={`/app/results/${flight.trace_id}`}>
                  <div className="border border-border rounded-xl p-5 hover:border-primary hover:bg-accent/50 transition-all duration-150 cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                          <Plane className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-foreground tracking-tight">{flight.flight.flight_number}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1.5">
                            <span className="font-medium">{flight.flight.origin.icao}</span>
                            <span className="text-border">→</span>
                            <span className="font-medium">{flight.flight.destination.icao}</span>
                            <span className="text-border">•</span>
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{format(parseISO(flight.flight.scheduled_departure), "MMM dd, HH:mm")}</span>
                          </div>
                        </div>
                      </div>

                      <Badge 
                        variant={getActionBadgeVariant(flight.decision.action)}
                        className="px-3 py-1.5 font-medium"
                      >
                        {flight.decision.action.replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-6 pl-16">
                      {/* Delay Probability */}
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Delay Probability</div>
                        <div className={`text-2xl font-bold tracking-tight ${getDelayColor(flight.prediction.delay_probability)}`}>
                          {Math.round(flight.prediction.delay_probability * 100)}%
                        </div>
                        <Progress 
                          value={flight.prediction.delay_probability * 100} 
                          className="h-2 mt-3"
                        />
                      </div>

                      {/* Origin Feasibility */}
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Origin Takeoff</div>
                        <div className="flex items-center gap-2 mt-2">
                          {flight.operational_feasibility.origin_takeoff_ok ? (
                            <>
                              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                              <span className="text-sm font-semibold text-emerald-700">Feasible</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-5 w-5 text-red-600" />
                              <span className="text-sm font-semibold text-red-700">Not Feasible</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Destination Feasibility */}
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Destination Landing</div>
                        <div className="flex items-center gap-2 mt-2">
                          {flight.operational_feasibility.destination_landing_ok ? (
                            <>
                              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                              <span className="text-sm font-semibold text-emerald-700">Feasible</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-5 w-5 text-red-600" />
                              <span className="text-sm font-semibold text-red-700">Not Feasible</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}