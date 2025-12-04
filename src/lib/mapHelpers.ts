// import type { Pick as LocationPick } from "../components/GoogleMapPicker";

export function buildProxyEndpoint(op: string, params: Record<string, string>) {
  const serverBase =
    (import.meta.env.VITE_WEATHER_API_BASE_URL as string) || "";
  const base = serverBase.replace(/\/$/, "") || "";
  const path = base ? `${base}/api/google-places` : `/api/google-places`;
  const q = new URLSearchParams({ op, ...params }).toString();
  return `${path}?${q}`;
}

// createOverlayMarker: creates a lightweight OverlayView DOM marker with pointer drag support
// returns an object with setPos(pos) and remove() methods
export function createOverlayMarker(
  map: any,
  initialPos: { lat: number; lng: number },
  onDragEnd?: (p: { lat: number; lng: number }) => void
) {
  try {
    const Ov = (google as any).maps.OverlayView;
    const overlay = new Ov();
    const el = document.createElement("div");
    el.className = "legacy-overlay-marker";
    el.style.position = "absolute";
    el.style.transform = "translate(-50%, -50%)";
    el.style.cursor = "pointer";
    el.innerHTML =
      '<div class="w-3 h-3 bg-sky-500 rounded-full shadow-md"></div>';

    overlay.onAdd = function () {
      const panes = (this as any).getPanes();
      panes?.overlayMouseTarget?.appendChild(el);
    };

    overlay.draw = function (this: any) {
      const proj = this.getProjection();
      if (!proj) return;
      const p = (this as any)._pos;
      if (!p) return;
      const latLng = new (google as any).maps.LatLng(p.lat, p.lng);
      const point = proj.fromLatLngToDivPixel(latLng);
      el.style.left = point.x + "px";
      el.style.top = point.y + "px";
    } as any;

    overlay.onRemove = function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    };

    overlay.setMap(map);
    (overlay as any)._pos = initialPos;

    // pointer-drag for overlay
    el.style.touchAction = "none";
    let dragging = false;
    let pointerId: number | null = null;

    const onPointerDown = (ev: PointerEvent) => {
      try {
        (el as HTMLElement).setPointerCapture(ev.pointerId);
      } catch (e) {}
      dragging = true;
      pointerId = ev.pointerId;
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (!dragging || pointerId !== ev.pointerId) return;
      const rect = map.getDiv().getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const proj = (overlay as any).getProjection?.();
      if (!proj) return;
      try {
        const point = new (google as any).maps.Point(x, y);
        const latLng = proj.fromDivPixelToLatLng(point);
        el.style.left = x + "px";
        el.style.top = y + "px";
        (overlay as any)._livePos = { lat: latLng.lat(), lng: latLng.lng() };
      } catch (e) {
        // ignore
      }
    };

    const onPointerUp = (ev: PointerEvent) => {
      if (!dragging || pointerId !== ev.pointerId) return;
      try {
        (el as HTMLElement).releasePointerCapture(ev.pointerId);
      } catch (e) {}
      dragging = false;
      pointerId = null;
      const live = (overlay as any)._livePos;
      const final = live || (overlay as any)._pos;
      const lat = Number(final.lat.toFixed(4));
      const lng = Number(final.lng.toFixed(4));
      (overlay as any)._pos = { lat, lng };
      overlay.draw?.();
      if (onDragEnd) onDragEnd({ lat, lng });
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    (overlay as any)._cleanup = () => {
      try {
        el.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      } catch (e) {}
    };

    return {
      overlay,
      el,
      setPos(pos: { lat: number; lng: number }) {
        (overlay as any)._pos = pos;
        try {
          overlay.draw?.();
        } catch (e) {}
      },
      remove() {
        try {
          (overlay as any)._cleanup?.();
        } catch (e) {}
        try {
          overlay.setMap?.(null);
        } catch (e) {}
      },
    };
  } catch (e) {
    return null as any;
  }
}
