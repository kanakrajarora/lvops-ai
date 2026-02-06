# Supabase Database Setup

This application uses Supabase for authentication and flight data storage. Follow these steps to set up your database.

## Database Schema

The application requires two tables:

### 1. Profiles Table
Stores user profile information.

### 2. Flights Table
Stores flight prediction data for each user.

## Setup Instructions

### Option 1: Using the Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `/supabase/migrations/001_initial_schema.sql`
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

## Verification

After running the migration, verify that:

1. Both tables (`profiles` and `flights`) are created
2. Row Level Security (RLS) is enabled on both tables
3. All policies are in place
4. Indexes are created

You can check this in the Supabase Dashboard:
- Tables: **Database** → **Tables**
- RLS Policies: **Authentication** → **Policies**
- Indexes: **Database** → **Indexes**

## Database Structure

### `profiles` table
- `id` (UUID, Primary Key, References auth.users)
- `email` (TEXT)
- `name` (TEXT, nullable)
- `created_at` (TIMESTAMP)

### `flights` table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `trace_id` (TEXT)
- `flight_data` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- Unique constraint on `(user_id, trace_id)`

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Users can insert, update, and delete their own records
- Profile data is properly scoped to the authenticated user

## Features

- **Automatic timestamps**: The `flights` table automatically updates `updated_at` on modifications
- **Data integrity**: Foreign key constraints ensure data consistency
- **Performance**: Indexes on frequently queried columns for optimal performance
- **Security**: RLS policies protect user data

## Troubleshooting

If you encounter issues:

1. **Tables not created**: Ensure you're running the SQL in the correct Supabase project
2. **Permission errors**: Verify that RLS policies are correctly applied
3. **Connection issues**: Check that your Supabase URL and anon key in `/utils/supabase/info.tsx` are correct

## Demo Mode

The application works without Supabase authentication using localStorage. When a user signs in:
- Data is automatically migrated from localStorage to Supabase
- Future flights are saved to Supabase
- Data persists across devices when logged in
