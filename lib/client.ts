import {
  Client as CoreInterface,
  Config
} from "@ideal-postcodes/core-interface";
import { Agent } from "./agent";

export { Config };

export class Client extends CoreInterface {
  /**
   * Client constructor extends CoreInterface
   */
  constructor(config: Config) {
    const agent = new Agent();
    super({ agent, ...config });
  }
}
