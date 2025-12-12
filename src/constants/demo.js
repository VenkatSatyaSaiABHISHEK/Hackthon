// src/constants/demo.js

/**
 * Demo Configuration
 * 
 * Contains sample data for demo mode and fallback values
 */

export const DEMO_CHANNEL = {
  channelId: '2685107',
  readKey: 'DEMO_READ_KEY_PLACEHOLDER',
  name: 'AirGuard Demo Station',
  description: 'Sample indoor air quality monitoring station',
};

export const DEMO_USER = {
  email: 'demo@airguard.ai',
  name: 'Demo User',
  token: 'DEMO_TOKEN_123456',
};

export const SAMPLE_CSV_DATA = `timestamp,pm2.5,pm10,temperature,humidity,noise
2025-12-10 08:00:00,12.5,25.3,24.8,45.2,42.0
2025-12-10 09:00:00,15.3,28.1,25.1,44.8,43.5
2025-12-10 10:00:00,18.7,32.4,25.5,44.2,45.2
2025-12-10 11:00:00,22.1,35.8,26.2,43.5,46.8
2025-12-10 12:00:00,25.8,38.9,26.8,42.9,48.1
2025-12-10 13:00:00,28.4,42.1,27.3,42.1,49.3
2025-12-10 14:00:00,31.2,45.6,27.8,41.5,50.7
2025-12-10 15:00:00,34.5,48.2,28.2,40.8,52.1
2025-12-10 16:00:00,37.8,51.3,28.5,40.2,53.4
2025-12-10 17:00:00,39.2,53.7,28.7,39.8,54.2`;

export const DEMO_SUMMARY = {
  records: 10,
  last_reading: '2025-12-10T17:00:00Z',
  pm25_mean: '26.55',
  pm10_mean: '40.14',
  temp_mean: '26.89',
  humidity_mean: '42.50',
  noise_mean: '48.53',
};

export const SAMPLE_CSV_DOWNLOAD_URL = 'data:text/csv;charset=utf-8,' + encodeURIComponent(SAMPLE_CSV_DATA);

export default {
  DEMO_CHANNEL,
  DEMO_USER,
  SAMPLE_CSV_DATA,
  DEMO_SUMMARY,
  SAMPLE_CSV_DOWNLOAD_URL,
};
