import { API_ENDPOINTS, getApiClient, getLocalApiBase } from '../constants/api.js';
import type { DownloadKernelParams, GetKernelListParams } from '../types/kernel.js';

export const kernelHandlers = {
    async downloadKernel({ kernel_type, kernel_version }: DownloadKernelParams) {
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.DOWNLOAD_KERNEL}`, {
            kernel_type,
            kernel_version
        });

        if (response.data.code === 0) {
            return `Kernel download/update status: ${JSON.stringify(response.data.data, null, 2)}`;
        }

        throw new Error(`Failed to download/update kernel: ${response.data.msg}`);
    },

    async getKernelList({ kernel_type }: GetKernelListParams) {
        const params = new URLSearchParams();
        if (kernel_type) {
            params.set('kernel_type', kernel_type);
        }

        const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.GET_KERNEL_LIST}`, { params });
        if (response.data.code === 0) {
            return `Kernel list: ${JSON.stringify(response.data.data.list || response.data.data, null, 2)}`;
        }

        throw new Error(`Failed to get kernel list: ${response.data.msg}`);
    }
};

