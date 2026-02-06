import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { predictFlightDelay, saveTrackedFlight } from "@/app/services/api";

export function FlightSearch() {
  const [flightNumber, setFlightNumber] = useState("");
  const [flightDate, setFlightDate] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFlightDate(today);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!flightNumber || !flightDate) {
      toast.error("Please enter flight number and date");
      return;
    }

    setLoading(true);
    try {
      const result = await predictFlightDelay({
        flight_number: flightNumber,
        date: flightDate,
      });
      
      // Save to tracked flights
      try {
        await saveTrackedFlight(result);
      } catch (saveError) {
        // Silently handle storage errors - not critical
      }
      
      toast.success("Flight analysis complete");
      navigate(`/app/results/${result.trace_id}`);
    } catch (error) {
      console.error("Error fetching flight data:", error);
      toast.error("Failed to fetch flight data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-border shadow-lg">
        <CardHeader className="border-b border-border pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
              <Search className="h-5 w-5 text-white" />
            </div>
            Flight Delay Prediction
          </CardTitle>
          <CardDescription className="text-sm mt-3">
            Enter flight details to analyze delay probability based on weather conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="flightNumber" className="text-sm font-medium">Flight Number</Label>
              <Input
                id="flightNumber"
                type="text"
                placeholder="e.g., 6E2292"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                required
                className="h-11 text-base border-border focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Enter the flight number (e.g., 6E2292, AI101)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flightDate" className="text-sm font-medium">Flight Date</Label>
              <Input
                id="flightDate"
                type="date"
                value={flightDate}
                onChange={(e) => setFlightDate(e.target.value)}
                required
                className="h-11 text-base border-border focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Select the scheduled departure date</p>
            </div>

            <Button type="submit" className="w-full h-11 font-medium shadow-md hover:shadow-lg transition-all" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze Flight
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 p-5 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3 text-sm">System Features:</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Real-time TAF/METAR weather data analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Machine learning delay probability (98.3% accuracy)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>ILS Category operational feasibility assessment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>SHAP-based explainability insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Actionable operational recommendations</span>
              </li>
            </ul>
          </div>

          <div className="mt-5 p-5 bg-amber-50 rounded-xl border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-3 text-sm">Try These Examples:</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <button 
                type="button"
                onClick={() => setFlightNumber("6E2292")}
                className="text-left px-4 py-3 bg-white rounded-lg border border-amber-300 hover:bg-amber-50 hover:border-amber-400 transition-all"
              >
                <span className="font-mono text-amber-900 font-semibold block mb-1">6E2292</span>
                <span className="text-xs text-amber-700">IndiGo Delhi-Mumbai</span>
              </button>
              <button 
                type="button"
                onClick={() => setFlightNumber("AI101")}
                className="text-left px-4 py-3 bg-white rounded-lg border border-amber-300 hover:bg-amber-50 hover:border-amber-400 transition-all"
              >
                <span className="font-mono text-amber-900 font-semibold block mb-1">AI101</span>
                <span className="text-xs text-amber-700">Air India Sample</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}