"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as MLMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  COLORBOND_COLOURS,
  hexToRgb,
  type ColorbondColour,
} from "@/lib/colorbond";
import { ColorbondPicker } from "@/components/colorbond-picker";
import { LeadForm } from "@/components/lead-form";

type Props = {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
};

type Status =
  | { kind: "preview" }
  | { kind: "processing" }
  | { kind: "ready" }
  | { kind: "error"; message: string };

const MAX_CAPTURE_DIM = 1280;
const FILL_TOLERANCE = 55;   // RGB Euclidean distance — tweak if fills are too tight/loose
const MAX_FILL_RATIO = 0.45; // Cap fill at 45% of image to prevent runaway fills

export function RoofEditor({ lat, lng, address, placeId }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);

  const aerialBitmapRef = useRef<ImageBitmap | null>(null);
  const maskAlphaRef = useRef<Uint8ClampedArray | null>(null);
  const imgDimsRef = useRef<{ w: number; h: number } | null>(null);

  const [status, setStatus] = useState<Status>({ kind: "preview" });
  const [selected, setSelected] = useState<ColorbondColour | null>(null);
  const statusRef = useRef(status);
  statusRef.current = status;
  const segmentAtRef = useRef<(x: number, y: number) => void>(() => {});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !mapContainerRef.current) return;

      mapRef.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            aerial: {
              type: "raster",
              tiles: [`${window.location.origin}/api/tiles/{z}/{x}/{y}`],
              tileSize: 256,
              attribution: "© Mapbox © Maxar",
              minzoom: 17,
              maxzoom: 22,
            },
          },
          layers: [{ id: "aerial", type: "raster", source: "aerial" }],
        },
        center: [lng, lat],
        zoom: 20,
        minZoom: 17,
        maxZoom: 22,
        canvasContextAttributes: { preserveDrawingBuffer: true },
        attributionControl: { compact: true },
      });

      mapRef.current.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right"
      );

      mapRef.current.on("click", (e) => {
        if (statusRef.current.kind !== "preview") return;
        segmentAtRef.current(e.point.x, e.point.y);
      });

      mapRef.current.on("error", (e) => {
        const s = (e.error as { status?: number } | undefined)?.status;
        if (s === 401 || s === 403) {
          setStatus({ kind: "error", message: "Aerial tile key is missing or unauthorised." });
        }
      });
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  const segmentAt = useCallback(async (clickDomX: number, clickDomY: number) => {
    if (statusRef.current.kind !== "preview") return;
    const map = mapRef.current;
    if (!map) return;

    if (!map.loaded()) {
      await new Promise<void>((res) => map.once("idle", () => res()));
    }

    setStatus({ kind: "processing" });
    // Yield to React so the processing state renders before heavy computation.
    await new Promise((r) => setTimeout(r, 0));

    try {
      const captured = captureMap(map, clickDomX, clickDomY);
      imgDimsRef.current = { w: captured.width, h: captured.height };
      aerialBitmapRef.current = await createImageBitmap(captured.canvas);

      const ctx = captured.canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Could not get 2D context");
      const imageData = ctx.getImageData(0, 0, captured.width, captured.height);

      const mask = floodFillMask(
        imageData,
        Math.round(captured.clickX),
        Math.round(captured.clickY),
        FILL_TOLERANCE
      );

      const filled = mask.reduce((s, v) => s + (v > 0 ? 1 : 0), 0);
      if (filled < 200) {
        throw new Error("Couldn't detect a roof there — try clicking the centre of your roof.");
      }

      maskAlphaRef.current = mask;
      setStatus({ kind: "ready" });
      setSelected((cur) => cur ?? COLORBOND_COLOURS[0]);
      requestAnimationFrame(() =>
        renderComposite(
          displayCanvasRef.current,
          aerialBitmapRef.current,
          maskAlphaRef.current,
          imgDimsRef.current,
          COLORBOND_COLOURS[0].hex
        )
      );
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }, []);

  useEffect(() => {
    segmentAtRef.current = segmentAt;
  }, [segmentAt]);

  useEffect(() => {
    if (status.kind !== "ready" || !selected) return;
    renderComposite(
      displayCanvasRef.current,
      aerialBitmapRef.current,
      maskAlphaRef.current,
      imgDimsRef.current,
      selected.hex
    );
  }, [selected, status.kind]);

  const reset = useCallback(() => {
    aerialBitmapRef.current?.close();
    aerialBitmapRef.current = null;
    maskAlphaRef.current = null;
    imgDimsRef.current = null;
    setSelected(null);
    setStatus({ kind: "preview" });
  }, []);

  const busy = status.kind === "processing";
  const showMap = status.kind !== "ready";

  return (
    <div>
      <div
        className={`relative ${busy ? "cursor-wait" : status.kind === "preview" ? "cursor-crosshair" : "cursor-default"}`}
      >
        <div
          ref={mapContainerRef}
          className={`aspect-[4/3] w-full sm:aspect-[16/10] ${showMap ? "" : "invisible"}`}
          aria-label="Aerial view — click your roof to segment it"
        />
        {!showMap && (
          <canvas
            ref={displayCanvasRef}
            className="absolute inset-0 h-full w-full"
            aria-label="Your roof with selected Colorbond colour"
          />
        )}

        {status.kind === "preview" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-foreground/90 px-3 py-1.5 text-xs font-medium text-background shadow">
            Click the centre of your roof
          </div>
        )}

        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg">
              <Spinner />
              Detecting your roof…
            </div>
          </div>
        )}

        {status.kind === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/95 p-6 text-center">
            <div className="max-w-sm">
              <div className="text-sm font-semibold text-foreground">
                Couldn&apos;t detect your roof
              </div>
              <div className="mt-1 text-xs text-muted">{status.message}</div>
              <button
                type="button"
                onClick={reset}
                className="mt-4 rounded-xl bg-brand px-3 py-1.5 text-xs font-semibold text-white"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>

      {status.kind === "ready" && (
        <div className="mt-6 space-y-6">
          <ColorbondPicker selected={selected} onSelect={(c) => setSelected(c)} />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={reset}
              className="text-xs font-medium text-muted hover:text-foreground"
            >
              ← Pick a different spot
            </button>
          </div>
          <LeadForm
            address={address}
            lat={lat}
            lng={lng}
            placeId={placeId}
            colour={selected}
          />
        </div>
      )}
    </div>
  );
}

