import * as dotenv from 'dotenv'
dotenv.config()

const { NEXT_PUBLIC_HTTP_PROXY_URL } = process.env
if (!NEXT_PUBLIC_HTTP_PROXY_URL) {
  throw new Error('NEXT_PUBLIC_HTTP_PROXY_URL is not set')
}
export const PROXY_URL = NEXT_PUBLIC_HTTP_PROXY_URL
