import './App.css';
import {useEffect, useRef, useState} from 'react';

enum ElementShape {
  GP_SHAPE_ELLIPSE = 0,
  GP_SHAPE_SQUARE = 1,
  GP_SHAPE_LINE = 2,
  GP_SHAPE_POLYGON = 3,
  GP_SHAPE_ARC = 4,
}

enum ElementType {
  GP_ELEMENT_WIDGET = 0,
  GP_ELEMENT_SCREEN = 1,
  GP_ELEMENT_BTN_BUTTON = 2,
  GP_ELEMENT_DIR_BUTTON = 3,
  GP_ELEMENT_PIN_BUTTON = 4,
  GP_ELEMENT_LEVER = 5,
  GP_ELEMENT_LABEL = 6,
  GP_ELEMENT_SPRITE = 7,
  GP_ELEMENT_SHAPE = 8,
}

type Element = {
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

const SCREEN_MULTIPLIER = 5;

function parseDefString(defString: string) {
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

const renderShape = ({
  ctx,
  element,
}: {
  ctx: CanvasRenderingContext2D;
  element: Element;
}) => {
  const {x1, y1, x2, y2} = element;
  switch (element.shape) {
    case ElementShape.GP_SHAPE_ELLIPSE:
      ctx.ellipse(x1, y1, x2, y2, 0, 0, 2 * Math.PI);
      break;
    case ElementShape.GP_SHAPE_SQUARE:
      if (element.rotation && element.rotation !== 0) {
        ctx.save();
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        ctx.translate(cx, cy);
        ctx.rotate((element.rotation * Math.PI) / 180);
        ctx.rect(-(x2 - x1) / 2, -(y2 - y1) / 2, x2 - x1, y2 - y1);
        ctx.restore();
      } else {
        ctx.rect(x1, y1, x2 - x1, y2 - y1);
      }
      break;
    case ElementShape.GP_SHAPE_LINE:
      // ctx.moveTo(x1, y1);
      // ctx.lineTo(x2, y2);
      break;
    case ElementShape.GP_SHAPE_POLYGON:
      // TODO: Implement polygon rendering
      break;
    case ElementShape.GP_SHAPE_ARC:
      // TODO: Implement arc rendering
      break;
  }
};
const App = () => {
  const [elements, setElements] = useState<Element[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [defString, setDefString] = useState<string | undefined>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', {alpha: false});

    if (!ctx) return;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    for (const element of elements) {
      ctx.beginPath();
      switch (element.type) {
        case ElementType.GP_ELEMENT_BTN_BUTTON:
        case ElementType.GP_ELEMENT_DIR_BUTTON:
        case ElementType.GP_ELEMENT_PIN_BUTTON: {
          renderShape({ctx, element});
          break;
        }
        case ElementType.GP_ELEMENT_LEVER: {
          renderShape({ctx, element});
          renderShape({
            ctx,
            element: {...element, x2: element.x2 * 0.75, y2: element.y2 * 0.75},
          });
          break;
        }
      }
      ctx.stroke();
    }
  }, [elements]);

  useEffect(() => {
    if (!defString) return;
    const parsed = parseDefString(defString);

    const elementsArr: Element[] = [];
    const macroNames = ['DEFAULT_BOARD_LAYOUT_A', 'DEFAULT_BOARD_LAYOUT_B'];
    for (const macro of macroNames) {
      const arr = parsed[macro];
      if (!arr) continue;

      for (const obj of arr) {
        const key = Object.keys(obj)[0];
        const values = obj[key];
        elementsArr.push({
          type: ElementType[key as keyof typeof ElementType],
          x1: values[0],
          y1: values[1],
          x2: values[2],
          y2: values[3],
          stroke: values[4],
          fill: values[5],
          value: values[6],
          shape: ElementShape[values[7] as keyof typeof ElementShape],
          rotation: values[8] !== undefined ? values[8] : 0,
        });
      }
    }

    setElements(elementsArr);
  }, [defString]);

  return (
    <>
      <h1 className="title">GP2040-CE Layout Viewer</h1>
      <div
        className="editor"
        style={{width: 128 * SCREEN_MULTIPLIER, height: 'auto'}}>
        <canvas
          ref={canvasRef}
          width={128}
          height={64}
          style={{width: '100%', height: 'auto'}}
        />
        <textarea
          value={defString}
          onChange={e => {
            setDefString(e.target.value);
          }}
        />
      </div>
    </>
  );
};

export default App;
