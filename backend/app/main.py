from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware   # ✅ Added
import uuid

from .services.flight_resolver import resolve_flight
from .services.weather_service import get_weather_risk
from .services.feature_service import build_features
from .services.prediction_service import predict_delay_risk
from .services.decision_service import recommend_action
from .services.minima_service import (
    check_takeoff_feasible,
    check_landing_feasible
)
from .services.explainability_service import explain_prediction


app = FastAPI(
    title="Low Visibility Flight Risk AI",
    description="TAF-based end-to-end flight delay, diversion, and cancellation risk system",
    version="2.1"
)

# ✅ ---------------- CORS CONFIGURATION ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (safe for development / hackathons)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------------------------------


@app.get("/")
def root():
    return {
        "message": "Low Visibility Flight Risk AI is running",
        "endpoints": ["/predict"]
    }


@app.get("/predict")
def predict(flight_number: str, date: str):
    trace_id = str(uuid.uuid4())[:8]  # short trace id

    try:
        # -----------------------------
        # 1. Resolve flight details
        # -----------------------------
        try:
            flight = resolve_flight(flight_number, date)
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail={
                    "layer": "flight_resolver",
                    "message": str(e),
                    "trace_id": trace_id
                }
            )

        origin_icao = flight["origin"]["icao"]
        dest_icao = flight["destination"]["icao"]

        scheduled_departure = flight["scheduled_departure"]
        scheduled_arrival = flight["scheduled_arrival"]

        # -----------------------------
        # 2. Fetch weather (TAF-based)
        # -----------------------------
        try:
            origin_weather = get_weather_risk(
                origin_icao,
                scheduled_departure
            )
            destination_weather = get_weather_risk(
                dest_icao,
                scheduled_arrival
            )
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail={
                    "layer": "weather_service",
                    "message": str(e),
                    "trace_id": trace_id
                }
            )

        # -----------------------------
        # 3. CAT minima feasibility
        # -----------------------------
        try:
            origin_takeoff_ok = int(
                check_takeoff_feasible(
                    origin_icao,
                    origin_weather.get("taf_min_vis_km", 10.0)
                )
            )

            destination_landing_ok = int(
                check_landing_feasible(
                    dest_icao,
                    destination_weather.get("taf_min_vis_km", 10.0)
                )
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail={
                    "layer": "minima_service",
                    "message": str(e),
                    "trace_id": trace_id
                }
            )

        # -----------------------------
        # 4. Build ML feature vector
        # -----------------------------
        try:
            features = build_features(
                flight,
                origin_weather,
                destination_weather
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail={
                    "layer": "feature_service",
                    "message": str(e),
                    "trace_id": trace_id
                }
            )

        # -----------------------------
        # 5. Predict delay probability
        # -----------------------------
        try:
            prediction = predict_delay_risk(features)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail={
                    "layer": "prediction_service",
                    "message": str(e),
                    "trace_id": trace_id
                }
            )

        # -----------------------------
        # 5.1 Explain prediction (SHAP)
        # -----------------------------
        try:
            explainability = explain_prediction(features)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail={
                    "layer": "explainability_service",
                    "message": str(e),
                    "trace_id": trace_id
                }
            )

        # -----------------------------
        # 6. Decision engine
        # -----------------------------
        try:
            decision = recommend_action(
                prediction,
                origin_weather,
                destination_weather,
                origin_takeoff_ok,
                destination_landing_ok
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail={
                    "layer": "decision_service",
                    "message": str(e),
                    "trace_id": trace_id
                }
            )

        # -----------------------------
        # 7. Final response
        # -----------------------------
        return {
            "trace_id": trace_id,
            "flight": flight,
            "origin_weather": origin_weather,
            "destination_weather": destination_weather,
            "operational_feasibility": {
                "origin_takeoff_ok": bool(origin_takeoff_ok),
                "destination_landing_ok": bool(destination_landing_ok)
            },
            "prediction": prediction,
            "explainability": explainability[:5],
            "decision": decision
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "layer": "unknown",
                "message": str(e),
                "trace_id": trace_id
            }
        )
