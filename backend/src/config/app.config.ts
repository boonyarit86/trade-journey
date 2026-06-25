import { NODE_PORT } from "src/constants";

export interface AppConfigType {
    port: number;
}

export default (): AppConfigType => ({
    port: NODE_PORT,
});