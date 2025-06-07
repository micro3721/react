// src/types.ts

// A generic error response from the backend
export interface ErrorResponse {
    error: string;
}

// For the initial data load for /bubblesort
export interface SortResponse {
    original: number[];
    sorted: number[];
}

// For the interactive Greet User section
export interface GreetSuccessResponse {
    message: string;
}

export type GreetResponse = GreetSuccessResponse | ErrorResponse;


// For the interactive Fibonacci section, matching the Java record:
// public record FibonacciResponse(int n, Long result, String error) {}
export interface FibonacciResponse {
    n: number;
    result: number | null;
    error: string | null;
}


// For the interactive Stats section, matching the Java record:
// public record StatsResponse(int count, double sum, double average, double min, double max) {}
export interface StatsResponse {
    count: number;
    sum: number;
    average: number;
    min: number;
    max: number;
}

// This can be used in the useApi hook for the Stats section for type safety
export type StatsErrorResponse = ErrorResponse;