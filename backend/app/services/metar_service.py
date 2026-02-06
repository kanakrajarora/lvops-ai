import requests

METAR_API = "https://aviationweather.gov/api/data/metar"


def get_metar(icao: str):
    """
    Fetch NOAA METAR for an airport ICAO code.
    Returns parsed JSON dict.
    """
    response = requests.get(
        f"{METAR_API}?ids={icao}&format=json",
        timeout=10
    )
    response.raise_for_status()

    data = response.json()

    if not data:
        raise RuntimeError(f"No METAR data returned for {icao}")

    return data[0]

#example usage
if __name__ == "__main__":
    print(get_metar("VIDP")["rawOb"])