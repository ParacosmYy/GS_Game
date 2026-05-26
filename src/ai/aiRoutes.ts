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
    { type: 'button',  attack: 'closeC',       delay: 0 },
    { type: 'button',  attack: 'ryoOrishi',    delay: 2 },
    { type: 'special', attack: 'ryoKoouC',      delay: 3 },
    { type: 'special', attack: 'dmRyukoRanbu',  delay: 4 },
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
  robert: [
    { type: 'button',  attack: 'closeC',     delay: 0 },
    { type: 'button',  attack: 'robertGeneiKyaku', delay: 2 },
    { type: 'special', attack: 'robertRyuZan', delay: 3 },
    { type: 'special', attack: 'dmRyuKoRyu',  delay: 4 },
  ],
  athena: [
    { type: 'button',  attack: 'closeC',     delay: 0 },
    { type: 'button',  attack: 'athenaPhoenixReflect', delay: 2 },
    { type: 'special', attack: 'athenaPsychoBall', delay: 3 },
    { type: 'special', attack: 'dmShiningCrystalBit', delay: 4 },
  ],
  mai: [
    { type: 'button',  attack: 'closeC',     delay: 0 },
    { type: 'button',  attack: 'maiShinobibachi', delay: 2 },
    { type: 'special', attack: 'maiKaChoSen', delay: 3 },
    { type: 'special', attack: 'dmHakaOtoshi', delay: 4 },
  ],
  ralf: [
    { type: 'button',  attack: 'closeC',     delay: 0 },
    { type: 'button',  attack: 'ralfSabrePunch', delay: 2 },
    { type: 'special', attack: 'ralfVulcan',  delay: 3 },
    { type: 'special', attack: 'dmGalacticaPhantom', delay: 4 },
  ],
  clark: [
    { type: 'button',  attack: 'closeC',     delay: 0 },
    { type: 'button',  attack: 'clarkDeathLake', delay: 2 },
    { type: 'special', attack: 'clarkArgentine', delay: 3 },
    { type: 'special', attack: 'clarkFlashElbow', delay: 3 },
    { type: 'special', attack: 'dmArgentine',  delay: 4 },
  ],
  joe: [
    { type: 'button',  attack: 'closeC',     delay: 0 },
    { type: 'button',  attack: 'joeKneeKick', delay: 2 },
    { type: 'special', attack: 'joeHurricane', delay: 3 },
    { type: 'special', attack: 'joeBakuretsuken', delay: 3 },
    { type: 'special', attack: 'dmScrewUpper', delay: 4 },
  ],
  andy: [
    { type: 'button',  attack: 'closeC',     delay: 0 },
    { type: 'button',  attack: 'andyUwaAgito', delay: 2 },
    { type: 'special', attack: 'andyShouryuuDan', delay: 3 },
    { type: 'special', attack: 'dmChoReppaDan',  delay: 4 },
  ],
  billy: [
    { type: 'button',  attack: 'closeC',     delay: 0 },
    { type: 'button',  attack: 'billySandanGear', delay: 2 },
    { type: 'special', attack: 'billySenpuKon', delay: 3 },
    { type: 'special', attack: 'dmKaenSenpuJin', delay: 4 },
  ],
  chang: [
    { type: 'button',  attack: 'closeC',     delay: 0 },
    { type: 'button',  attack: 'changHikiNage', delay: 2 },
    { type: 'special', attack: 'changTekkyuuKaiten', delay: 3 },
    { type: 'special', attack: 'dmTekkyuuDaiBousou', delay: 4 },
  ],
  choi: [
    { type: 'button',  attack: 'closeC', delay: 0 },
    { type: 'button',  attack: 'choiSoutenMekkyaku', delay: 2 },
    { type: 'special', attack: 'choiKaitenHienZan', delay: 3 },
    { type: 'special', attack: 'dmShinChouHouyoku', delay: 4 },
  ],
  mature: [
    { type: 'button',  attack: 'closeC', delay: 0 },
    { type: 'button',  attack: 'matureDespair', delay: 2 },
    { type: 'special', attack: 'matureMassacre', delay: 3 },
    { type: 'special', attack: 'dmNocturnalLight', delay: 4 },
  ],
  yashiro: [
    { type: 'button',  attack: 'closeC', delay: 0 },
    { type: 'button',  attack: 'yashiroShuuWani', delay: 2 },
    { type: 'special', attack: 'yashiroUpperDu', delay: 3 },
    { type: 'special', attack: 'dmArmageddonBusters', delay: 4 },
  ],
  chris: [
    { type: 'button',  attack: 'closeC', delay: 0 },
    { type: 'button',  attack: 'chrisMakashippo', delay: 2 },
    { type: 'special', attack: 'chrisShotWeave', delay: 3 },
    { type: 'special', attack: 'dmChainSlideTouch', delay: 4 },
  ],
  shermie: [
    { type: 'button',  attack: 'closeC', delay: 0 },
    { type: 'button',  attack: 'shermieStand', delay: 2 },
    { type: 'special', attack: 'shermieShoot', delay: 3 },
    { type: 'special', attack: 'dmShermieCarnival', delay: 4 },
  ],
  vice: [
    { type: 'button',  attack: 'closeC', delay: 0 },
    { type: 'button',  attack: 'viceMonstrosity', delay: 2 },
    { type: 'special', attack: 'viceOutrage', delay: 3 },
    { type: 'special', attack: 'dmNegativeGain', delay: 4 },
  ],
  yamazaki: [
    { type: 'button',  attack: 'closeC', delay: 0 },
    { type: 'button',  attack: 'yamazakiSashi', delay: 2 },
    { type: 'special', attack: 'yamazakiSnakeArm', delay: 3 },
    { type: 'special', attack: 'dmGuillotine', delay: 4 },
  ],
  xiangfei: [
    { type: 'button',  attack: 'closeC', delay: 0 },
    { type: 'button',  attack: 'xiangfeiKyuHo', delay: 2 },
    { type: 'special', attack: 'xiangfeiNanpa', delay: 3 },
    { type: 'special', attack: 'dmChouKaRinga', delay: 4 },
  ],
  kasumi: [
    { type: 'button',  attack: 'closeC', delay: 0 },
    { type: 'button',  attack: 'kasumiKouU', delay: 2 },
    { type: 'special', attack: 'kasumiKoouKen', delay: 3 },
    { type: 'special', attack: 'dmChouMukigenzan', delay: 4 },
  ],
  mary: [
    { type: 'button',  attack: 'closeC', delay: 0 },
    { type: 'button',  attack: 'maryHammerPunch', delay: 2 },
    { type: 'special', attack: 'maryStraightSlicer', delay: 3 },
    { type: 'special', attack: 'dmMaryTyphoon', delay: 4 },
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
      case 'ryoOrishi':
        base.down = true; base.forward = true; base.buttonB = true; base.buttonBPressed = true; base.kickPressed = true; break;
      case 'kdashOneInch':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'kulaOneMore':
        base.forward = true; base.buttonB = true; base.buttonBPressed = true; base.kickPressed = true; break;
      case 'leonaStrikeArc':
        base.forward = true; base.buttonB = true; base.buttonBPressed = true; base.kickPressed = true; break;
      case 'robertGeneiKyaku':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'athenaPhoenixReflect':
        base.forward = true; base.buttonB = true; base.buttonBPressed = true; base.kickPressed = true; break;
      case 'maiShinobibachi':
        base.forward = true; base.buttonB = true; base.buttonBPressed = true; base.kickPressed = true; break;
      case 'ralfSabrePunch':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'clarkDeathLake':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'joeKneeKick':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'andyUwaAgito':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'billySandanGear':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'changHikiNage':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'choiSoutenMekkyaku':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'matureDespair':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'yashiroShuuWani':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'chrisMakashippo':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'shermieStand':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'viceMonstrosity':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'yamazakiSashi':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'xiangfeiKyuHo':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'kasumiKouU':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
      case 'maryHammerPunch':
        base.forward = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true; break;
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
    case 'robert': return routeRobert(attack);
    case 'athena': return routeAthena(attack);
    case 'mai': return routeMai(attack);
    case 'ralf': return routeRalf(attack);
    case 'clark': return routeClark(attack);
    case 'joe': return routeJoe(attack);
    case 'andy': return routeAndy(attack);
    case 'billy': return routeBilly(attack);
    case 'chang': return routeChang(attack);
    case 'choi': return routeChoi(attack);
    case 'mature': return routeMature(attack);
    case 'yashiro': return routeYashiro(attack);
    case 'chris': return routeChris(attack);
    case 'shermie': return routeShermie(attack);
    case 'vice': return routeVice(attack);
    case 'yamazaki': return routeYamazaki(attack);
    case 'xiangfei': return routeXiangfei(attack);
    case 'kasumi': return routeKasumi(attack);
    case 'mary': return routeMary(attack);
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
    case 'ryoKoouC': return AttackType.RYO_KOOU_C;
    case 'dmRyukoRanbu': return AttackType.DM_RYUKO_RANBU;
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

function routeRobert(attack: string): AttackType | null {
  switch (attack) {
    case 'robertRyuZan': return AttackType.ROBERT_RYU_ZAN;
    case 'dmRyuKoRyu': return AttackType.DM_RYU_KO_RYU;
    case 'dmHaouShokou': return AttackType.DM_HAOU_SHOKOU;
    default: return AttackType.ROBERT_RYU_ZAN;
  }
}

function routeAthena(attack: string): AttackType | null {
  switch (attack) {
    case 'athenaPsychoBall': return AttackType.ATHENA_PSYCHO_BALL;
    case 'athenaPsychoSword': return AttackType.ATHENA_PSYCHO_SWORD;
    case 'dmShiningCrystalBit': return AttackType.DM_SHINING_CRYSTAL_BIT;
    default: return AttackType.ATHENA_PSYCHO_SWORD;
  }
}

function routeMai(attack: string): AttackType | null {
  switch (attack) {
    case 'maiKaChoSen': return AttackType.MAI_KA_CHO_SEN;
    case 'maiHishoRyuEnJin': return AttackType.MAI_HISHO_RYU_EN_JIN;
    case 'maiRyuEnBu': return AttackType.MAI_RYU_EN_BU;
    case 'dmHakaOtoshi': return AttackType.DM_HAKA_OTOSHI;
    default: return AttackType.MAI_HISHO_RYU_EN_JIN;
  }
}

function routeRalf(attack: string): AttackType | null {
  switch (attack) {
    case 'ralfVulcan': return AttackType.RALF_VULCAN;
    case 'ralfBackbreaker': return AttackType.RALF_BACKBREAKER;
    case 'ralfKick': return AttackType.RALF_KICK;
    case 'dmGalacticaPhantom': return AttackType.DM_GALACTICA_PHANTOM;
    default: return AttackType.RALF_VULCAN;
  }
}

function routeClark(attack: string): AttackType | null {
  switch (attack) {
    case 'clarkArgentine': return AttackType.CLARK_ARGENTINE;
    case 'clarkFlashElbow': return AttackType.CLARK_FLASH_ELBOW;
    case 'clarkVulcan': return AttackType.CLARK_VULCAN;
    case 'dmArgentine': return AttackType.DM_ARGENTINE_DM;
    default: return AttackType.CLARK_ARGENTINE;
  }
}

function routeJoe(attack: string): AttackType | null {
  switch (attack) {
    case 'joeHurricane': return AttackType.JOE_HURRICANE;
    case 'joeTigerKick': return AttackType.JOE_TIGER_KICK;
    case 'joeBakuretsuken': return AttackType.JOE_BAKURETSUKEN;
    case 'joeOugonKakato': return AttackType.JOE_OUGON_KAKATO;
    case 'dmScrewUpper': return AttackType.DM_SCREW_UPPER;
    default: return AttackType.JOE_HURRICANE;
  }
}

function routeAndy(attack: string): AttackType | null {
  switch (attack) {
    case 'andyShouryuuDan': return AttackType.ANDY_SHOURYUU_DAN;
    case 'andyHishouKen': return AttackType.ANDY_HISHOU_KEN;
    case 'andyZaneiRyuseiKen': return AttackType.ANDY_ZANEI_RYUSEI_KEN;
    case 'andyGekiHishouKen': return AttackType.ANDY_GEKI_HISHOU_KEN;
    case 'dmChoReppaDan': return AttackType.DM_CHO_REPPA_DAN;
    default: return AttackType.ANDY_SHOURYUU_DAN;
  }
}

function routeBilly(attack: string): AttackType | null {
  switch (attack) {
    case 'billySansetsuKon': return AttackType.BILLY_SANSETSU_KON;
    case 'billySansetsuKonC': return AttackType.BILLY_SANSETSU_KON_C;
    case 'billySenpuKon': return AttackType.BILLY_SENPU_KON;
    case 'billySenpuKonC': return AttackType.BILLY_SENPU_KON_C;
    case 'billyHienZan': return AttackType.BILLY_HIEN_ZAN;
    case 'billyHienZanD': return AttackType.BILLY_HIEN_ZAN_D;
    case 'dmKaenSenpuJin': return AttackType.DM_KAEN_SENPU_JIN;
    default: return AttackType.BILLY_SENPU_KON;
  }
}

function routeChang(attack: string): AttackType | null {
  switch (attack) {
    case 'changTekkyuuKaiten': return AttackType.CHANG_TEKKYUU_KAITEN;
    case 'changTekkyuuKaitenC': return AttackType.CHANG_TEKKYUU_KAITEN_C;
    case 'changTekkyuuFasshu': return AttackType.CHANG_TEKKYUU_FASSHU;
    case 'changTekkyuuHienZan': return AttackType.CHANG_TEKKYUU_HIEN_ZAN;
    case 'dmTekkyuuDaiBousou': return AttackType.DM_TEKKYUU_DAI_BOUSOU;
    default: return AttackType.CHANG_TEKKYUU_KAITEN;
  }
}

function routeChoi(attack: string): AttackType | null {
  switch (attack) {
    case 'choiHishouKyaku': return AttackType.CHOI_HISHOU_KYAKU;
    case 'choiHishouKyakuC': return AttackType.CHOI_HISHOU_KYAKU_C;
    case 'choiKaitenHienZan': return AttackType.CHOI_KAITEN_HIEN_ZAN;
    case 'choiKaitenHienZanC': return AttackType.CHOI_KAITEN_HIEN_ZAN_C;
    case 'choiHouyokuTenshin': return AttackType.CHOI_HOUYOKU_TENSHIN;
    case 'dmShinChouHouyoku': return AttackType.DM_SHIN_CHOU_HOUYOKU;
    default: return AttackType.CHOI_KAITEN_HIEN_ZAN;
  }
}

function routeMature(attack: string): AttackType | null {
  switch (attack) {
    case 'matureMassacre': return AttackType.MATURE_MASSACRE;
    case 'matureMassacreC': return AttackType.MATURE_MASSACRE_C;
    case 'matureHeavensGate': return AttackType.MATURE_HEAVENS_GATE;
    case 'matureEcstasy': return AttackType.MATURE_ECSTASY;
    case 'dmNocturnalLight': return AttackType.DM_NOCTURNAL_LIGHT;
    default: return AttackType.MATURE_MASSACRE;
  }
}

function routeYashiro(attack: string): AttackType | null {
  switch (attack) {
    case 'yashiroUpperDu': return AttackType.YASHIRO_UPPER_DU;
    case 'yashiroUpperDuC': return AttackType.YASHIRO_UPPER_DU_C;
    case 'yashiroNiraai': return AttackType.YASHIRO_NIRAAI;
    case 'yashiroMusatsu': return AttackType.YASHIRO_MUSATSU;
    case 'dmArmageddonBusters': return AttackType.DM_ARMAGEDDON_BUSTERS;
    default: return AttackType.YASHIRO_UPPER_DU;
  }
}

function routeChris(attack: string): AttackType | null {
  switch (attack) {
    case 'chrisShotWeave': return AttackType.CHRIS_SHOT_WEAVE;
    case 'chrisShotWeaveC': return AttackType.CHRIS_SHOT_WEAVE_C;
    case 'chrisTwisterDrive': return AttackType.CHRIS_TWISTER_DRIVE;
    case 'chrisScrambleDash': return AttackType.CHRIS_SCRAMBLE_DASH;
    case 'dmChainSlideTouch': return AttackType.DM_CHAIN_SLIDE_TOUCH;
    default: return AttackType.CHRIS_SHOT_WEAVE;
  }
}

function routeShermie(attack: string): AttackType | null {
  switch (attack) {
    case 'shermieShoot': return AttackType.SHERMIE_SHOOT;
    case 'shermieShootC': return AttackType.SHERMIE_SHOOT_C;
    case 'shermieCarnival': return AttackType.SHERMIE_CARNIVAL;
    case 'shermieAxleSpin': return AttackType.SHERMIE_AXLE_SPIN;
    case 'dmShermieCarnival': return AttackType.DM_SHERMIE_CARNIVAL;
    default: return AttackType.SHERMIE_SHOOT;
  }
}

function routeVice(attack: string): AttackType | null {
  switch (attack) {
    case 'viceOutrage': return AttackType.VICE_OUTRAGE;
    case 'viceOutrageC': return AttackType.VICE_OUTRAGE_C;
    case 'viceBlackEnd': return AttackType.VICE_BLACK_END;
    case 'viceMayhem': return AttackType.VICE_MAYHEM;
    case 'dmNegativeGain': return AttackType.DM_NEGATIVE_GAIN;
    default: return AttackType.VICE_OUTRAGE;
  }
}

function routeYamazaki(attack: string): AttackType | null {
  switch (attack) {
    case 'yamazakiSnakeArm': return AttackType.YAMAZAKI_SNAKE_ARM;
    case 'yamazakiSnakeArmC': return AttackType.YAMAZAKI_SNAKE_ARM_C;
    case 'yamazakiSandstorm': return AttackType.YAMAZAKI_SANDSTORM;
    case 'yamazakiBaiGaSe': return AttackType.YAMAZAKI_BAI_GA_SE;
    case 'dmGuillotine': return AttackType.DM_GUILLOTINE;
    default: return AttackType.YAMAZAKI_SNAKE_ARM;
  }
}

function routeXiangfei(attack: string): AttackType | null {
  switch (attack) {
    case 'xiangfeiNanpa': return AttackType.XIANGFEI_NANPA;
    case 'xiangfeiNanpaC': return AttackType.XIANGFEI_NANPA_C;
    case 'xiangfeiTenpatsu': return AttackType.XIANGFEI_TENPATSU;
    case 'xiangfeiMahoHisha': return AttackType.XIANGFEI_MAHO_HISHA;
    case 'dmChouKaRinga': return AttackType.DM_CHO_KA_RINGA;
    default: return AttackType.XIANGFEI_NANPA;
  }
}

function routeKasumi(attack: string): AttackType | null {
  switch (attack) {
    case 'kasumiKoouKen': return AttackType.KASUMI_KOOU_KEN;
    case 'kasumiKoouKenC': return AttackType.KASUMI_KOOU_KEN_C;
    case 'kasumiKasaneAte': return AttackType.KASUMI_KASANE_ATE;
    case 'kasumiMukigenzan': return AttackType.KASUMI_MUKIGENZAN;
    case 'dmChouMukigenzan': return AttackType.DM_CHO_MUKIGENZAN;
    default: return AttackType.KASUMI_KOOU_KEN;
  }
}

function routeMary(attack: string): AttackType | null {
  switch (attack) {
    case 'maryStraightSlicer': return AttackType.MARY_STRAIGHT_SLICER;
    case 'maryStraightSlicerC': return AttackType.MARY_STRAIGHT_SLICER_C;
    case 'maryBackdropReal': return AttackType.MARY_BACKDROP_REAL;
    case 'marySpider': return AttackType.MARY_SPIDER;
    case 'dmMaryTyphoon': return AttackType.DM_MARY_TYPHOON;
    default: return AttackType.MARY_STRAIGHT_SLICER;
  }
}