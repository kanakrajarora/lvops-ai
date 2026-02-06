-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create flights table
CREATE TABLE IF NOT EXISTS public.flights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trace_id TEXT NOT NULL,
  flight_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, trace_id)
);

-- Enable RLS
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;

-- Flights policies
CREATE POLICY "Users can view own flights"
  ON public.flights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flights"
  ON public.flights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flights"
  ON public.flights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flights"
  ON public.flights FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flights_user_id ON public.flights(user_id);
CREATE INDEX IF NOT EXISTS idx_flights_trace_id ON public.flights(trace_id);
CREATE INDEX IF NOT EXISTS idx_flights_created_at ON public.flights(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_flights_updated_at
  BEFORE UPDATE ON public.flights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
