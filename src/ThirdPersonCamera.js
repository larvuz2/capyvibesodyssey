import * as THREE from 'three';

export default class ThirdPersonCamera {
  constructor(params) {
    this.params = params;
    this.camera = params.camera;
    this.target = params.target;
    
    // Default configuration
    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
    
    this.defaultDistance = params.distance || 5;
    this.distance = this.defaultDistance;
    this.minDistance = params.minDistance || 1;
    this.maxDistance = params.maxDistance || 20;
    
    this.defaultHeight = params.height || 2;
    this.height = this.defaultHeight;
    this.minHeight = params.minHeight || 0.5;
    this.maxHeight = params.maxHeight || 10;
    
    this.lookAtHeight = params.lookAtHeight || 0.5;
    
    this.defaultXRotation = 0;
    this.defaultYRotation = 0;
    this.xRotation = 0; // vertical rotation (looking up/down)
    this.yRotation = 0; // horizontal rotation around target
    
    this.minVerticalAngle = params.minVerticalAngle || -Math.PI / 4;
    this.maxVerticalAngle = params.maxVerticalAngle || Math.PI / 4;
    
    // Smoothing for camera movement (0 to 1)
    this.smoothing = params.smoothing !== undefined ? params.smoothing : 0.9;
    this.collisionDetection = params.collisionDetection !== undefined ? params.collisionDetection : true;
    this.collisionLayers = params.collisionLayers || [];
    
    // For debugging purposes
    this.debugMode = params.debugMode || false;
    this.debugObjects = [];
    
    // Add mouse wheel event listener for zooming
    if (params.enableZoom !== false) {
      window.addEventListener('wheel', (e) => this.handleMouseWheel(e), false);
    }
    
    // For mobile zooming
    this.pinchZoomStartDistance = 0;
    this.pinchZoomEnabled = params.pinchZoomEnabled !== false;
  }
  
  // Get ideal camera position based on current parameters
  calculateIdealOffset() {
    const idealOffset = new THREE.Vector3();
    
    // Calculate position based on target's current rotation
    const targetRotation = (this.target && this.target.rotation) ? this.target.rotation.y : this.yRotation;
    
    // Distance is how far back to position the camera
    const horizontalDistance = this.distance * Math.cos(this.xRotation);
    const verticalDistance = this.distance * Math.sin(this.xRotation);
    
    // Position camera relative to target rotation
    idealOffset.set(
      -horizontalDistance * Math.sin(targetRotation + this.yRotation),
      this.height + verticalDistance,
      -horizontalDistance * Math.cos(targetRotation + this.yRotation)
    );
    
    return idealOffset;
  }
  
  // Get ideal look-at position based on current parameters
  calculateIdealLookAt() {
    const idealLookAt = new THREE.Vector3();
    
    // Look at point is slightly above character's base position
    if (this.target) {
      idealLookAt.copy(this.target.position);
      idealLookAt.y += this.lookAtHeight;
    }
    
    return idealLookAt;
  }
  
  handleMouseWheel(event) {
    // Adjust distance based on wheel direction
    const zoomSpeed = 0.1;
    this.distance += event.deltaY * 0.01 * zoomSpeed * this.distance;
    
    // Clamp to min/max limits
    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
  }
  
  handlePinchStart(distance) {
    this.pinchZoomStartDistance = distance;
  }
  
  handlePinchMove(distance) {
    if (!this.pinchZoomEnabled || this.pinchZoomStartDistance === 0) return;
    
    // Calculate zoom factor based on pinch change
    const delta = this.pinchZoomStartDistance - distance;
    const zoomSpeed = 0.005;
    this.distance += delta * zoomSpeed * this.distance;
    
    // Clamp to min/max limits
    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
    
    // Update the start distance for next move
    this.pinchZoomStartDistance = distance;
  }
  
  handlePinchEnd() {
    this.pinchZoomStartDistance = 0;
  }
  
  // Set camera rotation (used for direct control)
  setRotation(xRotation, yRotation) {
    // Clamp vertical rotation to reasonable limits
    this.xRotation = Math.max(this.minVerticalAngle, Math.min(this.maxVerticalAngle, xRotation));
    this.yRotation = yRotation;
  }
  
