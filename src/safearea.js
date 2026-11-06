import { Dimensions, Platform, StatusBar, NativeModules } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

const type1 = ['iPhone12','iPhone12Pro','iPhone13','iPhone13Pro','iPhone14','iPhone12ProMax','iPhone13ProMax','iPhone14Plus','iPhone16e']; // 47pt
const type2 = ['iPhone14Pro', 'iPhone14ProMax', 'iPhone15', 'iPhone15Pro', 'iPhone15Plus', 'iPhone15ProMax', 'iPhone16', 'iPhone16Plus', 'iPhone17', 'iPhone17Plus', 'iPhoneAir', 'iPhone17Air']; // 59pt
const type3 = ['iPhoneXSMax','iPhone11ProMax', 'iPhoneX','iPhoneXS','iPhone11Pro'];  // 44pt
const type4 = ['iPhoneXR','iPhone11']; // 48pt
const type5 = ['iPhone12mini', 'iPhone13mini']; // 50pt
const type6 = ['iPhone16Pro', 'iPhone16ProMax', 'iPhone17Pro', 'iPhone17ProMax'] // 62pt
const type = [type1, type2, type3, type4, type5, type6];

const inset = (top, right, bottom, left) => ({ top, right, bottom, left });

// 机型查表旧值：仅 iOS 上 safe-area-context 不可用时的兜底（折叠屏等新机型左右不对称，查表无法表达）
const legacyTableInset = (isLandscape) => {
    if (!isIphoneX()) {
        return inset(20, 0, 0, 0);
    }
    let deviceName = NativeModules.RNDeviceInfo?.model || 'iPhone13';
    deviceName = deviceName.replace(/\s*/g,"");
    if (type1.includes(deviceName)) {
        return isLandscape ? inset(0, 47, 21, 47) : inset(47, 0, 34, 0);
    } else if (type2.includes(deviceName)) {
        return isLandscape ? inset(0, 59, 21, 59) : inset(59, 0, 34, 0);
    } else if (type3.includes(deviceName)) {
        return isLandscape ? inset(0, 44, 21, 44) : inset(44, 0, 34, 0);
    } else if (type4.includes(deviceName)) {
        return isLandscape ? inset(0, 48, 21, 48) : inset(48, 0, 34, 0);
    } else if (type5.includes(deviceName)) {
        return isLandscape ? inset(0, 50, 21, 50) : inset(50, 0, 34, 0);
    } else if (type6.includes(deviceName)) {
        return isLandscape ? inset(0, 62, 21, 62) : inset(62, 0, 34, 0);
    }
    // 未知新机型，默认使用 59pt
    return isLandscape ? inset(0, 59, 21, 59) : inset(59, 0, 34, 0);
};

// 组件内实时值优先（SafeAreaConsumer 注入），模块外直调退回首帧 metrics；
// Android/鸿蒙维持原行为（仅顶部状态栏高度），不引入左右/底部 insets 变化
export function resolveSafeAreaInsets(contextInsets, isTranslucent = false) {
    if (Platform.OS === 'ios') {
        const metrics = contextInsets || (initialWindowMetrics && initialWindowMetrics.insets);
        if (metrics) {
            return inset(metrics.top, metrics.right, metrics.bottom, metrics.left);
        }
        return legacyTableInset(undefined);
    }
    return inset(isTranslucent ? StatusBar.currentHeight : 0, 0, 0, 0);
}

export function getSafeAreaInset(isLandscape = undefined, isTranslucent = false) {
    if (isLandscape === undefined) {
        const {width, height} = Dimensions.get('window');
        isLandscape = width > height;
    }
    return resolveSafeAreaInsets(null, isTranslucent);
}

export function forceInset(top, right, bottom, left) {
    return {
        top: top ? 'always' : 'never',
        right: right ? 'always' : 'never',
        bottom: bottom ? 'always' : 'never',
        left: left ? 'always' : 'never',
    };
}

export function isIphoneX() {
    let deviceName = NativeModules.RNDeviceInfo?.model || '';
    deviceName = deviceName.replace(/\s*/g, "");
    const models = type.flat(1);
    // 兜底：未在列表中的新 iPhone（排除 SE 及 iPhone 1-8 等无刘海机型）
    const isUnknownNotchIphone = deviceName.startsWith('iPhone') &&
        !deviceName.startsWith('iPhoneSE') &&
        !/^iPhone[1-8]([^0-9]|$)/.test(deviceName);
    return (
        Platform.OS === 'ios' &&
        !Platform.isPad &&
        !Platform.isTVOS &&
        (models.includes(deviceName) || isUnknownNotchIphone)
    );
}
