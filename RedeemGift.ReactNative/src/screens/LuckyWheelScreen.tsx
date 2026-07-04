import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Easing,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    Vibration,
    View,
} from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import Svg, { Circle, G, Path, Text as SvgText, TSpan } from 'react-native-svg';
import ApiService from '../services/ApiService';

const tickSound = require('../../assets/sounds/tick.mp3');
const winSound = require('../../assets/sounds/win.mp3');

type PrizeItem = {
    PrizeID: number;
    PrizeName: string;
};

type Props = {
    route: {
        params?: {
            spinGrantId?: string;
        };
    };
};

type WheelProps = {
    prizes: PrizeItem[];
    spinCount: number;
    resultPrizeId: number | null;
    spinning: boolean;
    disabled?: boolean;
    onRequestSpin: () => void;
    onSpinStart: () => void;
    onSpinEnd: (prizeName: string) => void;
};

type ConfettiParticle = {
    color: string;
    delay: number;
    size: number;
    x: number;
    y: number;
    rotate: string;
};

const onlyPhone = (value: string) => value.replace(/[^0-9]/g, '');

const wheelPalette = [
    '#ef4444',
    '#f59e0b',
    '#10b981',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
    '#f97316',
    '#6366f1',
    '#14b8a6',
    '#eab308',
];

const confettiPalette = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#8b5cf6', '#ec4899'];

const polarToCartesian = (cx: number, cy: number, radius: number, angle: number) => {
    const radians = (angle * Math.PI) / 180;
    return {
        x: cx + radius * Math.cos(radians),
        y: cy + radius * Math.sin(radians),
    };
};

const createSegmentPath = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, radius, startAngle);
    const end = polarToCartesian(cx, cy, radius, endAngle);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
};

const wrapPrizeName = (value: string) => {
    const words = value.trim().split(/\s+/);
    const lines: string[] = [];
    let current = '';

    words.forEach((word) => {
        const next = current ? `${current} ${word}` : word;
        if (next.length <= 11) {
            current = next;
            return;
        }

        if (current) lines.push(current);
        current = word;
    });

    if (current) lines.push(current);
    return lines.slice(0, 3);
};

const createConfettiParticles = (width: number): ConfettiParticle[] =>
    Array.from({ length: 34 }).map((_, index) => ({
        color: confettiPalette[index % confettiPalette.length],
        delay: (index % 10) * 55,
        size: 7 + (index % 4) * 2,
        x: (index % 2 === 0 ? 1 : -1) * (35 + ((index * 37) % Math.max(80, width / 2))),
        y: -(150 + ((index * 29) % 260)),
        rotate: `${(index * 47) % 360}deg`,
    }));

