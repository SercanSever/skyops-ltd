export class SerialNumber {
  private static readonly FORMAT = /^SKY-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): SerialNumber {
    if (!SerialNumber.FORMAT.test(value)) {
      throw new Error(
        `Invalid serial number format: "${value}". Expected format: SKY-XXXX-XXXX (X = A-Z, 0-9)`,
      );
    }
    return new SerialNumber(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: SerialNumber): boolean {
    return this.value === other.value;
  }
}
