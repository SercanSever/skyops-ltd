import { SerialNumber } from './serial-number.vo';

describe('SerialNumber', () => {
  describe('create', () => {
    it.each([
      'SKY-AB12-CD34',
      'SKY-0000-ZZZZ',
      'SKY-A1B2-C3D4',
      'SKY-XXXX-9999',
    ])('should create with valid format: %s', (value) => {
      const sn = SerialNumber.create(value);
      expect(sn.getValue()).toBe(value);
    });

    it.each([
      ['INVALID', 'completely wrong format'],
      ['SKY-ab12-cd34', 'lowercase letters'],
      ['SKY-ABCD', 'missing second segment'],
      ['SKY-ABCDE-1234', 'segment too long'],
      ['DRN-AB12-CD34', 'wrong prefix'],
      ['SKY-AB!2-CD34', 'special character'],
      ['', 'empty string'],
      ['SKY-AB12-CD34-EXTRA', 'extra segment'],
    ])('should reject invalid format: %s (%s)', (value) => {
      expect(() => SerialNumber.create(value)).toThrow(
        'Invalid serial number format',
      );
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const sn1 = SerialNumber.create('SKY-AB12-CD34');
      const sn2 = SerialNumber.create('SKY-AB12-CD34');
      expect(sn1.equals(sn2)).toBe(true);
    });

    it('should return false for different values', () => {
      const sn1 = SerialNumber.create('SKY-AB12-CD34');
      const sn2 = SerialNumber.create('SKY-0000-ZZZZ');
      expect(sn1.equals(sn2)).toBe(false);
    });
  });
});
