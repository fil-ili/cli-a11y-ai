import axios from 'axios';
import { errorLog } from './utils';

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    // This endpoint is assumed to be a lightweight, non-billable request
    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version:
          '5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa',
        input: { text: 'Alice' },
      },
      {
        headers: { Authorization: `Token ${apiKey}` },
      }
    );

    // Consider both 200 and 201 as successful responses
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Handle 4xx or 5xx responses
        errorLog(
          `API key validation failed with status: ${error.response.status}, data: ${error.response.data}`
        );
      } else {
        // Handle network errors (no response)
        errorLog('Network error while validating API key.');
      }
    } else {
      // Handle non-Axios errors
      errorLog('Error occurred during API key validation.');
    }
    return false;
  }
}
