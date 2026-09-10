export const monthly = [
    { month: 'Jan', tempMax: 8, tempMin: 3, rainfall: 55, uv: 1 },
    { month: 'Feb', tempMax: 8, tempMin: 3, rainfall: 41, uv: 2 },
    { month: 'Mar', tempMax: 11, tempMin: 5, rainfall: 42, uv: 3 },
    { month: 'Apr', tempMax: 14, tempMin: 6, rainfall: 44, uv: 5 },
    { month: 'May', tempMax: 18, tempMin: 9, rainfall: 49, uv: 6 },
    { month: 'Jun', tempMax: 21, tempMin: 12, rainfall: 45, uv: 7 },
    { month: 'Jul', tempMax: 23, tempMin: 14, rainfall: 45, uv: 7 },
    { month: 'Aug', tempMax: 23, tempMin: 14, rainfall: 50, uv: 6 },
    { month: 'Sep', tempMax: 20, tempMin: 11, rainfall: 49, uv: 4 },
    { month: 'Oct', tempMax: 15, tempMin: 9, rainfall: 69, uv: 2 },
    { month: 'Nov', tempMax: 11, tempMin: 6, rainfall: 59, uv: 1 },
    { month: 'Dec', tempMax: 9, tempMin: 4, rainfall: 55, uv: 1 }
];

const HOURS = Array.from({ length: 24 }, (_, h) => `${h.toString().padStart(2, '0')}:00`);

export const solar: { month: string; hour: string; value: number }[] = [];

for (const m of monthly) {
    const peak = m.uv * 90;

    for (let h = 0; h < HOURS.length; h++) {
        const solarArc = Math.max(0, Math.sin(((h - 5) / 14) * Math.PI)) * peak;

        solar.push({
            month: m.month,
            hour: HOURS[h]!,
            value: Math.round(solarArc)
        });
    }
}
