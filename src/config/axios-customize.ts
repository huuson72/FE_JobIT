import { IBackendRes } from "@/types/backend";
import { Mutex } from "async-mutex";
import axiosClient from "axios";
import { store } from "@/redux/store";
import { setRefreshTokenAction } from "@/redux/slice/accountSlide";
import { notification } from "antd";
import { getEnvironmentConfig } from './environment';

interface AccessTokenResponse {
    access_token: string;
}

/**
 * Creates an initial 'axios' instance with custom settings.
 */
const config = getEnvironmentConfig();

const instance = axiosClient.create({
    baseURL: config.backendUrl,
    withCredentials: true
});

const mutex = new Mutex();
const NO_RETRY_HEADER = 'x-no-retry';

const handleRefreshToken = async (): Promise<string | null> => {
    return await mutex.runExclusive(async () => {
        const res = await instance.get<IBackendRes<AccessTokenResponse>>('/api/v1/auth/refresh');
        if (res && res.data) return res.data.access_token;
        else return null;
    });
};

instance.interceptors.request.use(function (config) {
    if (typeof window !== "undefined" && window && window.localStorage && window.localStorage.getItem('access_token')) {
        config.headers.Authorization = 'Bearer ' + window.localStorage.getItem('access_token');
    }
    if (!config.headers.Accept && config.headers["Content-Type"]) {
        config.headers.Accept = "application/json";
        config.headers["Content-Type"] = "application/json; charset=utf-8";
    }
    return config;
});

/**
 * Handle all responses. It is possible to add handlers
 * for requests, but it is omitted here for brevity.
 */
instance.interceptors.response.use(
    (res) => res.data,
    async (error) => {
        // Xử lý lỗi 401 (Unauthorized)
        if (error.config && error.response && +error.response.status === 401) {
            // Nếu đang ở trang login, không cần xử lý gì
            if (error.config.url === '/api/v1/auth/login') {
                return Promise.reject(error);
            }
            
            // Nếu không có token, chuyển về trang login
            if (!localStorage.getItem('access_token')) {
                window.location.href = '/login';
                return Promise.reject(error);
            }
            
            // Thử refresh token nếu chưa thử
            if (!error.config.headers[NO_RETRY_HEADER]) {
                try {
                    const access_token = await handleRefreshToken();
                    if (access_token) {
                        error.config.headers[NO_RETRY_HEADER] = 'true';
                        error.config.headers['Authorization'] = `Bearer ${access_token}`;
                        localStorage.setItem('access_token', access_token);
                        return instance.request(error.config);
                    } else {
                        // Nếu refresh thất bại, xóa token và chuyển về trang login
                        localStorage.removeItem('access_token');
                        window.location.href = '/login';
                    }
                } catch (refreshError) {
                    // Nếu có lỗi khi refresh, xóa token và chuyển về trang login
                    localStorage.removeItem('access_token');
                    window.location.href = '/login';
                }
            }
        }

        // Xử lý lỗi 400 khi refresh token
        if (
            error.config && error.response
            && +error.response.status === 400
            && error.config.url === '/api/v1/auth/refresh'
        ) {
            const message = error?.response?.data?.error ?? "Có lỗi xảy ra, vui lòng login.";
            store.dispatch(setRefreshTokenAction({ status: true, message }));
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }

        // Xử lý lỗi 403 (Forbidden)
        if (+error.response.status === 403) {
            notification.error({
                message: error?.response?.data?.message ?? "Không có quyền truy cập",
                description: error?.response?.data?.error ?? "Bạn không có quyền thực hiện hành động này"
            });
        }

        return error?.response?.data ?? Promise.reject(error);
    }
);

/**
 * Replaces main `axios` instance with the custom-one.
 *
 * @param cfg - Axios configuration object.
 * @returns A promise object of a response of the HTTP request with the 'data' object already
 * destructured.
 */
// const axios = <T>(cfg: AxiosRequestConfig) => instance.request<any, T>(cfg);

// export default axios;

export default instance;