// Base URL for the API
const BASE_URL = 'http://localhost:5001';

/**
 * Get the JWT token from localStorage
 * @returns {string|null} The JWT token or null if not found
 */
const getToken = () => localStorage.getItem('flashlearn_token');

/**
 * Create the headers object for fetch requests
 * @param {boolean} includeContent Whether to include Content-Type header
 * @returns {Headers} Headers object
 */
const createHeaders = (includeContent = true) => {
    const headers = new Headers();
    
    if (includeContent) {
        headers.append('Content-Type', 'application/json');
    }
    
    const token = getToken();
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    
    return headers;
};

/**
 * Handle API response
 * @param {Response} response Fetch Response object
 * @returns {Promise<any>} Parsed response data
 */
const handleResponse = async (response) => {
    const data = await response.json();
    
    if (!response.ok) {
        throw {
            status: response.status,
            message: data.message || 'An error occurred',
            data
        };
    }
    
    return data;
};

/**
 * Make a GET request to the API
 * @param {string} endpoint API endpoint (starting with /)
 * @returns {Promise<any>} Response data
 */
export const get = async (endpoint) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: createHeaders(false)
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('GET request failed:', error);
        throw error;
    }
};

/**
 * Make a POST request to the API
 * @param {string} endpoint API endpoint (starting with /)
 * @param {object} data Request body data
 * @returns {Promise<any>} Response data
 */
export const post = async (endpoint, data = {}) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: createHeaders(),
            body: JSON.stringify(data)
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('POST request failed:', error);
        throw error;
    }
};

/**
 * Make a PUT request to the API
 * @param {string} endpoint API endpoint (starting with /)
 * @param {object} data Request body data
 * @returns {Promise<any>} Response data
 */
export const put = async (endpoint, data = {}) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: createHeaders(),
            body: JSON.stringify(data)
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('PUT request failed:', error);
        throw error;
    }
};

/**
 * Make a DELETE request to the API
 * @param {string} endpoint API endpoint (starting with /)
 * @returns {Promise<any>} Response data
 */
export const del = async (endpoint) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: createHeaders()
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('DELETE request failed:', error);
        throw error;
    }
};