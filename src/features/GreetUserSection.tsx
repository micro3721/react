// src/features/GreetUserSection.tsx
import {useState} from 'react';
import {useApi} from '../hooks/useApi';
import ResultCard from '../components/ResultCard';
import {GreetResponse, GreetSuccessResponse} from '../types';

export function GreetUserSection() {
    const [name, setName] = useState('Guest');
    const {data, error, loading, request: greetUser} = useApi<GreetResponse>();

    const BACKEND_URL = 'http://localhost:8080';

    const handleSubmit = async () => {
        if (!name.trim()) return;
        await greetUser(`${BACKEND_URL}/greet/${encodeURIComponent(name)}`);
    };

    // 这是一个自定义类型守卫，用于判断响应是否成功
    const isSuccess = (response: GreetResponse): response is GreetSuccessResponse => {
        return (response as GreetSuccessResponse).message !== undefined;
    };

    return (
        <div className="interactive-section">
            <h3>Greet User ('/greet/{'{name}'}')</h3>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
            />
            <button onClick={handleSubmit} disabled={loading}>Greet</button>

            {loading && <p className="loadingMessage">Greeting...</p>}

            {/* 渲染 API 请求级别的错误 (如网络错误) */}
            {error && (
                <ResultCard title="API Error">
                    <p className="errorMessage">{error}</p>
                </ResultCard>
            )}

            {/* 渲染从后端返回的数据 (成功或业务逻辑错误) */}
            {!loading && data && (
                <ResultCard title="Greeting Result">
                    {isSuccess(data) ? (
                        <p>{data.message}</p>
                    ) : (
                        <p className="errorMessage">{`Error: ${data.error}`}</p>
                    )}
                </ResultCard>
            )}
        </div>
    );
}