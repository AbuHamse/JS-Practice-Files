type RequestOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
  url: string;
  body?: any;
  headers?: Record<string, string>;
};

export const asyncFetch = async ({ method, url, body, headers = {} }: RequestOptions): Promise<any> => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...(method !== 'GET' && method !== 'HEAD' ? { body: JSON.stringify(body) } : {}),
    };

    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(`Fetch error [${method} ${url}]:`, error);
    throw error;
  }
};

// Example usage with switch logic
export const handleRequest = async (method: string, url: string, body?: any) => {
  switch (method.toUpperCase()) {
    case 'GET':
      return await asyncFetch({ method: 'GET', url });

    case 'POST':
      return await asyncFetch({ method: 'POST', url, body });

    case 'PUT':
      return await asyncFetch({ method: 'PUT', url, body });

    case 'DELETE':
      return await asyncFetch({ method: 'DELETE', url });

    default:
      throw new Error(`Unsupported method: ${method}`);
  }
};
