import { saveFlight, getFlights, getFlight, deleteFlight } from './storage';

export interface FlightPredictionRequest {
  flight_number: string;
  date: string;
}

export interface FlightPredictionResponse {
  trace_id: string;
  flight: {
    flight_number: string;
    airline: string;
    origin: {
      icao: string;
    };
    destination: {
      icao: string;
    };
    scheduled_departure: string;
    scheduled_arrival: string;
    source: string;
  };
  origin_weather: {
    taf_min_vis_km: number;
    taf_mean_vis_km: number;
    taf_trend: number;
    taf_volatility: number;
    taf_fog_probability: number;
    taf_change_intensity: number;
    weather_source: string;
    taf_issue_time_utc?: string;
    taf_valid_from_utc?: string;
    taf_valid_to_utc?: string;
    taf_raw?: string;
  };
  destination_weather: {
    taf_min_vis_km: number;
    taf_mean_vis_km: number;
    taf_trend: number;
    taf_volatility: number;
    taf_fog_probability: number;
    taf_change_intensity: number;
    weather_source: string;
    taf_issue_time_utc?: string;
    taf_valid_from_utc?: string;
    taf_valid_to_utc?: string;
    taf_raw?: string;
  };
  operational_feasibility: {
    origin_takeoff_ok: boolean;
    destination_landing_ok: boolean;
  };
  prediction: {
    delay_probability: number;
  };
  explainability: Array<{
    feature: string;
    value: number;
    shap_contribution: number;
  }>;
  decision: {
    action: string;
    reason: string;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

// Removed mock data generator - using real backend only

export async function predictFlightDelay(
  request: FlightPredictionRequest
): Promise<FlightPredictionResponse> {
  // Use GET request with query parameters
  const url = new URL(`${API_BASE_URL}/predict`);
  url.searchParams.append('flight_number', request.flight_number);
  url.searchParams.append('date', request.date);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ FastAPI backend connected successfully');
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - backend took too long to respond. Please try again.');
    }
    
    throw new Error(`Failed to connect to backend API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Storage service wrappers
export async function saveTrackedFlight(flight: FlightPredictionResponse) {
  return saveFlight(flight);
}

export async function getTrackedFlights(): Promise<FlightPredictionResponse[]> {
  return getFlights();
}

export async function getFlightByTraceId(traceId: string): Promise<FlightPredictionResponse | null> {
  return getFlight(traceId);
}

export async function deleteTrackedFlight(traceId: string) {
  return deleteFlight(traceId);
}