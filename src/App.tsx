// src/App.tsx
import React, {useState, useEffect} from 'react';
import ResultCard from './components/ResultCard';
import './App.css';

// --- TypeScript Interfaces matching Java DTOs ---
interface SortResponse {
    original: number[];
    sorted: number[];
    error?: undefined;
}

interface FibonacciResponse {
    n: number;
    result: number | null;
    error: string | null;
}

interface GreetSuccessResponse {
    message: string;
    error?: undefined;
}

interface GreetErrorResponse {
    message?: undefined;
    error: string;
}

type GreetResponse = GreetSuccessResponse | GreetErrorResponse;

interface StatsResponse {
    count: number;
    sum: number;
    average: number;
    min: number;
    max: number;
    error?: undefined;
}

interface BackendError {
    error: string;
    message?: undefined;
    n?: undefined;
    result?: undefined; // Explicitly state 'result' is not part of BackendError
    count?: undefined;
    original?: undefined;
}

type RenderableContent =
    | string
    | SortResponse
    | FibonacciResponse
    | GreetResponse
    | StatsResponse
    | BackendError
    | null
    | undefined;

function App() {
    const [homeData, setHomeData] = useState<string | null>(null);
    const [helloData, setHelloData] = useState<string | null>(null);
    const [sumData, setSumData] = useState<string | null>(null);
    const [bubbleSortData, setBubbleSortData] = useState<SortResponse | null>(null);
    const [fibonacciData, setFibonacciData] = useState<FibonacciResponse | null>(null);

    const [greetName, setGreetName] = useState<string>("Guest");
    const [greetData, setGreetData] = useState<GreetResponse | null>(null);

    const [fibonacciN, setFibonacciN] = useState<string>("5");
    const [fibonacciParamData, setFibonacciParamData] = useState<FibonacciResponse | null>(null);

    const [statsInput, setStatsInput] = useState<string>("1,2,3,4,5.5");
    const [statsData, setStatsData] = useState<StatsResponse | BackendError | null>(null);

    const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
    const [loadingInteractive, setLoadingInteractive] = useState<boolean>(false);
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
                    fetch(`${BACKEND_URL}/fibonacci`)
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
                console.error("Failed to fetch initial data:", e);
                let errorMessage = "An unknown error occurred while fetching initial data.";
                if (e instanceof Error) {
                    errorMessage = `Failed to load initial data: ${e.message}`;
                } else if (typeof e === 'string') {
                    errorMessage = e;
                }
                setFetchError(errorMessage);
            } finally {
                setLoadingInitial(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleGreet = async () => {
        if (!greetName.trim()) {
            setGreetData({error: "Name cannot be empty."});
            return;
        }
        setLoadingInteractive(true);
        setGreetData(null);
        try {
            const res = await fetch(`${BACKEND_URL}/greet/${encodeURIComponent(greetName)}`);
            const data: GreetResponse = await res.json();
            setGreetData(data);
        } catch (e) {
            console.error("Greet error:", e);
            setGreetData({error: e instanceof Error ? e.message : "Failed to fetch greeting."});
        } finally {
            setLoadingInteractive(false);
        }
    };

    const handleFibonacciParam = async () => {
        const nVal = parseInt(fibonacciN, 10);
        if (isNaN(nVal)) {
            setFibonacciParamData({n: -1, result: null, error: "Invalid input for N. Must be a number."});
            return;
        }
        setLoadingInteractive(true);
        setFibonacciParamData(null);
        try {
            const res = await fetch(`${BACKEND_URL}/fibonacci-param?n=${nVal}`);
            const data: FibonacciResponse = await res.json();
            setFibonacciParamData(data);
        } catch (e) {
            console.error("Fibonacci param error:", e);
            setFibonacciParamData({
                n: nVal,
                result: null,
                error: e instanceof Error ? e.message : "Failed to fetch Fibonacci (param)."
            });
        } finally {
            setLoadingInteractive(false);
        }
    };

    const handleCalculateStats = async () => {
        const numbersRaw = statsInput.split(',');
        const numbers = numbersRaw.map(s => parseFloat(s.trim())).filter(n => !isNaN(n));

        if (numbers.length !== numbersRaw.length || (numbers.length === 0 && statsInput.trim() !== "")) {
            setStatsData({error: "Invalid number format. Please provide only comma-separated numbers."});
            return;
        }
        if (numbers.length === 0 && statsInput.trim() === "") {
            setStatsData({error: "Input cannot be empty. Please provide comma-separated numbers."});
            return;
        }

        setLoadingInteractive(true);
        setStatsData(null);
        try {
            const res = await fetch(`${BACKEND_URL}/calculate-stats`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(numbers),
            });
            const data = await res.json();
            if (!res.ok) {
                setStatsData(data as BackendError);
            } else {
                setStatsData(data as StatsResponse);
            }
        } catch (e) {
            console.error("Calculate stats error:", e);
            setStatsData({error: e instanceof Error ? e.message : "Failed to calculate stats."});
        } finally {
            setLoadingInteractive(false);
        }
    };

    const renderContent = (content: RenderableContent): React.ReactNode => {
        if (content === null || content === undefined) {
            return "No data";
        }
        if (typeof content === 'string') {
            return content;
        }

        // Check for FibonacciResponse: must have 'n', 'result', and 'error' properties.
        if (
            typeof content === 'object' && // Ensure it's an object
            'n' in content &&
            'result' in content && // 'result' is required in FibonacciResponse (can be null)
            'error' in content    // 'error' is required in FibonacciResponse (can be null)
        ) {
            // Now it's much safer to assert as FibonacciResponse
            const fibRes = content as FibonacciResponse;
            if (fibRes.error) {
                return `Input n: ${fibRes.n}, Error: ${fibRes.error}`;
            }
            return `Input n: ${fibRes.n}, Result: ${fibRes.result}`;
        }

        // Check for GreetSuccessResponse (has 'message' and no 'error' field or error is undefined)
        if (typeof content === 'object' && 'message' in content && content.message !== undefined && content.error === undefined) {
            return content.message; // content is GreetSuccessResponse
        }

        // Check for StatsResponse (successful, has 'count', 'sum', and no 'error' field or error is undefined)
        if (typeof content === 'object' && 'count' in content && 'sum' in content && content.error === undefined) {
            return <pre>{JSON.stringify(content, null, 2)}</pre>; // content is StatsResponse
        }

        // Check for SortResponse (successful, has 'original', 'sorted', and no 'error' field or error is undefined)
        if (typeof content === 'object' && 'original' in content && 'sorted' in content && content.error === undefined) {
            return <pre>{JSON.stringify(content, null, 2)}</pre>; // content is SortResponse
        }

        // Check for GreetErrorResponse or BackendError (has 'error' and was not a FibonacciResponse)
        if (typeof content === 'object' && 'error' in content && content.error !== undefined) {
            // At this point, it's not a FibonacciResponse (checked above).
            // It could be GreetErrorResponse or BackendError.
            return `Error: ${content.error}`;
        }

        // Default fallback for any other object structures
        return <pre>{JSON.stringify(content, null, 2)}</pre>;
    };

    return (
        <div className="App">
            <h1>Spring Boot Backend Results</h1>

            {loadingInitial && <p className="loadingMessage">Loading initial data...</p>}
            {fetchError && <p className="errorMessage">{fetchError}</p>}

            {!loadingInitial && !fetchError && (
                <div className="resultsContainer">
                    <ResultCard title="Home ('/')">{renderContent(homeData)}</ResultCard>
                    <ResultCard title="Hello ('/hello')">{renderContent(helloData)}</ResultCard>
                    <ResultCard title="Sum ('/sum')">{renderContent(sumData)}</ResultCard>
                    <ResultCard title="Bubble Sort ('/bubblesort')">{renderContent(bubbleSortData)}</ResultCard>
                    <ResultCard
                        title="Fibonacci (fixed N=10) ('/fibonacci')">{renderContent(fibonacciData)}</ResultCard>
                </div>
            )}

            <hr/>
            <h2>Interactive Endpoints</h2>
            {loadingInteractive && <p className="loadingMessage">Processing request...</p>}

            <div className="interactive-section">
                <h3>Greet User ('/greet/{'{name}'}')</h3>
                <input
                    type="text"
                    value={greetName}
                    onChange={(e) => setGreetName(e.target.value)}
                    placeholder="Enter name"
                />
                <button onClick={handleGreet} disabled={loadingInteractive}>Greet</button>
                {greetData && <ResultCard title="Greeting Result">{renderContent(greetData)}</ResultCard>}
            </div>

            <div className="interactive-section">
                <h3>Fibonacci by Parameter ('/fibonacci-param?n=...')</h3>
                <input
                    type="number"
                    value={fibonacciN}
                    onChange={(e) => setFibonacciN(e.target.value)}
                    placeholder="Enter N"
                />
                <button onClick={handleFibonacciParam} disabled={loadingInteractive}>Calculate Fibonacci</button>
                {fibonacciParamData && <ResultCard
                    title={`Fibonacci Result for N=${(fibonacciParamData as FibonacciResponse).n}`}>{renderContent(fibonacciParamData)}</ResultCard>}
            </div>

            <div className="interactive-section">
                <h3>Calculate Stats ('/calculate-stats' - POST)</h3>
                <textarea
                    value={statsInput}
                    onChange={(e) => setStatsInput(e.target.value)}
                    placeholder="Enter comma-separated numbers (e.g., 1,2,3.5,4)"
                    rows={3}
                />
                <button onClick={handleCalculateStats} disabled={loadingInteractive}>Calculate Stats</button>
                {statsData && <ResultCard title="Statistics Result">{renderContent(statsData)}</ResultCard>}
            </div>
        </div>
    );
}

export default App;