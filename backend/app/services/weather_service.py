from .taf_service import get_taf
from .taf_temporal import extract_taf_temporal_features
from .metar_service import get_metar
import datetime
import pytz


# -----------------------------
# Helper: parse event time to UTC
# -----------------------------
def _parse_event_time_utc(event_time: str) -> datetime.datetime:
    """
    Convert ISO event time (local or UTC) to UTC-aware datetime.
    """
    dt = datetime.datetime.fromisoformat(event_time)

    if dt.tzinfo is None:
        # Assume already UTC if no tzinfo (your flight_resolver now outputs Z)
        dt = dt.replace(tzinfo=datetime.UTC)

    return dt.astimezone(datetime.UTC)


# -----------------------------
# Helper: extract METAR features
# -----------------------------
def _extract_metar_features(metar: dict):
    wx = metar.get("wxString") or ""
    raw = metar.get("rawOb", "")

    # ---- Handle CAVOK explicitly ----
    if "CAVOK" in raw:
        vis_km = 10.0
        fog = 0
        change = 0
    else:
        # Prefer RVR if present
        if metar.get("runwayVisualRange"):
            vis_km = min(
                rvr.get("value", 10000)
                for rvr in metar["runwayVisualRange"]
            ) / 1000
        else:
            vis_km = metar.get("visibility", 10000) / 1000

        fog = 1 if any(x in wx for x in ["FG", "BR", "MIFG", "HZ"]) else 0
        change = 1 if any(x in wx for x in ["BECMG", "TEMPO", "NOSIG"]) else 0

    return {
        "taf_min_vis_km": vis_km,
        "taf_mean_vis_km": vis_km,
        "taf_trend": 0.0,
        "taf_volatility": 0.0,
        "taf_fog_probability": float(fog),
        "taf_change_intensity": float(change)
    }

# -----------------------------
# Main weather service
# -----------------------------
def get_weather_risk(icao: str, event_time: str):
    """
    Fetch weather risk features aligned with a given event time.
    Uses TAF primarily, falls back to METAR within ±3 hours.

    Parameters
    ----------
    icao : str
        ICAO airport code
    event_time : str
        Event time in ISO format (UTC preferred)

    Returns
    -------
    dict
        Weather risk features + metadata
    """

    event_utc = _parse_event_time_utc(event_time)

    # =====================================================
    # 1️⃣ Try TAF first
    # =====================================================
    try:
        taf = get_taf(icao)
        taf_features = extract_taf_temporal_features(taf, event_time)

        if taf_features.get("taf_min_vis_km") is not None:
            taf_features["weather_source"] = "TAF"

            issue_time = taf.get("issueTime")
            if issue_time:
                taf_features["taf_issue_time_utc"] = (
                    datetime.datetime
                    .fromisoformat(issue_time.replace("Z", "+00:00"))
                    .isoformat()
                )

            taf_features["taf_valid_from_utc"] = datetime.datetime.fromtimestamp(
                taf["validTimeFrom"],
                tz=datetime.UTC
            ).isoformat()

            taf_features["taf_valid_to_utc"] = datetime.datetime.fromtimestamp(
                taf["validTimeTo"],
                tz=datetime.UTC
            ).isoformat()

            taf_features["taf_raw"] = taf.get("rawTAF")

            return taf_features

    except Exception:
        # Silent fail → fallback to METAR
        pass

    # =====================================================
    # 2️⃣ Fallback: METAR within ±3 hours
    # =====================================================
    try:
        metar = get_metar(icao)

        metar_time = datetime.datetime.fromisoformat(
            metar["obsTime"].replace("Z", "+00:00")
        ).astimezone(datetime.UTC)

        time_diff_hours = abs(
            (metar_time - event_utc).total_seconds()
        ) / 3600

        if time_diff_hours <= 4:
            metar_features = _extract_metar_features(metar)
            metar_features["weather_source"] = "METAR"
            metar_features["metar_time_utc"] = metar_time.isoformat()
            metar_features["metar_raw"] = metar.get("rawOb")

            return metar_features

    except Exception:
        pass

    # =====================================================
    # 3️⃣ Final fallback: benign defaults
    # =====================================================
    return {
    "taf_min_vis_km": 5.0,            # VFR but not perfect
    "taf_mean_vis_km": 6.0,
    "taf_trend": 0.0,
    "taf_volatility": 0.2,            # some uncertainty
    "taf_fog_probability": 0.15,      # low but non-zero
    "taf_change_intensity": 0.2,      # slight variability
    "weather_source": "DEFAULT"
    }

