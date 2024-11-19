import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local')
}

const uri = process.env.MONGODB_URI
const options = {
    connectTimeoutMS: 10000, // Timeout sau 10 giây
    retryWrites: true,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
    // Trong development, sử dụng biến global để cache connection
    let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options)
        globalWithMongo._mongoClientPromise = client.connect()
            .catch(err => {
                console.error('Failed to connect to MongoDB:', err)
                throw err
            })
    }
    clientPromise = globalWithMongo._mongoClientPromise
} else {
    // Trong production, tạo new client mỗi lần
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
        .catch(err => {
            console.error('Failed to connect to MongoDB:', err)
            throw err
        })
}

// Thêm error handler
clientPromise.catch(err => {
    console.error('MongoDB connection error:', err)
})

export default clientPromise 