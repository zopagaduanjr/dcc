export interface CoffeeShop {
  name: string;
  geometry: Geometry;
  elevation: number;
  logo?: string;
}

interface Geometry {
  location: Location;
  viewport: Viewport;
}

interface Viewport {
  northeast: Location;
  southwest: Location;
}

interface Location {
  lat: number;
  lng: number;
}
