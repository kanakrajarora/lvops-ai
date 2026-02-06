import requests

TAF_API = "https://aviationweather.gov/api/data/taf"


def get_taf(icao: str):
    """
    Fetch NOAA TAF for an airport ICAO code.
    Returns parsed JSON dict.
    """
    response = requests.get(
        f"{TAF_API}?ids={icao}&format=json",
        timeout=10
    )
    response.raise_for_status()

    data = response.json()

    if not data:
        raise RuntimeError(f"No TAF data returned for {icao}")

    return data[0]

#example usage
#if __name__ == "__main__":
#    print(get_taf("VIDP")["rawTAF"])