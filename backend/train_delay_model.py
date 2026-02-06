import random
import os
import joblib
import numpy as np
import random
import math

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report
)

def sigmoid(x):
    return 1 / (1 + math.exp(-x))

# -----------------------------
# Reproducibility
# -----------------------------
random.seed(42)
np.random.seed(42)

X = []
y = []

# -----------------------------
# 1. Generate synthetic dataset
# -----------------------------
for _ in range(1200):

    # -------------------------------
    # 1. Time features (diurnal logic)
    # -------------------------------
    dep_hour = random.randint(0, 23)
    flight_duration = random.randint(1, 4)
    arr_hour = (dep_hour + flight_duration) % 24

    night_factor = 1 if (dep_hour <= 7 or dep_hour >= 22) else 0
    transition_factor = 1 if dep_hour in [6,7,8,17,18,19] else 0

    # -------------------------------
    # 2. Origin weather regime
    # -------------------------------
    fog_base = random.uniform(0.05, 0.3)
    fog_prob = min(
        1.0,
        fog_base +
        0.4 * night_factor +
        0.2 * transition_factor +
        random.uniform(-0.05, 0.05)
    )

    o_fog = round(fog_prob, 2)

    # Visibility inversely related to fog
    if o_fog > 0.7:
        o_min_vis = round(random.uniform(0.05, 0.8), 2)
    elif o_fog > 0.4:
        o_min_vis = round(random.uniform(0.8, 3.0), 2)
    else:
        o_min_vis = round(random.uniform(3.0, 10.0), 2)

    # Volatility higher during transitions
    o_vol = round(
        min(1.0, 0.2 + 0.5 * transition_factor + random.uniform(0, 0.2)),
        2
    )

    # Change intensity linked to volatility
    o_change = round(
        min(1.0, 0.3 * o_vol + random.uniform(0, 0.4)),
        2
    )

    # -------------------------------
    # 3. Destination weather (correlated)
    # -------------------------------
    d_fog = round(
        min(1.0, max(0.0, o_fog + random.uniform(-0.15, 0.25))),
        2
    )

    if d_fog > 0.7:
        d_min_vis = round(random.uniform(0.05, 0.8), 2)
    elif d_fog > 0.4:
        d_min_vis = round(random.uniform(0.8, 3.0), 2)
    else:
        d_min_vis = round(random.uniform(3.0, 10.0), 2)

    d_vol = round(
        min(1.0, o_vol + random.uniform(-0.1, 0.2)),
        2
    )

    d_change = round(
        min(1.0, 0.4 * d_vol + random.uniform(0, 0.4)),
        2
    )

    # -------------------------------
    # 4. Final feature vector
    # -------------------------------
    X.append([
        dep_hour,
        o_min_vis,
        o_vol,
        o_fog,
        o_change,
        arr_hour,
        d_min_vis,
        d_vol,
        d_fog,
        d_change
    ])

    # -----------------------------
    # 2. Label generation logic
    # -----------------------------
    delay = 0

    # Dense fog at destination (most critical)
    if d_min_vis < 0.4 and d_fog > 0.6:
        delay = 1

    # Forecast instability
    if d_vol > 0.6 and d_change > 0.5:
        delay = 1

    # Peak-hour amplification
    if dep_hour in [5, 6, 7, 20, 21, 22] and d_min_vis < 1.0:
        delay = 1

    y.append(delay)

X = np.array(X)
y = np.array(y)

# -----------------------------
# 3. Train–test split
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)

# -----------------------------
# 4. Train model
# -----------------------------
model = RandomForestClassifier(
    n_estimators=300,
    max_depth=10,
    min_samples_leaf=5,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# -----------------------------
# 5. Evaluate model
# -----------------------------
y_pred = model.predict(X_test)

print("\nModel Evaluation Metrics")
print("------------------------")
print(f"Accuracy  : {accuracy_score(y_test, y_pred):.3f}")
print(f"Precision : {precision_score(y_test, y_pred):.3f}")
print(f"Recall    : {recall_score(y_test, y_pred):.3f}")
print(f"F1-score  : {f1_score(y_test, y_pred):.3f}")

print("\nDetailed Classification Report:")
print(classification_report(y_test, y_pred))

# -----------------------------
# 6. Save model safely
# -----------------------------
MODEL_DIR = os.path.join("app", "models")
os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = os.path.join(MODEL_DIR, "delay_model.pkl")
joblib.dump(model, MODEL_PATH)

print(f"\nModel saved to {MODEL_PATH}")
