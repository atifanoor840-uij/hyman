declare module "dotted-map" {
  interface MapSettings {
    height?: number
    width?: number
    countries?: string[]
    region?: { lat: { min: number; max: number }; lng: { min: number; max: number } }
    grid?: "vertical" | "diagonal"
  }
  interface SvgSettings {
    shape?: "circle" | "hexagon"
    color?: string
    backgroundColor?: string
    radius?: number
  }
  export default class DottedMap {
    constructor(settings: MapSettings & { avoidOuterPins?: boolean })
    getSVG(settings: SvgSettings): string
  }
}
