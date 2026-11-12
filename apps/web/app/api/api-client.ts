const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const CUSTOMER_AUTH_BASE_URL =
    process.env.NEXT_PUBLIC_CUSTOMER_AUTH_URL || 'http://localhost:4001';

export interface RequestOptions {
    params?: Record<string, string | number | boolean>;
    headers?: Record<string, string>;
}

class ApiClient {
    constructor(
        private readonly baseUrl: string,
        private readonly tokenStorageKey: string
    ) {}

    private getToken(): string | null {
        if (typeof window === 'undefined') {
            return null;
        }

        return localStorage.getItem(this.tokenStorageKey);
    }

    private buildUrl(
        endpoint: string,
        params?: RequestOptions['params']
    ): string {
        const url = new URL(
            `${this.baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`
        );

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.set(key, String(value));
            });
        }

        return url.toString();
    }

    private async request<T>(
        method: string,
        endpoint: string,
        body?: unknown,
        options: RequestOptions = {}
    ): Promise<T> {
        const token = this.getToken();

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
            this.buildUrl(endpoint, options.params),
            {
                method,
                headers,
                credentials: 'include',
                ...(body !== undefined
                    ? { body: JSON.stringify(body) }
                    : {}),
            }
        );

        const responseText = await response.text();

        let data: unknown = null;

        if (responseText) {
            try {
                data = JSON.parse(responseText);
            } catch {
                data = responseText;
            }
        }

        if (!response.ok) {
            const errorData =
                typeof data === 'object' && data !== null
                    ? (data as Record<string, unknown>)
                    : {};

            const message =
                typeof errorData.message === 'string'
                    ? errorData.message
                    : typeof data === 'string'
                      ? data
                      : `Request failed with status ${response.status}`;

            const error = new Error(message) as Error & {
                status?: number;
                code?: string;
            };

            error.status = response.status;

            if (typeof errorData.code === 'string') {
                error.code = errorData.code;
            }

            throw error;
        }

        return data as T;
    }

    get<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        return this.request<T>('GET', endpoint, undefined, options);
    }

    post<T>(
        endpoint: string,
        body?: unknown,
        options: RequestOptions = {}
    ): Promise<T> {
        return this.request<T>('POST', endpoint, body, options);
    }

    put<T>(
        endpoint: string,
        body?: unknown,
        options: RequestOptions = {}
    ): Promise<T> {
        return this.request<T>('PUT', endpoint, body, options);
    }

    patch<T>(
        endpoint: string,
        body?: unknown,
        options: RequestOptions = {}
    ): Promise<T> {
        return this.request<T>('PATCH', endpoint, body, options);
    }

    delete<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        return this.request<T>('DELETE', endpoint, undefined, options);
    }
}

// Existing storefront/gateway requests retain their own token.
export const apiClient = new ApiClient(
    API_BASE_URL,
    'auth_token'
);

// Customer authentication goes directly to the Auth service.
export const customerApiClient = new ApiClient(
    CUSTOMER_AUTH_BASE_URL,
    'customer_auth_token'
);
