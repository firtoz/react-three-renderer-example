import React3 from 'react-three-renderer';
import THREE from 'three.js';

class MouseInput {
  constructor(scene, container, camera) {
    this._scene = scene;
    this._container = container;
    this._camera = camera;

    this._raycaster = new THREE.Raycaster();
    this._mouse = new THREE.Vector2();

    this._onMouseMove = (event) => {
      this._mouse.set(event.clientX, event.clientY);
    };

    this._containerRect = this._container.getBoundingClientRect();

    this._hoverObjectMap = {};

    document.addEventListener('mousemove', this._onMouseMove, false);
  }

  containerResized() {
    this._containerRect = this._container.getBoundingClientRect();
  }

  update() {
    const containerRect = this._containerRect;

    const temp = new THREE.Vector2(containerRect.left, containerRect.top);

    const relativeMouseCoords = this._mouse.clone()
      .sub(temp)
      .divide(temp.set(containerRect.width, containerRect.height));

    relativeMouseCoords.x = relativeMouseCoords.x * 2 - 1;
    relativeMouseCoords.y = -relativeMouseCoords.y * 2 + 1;

    // mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    // mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    this._raycaster.setFromCamera(relativeMouseCoords, this._camera);

    const intersections = this._raycaster.intersectObject(this._scene, true);

    const hoverMapToUpdate = {
      ...this._hoverObjectMap,
    };

    intersections.forEach(intersection => {
      const object = intersection.object;

      const uuid = object.uuid;


      if (this._hoverObjectMap[uuid]) {
        delete hoverMapToUpdate[uuid];

        // just update that intersection
        this._hoverObjectMap[uuid].intersection = intersection;
      } else {
        this._hoverObjectMap[uuid] = {
          object,
          intersection,
        };

        React3.eventDispatcher.dispatchEvent(object, 'onMouseEnter', intersection);
      }
    });

    // delete all unseen uuids in hover map
    Object.keys(hoverMapToUpdate).forEach(uuid => {
      React3.eventDispatcher.dispatchEvent(this._hoverObjectMap[uuid].object, 'onMouseLeave');

      delete this._hoverObjectMap[uuid];
    });
  }

  dispose() {
    document.removeEventListener('mousemove', this._onMouseMove, false);
  }
}

export default MouseInput;
