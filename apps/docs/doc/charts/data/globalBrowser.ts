import { computed, DestroyRef, inject, signal } from '@angular/core';

export const browsers = ['Chrome', 'Microsoft', 'Firefox', 'Safari', 'Opera'];

export const yearlyData: Record<number, number[]> = {
    2009: [4, 68, 24, 3, 2],
    2010: [11, 58, 23, 5, 2],
    2011: [20, 44, 26, 7, 2],
    2012: [32, 34, 24, 7, 2],
    2013: [43, 24, 23, 8, 1],
    2014: [49, 20, 19, 10, 1],
    2015: [55, 17, 16, 10, 1],
    2016: [60, 14, 14, 9, 1],
    2017: [64, 11, 13, 10, 1],
    2018: [67, 9, 11, 11, 1],
    2019: [67, 8, 10, 12, 1],
    2020: [67, 8, 8, 13, 1],
    2021: [65, 8, 7, 17, 1],
    2022: [66, 10, 5, 16, 1],
    2023: [65, 11, 3, 19, 1]
};

const FIRST_YEAR = 2009;
const LAST_YEAR = 2023;
const STEP_MS = 800;

const selectedYear = signal(FIRST_YEAR);
const isPlaying = signal(false);
let timer: ReturnType<typeof setInterval> | null = null;
let subscribers = 0;

function startTimer() {
    if (timer) return;

    timer = setInterval(() => {
        const next = selectedYear() + 1;

        if (next > LAST_YEAR) {
            stopTimer();
            isPlaying.set(false);

            return;
        }

        selectedYear.set(next);
    }, STEP_MS);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

export function togglePlay() {
    if (isPlaying()) {
        isPlaying.set(false);
        stopTimer();

        return;
    }

    if (selectedYear() >= LAST_YEAR) selectedYear.set(FIRST_YEAR);

    isPlaying.set(true);
    startTimer();
}

export function setYear(year: number) {
    selectedYear.set(year);
}

export function useBrowserPlayback() {
    subscribers++;
    if (isPlaying()) startTimer();

    const data = computed(() => browsers.map((browser, i) => ({ browser, share: yearlyData[selectedYear()][i] })));

    inject(DestroyRef).onDestroy(() => {
        subscribers--;
        if (subscribers <= 0) stopTimer();
    });

    return { selectedYear, isPlaying, data, togglePlay, setYear };
}
