import React from 'react';

import ClothExample from './AnimationCloth/index';
import GeometriesExample from './Geometries/index';
import CameraExample from './WebGLCameraExample/index';
import GeometryShapesExample from './GeometryShapes/index';
import DraggableCubes from './DraggableCubes/index';

const examples = [
  {
    name: 'Cloth',
    component: ClothExample,
  },
  {
    name: 'Camera',
    component: CameraExample,
  },
  {
    name: 'Geometries',
    component: GeometriesExample,
  },
  {
    name: 'Geometry Shapes',
    component: GeometryShapesExample,
  },
  {
    name: 'Draggable Cubes',
    component: DraggableCubes,
  },
];

class ExampleBrowser extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      activeExample: null,
      viewerWidth: 0,
      viewerHeight: 0,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this._onWindowResize, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onWindowResize, false);
  }

  _onWindowResize = () => {
    const viewer = this.refs.viewer;

    this.setState({
      viewerWidth: viewer.offsetWidth,
      viewerHeight: viewer.offsetHeight,
    });
  };

  render() {
    let exampleContent = null;

    const {
      viewerWidth,
      viewerHeight,
      } = this.state;

    if (this.state.activeExample !== null) {
      const ExampleComponent = examples[this.state.activeExample].component;

      exampleContent = <ExampleComponent
        width={viewerWidth}
        height={viewerHeight}/>;
    }

    return (<div>
      <div id="panel" className="collapsed">
        <h1><a href="http://threejs.org">three.js</a> / examples</h1>
        <div id="content">
          <div>
            <h2>webgl</h2>
            {examples.map((example, index) => {
              return (<div className="link" key={index} onClick={() => {
                const viewer = this.refs.viewer;

                this.setState({
                  viewerWidth: viewer.offsetWidth,
                  viewerHeight: viewer.offsetHeight,
                  activeExample: index,
                });
              }}>
                {example.name}
              </div>);
            })}
          </div>
        </div>
      </div>
      <div id="viewer" ref="viewer">
        {exampleContent}
      </div>
    </div>);
  }
}

export default ExampleBrowser;
