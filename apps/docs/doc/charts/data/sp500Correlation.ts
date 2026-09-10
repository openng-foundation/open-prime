const SECTORS = ['Tech', 'Financials', 'Health', 'C. Discr.', 'C. Staples', 'Industrials', 'Energy', 'Utilities', 'Materials'] as const;

const upper: Record<string, Record<string, number>> = {
    Tech: { Tech: 1.0, Financials: 0.58, Health: 0.64, 'C. Discr.': 0.82, 'C. Staples': 0.51, Industrials: 0.71, Energy: 0.32, Utilities: 0.38, Materials: 0.61 },
    Financials: { Financials: 1.0, Health: 0.51, 'C. Discr.': 0.71, 'C. Staples': 0.48, Industrials: 0.79, Energy: 0.52, Utilities: 0.38, Materials: 0.72 },
    Health: { Health: 1.0, 'C. Discr.': 0.65, 'C. Staples': 0.67, Industrials: 0.61, Energy: 0.28, Utilities: 0.46, Materials: 0.55 },
    'C. Discr.': { 'C. Discr.': 1.0, 'C. Staples': 0.58, Industrials: 0.81, Energy: 0.41, Utilities: 0.33, Materials: 0.7 },
    'C. Staples': { 'C. Staples': 1.0, Industrials: 0.52, Energy: 0.25, Utilities: 0.59, Materials: 0.48 },
    Industrials: { Industrials: 1.0, Energy: 0.54, Utilities: 0.42, Materials: 0.83 },
    Energy: { Energy: 1.0, Utilities: 0.19, Materials: 0.65 },
    Utilities: { Utilities: 1.0, Materials: 0.41 },
    Materials: { Materials: 1.0 }
};

export const sp500Correlation: { row: string; col: string; corr: number }[] = [];

for (const r of SECTORS) {
    for (const c of SECTORS) {
        const v = upper[r]?.[c] ?? upper[c]?.[r];

        if (typeof v === 'number') sp500Correlation.push({ row: r, col: c, corr: v });
    }
}
