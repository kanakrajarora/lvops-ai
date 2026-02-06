def build_features(
    flight: dict,
    origin_weather: dict,
    destination_weather: dict
):
    """
    Convert flight + origin & destination weather context
    into a fixed-length numeric feature vector.

    Retains:
    - min_vis
    - volatility
    - fog_probability
    - change_intensity

    Adds:
    - destination weather
    - CAT minima feasibility flags
    """

    # -----------------------------
    # Time-based features
    # -----------------------------
    dep_hour = int(flight["scheduled_departure"][11:13])
    arr_hour = int(flight["scheduled_arrival"][11:13])

    origin_icao = flight["origin"]["icao"]
    dest_icao = flight["destination"]["icao"]

    # -----------------------------
    # Origin weather features
    # -----------------------------
    o_min_vis = origin_weather.get("taf_min_vis_km", 10.0)
    o_vol = origin_weather.get("taf_volatility", 0.0)
    o_fog = origin_weather.get("taf_fog_probability", 0.0)
    o_change = origin_weather.get("taf_change_intensity", 0.0)

    # -----------------------------
    # Destination weather features
    # -----------------------------
    d_min_vis = destination_weather.get("taf_min_vis_km", 10.0)
    d_vol = destination_weather.get("taf_volatility", 0.0)
    d_fog = destination_weather.get("taf_fog_probability", 0.0)
    d_change = destination_weather.get("taf_change_intensity", 0.0)

    # -----------------------------
    # FINAL FEATURE VECTOR
    # ORDER MUST NEVER CHANGE
    # -----------------------------
    return [
        dep_hour,                # 0  Departure hour
        o_min_vis,               # 1  Origin min visibility
        o_vol,                   # 2  Origin volatility
        o_fog,                   # 3  Origin fog probability
        o_change,                # 4  Origin forecast change intensity

        arr_hour,                # 5  Arrival hour
        d_min_vis,               # 6  Destination min visibility
        d_vol,                   # 7  Destination volatility
        d_fog,                   # 8  Destination fog probability
        d_change,                # 9  Destination forecast change intensity
    ]

# Example usage
'''if __name__ == "__main__":
    flight = {
        "scheduled_departure": "2026-01-08T19:30:00+05:30",
        "scheduled_arrival": "2026-01-08T21:05:00+05:30",
        "origin": {"icao": "VILK"},
        "destination": {"icao": "CYYC"}
    }

    origin_weather = {
        "taf_min_vis_km": 0.5,
        "taf_volatility": 0.12,
        "taf_fog_probability": 1.0,
        "taf_change_intensity": 0.4
    }

    destination_weather = {
        "taf_min_vis_km": 0.2,
        "taf_volatility": 0.3,
        "taf_fog_probability": 1.0,
        "taf_change_intensity": 0.6
    }

    features = build_features(
        flight,
        origin_weather,
        destination_weather
    )

    print(features)'''
