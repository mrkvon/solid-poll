import { ConfigError } from '../utils/errors.js'
import { envToBoolean } from './helpers.js'

// define environment variables via .env file, or via environment variables directly

if (!process.env.PORT || isNaN(Number(process.env.PORT))) {
  throw new ConfigError('Please specify PORT in environment variables.')
}
export const port = +process.env.PORT

// server base url
const baseUrl =
  process.env.NODE_ENV === 'vitest' || !process.env.BASE_URL
    ? `http://localhost:${port}`
    : process.env.BASE_URL

export const webId = new URL('/card#bot', baseUrl).toString()

export const isBehindProxy = envToBoolean(process.env.BEHIND_PROXY)
