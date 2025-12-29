

"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

interface PropertyMapProps {
  position: [number, number];
  address: string;
}

export function PropertyMap({ position, address }: PropertyMapProps) {
  useEffect(() => {
    
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
      iconUrl: require("leaflet/dist/images/marker-icon.png"),
      shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
    });
  }, []);

  if (!position || position[0] === 0 || position[1] === 0) {
    return (
      <div className="h-96 w-full rounded-lg bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">
          Map data is not available for this location.
        </p>
      </div>
    );
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden z-0">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>{address}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}