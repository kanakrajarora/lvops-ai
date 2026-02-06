import os
import joblib
import numpy as np

# -----------------------------
# Load trained model
# -----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "delay_model.pkl")

if not os.path.exists(MODEL_PATH):
    raise RuntimeError("delay_model.pkl not found. Train the model first.")

model = joblib.load(MODEL_PATH)

# Expected number of features (must match training)
EXPECTED_FEATURE_COUNT = model.n_features_in_


def predict_delay_risk(features: list):
    """
    Predict delay probability using trained ML model.

    Parameters
    ----------
    features : list[float]
        Feature vector from feature_service (length = 12)

    Returns
    -------
    dict
        Delay probability and risk band
    """

    # -----------------------------
    # Validation
    # -----------------------------
    if len(features) != EXPECTED_FEATURE_COUNT:
        raise ValueError(
            f"Expected {EXPECTED_FEATURE_COUNT} features, "
            f"got {len(features)}"
        )

    # Convert to numpy for safety
    X = np.array(features).reshape(1, -1)

    # -----------------------------
    # Prediction
    # -----------------------------
    delay_prob = float(model.predict_proba(X)[0][1])

    # -----------------------------
    # Risk banding
    # -----------------------------
    if delay_prob >= 0.7:
        risk_band = "HIGH"
    elif delay_prob >= 0.4:
        risk_band = "MEDIUM"
    else:
        risk_band = "LOW"

    return {
        "delay_probability": round(delay_prob, 3)
    }


# Example standalone test
if __name__ == "__main__":
    test_features = [
        19, 0.5, 0.12, 1.0, 0.4,
        21, 0.2, 0.3, 1.0, 0.6
    ]
    print(predict_delay_risk(test_features))