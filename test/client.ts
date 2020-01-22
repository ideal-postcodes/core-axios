import { assert } from "chai";
import { Client, Config } from "../lib/client";
import { Agent } from "../lib/agent";
import {
  TLS,
  API_URL,
  VERSION,
  TIMEOUT,
  STRICT_AUTHORISATION,
  Config as InterfaceConfig,
} from "@ideal-postcodes/core-interface";

describe("Client", () => {
  describe("instantiation", () => {
    let client: Client;
    const api_key = "foo";

    beforeEach(() => {
      client = new Client({ api_key });
    });

    it("assigns default config values", () => {
      assert.equal(client.api_key, api_key);
      assert.equal(client.tls, TLS);
      assert.equal(client.baseUrl, API_URL);
      assert.equal(client.version, VERSION);
      assert.equal(client.strictAuthorisation, STRICT_AUTHORISATION);
      assert.equal(client.timeout, TIMEOUT);
    });

    it("allows default config values to be overwritten", () => {
      const options = {
        tls: false,
        api_key,
        baseUrl: "localhost:8008",
        version: "v0",
        strictAuthorisation: true,
        timeout: 2,
      };
      const customClient = new Client(options);
      assert.equal(customClient.api_key, options.api_key);
      assert.equal(customClient.tls, options.tls);
      assert.equal(customClient.baseUrl, options.baseUrl);
      assert.equal(customClient.version, options.version);
      assert.equal(
        customClient.strictAuthorisation,
        options.strictAuthorisation
      );
      assert.equal(customClient.timeout, options.timeout);
    });
  });

  describe("Config", () => {
    it("weakly matches interface provided by core-interface", () => {
      const agent = new Agent();
      const header = {};
      // This test will fail to compile if config types are not compatible
      const options = {
        tls: false,
        api_key: "foo",
        baseUrl: "localhost:8008",
        version: "v0",
        strictAuthorisation: true,
        timeout: 2,
        agent,
        header,
      };
      const interfaceConfig: InterfaceConfig = options;
      const config: Config = options;
      assert.deepEqual(config, interfaceConfig);
    });
  });
});
