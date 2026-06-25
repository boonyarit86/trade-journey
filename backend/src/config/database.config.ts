import { POSTGRES_DB, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_PORT, POSTGRES_USER } from "src/constants/database.constants";

export interface DatabaseConfigType {
    database: {
        host: string;
        user: string;
        password: string;
        database: string;
        port: number;
    };
}

export default (): DatabaseConfigType => ({
    database: {
        host: POSTGRES_HOST,
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        database: POSTGRES_DB,
        port: parseInt(POSTGRES_PORT, 10),
    },
});