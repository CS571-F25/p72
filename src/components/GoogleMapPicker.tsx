import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import axios from "axios";
import {
  buildProxyEndpoint,
  createOverlayMarker,
  getLabelFromGeocode,
} from "../lib/mapHelpers";
export type Pick = { type: "coords"; lat: number; lon: number; name?: string };

const LIBRARIES = ["places"] as const;

const containerStyle = {
  width: "100%",
  height: "360px",
};

const defaultCenter = { lat: 20, lng: 0 };

// helper rounding
const round4 = (v: number) => Number(v.toFixed(4));

export default function GoogleMapPicker({
  onPick,
  initial,
  enableSearch = true,
}: {
  onPick: (p: Pick) => void;
  initial?: { lat: number; lon: number };
  enableSearch?: boolean;
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES as unknown as any,
  });

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initial ? { lat: initial.lat, lng: initial.lon } : null
  );
  const [placeLabel, setPlaceLabel] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // autocomplete UI state
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<
    Array<{ description: string; place_id: string }>
  >([]);
  const [showPredictions, setShowPredictions] = useState(false);

  const mapRef = useRef<google.maps.Map | null>(null);
  // refs for newer APIs / fallbacks
  const inputRef = useRef<HTMLInputElement | null>(null);
  const placeAutocompleteRef = useRef<any>(null);
  const advancedMarkerRef = useRef<any>(null);
  const fallbackMarkerRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  const advancedAvailableRef = useRef<boolean>(false);
  const predictionsTimer = useRef<number | null>(null);

  const onLoadMap = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    // detect advanced marker availability
    advancedAvailableRef.current = !!(
      (google as any).maps?.marker &&
      (google as any).maps.marker.AdvancedMarkerElement
    );
    // no legacy AutocompleteService is created here; we use the PlaceAutocompleteElement
    // when available or the server proxy for predictions (to avoid deprecated APIs)
  }, []);

  const onUnmountMap = useCallback(() => {
    mapRef.current = null;
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsFetching(true);
    setGeoError(null);
    try {
      const endpoint = buildProxyEndpoint("reverse", {
        lat: String(lat),
        lng: String(lng),
      });
      const r = await axios.get(endpoint);
      const body = r.data;
      const label = getLabelFromGeocode(body);
      setPlaceLabel(label);
      return label;
    } catch (err) {
      setPlaceLabel(null);
      setGeoError("Reverse geocode failed");
      return null;
    } finally {
      setIsFetching(false);
    }
  }, []);

  const handleMapClick = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = round4(e.latLng.lat());
      const lng = round4(e.latLng.lng());
      setMarker({ lat, lng });
      await reverseGeocode(lat, lng);
      // update imperatively-managed marker on the map
      // (we sync in effect watching marker state)
    },
    [reverseGeocode]
  );

  // Marker drag is handled on the imperatively-created marker (fallbackMarkerRef)
  // so we don't use a JSX <Marker /> onDragEnd handler anymore.

  // use-my-location
  const handleUseMyLocation = useCallback(async () => {
    setGeoError(null);
    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation not supported in this browser.");
      return;
    }

    setIsFetching(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timer = window.setTimeout(() => {
          reject(new Error("Location request timed out"));
        }, 12000);
        navigator.geolocation.getCurrentPosition(
          (p) => {
            clearTimeout(timer);
            resolve(p);
          },
          (err) => {
            clearTimeout(timer);
            reject(err);
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 12000 }
        );
      });

      const lat = round4(pos.coords.latitude);
      const lng = round4(pos.coords.longitude);
      setMarker({ lat, lng });

      mapRef.current?.panTo({ lat, lng });
      mapRef.current?.setZoom(10);

      await reverseGeocode(lat, lng);
    } catch (err: any) {
      setGeoError(
        err?.message ||
          "Failed to get location. Check browser permissions and try again."
      );
    } finally {
      setIsFetching(false);
    }
  }, [reverseGeocode]);

  const handleAdd = useCallback(() => {
    if (!marker) return;
    const name = placeLabel ?? `${marker.lat}, ${marker.lng}`;
    onPick({ type: "coords", lat: marker.lat, lon: marker.lng, name });
  }, [marker, onPick, placeLabel]);

  // --- AutocompleteService + UI (replaces the Autocomplete component)
  useEffect(() => {
    // if query is empty, clear predictions
    if (!query) {
      setPredictions([]);
      return;
    }

    // debounce client requests to our serverless proxy
    if (predictionsTimer.current) {
      window.clearTimeout(predictionsTimer.current);
    }
    predictionsTimer.current = window.setTimeout(async () => {
      try {
        const endpoint = buildProxyEndpoint("autocomplete", { input: query });
        const res = await axios.get(endpoint);
        const body = res.data;
        if (body && body.status === "OK" && Array.isArray(body.predictions)) {
          const list = body.predictions.map((p: any) => ({
            description: p.description,
            place_id: p.place_id,
          }));
          setPredictions(list);
          setShowPredictions(true);
        } else {
          setPredictions([]);
          setShowPredictions(false);
        }
      } catch (e) {
        setPredictions([]);
        setShowPredictions(false);
      }
    }, 250);

    return () => {
      if (predictionsTimer.current) {
        window.clearTimeout(predictionsTimer.current);
        predictionsTimer.current = null;
      }
    };
  }, [query]);

  // Try to initialize the newer PlaceAutocompleteElement when available.
  useEffect(() => {
    if (!isLoaded || !enableSearch || !inputRef.current) return;
    const placesNs = (google as any).maps?.places;
    if (!placesNs) return;

    // If the new element exists, attach it to the input and listen for selection
    if (placesNs.PlaceAutocompleteElement) {
      try {
        placeAutocompleteRef.current = new placesNs.PlaceAutocompleteElement({
          inputElement: inputRef.current,
        });

        // Best-effort listener: try 'place_changed' like legacy Autocomplete, fallback to 'select'
        const attachHandler = async () => {
          const el = placeAutocompleteRef.current;
          if (!el) return;

          const notify = async (payload?: any) => {
            // Attempt to obtain a place object from the element or payload
            try {
              const place = el.getPlace
                ? el.getPlace()
                : payload?.place || null;
              if (place && place.geometry && place.geometry.location) {
                const lat = round4(place.geometry.location.lat());
                const lng = round4(place.geometry.location.lng());
                setMarker({ lat, lng });
                setPlaceLabel(
                  place.formatted_address ??
                    place.name ??
                    inputRef.current?.value ??
                    null
                );
                mapRef.current?.panTo({ lat, lng });
                mapRef.current?.setZoom(8);
                return;
              }

              // fallback: if we have a place_id, geocode it
              const pid =
                payload?.place_id || (place && place.place_id) || null;
              if (pid) {
                setIsFetching(true);
                try {
                  const endpoint = buildProxyEndpoint("geocode", {
                    place_id: pid,
                  });
                  const r = await axios.get(endpoint);
                  const body = r.data;
                  const first = body?.results?.[0];
                  const loc = first?.geometry?.location;
                  if (loc) {
                    const lat = round4(loc.lat);
                    const lng = round4(loc.lng);
                    setMarker({ lat, lng });
                    setPlaceLabel(
                      getLabelFromGeocode(body) ??
                        inputRef.current?.value ??
                        null
                    );
                    mapRef.current?.panTo({ lat, lng });
                    mapRef.current?.setZoom(8);
                  }
                } catch (e) {
                  // ignore and let predictions fallback handle it
                } finally {
                  setIsFetching(false);
                }
              }
            } catch (e) {
              // ignore and let fallback flow handle predictions
            }
          };

          // Try 'place_changed'
          if (el.addListener) {
            try {
              el.addListener("place_changed", () => notify());
              return;
            } catch (e) {
              // ignore and try other event
            }
          }

          // Try 'select' event that may provide payload
          if (el.addEventListener) {
            try {
              el.addEventListener("select", (ev: any) =>
                notify(ev?.detail || ev)
              );
              return;
            } catch (e) {
              // ignore
            }
          }
        };

        attachHandler();
      } catch (e) {
        // if anything fails, we fall back to AutocompleteService approach
        placeAutocompleteRef.current = null;
      }
    }
  }, [isLoaded, enableSearch]);

  // When the user selects a suggestion, geocode using placeId to get geometry
  const handleSelectPrediction = useCallback(
    async (placeId: string, description: string) => {
      setShowPredictions(false);
      setQuery(description);
      setIsFetching(true);
      setGeoError(null);
      try {
        const endpoint = buildProxyEndpoint("geocode", { place_id: placeId });
        const res = await axios.get(endpoint);
        const body = res.data;
        const first = body?.results?.[0];
        const loc = first?.geometry?.location;
        if (loc) {
          const lat = round4(loc.lat);
          const lng = round4(loc.lng);
          setMarker({ lat, lng });
          setPlaceLabel(description ?? getLabelFromGeocode(body));
          mapRef.current?.panTo({ lat, lng });
          mapRef.current?.setZoom(8);
        } else {
          setGeoError("Could not determine location for selection.");
        }
      } catch (err) {
        setGeoError("Failed to fetch place details.");
      } finally {
        setIsFetching(false);
      }
    },
    []
  );

  // Place selection via Enter key: if there's a first prediction, select it
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && predictions.length > 0) {
      e.preventDefault();
      handleSelectPrediction(
        predictions[0].place_id,
        predictions[0].description
      );
    } else if (e.key === "Escape") {
      setShowPredictions(false);
    }
  };

  // NOTE: we intentionally do not return early here because several hooks
  // (marker sync, place-autocomplete init, etc.) must be registered on every
  // render to preserve the Hooks call order. We will render the loading/error
  // states further down after hooks have been registered.

  // Sync marker state to map markers (AdvancedMarkerElement when available, fallback to google.maps.Marker)
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    const createOrUpdate = async () => {
      const pos = marker ? { lat: marker.lat, lng: marker.lng } : null;

      // Advanced marker path
      if (
        advancedAvailableRef.current &&
        (google as any).maps?.marker?.AdvancedMarkerElement
      ) {
        const Adv = (google as any).maps.marker.AdvancedMarkerElement;

        if (pos) {
          if (!advancedMarkerRef.current) {
            const content = document.createElement("div");
            content.className = "advanced-marker-content";
            content.style.touchAction = "none";
            content.innerHTML =
              '<div class="w-3 h-3 bg-sky-500 rounded-full shadow-md"></div>';

            // create a lightweight OverlayView to access map projection for dragging
            try {
              const Ov = (google as any).maps.OverlayView;
              const overlay = new Ov();
              overlay.onAdd = function () {};
              overlay.draw = function () {};
              overlay.onRemove = function () {};
              overlay.setMap(map);
              overlayRef.current = overlay;
            } catch (e) {
              overlayRef.current = null;
            }

            advancedMarkerRef.current = new Adv({
              map,
              position: pos,
              content,
            });

            // pointer-drag handlers using projection from overlay
            let dragging = false;
            let pointerId: number | null = null;

            const onPointerDown = (ev: PointerEvent) => {
              try {
                (content as HTMLElement).setPointerCapture(ev.pointerId);
              } catch (e) {
                // ignore
              }
              dragging = true;
              pointerId = ev.pointerId;
            };

            const onPointerMove = (ev: PointerEvent) => {
              if (!dragging || pointerId !== ev.pointerId) return;
              const rect = map.getDiv().getBoundingClientRect();
              const x = ev.clientX - rect.left;
              const y = ev.clientY - rect.top;
              const proj = overlayRef.current?.getProjection?.();
              if (!proj) return;
              try {
                const point = new (google as any).maps.Point(x, y);
                const latLng = proj.fromDivPixelToLatLng(point);
                const newPos = { lat: latLng.lat(), lng: latLng.lng() };
                try {
                  advancedMarkerRef.current.setPosition?.(newPos);
                } catch (e) {
                  advancedMarkerRef.current.position = newPos;
                }
              } catch (e) {
                // ignore projection errors
              }
            };

            const onPointerUp = (ev: PointerEvent) => {
              if (!dragging || pointerId !== ev.pointerId) return;
              try {
                (content as HTMLElement).releasePointerCapture(ev.pointerId);
              } catch (e) {
                // ignore
              }
              dragging = false;
              pointerId = null;
              // read final position and notify
              try {
                const p = advancedMarkerRef.current.position;
                const lat = round4(p.lat || p.lat());
                const lng = round4(p.lng || p.lng());
                setMarker({ lat, lng });
                reverseGeocode(lat, lng);
              } catch (e) {
                // best-effort
              }
            };

            content.addEventListener("pointerdown", onPointerDown);
            content.addEventListener("pointermove", onPointerMove);
            content.addEventListener("pointerup", onPointerUp);

            // store listeners so we can clean up later
            (advancedMarkerRef.current as any)._ptrHandlers = {
              onPointerDown,
              onPointerMove,
              onPointerUp,
              content,
            };
          } else {
            // try setPosition if available
            try {
              advancedMarkerRef.current.setPosition?.(pos);
            } catch (e) {
              advancedMarkerRef.current.position = pos;
            }
          }
        } else {
          if (advancedMarkerRef.current) {
            // remove pointer handlers
            try {
              const h = (advancedMarkerRef.current as any)?._ptrHandlers;
              if (h && h.content) {
                h.content.removeEventListener("pointerdown", h.onPointerDown);
                h.content.removeEventListener("pointermove", h.onPointerMove);
                h.content.removeEventListener("pointerup", h.onPointerUp);
              }
            } catch (e) {
              // ignore
            }
            try {
              advancedMarkerRef.current.setMap?.(null);
            } catch (e) {
              advancedMarkerRef.current.map = null;
            }
            advancedMarkerRef.current = null;
          }
          if (overlayRef.current) {
            try {
              overlayRef.current.setMap(null);
            } catch (e) {
              // ignore
            }
            overlayRef.current = null;
          }
        }
        return;
      }

      // Fallback: use the overlay marker helper (avoids google.maps.Marker)
      if (pos) {
        if (!fallbackMarkerRef.current) {
          try {
            const created = createOverlayMarker(map, pos, async (p: any) => {
              setMarker({ lat: p.lat, lng: p.lng });
              await reverseGeocode(p.lat, p.lng);
            });
            fallbackMarkerRef.current = created;
          } catch (e) {
            fallbackMarkerRef.current = null;
          }
        } else {
          try {
            fallbackMarkerRef.current.setPos(pos);
          } catch (e) {
            // ignore
          }
        }
      } else {
        if (fallbackMarkerRef.current) {
          try {
            fallbackMarkerRef.current.remove();
          } catch (e) {}
          fallbackMarkerRef.current = null;
        }
      }
    };

    createOrUpdate();

    // cleanup handled on map unmount
  }, [marker, reverseGeocode]);

  // Render loading / error states after hooks have been registered to keep
  // the Hooks call order stable across renders.
  if (loadError) {
    return <div className="p-4 text-red-500">Failed to load Google Maps</div>;
  }

  if (!isLoaded) {
    return <div className="p-4">Loading map…</div>;
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
      <div className="p-3">
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-3 py-2 shadow text-sm"
            disabled={isFetching}
          >
            {isFetching ? "Locating…" : "Use my location"}
          </button>
          <button
            type="button"
            onClick={() => {
              mapRef.current?.panTo(defaultCenter);
              mapRef.current?.setZoom(2);
            }}
            className="rounded-full px-3 py-2 border text-sm"
            disabled={isFetching}
          >
            Reset view
          </button>
        </div>

        {enableSearch && (
          <div className="mb-3 relative">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (predictions.length) setShowPredictions(true);
              }}
              onKeyDown={handleKeyDown}
              className="w-full rounded-full px-4 py-2 border"
              placeholder="Search address or place"
              aria-label="Search location"
            />

            {showPredictions && predictions.length > 0 && (
              <ul className="absolute z-20 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border rounded-lg shadow max-h-64 overflow-auto">
                {predictions.map((p) => (
                  <li
                    key={p.place_id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
                    onMouseDown={(ev) => {
                      ev.preventDefault();
                      handleSelectPrediction(p.place_id, p.description);
                    }}
                  >
                    {p.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={marker ? { lat: marker.lat, lng: marker.lng } : defaultCenter}
          zoom={marker ? 6 : 2}
          onClick={handleMapClick}
          onLoad={onLoadMap}
          onUnmount={onUnmountMap}
          options={{
            gestureHandling: "auto",
            fullscreenControl: false,
            streetViewControl: false,
          }}
        />
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div>
          <div className="text-sm text-muted-foreground">Selected</div>
          <div className="text-sm font-medium">
            {marker ? `${marker.lat}, ${marker.lng}` : "None"}
          </div>
          {placeLabel && (
            <div className="text-xs text-muted-foreground">{placeLabel}</div>
          )}
          {geoError && (
            <div className="text-xs text-red-500 mt-1">{geoError}</div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-3 py-2 shadow text-sm"
            onClick={handleAdd}
            disabled={!marker || isFetching}
          >
            {isFetching ? "Locating…" : "Add Location"}
          </button>

          <button
            className="rounded-full px-3 py-2 border"
            onClick={() => {
              setMarker(null);
              setPlaceLabel(null);
              setGeoError(null);
              setQuery("");
              setPredictions([]);
              setShowPredictions(false);
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
