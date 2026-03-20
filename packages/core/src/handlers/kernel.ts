import { apiClient, LOCAL_API_BASE, API_ENDPOINTS } from '../constants/api.js';
import type { DownloadKernelParams } from '../types/kernel.js';

export const kernelHandlers = {
    async downloadKernel({ kernel_type, kernel_version }: DownloadKernelParams) {
        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.DOWNLOAD_KERNEL}`, {
            kernel_type,
            kernel_version
        });

        if (response.data.code === 0) {
            return `Kernel download/update status: ${JSON.stringify(response.data.data, null, 2)}`;
        }

        throw new Error(`Failed to download/update kernel: ${response.data.msg}`);
    }
};

