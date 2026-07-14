import type { LngLatBoundsLike } from "maplibre-gl";

export type Coordinate = [number, number];

export interface MapBounds {
  bounds: LngLatBoundsLike;
  center: Coordinate;
}

export interface BusPosition {
  lng: number;
  lat: number;
  bearing: number;
  progress: number;
}

export interface RouteSimulation {
  currentStop: string;
  nextStop: string;
  eta: number;
  distanceRemaining: number;
  speed: number;
  status: "running" | "stopped" | "delayed" | "arriving";
  progress: number;
  arrivalTime: string;
  passengerCount: number;
  lastUpdated: string;
}

export type MapStyleMode = "dark" | "satellite";
