// src/components/SmartTimeInput.tsx

import { useState, useEffect } from 'react';

interface SmartTimeInputProps {
    value: string;
    onChange: (value: string) => void;
    format: '12h' | '24h';
    className?: string;
    placeholder?: string;
    onClick?: (e: React.MouseEvent) => void;
    onSaveWithFormat?: (formattedValue: string) => void;
}

export default function SmartTimeInput({ value, onChange, format, className, placeholder, onClick, onSaveWithFormat }: SmartTimeInputProps) {

    const [text, setText] = useState('');

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

        let hours = 0;
        let minutes = 0;
        let isPM = false;

        if (clean.includes('pm')) {
            isPM = true;
        }
        const numPart = clean.replace(/[ampm]/g, '');

        if (numPart.length === 1) {
            hours = parseInt(numPart, 10);
        } else if (numPart.length === 2) {
            hours = parseInt(numPart, 10);
        } else if (numPart.length === 3) {
            hours = parseInt(numPart[0], 10);
            minutes = parseInt(numPart.slice(1), 10);
        } else if (numPart.length >= 4) {
            hours = parseInt(numPart.slice(0, 2), 10);
            minutes = parseInt(numPart.slice(2, 4), 10);
        }

        if (format === '12h' || isPM || clean.includes('p')) {
            if (isPM && hours < 12) hours += 12;
            if (!isPM && hours === 12) hours = 0;
        }

        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return null;
        }

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
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
            setText(value || '');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            let raw = text.replace(/[^0-9]/g, '');
            let finalVal = text;

            if (/^[0-2][0-9]$/.test(raw)) {
                finalVal = `${raw}:00`;
            } else if (raw.length === 3) {
                const h = parseInt(raw[0], 10);
                const m = parseInt(raw.slice(1), 10);
                finalVal = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            } else if (raw.length >= 4) {
                const h = Math.min(23, parseInt(raw.slice(0, 2), 10));
                const m = Math.min(59, parseInt(raw.slice(2, 4), 10));
                finalVal = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            }

            const isValid = /^[0-2][0-9]:[0-5][0-9]$/.test(finalVal);

            if (isValid) {
                onChange(finalVal);

                if (onSaveWithFormat) {
                    e.preventDefault();
                    onSaveWithFormat(finalVal);
                }
            } else {
                e.preventDefault();
                handleBlur();
            }
        }
    };

    return (
        <input
        type="text"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
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
