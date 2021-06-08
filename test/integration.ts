import { assert } from "chai";
import { Client } from "../lib/client";
import { ping, lookupPostcode, errors } from "../lib";
import { loadHttpFixtures } from "./fixtures/index";

loadHttpFixtures(__filename);

const SUCCESS = 200;

const api_key = process.env.VALID_API_KEY || "iddqd";
const client = new Client({ api_key });
const { IdpcInvalidKeyError, IdpcRequestFailedError } = errors;

describe("Client integration test", () => {
  describe("ping", () => {
    it("pings /", async () => {
      const response = await ping(client);
      assert.equal(response.httpStatus, SUCCESS);
    });
  });

  /**
   * Implement test methods documented in ideal-postcodes.co.uk/documentation/testing
   */

  describe("lookupPostcode", () => {
    it("retrieves postcode", async () => {
      const postcode = "SW1A 2AA";
      const addresses = await lookupPostcode({ client, postcode });
      assert.isTrue(addresses.length > 0);
      assert.equal(addresses[0].postcode, postcode);
    });

    it("returns empty array for invalid postcode", async () => {
      const postcode = "Definitely bogus";
      const addresses = await lookupPostcode({ client, postcode });
      assert.deepEqual(addresses, []);
    });

    it("returns an error for limit breached", async () => {
      const postcode = "ID1 CLIP";
      try {
        await lookupPostcode({client, postcode });
      } catch (error) {
        assert.isTrue(error instanceof IdpcRequestFailedError);
        return;
      }
      throw new Error("This line should be unreachable");
    });

    it("returns an error for balance depleted", async () => {
      const postcode = "ID1 CHOP";
      try {
        await lookupPostcode({ client, postcode });
      } catch (error) {
        assert.isTrue(error instanceof IdpcRequestFailedError);
        return;
      }
      throw new Error("This line should be unreachable");
    });

    it("returns an error for invalid key", async () => {
      const postcode = "SW1A 2AA";
      try {
        await lookupPostcode({ client, postcode, api_key: "badKey" });
      } catch (error) {
        assert.isTrue(error instanceof IdpcInvalidKeyError);
        return;
      }
      throw new Error("This line should be unreachable");
    });
  });
});
