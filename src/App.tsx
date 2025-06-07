// src/App.tsx
import React, {useState, useEffect} from 'react';
import ResultCard from './components/ResultCard';
import {GreetUserSection} from './features/GreetUserSection';
import {FibonacciSection} from './features/FibonacciSection'; // Import FibonacciSection
import {StatsSection} from './features/StatsSection';     // Import StatsSection
import {SortResponse, FibonacciResponse} from './types';
import './App.css';

function App() {
    // 初始静态数据的获取逻辑可以保持
    const [homeData, setHomeData] = useState<string | null>(null);
    const [helloData, setHelloData] = useState<string | null>(null);
    const [sumData, setSumData] = useState<string | null>(null);
    const [bubbleSortData, setBubbleSortData] = useState<SortResponse | null>(null);
    const [fibonacciData, setFibonacciData] = useState<FibonacciResponse | null>(null);

    const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const BACKEND_URL = 'http://localhost:8080';

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingInitial(true);
            setFetchError(null);
            try {
                const responses = await Promise.all([
                    fetch(`${BACKEND_URL}/`),
                    fetch(`${BACKEND_URL}/hello`),
                    fetch(`${BACKEND_URL}/sum`),
                    fetch(`${BACKEND_URL}/bubblesort`),
                    fetch(`${BACKEND_URL}/fibonacci`),
                ]);

                for (const res of responses) {
                    if (!res.ok) {
                        const errorText = await res.text().catch(() => "Could not read error body.");
                        throw new Error(`HTTP error! status: ${res.status} for ${res.url}. Body: ${errorText}`);
                    }
                }

                const [homeRes, helloRes, sumRes, bubbleSortRes, fibonacciRes] = responses;

                setHomeData(await homeRes.text());
                setHelloData(await helloRes.text());
                setSumData(await sumRes.text());
                setBubbleSortData(await bubbleSortRes.json());
                setFibonacciData(await fibonacciRes.json());

            } catch (e: unknown) {
                setFetchError(e instanceof Error ? e.message : "An unknown error occurred.");
            } finally {
                setLoadingInitial(false);
            }
        };
        fetchInitialData();
    }, []);

    // 修复了 'any' 类型问题，使用 'unknown'
    const renderSimpleContent = (content: unknown): React.ReactNode => {
        if (content === null || content === undefined) return "No data";
        if (typeof content === 'string') return content;
        return <pre>{JSON.stringify(content, null, 2)}</pre>;
    };

    return (
        <div className="App">
            <h1>Spring Boot Backend Results</h1>

            {loadingInitial && <p className="loadingMessage">Loading initial data...</p>}
            {fetchError && <p className="errorMessage">{fetchError}</p>}

            {!loadingInitial && !fetchError && (
                <div className="resultsContainer">
                    <ResultCard title="Home ('/')">{renderSimpleContent(homeData)}</ResultCard>
                    <ResultCard title="Hello ('/hello')">{renderSimpleContent(helloData)}</ResultCard>
                    <ResultCard title="Sum ('/sum')">{renderSimpleContent(sumData)}</ResultCard>
                    <ResultCard title="Bubble Sort ('/bubblesort')">{renderSimpleContent(bubbleSortData)}</ResultCard>
                    <ResultCard
                        title="Fibonacci (fixed N=10) ('/fibonacci')">{renderSimpleContent(fibonacciData)}</ResultCard>
                </div>
            )}

            <hr/>
            <h2>Interactive Endpoints</h2>

            {/* 直接使用导入的功能组件 */}
            <GreetUserSection/>
            <FibonacciSection/>
            <StatsSection/>

        </div>
    );
}

export default App;