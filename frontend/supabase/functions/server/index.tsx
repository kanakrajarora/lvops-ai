import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to verify user from access token
async function verifyUser(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const accessToken = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    console.error('Authentication error:', error);
    return null;
  }
  
  return user;
}

// Health check endpoint
app.get("/make-server-c8556e82/health", (c) => {
  return c.json({ status: "ok" });
});

// Save flight prediction
app.post("/make-server-c8556e82/flights", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const flightData = await c.req.json();
    
    // Store flight with user ID
    const key = `flight:${user.id}:${flightData.trace_id}`;
    await kv.set(key, flightData);
    
    // Also store in user's flight list
    const userFlightsKey = `user_flights:${user.id}`;
    const existingFlights = await kv.get(userFlightsKey) || [];
    
    // Add trace_id to the beginning, keep last 50
    const updatedFlights = [flightData.trace_id, ...existingFlights.filter((id: string) => id !== flightData.trace_id)].slice(0, 50);
    await kv.set(userFlightsKey, updatedFlights);
    
    return c.json({ success: true, trace_id: flightData.trace_id });
  } catch (error) {
    console.error('Error saving flight:', error);
    return c.json({ error: 'Failed to save flight' }, 500);
  }
});

// Get user's tracked flights
app.get("/make-server-c8556e82/flights", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userFlightsKey = `user_flights:${user.id}`;
    const flightIds = await kv.get(userFlightsKey) || [];
    
    // Fetch all flights
    const flights = await Promise.all(
      flightIds.map(async (traceId: string) => {
        const key = `flight:${user.id}:${traceId}`;
        return await kv.get(key);
      })
    );
    
    // Filter out any null values
    const validFlights = flights.filter(f => f !== null);
    
    return c.json({ flights: validFlights });
  } catch (error) {
    console.error('Error fetching flights:', error);
    return c.json({ error: 'Failed to fetch flights' }, 500);
  }
});

// Get single flight by trace_id
app.get("/make-server-c8556e82/flights/:traceId", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const traceId = c.req.param('traceId');
    const key = `flight:${user.id}:${traceId}`;
    const flight = await kv.get(key);
    
    if (!flight) {
      return c.json({ error: 'Flight not found' }, 404);
    }
    
    return c.json({ flight });
  } catch (error) {
    console.error('Error fetching flight:', error);
    return c.json({ error: 'Failed to fetch flight' }, 500);
  }
});

// Delete flight
app.delete("/make-server-c8556e82/flights/:traceId", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const traceId = c.req.param('traceId');
    const key = `flight:${user.id}:${traceId}`;
    await kv.del(key);
    
    // Remove from user's flight list
    const userFlightsKey = `user_flights:${user.id}`;
    const existingFlights = await kv.get(userFlightsKey) || [];
    const updatedFlights = existingFlights.filter((id: string) => id !== traceId);
    await kv.set(userFlightsKey, updatedFlights);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting flight:', error);
    return c.json({ error: 'Failed to delete flight' }, 500);
  }
});

Deno.serve(app.fetch);