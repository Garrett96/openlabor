import { TimeEntry, AppSettings } from '../types';

export function calculateHours(
    clockIn: string,
    clockOut: string | null,
    breakTimeMinutes: number
): number {
    if (!clockIn || !clockOut) return 0;

    const [inHours, inMinutes] = clockIn.split(':').map(Number);
    const [outHours, outMinutes] = clockOut.split(':').map(Number);

    const inDate = new Date(2000, 0, 1, inHours, inMinutes);
    let outDate = new Date(2000, 0, 1, outHours, outMinutes);

    if (outDate < inDate) {
        outDate = new Date(2000, 0, 2, outHours, outMinutes);
    }

    const diffMs = outDate.getTime() - inDate.getTime();
    const totalHours = diffMs / (1000 * 60 * 60) - breakTimeMinutes / 60;

    return Math.round(totalHours * 100) / 100;
}

export function calculateEntryCost(entry: TimeEntry, settings: AppSettings): number {
    if (!entry.clockOut) return 0;

    const rate = settings.wages[entry.category] ?? 0;
    const multiplier = entry.isOvertime ? settings.overtimeMultiplier : 1;

    return entry.totalHours * rate * multiplier;
}

export function calculateHourlyDistribution(
    clockIn: string,
    clockOut: string | null,
    breakTimeMinutes: number
): number[] {
    const hourlyDistribution = new Array(24).fill(0);
    if (!clockIn || !clockOut) return hourlyDistribution;

    const [inHours, inMinutes] = clockIn.split(':').map(Number);
    const [outHours, outMinutes] = clockOut.split(':').map(Number);

    const inDate = new Date(2000, 0, 1, inHours, inMinutes);
    let outDate = new Date(2000, 0, 1, outHours, outMinutes);

    if (outDate < inDate) {
        outDate = new Date(2000, 0, 2, outHours, outMinutes);
    }

    const totalWorkMinutes = (outDate.getTime() - inDate.getTime()) / (1000 * 60) - breakTimeMinutes;
    if (totalWorkMinutes <= 0) return hourlyDistribution;

    let currentTime = new Date(inDate);
    let remainingMinutes = totalWorkMinutes;

    while (remainingMinutes > 0) {
        const hour = currentTime.getHours();
        const nextHour = new Date(currentTime);
        nextHour.setHours(hour + 1, 0, 0, 0);

        const minutesInThisHour = Math.min(
            (nextHour.getTime() - currentTime.getTime()) / (1000 * 60),
                                           remainingMinutes
        );

        hourlyDistribution[hour] += minutesInThisHour / 60;
        currentTime = nextHour;
        remainingMinutes -= minutesInThisHour;
    }

    return hourlyDistribution;
}
