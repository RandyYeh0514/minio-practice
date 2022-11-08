import fastify, { FastifyInstance } from "fastify";
import fastifyMultipart from '@fastify/multipart'
import fs from 'fs'
import util from 'util'
import { pipeline } from "stream";
import * as minio from 'minio'

const server: FastifyInstance = fastify(
    {
        logger: {
          transport: {
            target: 'pino-pretty'
          },
          level: 'debug'
        }
    }
)

export const startFastify: (port: number) => FastifyInstance = (port) => {
    const listenAddress = '0.0.0.0'
    const fastifyConfig = {
        port: port,
        host: listenAddress
    }

    server.listen(fastifyConfig, (error, _) => {
        if (error) {
            console.error(error)
        }
    })

    server.register(fastifyMultipart)

    const minioClient = new minio.Client({
        endPoint: 'localhost',
        port: 9000,
        useSSL: false,
        accessKey: 'user01',
        secretKey: '1qaz2wsx'
      })

    server.get('/ping', async (request, reply) => {
        return reply.status(200).send({ msg: 'pong' })
    })

    server.post('/upload', async (request, reply) => {
        const data = await request.file()
        
        if (data) {
            const fileBuffer = await data.toBuffer()
            await minioClient.putObject('bucket01', data.filename, fileBuffer)
            // const pump = util.promisify(pipeline)
            // await pump(data.file, fs.createWriteStream(`uploads/${data.filename}`))
        }

        // https://ithelp.ithome.com.tw/articles/10306493
        // https://github.com/minio/minio-js#quick-start-example---file-uploader
        return reply.status(200).send({ fileName: data?.filename})
    })

    server.post('/upload-local', async (request, reply) => {
        const file = 'static/excel.xlsx'
        minioClient.fPutObject('bucket01', 'excel.xlsx', file)

        return reply.status(200).send({ fileName: 'xxx'})
    })

    return server
}