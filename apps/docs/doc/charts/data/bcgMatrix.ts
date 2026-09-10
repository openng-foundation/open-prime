export interface Product {
    name: string;
    share: number;
    growth: number;
    revenue: number;
}

export const TOTAL_REVENUE = 209;

export const stars: Product[] = [{ name: 'Office / M365', share: 9.0, growth: 15, revenue: 50 }];

export const questionMarks: Product[] = [
    { name: 'Azure', share: 0.72, growth: 30, revenue: 80 },
    { name: 'Xbox + Activision', share: 0.52, growth: 45, revenue: 22 }
];

export const cashCows: Product[] = [
    { name: 'Windows OEM', share: 4.2, growth: -2, revenue: 22 },
    { name: 'LinkedIn', share: 1.1, growth: 8, revenue: 17 }
];

export const dogs: Product[] = [
    { name: 'Bing Search', share: 0.033, growth: 5, revenue: 13 },
    { name: 'Surface', share: 0.12, growth: 10, revenue: 5 }
];
