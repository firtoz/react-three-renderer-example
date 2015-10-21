import React3 from 'react-three-renderer';
import THREE from 'three.js';
import ReactUpdates from 'react/lib/ReactUpdates';

import SyntheticMouseEvent from 'react/lib/SyntheticMouseEvent';

const tempVector2 = new THREE.Vector2();

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

    this._onMouseDown = (event) => {
      const syntheticEvent = new SyntheticMouseEvent(null, null, event, event.target);

      const intersections = this._getIntersections(tempVector2.set(syntheticEvent.clientX, syntheticEvent.clientY));

      ReactUpdates.batchedUpdates(() => {
        intersections.forEach(intersection => {
          if (syntheticEvent.isDefaultPrevented()) {
            return;
          }

          const object = intersection.object;

          React3.eventDispatcher.dispatchEvent(object, 'onMouseDown', syntheticEvent);
        });
      });
    };

    this._containerRect = this._container.getBoundingClientRect();

    this._hoverObjectMap = {};

    document.addEventListener('mousemove', this._onMouseMove, false);
    container.addEventListener('mousedown', this._onMouseDown, true);
  }

  _getIntersections(mouseCoords) {
    const relativeMouseCoords = this._getRelativeMouseCoords(mouseCoords);

    this._raycaster.setFromCamera(relativeMouseCoords, this._camera);

    return this._raycaster.intersectObject(this._scene, true);
  }

  containerResized() {
    this._containerRect = this._container.getBoundingClientRect();
  }

  update() {
    const intersections = this._getIntersections(this._mouse);

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

  _getRelativeMouseCoords(screenMouseCoords) {
    const containerRect = this._containerRect;

    const relativeMouseCoords = screenMouseCoords.clone()
      .sub(tempVector2.set(containerRect.left, containerRect.top))
      .divide(tempVector2.set(containerRect.width, containerRect.height));

    // mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    // mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    relativeMouseCoords.x = relativeMouseCoords.x * 2 - 1;
    relativeMouseCoords.y = -relativeMouseCoords.y * 2 + 1;

    return relativeMouseCoords;
  }

  dispose() {
    document.removeEventListener('mousemove', this._onMouseMove, false);
    this._container.removeEventListener('mousedown', this._onMouseDown, true);

    delete this._onMouseMove;
    delete this._onMouseDown;
  }
}

export default MouseInput;
