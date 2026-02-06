import os
import joblib
import shap
import numpy as np

# -----------------------------
# Load trained model
# -----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "delay_model.pkl")

model = joblib.load(MODEL_PATH)

# -----------------------------
# SHAP Explainer (Tree-based)
# -----------------------------
explainer = shap.TreeExplainer(model)

# Feature names MUST match feature order
FEATURE_NAMES = [
    "dep_hour",
    "origin_min_vis",
    "origin_volatility",
    "origin_fog_prob",
    "origin_change_intensity",
    "arr_hour",
    "dest_min_vis",
    "dest_volatility",
    "dest_fog_prob",
    "dest_change_intensity"
]


def explain_prediction(features: list):
    """
    Generate SHAP explanation for a single prediction.

    Parameters
    ----------
    features : list[float]
        Feature vector used for prediction

    Returns
    -------
    dict
        Feature-wise SHAP contributions
    """

    X = np.array(features).reshape(1, -1)

    shap_values = explainer.shap_values(X)

    # Handle both old and new SHAP formats safely
    if isinstance(shap_values, list):
        # Old format: list of arrays per class
        class_1_shap = shap_values[1][0]
    else:
        # New format: single array already for positive class
        class_1_shap = shap_values[0]


    explanation = []

    for name, value, shap_val in zip(
        FEATURE_NAMES, features, class_1_shap
    ):
        if hasattr(shap_val, "__len__"):
            shap_val = shap_val[0]

        explanation.append({
            "feature": name,
            "value": round(float(value), 3),
            "shap_contribution": round(float(shap_val), 4)
        })

    # Sort by absolute impact
    explanation.sort(
        key=lambda x: abs(x["shap_contribution"]),
        reverse=True
    )

    return explanation