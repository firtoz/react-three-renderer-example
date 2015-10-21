import React3 from 'react-three-renderer';
import THREE from 'three.js';
import ReactUpdates from 'react/lib/ReactUpdates';

import SyntheticMouseEvent from 'react/lib/SyntheticMouseEvent';

const tempVector2 = new THREE.Vector2();

const listenerCallbackNames = {
  mousedown: 'onMouseDown',
  mouseup: 'onMouseUp',
};

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

    this._intersectionsForClick = null;

    this._caughtListenersCleanupFunctions = [];

    Object.keys(listenerCallbackNames).forEach(eventName => {
      let boundListener;

      const listenerCallbackName = listenerCallbackNames[eventName];
      switch (eventName) {
      case 'mousedown':
        boundListener = this._onMouseDown.bind(this, listenerCallbackName);
        break;
      case 'mouseup':
        boundListener = this._onMouseUp.bind(this, listenerCallbackName);
        break;
      default:
        break;
      }

      if (boundListener) {
        container.addEventListener(eventName, boundListener, true);

        this._caughtListenersCleanupFunctions.push(() => {
          container.removeEventListener(eventName, boundListener, true);
        });
      }
    });
  }

  _onMouseDown = (callbackName, mouseEvent) => {
    ReactUpdates.batchedUpdates(() => {
      const {
        event,
        intersections,
        } = this._intersectAndDispatch(callbackName, mouseEvent);

      if (event.isDefaultPrevented() || event.isPropagationStopped()) {
        this._intersectionsForClick = null;
      } else {
        this._intersectionsForClick = intersections;
      }
    });
  };

  _onMouseUp = (callbackName, mouseEvent) => {
    ReactUpdates.batchedUpdates(() => {
      const {
        event,
        intersections,
        } = this._intersectAndDispatch(callbackName, mouseEvent);

      if (!(event.isDefaultPrevented() || event.isPropagationStopped())) {
        if (this._intersectionsForClick === null) {
          return;
        }

        // intersect current intersections with the intersections for click
        //   call xzibit ASAP we have a good one son
        //     it wasn't that good

        const intersectionUUIDMap = this._intersectionsForClick.reduce((map, intersection) => {
          map[intersection.object.uuid] = intersection;

          return map;
        }, {});

        for (let i = 0; i < intersections.length; ++i) {
          if (event.isDefaultPrevented() || event.isPropagationStopped()) {
            return;
          }

          const intersection = intersections[i];

          const object = intersection.object;

          const uuid = object.uuid;

          if (intersectionUUIDMap[uuid]) {
            // oh boy oh boy here we go, we got a clicker

            const clickEvent = new MouseEvent('click', event);

            React3.eventDispatcher.dispatchEvent(object, 'onClick', new SyntheticMouseEvent(null, null, clickEvent, event.target), intersection);
          }
        }
      }
    });

    this._intersectionsForClick = null;
  };

  _intersectAndDispatch(callbackName, mouseEvent) {
    const event = new SyntheticMouseEvent(null, null, mouseEvent, mouseEvent.target);

    const intersections = this._getIntersections(tempVector2.set(event.clientX, event.clientY));

    ReactUpdates.batchedUpdates(() => {
      for (let i = 0; i < intersections.length; ++i) {
        const intersection = intersections[i];

        if (event.isDefaultPrevented() || event.isPropagationStopped()) {
          return;
        }

        const object = intersection.object;

        React3.eventDispatcher.dispatchEvent(object, callbackName, event, intersection);
      }
    });

    return {
      event,
      intersections,
    };
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

    this._caughtListenersCleanupFunctions.forEach(cleanupFunction => cleanupFunction());
    delete this._caughtListenersCleanupFunctions;

    delete this._onMouseMove;
  }
}

export default MouseInput;
