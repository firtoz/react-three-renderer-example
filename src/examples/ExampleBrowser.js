import React from 'react';

import SimpleExample from './Simple/index';
import ManualRenderingExample from './ManualRendering/index';
import ClothExample from './AnimationCloth/index';
import GeometriesExample from './Geometries/index';
import CameraExample from './WebGLCameraExample/index';
import GeometryShapesExample from './GeometryShapes/index';
import DraggableCubes from './DraggableCubes/index';
import Physics from './Physics/index';
import PhysicsMousePick from './Physics/mousePick';
import BenchmarkRotatingCubes from './Benchmark/RotatingCubes';
import RotatingCubesDirectUpdates from './Benchmark/RotatingCubesDirectUpdates';

const examples = [
  {
    name: 'Simple',
    component: SimpleExample,
    url: 'Simple/index',
  },
  {
    name: 'Cloth',
    component: ClothExample,
    url: 'AnimationCloth/index',
  },
  {
    name: 'Camera',
    component: CameraExample,
    url: 'WebGLCameraExample/index',
  },
  {
    name: 'Geometries',
    component: GeometriesExample,
    url: 'Geometries/index',
  },
  {
    name: 'Geometry Shapes',
    component: GeometryShapesExample,
    url: 'GeometryShapes/index',
  },
  {
    name: 'Draggable Cubes',
    component: DraggableCubes,
    url: 'DraggableCubes/index',
  },
  {
    name: 'Physics',
    component: Physics,
    url: 'Physics/index',
  },
  {
    name: 'Physics - MousePick',
    component: PhysicsMousePick,
    url: 'Physics/mousePick',
  },
  {
    separator: true,
    name: 'Advanced',
  },
  {
    name: 'Without react-dom',
    advanced: true,
    page: 'advanced.html',
  },
  {
    name: 'Manual rendering',
    component: ManualRenderingExample,
    url: 'ManualRendering/index',
  },
  {
    separator: true,
    name: 'Benchmarks',
  },
  {
    name: 'Benchmark - RotatingCubes - Through React',
    component: BenchmarkRotatingCubes,
    url: 'Benchmark/RotatingCubes',
  },
  {
    name: 'Benchmark - RotatingCubes - Direct Updates',
    component: RotatingCubesDirectUpdates,
    url: 'Benchmark/RotatingCubesDirectUpdates',
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

    let sourceButton = null;

    if (this.state.activeExample !== null) {
      const {
        component: ExampleComponent,
        url,
      } = examples[this.state.activeExample];

      exampleContent = (<ExampleComponent
        width={viewerWidth}
        height={viewerHeight}
      />);

      sourceButton = (<div key="src" id="button">
        <a
          href={`https://github.com/toxicFork/react-three-renderer-example/blob/master/src/examples/${url}.js`}
          target="_blank"
        >
          View source
        </a>
      </div>);
    }

    return (<div>
      <div id="panel" className="collapsed">
        <h1><a href="https://github.com/toxicFork/react-three-renderer/">react-three-renderer</a> / examples</h1>
        <div id="content">
          <div>
            <h2>webgl</h2>
            {examples.map((example, index) => {
              if (example.separator) {
                return (<h2 key={index}>{example.name}</h2>);
              }

              if (example.advanced) {
                return (<div key={index}>
                  <a href={example.page} target="blank">{example.name}</a> (new tab)
                </div>);
              }

              const onLinkClick = () => {
                const viewer = this.refs.viewer;

                this.setState({
                  viewerWidth: viewer.offsetWidth,
                  viewerHeight: viewer.offsetHeight,
                  activeExample: index,
                });
              };

              return (<div
                className="link"
                key={index}
                onClick={onLinkClick}
              >
                {example.name}
              </div>);
            })}
          </div>
        </div>
      </div>
      <div id="viewer" ref="viewer">
        {exampleContent}
        {sourceButton}
      </div>
    </div>);
  }
}

export default ExampleBrowser;
