package com.rapidresponse.app.exception;

public class AlgorithmExecutionException extends RuntimeException {

    private final String algorithmName;

    public AlgorithmExecutionException(String algorithmName, String message) {
        super(message);
        this.algorithmName = algorithmName;
    }

    public AlgorithmExecutionException(String algorithmName, String message, Throwable cause) {
        super(message, cause);
        this.algorithmName = algorithmName;
    }

    public String getAlgorithmName() {
        return algorithmName;
    }
}
