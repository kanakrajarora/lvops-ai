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
        </CardContent>
      </Card>
    </div>
  );
}
