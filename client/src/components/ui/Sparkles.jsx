import React, { useId, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion, useAnimation } from "framer-motion";

export const SparklesCore = (props) => {
  const {
    id,
    background,
    minSize,
    maxSize,
    speed,
    particleColor,
    particleDensity,
  } = props;
  
  const [init, setInit] = useState(false);
  
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);
  
  const controls = useAnimation();

  const particlesLoaded = async (container) => {
    if (container) {
      controls.start({
        opacity: 1,
        transition: {
          duration: 1,
        },
      });
    }
  };

  const generatedId = useId();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={controls} 
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0 }}
    >
      {init && (
        <Particles
          id={id || generatedId}
          particlesLoaded={particlesLoaded}
          style={{ width: '100%', height: '100%' }}
          options={{
            background: {
              color: { value: background || "transparent" },
            },
            fullScreen: { enable: false, zIndex: 0 },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: { enable: true, mode: "push" },
                onHover: { enable: false, mode: "repulse" },
                resize: true,
              },
              modes: {
                push: { quantity: 4 },
                repulse: { distance: 200, duration: 0.4 },
              },
            },
            particles: {
              color: { value: particleColor || "#ffffff" },
              move: {
                direction: "none",
                enable: true,
                outModes: { default: "out" },
                random: false,
                speed: { min: 0.1, max: 1 },
                straight: false,
              },
              number: {
                density: { enable: true, width: 400, height: 400 },
                value: particleDensity || 150,
              },
              opacity: {
                value: { min: 0.1, max: 1 },
                animation: {
                  enable: true,
                  speed: speed || 2,
                  sync: false,
                },
              },
              size: {
                value: { min: minSize || 0.5, max: maxSize || 2.5 },
              },
            },
            detectRetina: true,
          }}
        />
      )}
    </motion.div>
  );
};
