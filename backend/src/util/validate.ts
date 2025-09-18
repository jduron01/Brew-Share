import { cleanEnv, port, str } from "envalid";
import dotenv from "dotenv";

dotenv.config();

export default cleanEnv(process.env, {
    MONGO_CONNECTION_STRING: str(),
    PORT: port(),
    SESSION_SECRET: str(),
    UPSTASH_REDIS_REST_URL: str(),
    UPSTASH_REDIS_REST_TOKEN: str(),
});
