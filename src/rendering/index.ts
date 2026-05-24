export { Renderer } from './renderer.js';
export { VFXSystem, ScreenShake } from './vfx.js';

// Re-export submodules for direct use
export { drawStage, generateStars } from './stage.js';
export type { Star } from './stage.js';
export { drawSkeletalFighter } from './skeletalFighter.js';
export { drawAttackLimb } from './attackLimb.js';
export { drawHUD, drawPowerGauges, drawComboCounters } from './hud.js';
export { drawCharacterSelect, drawIntro, drawKO, drawSuperFlash } from './screens.js';
export { roundRect, shiftColor, parseColor } from './utils.js';
