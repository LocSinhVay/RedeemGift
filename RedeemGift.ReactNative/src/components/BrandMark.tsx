import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

type Props = {
    size?: number;
};

export default function BrandMark({ size = 64 }: Props) {
    return (
        <Svg width={size} height={size} viewBox="0 0 96 96">
            <Defs>
                <LinearGradient id="brandBg" x1="12" y1="8" x2="84" y2="88">
                    <Stop offset="0" stopColor="#2563eb" />
                    <Stop offset="0.55" stopColor="#14b8a6" />
                    <Stop offset="1" stopColor="#f59e0b" />
                </LinearGradient>
                <LinearGradient id="giftFill" x1="28" y1="30" x2="68" y2="76">
                    <Stop offset="0" stopColor="#ffffff" />
                    <Stop offset="1" stopColor="#e0f2fe" />
                </LinearGradient>
            </Defs>
            <Rect x="8" y="8" width="80" height="80" rx="20" fill="url(#brandBg)" />
            <Circle cx="74" cy="22" r="7" fill="#fde047" opacity="0.95" />
            <Path
                d="M28 45h40v28c0 3.3-2.7 6-6 6H34c-3.3 0-6-2.7-6-6V45Z"
                fill="url(#giftFill)"
            />
            <Path d="M24 34h48v15H24V34Z" fill="#ffffff" />
            <Path d="M44 34h8v45h-8V34Z" fill="#f97316" />
            <Path d="M24 45h48v6H24v-6Z" fill="#bae6fd" opacity="0.8" />
            <Path
                d="M44 34c-9-1-16-5-16-11 0-4.4 3.6-8 8-8 6.7 0 10.8 8.6 12 15"
                fill="none"
                stroke="#ffffff"
                strokeWidth="7"
                strokeLinecap="round"
            />
            <Path
                d="M52 34c9-1 16-5 16-11 0-4.4-3.6-8-8-8-6.7 0-10.8 8.6-12 15"
                fill="none"
                stroke="#ffffff"
                strokeWidth="7"
                strokeLinecap="round"
            />
            <Path d="M44 31h8v48h-8V31Z" fill="#f97316" />
        </Svg>
    );
}
