import { CONFIG, COLORS, GIFT_PALETTE } from '../constants';
import { ParticleData, GiftData, GiftType, GiftPattern, BowType } from '../types';
import * as THREE from 'three';

// ... existing generateParticles ...
export const generateParticles = (): ParticleData[] => {
  const particles: ParticleData[] = [];

  for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
    // 1. SCATTER POSITION: Random point inside a sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const r = Math.cbrt(Math.random()) * CONFIG.SCATTER_RADIUS;
    
    const sx = r * Math.sin(phi) * Math.cos(theta);
    const sy = r * Math.sin(phi) * Math.sin(theta);
    const sz = r * Math.cos(phi);

    // 2. TREE POSITION: Uniform Surface Distribution
    const u = Math.random();
    const h = 1 - Math.sqrt(u); // Bias towards bottom

    const coneRadius = CONFIG.TREE_RADIUS_BASE * (1 - h);
    const angle = Math.random() * Math.PI * 2;
    
    const tx = Math.cos(angle) * coneRadius;
    const ty = (h * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2);
    const tz = Math.sin(angle) * coneRadius;

    // 3. ATTRIBUTES (Traditional Palette)
    const rand = Math.random();
    let color;
    
    // Mostly Green (Pine), with hints of snow/gold
    if (rand > 0.95) {
      color = COLORS.GOLD_METALLIC; // 5% Gold sparkles
    } else if (rand > 0.90) {
      color = COLORS.WHITE_SILK; // 5% Snow dusted
    } else {
      color = (Math.random() > 0.4 ? COLORS.EMERALD_DEEP : COLORS.EMERALD_BRIGHT);
    }
    
    const scale = (color === COLORS.GOLD_METALLIC) ? (Math.random() * 0.2 + 0.1) : (Math.random() * 0.15 + 0.05);

    particles.push({
      id: i,
      scatterPosition: [sx, sy, sz],
      treePosition: [tx, ty, tz],
      color,
      scale,
      speed: 0.02 + Math.random() * 0.04
    });
  }

  return particles;
};

// ... existing generateOrnaments ...
export const generateOrnaments = (): ParticleData[] => {
  const particles: ParticleData[] = [];

  for (let i = 0; i < CONFIG.ORNAMENT_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const r = Math.cbrt(Math.random()) * CONFIG.SCATTER_RADIUS * 1.2; 
    
    const sx = r * Math.sin(phi) * Math.cos(theta);
    const sy = r * Math.sin(phi) * Math.sin(theta);
    const sz = r * Math.cos(phi);

    // Position ornaments randomly throughout the volume (inside and out)
    const h = Math.random(); 
    const maxRadius = CONFIG.TREE_RADIUS_BASE * (1 - h);
    // Fill volume
    const relativeRadius = 0.2 + (Math.random() * 0.7); 
    const coneRadius = maxRadius * relativeRadius;
    
    const angle = Math.random() * Math.PI * 2;
    
    const tx = Math.cos(angle) * coneRadius;
    const ty = (h * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2);
    const tz = Math.sin(angle) * coneRadius;

    // Traditional Christmas Mix: Red, Gold, Silver
    const rand = Math.random();
    let color;
    if (rand < 0.33) {
        color = COLORS.RED_METALLIC;
    } else if (rand < 0.66) {
        color = COLORS.GOLD_METALLIC;
    } else {
        color = COLORS.PLATINUM;
    }
    
    const scale = Math.random() * 0.15 + 0.05;

    particles.push({
      id: i + 10000, 
      scatterPosition: [sx, sy, sz],
      treePosition: [tx, ty, tz],
      color,
      scale,
      speed: 0.01 + Math.random() * 0.03 
    });
  }

  return particles;
};

