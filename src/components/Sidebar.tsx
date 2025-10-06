import {useState} from 'react';
import {ElementShape, ElementType, Layout} from '../types';
import {createEnumRecord, transformDefStringToLayout} from '../utils';
import Input from './Input';
import Select from './Select';
import './Sidebar.css';

type SidebarProps = {
  layout: Layout;
  setLayout: React.Dispatch<React.SetStateAction<Layout>>;
};

const DEFAULT_ELEMENT = {
  type: ElementType.GP_ELEMENT_PIN_BUTTON,
  x1: 4,
  y1: 4,
  x2: 4,
  y2: 4,
  stroke: 1,
  fill: 1,
  value: 0,
  shape: ElementShape.GP_SHAPE_ELLIPSE,
};

function Sidebar({layout, setLayout}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [importString, setImportString] = useState('');

  const handleChange = (
    key: 'a' | 'b',
    index: number,
    field: string,
    value: any,
  ) => {
    setLayout((prevLayout: Layout) => ({
      ...prevLayout,
      [key]: prevLayout[key].map((el, i) =>
        i === index ? {...el, [field]: value} : el,
      ),
    }));
  };

  const handleDelete = (key: 'a' | 'b', index: number) => () =>
    setLayout((prevLayout: Layout) => ({
      ...prevLayout,
      [key]: prevLayout[key].filter((_: unknown, i: number) => i !== index),
    }));

  const handleAdd = (key: 'a' | 'b') => () => {
    setLayout((prevLayout: Layout) => ({
      ...prevLayout,
      [key]: [...prevLayout[key], DEFAULT_ELEMENT],
    }));
  };

  return (
    <div className="sidebar">
      <div style={{display: 'grid', gap: 20, padding: 20}}>
        <p>Import custom layout definition</p>
        <button className="add_button" onClick={() => setIsOpen(true)}>
          Import
        </button>
        {isOpen && (
          <dialog onClick={() => setIsOpen(false)} className="dialog">
            <div className="dialog_content" onClick={e => e.stopPropagation()}>
              <p className="title">Custom import</p>
              <p>
                For it to parse correctly the definitions needs to be
                DEFAULT_BOARD_LAYOUT_A and DEFAULT_BOARD_LAYOUT_B
              </p>
              <a
                href="https://github.com/OpenStickCommunity/GP2040-CE/blob/main/configs/OpenCore0WASD/BoardConfig.h#L133C1-L157C2"
                target="_blank">
                Example
              </a>
              <textarea
                rows={20}
                style={{marginTop: 20, marginBottom: 20}}
                onChange={e => setImportString(e.target.value)}
              />
              <button
                className="add_button"
                onClick={() => {
                  const importLayout = transformDefStringToLayout(importString);
                  setLayout(importLayout);
                  setIsOpen(false);
                  setImportString('');
                }}>
                Import
              </button>
            </div>
          </dialog>
        )}

        <div>
          <p className="title">Layout A</p>
          {layout.a.map((el, i) => (
            <details
              key={`A-${i}`}
              style={{display: 'grid', gap: 4, paddingBottom: 10}}>
              <summary>
                Element {i + 1}{' '}
                <button
                  className="delete_button"
                  onClick={handleDelete('a', i)}>
                  x
                </button>
              </summary>

              <Select
                label="Type"
                value={el.type}
                onChange={value => {
                  handleChange('a', i, 'type', value);
                }}
                options={createEnumRecord(ElementType)}
              />
              <Select
                label="Shape"
                value={el.shape}
                onChange={value => {
                  handleChange('a', i, 'shape', value);
                }}
                options={createEnumRecord(ElementShape)}
              />

              <div className="input_grid">
                <Input
                  label="X1"
                  type="number"
                  value={el.x1}
                  onChange={value => {
                    handleChange('a', i, 'x1', value);
                  }}
                />
                <Input
                  label="Y1"
                  type="number"
                  value={el.y1}
                  onChange={value => {
                    handleChange('a', i, 'y1', value);
                  }}
                />
                <Input
                  label="X2"
                  type="number"
                  value={el.x2}
                  onChange={value => {
                    handleChange('a', i, 'x2', value);
                  }}
                  min={0}
                />
                <Input
                  label="Y2"
                  type="number"
                  value={el.y2}
                  onChange={value => {
                    handleChange('a', i, 'y2', value);
                  }}
                  min={0}
                />
                <Input
                  label="Value"
                  type="number"
                  value={el.value}
                  onChange={value => {
                    handleChange('a', i, 'value', value);
                  }}
                />
                <Input
                  label="Rotation"
                  type="number"
                  value={el.rotation || 0}
                  onChange={value => {
                    handleChange('a', i, 'rotation', value);
                  }}
                />
              </div>
            </details>
          ))}
          <button className="add_button" onClick={handleAdd('a')}>
            Add Element
          </button>
        </div>
        <div>
          <p className="title">Layout B</p>
          {layout.b.map((el, i) => (
            <details
              key={`B-${i}`}
              style={{display: 'grid', gap: 4, paddingBottom: 10}}>
              <summary>
                Element {i + 1}{' '}
                <button
                  className="delete_button"
                  onClick={handleDelete('b', i)}>
                  x
                </button>
              </summary>

              <Select
                label="Type"
                value={el.type}
                onChange={value => {
                  handleChange('b', i, 'type', value);
                }}
                options={createEnumRecord(ElementType)}
              />
              <Select
                label="Shape"
                value={el.shape}
                onChange={value => {
                  handleChange('b', i, 'shape', value);
                }}
                options={createEnumRecord(ElementShape)}
              />

              <div className="input_grid">
                <Input
                  label="X1"
                  type="number"
                  value={el.x1}
                  onChange={value => {
                    handleChange('b', i, 'x1', value);
                  }}
                />
                <Input
                  label="Y1"
                  type="number"
                  value={el.y1}
                  onChange={value => {
                    handleChange('b', i, 'y1', value);
                  }}
                />
                <Input
                  label="X2"
                  type="number"
                  value={el.x2}
                  onChange={value => {
                    handleChange('b', i, 'x2', value);
                  }}
                />
                <Input
                  label="Y2"
                  type="number"
                  value={el.y2}
                  onChange={value => {
                    handleChange('b', i, 'y2', value);
                  }}
                />
                <Input
                  label="Value"
                  type="number"
                  value={el.value}
                  onChange={value => {
                    handleChange('b', i, 'value', value);
                  }}
                />
                <Input
                  label="Rotation"
                  type="number"
                  value={el.rotation || 0}
                  onChange={value => {
                    handleChange('b', i, 'rotation', value);
                  }}
                />
              </div>
            </details>
          ))}
          <button className="add_button" onClick={handleAdd('b')}>
            Add Element
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
