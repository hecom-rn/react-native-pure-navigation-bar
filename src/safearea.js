import { Dimensions, Platform, StatusBar, NativeModules } from 'react-native';
    
export function getSafeAreaInset(isLandscape = undefined, isTranslucent = false) {
    if (isLandscape === undefined) {
        const {width, height} = Dimensions.get('window');
        isLandscape = width > height;
    }
    const inset = (top, right, bottom, left) => ({ top, right, bottom, left });
    if (isIphoneX()) {
        let deviceName = NativeModules.RNDeviceInfo?.model || 'iPhone13';
        deviceName = deviceName.replace(/\s*/g,"");
        const type1 = ['iPhone12','iPhone12Pro','iPhone13','iPhone13Pro','iPhone14','iPhone12ProMax','iPhone13ProMax','iPhone14Plus']; // 47pt
        const type2 = ['iPhone14Pro', 'iPhone14ProMax']; // 59pt
        const type3 = ['iPhoneXSMax','iPhone11ProMax', 'iPhoneX','iPhoneXS','iPhone11Pro'];  // 44pt
        const type4 = ['iPhoneXR','iPhone11']; // 48pt
        const type5 = ['iPhone12mini','iPhone13mini']; // 50pt
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
        } else {
            return isLandscape ? inset(0, 44, 21, 44) : inset(44, 0, 34, 0);
        }
    } else if (Platform.OS === 'ios') {
        return inset(20, 0, 0, 0);
    } else {
        return inset(isTranslucent ? StatusBar.currentHeight : 0, 0, 0, 0);
    }
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
    const { width, height } = Dimensions.get('window');
    const edge = Math.max(width, height);
    return (
        Platform.OS === 'ios' &&
        !Platform.isPad &&
        !Platform.isTVOS &&
        (
            edge === 812 || // X + XS
            edge === 896 ||  // XR + XS Max
            edge === 926 || // 12 pro max + 14 + 14 plus
            edge === 844 || // 12 pro 12
            edge === 932 || // 14 pro max 
            edge === 852 || // 14 pro
            edge === 780 // 12 mini
        )
    );
}