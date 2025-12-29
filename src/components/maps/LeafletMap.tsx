"use client";

import L, { LayerGroup, Map as LeafletMapInstance } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";

export type BaseMapItem = {
  id: string;
  title: string;
  city: string;
  neighborhood?: string;
  price: number;
  currency?: string;
  listingType: "rent" | "sale";
  lat: number;
  lng: number;
};

const colorByType = (t: "rent" | "sale") => (t === "rent" ? "#2563eb" : "#dc2626");

export default function LeafletMap({
  items,
  heightClass = "h-[420px] md:h-[520px]",
  className = "",
  centerFallback = [23.8103, 90.4125] as [number, number],
  refreshToken = 0,
}: {
  items: BaseMapItem[];
  heightClass?: string;
  className?: string;
  centerFallback?: [number, number];
  refreshToken?: number;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const markersRef = useRef<LayerGroup | null>(null);

  const center = useMemo<[number, number]>(() => {
    if (items.length) return [items[0].lat, items[0].lng];
    return centerFallback;
  }, [items, centerFallback]);

  
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(el, {
      center,
      zoom: 12,
      zoomControl: true,
    });
    mapRef.current = map;

    
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      map.remove();
      mapRef.current = null;
    };
    
  }, []); 

  
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    
    if (markersRef.current) {
      markersRef.current.removeFrom(map);
      markersRef.current = null;
    }

    const group = L.featureGroup();
    items.forEach((p) => {
      const color = colorByType(p.listingType);
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 10,
        color,
        fillColor: color,
        fillOpacity: 0.9,
      });

      const html = `
        <div style="font-size:12px; line-height:1.2">
          <div style="font-weight:600; margin-bottom:2px;">${p.title}</div>
          <div style="color:#6b7280">${p.neighborhood ? `${p.neighborhood}, ` : ""}${p.city}</div>
          <div style="margin-top:4px;">
            ${p.currency ?? "USD"} ${p.price.toLocaleString()}${p.listingType === "rent" ? "/mo" : ""}
          </div>
          <a href="/property/${p.id}" style="color:#2563eb; text-decoration:underline; font-size:11px; display:inline-block; margin-top:4px;">View details</a>
        </div>
      `;
      marker.bindPopup(html, { closeButton: true });
      group.addLayer(marker);
    });

    group.addTo(map);
    markersRef.current = group;

    
    if (items.length > 0) {
      try {
        map.fitBounds(group.getBounds().pad(0.2), { animate: false });
      } catch {
        
      }
    } else {
      map.setView(center, 12);
    }

    
    setTimeout(() => map.invalidateSize(), 0);
  }, [items, center, refreshToken]);

  return (
    <div className={`relative w-full ${heightClass} ${className}`}>
      <div ref={wrapperRef} className="h-full w-full z-0" />
    </div>
  );
}