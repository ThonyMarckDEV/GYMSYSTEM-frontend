/** "60" → "2 meses", "30" → "1 mes"; si no es múltiplo de 30, en días. */
export const textoDias = (dias) => {
    const n = Number(dias) || 0;
    if (n > 0 && n % 30 === 0) return `${n / 30} ${n / 30 === 1 ? 'mes' : 'meses'}`;
    return `${n} ${n === 1 ? 'día' : 'días'}`;
};
