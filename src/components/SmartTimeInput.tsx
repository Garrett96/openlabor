// src/components/SmartTimeInput.tsx

import { useState, useEffect } from 'react';

interface SmartTimeInputProps {
    value: string;
    onChange: (value: string) => void;
    format: '12h' | '24h';
    className?: string;
    placeholder?: string;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    onClick?: (e: React.MouseEvent) => void;
}

export default function SmartTimeInput({ value, onChange, format, className, placeholder, onKeyDown, onClick }: SmartTimeInputProps) {
    const [text, setText] = useState('');

    // Convert internal 24h value to display format
    useEffect(() => {
        if (!value) {
            setText('');
            return;
        }

        const [hStr, mStr] = value.split(':');
        const h = parseInt(hStr, 10);
        const m = parseInt(mStr, 10);

        if (format === '12h') {
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayH = h % 12 || 12;
            setText(`${displayH}:${m.toString().padStart(2, '0')} ${ampm}`);
        } else {
            setText(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        }
    }, [value, format]);

    const parseTimeInput = (input: string): string | null => {
        const clean = input.toLowerCase().trim().replace(/[^0-9ampm]/g, '');

        // Handle various formats
        let hours = 0;
        let minutes = 0;
        let isPM = false;

        // Extract AM/PM
        if (clean.includes('pm')) {
            isPM = true;
        }
        const numPart = clean.replace(/[ampm]/g, '');

        // Parse numbers
        if (numPart.length === 1) {
            // "1" -> 01:00
            hours = parseInt(numPart, 10);
        } else if (numPart.length === 2) {
            // "14" -> 14:00 or "1p" -> 13:00
            hours = parseInt(numPart, 10);
        } else if (numPart.length === 3) {
            // "130" -> 01:30
            hours = parseInt(numPart[0], 10);
            minutes = parseInt(numPart.slice(1), 10);
        } else if (numPart.length >= 4) {
            // "1430" -> 14:30
            hours = parseInt(numPart.slice(0, 2), 10);
            minutes = parseInt(numPart.slice(2, 4), 10);
        }

        // Convert 12h to 24h if needed
        if (format === '12h' || isPM || clean.includes('p')) {
            if (isPM && hours < 12) hours += 12;
            if (!isPM && hours === 12) hours = 0;
        }

        // Validate
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return null;
        }

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
        // Don't update parent state until blur - let them type freely
    };

    const handleBlur = () => {
        if (!text) {
            onChange('');
            return;
        }

        const parsed = parseTimeInput(text);
        if (parsed) {
            onChange(parsed);
        } else {
            // Revert to last valid value
            setText(value || '');
        }
    };

    return (
        <input
        type="text"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        onClick={onClick}
        className={className}
        placeholder={placeholder || (format === '12h' ? '2:30 PM' : '14:30')}
        style={{
            fontVariantNumeric: 'tabular-nums',
            width: '100%',
            minWidth: '80px',
            boxSizing: 'border-box'
        }}
        />
    );
}
