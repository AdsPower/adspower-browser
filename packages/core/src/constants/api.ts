import axios from 'axios';
import { PORT, API_KEY } from './config.js';

export const LOCAL_API_BASE = `http://127.0.0.1:${PORT}`;

export const API_ENDPOINTS = {
    STATUS: '/status',
    START_BROWSER: '/api/v2/browser-profile/start',
    CLOSE_BROWSER: '/api/v2/browser-profile/stop',
    CREATE_BROWSER: '/api/v2/browser-profile/create',
    GET_BROWSER_LIST: '/api/v2/browser-profile/list',
    UPDATE_BROWSER: '/api/v2/browser-profile/update',
    DELETE_BROWSER: '/api/v2/browser-profile/delete',
    GET_PROFILE_COOKIES: '/api/v2/browser-profile/cookies',
    GET_PROFILE_UA: '/api/v2/browser-profile/ua',
    CLOSE_ALL_PROFILES: '/api/v2/browser-profile/stop-all',
    NEW_FINGERPRINT: '/api/v2/browser-profile/new-fingerprint',
    DELETE_CACHE_V2: '/api/v2/browser-profile/delete-cache',
    SHARE_PROFILE: '/api/v2/browser-profile/share',
    GET_BROWSER_ACTIVE: '/api/v2/browser-profile/active',
    CREATE_PROXY: '/api/v2/proxy-list/create',
    UPDATE_PROXY: '/api/v2/proxy-list/update',
    GET_PROXY_LIST: '/api/v2/proxy-list/list',
    DELETE_PROXY: '/api/v2/proxy-list/delete',
    GET_OPENED_BROWSER: '/api/v1/browser/local-active',
    GET_CLOUD_ACTIVE: '/api/v1/browser/cloud-active',
    MOVE_BROWSER: '/api/v1/user/regroup',
    GET_GROUP_LIST: '/api/v1/group/list',
    CREATE_GROUP: '/api/v1/group/create',
    UPDATE_GROUP: '/api/v1/group/update',
    GET_APPLICATION_LIST: '/api/v2/category/list',
    GET_TAG_LIST: '/api/v2/browser-tags/list',
    CREATE_TAG: '/api/v2/browser-tags/create',
    UPDATE_TAG: '/api/v2/browser-tags/update',
    DELETE_TAG: '/api/v2/browser-tags/delete',
    DOWNLOAD_KERNEL: '/api/v2/browser-profile/download-kernel',
    GET_KERNEL_LIST: '/api/v2/browser-profile/kernels',
    UPDATE_PATCH: '/api/v2/browser-profile/update-patch'
} as const;

export const apiClient = axios.create({
    headers: API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {}
});
