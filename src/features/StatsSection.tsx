// src/features/StatsSection.tsx
import {useState} from 'react';
import {useApi} from '../hooks/useApi';
import ResultCard from '../components/ResultCard';
// Assuming StatsResponse and StatsErrorResponse are updated in types.ts
import {StatsResponse, StatsErrorResponse} from '../types';

export function StatsSection() {
    const [numbers, setNumbers] = useState('1, 2, 3, 4, 5, 5');
    const {data, error, loading, request: fetchStats} = useApi<StatsResponse | StatsErrorResponse>();

    const BACKEND_URL = 'http://localhost:8080';

    const handleSubmit = async () => {
        const numberArray = numbers.split(',')
            .map(s => s.trim())
            .filter(s => s !== '')
            .map(Number);

        if (numberArray.some(isNaN)) {
            alert('Invalid input. Please enter a comma-separated list of numbers.');
            return;
        }

        if (numberArray.length === 0) {
            alert('Please enter at least one number.');
            return;
        }

        // CORRECTED: Changed URL from /stats to /calculate-stats to match the backend
        await fetchStats(`${BACKEND_URL}/calculate-stats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(numberArray),
        });
    };

    const isSuccess = (response: StatsResponse | StatsErrorResponse): response is StatsResponse => {
        // The backend returns `average` on success, so we check for that.
        return response && "average" in response;
    }

    return (
        <div className="interactive-section">
            <h3>Calculate Statistics ('/calculate-stats') [POST]</h3>
            <textarea
                value={numbers}
                onChange={(e) => setNumbers(e.target.value)}
                placeholder="Enter comma-separated numbers"
                rows={3}
            />
            <button onClick={handleSubmit} disabled={loading}>Calculate Stats</button>

            {loading && <p className="loadingMessage">Calculating stats...</p>}

            {error && (
                <ResultCard title="API Error">
                    <p className="errorMessage">{error}</p>
                </ResultCard>
            )}

            {!loading && data && (
                <ResultCard title="Statistics Result">
                    {isSuccess(data) ? (
                        /* CORRECTED: Updated to display the fields returned by the backend */
                        <div>
                            <p><strong>Count:</strong> {data.count}</p>
                            <p><strong>Sum:</strong> {data.sum}</p>
                            <p><strong>Average:</strong> {data.average}</p>
                            <p><strong>Min:</strong> {data.min}</p>
                            <p><strong>Max:</strong> {data.max}</p>
                        </div>
                    ) : (
                        <p className="errorMessage">{`Error: ${(data as StatsErrorResponse).error}`}</p>
                    )}
                </ResultCard>
            )}
        </div>
    );
}