import { errorLog, infoLog, successLog } from './utils';
import 'dotenv/config';

export const FAILED_IMAGE_TEXT = 'failed';

const apiKey = process.env.REPLICATE_API_KEY;

const sendPredictionRequest = async (imageUrl: string) => {
  return fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${apiKey}`,
    },
    body: JSON.stringify({
      version:
        '2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746',
      input: {
        image: imageUrl,
      },
    }),
  });
};

const getResultFromReplicate = async (endpointUrl: string) => {
  return fetch(endpointUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${apiKey}`,
    },
  });
};

async function imageToText(imageUrl: string): Promise<string> {
  infoLog(`Sending request to Replicate for image: ${imageUrl}`);

  const replicateRes = await sendPredictionRequest(imageUrl);

  if (!replicateRes.ok) {
    const errorText = await replicateRes.text();
    errorLog(`HTTP Error: ${replicateRes.status}, Body: ${errorText}`);
    return FAILED_IMAGE_TEXT;
  }

  const data = await replicateRes.json();

  if (!data?.urls?.get) {
    errorLog(`Missing "urls.get" in API response`);
    return FAILED_IMAGE_TEXT;
  }

  let endpointUrl = data?.urls.get;
  let imageText: string | null = null;

  while (!imageText) {
    const finalResponse = await getResultFromReplicate(endpointUrl);
    const jsonFinalResponse = await finalResponse.json();

    if (jsonFinalResponse.status === 'succeeded') {
      let rawText = jsonFinalResponse.output;
      let strippedText = rawText.replace(/Caption:\s*/i, '');
      imageText = strippedText.charAt(0).toUpperCase() + strippedText.slice(1);
      successLog(`Replicate returned: ${imageText} \n`);
      break;
    } else if (jsonFinalResponse.status === FAILED_IMAGE_TEXT) {
      errorLog(`Replicate failed to return a result`);
      break;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return imageText ? imageText : FAILED_IMAGE_TEXT;
}

export { imageToText };
