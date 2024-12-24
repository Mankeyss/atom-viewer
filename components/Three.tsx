"use client";

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import data from "../data/PeriodicTable.json";

function MyThree({ type }: { type: number }) {
  const refContainer = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const electronsRef = useRef<THREE.Mesh[]>([]);

  function findShell(target: number): number | null {
    const input = data.elements[type - 1].shells;

    let prev = 0;
    for (let i = 0; i < input.length; i++) {
      if (prev + input[i] > target) {
        return i;
      }
      prev += input[i];
    }
    return null; // Return null if no such index is found
  }

  useEffect(() => {
    // === SETUP SCENE ===
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Append renderer DOM element to the container
    if (refContainer.current) {
      refContainer.current.innerHTML = ""; // Clear old canvas
      refContainer.current.appendChild(renderer.domElement);
    }

    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;

    // === CAMERA ===
    camera.position.z = 15;

    // === CONTROLS ===
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.zoomSpeed = 1;
    controls.minDistance = 10;
    controls.maxDistance = 150;

    // === ANIMATION ===
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate the atom (if it exists in the scene)
      const atom = scene.getObjectByName("atom") as THREE.Group;
      if (atom) {
        atom.rotation.x += 0.01;
        atom.rotation.y += 0.01;
      }

      // Animate electrons
      electronsRef.current.forEach((electron, index) => {
        const orbitRadiusX = 22 + findShell(index)! * 10; // Different radi for different electrons
        const orbitRadiusY = 20 + findShell(index)! * 10;

        const angle = (Date.now() * 0.001 + index * 0.2) % (Math.PI * 2); // Unique angle for each electron
        const x = orbitRadiusX * Math.cos(angle);
        const y = orbitRadiusY * Math.sin(angle);
        const tiltAngle = THREE.MathUtils.degToRad(
          30 * findShell(index)! + 1 * Math.random()
        );

        const tiltedY = y * Math.cos(tiltAngle);
        const tiltedZ = y * Math.sin(tiltAngle);

        electron.position.set(x, tiltedY, tiltedZ);
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
      scene.clear();
      electronsRef.current = [];
    };
  }, []); // Run once on mount

  useEffect(() => {
    // === ADD ATOM ===
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old atom and electrons
    const oldAtom = scene.getObjectByName("atom");
    if (oldAtom) {
      scene.remove(oldAtom);
      oldAtom.traverse((child: any) => {
        if ((child as THREE.Mesh).geometry) {
          (child as THREE.Mesh).geometry.dispose();
        }
      });
    }

    electronsRef.current.forEach((electron) => {
      scene.remove(electron);
      electron.geometry.dispose();
    });
    electronsRef.current = [];

    // === CREATE NEW ATOM ===
    const geometry = new THREE.SphereGeometry(0.7, 64, 64);
    const electronGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const neutronMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const protonMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    const atom = new THREE.Group();
    atom.name = "atom";

    // For each proton, add it
    for (let i = 0; i < data.elements[type - 1].number; i++) {
      const proton = new THREE.Mesh(geometry, protonMaterial);
      proton.position.set(
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random() * 10 - 5
      );
      atom.add(proton);
    }

    //Calculate amount of neutrons
    const amountOfNeutrons = Math.round(
      data.elements[type - 1].atomic_mass - data.elements[type - 1].number
    );

    // Same as for protons but for neutrons
    for (let i = 0; i < amountOfNeutrons; i++) {
      const neutron = new THREE.Mesh(geometry, neutronMaterial);
      neutron.position.set(
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random() * 10 - 5
      );
      atom.add(neutron);
    }

    scene.add(atom);

    // === ADD ELECTRONS ===
    const electronMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const electronConfig = data.elements[type - 1].shells;

    electronConfig.forEach((numElectrons, shellIndex) => {
      const baseRadius = (shellIndex + 1) * 7; // Increase radius to space out electrons
      const angleIncrement = (Math.PI * 2) / numElectrons; // Evenly distribute electrons on the orbit

      // Increase the radius dynamically to space out electrons based on shell index and electron count
      const radius = baseRadius + (numElectrons > 1 ? numElectrons * 0.5 : 0);

      for (let i = 0; i < numElectrons; i++) {
        const angle = i * angleIncrement; // Spread electrons evenly around the shell
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        const electron = new THREE.Mesh(electronGeometry, electronMaterial);
        electron.position.set(x, y, shellIndex / 100); // Slight vertical offset for each shell
        electronsRef.current.push(electron);
        scene.add(electron);
      }
    });
  }, [type]);

  return <div ref={refContainer} />;
}

export default MyThree;
