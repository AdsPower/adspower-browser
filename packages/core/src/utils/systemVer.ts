import os from "os";

/** AdsPower fingerprint_config.random_ua.ua_system_version 可选值 */
export const UA_SYSTEM_VERSIONS = [
    'Android 9', 'Android 10', 'Android 11', 'Android 12', 'Android 13', 'Android 14', 'Android 15',
    'iOS 14', 'iOS 15', 'iOS 16', 'iOS 17', 'iOS 18',
    'Windows 7', 'Windows 8', 'Windows 10', 'Windows 11',
    'Mac OS X 10', 'Mac OS X 11', 'Mac OS X 12', 'Mac OS X 13', 'Mac OS X 14', 'Mac OS X 15', 'Mac OS X 26',
    'Mac OS X', 'Windows', 'iOS', 'Android', 'Linux',
  ] as const;

export type UaSystemVersion = (typeof UA_SYSTEM_VERSIONS)[number];

type OsInfo = {
    platform?: string;
    release?: string;
};

/**
 * 根据当前操作系统信息匹配 ua_system_version。
 * 仅处理 Windows / macOS / Linux，其他平台返回 null。
 */
export function getUaSystemVersionFromOs(info: OsInfo = {}): UaSystemVersion | null {
    const platform = info.platform ?? os.platform();
    const release = info.release ?? os.release();

    if (platform === "linux") {
        return "Linux";
    }

    if (platform === "win32") {
        return matchWindowsVersion(release);
    }

    if (platform === "darwin") {
        return matchMacVersion(release);
    }

    return null;
}

function matchWindowsVersion(release: string): UaSystemVersion {
    const [majorStr, minorStr = "0", buildStr = "0"] = release.split(".");
    const major = Number(majorStr);
    const minor = Number(minorStr);
    const build = Number(buildStr);

    if (major === 6) {
        if (minor === 1) return "Windows 7";
        if (minor === 2 || minor === 3) return "Windows 8";
    }

    if (major === 10 && minor === 0) {
        return build >= 22000 ? "Windows 11" : "Windows 10";
    }

    return "Windows";
}

function matchMacVersion(release: string): UaSystemVersion {
    const darwinMajor = Number(release.split(".")[0]);

    if (darwinMajor < 20) return "Mac OS X 10";

    const darwinToMac: Record<number, UaSystemVersion> = {
        20: "Mac OS X 11",
        21: "Mac OS X 12",
        22: "Mac OS X 13",
        23: "Mac OS X 14",
        24: "Mac OS X 15",
        25: "Mac OS X 26", // macOS Tahoe 26，Darwin 仍为 25.x
    };

    return darwinToMac[darwinMajor] ?? "Mac OS X";
}
