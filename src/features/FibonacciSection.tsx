// src/features/FibonacciSection.tsx
import {useState} from 'react';
import {useApi} from '../hooks/useApi';
import ResultCard from '../components/ResultCard';
// Assuming FibonacciResponse is defined in types.ts as:
// export interface FibonacciResponse { n: number; result: number | null; error: string | null; }
import {FibonacciResponse} from '../types';

export function FibonacciSection() {
    const [n, setN] = useState('10');
    const {data, error, loading, request: fetchFibonacci} = useApi<FibonacciResponse>();

    const BACKEND_URL = 'http://localhost:8080';

    const handleSubmit = async () => {
        const num = parseInt(n, 10);
        if (isNaN(num) || num < 0) {
            alert("Please enter a non-negative number.");
            return;
        }
        // CORRECTED: Changed URL from /fibonacci/{n} to /fibonacci-param?n=... to match the backend
        await fetchFibonacci(`${BACKEND_URL}/fibonacci-param?n=${num}`);
    };

    return (
        <div className="interactive-section">
            <h3>Calculate Fibonacci ('/fibonacci-param?n=...')</h3>
            <input
                type="number"
                value={n}
                onChange={(e) => setN(e.target.value)}
                placeholder="Enter n"
            />
            <button onClick={handleSubmit} disabled={loading}>Calculate</button>

            {loading && <p className="loadingMessage">Calculating...</p>}

            {error && (
                <ResultCard title="API Error">
                    <p className="errorMessage">{error}</p>
                </ResultCard>
            )}

            {/* CORRECTED: Updated to display the data structure from the backend */}
            {!loading && data && (
                <ResultCard title={`Fibonacci Result for N=${data.n}`}>
                    {data.error ? (
                        <p className="errorMessage">Error: {data.error}</p>
                    ) : (
                        <p><strong>Result:</strong> {data.result}</p>
                    )}
                </ResultCard>
            )}
        </div>
    );
}