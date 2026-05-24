/** AI combo route data and character-specific special routing.
 *  Extracted from simpleAI.ts to keep under 600-line limit. */
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CharacterDefinition } from '../characters/types.js';
import { AttackType } from '../core/types.js';

export interface ComboStep {
  type: 'button' | 'special';
  attack: string;
  delay: number;
}

export const COMBO_ROUTES: Record<string, ComboStep[]> = {
  kyo: [
    { type: 'button',  attack: 'closeC',     delay: 0 },
    { type: 'button',  attack: 'cmdGofuYou', delay: 3 },
    { type: 'special', attack: 'aragami',     delay: 3 },
    { type: 'special', attack: 'aragamiFollow', delay: 3 },
    { type: 'special', attack: 'aragamiEnder',  delay: 3 },
    { type: 'special', attack: 'dmOrochinagi',  delay: 4 },
  ],
  iori: [
    { type: 'button',  attack: 'closeC',     delay: 0 },
    { type: 'button',  attack: 'ioriYumeyumi', delay: 2 },
    { type: 'special', attack: 'aoihana1',  delay: 3 },
    { type: 'special', attack: 'aoihana2',  delay: 3 },
    { type: 'special', attack: 'aoihana3',  delay: 3 },
    { type: 'special', attack: 'dmYatagarasu', delay: 4 },
  ],
  terry: [
    { type: 'button',  attack: 'closeC',      delay: 0 },
    { type: 'button',  attack: 'terryBackKnuckle', delay: 2 },
    { type: 'special', attack: 'burnKnuckle',  delay: 3 },
    { type: 'special', attack: 'dmPowerGeyser', delay: 4 },
  ],
  kim: [
    { type: 'button',  attack: 'closeC',  delay: 0 },
    { type: 'button',  attack: 'kimHishouKick', delay: 2 },
    { type: 'special', attack: 'hiensen',  delay: 3 },
    { type: 'special', attack: 'dmPhoenixKick', delay: 4 },
  ],
  ryo: [
    { type: 'button',  attack: 'closeC',     delay: 0 },
    { type: 'button',  attack: 'ryoTsurizao', delay: 2 },
    { type: 'special', attack: 'specialUpper', delay: 3 },
    { type: 'special', attack: 'dmTenHaOu',   delay: 4 },
  ],
  kdash: [
    { type: 'button',  attack: 'closeC',      delay: 0 },
    { type: 'button',  attack: 'kdashOneInch', delay: 2 },
    { type: 'special', attack: 'specialUpper',  delay: 3 },
    { type: 'special', attack: 'dmChainShot',   delay: 4 },
  ],
  kula: [
    { type: 'button',  attack: 'closeC',     delay: 0 },
    { type: 'button',  attack: 'kulaOneMore', delay: 2 },
    { type: 'special', attack: 'specialUpper', delay: 3 },
    { type: 'special', attack: 'dmFreeze',    delay: 4 },
  ],
  leona: [
    { type: 'button',  attack: 'closeC',     delay: 0 },
    { type: 'button',  attack: 'leonaStrikeArc', delay: 2 },
    { type: 'special', attack: 'specialUpper', delay: 3 },
    { type: 'special', attack: 'dmVSlasher',  delay: 4 },
  ],
  _default: [
    { type: 'button',  attack: 'closeC', delay: 0 },
    { type: 'button',  attack: 'standA',  delay: 2 },
    { type: 'special', attack: 'specialUpper', delay: 3 },
  ],
};

export const JUMP_IN_ROUTE: ComboStep[] = [
  { type: 'button',  attack: 'jumpC',    delay: 0 },
  { type: 'button',  attack: 'closeC',   delay: 4 },
];

