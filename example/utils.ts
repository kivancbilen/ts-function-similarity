// Another example file with duplicate-like functions

export function sum(num1: number, num2: number): number {
  const total = num1 + num2;
  return total;
}

export function getUserName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export function getFullName(first: string, last: string): string {
  return `${first} ${last}`;
}

export function formatName(givenName: string, familyName: string): string {
  return givenName + ' ' + familyName;
}
