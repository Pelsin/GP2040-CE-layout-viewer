export enum ElementShape {
  GP_SHAPE_ELLIPSE = 0,
  GP_SHAPE_SQUARE = 1,
  GP_SHAPE_LINE = 2,
  // GP_SHAPE_POLYGON = 3, // Not yet implemented
  // GP_SHAPE_ARC = 4, // Not yet implemented
}
export enum ElementType {
  // GP_ELEMENT_WIDGET = 0, // Not yet implemented
  // GP_ELEMENT_SCREEN = 1, // Not yet implemented
  GP_ELEMENT_BTN_BUTTON = 2,
  GP_ELEMENT_DIR_BUTTON = 3,
  GP_ELEMENT_PIN_BUTTON = 4,
  GP_ELEMENT_LEVER = 5,
  // GP_ELEMENT_LABEL = 6, // Not yet implemented
  // GP_ELEMENT_SPRITE = 7, // Not yet implemented
  // GP_ELEMENT_SHAPE = 8, // Not yet implemented
}
export type Element = {
  type: ElementType;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: number;
  fill: number;
  value: number;
  shape: number;
  rotation?: number; // Optional rotation for elements like square
};

export type Layout = {
  a: Element[];
  b: Element[];
};