export function applyComboStep(step: ComboStep, base: ResolvedInput): void {
  if (step.type === 'button') {
    switch (step.attack) {
      case 'closeC':
        base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true; break;
      case 'standA':
        base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'standB':
        base.buttonB = true; base.buttonBPressed = true; base.kickPressed = true; break;
      case 'cmdGofuYou':
        base.forward = true; base.buttonB = true; base.buttonBPressed = true; base.kickPressed = true; break;
      case 'ioriYumeyumi':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'terryBackKnuckle':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'kimHishouKick':
        base.forward = true; base.buttonB = true; base.buttonBPressed = true; base.kickPressed = true; break;
      case 'ryoTsurizao':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'kdashOneInch':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'kulaOneMore':
        base.forward = true; base.buttonB = true; base.buttonBPressed = true; base.kickPressed = true; break;
      case 'leonaStrikeArc':
        base.forward = true; base.buttonB = true; base.buttonBPressed = true; base.kickPressed = true; break;
      case 'jumpC':
        base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true; break;
    }
  }
  if (step.type === 'special') {
    switch (step.attack) {
      case 'aragami': case 'aoihana1': case 'burnKnuckle': case 'specialUpper':
        base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'aragamiFollow': case 'aragamiEnder':
        base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'aoihana2': case 'aoihana3':
        base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true; break;
      case 'hiensen':
        base.buttonB = true; base.buttonBPressed = true; base.kickPressed = true; break;
      default:
        base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true; break;
    }
  }
}

export function routeComboSpecial(
  charId: string,
  attack: string,
  character: CharacterDefinition,
  input: ResolvedInput,
  tick: number,
): AttackType | null {
  switch (charId) {
    case 'kyo': return routeKyo(attack, character, input, tick);
    case 'iori': return routeIori(attack);
    case 'terry': return routeTerry(attack);
    case 'kim': return routeKim(attack);
    case 'ryo': return routeRyo(attack);
    case 'kdash': return routeKdash(attack);
    case 'kula': return routeKula(attack);
    case 'leona': return routeLeona(attack);
    default: return null;
  }
}

function routeKyo(attack: string, character: CharacterDefinition, input: ResolvedInput, tick: number): AttackType | null {
  switch (attack) {
    case 'aragami': return AttackType.KYO_ARAGAMI;
    case 'aragamiFollow':
      return character.routeSpecial(input, {
        checkSpecial: () => null, checkDMMotion: () => null, checkKickSpecial: () => null,
        hasQCF: () => true, hasQCB: () => false,
        checkRekkaFollowQCF: () => AttackType.KYO_ARAGAMI_KONOKIZU,
        checkRekkaFollowHCB: () => null, checkDokugamiFollow: () => null,
        checkBatsuyomiInput: () => false,
      } as any, tick);
    case 'aragamiEnder':
      return character.routeSpecial(input, {
        checkSpecial: () => null, checkDMMotion: () => null, checkKickSpecial: () => null,
        hasQCF: () => false, hasQCB: () => true,
        checkRekkaFollowQCF: () => null,
        checkRekkaFollowHCB: () => AttackType.KYO_ARAGAMI_YANOSABI,
        checkDokugamiFollow: () => null, checkBatsuyomiInput: () => false,
      } as any, tick);
    default: return AttackType.SPECIAL_UPPER;
  }
}

function routeIori(attack: string): AttackType | null {
  switch (attack) {
    case 'aoihana1': return AttackType.IORI_AOIHANA;
    case 'aoihana2': return AttackType.IORI_AOIHANA_2;
    case 'aoihana3': return AttackType.IORI_AOIHANA_3;
    default: return AttackType.IORI_AOIHANA;
  }
}

function routeTerry(attack: string): AttackType | null {
  return attack === 'burnKnuckle' ? AttackType.TERRY_BURN_KNUCKLE : AttackType.TERRY_BURN_KNUCKLE;
}

function routeKim(attack: string): AttackType | null {
  switch (attack) {
    case 'hangetsu': return AttackType.KIM_HANGETSU;
    default: return AttackType.KIM_HIENZAN;
  }
}

function routeRyo(attack: string): AttackType | null {
  switch (attack) {
    case 'dmTenHaOu': return AttackType.DM_TEN_HA_OU;
    default: return AttackType.RYO_KO_HOU;
  }
}

function routeKdash(attack: string): AttackType | null {
  switch (attack) {
    case 'dmChainShot': return AttackType.DM_CHAIN_SHOT;
    default: return AttackType.KDASH_CROW;
  }
}

function routeKula(attack: string): AttackType | null {
  switch (attack) {
    case 'dmFreeze': return AttackType.DM_FREEZE;
    default: return AttackType.KULA_SHELL;
  }
}

function routeLeona(attack: string): AttackType | null {
  switch (attack) {
    case 'dmVSlasher': return AttackType.DM_V_SLASHER;
    default: return AttackType.LEONA_EAR_RING;
  }
}
