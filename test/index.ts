import { assert } from "chai";
import { Agent, Client } from "../lib/index";

describe("Module exports", () => {
  it("exports Agent", () => {
    assert.isDefined(Agent);
  });
  it("exports Client", () => {
    assert.isDefined(Client);
  });
});
