// src/utils/time.ts

export function formatTimeDisplay(time: string | null | undefined, format: '12h' | '24h'): string {
    if (!time) return '-';

    const [hoursStr, minutes] = time.split(':');
    const hours = parseInt(hoursStr, 10);

    if (format === '12h') {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12; // Converts 0 to 12, 13 to 1, etc.
        return `${displayHours}:${minutes} ${ampm}`;
    }

    // For 24h, ensure we keep the leading zero if it exists (e.g., "09:00")
    return time;
}
