import * as dotenv from 'dotenv'
dotenv.config()

const PROD = true
const NEXT_PUBLIC_GCA_API_URL = PROD
  ? process.env.NEXT_PUBLIC_GCA_API_URL
  : 'http://0.0.0.0:8787'

if (!NEXT_PUBLIC_GCA_API_URL) {
  throw new Error('NEXT_PUBLIC_GCA_API_URL is not set')
}
export const API_URL = NEXT_PUBLIC_GCA_API_URL
// export const API_URL = 'http://0.0.0.0:8787'
//

export const RUST_URL = 'https://fun-rust-production.up.railway.app'
