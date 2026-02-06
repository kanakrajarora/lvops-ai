import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

AERODATABOX_API_KEY = os.getenv("AERODATABOX_API_KEY")

if not AERODATABOX_API_KEY:
    raise RuntimeError("AERODATABOX_API_KEY not set in .env")

BASE_URL = "https://aerodatabox.p.rapidapi.com/flights/number"


def resolve_flight(flight_number: str, date: str):
    """
    Resolve flight using AeroDataBox API.
    Returns origin, destination, scheduled departure and arrival times.
    """

    url = f"{BASE_URL}/{flight_number}/{date}"

    querystring = {
        "withAircraftImage": "false",
        "withLocation": "false",
        "withFlightPlan": "false",
        "dateLocalRole": "Both"
    }

    headers = {
        "x-rapidapi-key": AERODATABOX_API_KEY,
        "x-rapidapi-host": "aerodatabox.p.rapidapi.com"
    }

    response = requests.get(
        url,
        headers=headers,
        params=querystring,
        timeout=15
    )
    response.raise_for_status()

    data = response.json()

    if not data:
        raise Exception("No flight data returned from AeroDataBox")

    flight = data[0]

    return {
        "flight_number": flight_number,
        "airline": flight["airline"]["icao"],
        "origin": {
            "icao": flight["departure"]["airport"]["icao"]
        },
        "destination": {
            "icao": flight["arrival"]["airport"]["icao"]
        },
        "scheduled_departure": flight["departure"]["scheduledTime"]["utc"],
        "scheduled_arrival": flight["arrival"]["scheduledTime"]["utc"],
        "source": "AERODATABOX"
    }


# Local test (optional)
if __name__ == "__main__":
    print(resolve_flight("6E7027", "2026-01-12"))
