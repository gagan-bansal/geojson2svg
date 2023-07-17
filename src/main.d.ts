/**
 * https://github.com/gagan-bansal/geojson2svg
 */
declare module 'geojson2svg' {
  import { GeoJsonObject } from 'geojson';

  export interface ScreenDims {
    width: number;
    height: number;
  }

  export interface Extent {
    left: number;
    right: number;
    bottom: number;
    top: number;
  }

  export interface StaticAttribute {
    type: 'static';
    property: string;
    value: string;
  }

  export interface DynamicAttribute {
    type: 'dynamic';
    property: string;
    key?: string;
  }

  export interface ObjectAttributes {
    [key: string]: string;
  }

  export interface Options {
    viewportSize?: ScreenDims;
    mapExtent?: Extent;
    output?: 'svg' | 'path';
    fitTo?: 'width' | 'height';
    precision?: number;
    explode?: boolean;
    attributes?: (StaticAttribute | DynamicAttribute | ObjectAttributes)[] | ObjectAttributes;
    pointAsCircle?: boolean;
    r?: number;
    callback?: (svgString: string) => void;
  }

  export default class GeoJSON2SVG {
    constructor(options?: Options);
    convert(geojson: GeoJsonObject, options?: Options): string[];
  }
}

