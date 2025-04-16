// src/App.tsx

// 只导入实际使用的 useState 和 useEffect，不再需要导入 React 本身
import { useState, useEffect } from 'react';
import ResultCard from './components/ResultCard'; // 导入 ResultCard 组件

// 导入 App.css 以应用全局样式 (副作用导入)
import './App.css';

function App() {
    // --- State for storing data from each endpoint ---
    const [homeData, setHomeData] = useState<string | null>(null);
    const [helloData, setHelloData] = useState<string | null>(null);
    const [sumData, setSumData] = useState<string | null>(null);
    const [bubbleSortData, setBubbleSortData] = useState<string | null>(null);
    const [fibonacciData, setFibonacciData] = useState<string | null>(null);

    // --- State for loading status ---
    const [loading, setLoading] = useState<boolean>(true);
    // --- State for error handling ---
    const [error, setError] = useState<string | null>(null);

    // Backend base URL (Spring Boot runs on 8080 by default)
    const BACKEND_URL = 'http://localhost:8080';

    // useEffect Hook: Fetch data when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch data from all endpoints concurrently
                const [
                    homeRes,
                    helloRes,
                    sumRes,
                    bubbleSortRes,
                    fibonacciRes
                ] = await Promise.all([
                    fetch(`${BACKEND_URL}/`),
                    fetch(`${BACKEND_URL}/hello`),
                    fetch(`${BACKEND_URL}/sum`),
                    fetch(`${BACKEND_URL}/bubblesort`),
                    fetch(`${BACKEND_URL}/fibonacci`)
                ]);

                // Helper function to check response status and get text content
                const processResponse = async (res: Response): Promise<string> => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status} for ${res.url}`);
                    }
                    return res.text();
                };

                // Process all responses and update state
                setHomeData(await processResponse(homeRes));
                setHelloData(await processResponse(helloRes));
                setSumData(await processResponse(sumRes));
                setBubbleSortData(await processResponse(bubbleSortRes));
                setFibonacciData(await processResponse(fibonacciRes));

            } catch (e: unknown) { // 使用 unknown 类型替代 any
                console.error("Failed to fetch data:", e);

                // 处理 unknown 类型的错误
                let errorMessage = "An unknown error occurred while fetching data.";
                if (e instanceof Error) {
                    errorMessage = `Failed to load data from backend: ${e.message}`;
                } else if (typeof e === 'string') {
                    errorMessage = e;
                }
                setError(errorMessage);

            } finally {
                // Ensure loading is set to false regardless of success or failure
                setLoading(false);
            }
        };

        fetchData(); // Call the fetch function
    }, []); // Empty dependency array ensures this effect runs only once on mount

    // --- Render the component's UI ---
    return (
        // Apply the 'App' class for overall layout/styling (defined in global CSS)
        <div className="App">
            <h1>Spring Boot Backend Results</h1>

            {/* Conditional Rendering: Show Loading Message */}
            {loading && <p className="loadingMessage">Loading data from backend...</p>}

            {/* Conditional Rendering: Show Error Message */}
            {error && <p className="errorMessage">{error}</p>}

            {/* Conditional Rendering: Show Results when not loading and no error */}
            {!loading && !error && (
                // Apply the 'resultsContainer' class for Flexbox layout (defined in global CSS)
                <div className="resultsContainer">
                    {/* Render data for each endpoint using the ResultCard component */}
                    <ResultCard title="Home ('/')" content={homeData} />
                    <ResultCard title="Hello ('/hello')" content={helloData} />
                    <ResultCard title="Sum ('/sum')" content={sumData} />
                    <ResultCard title="Bubble Sort ('/bubblesort')" content={bubbleSortData} />
                    <ResultCard title="Fibonacci ('/fibonacci')" content={fibonacciData} />
                </div>
            )}
        </div>
    );
}

export default App;