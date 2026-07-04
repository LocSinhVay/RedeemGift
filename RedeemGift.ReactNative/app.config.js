require('dotenv').config();

const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://gifts.peoplelinkvietnam.com/api";
const luckyWheelUrl = process.env.EXPO_PUBLIC_LUCKY_WHEEL_URL || "https://gifts.peoplelinkvietnam.com/luckyWheel";

module.exports = ({ config }) => ({
    ...config,
    name: "RedeemGift Mobile",
    slug: "redeemgift-mobile",
    owner: "testwebgiken",
    version: "1.0.0",
    scheme: "redeemgift",
    orientation: "portrait",
    userInterfaceStyle: "light",
    platforms: ["ios", "android", "web"],
    icon: "./assets/images/icon.png",
    splash: {
        image: "./assets/images/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#eef2f7",
    },

    android: {
        ...config.android,
        package: "com.peoplelinkvietnam.redeemgift",
        intentFilters: [
            ...(config.android?.intentFilters || []),
            {
                action: "VIEW",
                autoVerify: true,
                data: [
                    {
                        scheme: "https",
                        host: "gifts.peoplelinkvietnam.com",
                        pathPrefix: "/recoveryPassword",
                    },
                    {
                        scheme: "https",
                        host: "gifts.peoplelinkvietnam.com",
                        pathPrefix: "/luckyWheel",
                    },
                ],
                category: ["BROWSABLE", "DEFAULT"],
            },
        ],
        adaptiveIcon: {
            foregroundImage: "./assets/images/adaptive-icon.png",
            backgroundColor: "#1e40af",
        },
    },

    ios: {
        ...config.ios,
        bundleIdentifier: "com.peoplelinkvietnam.redeemgift",
        icon: "./assets/images/icon.png",
        associatedDomains: [
            ...(config.ios?.associatedDomains || []),
            "applinks:gifts.peoplelinkvietnam.com",
        ],
    },

    web: {
        ...config.web,
        favicon: "./assets/images/icon.png",
    },

    extra: {
        ...config.extra,
        expoPublicApiUrl: apiUrl,
        expoPublicLuckyWheelUrl: luckyWheelUrl,
        eas: {
            projectId: "193f4c57-b67b-4cf5-8fac-b37331557009",
        },
    },
});
