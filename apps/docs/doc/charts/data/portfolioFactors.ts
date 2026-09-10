export interface FactorRow {
    factor: string;
    value: number;
    growth: number;
    momentum: number;
}

export const portfolioFactors: FactorRow[] = [
    { factor: 'Value', value: 88, growth: 22, momentum: 42 },
    { factor: 'Growth', value: 30, growth: 92, momentum: 58 },
    { factor: 'Momentum', value: 48, growth: 72, momentum: 95 },
    { factor: 'Quality', value: 65, growth: 78, momentum: 70 },
    { factor: 'Low-Volatility', value: 74, growth: 55, momentum: 38 },
    { factor: 'Size (small)', value: 52, growth: 48, momentum: 60 }
];

export const marketAverage = 60;
