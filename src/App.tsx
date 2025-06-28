import './App.css';
import {useEffect, useRef, useState} from 'react';

import {ElementType, Layout} from './types';
import {DEFAULT_BOARD_LAYOUT_A, DEFAULT_BOARD_LAYOUT_B} from './layouts';

import Sidebar from './components/Sidebar';
import {renderShape, transformLayoutToDefString} from './utils';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [layout, setLayout] = useState<Layout>({
    a: DEFAULT_BOARD_LAYOUT_A,
    b: DEFAULT_BOARD_LAYOUT_B,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', {alpha: false});

    if (!ctx) return;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    for (const element of [...layout.a, ...layout.b]) {
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
    }
  }, [layout]);

  return (
    <div style={{display: 'flex', height: '100%'}}>
      <Sidebar setLayout={setLayout} layout={layout} />
      <div className="main">
        <img
          src="/GP2040-CE-layout-viewer/logo.png"
          style={{
            width: '100%',
            maxWidth: 350,
            padding: 20,
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        />
        <div className="editor">
          <canvas
            ref={canvasRef}
            width={128}
            height={64}
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
        </div>
        <textarea
          value={transformLayoutToDefString(layout)}
          readOnly
          rows={20}
          style={{marginTop: 20}}
        />
      </div>
    </div>
  );
}

export default App;
