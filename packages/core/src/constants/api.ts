import axios from 'axios';
import { PORT, API_KEY, CONFIG } from './config.js';
import { LOCAL_API_CONTRACTS } from './localApiContracts.js';

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
    return axios.create({
        headers: CONFIG.apiKey ? { 'Authorization': `Bearer ${CONFIG.apiKey}` } : {}
    });
}
