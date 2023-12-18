import * as dotenv from 'dotenv'
dotenv.config()

const NEXT_PUBLIC_GCA_API_URL = process.env.NEXT_PUBLIC_GCA_API_URL
if (!NEXT_PUBLIC_GCA_API_URL) {
  throw new Error('NEXT_PUBLIC_GCA_API_URL is not set')
}
export const API_URL = NEXT_PUBLIC_GCA_API_URL
// export const API_URL = 'http://0.0.0.0:8787'
//
