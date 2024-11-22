const nextConfig = {
  env: {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    MONGODB_DB: process.env.MONGODB_DB,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  /* config options here */
};

export default nextConfig;
