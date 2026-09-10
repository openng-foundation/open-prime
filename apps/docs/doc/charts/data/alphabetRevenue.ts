export interface Row {
    id: string;
    label: string;
    value: number;
    parent: string | null;
    yoy: number;
    yoyLabel: string;
}

const fmt = (yoy: number, val?: number) => `${yoy >= 0 ? '+' : ''}${yoy}% YoY${val != null ? ` · $${val}B` : ''}`;

export const alphabetRevenue: Row[] = [
    { id: 'services', label: 'Google Services', value: 0, parent: null, yoy: 13, yoyLabel: fmt(13) },
    { id: 'cloud', label: 'Google Cloud', value: 11.4, parent: null, yoy: 35, yoyLabel: fmt(35, 11.4) },
    { id: 'other', label: 'Other Bets', value: 0.4, parent: null, yoy: 40, yoyLabel: fmt(40, 0.4) },

    { id: 'search', label: 'Search & other', value: 49.4, parent: 'services', yoy: 12, yoyLabel: fmt(12, 49.4) },
    { id: 'youtube', label: 'YouTube Ads', value: 8.9, parent: 'services', yoy: 12, yoyLabel: fmt(12, 8.9) },
    { id: 'network', label: 'Google Network', value: 7.5, parent: 'services', yoy: -2, yoyLabel: fmt(-2, 7.5) },
    { id: 'spd', label: 'Subscriptions', value: 10.7, parent: 'services', yoy: 28, yoyLabel: fmt(28, 10.7) }
];

export const GRAND_TOTAL = 88.3;
