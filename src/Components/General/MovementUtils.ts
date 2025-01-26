export interface MovementUtilsParams {
  position: { x: number; y: number }; // Current position
  velocity: { x: number; y: number }; // Current velocity
  acceleration?: { x: number; y: number }; // Optional, for more detailed physics
  gravity: number; // Gravity constant
  jumpStrength: number; // Initial jump velocity
  timeStep: number; // Time interval (delta time)
  isOnGround: boolean; // Function to check if object is on ground
  tolerance?: number; // Optional tolerance for determining ground contact
  horizontalInput?: number; // -1 for left, 1 for right, 0 for no input
  maxSpeed?: number; // Optional cap on horizontal velocity
  friction?: number; // Optional deceleration for smoother motion
}

export function applyGravity(params: MovementUtilsParams): void {
  // Apply gravity to the vertical velocity
  params.velocity.y += params.gravity * params.timeStep;
}

export function isOnGroundFunction(positionY: number, groundY: number, velocityY: number, tolerance: number = 0.1): boolean {
  // Check if the character's vertical position is close to the ground level
  // and if the vertical velocity is small enough to consider it stationary
  return Math.abs(positionY - groundY) <= tolerance && velocityY >= 0;
}


export function handleJump(params: MovementUtilsParams): void {
  // Check if the object is on the ground and apply jump strength if so
  if (params.isOnGround) {
      params.velocity.y = -params.jumpStrength; // Negative to move upward
  }
}

export function applyHorizontalMovement(params: MovementUtilsParams): void {
  if (params.horizontalInput !== undefined) {
      // Update horizontal velocity based on input
      params.velocity.x += params.horizontalInput * params.timeStep;

      // Apply friction if specified
      if (params.friction) {
          params.velocity.x *= (1 - params.friction);
      }

      // Cap velocity to maxSpeed if specified
      if (params.maxSpeed) {
          params.velocity.x = Math.min(Math.max(params.velocity.x, -params.maxSpeed), params.maxSpeed);
      }
  }
}

export function updatePosition(params: MovementUtilsParams): void {
  // Update the position based on the velocity
  params.position.x += params.velocity.x * params.timeStep;
  params.position.y += params.velocity.y * params.timeStep;

  // Optional: Reset vertical velocity if the object is on the ground
  if (params.isOnGround) {
      params.velocity.y = 0; // Stop downward movement when on ground
  }
}

export function applyPhysics(params: MovementUtilsParams): void {
  // Sequentially apply movement calculations
  applyGravity(params);
  applyHorizontalMovement(params);

  // Update the position based on new velocity
  updatePosition(params);
}
