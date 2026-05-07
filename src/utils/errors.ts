export class QdrantError extends Error {
  constructor(message: string, public statusCode?: number, public details?: any) {
    super(message);
    this.name = 'QdrantError';
  }
}

export const handleApiError = (error: any): QdrantError => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return new QdrantError(
      `API Error: ${error.response.data.status?.error || error.message}`,
      error.response.status,
      error.response.data
    );
  } else if (error.request) {
    // The request was made but no response was received
    return new QdrantError('Network Error: No response received from server');
  } else {
    // Something happened in setting up the request that triggered an Error
    return new QdrantError(`Request Error: ${error.message}`);
  }
};