// --- FILLER (SAND) GENERATION ---
export const generateFillerParticles = (): ParticleData[] => {
  const particles: ParticleData[] = [];

  for (let i = 0; i < CONFIG.FILLER_COUNT; i++) {
    // 1. SCATTER
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const r = Math.cbrt(Math.random()) * CONFIG.SCATTER_RADIUS * 0.6;
    
    const sx = r * Math.sin(phi) * Math.cos(theta);
    const sy = r * Math.sin(phi) * Math.sin(theta);
    const sz = r * Math.cos(phi);

    // 2. TREE (VOLUME FILLING)
    const u = Math.random();
    const h = 1 - Math.sqrt(u); // Bias bottom

    const maxRadiusAtH = CONFIG.TREE_RADIUS_BASE * (1 - h);
    
    // Sample Volume: r = R * sqrt(random)
    const v = Math.random();
    const radius = maxRadiusAtH * Math.sqrt(v) * 0.9; // 0.9 to stay slightly inside
    const angle = Math.random() * Math.PI * 2;
    
    const tx = Math.cos(angle) * radius;
    const ty = (h * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2);
    const tz = Math.sin(angle) * radius;

    particles.push({
      id: 30000 + i,
      scatterPosition: [sx, sy, sz],
      treePosition: [tx, ty, tz],
      color: COLORS.EMERALD_DARKEST,
      scale: 0.02 + Math.random() * 0.03, // Tiny sand grains
      speed: 0.01 + Math.random() * 0.02
    });
  }

  return particles;
};

