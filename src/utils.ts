import {Element, ElementShape, ElementType, Layout} from './types';

export function createEnumRecord<T extends Record<string, number | string>>(
  enumObj: T,
): Record<keyof T, T[keyof T]> {
  return Object.fromEntries(
    Object.entries(enumObj).filter(([, value]) => typeof value === 'number'),
  ) as Record<keyof T, T[keyof T]>;
}

export function parseDefString(defString: string) {
  const macroRegex = /#define\s+(\w+)\s*\{([\s\S]*?)\}(?=\s*#define|\s*$)/g;
  const result: Record<string, any[]> = {};
  let macroMatch: RegExpExecArray | null;

  while ((macroMatch = macroRegex.exec(defString))) {
    const macroName = macroMatch[1];
    const elementContent = macroMatch[2].trim();

    const entries: string[] = [];
    let braceLevel = 0;
    let entry = '';
    for (let i = 0; i < elementContent.length; i++) {
      const char = elementContent[i];
      if (char === '{') {
        if (braceLevel === 0 && entry.trim().length > 0) {
          entries.push(entry.trim().replace(/,$/, ''));
          entry = '';
        }
        braceLevel++;
      }
      entry += char;
      if (char === '}') {
        braceLevel--;
        if (braceLevel === 0) {
          entries.push(entry.trim().replace(/,$/, ''));
          entry = '';
          while (
            i + 1 < elementContent.length &&
            (elementContent[i + 1] === ',' ||
              elementContent[i + 1] === ' ' ||
              elementContent[i + 1] === '\n' ||
              elementContent[i + 1] === '\\')
          ) {
            i++;
          }
        }
      }
    }

    const filteredEntries = entries.filter(e => e.length > 0);
    const parsedElements = filteredEntries
      .map(e => {
        const match = e.match(/^\{([^,]+),\s*\{([^\}]*)\}\}$/);
        if (!match) return null;
        const key = match[1].trim();
        const values = match[2]
          .split(',')
          .map(v => v.trim())
          .map(v =>
            v.startsWith('GP_SHAPE_')
              ? `${v}`
              : isNaN(Number(v))
                ? v
                : Number(v),
          );
        return {[key]: values};
      })
      .filter(Boolean);

    result[macroName] = parsedElements;
  }

  return result;
}

export function transformDefStringToLayout(defString: string): Layout {
  const parsed = parseDefString(defString);

  function parseElement(obj: Record<string, any>): Element {
    const key = Object.keys(obj)[0];
    const values = obj[key];
    return {
      type: ElementType[key as keyof typeof ElementType],
      x1: Number(values[0]),
      y1: Number(values[1]),
      x2: Number(values[2]),
      y2: Number(values[3]),
      stroke: Number(values[4]),
      fill: Number(values[5]),
      value: Number(values[6]),
      shape: ElementShape[values[7] as keyof typeof ElementShape],
      rotation: values.length > 8 ? Number(values[8]) : undefined,
    } as Element;
  }

  return {
    a: (parsed.DEFAULT_BOARD_LAYOUT_A || []).map(parseElement),
    b: (parsed.DEFAULT_BOARD_LAYOUT_B || []).map(parseElement),
  };
}

export function transformLayoutToDefString(layout: Layout) {
  return `#define DEFAULT_BOARD_LAYOUT_A {\\
${layout.a
  .map(
    el =>
      `    {${ElementType[el.type]}, {${el.x1}, ${el.y1}, ${el.x2}, ${el.y2}, ${el.stroke}, ${el.fill}, ${el.value}, ${ElementShape[el.shape]}${el.rotation ? `,${el.rotation}` : ''}}},\\`,
  )
  .join('\n')}
}

#define DEFAULT_BOARD_LAYOUT_B {\\
${layout.b
  .map(
    el =>
      `    {${ElementType[el.type]}, {${el.x1}, ${el.y1}, ${el.x2}, ${el.y2}, ${el.stroke}, ${el.fill}, ${el.value}, ${ElementShape[el.shape]}${el.rotation ? `,${el.rotation}` : ''}}},\\`,
  )
  .join('\n')}
}`;
}

export function renderShape({
  ctx,
  element,
}: {
  ctx: CanvasRenderingContext2D;
  element: Element;
}) {
  const {x1, y1, x2, y2, shape, rotation} = element;
  ctx.lineWidth = 1;
  ctx.beginPath();
  switch (shape) {
    case ElementShape.GP_SHAPE_ELLIPSE:
      ctx.ellipse(x1, y1, x2, y2, 0, 0, 2 * Math.PI);
      break;
    case ElementShape.GP_SHAPE_SQUARE:
      if (rotation) {
        ctx.save();
        ctx.translate((x1 + x2) / 2, (y1 + y2) / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.rect(-(x2 - x1) / 2, -(y2 - y1) / 2, x2 - x1, y2 - y1);
        ctx.restore();
      } else {
        ctx.rect(x1, y1, x2 - x1, y2 - y1);
      }
      break;
    case ElementShape.GP_SHAPE_LINE:
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      break;
    // case ElementShape.GP_SHAPE_POLYGON:
    // case ElementShape.GP_SHAPE_ARC:
  }
  ctx.stroke();
}
