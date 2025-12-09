import { Color } from 'three';

export const COLORS = {
  GOLD_METALLIC: '#FFD700', // Bright Gold
  GOLD_WARM: '#FFE5B4', // Peach/Cream Glow
  RED_METALLIC: '#EF4444', // Brighter, more vibrant Red
  EMERALD_DEEP: '#15803D', // Lighter Forest Green (reflects more light)
  EMERALD_BRIGHT: '#22C55E', // Vivid Pine Green
  EMERALD_DARKEST: '#14532D', // Deep Green (but not black)
  BG_DARK: '#172554', // Rich Warm Midnight Blue
  PLATINUM: '#F1F5F9', // Bright Silver
  ROSE_GOLD: '#FDA4AF', // Soft Pink Gold
  BLUE_ROYAL: '#3B82F6', // Brighter Royal Blue
  WHITE_SILK: '#FFFFFF'
};

export const CONFIG = {
  PARTICLE_COUNT: 3500,
  ORNAMENT_COUNT: 1500,
  FILLER_COUNT: 6000, 
  SCATTER_RADIUS: 30, 
  TREE_HEIGHT: 20,
  TREE_RADIUS_BASE: 8,
  ANIMATION_SPEED: 0.04, 
  GIFT_COUNT: 18, 
};

export const SNOW_CONFIG = {
  COUNT: 12000,
  SIZE: 0.3,
  SPEED: 1.5,
  WIND_STRENGTH: 0.3,
  COLOR: '#FFFFFF'
};

export const GIFT_PALETTE = {
  RED: '#DC2626', // Bright Red
  GREEN: '#16A34A', // Bright Green
  GOLD: '#F59E0B', // Golden Amber
  BLUE: '#2563EB', // Bright Blue
  WHITE: '#F9FAFB',
  RIBBON_GOLD: '#FCD34D',
  RIBBON_RED: '#EF4444',
  RIBBON_GREEN: '#22C55E'
};

// Pre-allocate Three.js color objects
export const THREE_COLORS = {
  gold: new Color(COLORS.GOLD_METALLIC),
  red: new Color(COLORS.RED_METALLIC),
  emerald: new Color(COLORS.EMERALD_DEEP),
  emeraldBright: new Color(COLORS.EMERALD_BRIGHT),
  emeraldDarkest: new Color(COLORS.EMERALD_DARKEST),
  platinum: new Color(COLORS.PLATINUM),
  roseGold: new Color(COLORS.ROSE_GOLD)
};