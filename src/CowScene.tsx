"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { Suspense, useRef, useState, useEffect } from "react"
import { Group } from "three"

function Cow() {
    const { scene } = useGLTF(process.env.PUBLIC_URL + "/assets/3d/cow_centered.glb");
    const duckRef = useRef<Group>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [rotationSpeed, setRotationSpeed] = useState({ x: 0, y: 0 });
    const [previousMousePosition, setPreviousMousePosition] = useState({ x: 0, y: 0 });
    const { size, gl } = useThree();
  
    // Timer state
    const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  
    const resetRotation = () => {
      if (duckRef.current) {
        // Reset the rotation to starting position (0, 0, 0)
        duckRef.current.rotation.set(0, 165, 0);
        setRotationSpeed({ x: 0, y: 0 }); // Reset speed as well
      }
    };
  
    useEffect(() => {
      const canvas = gl.domElement;
      
      const handlePointerDown = (event: PointerEvent) => {
        if (event.button === 0) {
          setIsDragging(true);
          setPreviousMousePosition({
            x: event.clientX,
            y: event.clientY,
          });
          setRotationSpeed({ x: 0, y: 0 });
          setLastInteractionTime(Date.now()); // Reset timer on interaction
        }
      };
  
      const handlePointerUp = () => {
        setIsDragging(false);
      };
  
      const handlePointerMove = (event: PointerEvent) => {
        if (isDragging && duckRef.current) {
          const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y,
          };
  
          const deltaRotationY = (deltaMove.x / size.width) * Math.PI * 2;
          const deltaRotationX = (deltaMove.y / size.height) * Math.PI * 2;
  
          duckRef.current.rotation.y += deltaRotationY;
          duckRef.current.rotation.x -= deltaRotationX;
  
          setRotationSpeed({
            x: -deltaRotationX,
            y: deltaRotationY,
          });
  
          setPreviousMousePosition({
            x: event.clientX,
            y: event.clientY,
          });
  
          setLastInteractionTime(Date.now()); // Reset timer on movement
        }
      };
  
      canvas.addEventListener('pointerdown', handlePointerDown);
      canvas.addEventListener('pointerup', handlePointerUp);
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('pointerleave', handlePointerUp);
  
      return () => {
        canvas.removeEventListener('pointerdown', handlePointerDown);
        canvas.removeEventListener('pointerup', handlePointerUp);
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('pointerleave', handlePointerUp);
      };
    }, [isDragging, previousMousePosition, size.width, size.height, gl]);
  
    useFrame(() => {
      if (duckRef.current) {
        if (!isDragging) {
          // Apply inertia
          duckRef.current.rotation.x += rotationSpeed.x;
          duckRef.current.rotation.y += rotationSpeed.y;
  
          // Gradually reduce rotation speed
          setRotationSpeed(prevSpeed => ({
            x: prevSpeed.x * 0.95,
            y: prevSpeed.y * 0.95,
          }));
        }
      }
  
      // Check if the time elapsed exceeds 5 seconds
      if (Date.now() - lastInteractionTime > 5000) {
        resetRotation(); // Reset rotation after 5 seconds
      }
    });

  return <primitive ref={duckRef} object={scene} scale={2} rotation={[0, 165, 0]}/>
}

export default function CowScene() {
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}>
      <Canvas camera={{ position: [0, 0, 75], fov: 50 }} className="w-full h-screen">
        <Suspense fallback={null}>
          <Cow />
          <ambientLight intensity={1} />
        </Suspense>
      </Canvas>
    </div>
  )
}
