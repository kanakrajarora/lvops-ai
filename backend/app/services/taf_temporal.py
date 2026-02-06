import datetime
import numpy as np


def extract_taf_temporal_features(taf: dict, scheduled_departure: str):
    """
    Extract temporal weather features from NOAA TAF
    aligned with scheduled departure time.

    Assumptions:
    - scheduled_departure is UTC if naive
    - All internal comparisons are UTC-aware
    """

    # -----------------------------
    # Parse scheduled departure
    # -----------------------------
    dt = datetime.datetime.fromisoformat(scheduled_departure)

    # If naive → assume UTC (GLOBAL SAFE)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=datetime.UTC)

    dep_utc = dt.astimezone(datetime.UTC)

    # -----------------------------
    # Feature containers
    # -----------------------------
    vis_values = []
    fog_flags = []
    change_flags = []

    for fcst in taf.get("fcsts", []) or []:
        # -----------------------------
        # Forecast window (UTC)
        # -----------------------------
        start = datetime.datetime.fromtimestamp(
            fcst["timeFrom"], tz=datetime.UTC
        )
        end = datetime.datetime.fromtimestamp(
            fcst["timeTo"], tz=datetime.UTC
        )

        # Include forecasts covering or near departure
        time_diff_hours = abs((start - dep_utc).total_seconds()) / 3600

        if start <= dep_utc <= end or time_diff_hours <= 6:
            vis_km = fcst.get("visib", 10.0)
            wx = fcst.get("wxString") or ""
            change = fcst.get("fcstChange")

            vis_values.append(vis_km)

            fog_flags.append(
                1 if any(x in wx for x in ("FG", "BR", "MIFG")) else 0
            )

            change_flags.append(
                1 if change in ("BECMG", "TEMPO", "PROB30", "PROB40") else 0
            )

    # -----------------------------
    # No matching forecasts
    # -----------------------------
    if not vis_values:
        return {
            "taf_min_vis_km": None,
            "taf_mean_vis_km": None,
            "taf_trend": 0.0,
            "taf_volatility": 0.0,
            "taf_fog_probability": 0.0,
            "taf_change_intensity": 0.0
        }

    vis = np.array(vis_values)

    return {
        "taf_min_vis_km": float(vis.min()),
        "taf_mean_vis_km": float(vis.mean()),
        "taf_trend": float(np.polyfit(range(len(vis)), vis, 1)[0]),
        "taf_volatility": float(vis.std()),
        "taf_fog_probability": sum(fog_flags) / len(fog_flags),
        "taf_change_intensity": sum(change_flags) / len(change_flags)
    }



#if __name__ == "__main__":
#    from .taf_service import get_taf
#
#    taf = get_taf("VIDP")  # Delhi
#    features = extract_taf_temporal_features(
#        taf,
#        "2026-01-08T23:30:00"  # IST local departure time
#    )
#    print(features)
