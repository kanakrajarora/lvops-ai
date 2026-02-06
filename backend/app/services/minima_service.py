import json
import os

# -----------------------------
# CAT minima reference (meters)
# -----------------------------
CAT_MINIMA = {
    "CAT I": {
        "landing_rvr": 550,
        "takeoff_rvr": 400
    },
    "CAT II": {
        "landing_rvr": 300,
        "takeoff_rvr": 200
    },
    "CAT IIIA": {
        "landing_rvr": 175,
        "takeoff_rvr": 125
    },
    "CAT IIIB": {
        "landing_rvr": 75,
        "takeoff_rvr": 75
    }
}

# -----------------------------
# Load airport CAT config
# -----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # app/
MINIMA_FILE = os.path.join(BASE_DIR, "data", "airport_cat_minima.json")

with open(MINIMA_FILE, "r") as f:
    AIRPORT_CAT = json.load(f)


# -----------------------------
# Helpers
# -----------------------------
def get_airport_category(icao: str) -> str:
    """
    Get airport CAT category.
    Defaults:
      - Missing airport → CAT I
      - CAT III → CAT IIIA
    """
    cat = AIRPORT_CAT.get(icao, {}).get("category", "CAT I")

    # Normalize CAT III to CAT IIIA
    if cat == "CAT III":
        return "CAT IIIA"

    return cat


def km_to_rvr_m(vis_km: float) -> int:
    """
    Convert visibility in km to RVR in meters.
    """
    return int(vis_km * 1000)


# -----------------------------
# Feasibility checks
# -----------------------------
def check_takeoff_feasible(icao: str, taf_min_vis_km: float) -> bool:
    """
    Check if takeoff is feasible based on CAT minima.
    """
    category = get_airport_category(icao)
    required_rvr = CAT_MINIMA[category]["takeoff_rvr"]

    rvr_m = km_to_rvr_m(taf_min_vis_km)
    return rvr_m >= required_rvr


def check_landing_feasible(icao: str, taf_min_vis_km: float) -> bool:
    """
    Check if landing is feasible based on CAT minima.
    """
    category = get_airport_category(icao)
    required_rvr = CAT_MINIMA[category]["landing_rvr"]

    rvr_m = km_to_rvr_m(taf_min_vis_km)
    return rvr_m >= required_rvr

# Example usage
'''if __name__ == "__main__":
    # Airport explicitly in JSON
    print("CYYC (CAT III -> IIIA)")
    print("Landing feasible:", check_landing_feasible("CYYC", 0.2))
    print("Takeoff feasible:", check_takeoff_feasible("CYYC", 0.2))

    # Airport NOT in JSON (defaults to CAT I)
    print("\nUNKNOWN AIRPORT (default CAT I)")
    print("Landing feasible:", check_landing_feasible("XXXX", 0.6))
    print("Takeoff feasible:", check_takeoff_feasible("XXXX", 0.6))'''