// --- GIFT GENERATION ---
export const generateGifts = (): GiftData[] => {
  const gifts: GiftData[] = [];
  const totalGifts = CONFIG.GIFT_COUNT;
  
  const stackedCount = Math.floor(3 + Math.random() * 2);
  const placedGifts: { x: number, y: number, z: number, r: number }[] = [];

  const GREETINGS_SOURCE = [
    "愿你学业进步，\n生活如诗般美好。",
    "祝你前程似锦，\n在知识的海洋里乘风破浪。",
    "愿你的每一份努力，\n都能开出绚烂的花朵。",
    "祝你成绩步步高升，\n每天都充满自信与光芒。",
    "愿你保持热爱，\n奔赴山海，学业有成。",
    "祝你生活明朗，\n万物可爱，考试顺利。",
    "愿你在求知的路上，\n遇见更好的自己。",
    "祝你智慧与美貌并存，\n生活学习双丰收。",
    "愿你的未来如星辰般璀璨，\n学业生活皆顺意。",
    "祝你每一天都有新收获，\n快乐学习，享受生活。",
    "愿书本为你点亮心灯，\n智慧伴你快乐成长。",
    "祝你所有的梦想，\n都在努力中慢慢实现。",
    "愿你阅尽千帆，\n归来仍是少年，学业更上一层楼。",
    "祝你好运连连，\n在学习中找到属于你的乐趣。",
    "愿你的才华得以施展，\n生活处处充满惊喜。",
    "祝你心想事成，\n在学习的道路上勇往直前。",
    "愿你拥有无限可能，\n每一天都比昨天更优秀。",
    "祝你眼里有光，\n心中有爱，学业顺遂。",
    "愿你的坚持终将闪闪发光，\n生活温暖而美好。",
    "祝你脚踏实地，\n仰望星空，学有所成。"
  ];

  const GREETINGS = [...GREETINGS_SOURCE].sort(() => Math.random() - 0.5);

  for (let i = 0; i < totalGifts; i++) {
    const isStacked = i < stackedCount;

    let tx = 0, ty = 0, tz = 0, treeRotX = 0, treeRotY = 0, treeRotZ = 0;
    let dims: [number, number, number] = [1.0, 1.0, 1.0];
    let type = GiftType.CUBE;
    let validPosition = false;
    let attempts = 0;

    const randType = Math.random();
    if (randType < 0.6) {
      const sizeVariant = Math.random();
      const baseSize = sizeVariant < 0.5 ? 1.0 : (sizeVariant < 0.8 ? 1.4 : 1.8); 
      type = GiftType.CUBE;
      dims = [baseSize, baseSize, baseSize];
    } else if (randType < 0.8) {
      type = GiftType.CYLINDER;
      const radius = 0.6 + Math.random() * 0.3; 
      const height = 1.0 + Math.random() * 1.0; 
      dims = [radius, height, 0];
    } else {
      type = GiftType.STAR;
      const size = 0.8 + Math.random() * 0.6;
      dims = [size, size, 0.4];
    }

    const colRadius = (type === GiftType.CYLINDER ? dims[0] : dims[0]/2) * 1.5;

    while (!validPosition && attempts < 50) {
      attempts++;
      
      if (isStacked) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 3 + Math.random() * 4; 
        tx = Math.cos(angle) * radius;
        ty = (-CONFIG.TREE_HEIGHT / 2) + (dims[1] / 2); 
        tz = Math.sin(angle) * radius;
        
        treeRotX = (Math.random() - 0.5) * 0.2;
        treeRotY = Math.random() * Math.PI * 2;
        treeRotZ = (Math.random() - 0.5) * 0.2;
      } else {
        const u = Math.random();
        const h = (1 - Math.sqrt(u)) * 0.85; 
        
        const coneRadiusAtH = CONFIG.TREE_RADIUS_BASE * (1 - h);
        const angle = Math.random() * Math.PI * 2;
        
        const surfaceOffset = type === GiftType.CUBE ? dims[2]/2 : dims[0];
        const radius = coneRadiusAtH + surfaceOffset * 0.8; 
        
        tx = Math.cos(angle) * radius;
        ty = (h * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2); 
        tz = Math.sin(angle) * radius;

        treeRotX = 0;
        treeRotY = -angle; 
        treeRotZ = 0;
      }

      let collision = false;
      for (const p of placedGifts) {
        const dist = Math.sqrt(Math.pow(tx - p.x, 2) + Math.pow(ty - p.y, 2) + Math.pow(tz - p.z, 2));
        if (dist < (colRadius + p.r)) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        validPosition = true;
        placedGifts.push({ x: tx, y: ty, z: tz, r: colRadius });
      }
    }

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const r = Math.cbrt(Math.random()) * CONFIG.SCATTER_RADIUS * 0.8;
    const sx = r * Math.sin(phi) * Math.cos(theta);
    const sy = r * Math.sin(phi) * Math.sin(theta);
    const sz = r * Math.cos(phi);

    const randColor = Math.random();
    let color = GIFT_PALETTE.RED;
    if (randColor < 0.3) color = GIFT_PALETTE.RED;
    else if (randColor < 0.6) color = GIFT_PALETTE.GREEN;
    else if (randColor < 0.8) color = GIFT_PALETTE.GOLD;
    else color = GIFT_PALETTE.BLUE;

    const randPattern = Math.random();
    let pattern = GiftPattern.SOLID;
    if (randPattern < 0.4) pattern = GiftPattern.STRIPES;
    else if (randPattern < 0.7) pattern = GiftPattern.DOTS;
    else if (randPattern < 0.9) pattern = GiftPattern.SOLID;
    else pattern = GiftPattern.SPECIAL;

    const ribbonColor = (color === GIFT_PALETTE.RED) ? GIFT_PALETTE.GOLD : GIFT_PALETTE.RED;
    
    let bowType = BowType.SINGLE;
    const randBow = Math.random();
    if (randBow < 0.5) bowType = BowType.SINGLE;
    else if (randBow < 0.8) bowType = BowType.DOUBLE;
    else bowType = BowType.COMPLEX;

    const tagText = Math.random() > 0.5 ? "Merry Xmas" : (Math.random() > 0.5 ? "To: You" : "From: Santa");
    
    const cardMessage = GREETINGS[i % GREETINGS.length];

    gifts.push({
      id: 20000 + i,
      scatterPosition: [sx, sy, sz],
      treePosition: [tx, ty, tz],
      rotation: [treeRotX, treeRotY, treeRotZ],
      scale: 1,
      speed: 0.02 + Math.random() * 0.03,
      color,
      type,
      pattern,
      dimensions: dims,
      cardMessage,
      decoration: {
        ribbonColor,
        hasBow: Math.random() < 0.8,
        bowType,
        hasTag: Math.random() < 0.5,
        tagText,
        hasRibbon: Math.random() < 0.6
      }
    });
  }

  return gifts;
};