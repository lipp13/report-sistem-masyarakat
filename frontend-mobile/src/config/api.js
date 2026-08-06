import { Platform } from 'react-native';

/**
 * Untuk emulator Android gunakan 10.0.2.2 agar mengarah ke localhost PC.
 * Untuk perangkat fisik, ganti LAN_IP dengan IP komputer Anda (mis. 192.168.1.5).
 */
const LAN_IP = null;

const host =
  LAN_IP || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

export const API_PORT = '5000';
export const API_ROOT = `http://${host}:${API_PORT}`;
export const API_URL = `${API_ROOT}/api`;
