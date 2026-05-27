/**
 * Torso Detail Renderer — Character-specific torso/clothing details
 *
 * Extracted from bodyPartRenderer.ts to keep file under 2000-line budget.
 * Each character's unique clothing, emblems, and accessories are rendered here.
 */
import { shiftColor } from './utils.js';

type Outfit = { shirt: string; pants: string; belt: string; shoes: string };

export function drawTorsoDetail(
  ctx: CanvasRenderingContext2D, charId: string, w: number, h: number,
  outfit: Outfit,
  sw: number, ww: number, hh: number,
  tick: number,
): void {
  const PX = Math.max(2, Math.round(w / 14));
  const breathe = Math.sin(tick / 30) * 0.5;

  if (charId === 'kyo') {
    ctx.fillStyle = '#2a2a3a';
    ctx.beginPath();
    ctx.moveTo(-PX * 2, -hh + PX);
    ctx.lineTo(0, -hh + PX * 4);
    ctx.lineTo(PX * 2, -hh + PX);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1a1a2a';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-PX * 2, -hh + PX); ctx.lineTo(-PX * 2.5, hh * 0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PX * 2, -hh + PX); ctx.lineTo(PX * 2.5, hh * 0.2); ctx.stroke();
    ctx.fillStyle = '#ee5500';
    ctx.beginPath();
    ctx.moveTo(-PX * 1, -hh + PX * 1.5);
    ctx.lineTo(0, -hh + PX * 4);
    ctx.lineTo(PX * 1, -hh + PX * 1.5);
    ctx.closePath();
    ctx.fill();
    const embY = -hh * 0.05 + breathe;
    ctx.fillStyle = '#cc4400';
    ctx.beginPath(); ctx.arc(0, embY, PX * 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff6622';
    ctx.beginPath(); ctx.arc(0, embY, PX * 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffaa44';
    ctx.beginPath(); ctx.arc(0, embY, PX * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ff8833';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + tick * 0.02;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * PX * 1.3, embY + Math.sin(angle) * PX * 1.3);
      ctx.lineTo(Math.cos(angle) * PX * 2.2, embY + Math.sin(angle) * PX * 2.2);
      ctx.stroke();
    }
    ctx.strokeStyle = '#3a3a4a';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-sw * 0.7, -hh + 2); ctx.lineTo(-sw * 0.3, -hh + 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sw * 0.3, -hh + 2); ctx.lineTo(sw * 0.7, -hh + 2); ctx.stroke();

  } else if (charId === 'iori') {
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh + PX);
    ctx.lineTo(0, -hh + PX * 4);
    ctx.lineTo(PX * 1.5, -hh + PX);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ddd8cc';
    ctx.fillRect(-PX * 1.2, -hh + PX * 3, PX * 2.4, h * 0.25);
    const moonY = -hh * 0.2 + breathe;
    ctx.strokeStyle = '#cc1133';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(PX * 0.5, moonY, PX * 2, Math.PI * 0.7, Math.PI * 1.6);
    ctx.stroke();
    ctx.fillStyle = '#aa0022';
    ctx.beginPath();
    ctx.arc(PX * 0.5, moonY, PX * 1.8, Math.PI * 0.75, Math.PI * 1.55);
    ctx.lineTo(PX * 0.5 + Math.cos(Math.PI * 1.55) * PX * 1.2, moonY + Math.sin(Math.PI * 1.55) * PX * 1.2);
    ctx.arc(PX * 0.5, moonY, PX * 1.2, Math.PI * 1.55, Math.PI * 0.75, true);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = shiftColor(outfit.shirt, 12);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -hh + PX * 4); ctx.lineTo(0, hh * 0.5); ctx.stroke();
    ctx.strokeStyle = '#882244';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-PX * 2, -hh + 1); ctx.lineTo(-PX * 2.5, hh * 0.25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PX * 2, -hh + 1); ctx.lineTo(PX * 2.5, hh * 0.25); ctx.stroke();

  } else if (charId === 'terry') {
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(-sw * 0.55, -hh + PX, sw * 1.1, h * 0.4);
    ctx.fillStyle = '#ddd';
    ctx.fillRect(-sw * 0.85, -hh + PX, sw * 0.25, h * 0.45);
    ctx.fillRect(sw * 0.6, -hh + PX, sw * 0.25, h * 0.45);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-PX * 1, -hh + PX * 0.5);
    ctx.quadraticCurveTo(0, -hh + PX * 3, PX * 1, -hh + PX * 0.5);
    ctx.stroke();
    ctx.fillStyle = outfit.shirt;
    ctx.fillRect(-sw * 0.95, -hh + PX, sw * 0.25, h * 0.5);
    ctx.fillRect(sw * 0.7, -hh + PX, sw * 0.25, h * 0.5);
    ctx.strokeStyle = shiftColor(outfit.shirt, 20);
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-sw * 0.55, -hh + PX); ctx.lineTo(-sw * 0.55, hh * 0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sw * 0.55, -hh + PX); ctx.lineTo(sw * 0.55, hh * 0.2); ctx.stroke();
    const starX = -PX * 0.5, starY = -hh * 0.05 + breathe;
    drawStarEmblem(ctx, starX, starY, PX * 0.8, '#ffcc00', '#dd9900');
    ctx.fillStyle = '#aa8833';
    ctx.beginPath(); ctx.arc(-PX * 0.5, -hh * 0.25, PX * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-PX * 0.5, hh * 0.05, PX * 0.35, 0, Math.PI * 2); ctx.fill();

  } else if (charId === 'kim') {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-PX * 2, -hh + PX);
    ctx.lineTo(0, -hh + PX * 6);
    ctx.lineTo(PX * 2, -hh + PX);
    ctx.stroke();
    ctx.fillStyle = shiftColor(outfit.shirt, -5);
    ctx.beginPath();
    ctx.moveTo(-PX * 2, -hh + PX);
    ctx.lineTo(0, -hh + PX * 6);
    ctx.lineTo(-PX * 0.5, hh * 0.35);
    ctx.lineTo(-PX * 2.2, hh * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = shiftColor(outfit.shirt, 5);
    ctx.beginPath();
    ctx.moveTo(PX * 2, -hh + PX);
    ctx.lineTo(0, -hh + PX * 6);
    ctx.lineTo(PX * 0.5, hh * 0.35);
    ctx.lineTo(PX * 2.2, hh * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.fillRect(-ww + 1, hh * 0.55, (ww - 1) * 2, PX * 1.5);
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.moveTo(0, hh * 0.55);
    ctx.lineTo(-PX, hh * 0.55 + PX);
    ctx.lineTo(0, hh * 0.55 + PX * 2);
    ctx.lineTo(PX, hh * 0.55 + PX);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = shiftColor(outfit.shirt, -12);
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-PX * 1.5, -hh + PX * 3); ctx.lineTo(-PX * 2.2, hh * 0.35); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PX * 1.5, -hh + PX * 3); ctx.lineTo(PX * 2.2, hh * 0.35); ctx.stroke();

  } else if (charId === 'ryo') {
    // Ryo: Orange karate gi — full detail rendering
    ctx.strokeStyle = shiftColor(outfit.shirt, -25);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-sw + 2, -hh + 2);
    ctx.lineTo(-sw * 0.5, -hh + PX * 0.5);
    ctx.lineTo(0, -hh + PX);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sw - 2, -hh + 2);
    ctx.lineTo(sw * 0.5, -hh + PX * 0.5);
    ctx.lineTo(0, -hh + PX);
    ctx.stroke();
    ctx.strokeStyle = shiftColor(outfit.shirt, -12);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-sw * 0.9, -hh + PX * 0.8);
    ctx.quadraticCurveTo(-sw * 0.6, -hh + PX * 1.5, -sw * 0.3, -hh + PX * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sw * 0.9, -hh + PX * 0.8);
    ctx.quadraticCurveTo(sw * 0.6, -hh + PX * 1.5, sw * 0.3, -hh + PX * 2);
    ctx.stroke();
    ctx.strokeStyle = shiftColor(outfit.shirt, -30);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-PX * 2.5, -hh + PX);
    ctx.lineTo(0, -hh + PX * 6);
    ctx.lineTo(PX * 2.5, -hh + PX);
    ctx.stroke();
    ctx.fillStyle = shiftColor(outfit.shirt, -38);
    ctx.beginPath();
    ctx.moveTo(-PX * 1.8, -hh + PX * 1.2);
    ctx.lineTo(0, -hh + PX * 5.8);
    ctx.lineTo(PX * 1.8, -hh + PX * 1.2);
    ctx.closePath();
    ctx.fill();
    const chestSkin = '#d4a07a';
    ctx.fillStyle = chestSkin;
    ctx.beginPath();
    ctx.moveTo(-PX * 1.2, -hh + PX * 1.8);
    ctx.lineTo(0, -hh + PX * 5.2);
    ctx.lineTo(PX * 1.2, -hh + PX * 1.8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = shiftColor(chestSkin, -15);
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, -hh + PX * 3);
    ctx.lineTo(0, -hh + PX * 5);
    ctx.stroke();
    ctx.strokeStyle = shiftColor(chestSkin, -10);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-PX * 1.0, -hh + PX * 2);
    ctx.quadraticCurveTo(-PX * 0.3, -hh + PX * 1.6, 0, -hh + PX * 2.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(PX * 1.0, -hh + PX * 2);
    ctx.quadraticCurveTo(PX * 0.3, -hh + PX * 1.6, 0, -hh + PX * 2.2);
    ctx.stroke();
    ctx.fillStyle = shiftColor(outfit.shirt, -8);
    ctx.beginPath();
    ctx.moveTo(-PX * 2.5, -hh + PX);
    ctx.lineTo(-PX * 0.3, -hh + PX * 6);
    ctx.lineTo(-PX * 0.8, hh * 0.4);
    ctx.lineTo(-PX * 2.5, hh * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = shiftColor(outfit.shirt, 15);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-PX * 2.3, -hh + PX * 1.2);
    ctx.lineTo(-PX * 0.4, -hh + PX * 5.8);
    ctx.stroke();
    ctx.fillStyle = shiftColor(outfit.shirt, 5);
    ctx.beginPath();
    ctx.moveTo(PX * 2.5, -hh + PX);
    ctx.lineTo(PX * 0.3, -hh + PX * 6);
    ctx.lineTo(PX * 0.8, hh * 0.4);
    ctx.lineTo(PX * 2.5, hh * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = shiftColor(outfit.shirt, 18);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(PX * 2.3, -hh + PX * 1.2);
    ctx.lineTo(PX * 0.4, -hh + PX * 5.8);
    ctx.stroke();
    ctx.strokeStyle = shiftColor(outfit.shirt, -10);
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-PX * 2.0, -hh + PX * 2.5);
    ctx.quadraticCurveTo(-PX * 1.2, hh * 0.1, -PX * 1.5, hh * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-sw * 0.5, -hh + PX * 2);
    ctx.quadraticCurveTo(-PX * 2.0, hh * 0.0, -PX * 2.2, hh * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(PX * 2.0, -hh + PX * 2.5);
    ctx.quadraticCurveTo(PX * 1.2, hh * 0.1, PX * 1.5, hh * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sw * 0.5, -hh + PX * 2);
    ctx.quadraticCurveTo(PX * 2.0, hh * 0.0, PX * 2.2, hh * 0.3);
    ctx.stroke();
    ctx.strokeStyle = shiftColor(outfit.shirt, -15);
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-PX * 1.5, -hh + PX * 2); ctx.lineTo(PX * 1.5, hh * 0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PX * 1.5, -hh + PX * 2); ctx.lineTo(-PX * 1.5, hh * 0.2); ctx.stroke();
    const beltY = hh * 0.48;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-ww + 1, beltY, (ww - 1) * 2, PX * 1.5);
    ctx.fillStyle = '#333';
    ctx.fillRect(-ww + 2, beltY, (ww - 2) * 2, PX * 0.4);
    ctx.fillStyle = '#111';
    ctx.fillRect(-ww + 1, beltY + PX * 1.1, (ww - 1) * 2, PX * 0.4);
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(0, beltY + PX * 0.2);
    ctx.lineTo(-PX * 0.9, beltY + PX);
    ctx.lineTo(0, beltY + PX * 1.8);
    ctx.lineTo(PX * 0.9, beltY + PX);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(0, beltY + PX, PX * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#181818';
    ctx.beginPath();
    ctx.moveTo(-PX * 0.15, beltY + PX * 1.7);
    ctx.quadraticCurveTo(-PX * 0.3, beltY + PX * 2.8, -PX * 0.2, beltY + PX * 3.5);
    ctx.lineTo(-PX * 0.05, beltY + PX * 3.5);
    ctx.quadraticCurveTo(-PX * 0.15, beltY + PX * 2.6, PX * 0.05, beltY + PX * 1.7);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(PX * 0.15, beltY + PX * 1.7);
    ctx.quadraticCurveTo(PX * 0.25, beltY + PX * 2.6, PX * 0.15, beltY + PX * 3.2);
    ctx.lineTo(PX * 0.03, beltY + PX * 3.2);
    ctx.quadraticCurveTo(PX * 0.1, beltY + PX * 2.4, -PX * 0.05, beltY + PX * 1.7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = shiftColor(outfit.shirt, -20);
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-sw * 0.8, -hh + 1);
    ctx.lineTo(-sw * 0.75, -hh + PX);
    ctx.lineTo(-sw * 0.7, -hh + 1);
    ctx.stroke();
    ctx.fillStyle = shiftColor(outfit.shirt, -5);
    ctx.beginPath();
    ctx.ellipse(-PX * 1.0, hh * 0.15, PX * 0.6, PX * 0.3, 0.2, 0, Math.PI * 2);
    ctx.fill();

  } else if (charId === 'leona') {
    ctx.strokeStyle = shiftColor(outfit.shirt, -20);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-sw * 0.5, -hh + 1);
    ctx.lineTo(-sw * 0.35, -hh - PX * 1);
    ctx.lineTo(sw * 0.35, -hh - PX * 1);
    ctx.lineTo(sw * 0.5, -hh + 1);
    ctx.stroke();
    ctx.fillStyle = shiftColor(outfit.shirt, 10);
    ctx.fill();
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -hh + PX); ctx.lineTo(0, hh * 0.6); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const yy = -hh + PX * 2 + i * PX * 1.2;
      ctx.fillStyle = '#999';
      ctx.fillRect(-1, yy, 2, 1);
    }
    ctx.strokeStyle = shiftColor(outfit.shirt, -15);
    ctx.lineWidth = 1;
    ctx.strokeRect(sw * 0.1, -hh * 0.3, PX * 2.5, PX * 2);
    ctx.fillStyle = shiftColor(outfit.shirt, -8);
    ctx.fillRect(sw * 0.1, -hh * 0.3, PX * 2.5, PX * 0.5);
    ctx.fillStyle = '#ccaa33';
    ctx.beginPath(); ctx.arc(-sw * 0.25, -hh * 0.2, PX * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#aa8822';
    ctx.beginPath(); ctx.arc(-sw * 0.25, -hh * 0.2, PX * 0.25, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = shiftColor(outfit.shirt, -10);
    ctx.fillRect(-sw * 0.8, -hh + 1, sw * 0.25, PX * 0.6);
    ctx.fillRect(sw * 0.55, -hh + 1, sw * 0.25, PX * 0.6);

  } else if (charId === 'kdash') {
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, -hh + PX); ctx.lineTo(0, hh * 0.6); ctx.stroke();
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(PX * 0.5, -hh + PX * 1.5);
    ctx.quadraticCurveTo(PX * 1.5, -hh * 0.2, PX * 0.3, hh * 0.3);
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const t = (i + 0.5) / 4;
      const cx = PX * 0.5 * (1 - t) + PX * 0.3 * t + Math.sin(t * Math.PI) * PX;
      const cy = (-hh + PX * 1.5) * (1 - t) + hh * 0.3 * t;
      ctx.fillStyle = '#ccc';
      ctx.beginPath(); ctx.arc(cx, cy, PX * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = shiftColor(outfit.shirt, 10);
    ctx.beginPath();
    ctx.moveTo(-PX * 1, -hh);
    ctx.lineTo(-PX * 0.3, -hh + PX * 4);
    ctx.lineTo(-sw * 0.5, -hh + PX);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(PX * 1, -hh);
    ctx.lineTo(PX * 0.3, -hh + PX * 4);
    ctx.lineTo(sw * 0.5, -hh + PX);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = shiftColor(outfit.shirt, 15);
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-sw * 0.6, hh * 0.1); ctx.lineTo(-sw * 0.3, hh * 0.1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sw * 0.3, hh * 0.1); ctx.lineTo(sw * 0.6, hh * 0.1); ctx.stroke();

  } else if (charId === 'kula') {
    ctx.fillStyle = '#eef4ff';
    ctx.beginPath();
    ctx.moveTo(-PX * 2, -hh + PX);
    ctx.quadraticCurveTo(-PX * 2.2, -hh - PX * 0.5, -PX * 0.5, -hh - PX * 0.3);
    ctx.quadraticCurveTo(0, -hh - PX * 0.8, PX * 0.5, -hh - PX * 0.3);
    ctx.quadraticCurveTo(PX * 2.2, -hh - PX * 0.5, PX * 2, -hh + PX);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ddeeff';
    for (let i = 0; i < 5; i++) {
      const fx = -PX * 1.5 + i * PX * 0.75;
      ctx.beginPath(); ctx.arc(fx, -hh + PX * 0.3, PX * 0.25, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#88ccff';
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh + PX);
    ctx.lineTo(0, -hh + PX * 4);
    ctx.lineTo(PX * 1.5, -hh + PX);
    ctx.closePath();
    ctx.fill();
    const cryY = -hh * 0.2 + breathe;
    ctx.strokeStyle = '#aaeeff';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * PX * 1.5, cryY + Math.sin(angle) * PX * 1.5);
      ctx.lineTo(-Math.cos(angle) * PX * 1.5, cryY - Math.sin(angle) * PX * 1.5);
      ctx.stroke();
    }
    ctx.fillStyle = '#ccf0ff';
    ctx.beginPath(); ctx.arc(0, cryY, PX * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = shiftColor(outfit.shirt, 15);
    ctx.lineWidth = 0.6;
    for (let i = 0; i < 3; i++) {
      const yy = hh * 0.15 + i * PX;
      ctx.beginPath();
      ctx.moveTo(-ww + 3, yy);
      ctx.lineTo(ww - 3, yy);
      ctx.stroke();
    }
    ctx.fillStyle = '#66aaee';
    ctx.beginPath();
    ctx.moveTo(0, hh * 0.5);
    ctx.lineTo(-PX, hh * 0.5 - PX * 0.5);
    ctx.lineTo(0, hh * 0.5 + PX * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, hh * 0.5);
    ctx.lineTo(PX, hh * 0.5 - PX * 0.5);
    ctx.lineTo(0, hh * 0.5 + PX * 0.3);
    ctx.closePath();
    ctx.fill();

  } else if (charId === 'robert') {
    ctx.strokeStyle = shiftColor(outfit.shirt, -25);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-PX * 2.5, -hh + PX);
    ctx.lineTo(0, -hh + PX * 5);
    ctx.lineTo(PX * 2.5, -hh + PX);
    ctx.stroke();
    ctx.fillStyle = shiftColor(outfit.shirt, 8);
    ctx.beginPath();
    ctx.moveTo(-PX * 2, -hh + PX);
    ctx.lineTo(PX * 0.5, -hh + PX * 5);
    ctx.lineTo(-PX * 0.3, hh * 0.3);
    ctx.lineTo(-PX * 2, hh * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#884422';
    ctx.fillRect(-PX * 2, hh * 0.45, PX * 4, PX);
    ctx.strokeStyle = shiftColor(outfit.shirt, -12);
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-PX * 1.5, -hh + PX * 3); ctx.lineTo(-PX * 2, hh * 0.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PX * 1.5, -hh + PX * 3); ctx.lineTo(PX * 2, hh * 0.4); ctx.stroke();

  } else if (charId === 'athena') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-sw * 0.55, -hh + PX);
    ctx.lineTo(-sw * 0.85, -hh - PX);
    ctx.lineTo(-sw * 0.15, -hh + PX * 3);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sw * 0.55, -hh + PX);
    ctx.lineTo(sw * 0.85, -hh - PX);
    ctx.lineTo(sw * 0.15, -hh + PX * 3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = shiftColor(outfit.shirt, -10);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-sw * 0.5, -hh + PX); ctx.lineTo(0, -hh + PX * 3); ctx.lineTo(sw * 0.5, -hh + PX); ctx.stroke();
    ctx.fillStyle = '#cc2222';
    ctx.beginPath();
    ctx.moveTo(0, -hh + PX * 1.5);
    ctx.lineTo(-PX * 2, -hh + PX * 0.5);
    ctx.quadraticCurveTo(-PX * 1.5, -hh + PX * 1.5, 0, -hh + PX * 2.2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -hh + PX * 1.5);
    ctx.lineTo(PX * 2, -hh + PX * 0.5);
    ctx.quadraticCurveTo(PX * 1.5, -hh + PX * 1.5, 0, -hh + PX * 2.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#aa1111';
    ctx.beginPath(); ctx.arc(0, -hh + PX * 1.5, PX * 0.5, 0, Math.PI * 2); ctx.fill();

  } else if (charId === 'mai') {
    ctx.fillStyle = shiftColor(outfit.shirt, 20);
    ctx.beginPath();
    ctx.moveTo(-PX * 0.8, -hh + PX);
    ctx.lineTo(0, -hh + PX * 5);
    ctx.lineTo(PX * 0.8, -hh + PX);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ff88aa';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-PX * 2, -hh + PX * 1.5);
    ctx.quadraticCurveTo(-PX * 0.5, -hh + PX * 4, 0, -hh + PX * 5);
    ctx.quadraticCurveTo(PX * 0.5, -hh + PX * 4, PX * 2, -hh + PX * 1.5);
    ctx.stroke();
    ctx.strokeStyle = '#ffcc44';
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      const sway = Math.sin(tick / 20 + i) * PX * 0.3;
      ctx.beginPath();
      ctx.moveTo(i * PX * 0.6, -hh + PX * 5);
      ctx.quadraticCurveTo(i * PX * 0.6 + sway, -hh + PX * 7, i * PX * 0.4 + sway, -hh + PX * 9);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffcc44';
    ctx.beginPath(); ctx.arc(0, -hh + PX * 5, PX * 0.6, 0, Math.PI * 2); ctx.fill();

  } else if (charId === 'clark') {
    ctx.strokeStyle = shiftColor(outfit.shirt, -20);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-sw * 0.35, -hh + 1); ctx.lineTo(-sw * 0.25, hh * 0.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sw * 0.35, -hh + 1); ctx.lineTo(sw * 0.25, hh * 0.4); ctx.stroke();
    ctx.strokeStyle = shiftColor(outfit.shirt, 15);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh + PX);
    ctx.quadraticCurveTo(0, -hh + PX * 4, PX * 1.5, -hh + PX);
    ctx.stroke();
    ctx.strokeStyle = '#aa8833';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-PX * 0.8, -hh + PX * 1.5);
    ctx.quadraticCurveTo(0, -hh * 0.15, PX * 0.8, -hh + PX * 1.5);
    ctx.stroke();
    ctx.fillStyle = '#cc9933';
    ctx.beginPath(); ctx.arc(-PX * 0.3, -hh * 0.05, PX * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#aa7722';
    ctx.beginPath(); ctx.arc(PX * 0.4, -hh * 0.05 + PX * 0.4, PX * 0.4, 0, Math.PI * 2); ctx.fill();

  } else if (charId === 'ralf') {
    ctx.fillStyle = shiftColor(outfit.shirt, 25);
    ctx.fillRect(-sw * 0.35, -hh + PX, sw * 0.7, h * 0.35);
    ctx.fillStyle = shiftColor(outfit.shirt, -8);
    ctx.fillRect(-sw * 0.9, -hh + PX, sw * 0.35, h * 0.5);
    ctx.fillRect(sw * 0.55, -hh + PX, sw * 0.35, h * 0.5);
    ctx.strokeStyle = shiftColor(outfit.shirt, -18);
    ctx.lineWidth = 1;
    ctx.strokeRect(-sw * 0.75, -hh * 0.1, PX * 2.8, PX * 2.2);
    ctx.strokeRect(sw * 0.15, -hh * 0.1, PX * 2.8, PX * 2.2);
    ctx.fillStyle = shiftColor(outfit.shirt, -12);
    ctx.fillRect(-sw * 0.75, -hh * 0.1, PX * 2.8, PX * 0.5);
    ctx.fillRect(sw * 0.15, -hh * 0.1, PX * 2.8, PX * 0.5);
    ctx.strokeStyle = shiftColor(outfit.shirt, -25);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh + PX); ctx.lineTo(0, -hh + PX * 4); ctx.lineTo(PX * 1.5, -hh + PX);
    ctx.stroke();

  } else if (charId === 'joe') {
    ctx.fillStyle = shiftColor(outfit.shirt, 15);
    ctx.beginPath();
    ctx.moveTo(-PX, -hh + PX); ctx.lineTo(-sw * 0.75, -hh + PX);
    ctx.lineTo(-sw * 0.55, hh * 0.3); ctx.lineTo(-PX * 0.3, -hh + PX * 5);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(PX, -hh + PX); ctx.lineTo(sw * 0.75, -hh + PX);
    ctx.lineTo(sw * 0.55, hh * 0.3); ctx.lineTo(PX * 0.3, -hh + PX * 5);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-PX * 0.6, -hh + PX * 2); ctx.lineTo(PX * 0.6, -hh + PX * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-PX * 0.3, -hh + PX * 4); ctx.lineTo(PX * 0.3, -hh + PX * 4); ctx.stroke();
    ctx.strokeStyle = shiftColor(outfit.shirt, -25);
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-PX, -hh + PX); ctx.lineTo(0, -hh + PX * 6); ctx.lineTo(PX, -hh + PX); ctx.stroke();

  } else if (charId === 'andy') {
    ctx.fillStyle = shiftColor(outfit.shirt, 10);
    ctx.beginPath();
    ctx.moveTo(-sw * 0.65, -hh + PX);
    ctx.lineTo(PX * 0.5, -hh + PX * 6);
    ctx.lineTo(sw * 0.45, -hh + PX);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-PX * 2, -hh + PX); ctx.lineTo(PX * 2, hh * 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PX * 2, -hh + PX); ctx.lineTo(-PX * 2, hh * 0.3); ctx.stroke();
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(-PX * 2.5, hh * 0.5, PX * 5, PX);

  } else if (charId === 'billy') {
    ctx.strokeStyle = shiftColor(outfit.shirt, -20);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-PX * 1.2, -hh + PX);
    ctx.quadraticCurveTo(0, -hh + PX * 3, PX * 1.2, -hh + PX);
    ctx.stroke();
    ctx.strokeStyle = '#664422';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-sw * 0.4, -hh + 1); ctx.lineTo(-sw * 0.3, hh * 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sw * 0.4, -hh + 1); ctx.lineTo(sw * 0.3, hh * 0.3); ctx.stroke();
    ctx.fillStyle = '#ccaa44';
    ctx.beginPath(); ctx.arc(-sw * 0.35, -hh * 0.15, PX * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(sw * 0.35, -hh * 0.15, PX * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ddd';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(0, -hh * 0.1 + i * PX * 2, PX * 0.35, 0, Math.PI * 2); ctx.fill();
    }

  } else if (charId === 'chang') {
    ctx.fillStyle = shiftColor(outfit.shirt, -20);
    for (let i = 0; i < 5; i++) {
      const stripeY = -hh + PX * 2 + i * PX * 2;
      ctx.fillRect(-sw + 2, stripeY, (sw - 2) * 2, PX * 0.8);
    }
    ctx.strokeStyle = shiftColor(outfit.shirt, -30);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-PX * 2, -hh + PX); ctx.lineTo(0, -hh + PX * 4); ctx.lineTo(PX * 2, -hh + PX); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fillRect(-PX * 1.5, -hh * 0.3, PX * 3, PX * 1.5);
    ctx.fillStyle = '#333';
    ctx.fillRect(-PX * 1.2, -hh * 0.25, PX * 2.4, PX * 1);

  } else if (charId === 'choi') {
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, -hh + PX); ctx.lineTo(0, hh * 0.5); ctx.stroke();
    ctx.fillStyle = '#ddd';
    ctx.fillRect(-PX * 0.4, -hh + PX, PX * 0.8, PX * 0.8);
    ctx.strokeStyle = shiftColor(outfit.shirt, -20);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-PX * 1, -hh + PX * 0.5);
    ctx.quadraticCurveTo(0, -hh + PX * 2.5, PX * 1, -hh + PX * 0.5);
    ctx.stroke();

  } else if (charId === 'mature') {
    ctx.fillStyle = '#ddbbaa';
    ctx.beginPath();
    ctx.moveTo(-sw * 0.65, -hh + PX);
    ctx.quadraticCurveTo(-sw * 0.85, -hh - PX, -sw * 0.3, -hh - PX * 0.8);
    ctx.quadraticCurveTo(0, -hh - PX * 1.5, sw * 0.3, -hh - PX * 0.8);
    ctx.quadraticCurveTo(sw * 0.85, -hh - PX, sw * 0.65, -hh + PX);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ccaa99';
    for (let i = 0; i < 6; i++) {
      const fx = -sw * 0.5 + i * sw * 0.2;
      ctx.beginPath(); ctx.arc(fx, -hh + PX * 0.2, PX * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = shiftColor(outfit.shirt, 20);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh + PX * 1.5);
    ctx.quadraticCurveTo(0, -hh + PX * 6, PX * 1.5, -hh + PX * 1.5);
    ctx.stroke();
    ctx.fillStyle = '#cc88cc';
    ctx.beginPath(); ctx.arc(-PX * 0.5, -hh + PX * 2, PX * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#dd99dd';
    ctx.beginPath(); ctx.arc(-PX * 0.5, -hh + PX * 2, PX * 0.3, 0, Math.PI * 2); ctx.fill();

  } else if (charId === 'yashiro') {
    const skinColor = '#d4a87a';
    ctx.fillStyle = skinColor;
    ctx.fillRect(-sw * 0.35, -hh + PX * 2, sw * 0.7, h * 0.4);
    ctx.strokeStyle = shiftColor(skinColor, -12);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-sw * 0.1, -hh + PX * 3);
    ctx.quadraticCurveTo(-sw * 0.15, hh * 0.05, -sw * 0.1, hh * 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sw * 0.1, -hh + PX * 3);
    ctx.quadraticCurveTo(sw * 0.15, hh * 0.05, sw * 0.1, hh * 0.15);
    ctx.stroke();
    ctx.strokeStyle = shiftColor(skinColor, -8);
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(0, -hh + PX * 4); ctx.lineTo(0, hh * 0.1); ctx.stroke();
    ctx.fillStyle = shiftColor(outfit.shirt, -5);
    ctx.fillRect(-sw * 0.95, -hh + PX, sw * 0.35, h * 0.55);
    ctx.fillRect(sw * 0.6, -hh + PX, sw * 0.35, h * 0.55);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-PX * 1.8, -hh + PX * 2);
    ctx.quadraticCurveTo(0, -hh + PX * 5, PX * 1.8, -hh + PX * 2);
    ctx.stroke();
    ctx.fillStyle = '#ddd';
    ctx.beginPath(); ctx.arc(0, -hh + PX * 4, PX * 0.5, 0, Math.PI * 2); ctx.fill();

  } else if (charId === 'chris') {
    ctx.fillStyle = shiftColor(outfit.shirt, 15);
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh + PX);
    ctx.lineTo(-PX * 0.5, -hh - PX * 0.5);
    ctx.lineTo(0, -hh + PX * 1.5);
    ctx.lineTo(PX * 0.5, -hh - PX * 0.5);
    ctx.lineTo(PX * 1.5, -hh + PX);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = shiftColor(outfit.shirt, -20);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-PX * 0.5, -hh + PX); ctx.lineTo(0, -hh + PX * 4); ctx.lineTo(PX * 0.5, -hh + PX); ctx.stroke();
    drawStarEmblem(ctx, sw * 0.35, -hh * 0.2, PX * 0.9, '#ffcc00', '#ff8800');
    ctx.fillStyle = shiftColor(outfit.shirt, -15);
    ctx.beginPath(); ctx.arc(0, -hh * 0.05, PX * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, hh * 0.15, PX * 0.35, 0, Math.PI * 2); ctx.fill();

  } else if (charId === 'shermie') {
    ctx.fillStyle = shiftColor(outfit.shirt, 20);
    ctx.fillRect(-sw * 0.65, -hh + PX, sw * 1.3, h * 0.28);
    ctx.fillStyle = shiftColor(outfit.shirt, -10);
    ctx.fillRect(-sw * 0.75, -hh + h * 0.3, sw * 1.5, h * 0.22);
    ctx.strokeStyle = shiftColor(outfit.shirt, 30);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-sw * 0.65, -hh + h * 0.3); ctx.lineTo(sw * 0.65, -hh + h * 0.3); ctx.stroke();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(sw * 0.3, -hh + PX * 2); ctx.lineTo(-PX * 0.5, hh * 0.4); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const t = i / 6;
      const zx = sw * 0.3 * (1 - t) - PX * 0.5 * t;
      const zy = -hh + PX * 2 + t * (hh * 0.4 - (-hh + PX * 2));
      ctx.fillStyle = '#ccc';
      ctx.fillRect(zx - PX * 0.2, zy, PX * 0.4, 1);
    }
    ctx.fillStyle = shiftColor(outfit.shirt, 10);
    ctx.beginPath();
    ctx.moveTo(-PX * 1.2, -hh);
    ctx.lineTo(-PX * 1.5, -hh - PX * 0.8);
    ctx.quadraticCurveTo(0, -hh - PX * 1.3, PX * 1.5, -hh - PX * 0.8);
    ctx.lineTo(PX * 1.2, -hh);
    ctx.closePath(); ctx.fill();

  } else if (charId === 'vice') {
    ctx.fillStyle = shiftColor(outfit.shirt, -15);
    ctx.beginPath();
    ctx.moveTo(-PX * 1.8, -hh);
    ctx.lineTo(-PX * 2.2, -hh - PX * 1.2);
    ctx.quadraticCurveTo(0, -hh - PX * 2, PX * 2.2, -hh - PX * 1.2);
    ctx.lineTo(PX * 1.8, -hh);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = shiftColor(outfit.shirt, 25);
    ctx.fillRect(-PX, -hh + PX * 2, PX * 2, h * 0.3);
    ctx.fillStyle = shiftColor(outfit.shirt, -8);
    ctx.beginPath();
    ctx.moveTo(-PX * 1.8, -hh); ctx.lineTo(-PX * 0.5, -hh + PX * 5); ctx.lineTo(-PX * 0.3, -hh + PX); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(PX * 1.8, -hh); ctx.lineTo(PX * 0.5, -hh + PX * 5); ctx.lineTo(PX * 0.3, -hh + PX); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#667';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -hh + PX * 3); ctx.lineTo(0, hh * 0.5); ctx.stroke();

  } else if (charId === 'yamazaki') {
    ctx.fillStyle = '#e8e0d0';
    ctx.fillRect(-sw * 0.35, -hh + PX * 2, sw * 0.7, h * 0.4);
    ctx.fillStyle = shiftColor(outfit.shirt, -5);
    ctx.fillRect(-sw * 0.95, -hh + PX, sw * 0.4, h * 0.55);
    ctx.fillRect(sw * 0.55, -hh + PX, sw * 0.4, h * 0.55);
    ctx.fillStyle = shiftColor(outfit.shirt, 8);
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh); ctx.lineTo(-PX * 0.3, -hh + PX * 5); ctx.lineTo(-sw * 0.45, -hh + PX); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(PX * 1.5, -hh); ctx.lineTo(PX * 0.3, -hh + PX * 5); ctx.lineTo(sw * 0.45, -hh + PX); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#882222';
    ctx.beginPath();
    ctx.moveTo(0, -hh + PX * 2);
    ctx.lineTo(-PX * 0.6, -hh + PX * 4);
    ctx.lineTo(0, hh * 0.4);
    ctx.lineTo(PX * 0.6, -hh + PX * 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ddd';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(0, -hh * 0.1 + i * PX * 2, PX * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#cc2222';
    ctx.fillRect(sw * 0.45, -hh * 0.2, PX * 1.8, PX * 1.4);

  } else if (charId === 'mary') {
    ctx.fillStyle = shiftColor(outfit.shirt, 10);
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh); ctx.lineTo(-PX * 0.3, -hh + PX * 5); ctx.lineTo(-sw * 0.55, -hh + PX); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(PX * 1.5, -hh); ctx.lineTo(PX * 0.3, -hh + PX * 5); ctx.lineTo(sw * 0.55, -hh + PX); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(-sw * 0.3, -hh + PX * 2, sw * 0.6, h * 0.25);
    ctx.strokeStyle = '#ffcc44';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-sw * 0.7, -hh + PX * 2); ctx.lineTo(-sw * 0.65, hh * 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sw * 0.7, -hh + PX * 2); ctx.lineTo(sw * 0.65, hh * 0.3); ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const dy = -hh + PX * 3 + i * PX * 1.5;
      ctx.fillStyle = '#ffcc44';
      ctx.fillRect(-sw * 0.68, dy, 2, 2);
      ctx.fillRect(sw * 0.66, dy, 2, 2);
    }
    ctx.fillStyle = '#ccaa44';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(-sw * 0.25, -hh * 0.05 + i * PX * 2, PX * 0.4, 0, Math.PI * 2); ctx.fill();
    }

  } else if (charId === 'kasumi') {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(-sw * 0.75, -hh + PX);
    ctx.lineTo(PX * 0.8, -hh + PX * 6);
    ctx.lineTo(-PX * 0.3, hh * 0.3);
    ctx.lineTo(-sw * 0.55, hh * 0.2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = shiftColor('#fff', -5);
    ctx.beginPath();
    ctx.moveTo(sw * 0.75, -hh + PX);
    ctx.lineTo(-PX * 0.3, -hh + PX * 6);
    ctx.lineTo(PX * 0.3, hh * 0.3);
    ctx.lineTo(sw * 0.55, hh * 0.2);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-PX * 1.5, -hh + PX); ctx.lineTo(0, -hh + PX * 6); ctx.lineTo(PX * 1.5, -hh + PX); ctx.stroke();
    ctx.fillStyle = '#dd4466';
    ctx.fillRect(-PX * 2.5, hh * 0.45, PX * 5, PX);
    ctx.beginPath(); ctx.arc(PX * 0.3, -hh + PX * 5, PX * 0.4, 0, Math.PI * 2); ctx.fill();

  } else if (charId === 'xiangfei') {
    ctx.fillStyle = shiftColor(outfit.shirt, 15);
    ctx.beginPath();
    ctx.moveTo(-PX * 1.2, -hh);
    ctx.lineTo(-PX * 1.5, -hh - PX);
    ctx.lineTo(-PX * 0.3, -hh - PX * 0.4);
    ctx.lineTo(PX * 0.3, -hh - PX * 0.4);
    ctx.lineTo(PX * 1.5, -hh - PX);
    ctx.lineTo(PX * 1.2, -hh);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = shiftColor(outfit.shirt, 10);
    ctx.beginPath();
    ctx.moveTo(-PX, -hh + PX);
    ctx.lineTo(sw * 0.35, -hh + PX * 2);
    ctx.lineTo(sw * 0.25, hh * 0.5);
    ctx.lineTo(-PX * 0.5, hh * 0.4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ffcc44';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const by = -hh + PX * 2.5 + i * PX * 2;
      const bx = -PX * 0.2 + i * PX * 0.5;
      ctx.beginPath(); ctx.arc(bx, by, PX * 0.45, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + PX * 0.45, by); ctx.lineTo(bx + PX * 1.2, by); ctx.stroke();
    }
    ctx.strokeStyle = '#ffcc44';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-PX, -hh + PX); ctx.lineTo(-PX * 0.3, hh * 0.4); ctx.stroke();
  }
}

export function drawStarEmblem(
  ctx: CanvasRenderingContext2D, cx: number, cy: number,
  size: number, fillColor: string, strokeColor: string,
): void {
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + Math.cos(angle) * size;
    const y = cy + Math.sin(angle) * size;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 0.8;
  ctx.stroke();
}
