import { Event } from "../types/events";

export const getMapRegion = (events: Event[]) => {
  if (events.length === 0) {
    return {
      latitude: 41.0082,
      longitude: 28.9784,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  }

  const latitudes = events.map((event) => event.location.latitude);
  const longitudes = events.map((event) => event.location.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const latDelta = Math.max(maxLat - minLat, 0.01) * 0.75;
  const lngDelta = Math.max(maxLng - minLng, 0.01) * 0.75;

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
};
