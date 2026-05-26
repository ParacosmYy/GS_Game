import { describe, it, expect } from 'vitest';
import { isDM, isCharacterSpecial, isSpecialOrDM, classify, AttackCategory } from '../src/core/attackClassifier.js';

describe('attackClassifier', () => {
  describe('isDM', () => {
    it('DM_ prefix is DM', () => expect(isDM('DM_HAOU_SHOU_KOU_KEN')).toBe(true));
    it('SDM_ prefix is DM', () => expect(isDM('SDM_RYUKO_RANBU')).toBe(true));
    it('HSDM_ prefix is DM', () => expect(isDM('HSDM_TEN_CHI_HAOU_KEN')).toBe(true));
    it('SPECIAL_ is not DM', () => expect(isDM('SPECIAL_FIREBALL')).toBe(false));
    it('STAND_A is not DM', () => expect(isDM('STAND_A')).toBe(false));
    it('plain name is not DM', () => expect(isDM('KOOUKEN')).toBe(false));
  });

  describe('isCharacterSpecial', () => {
    it('KYO_ prefix is character special', () => expect(isCharacterSpecial('KYO_ONIYAKI')).toBe(true));
    it('IORI_ prefix is character special', () => expect(isCharacterSpecial('IORI_YAOTOME')).toBe(true));
    it('STAND_A is not character special (normal prefix)', () => expect(isCharacterSpecial('STAND_A')).toBe(false));
    it('DM_ prefix is not character special (normal prefix)', () => expect(isCharacterSpecial('DM_HAOU')).toBe(false));
    it('SPECIAL_ prefix is not character special', () => expect(isCharacterSpecial('SPECIAL_FIREBALL')).toBe(false));
    it('name without underscore is not character special', () => expect(isCharacterSpecial('KOOUKEN')).toBe(false));
  });

  describe('isSpecialOrDM', () => {
    it('DM_ is special or DM', () => expect(isSpecialOrDM('DM_HAOU')).toBe(true));
    it('SPECIAL_ is special or DM', () => expect(isSpecialOrDM('SPECIAL_FIREBALL')).toBe(true));
    it('KYO_ prefix is special or DM', () => expect(isSpecialOrDM('KYO_ONIYAKI')).toBe(true));
    it('STAND_A is not special or DM', () => expect(isSpecialOrDM('STAND_A')).toBe(false));
    it('THROW is not special or DM', () => expect(isSpecialOrDM('THROW')).toBe(false));
  });

  describe('classify', () => {
    it('DM_ => DM', () => expect(classify('DM_HAOU')).toBe(AttackCategory.DM));
    it('SDM_ => DM', () => expect(classify('SDM_RYUKO')).toBe(AttackCategory.DM));
    it('HSDM_ => DM', () => expect(classify('HSDM_TENCHI')).toBe(AttackCategory.DM));
    it('THROW => THROW', () => expect(classify('THROW')).toBe(AttackCategory.THROW));
    it('THROW_FORWARD => THROW', () => expect(classify('THROW_FORWARD')).toBe(AttackCategory.THROW));
    it('THROW_BACK => THROW', () => expect(classify('THROW_BACK')).toBe(AttackCategory.THROW));
    it('STAND_CD => BLOWBACK', () => expect(classify('STAND_CD')).toBe(AttackCategory.BLOWBACK));
    it('JUMP_CD => BLOWBACK', () => expect(classify('JUMP_CD')).toBe(AttackCategory.BLOWBACK));
    it('CMD_ prefix => COMMAND', () => expect(classify('CMD_OVERHEAD')).toBe(AttackCategory.COMMAND));
    it('KYO_ prefix => SPECIAL', () => expect(classify('KYO_ONIYAKI')).toBe(AttackCategory.SPECIAL));
    it('SPECIAL_ => SPECIAL', () => expect(classify('SPECIAL_FIREBALL')).toBe(AttackCategory.SPECIAL));
    it('STAND_A => NORMAL', () => expect(classify('STAND_A')).toBe(AttackCategory.NORMAL));
    it('STAND_B => NORMAL', () => expect(classify('STAND_B')).toBe(AttackCategory.NORMAL));
    it('CROUCH_C => NORMAL', () => expect(classify('CROUCH_C')).toBe(AttackCategory.NORMAL));
    it('JUMP_D => NORMAL', () => expect(classify('JUMP_D')).toBe(AttackCategory.NORMAL));
    it('CLOSE_A => NORMAL', () => expect(classify('CLOSE_A')).toBe(AttackCategory.NORMAL));
    it('SPECIAL_PROJECTILE => SPECIAL', () => expect(classify('SPECIAL_PROJECTILE')).toBe(AttackCategory.SPECIAL));
  });
});
