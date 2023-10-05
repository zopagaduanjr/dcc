export interface CoffeeShop {
  name: string;
  geometry: Geometry;
  elevation: number;
  logo?: string;
  formatted_address: string;
  weekday_text: Array<string>;
  recommendations?: Array<string>;
  facebook?: string;
  instagram?: string;
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
