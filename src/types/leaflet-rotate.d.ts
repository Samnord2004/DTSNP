import * as L from 'leaflet';

declare module 'leaflet' {
  interface MapOptions {
    rotate?: boolean;
    bearing?: number;
    touchRotate?: boolean;
    shiftKeyRotate?: boolean;
    rotateControl?: boolean | { position?: string; closeOnZeroBearing?: boolean };
  }

  interface Map {
    setBearing(bearing: number, options?: { animate?: boolean; duration?: number; easeLinearity?: number }): void;
    getBearing(): number;
    touchRotate?: {
      enable(): void;
      disable(): void;
      enabled(): boolean;
    };
    shiftKeyRotate?: {
      enable(): void;
      disable(): void;
      enabled(): boolean;
    };
  }
}

declare module 'leaflet-rotate' {}
