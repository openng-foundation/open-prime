export interface SectorRow {
    sector: string;
    label: string;
}

export const sectors: SectorRow[] = [
    { sector: 'S1', label: 'Sainte Dévote' },
    { sector: 'S2', label: 'Casino hairpin' },
    { sector: 'S3', label: 'Mirabeau' },
    { sector: 'S4', label: 'Tunnel entry' },
    { sector: 'S5', label: 'Tunnel apex' },
    { sector: 'S6', label: 'Chicane' },
    { sector: 'S7', label: 'Piscine' },
    { sector: 'S8', label: 'Rascasse' }
];

export const redBullData = [96, 71, 88, 97, 99, 73, 84, 69].map((score, i) => ({ sector: sectors[i].sector, score }));
export const ferrariData = [78, 92, 84, 83, 90, 90, 76, 91].map((score, i) => ({ sector: sectors[i].sector, score }));
export const mercedesData = [88, 68, 91, 76, 81, 87, 95, 74].map((score, i) => ({ sector: sectors[i].sector, score }));
