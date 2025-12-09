import React from 'react';

export enum AppMode {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface ParticleData {
  id: number;
  scatterPosition: [number, number, number];
  treePosition: [number, number, number];
  scale: number;
  color: string;
  speed: number;
}

export enum GiftType {
  CUBE = 'CUBE',
  CYLINDER = 'CYLINDER',
  STAR = 'STAR'
}

export enum GiftPattern {
  STRIPES = 'STRIPES',
  DOTS = 'DOTS',
  SOLID = 'SOLID',
  SPECIAL = 'SPECIAL'
}

export enum BowType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  COMPLEX = 'COMPLEX'
}

export interface GiftData extends ParticleData {
  type: GiftType;
  pattern: GiftPattern;
  dimensions: [number, number, number]; // [width/radius, height, depth/ignored]
  rotation: [number, number, number]; // Target rotation in tree mode
  cardMessage: string; // The message on the card inside
  decoration: {
    ribbonColor: string;
    hasBow: boolean;
    bowType: BowType;
    hasTag: boolean;
    tagText: string;
    hasRibbon: boolean;
  };
}

// Define the Three.js elements used in the project
interface ThreeElements {
  // Objects
  mesh: any;
  instancedMesh: any;
  group: any;
  object3D: any;
  primitive: any;
  lineSegments: any;

  // Lights
  ambientLight: any;
  pointLight: any;
  spotLight: any;
  directionalLight: any;

  // Geometries
  dodecahedronGeometry: any;
  octahedronGeometry: any;
  planeGeometry: any;
  sphereGeometry: any;
  boxGeometry: any;
  cylinderGeometry: any;
  torusKnotGeometry: any;
  extrudeGeometry: any;
  shapeGeometry: any;
  circleGeometry: any;

  // Materials
  meshStandardMaterial: any;
  meshBasicMaterial: any;
  meshPhysicalMaterial: any;
  meshLambertMaterial: any;
}

// Global augmentation for React Three Fiber elements
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// Augmentation for React module specifically (required for some TS/React setups)
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}