function CelebrationOverlay({
    prizeName,
    visible,
    onClose,
}: {
    prizeName: string;
    visible: boolean;
    onClose: () => void;
}) {
    const screenWidth = Dimensions.get('window').width;
    const progress = useRef(new Animated.Value(0)).current;
    const winPlayer = useAudioPlayer(winSound);
    const particles = useMemo(() => createConfettiParticles(screenWidth), [screenWidth]);

    useEffect(() => {
        if (!visible) return;

        winPlayer.volume = 0.85;
        winPlayer.seekTo(0);
        winPlayer.play();

        progress.setValue(0);
        Animated.timing(progress, {
            toValue: 1,
            duration: 1800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [progress, visible, winPlayer]);

    return (
        <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
            <View style={styles.celebrationBackdrop}>
                <View pointerEvents="none" style={styles.confettiLayer}>
                    {particles.map((particle, index) => {
                        const delayed = Animated.subtract(progress, particle.delay / 1800).interpolate({
                            inputRange: [0, 0.001, 1],
                            outputRange: [0, 0, 1],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.confettiParticle,
                                    {
                                        width: particle.size,
                                        height: particle.size * 1.5,
                                        backgroundColor: particle.color,
                                        left: screenWidth / 2,
                                        bottom: 110,
                                        opacity: delayed.interpolate({
                                            inputRange: [0, 0.15, 0.85, 1],
                                            outputRange: [0, 1, 1, 0],
                                        }),
                                        transform: [
                                            {
                                                translateX: delayed.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, particle.x],
                                                }),
                                            },
                                            {
                                                translateY: delayed.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, particle.y],
                                                }),
                                            },
                                            {
                                                rotate: delayed.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0deg', particle.rotate],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            />
                        );
                    })}
                </View>

                <View style={styles.celebrationCard}>
                    <Text style={styles.celebrationTitle}>CHÚC MỪNG!</Text>
                    <Text style={styles.celebrationLabel}>Bạn đã trúng thưởng</Text>
                    <Text style={styles.celebrationPrize}>{prizeName}</Text>
                    <Pressable onPress={onClose} style={styles.celebrationButton}>
                        <Text style={styles.celebrationButtonText}>Tiếp tục</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

function LuckyWheel({
    prizes,
    spinCount,
    resultPrizeId,
    spinning,
    disabled,
    onRequestSpin,
    onSpinStart,
    onSpinEnd,
}: WheelProps) {
    const { width, height } = useWindowDimensions();
    const size = Math.max(220, Math.min(300, width - 78, height * 0.36));
    const innerSize = size - 32;
    const center = innerSize / 2;
    const radius = center - 4;
    const segmentAngle = prizes.length ? 360 / prizes.length : 360;
    const rotation = useRef(new Animated.Value(0)).current;
    const bulbPulse = useRef(new Animated.Value(0)).current;
    const buttonPulse = useRef(new Animated.Value(0)).current;
    const rotationValue = useRef(0);
    const tickSegment = useRef(0);
    const isAnimating = useRef(false);
    const [selectedColor, setSelectedColor] = useState('#9ca3af');
    const tickPlayer = useAudioPlayer(tickSound);

    useEffect(() => {
        const id = rotation.addListener(({ value }) => {
            rotationValue.current = value;
            if (!isAnimating.current || !prizes.length) return;

            const nextSegment = Math.floor((((value % 360) + 360) % 360) / segmentAngle);
            if (nextSegment !== tickSegment.current) {
                tickSegment.current = nextSegment;
                tickPlayer.volume = 0.75;
                tickPlayer.seekTo(0);
                tickPlayer.play();
                Vibration.vibrate(7);
            }
        });

        return () => rotation.removeListener(id);
    }, [prizes.length, rotation, segmentAngle, tickPlayer]);

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(bulbPulse, {
                    toValue: 1,
                    duration: spinning ? 280 : 820,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(bulbPulse, {
                    toValue: 0,
                    duration: spinning ? 280 : 820,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ])
        );

        loop.start();
        return () => loop.stop();
    }, [bulbPulse, spinning]);

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(buttonPulse, {
                    toValue: 1,
                    duration: 1050,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(buttonPulse, {
                    toValue: 0,
                    duration: 1050,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ])
        );

        if (!disabled && !spinning && spinCount > 0) {
            loop.start();
        } else {
            buttonPulse.setValue(0);
        }

        return () => loop.stop();
    }, [buttonPulse, disabled, spinCount, spinning]);

    const colors = useMemo(
        () => prizes.map((_, index) => wheelPalette[index % wheelPalette.length]),
        [prizes]
    );

    useEffect(() => {
        if (resultPrizeId === null || spinning || prizes.length === 0) return;

        const prizeIndex = prizes.findIndex((item) => item.PrizeID === resultPrizeId);
        if (prizeIndex < 0) {
            Alert.alert('Thông báo', 'Giải thưởng trả về không nằm trong danh sách vòng quay.');
            return;
        }

        onSpinStart();
        Vibration.vibrate(18);
        isAnimating.current = true;

        const centerAngle = -90 + prizeIndex * segmentAngle + segmentAngle / 2;
        const targetRotation = -90 - centerAngle;
        const current = rotationValue.current;
        const currentNormalized = ((current % 360) + 360) % 360;
        const targetNormalized = ((targetRotation % 360) + 360) % 360;
        const delta = (targetNormalized - currentNormalized + 360) % 360;
        const fullTurns = 360 * (15 + Math.floor(Math.random() * 6));
        const finalRotation = current + fullTurns + delta;
        tickSegment.current = Math.floor(currentNormalized / segmentAngle);

        Animated.timing(rotation, {
            toValue: finalRotation,
            duration: 4500 + Math.floor(Math.random() * 800),
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(() => {
            isAnimating.current = false;
            const normalized = finalRotation % 360;
            rotation.setValue(normalized);
            rotationValue.current = normalized;
            setSelectedColor(colors[prizeIndex] || '#7c3aed');
            Vibration.vibrate([0, 90, 80, 130]);
            onSpinEnd(prizes[prizeIndex].PrizeName);
        });
    }, [colors, onSpinEnd, onSpinStart, prizes, resultPrizeId, rotation, segmentAngle, spinning]);

    const rotate = rotation.interpolate({
        inputRange: [0, 360],
        outputRange: ['0deg', '360deg'],
    });
    const buttonScale = buttonPulse.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.06],
    });

    return (
        <View style={[styles.wheelFrame, { width: size, height: size }]}>
            <View style={styles.outerGoldRing} />
            <View style={styles.innerShadowRing} />
            <View style={styles.wheelGlow} />
            {Array.from({ length: 28 }).map((_, index) => {
                const angle = (index / 28) * 2 * Math.PI;
                const bulbSize = Math.max(8, size / 34);
                const bulbRadius = size / 2 - bulbSize * 0.9;
                const x = size / 2 + bulbRadius * Math.cos(angle) - bulbSize / 2;
                const y = size / 2 + bulbRadius * Math.sin(angle) - bulbSize / 2;

                return (
                    <Animated.View
                        key={index}
                        style={[
                            styles.bulb,
                            {
                                width: bulbSize,
                                height: bulbSize,
                                borderRadius: bulbSize / 2,
                                left: x,
                                top: y,
                                opacity: bulbPulse.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: index % 2 === 0 ? [1, 0.45] : [0.45, 1],
                                }),
                                transform: [
                                    {
                                        scale: bulbPulse.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: spinning ? [1.18, 0.82] : [1, 0.88],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    />
                );
            })}

            <View style={styles.pointer} />

            <Animated.View style={[styles.wheelCanvas, { width: innerSize, height: innerSize, transform: [{ rotate }] }]}>
                <Svg width={innerSize} height={innerSize}>
                    {prizes.map((prize, index) => {
                        const startAngle = -90 + index * segmentAngle;
                        const endAngle = startAngle + segmentAngle;
                        const textAngle = startAngle + segmentAngle / 2;
                        const textPosition = polarToCartesian(center, center, radius * 0.62, textAngle);
                        const lines = wrapPrizeName(prize.PrizeName);
                        const readableTextAngle = textAngle > 90 && textAngle < 270 ? textAngle + 180 : textAngle;
                        const segmentTextSize = prizes.length > 6 ? 9 : 11;

                        return (
                            <G key={`${prize.PrizeID}-${index}`}>
                                <Path
                                    d={createSegmentPath(center, center, radius, startAngle, endAngle)}
                                    fill={colors[index]}
                                    stroke="#ffffff"
                                    strokeWidth={3}
                                />
                                <SvgText
                                    x={textPosition.x}
                                    y={textPosition.y - (lines.length - 1) * 7}
                                    fill="#ffffff"
                                    fontSize={segmentTextSize}
                                    fontWeight="800"
                                    textAnchor="middle"
                                    rotation={readableTextAngle}
                                    originX={textPosition.x}
                                    originY={textPosition.y}
                                >
                                    {lines.map((line, lineIndex) => (
                                        <TSpan key={lineIndex} x={textPosition.x} dy={lineIndex === 0 ? 0 : segmentTextSize + 3}>
                                            {line}
                                        </TSpan>
                                    ))}
                                </SvgText>
                            </G>
                        );
                    })}
                    <Circle cx={center} cy={center} r={radius - 2} fill="none" stroke="rgba(255,255,255,0.82)" strokeWidth={3} />
                    <Circle cx={center} cy={center} r={radius * 0.34} fill="rgba(15,23,42,0.08)" />
                    <Circle cx={center} cy={center} r={radius * 0.2} fill="#ffffff" opacity={0.22} />
                </Svg>
            </Animated.View>

            <Animated.View
                style={[
                    styles.centerButton,
                    {
                        width: size * 0.25,
                        height: size * 0.25,
                        borderRadius: (size * 0.25) / 2,
                        backgroundColor: spinCount > 0 ? '#111827' : '#9ca3af',
                        shadowColor: selectedColor,
                    },
                    (disabled || spinning || spinCount <= 0 || prizes.length === 0) && styles.disabledButton,
                    { transform: [{ scale: buttonScale }] },
                ]}
            >
                <Pressable
                    disabled={disabled || spinning || spinCount <= 0 || prizes.length === 0}
                    onPress={onRequestSpin}
                    style={styles.centerPressable}
                >
                    {disabled || spinning ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.centerButtonText}>{spinCount > 0 ? 'Quay' : 'Hết lượt'}</Text>
                    )}
                </Pressable>
            </Animated.View>
        </View>
    );
}

export default function LuckyWheelScreen({ route }: Props) {
    const { width } = useWindowDimensions();
    const isWebWide = Platform.OS === 'web' && width >= 900;
    const [spinGrantId, setSpinGrantId] = useState(route.params?.spinGrantId || '');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isInfoSubmitted, setIsInfoSubmitted] = useState(false);
    const [spinCount, setSpinCount] = useState(0);
    const [prizes, setPrizes] = useState<PrizeItem[]>([]);
    const [backendPrizeId, setBackendPrizeId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [isSpinRequesting, setIsSpinRequesting] = useState(false);
    const [message, setMessage] = useState('');
    const [celebrationPrize, setCelebrationPrize] = useState('');

    const loadSpinInfo = useCallback(async () => {
        if (!spinGrantId.trim()) {
            setPrizes([]);
            setSpinCount(0);
            return;
        }

        try {
            setIsLoading(true);
            const response = await new ApiService('/claimSpin/SpinInfoBySpinGrantIdGetDetail', 'get', true).request<any>(
                {},
                { spinGrantId: spinGrantId.trim() }
            );
            const data = Array.isArray(response?.Data) ? response.Data : [];
            if (!data.length) {
                Alert.alert('Thông báo', response?.Message || 'Không tìm thấy thông tin quay thưởng.');
                setPrizes([]);
                setSpinCount(0);
                return;
            }

            setPrizes(data.map((item: any) => ({ PrizeID: item.PrizeID, PrizeName: item.PrizeName })));
            setSpinCount(Number(data[0].SpinsGranted || 0));
        } catch (error: any) {
            Alert.alert('Lỗi', error?.message || 'Không thể tải thông tin quay.');
        } finally {
            setIsLoading(false);
        }
    }, [spinGrantId]);

    useEffect(() => {
        loadSpinInfo();
    }, [loadSpinInfo]);

    const claimSpins = async () => {
        if (!spinGrantId.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập mã quay.');
            return;
        }
        if (!name.trim() || !phone.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập họ tên và số điện thoại.');
            return;
        }

        const formData = new FormData();
        formData.append('SpinGrantID', spinGrantId.trim());
        formData.append('CustomerName', name.trim());
        formData.append('CustomerPhone', phone.trim());

        try {
            setIsLoading(true);
            const response = await new ApiService('/claimSpin/ClaimSpins', 'post').requestMultipart(formData);
            if (response?.Data >= 0 || response?.Status === 'Success') {
                setIsInfoSubmitted(true);
                setMessage('');
                return;
            }

            Alert.alert('Lỗi', response?.Message || 'Lưu thông tin thất bại.');
        } catch (error: any) {
            Alert.alert('Lỗi', error?.message || 'Không thể lưu thông tin.');
        } finally {
            setIsLoading(false);
        }
    };

    const spinWheel = async () => {
        if (!spinGrantId.trim() || isSpinning || isSpinRequesting || spinCount <= 0) return;

        try {
            setIsSpinRequesting(true);
            setBackendPrizeId(null);
            setMessage('');
            const response = await new ApiService('/claimSpin/SpinWheel', 'post', true).request<any>(
                {},
                { spinGrantId: spinGrantId.trim() }
            );
            if (response?.Data) {
                setBackendPrizeId(Number(response.Data.PrizeID));
                setSpinCount(Number(response.Data.SpinsRemaining || 0));
                setMessage('Đang quay...\nChúc bạn may mắn!');
                return;
            }

            setMessage(response?.Message || 'Có lỗi khi quay.');
        } catch (error: any) {
            setMessage(error?.message || 'Có lỗi khi quay.');
        } finally {
            setIsSpinRequesting(false);
        }
    };

    return (
        <SafeAreaView style={styles.page}>
            <ScrollView contentContainerStyle={[styles.content, isWebWide && styles.webContent]}>
                <View style={[styles.card, isWebWide && styles.webCard]}>
                    <Text style={styles.title}>Chương trình đổi quà</Text>

                    <Text style={styles.label}>Mã quay</Text>
                    <View style={styles.inlineRow}>
                        <TextInput
                            autoCapitalize="none"
                            value={spinGrantId}
                            onChangeText={(value) => {
                                setSpinGrantId(value);
                                setIsInfoSubmitted(false);
                            }}
                            style={[styles.input, styles.inlineInput]}
                            placeholder="Nhập mã quay"
                        />
                        <Pressable onPress={loadSpinInfo} style={styles.reloadButton}>
                            <Text style={styles.reloadText}>Tải</Text>
                        </Pressable>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator />
                            <Text style={styles.muted}>Đang tải...</Text>
                        </View>
                    ) : null}

                    {!isInfoSubmitted ? (
                        <>
                            <Text style={styles.label}>Họ tên</Text>
                            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Nhập họ tên" />

                            <Text style={styles.label}>Số điện thoại</Text>
                            <TextInput
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={(value) => setPhone(onlyPhone(value))}
                                style={styles.input}
                                placeholder="Nhập số điện thoại"
                            />

                            <View style={styles.spinBadge}>
                                <Text style={styles.spinBadgeLabel}>Số lượt quay thưởng</Text>
                                <Text style={styles.spinBadgeValue}>{spinCount}</Text>
                            </View>

                            <Pressable
                                disabled={isLoading || spinCount <= 0}
                                onPress={claimSpins}
                                style={[styles.primaryButton, (isLoading || spinCount <= 0) && styles.disabledButton]}
                            >
                                <Text style={styles.primaryText}>Xác nhận</Text>
                            </Pressable>
                        </>
                    ) : (
                        <>
                            <Text style={styles.remainingText}>BẠN CÒN {spinCount} LƯỢT QUAY THƯỞNG</Text>

                            <LuckyWheel
                                prizes={prizes}
                                spinCount={spinCount}
                                resultPrizeId={backendPrizeId}
                                spinning={isSpinning}
                                disabled={isSpinRequesting}
                                onRequestSpin={spinWheel}
                                onSpinStart={() => setIsSpinning(true)}
                                onSpinEnd={(prizeName) => {
                                    setIsSpinning(false);
                                    setBackendPrizeId(null);
                                    setMessage(`Chúc mừng!\nBạn nhận được 01 ${prizeName}`);
                                    setCelebrationPrize(prizeName);
                                }}
                            />

                            {message ? <Text style={styles.message}>{message}</Text> : null}
                        </>
                    )}
                </View>
            </ScrollView>
            <CelebrationOverlay
                prizeName={celebrationPrize}
                visible={!!celebrationPrize}
                onClose={() => setCelebrationPrize('')}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: '#eef2f7' },
    content: { flexGrow: 1, padding: 12, paddingBottom: 28 },
    webContent: {
        alignItems: 'center',
        paddingVertical: 28,
    },
    card: {
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 12,
    },
    webCard: {
        width: '100%',
        maxWidth: 520,
    },
    title: {
        textAlign: 'center',
        textTransform: 'uppercase',
        color: '#0f172a',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 12,
    },
    label: {
        color: '#1f2937',
        fontWeight: '800',
        marginBottom: 5,
        marginTop: 8,
    },
    inlineRow: { flexDirection: 'row', gap: 8 },
    inlineInput: { flex: 1 },
    input: {
        minHeight: 46,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 6,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
    },
    reloadButton: {
        minWidth: 64,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: '#e2e8f0',
    },
    reloadText: { color: '#0f172a', fontWeight: '800' },
    loadingBox: { alignItems: 'center', padding: 12, gap: 6 },
    muted: { color: '#64748b' },
    spinBadge: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        padding: 16,
        marginTop: 14,
    },
    spinBadgeLabel: { color: '#64748b', fontWeight: '800', textTransform: 'uppercase' },
    spinBadgeValue: { color: '#dc2626', fontSize: 42, fontWeight: '800' },
    primaryButton: {
        minHeight: 50,
        marginTop: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: '#7c3aed',
    },
    disabledButton: { opacity: 0.5 },
    primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    remainingText: {
        color: '#dc2626',
        fontSize: 17,
        fontWeight: '900',
        marginBottom: 12,
        marginTop: 4,
        textAlign: 'center',
    },
    wheelFrame: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        borderWidth: 0,
        backgroundColor: '#fff7ed',
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
        marginVertical: 8,
    },
    outerGoldRing: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        borderRadius: 999,
        borderWidth: 10,
        borderColor: '#fbbf24',
        backgroundColor: '#fffbeb',
        zIndex: 0,
    },
    innerShadowRing: {
        position: 'absolute',
        top: 17,
        right: 17,
        bottom: 17,
        left: 17,
        borderRadius: 999,
        borderWidth: 5,
        borderColor: '#ffffff',
        zIndex: 1,
    },
    wheelGlow: {
        position: 'absolute',
        top: 11,
        right: 11,
        bottom: 11,
        left: 11,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: 'rgba(251,191,36,0.45)',
        zIndex: 2,
    },
    wheelCanvas: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        overflow: 'hidden',
        zIndex: 2,
    },
    bulb: {
        position: 'absolute',
        backgroundColor: '#fff8d6',
        borderWidth: 1,
        borderColor: '#facc15',
        shadowColor: '#facc15',
        shadowOpacity: 0.55,
        shadowRadius: 5,
        elevation: 4,
        zIndex: 4,
    },
    pointer: {
        position: 'absolute',
        top: -3,
        zIndex: 7,
        width: 0,
        height: 0,
        borderLeftWidth: 18,
        borderRightWidth: 18,
        borderTopWidth: 36,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#f8fafc',
        shadowColor: '#0f172a',
        shadowOpacity: 0.22,
        shadowRadius: 7,
        shadowOffset: { width: 0, height: 3 },
        elevation: 9,
    },
    centerButton: {
        position: 'absolute',
        zIndex: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.24,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 10,
        borderWidth: 4,
        borderColor: '#ffffff',
    },
    centerPressable: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
    },
    centerButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '900',
    },
    message: {
        marginTop: 14,
        color: '#0f172a',
        textAlign: 'center',
        fontWeight: '800',
        fontSize: 17,
        lineHeight: 24,
    },
    celebrationBackdrop: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15,23,42,0.72)',
        padding: 22,
    },
    confettiLayer: {
        ...StyleSheet.absoluteFillObject,
    },
    confettiParticle: {
        position: 'absolute',
        borderRadius: 2,
    },
    celebrationCard: {
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        backgroundColor: '#7c2d12',
        paddingHorizontal: 22,
        paddingVertical: 28,
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 12,
    },
    celebrationTitle: {
        color: '#fee2e2',
        fontSize: 30,
        fontWeight: '900',
        textAlign: 'center',
        textShadowColor: '#ef4444',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 14,
    },
    celebrationLabel: {
        color: '#fff7ed',
        fontSize: 17,
        fontWeight: '700',
        marginTop: 12,
        textAlign: 'center',
    },
    celebrationPrize: {
        color: '#fde047',
        fontSize: 25,
        fontWeight: '900',
        marginTop: 10,
        textAlign: 'center',
        textShadowColor: '#f97316',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
    },
    celebrationButton: {
        minHeight: 44,
        minWidth: 132,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: '#facc15',
        marginTop: 24,
        paddingHorizontal: 18,
    },
    celebrationButtonText: {
        color: '#451a03',
        fontWeight: '900',
    },
});
