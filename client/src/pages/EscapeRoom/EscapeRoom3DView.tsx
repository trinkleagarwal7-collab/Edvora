import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EscapeRoomRoomClient } from '../../types';

interface EscapeRoom3DViewProps {
  currentRoom: EscapeRoomRoomClient;
  totalRooms: number;
  keysCollected: number;
  onInteractTerminal: () => void;
  onInteractDoor: () => void;
  onInteractDesk: () => void;
  onFallbackTo2D: () => void;
}

export const EscapeRoom3DView: React.FC<EscapeRoom3DViewProps> = ({
  currentRoom,
  totalRooms,
  keysCollected,
  onInteractTerminal,
  onInteractDoor,
  onInteractDesk,
  onFallbackTo2D
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        onFallbackTo2D();
        return;
      }
    } catch (e) {
      onFallbackTo2D();
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0b14);
    scene.fog = new THREE.FogExp2(0x0c0b14, 0.04);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 5.8);
    camera.lookAt(0, 1.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x2d244f, 1.2);
    scene.add(ambientLight);

    // Lantern warm lights on pillars
    const torchLeft = new THREE.PointLight(0xf59e0b, 2.2, 10);
    torchLeft.position.set(-3.2, 2.8, 1);
    scene.add(torchLeft);

    const torchRight = new THREE.PointLight(0xf59e0b, 2.2, 10);
    torchRight.position.set(3.2, 2.8, 1);
    scene.add(torchRight);

    // Cyan holographic spotlight on Terminal
    const terminalLight = new THREE.SpotLight(0x06b6d4, 3.5, 9, Math.PI / 4, 0.4);
    terminalLight.position.set(-1.8, 4.5, 0);
    terminalLight.target.position.set(-1.8, 0.9, 0);
    scene.add(terminalLight);
    scene.add(terminalLight.target);

    // Door lock illumination (Red when locked, Emerald when unlocked)
    const doorLightColor = currentRoom.isCompleted ? 0x10b981 : 0xef4444;
    const doorLight = new THREE.PointLight(doorLightColor, 3.0, 7);
    doorLight.position.set(0, 2.2, -3.2);
    scene.add(doorLight);

    // 3. Environment: Floor & Stone Pillars
    // Floor
    const floorGeo = new THREE.PlaneGeometry(24, 24, 12, 12);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x141221,
      roughness: 0.85,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Side Pillars
    const pillarGeo = new THREE.BoxGeometry(0.8, 5, 0.8);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1a172c,
      roughness: 0.9
    });
    [-3.5, 3.5].forEach((x) => {
      [-1, 2].forEach((z) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(x, 2.5, z);
        scene.add(pillar);
      });
    });

    // Back Chamber Arch & Door Wall
    const backWallGeo = new THREE.BoxGeometry(10, 6, 0.6);
    const backWallMat = new THREE.MeshStandardMaterial({ color: 0x121020, roughness: 0.95 });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, 3, -3.8);
    scene.add(backWall);

    // 4. Interactive Object A: The Vault Door
    const doorFrameGroup = new THREE.Group();
    doorFrameGroup.position.set(0, 0, -3.5);

    // Door Frame
    const frameGeo = new THREE.BoxGeometry(2.4, 3.6, 0.4);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x221f38, roughness: 0.7 });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(0, 1.8, 0);
    doorFrameGroup.add(frameMesh);

    // Door Panel
    const doorGeo = new THREE.BoxGeometry(2.0, 3.3, 0.2);
    const doorMat = new THREE.MeshStandardMaterial({
      color: currentRoom.isCompleted ? 0x0f291e : 0x25203b,
      metalness: 0.6,
      roughness: 0.4
    });
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(0, 1.7, 0.1);
    doorMesh.name = 'interactive_door';
    doorFrameGroup.add(doorMesh);

    // Glowing Lock Core
    const lockCoreGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.1, 16);
    const lockCoreMat = new THREE.MeshBasicMaterial({
      color: currentRoom.isCompleted ? 0x10b981 : 0xef4444
    });
    const lockCore = new THREE.Mesh(lockCoreGeo, lockCoreMat);
    lockCore.rotation.x = Math.PI / 2;
    lockCore.position.set(0, 1.7, 0.22);
    doorFrameGroup.add(lockCore);
    scene.add(doorFrameGroup);

    // 5. Interactive Object B: Central Holographic Terminal
    const terminalGroup = new THREE.Group();
    terminalGroup.position.set(-1.8, 0, 0.2);

    // Pedestal base
    const baseGeo = new THREE.CylinderGeometry(0.45, 0.6, 0.9, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1b1930, metalness: 0.5, roughness: 0.5 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, 0.45, 0);
    baseMesh.name = 'interactive_terminal';
    terminalGroup.add(baseMesh);

    // Slanted Console Screen
    const consoleGeo = new THREE.BoxGeometry(0.7, 0.08, 0.5);
    const consoleMat = new THREE.MeshStandardMaterial({ color: 0x2a2745, roughness: 0.4 });
    const consoleMesh = new THREE.Mesh(consoleGeo, consoleMat);
    consoleMesh.rotation.x = Math.PI / 6;
    consoleMesh.position.set(0, 0.95, 0);
    consoleMesh.name = 'interactive_terminal';
    terminalGroup.add(consoleMesh);

    // Holographic Glyph / Floating Ring
    const holoRingGeo = new THREE.TorusGeometry(0.25, 0.03, 12, 32);
    const holoRingMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true });
    const holoRing = new THREE.Mesh(holoRingGeo, holoRingMat);
    holoRing.position.set(0, 1.35, 0);
    holoRing.name = 'interactive_terminal';
    terminalGroup.add(holoRing);

    // Holographic Octahedron Core
    const holoCoreGeo = new THREE.OctahedronGeometry(0.12, 0);
    const holoCoreMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
    const holoCore = new THREE.Mesh(holoCoreGeo, holoCoreMat);
    holoCore.position.set(0, 1.35, 0);
    holoCore.name = 'interactive_terminal';
    terminalGroup.add(holoCore);

    scene.add(terminalGroup);

    // 6. Interactive Object C: Scholar's Clue Desk
    const deskGroup = new THREE.Group();
    deskGroup.position.set(1.9, 0, 0.4);

    // Desk Tabletop
    const tableTopGeo = new THREE.BoxGeometry(1.4, 0.08, 0.8);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x2b1d14, roughness: 0.7 });
    const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
    tableTop.position.set(0, 0.75, 0);
    tableTop.name = 'interactive_desk';
    deskGroup.add(tableTop);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.75);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1f140e });
    [
      [-0.6, -0.3],
      [0.6, -0.3],
      [-0.6, 0.3],
      [0.6, 0.3]
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 0.375, lz);
      deskGroup.add(leg);
    });

    // Illuminated Parchment / Scroll
    const scrollGeo = new THREE.PlaneGeometry(0.35, 0.45);
    const scrollMat = new THREE.MeshBasicMaterial({ color: 0xfef3c7, side: THREE.DoubleSide });
    const scrollMesh = new THREE.Mesh(scrollGeo, scrollMat);
    scrollMesh.rotation.x = -Math.PI / 2;
    scrollMesh.rotation.z = Math.PI / 12;
    scrollMesh.position.set(0, 0.8, 0);
    scrollMesh.name = 'interactive_desk';
    deskGroup.add(scrollMesh);

    scene.add(deskGroup);

    // 7. Floating Knowledge Key (if room has or awards a key)
    let keyMesh: THREE.Mesh | null = null;
    if (currentRoom.roomType === 'knowledge_vault' || currentRoom.roomType === 'final_boss') {
      const keyGeo = new THREE.TorusGeometry(0.14, 0.04, 8, 16);
      const keyMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        metalness: 0.8,
        roughness: 0.2
      });
      keyMesh = new THREE.Mesh(keyGeo, keyMat);
      keyMesh.position.set(0, 1.8, -1.5);
      scene.add(keyMesh);
    }

    // 8. Floating Ambient Dust Particles
    const particlesCount = 90;
    const particlePositions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 10;
      particlePositions[i + 1] = Math.random() * 4 + 0.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.035,
      transparent: true,
      opacity: 0.6
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 9. Raycasting for Mouse Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([doorMesh, baseMesh, consoleMesh, holoRing, tableTop, scrollMesh]);

      if (intersects.length > 0) {
        const hit = intersects[0].object.name;
        setHoveredObject(hit);
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredObject(null);
        renderer.domElement.style.cursor = 'default';
      }
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([doorMesh, baseMesh, consoleMesh, holoRing, tableTop, scrollMesh]);

      if (intersects.length > 0) {
        const hit = intersects[0].object.name;
        if (hit === 'interactive_terminal') {
          onInteractTerminal();
        } else if (hit === 'interactive_door') {
          onInteractDoor();
        } else if (hit === 'interactive_desk') {
          onInteractDesk();
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleClick);

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Holographic terminal animations
      holoRing.rotation.x = elapsed * 0.8;
      holoRing.rotation.y = elapsed * 1.2;
      holoCore.rotation.y = -elapsed * 1.5;
      holoCore.position.y = 1.35 + Math.sin(elapsed * 2) * 0.05;

      // Key rotation if visible
      if (keyMesh) {
        keyMesh.rotation.y = elapsed * 1.8;
        keyMesh.position.y = 1.8 + Math.sin(elapsed * 2.5) * 0.08;
      }

      // Torchlight flickering
      torchLeft.intensity = 2.0 + Math.sin(elapsed * 6) * 0.25;
      torchRight.intensity = 2.0 + Math.cos(elapsed * 5.5) * 0.25;

      // Slowly drift particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.002;
        if (positions[i] > 4.5) positions[i] = 0.5;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('click', handleClick);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [currentRoom.roomIndex, currentRoom.isCompleted]);

  return (
    <div className="relative w-full h-[520px] md:h-[620px] rounded-3xl overflow-hidden bg-[#0c0b14] shadow-2xl border border-charcoal-800 select-none">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Atmospheric Overlays & HUD */}
      {/* Top Left: Chamber Identification */}
      <div className="absolute top-5 left-5 pointer-events-none space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal-900/80 backdrop-blur-md border border-brand-500/40 text-[11px] font-bold text-brand-300">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          <span>
            Chamber {currentRoom.roomIndex + 1} of {totalRooms}
          </span>
        </div>
        <h3 className="text-base md:text-lg font-black text-white drop-shadow-md">
          {currentRoom.roomTitle}
        </h3>
        <p className="text-xs text-charcoal-300 max-w-sm hidden sm:block drop-shadow-sm">
          {currentRoom.roomDescription}
        </p>
      </div>

      {/* Top Right: View Controls */}
      <div className="absolute top-5 right-5 flex items-center gap-2">
        <button
          onClick={onFallbackTo2D}
          className="px-3 py-1.5 rounded-xl bg-charcoal-900/80 backdrop-blur-md border border-charcoal-700 hover:border-brand-400 text-charcoal-300 hover:text-white text-xs font-semibold transition-all"
        >
          Switch to 2D
        </button>
      </div>

      {/* Hover Tooltip / Action Guide */}
      {hoveredObject && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-charcoal-950/90 backdrop-blur-md border border-brand-500/60 text-white text-xs font-bold shadow-xl animate-in fade-in duration-150 flex items-center gap-2">
          {hoveredObject === 'interactive_terminal' && (
            <>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Click Holographic Terminal to Inspect Question</span>
            </>
          )}
          {hoveredObject === 'interactive_door' && (
            <>
              <span
                className={`w-2 h-2 rounded-full ${
                  currentRoom.isCompleted ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              <span>
                {currentRoom.isCompleted
                  ? 'Door Unlocked! Click to Advance to Next Chamber'
                  : 'Vault Door Sealed. Solve the Terminal Challenge First.'}
              </span>
            </>
          )}
          {hoveredObject === 'interactive_desk' && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Click Scholar\'s Desk to View Chamber Clues</span>
            </>
          )}
        </div>
      )}

      {/* Bottom Floating Hotspot Action Pills */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={onInteractTerminal}
            className="px-4 py-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-bold backdrop-blur-md transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <span>📟 Open Terminal</span>
          </button>
          <button
            onClick={onInteractDesk}
            className="px-4 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-bold backdrop-blur-md transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <span>📜 Inspect Clues</span>
          </button>
        </div>

        <div>
          <button
            onClick={onInteractDoor}
            className={`px-4 py-2 rounded-2xl text-xs font-bold backdrop-blur-md transition-all shadow-lg flex items-center gap-2 ${
              currentRoom.isCompleted
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white animate-bounce'
                : 'bg-charcoal-900/80 border border-charcoal-700 text-charcoal-400 cursor-not-allowed'
            }`}
          >
            <span>{currentRoom.isCompleted ? '🚪 Pass Through Door' : '🔒 Door Locked'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
