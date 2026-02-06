def recommend_action(
    prediction: dict,
    origin_weather: dict,
    destination_weather: dict,
    origin_takeoff_ok: int,
    destination_landing_ok: int
):
    """
    ML-centered OCC decision engine.

    Tone:
    - Technical
    - Operationally neutral
    - Airline-standard OCC phrasing
    """

    delay_prob = float(prediction.get("delay_probability", 0.0))

    o_vis = origin_weather.get("taf_min_vis_km", 10.0)
    d_vis = destination_weather.get("taf_min_vis_km", 10.0)
    d_fog = destination_weather.get("taf_fog_probability", 0.0)
    d_vol = destination_weather.get("taf_volatility", 0.0)

    # -------------------------------------------------
    # LAYER 1: HARD OPERATIONAL CONSTRAINTS
    # -------------------------------------------------

    if not origin_takeoff_ok:
        return {
            "action": "CANCEL_OR_HOLD",
            "reason": (
                "Dispatch not supported due to prevailing takeoff conditions "
                "at origin"
            )
        }

    if not destination_landing_ok:
        return {
            "action": "CANCEL_OR_DIVERT_RISK",
            "reason": (
                "Arrival constraints indicate elevated diversion likelihood "
                "at destination"
            )
        }

    # -------------------------------------------------
    # LAYER 2: EXTREME DESTINATION CONSTRAINT OVERRIDE
    # -------------------------------------------------

    if (
        d_vis <= 0.2 and
        d_fog >= 0.8 and
        d_vol <= 0.4 and
        delay_prob >= 0.6
    ):
        return {
            "action": "PROACTIVE_RESCHEDULE",
            "reason": (
                "Sustained low visibility forecast at destination; "
                "schedule adjustment recommended to maintain network stability"
            )
        }

    # -------------------------------------------------
    # LAYER 3: ML-CENTERED OPERATIONAL POSTURE
    # -------------------------------------------------

    if delay_prob < 0.20:
        return {
            "action": "NO_ACTION",
            "reason": (
                "Forecast conditions currently support planned operations"
            )
        }

    elif delay_prob < 0.40:
        return {
            "action": "MONITOR",
            "reason": (
                "Some variability noted in forecast conditions; "
                "continued monitoring advised"
            )
        }

    elif delay_prob < 0.60:
        return {
            "action": "MONITOR_AND_PREPARE",
            "reason": (
                "Increased likelihood of operational delay; "
                "readiness measures recommended"
            )
        }

    elif delay_prob < 0.80:
        return {
            "action": "PLAN_EXTRA_FUEL_AND_ALTN",
            "reason": (
                "Elevated arrival uncertainty; "
                "additional fuel and alternate planning advised"
            )
        }

    else:
        return {
            "action": "PROACTIVE_RESCHEDULE",
            "reason": (
                "Sustained operational constraints anticipated; "
                "proactive schedule adjustment recommended"
            )
        }


#EXAMPLE USAGE
'''if __name__ == "__main__":
    prediction = {"delay_probability": 0.82, "risk_band": "HIGH"}

    origin_weather = {
        "taf_min_vis_km": 0.6,
        "taf_fog_probability": 0.4
    }

    destination_weather = {
        "taf_min_vis_km": 0.25,
        "taf_fog_probability": 1.0
    }

    decision = recommend_action(
        prediction,
        origin_weather,
        destination_weather,
        origin_takeoff_ok=1,
        destination_landing_ok=0
    )

    print(decision)'''
