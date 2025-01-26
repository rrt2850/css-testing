// useCollisions.ts
import { useState, useEffect } from "react";

interface Position {
  x: number;
  y: number;
}
interface ScreenSize {
  width: number;
  height: number;
}
interface Dimensions {
  width: number;
  height: number;
}

export function useCollisions(
  position: Position,
  screenSize: ScreenSize,
  dimensions: Dimensions
) {
  const [collisions, setCollisions] = useState({
    leftCollision: false,
    rightCollision: false,
    topCollision: false,
    bottomCollision: false,
    isColliding: false,
  });

  useEffect(() => {
    const leftCollision = position.x <= 0;
    const rightCollision = position.x + dimensions.width >= screenSize.width;
    const topCollision = position.y <= 0;
    const bottomCollision = position.y + dimensions.height >= screenSize.height;

    const isColliding =
      leftCollision || rightCollision || topCollision || bottomCollision;

    setCollisions({
      leftCollision,
      rightCollision,
      topCollision,
      bottomCollision,
      isColliding,
    });
  }, [position, screenSize, dimensions]);

  return collisions;
}
