import React, { useRef, useEffect, useState } from "react";

export interface SpriteSheetLoaderProps {
    imageSrc: string;
    totalFrames: number;
    startFrame: number;
    endFrame: number;
    frameDuration: number; // in milliseconds
    perRow: number;
    scale: { x: number; y: number };
    position?: { x: number; y: number }; // Optional position for canvas
    onBoundingBoxCalculated?: (boundingBox: BoundingBox) => void;
}

export interface BoundingBox {
    width: number;
    height: number;
    x: number;
    y: number;
}

function calculateBoundingBox(
    spriteSheet: HTMLImageElement,
    frameWidth: number,
    frameHeight: number,
    startFrame: number,
    endFrame: number,
    perRow: number
): BoundingBox | null {
    let maxX = 0,
        maxY = 0,
        minX = frameWidth,
        minY = frameHeight;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = frameWidth;
    tempCanvas.height = frameHeight;
    const tempContext = tempCanvas.getContext("2d");
    if (!tempContext) {
        console.error("Failed to create temporary canvas context.");
        return null;
    }

    for (let frame = startFrame; frame <= endFrame; frame++) {
        const frameX = (frame % perRow) * frameWidth;
        const frameY = Math.floor(frame / perRow) * frameHeight;

        tempContext.clearRect(0, 0, frameWidth, frameHeight);
        tempContext.drawImage(
            spriteSheet,
            frameX,
            frameY,
            frameWidth,
            frameHeight,
            0,
            0,
            frameWidth,
            frameHeight
        );

        const imageData = tempContext.getImageData(0, 0, frameWidth, frameHeight).data;
        for (let y = 0; y < frameHeight; y++) {
            for (let x = 0; x < frameWidth; x++) {
                const index = (y * frameWidth + x) * 4;
                const alpha = imageData[index + 3];
                if (alpha > 0) {
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
        }
    }

    if (minX <= maxX && minY <= maxY) {
        return {
            x: Math.round(minX),
            y: Math.round(minY),
            width: Math.round(maxX - minX + 1),
            height: Math.round(maxY - minY + 1),
        };
    }
    return null;
}

const SpriteLoader: React.FC<SpriteSheetLoaderProps> = ({
    imageSrc,
    totalFrames,
    startFrame,
    endFrame,
    frameDuration,
    perRow,
    scale = { x: 1, y: 1 },
    position = { x: 0, y: 0 }, // Default position
    onBoundingBoxCalculated
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number | null>(null);
    const frameRef = useRef<number>(startFrame);

    const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
    const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);

    useEffect(() => {
        const image = new Image();
        image.src = imageSrc;

        image.onload = () => {
            const frameWidth = image.width / perRow;
            const frameHeight = image.height / Math.ceil(totalFrames / perRow);

            const calculatedBox = calculateBoundingBox(
                image,
                frameWidth,
                frameHeight,
                startFrame,
                endFrame,
                perRow
            );

            setLoadedImage(image);
            setBoundingBox(
                calculatedBox || {
                    x: 0,
                    y: 0,
                    width: frameWidth,
                    height: frameHeight,
                }
            );
            if (calculatedBox && onBoundingBoxCalculated) {
                onBoundingBoxCalculated(calculatedBox);
            }
        };

        image.onerror = () => {
            console.error(`Failed to load sprite sheet from ${imageSrc}.`);
        };

        return () => {
            setLoadedImage(null); // Clean up image
        };
    }, [imageSrc, perRow, totalFrames, startFrame, endFrame]);

    useEffect(() => {
        if (!loadedImage || !boundingBox) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const frameWidth = loadedImage.width / perRow;
        const frameHeight = loadedImage.height / Math.ceil(totalFrames / perRow);

        const drawFrame = (currentFrame: number) => {
            const frameX = (currentFrame % perRow) * frameWidth + boundingBox.x;
            const frameY = Math.floor(currentFrame / perRow) * frameHeight + boundingBox.y;

            context.clearRect(0, 0, canvas.width, canvas.height);

            context.save();
            context.scale(scale.x, scale.y);

            context.drawImage(
                loadedImage,
                frameX,
                frameY,
                boundingBox.width,
                boundingBox.height,
                0,
                0,
                boundingBox.width,
                boundingBox.height
            );

            context.restore();
        };

        const animate = (timestamp: number) => {
            if (lastFrameTimeRef.current === null) {
                lastFrameTimeRef.current = timestamp;
            }
            const elapsed = timestamp - lastFrameTimeRef.current;

            if (elapsed >= frameDuration) {
                drawFrame(frameRef.current);
                frameRef.current =
                    frameRef.current < endFrame ? frameRef.current + 1 : startFrame;
                lastFrameTimeRef.current = timestamp;
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [
        loadedImage,
        boundingBox,
        scale,
        startFrame,
        endFrame,
        frameDuration,
        perRow,
    ]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.left = `${Math.round(position.x)}px`;
            canvas.style.top = `${Math.round(position.y)}px`;
        }
    }, [position]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
            }}
        />
    );
};

export default SpriteLoader;
