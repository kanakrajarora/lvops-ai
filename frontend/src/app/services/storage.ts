import type { FlightPredictionResponse } from './api';
import { supabase, getCurrentUser } from './supabase';

// Supabase-only storage - no localStorage fallback
// Users must be authenticated to use the application

export async function saveFlight(flight: FlightPredictionResponse): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('You must be logged in to save flights');
  }

  // Check if flight already exists
  const { data: existing } = await supabase
    .from('flights')
    .select('id')
    .eq('user_id', user.id)
    .eq('trace_id', flight.trace_id)
    .single();

  if (existing) {
    // Update existing flight
    const { error } = await supabase
      .from('flights')
      .update({
        flight_data: flight,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) throw error;
    console.log('✅ Flight updated in Supabase');
  } else {
    // Insert new flight
    const { error } = await supabase
      .from('flights')
      .insert({
        user_id: user.id,
        trace_id: flight.trace_id,
        flight_data: flight,
      });

    if (error) throw error;
    console.log('✅ Flight saved to Supabase');
  }
}

export async function getFlights(): Promise<FlightPredictionResponse[]> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('You must be logged in to view flights');
  }

  const { data, error } = await supabase
    .from('flights')
    .select('flight_data')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;

  console.log('✅ Flights loaded from Supabase');
  return (data || []).map(row => row.flight_data as FlightPredictionResponse);
}

export async function getFlight(traceId: string): Promise<FlightPredictionResponse | null> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('You must be logged in to view flights');
  }

  const { data, error } = await supabase
    .from('flights')
    .select('flight_data')
    .eq('user_id', user.id)
    .eq('trace_id', traceId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw error;
  }

  return data?.flight_data as FlightPredictionResponse || null;
}

export async function deleteFlight(traceId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('You must be logged in to delete flights');
  }

  const { error } = await supabase
    .from('flights')
    .delete()
    .eq('user_id', user.id)
    .eq('trace_id', traceId);

  if (error) throw error;
  console.log('✅ Flight deleted from Supabase');
}