  // Adjust camera rotation (typically used with mouse/touch control)
  adjustRotation(deltaX, deltaY) {
    // Adjust rotation based on input deltas
    this.yRotation += deltaX;
    this.xRotation += deltaY;
    
    // Clamp vertical rotation to reasonable limits
    this.xRotation = Math.max(this.minVerticalAngle, Math.min(this.maxVerticalAngle, this.xRotation));
  }
  
  // Reset to default distance and height
  resetZoom() {
    this.distance = this.defaultDistance;
    this.height = this.defaultHeight;
  }
  
  // Reset rotation to default or target-based rotation
  resetRotation() {
    this.xRotation = this.defaultXRotation;
    this.yRotation = this.defaultYRotation;
  }
  
  // Raycast to detect collisions between camera and environment
  checkCameraCollisions(targetPosition, idealOffset) {
    if (!this.collisionDetection || this.collisionLayers.length === 0) {
      return idealOffset;
    }
    
    // Create ray from target to desired camera position
    const rayDirection = new THREE.Vector3().copy(idealOffset).normalize();
    const rayStart = new THREE.Vector3().copy(targetPosition);
    // Raise the ray start position slightly to avoid ground collision
    rayStart.y += 0.2;
    
    // Create raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.set(rayStart, rayDirection);
    
    // Calculate max distance for ray (slightly more than the ideal distance)
    const maxDistance = idealOffset.length() * 1.1;
    
    // Draw debug ray if debug mode is enabled
    if (this.debugMode) {
      this.drawDebugRay(rayStart, rayDirection, maxDistance);
    }
    
    // Check for collisions
    const collisions = raycaster.intersectObjects(this.collisionLayers, true);
    
    // If we have a collision closer than our ideal position
    if (collisions.length > 0 && collisions[0].distance < maxDistance) {
      // Get collision point and adjust with a small buffer
      const collisionDistance = collisions[0].distance * 0.9; // 90% of collision distance
      
      // Create corrected offset with the same direction but shorter length
      const correctedOffset = new THREE.Vector3()
        .copy(rayDirection)
        .multiplyScalar(collisionDistance);
      
      return correctedOffset;
    }
    
    // No collision, return original offset
    return idealOffset;
  }
  
  // Debug visualization helper
  drawDebugRay(start, direction, length) {
    // Clean up previous debug objects
    this.debugObjects.forEach(obj => {
      if (obj.parent) obj.parent.remove(obj);
    });
    this.debugObjects = [];
    
    // Create a line to represent the ray
    const geometry = new THREE.BufferGeometry().setFromPoints([
      start,
      new THREE.Vector3().copy(direction).multiplyScalar(length).add(start)
    ]);
    
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const line = new THREE.Line(geometry, material);
    
    // Add to scene if we have a scene reference
    if (this.params.scene) {
      this.params.scene.add(line);
      this.debugObjects.push(line);
    }
  }
  
  // Update camera position and orientation
  update(deltaTime) {
    if (!this.target) return;
    
    // Calculate ideal camera position and look at point
    const idealOffset = this.calculateIdealOffset();
    const idealLookAt = this.calculateIdealLookAt();
    
    // Adjust for collision if enabled
    const targetPosition = new THREE.Vector3().copy(this.target.position);
    const finalOffset = this.collisionDetection 
      ? this.checkCameraCollisions(targetPosition, idealOffset)
      : idealOffset;
    
    // Calculate desired camera position
    const desiredPosition = new THREE.Vector3().copy(targetPosition).add(finalOffset);
    
    // Smoothly interpolate current position and look-at point
    if (this.smoothing > 0) {
      // Adjust smoothing factor based on deltaTime for consistent behavior
      const smoothFactor = Math.pow(1 - this.smoothing, deltaTime * 60);
      
      // Interpolate positions for smooth camera movement
      this.currentPosition.lerp(desiredPosition, smoothFactor);
      this.currentLookAt.lerp(idealLookAt, smoothFactor);
    } else {
      // No smoothing, just use desired positions directly
      this.currentPosition.copy(desiredPosition);
      this.currentLookAt.copy(idealLookAt);
    }
    
    // Apply to camera
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }
}