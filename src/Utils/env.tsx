import { Capacitor } from "@capacitor/core";

export const envappid = {
    ios: {
        appId: "1:927215357855:ios:4dde20364c38ebfcb437aa",
    },
    android: {
        appId: "1:927215357855:android:e79f62809271304cb437aa",
    }
}

export const getenvappid = () => Capacitor.getPlatform() === 'ios' ? envappid.ios : envappid.android;


export const envkeygoogle = {
    ios: {
        key: "927215357855-qhi4gr60faskqqfshb7csis68k8lhndl.apps.googleusercontent.com",
    },
    android: {
        key: "927215357855-2dpvv8jbea0h2lacb8a4j1i6f0cml6je.apps.googleusercontent.com",
    },
    web: {
        key: "927215357855-c492jdr8kkfgadp4uft0ijgae28lmh8t.apps.googleusercontent.com",
    }
}

export const getenvkeygoogle = () => {
    const platform = Capacitor.getPlatform();
    return platform === 'ios'
        ? envkeygoogle.ios
        : platform === 'web'
            ? envkeygoogle.web
            : envkeygoogle.android;
};