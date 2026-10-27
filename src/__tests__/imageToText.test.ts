import { FAILED_IMAGE_TEXT, imageToText } from '../imageToText';
import axios from 'axios';

const VALID_URLS = [
  {
    url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_272x92dp.png',
    alt: 'The google logo',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Hausziege_04.jpg',
    alt: 'A goat standing on top of a wooden post',
  },
];

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('imageToText', () => {
  beforeEach(() => {
    mockedAxios.post.mockReset();
  });

  it('should return the correct text when the API call is successful', async () => {
    const mockResponse = {
      data: {
        urls: { get: 'http://api.replicate.com/someUrl' },
      },
    };
    const mockOutput = {
      status: 'succeeded',
      output: 'someText',
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);
    mockedAxios.get.mockResolvedValueOnce({ data: mockOutput });

    const result1 = await imageToText(VALID_URLS[0].url);
    expect(result1).toEqual(VALID_URLS[0].alt);
  });

  it('should return "failed" when the API call is unsuccessful', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('API call failed'));

    const result = await imageToText('invalidImageUrl');
    expect(result).toEqual(FAILED_IMAGE_TEXT);
  });

  it('should return "failed" when the image URL is invalid', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { message: 'Invalid image URL' },
      status: 400,
    });

    const result = await imageToText('invalidImageUrl');
    expect(result).toEqual(FAILED_IMAGE_TEXT);
  });

  it('should return "failed" when the API response is unexpected', async () => {
    const mockInitialResponse = {
      data: {
        urls: { get: 'http://api.replicate.com/someUrl' },
      },
    };
    const mockOutput = {
      unexpectedField: 'unexpectedValue',
    };

    mockedAxios.post.mockResolvedValueOnce(mockInitialResponse);
    mockedAxios.get.mockResolvedValueOnce({ data: mockOutput });

    const result = await imageToText('invalidImageUrl');
    expect(result).toEqual(FAILED_IMAGE_TEXT);
  });
});
