import {
  Client as CoreInterface,
  defaults
} from "@ideal-postcodes/core-interface";
import { Agent } from "./agent";

export interface Config {
  /**
   * Use TLS. Defaults to `true`
   */
  tls?: boolean;
  /**
   * API Key. Used in API helper methods
   */
  api_key: string;
  /**
   * Target API hostname. Defaults to `'api.ideal-postcodes.co.uk'`
   */
  baseUrl?: string;
  /**
   * API version. Defaults to `'v1'`
   */
  version?: string;
  /**
   * Force autocomplete authorisation via HTTP headers only. Defaults to `false`
   */
  strictAuthorisation?: boolean;
  /**
   * Default time in ms before HTTP request timeout. Defaults to 10s (`10000`)
   */
  timeout?: number;
  /**
   * String map specifying default headers
   */
  header?: Record<string, string>;
  /**
   * Optional tags to append to helper requests
   */
  tags?: string[];
}

export class Client extends CoreInterface {
  /**
   * Client constructor extends CoreInterface
   */
  constructor(config: Config) {
    const agent = new Agent();
    const header = {};
    const tls = config.tls === undefined ? defaults.tls : config.tls;
    const baseUrl = config.baseUrl === undefined ? defaults.baseUrl : config.baseUrl;
    const version = config.version === undefined ? defaults.version : config.version;
    const strictAuthorisation =
      config.strictAuthorisation === undefined
        ? defaults.strictAuthorisation
        : config.strictAuthorisation;
    const timeout = config.timeout === undefined ? defaults.timeout : config.timeout;
    const tags = config.tags || [];

    const { api_key } = config;
    const interfaceConfig = {
      tls,
      api_key,
      baseUrl,
      version,
      strictAuthorisation,
      timeout,
      tags,
      header: { ...header, ...config.header },
    };
    super({ agent, ...interfaceConfig });
  }
}
