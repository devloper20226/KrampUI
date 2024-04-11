export function roundNumber(num: number, to: number): number {
    return Math.round(num / to) * to;
}