function captureMap(
  map: MLMap,
  clickDomX: number,
  clickDomY: number
): { canvas: HTMLCanvasElement; width: number; height: number; clickX: number; clickY: number } {
  const mapCanvas = map.getCanvas();
  const container = map.getContainer();
  const cssW = container.clientWidth;
  const cssH = container.clientHeight;

  const srcW = mapCanvas.width;
  const srcH = mapCanvas.height;
  const scale = Math.min(1, MAX_CAPTURE_DIM / Math.max(srcW, srcH));
  const outW = Math.round(srcW * scale);
  const outH = Math.round(srcH * scale);

  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  const ctx = out.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not get 2D context");
  ctx.drawImage(mapCanvas, 0, 0, outW, outH);

  const clickX = (clickDomX / cssW) * outW;
  const clickY = (clickDomY / cssH) * outH;
  return { canvas: out, width: outW, height: outH, clickX, clickY };
}

function floodFillMask(
  imageData: ImageData,
  startX: number,
  startY: number,
  tolerance: number
): Uint8ClampedArray {
  const { width, height, data } = imageData;
  const maxPixels = Math.floor(width * height * MAX_FILL_RATIO);
  const mask = new Uint8ClampedArray(width * height);

  if (startX < 0 || startX >= width || startY < 0 || startY >= height) return mask;

  const seedIdx = (startY * width + startX) * 4;
  const seedR = data[seedIdx];
  const seedG = data[seedIdx + 1];
  const seedB = data[seedIdx + 2];

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0, tail = 0, filled = 0;

  const start = startY * width + startX;
  queue[tail++] = start;
  visited[start] = 1;

  while (head < tail && filled < maxPixels) {
    const pos = queue[head++];
    const px = pos % width;
    const py = Math.floor(pos / width);

    const idx = pos * 4;
    const dr = data[idx] - seedR;
    const dg = data[idx + 1] - seedG;
    const db = data[idx + 2] - seedB;
    if (Math.sqrt(dr * dr + dg * dg + db * db) > tolerance) continue;

    mask[pos] = 255;
    filled++;

    if (px > 0 && !visited[pos - 1])         { visited[pos - 1] = 1;         queue[tail++] = pos - 1; }
    if (px < width - 1 && !visited[pos + 1]) { visited[pos + 1] = 1;         queue[tail++] = pos + 1; }
    if (py > 0 && !visited[pos - width])      { visited[pos - width] = 1;     queue[tail++] = pos - width; }
    if (py < height - 1 && !visited[pos + width]) { visited[pos + width] = 1; queue[tail++] = pos + width; }
  }

  return mask;
}

function renderComposite(
  canvas: HTMLCanvasElement | null,
  aerial: ImageBitmap | null,
  alpha: Uint8ClampedArray | null,
  dims: { w: number; h: number } | null,
  tintHex: string
) {
  if (!canvas || !aerial || !alpha || !dims) return;
  const { w, h } = dims;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(aerial, 0, 0, w, h);

  const tint = hexToRgb(tintHex);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    if (alpha[p] === 0) continue;
    d[i]     = (d[i]     * tint.r) / 255;
    d[i + 1] = (d[i + 1] * tint.g) / 255;
    d[i + 2] = (d[i + 2] * tint.b) / 255;
  }
  ctx.putImageData(img, 0, 0);
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
