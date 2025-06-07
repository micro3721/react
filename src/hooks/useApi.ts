// src/hooks/useApi.ts
import {useState, useCallback} from 'react';

// API 请求的状态接口
interface ApiState<T> {
    data: T | null;
    error: string | null;
    loading: boolean;
}

// useApi Hook 定义
export function useApi<T>() {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        error: null,
        loading: false,
    });

    // 使用 useCallback 避免不必要的函数重创建
    const request = useCallback(async (
        url: string,
        options?: RequestInit
    ) => {
        setState({data: null, error: null, loading: true});
        try {
            const res = await fetch(url, options);
            // 使用 unknown 类型来安全地处理未知的 JSON 响应
            const json: unknown = await res.json().catch(() => ({
                error: `Failed to parse JSON response from ${res.url}`
            }));

            if (!res.ok) {
                // 类型守卫：安全地从 json 中提取错误信息
                const errorMessage = (json && typeof json === 'object' && 'error' in json && typeof json.error === 'string')
                    ? json.error
                    : `HTTP error! status: ${res.status}`;
                throw new Error(errorMessage);
            }

            // 使用类型断言将 unknown 类型的 json 赋给 data
            setState({data: json as T, error: null, loading: false});
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setState({data: null, error: errorMessage, loading: false});
        }
    }, []); // 空依赖数组，request 函数在组件生命周期内保持不变

    return {...state, request};
}