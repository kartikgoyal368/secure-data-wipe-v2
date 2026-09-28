"use client";

import { useEffect, useRef } from "react";

export default function Globe(props: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let globe: any;

    const initGlobe = async () => {
      // Dynamically import globe.gl to avoid SSR issues
      const GlobeGL = (await import("globe.gl")).default;
      
      const width = containerRef.current?.clientWidth || 500;
      const height = containerRef.current?.clientHeight || 500;

      // Generate random particle data for a "cyber" look
      const N = 1200;
      const gData = [...Array(N).keys()].map(() => ({
        lat: (Math.random() - 0.5) * 180,
        lng: (Math.random() - 0.5) * 360,
        alt: Math.random() * 0.1 + 0.01,
        radius: Math.random() * 1.5 + 0.5,
        // Using various shades of bright, cyber green
        color: ['#10b981', '#22c55e', '#34d399', '#4ade80'][Math.floor(Math.random() * 4)]
      }));

      globe = (GlobeGL as any)()(containerRef.current as HTMLElement)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg') // Dark aesthetic
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundColor('rgba(0, 0, 0, 0)') // Transparent background to blend in
        .showAtmosphere(true)
        .atmosphereColor('lightskyblue')
        .width(width)
        .height(height)
        .particlesData(gData)
        .particlesList((d: any) => [d]) // Treat each particle object as its own set of 1 particle
        .particleLat('lat')
        .particleLng('lng')
        .particleAltitude('alt')
        .particlesColor('color')
        .particlesSize('radius');
      
      globeInstance.current = globe;

      // Set altitude to balance a large globe while leaving free space around it for particles
      globe.pointOfView({ altitude: 2.0 });
      
      // Auto-rotate
      if (globe.controls) {
        const controls = globe.controls();
        controls.enableZoom = false;
      }
    };

    initGlobe();

    // Constant rotation loop
    let animationFrameId: number;
    const rotateGlobe = () => {
      if (globeInstance.current) {
        const scene = globeInstance.current.scene();
        if (scene) {
          scene.rotation.y += 0.003; // Constant rotation speed
        }
      }
      animationFrameId = requestAnimationFrame(rotateGlobe);
    };
    rotateGlobe();

    const handleResize = () => {
      if (globeInstance.current && containerRef.current) {
        globeInstance.current
          .width(containerRef.current.clientWidth)
          .height(containerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current) {
        containerRef.current.innerHTML = ''; // Cleanup WebGL canvas on unmount
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[300px]" />;
}
