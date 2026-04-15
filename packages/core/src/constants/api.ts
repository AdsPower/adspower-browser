import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { PORT, API_KEY, CONFIG } from './config.js';
import { LOCAL_API_CONTRACTS } from './localApiContracts.js';

/** 若 >0：任意两次经 `getApiClient()` 发往 Local API 的请求之间至少间隔该毫秒数（串行化，避免并发绕过）。 */
function readLocalApiMinIntervalMs(): number {
    const raw = process.env.ADSP_LOCAL_API_MIN_INTERVAL_MS?.trim() ?? '';
    if (!raw) {
        return 0;
    }
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

let localApiThrottleLock: Promise<void> = Promise.resolve();
let localApiLastRequestStartMs = 0;

async function sleep(ms: number): Promise<void> {
    await new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function throttleLocalApiRequest(): Promise<void> {
    const gapMs = readLocalApiMinIntervalMs();
    if (gapMs <= 0) {
        return;
    }
    const prev = localApiThrottleLock;
    let release!: () => void;
    localApiThrottleLock = new Promise<void>((resolve) => {
        release = resolve;
    });
    await prev;
    try {
        const now = Date.now();
        const earliest = localApiLastRequestStartMs === 0 ? now : localApiLastRequestStartMs + gapMs;
        const waitMs = Math.max(0, earliest - now);
        if (waitMs > 0) {
            await sleep(waitMs);
        }
        localApiLastRequestStartMs = Date.now();
    } finally {
        release();
    }
}

function isLocalApiRequestUrl(url: string | undefined): boolean {
    if (!url) {
        return false;
    }
    try {
        const u = new URL(url, 'http://127.0.0.1');
        return u.hostname === '127.0.0.1' || u.hostname === 'localhost';
    } catch {
        return url.includes('127.0.0.1') || url.includes('localhost');
    }
}

export const LOCAL_API_BASE = `http://127.0.0.1:${PORT}`;

export const getLocalApiBase = () => {
    return `http://127.0.0.1:${CONFIG.port}`;
}

export const API_ENDPOINTS = {
    STATUS: '/status',
    START_BROWSER: LOCAL_API_CONTRACTS['open-browser'].path,
    CLOSE_BROWSER: LOCAL_API_CONTRACTS['close-browser'].path,
    CREATE_BROWSER: LOCAL_API_CONTRACTS['create-browser'].path,
    GET_BROWSER_LIST: LOCAL_API_CONTRACTS['get-browser-list'].path,
    UPDATE_BROWSER: LOCAL_API_CONTRACTS['update-browser'].path,
    DELETE_BROWSER: LOCAL_API_CONTRACTS['delete-browser'].path,
    GET_PROFILE_COOKIES: LOCAL_API_CONTRACTS['get-profile-cookies'].path,
    GET_PROFILE_UA: LOCAL_API_CONTRACTS['get-profile-ua'].path,
    CLOSE_ALL_PROFILES: LOCAL_API_CONTRACTS['close-all-profiles'].path,
    NEW_FINGERPRINT: LOCAL_API_CONTRACTS['new-fingerprint'].path,
    DELETE_CACHE_V2: LOCAL_API_CONTRACTS['delete-cache-v2'].path,
    SHARE_PROFILE: LOCAL_API_CONTRACTS['share-profile'].path,
    GET_BROWSER_ACTIVE: LOCAL_API_CONTRACTS['get-browser-active'].path,
    CREATE_PROXY: LOCAL_API_CONTRACTS['create-proxy'].path,
    UPDATE_PROXY: LOCAL_API_CONTRACTS['update-proxy'].path,
    GET_PROXY_LIST: LOCAL_API_CONTRACTS['get-proxy-list'].path,
    DELETE_PROXY: LOCAL_API_CONTRACTS['delete-proxy'].path,
    GET_OPENED_BROWSER: LOCAL_API_CONTRACTS['get-opened-browser'].path,
    GET_CLOUD_ACTIVE: LOCAL_API_CONTRACTS['get-cloud-active'].path,
    MOVE_BROWSER: LOCAL_API_CONTRACTS['move-browser'].path,
    GET_GROUP_LIST: LOCAL_API_CONTRACTS['get-group-list'].path,
    CREATE_GROUP: LOCAL_API_CONTRACTS['create-group'].path,
    UPDATE_GROUP: LOCAL_API_CONTRACTS['update-group'].path,
    GET_APPLICATION_LIST: LOCAL_API_CONTRACTS['get-application-list'].path,
    GET_TAG_LIST: LOCAL_API_CONTRACTS['get-tag-list'].path,
    CREATE_TAG: LOCAL_API_CONTRACTS['create-tag'].path,
    UPDATE_TAG: LOCAL_API_CONTRACTS['update-tag'].path,
    DELETE_TAG: LOCAL_API_CONTRACTS['delete-tag'].path,
    DOWNLOAD_KERNEL: LOCAL_API_CONTRACTS['download-kernel'].path,
    GET_KERNEL_LIST: LOCAL_API_CONTRACTS['get-kernel-list'].path,
    UPDATE_PATCH: LOCAL_API_CONTRACTS['update-patch'].path
} as const;

export const apiClient = axios.create({
    headers: API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {}
});

export const getApiClient = () => {
    const client = axios.create({
        headers: CONFIG.apiKey ? { 'Authorization': `Bearer ${CONFIG.apiKey}` } : {},
    });
    client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
        if (isLocalApiRequestUrl(config.url)) {
            await throttleLocalApiRequest();
        }
        return config;
    });
    return client;
};
