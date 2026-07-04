import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ResourceListScreen from './src/screens/ResourceListScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import QRScreen from './src/screens/QRScreen';
import LuckyWheelScreen from './src/screens/LuckyWheelScreen';
import HistorySpinScreen from './src/screens/HistorySpinScreen';
import RecoveryPasswordScreen from './src/screens/RecoveryPasswordScreen';
import { colors, typography } from './src/themes';

const Stack = createNativeStackNavigator();

const extraConfig = Constants.expoConfig?.extra || Constants.manifest?.extra || {};
const luckyWheelUrl = ((extraConfig.expoPublicLuckyWheelUrl as string | undefined) || 'https://gifts.peoplelinkvietnam.com/luckyWheel').replace(/\/$/, '');
const luckyWheelOrigin = luckyWheelUrl.replace(/\/luckyWheel$/, '');

function AppNavigator() {
    const { auth, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer
            linking={{
                prefixes: ['redeemgift://', luckyWheelOrigin],
                config: {
                    screens: {
                        LuckyWheel: {
                            path: 'luckyWheel/spin/:spinGrantId',
                        },
                        RecoveryPassword: 'recoveryPassword',
                    },
                },
            }}
        >
            <Stack.Navigator
                screenOptions={{
                    headerTitleAlign: 'center',
                    headerTitleStyle: {
                        fontSize: typography.lg,
                        fontWeight: '700',
                        color: colors.textPrimary,
                    },
                    headerStyle: {
                        backgroundColor: colors.surface,
                    },
                    headerShadowVisible: true,
                    headerTintColor: colors.primary,
                    contentStyle: {
                        backgroundColor: colors.background,
                    },
                }}
            >
                {auth ? (
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'RedeemGift' }} />
                        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
                        <Stack.Screen name="QR" component={QRScreen} options={{ title: 'Tạo mã QR' }} />
                        <Stack.Screen name="LuckyWheel" component={LuckyWheelScreen} options={{ title: 'Vòng quay' }} />
                        <Stack.Screen name="HistorySpin" component={HistorySpinScreen} options={{ title: 'Lịch sử quay' }} />
                        <Stack.Screen name="RecoveryPassword" component={RecoveryPasswordScreen} options={{ title: 'Khôi phục mật khẩu' }} />
                        <Stack.Screen
                            name="ResourceList"
                            component={ResourceListScreen}
                            options={({ route }: any) => ({ title: route.params?.title || 'Danh sách' })}
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="LuckyWheel" component={LuckyWheelScreen} options={{ title: 'Vòng quay' }} />
                        <Stack.Screen name="RecoveryPassword" component={RecoveryPasswordScreen} options={{ title: 'Khôi phục mật khẩu' }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <AppNavigator />
                <StatusBar style="auto" />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
