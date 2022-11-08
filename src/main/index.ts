import * as dotenv from 'dotenv'
import { startFastify } from './server'

dotenv.config()
const port = process.env.FASTIFY_PORT || '8888'

// Start your server
const server = startFastify(parseInt(port))