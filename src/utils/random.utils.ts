export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

export function randomStringNumber(length: number): string {
  const result = [];
  for (let i = 0; i < length; i++) {
    result.push(`${randomNumber(0, 9)}`);
  }
  return result.join('');
}
