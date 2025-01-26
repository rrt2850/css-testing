import React, { useState, useEffect, useRef } from "react";
import { useCollisions } from "../Hooks/useCollisions";
import SpriteLoader from "./SpriteLoader";
import { applyPhysics, handleJump } from "./MovementUtils";
import { useUniqueId } from "./UniqueIdProvider";

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface Scale {
  x: number;
  y: number;
}

const MovableCharacter: React.FC = () => {
  const [scale, setScale] = useState<Scale>({x: 1, y: 1})
  const [position, setPosition] = useState<Position>({ x: 100, y: 300 });
  const [velocity, setVelocity] = useState<Velocity>({ x: 0, y: 0 });
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [characterDimensions, setCharacterDimensions] = useState({
    width: 0,
    height: 0,
  });

  const uniqueId = useRef(useUniqueId()).current;
  const collisions = useCollisions(position, screenSize, characterDimensions);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
  
      // Adjust position if it is out of bounds
      setPosition((prevPosition) => ({
        x: Math.min(prevPosition.x, window.innerWidth - characterDimensions.width * scale.x),
        y: Math.min(prevPosition.y, window.innerHeight - characterDimensions.height * scale.y),
      }));
    };
    window.addEventListener("resize", handleResize);
  
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [characterDimensions, scale]);
  

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const newPosition = { ...position };
      const newVelocity = { ...velocity };

      applyPhysics({
        position: newPosition,
        velocity: newVelocity,
        gravity: 380,
        jumpStrength: 300,
        timeStep: delta,
        isOnGround: collisions.bottomCollision,
        horizontalInput: 0,
        maxSpeed: 200,
        friction: 0.1,
      });

      newPosition.x = Math.max(
        0,
        Math.min(
          newPosition.x,
          collisions.rightCollision
            ? position.x // Stop horizontal movement if colliding on the right
            : screenSize.width - characterDimensions.width * scale.x
        )
      );
      newPosition.y = Math.max(
        0,
        Math.min(
          newPosition.y,
          collisions.bottomCollision
            ? position.y // Stop downward movement if colliding on the bottom
            : screenSize.height - characterDimensions.height * scale.y
        )
      );

      setPosition(newPosition);
      setVelocity(newVelocity);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [position, velocity, screenSize, characterDimensions]);

  const handleClick = () => {
    const newVelocity = { ...velocity };
    handleJump({
      position,
      velocity: newVelocity,
      gravity: 2000,
      jumpStrength: 2000,
      timeStep: 1 / 60,
      isOnGround: collisions.bottomCollision,
    });
    setVelocity(newVelocity);
  };

  return (
    <div onClick={handleClick}>
      <SpriteLoader
        imageSrc="src/assets/Slime1/Idle/Slime1_Idle_full.png"
        totalFrames={24}
        perRow={6}
        startFrame={0}
        endFrame={5}
        frameDuration={150}
        scale={scale}
        position={position}
        onBoundingBoxCalculated={(box) =>
          setCharacterDimensions({ width: box.width, height: box.height })
        }
      />
      <p>Unique ID: {uniqueId}</p>
      <p>Bottom Collision: {collisions.bottomCollision ? "Yes" : "No"}</p>
    </div>
  );
};

export default MovableCharacter;
