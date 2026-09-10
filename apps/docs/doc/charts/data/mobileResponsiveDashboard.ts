export interface MobileRevenuePoint {
    window: string;
    revenue: number;
    conversion: number;
    orders: number;
}

export interface MobileChannelShare {
    channel: string;
    share: number;
    color: string;
}

export interface MobileRegionLoad {
    region: string;
    tickets: number;
    sla: number;
    color: string;
}

export const mobileRevenueTrend: MobileRevenuePoint[] = [
    { window: '06:00', revenue: 42, conversion: 2.8, orders: 320 },
    { window: '08:00', revenue: 58, conversion: 3.1, orders: 410 },
    { window: '10:00', revenue: 76, conversion: 3.6, orders: 560 },
    { window: '12:00', revenue: 91, conversion: 3.9, orders: 690 },
    { window: '14:00', revenue: 84, conversion: 3.5, orders: 640 },
    { window: '16:00', revenue: 102, conversion: 4.2, orders: 760 },
    { window: '18:00', revenue: 128, conversion: 4.8, orders: 930 },
    { window: '20:00', revenue: 117, conversion: 4.4, orders: 880 },
    { window: '22:00', revenue: 73, conversion: 3.2, orders: 510 }
];

export const mobileChannelShare: MobileChannelShare[] = [
    { channel: 'App', share: 42, color: '#5daeea' },
    { channel: 'Search', share: 24, color: '#4ecdc4' },
    { channel: 'Social', share: 19, color: '#ffad5a' },
    { channel: 'Email', share: 10, color: '#7c8cff' },
    { channel: 'Retail QR', share: 5, color: '#ff6fae' }
];

export const mobileRegionLoad: MobileRegionLoad[] = [
    { region: 'North', tickets: 82, sla: 94, color: '#5daeea' },
    { region: 'West', tickets: 66, sla: 91, color: '#4ecdc4' },
    { region: 'Central', tickets: 74, sla: 88, color: '#ffd166' },
    { region: 'South', tickets: 58, sla: 96, color: '#7c8cff' },
    { region: 'East', tickets: 49, sla: 97, color: '#5ccf9f' }
];

export const mobileDashboardSummary = {
    revenue: 771,
    conversion: 3.8,
    orders: 5700,
    sla: 93
};
