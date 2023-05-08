/**
 * Enables panning and zooming of canvas with vector field
 * 
 * @param {HTMLCanvasElement} canvas that needs to be panned and zoomed
 * @param {*} updateBoundingBoxCallback callback that is called when vector field bounding box
 * needs to be updated
 */
export default function wglPanZoom(canvas, updateBoundingBoxCallback) {
  var lastDx = 0;
  var lastDy = 0;
  var lastScale = 1;

  // We need to be moved at least this many pixels in order to let
  // transform update bounding box.
  var transformThreshold = 2.1;

  return {
    applyTransform(newTransform) {
      var dx = newTransform.x;
      var dy = newTransform.y; 

      let dScale = (lastScale - newTransform.scale);
      if (dScale === 0 && 
          Math.abs(dx - lastDx) < transformThreshold &&
          Math.abs(dy - lastDy) < transformThreshold) {
          // Wait for larger transform
          return; 
      }

      lastDx = dx;
      lastDy = dy;
      lastScale = newTransform.scale;

      updateBoundingBoxCallback(newTransform)
    },

    getOwner() {
      return canvas
    }
  };
}