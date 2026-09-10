export interface Candle {
    ts: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

const ANCHORS: [string, number][] = [
    ['2021-11-07', 61500],
    ['2021-11-08', 68700],
    ['2021-12-05', 49000],
    ['2022-01-02', 47300],
    ['2022-02-06', 42400],
    ['2022-03-06', 39100],
    ['2022-04-03', 46000],
    ['2022-05-01', 38500],
    ['2022-06-05', 31700],
    ['2022-06-19', 20800],
    ['2022-07-03', 21600],
    ['2022-08-07', 24100],
    ['2022-09-04', 19800],
    ['2022-10-02', 19400],
    ['2022-11-06', 21000],
    ['2022-11-13', 16400],
    ['2022-12-04', 17100],
    ['2023-01-01', 16600],
    ['2023-02-05', 23400],
    ['2023-03-05', 22000],
    ['2023-04-02', 28200],
    ['2023-05-07', 28800],
    ['2023-06-04', 27000],
    ['2023-07-02', 30600],
    ['2023-08-06', 29400],
    ['2023-09-03', 25800],
    ['2023-10-01', 27900],
    ['2023-11-05', 37100],
    ['2023-12-03', 43700],
    ['2024-01-07', 43900],
    ['2024-02-04', 48200],
    ['2024-03-03', 68300],
    ['2024-04-07', 70800],
    ['2024-05-05', 62900],
    ['2024-06-02', 71000],
    ['2024-07-07', 58200],
    ['2024-08-04', 61100],
    ['2024-09-01', 53600],
    ['2024-10-06', 62800],
    ['2024-11-03', 76400],
    ['2024-11-24', 97500],
    ['2024-12-15', 104000]
];

let rngState = 777;

function seededRandom() {
    let t = (rngState += 0x6d2b79f5);

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function generateWeekly(): Candle[] {
    const points = ANCHORS.map(([iso, close]) => ({
        ts: Date.parse(iso),
        close
    }));
    const candles: Candle[] = [];
    const firstPoint = points[0];

    if (!firstPoint) return candles;

    let prevClose = firstPoint.close;

    for (const p of points) {
        const open = prevClose;
        const close = p.close;
        const volatility = 0.055;
        const high = Math.max(open, close) * (1 + volatility * (0.3 + seededRandom() * 0.7));
        const low = Math.min(open, close) * (1 - volatility * (0.3 + seededRandom() * 0.7));

        candles.push({
            ts: p.ts,
            open: Math.round(open),
            high: Math.round(high),
            low: Math.round(low),
            close: Math.round(close)
        });
        prevClose = close;
    }

    return candles;
}

export const btcCycle: Candle[] = generateWeekly();
