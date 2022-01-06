import * as sinon from "sinon";
import { assert } from "chai";
import { Agent, toHeader } from "../lib/agent";
import { AxiosResponse } from "axios";
import { errors } from "../lib";

const { IdealPostcodesError } = errors;

describe("Agent", () => {
  let agent: Agent;

  beforeEach(() => {
    agent = new Agent();
  });

  describe("Agent class", () => {
    it("assigns axios client", () => {
      const a = new Agent();
      assert.isDefined(a.Axios);
    });
  });

  describe("toHeader", () => {
    it("coerces a header object into an object of strings", () => {
      const gotHeader = {
        foo: "bar",
        baz: ["quux", "quuux"],
        empty: undefined,
      };
      assert.deepEqual(toHeader(gotHeader), {
        foo: "bar",
        baz: "quux,quuux",
      });
    });
  });

  type HttpVerb = "GET" | "POST";

  describe("http", () => {
    it("delegates http requests to 'axios'", async () => {
      const method: HttpVerb = "GET";
      const query = { foo: "bar" };
      const header = { baz: "quux" };
      const url = "http://www.foo.com/";
      const timeout = 1000;
      const SUCCESS = 200;

      const response: unknown = {
        statusCode: SUCCESS,
        headers: header,
        body: Buffer.from("{}"),
        url,
      };

      const stub = sinon
        .stub(agent.Axios, "request")
        .resolves(response as AxiosResponse<Buffer>);

      await agent.http({ method, timeout, url, header, query });

      sinon.assert.calledOnce(stub);
      sinon.assert.calledWithExactly(stub, {
        url,
        method,
        headers: header,
        params: query,
        timeout,
      } as any);
    });

    it("provides JSON body with post request", async () => {
      const method: HttpVerb = "POST";
      const query = { foo: "bar" };
      const header = { baz: "quux" };
      const url = "http://www.foo.com/";
      const timeout = 1000;
      const SUCCESS = 200;
      const body = { foo: "bar" };

      const response: unknown = {
        statusCode: SUCCESS,
        headers: header,
        body: Buffer.from("{}"),
        url,
      };

      const stub = sinon
        .stub(agent.Axios, "request")
        .resolves(response as AxiosResponse<Buffer>);

      await agent.http({ body, method, timeout, url, header, query });

      sinon.assert.calledOnce(stub);
      sinon.assert.calledWithExactly(stub, {
        url,
        method,
        data: body,
        headers: header,
        params: query,
        timeout,
      } as any);
    });

    it("handles status code 0f 0", async () => {
      const url = "http://www.foo.com/";

      const response: unknown = {
        headers: {},
        body: Buffer.from("{}"),
        url,
      };

      const stub = sinon
        .stub(agent.Axios, "request")
        .resolves(response as AxiosResponse<Buffer>);

      const apiResponse = await agent.http({
        method: "GET",
        timeout: 1000,
        url,
        header: {},
        query: {},
      });

      assert.equal(apiResponse.httpStatus, 0);

      sinon.assert.calledOnce(stub);
      sinon.assert.calledWithExactly(stub, {
        url,
        method: "GET",
        headers: {},
        params: {},
        timeout: 1000,
      } as any);
    });

    describe("Configuration", () => {
      beforeEach(() => {
        agent = new Agent();
      });

      it("overrides HTTP configuration for GET requests", async () => {
        const method: HttpVerb = "GET";
        const query = { foo: "bar" };
        const header = { baz: "quux" };
        const url = "http://www.foo.com/";
        const SUCCESS = 200;

        const response: unknown = {
          statusCode: SUCCESS,
          headers: header,
          body: Buffer.from("{}"),
          url,
        };

        const stub = sinon
          .stub(agent.Axios, "request")
          .resolves(response as AxiosResponse<Buffer>);

        await agent.http({ method, timeout: 1000, url, header, query });

        sinon.assert.calledOnce(stub);
        sinon.assert.calledWithExactly(stub, {
          url,
          method,
          timeout: 1000,
          headers: header,
          params: query,
        } as any);
      });

      it("overrides HTTP configuration for POST requests", async () => {
        const method: HttpVerb = "POST";
        const query = { foo: "bar" };
        const header = { baz: "quux" };
        const url = "http://www.foo.com/";
        const SUCCESS = 200;
        const body = { foo: "bar" };

        const response: unknown = {
          statusCode: SUCCESS,
          headers: header,
          body: Buffer.from("{}"),
          url,
        };

        const stub = sinon
          .stub(agent.Axios, "request")
          .resolves(response as AxiosResponse<Buffer>);

        await agent.http({ body, method, timeout: 1000, url, header, query });

        sinon.assert.calledOnce(stub);
        sinon.assert.calledWithExactly(stub, {
          url,
          method,
          data: body,
          headers: header,
          params: query,
          timeout: 1000,
        } as any);
      });
    });
  });

  describe("Error handling", () => {
    it("wraps non-HTTP errors", async () => {
      const url = "http://www.foo.com/";

      const genericError = new Error("Generic error");

      sinon.stub(agent.Axios, "request").rejects(genericError);

      try {
        await agent.http({
          method: "GET",
          timeout: 1000,
          url,
          header: {},
          query: {},
        });
      } catch (error) {
        assert.instanceOf(error, IdealPostcodesError);
        // @ts-ignore
        assert.equal(error.metadata.axios, genericError);
        // @ts-ignore
        assert.equal(error.message, "[Error] Generic error");
        return;
      }

      throw new Error("This should be unreachable");
    });

    it("wraps non-HTTP got errors from HTTP requests with body", async () => {
      const url = "http://www.foo.com/";

      const genericError = new Error("Generic error");

      sinon.stub(agent.Axios, "request").rejects(genericError);

      try {
        await agent.http({
          method: "POST",
          timeout: 1000,
          body: { foo: "bar" },
          url,
          header: {},
          query: {},
        });
      } catch (error) {
        assert.instanceOf(error, IdealPostcodesError);
        // @ts-ignore
        assert.equal(error.metadata.axios, genericError);
        // @ts-ignore
        assert.equal(error.message, "[Error] Generic error");
        return;
      }

      throw new Error("This should be unreachable");
    });
  });
});
