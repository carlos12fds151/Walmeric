import { createClient } from "redis";

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "") || 6379,
  },
  password: process.env.REDIS_PASSWORD || '',
  
});

const connectRedis = client.connect();

client.on('connect', () => {
  console.log('Redis client connected');
});

client.on('error', (error) => {
  console.log(error);
});

const get = async(key:string) => {
  await connectRedis;
  const response = await client.get(key)
  .catch((err) => console.log(err));
  return response;
};

const set = async(key: string, body:any) => {
  await connectRedis;
  const response = await client.set(key, body)
  .catch((err) => console.log(err));
  return response;
};

const del = async(key:string) => {
  await connectRedis;
  const response = await client.del(key)
  .catch((err) => console.log(err))
  return response;
}

export {
  get,
  set,
  del,
  connectRedis
}