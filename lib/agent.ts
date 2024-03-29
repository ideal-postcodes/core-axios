import Axios, { AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";
import { AxiosResponse, AxiosInstance } from "axios";
import {
  Agent as IAgent,
  HttpRequest,
  HttpResponse,
  errors,
} from "@ideal-postcodes/core-interface";

const {
  /**
   * Ideal Postcodes base error class implemented in [core-interface](https://core-interface.ideal-postcodes.dev/classes/idealpostcodeserror.html)
   */
  IdealPostcodesError,
} = errors;

// @hidden
//interface GotHeaders {
//  [key: string]: string | string[] | undefined;
//}

/**
 * @hidden
 */
interface ToHeader {
  (gotHeaders: RawAxiosResponseHeaders | AxiosResponseHeaders): Record<string, string>;
}

/**
 * Converts a Got header object to one that can be used by the client
 *
 * @hidden
 */
export const toHeader: ToHeader = (gotHeaders) =>
  Object.keys(gotHeaders).reduce<Record<string, string>>((headers, key) => {
    const val = gotHeaders[key];
    if (typeof val === "string") {
      headers[key] = val;
    } else if (Array.isArray(val)) {
      headers[key] = val.join(",");
    }
    return headers;
  }, {});

/**
 * Adapts got responses to a format consumable by core-interface
 *
 * @hidden
 */
const toHttpResponse = (
  httpRequest: HttpRequest,
  response: AxiosResponse<any>
): HttpResponse => ({
  httpRequest,
  body: response.data,
  httpStatus: response.status || 0,
  header: toHeader(response.headers),
  metadata: { response },
});

/**
 * Catch non-response errors (e.g. network failure, DNS failure, timeout)
 * wrap in our Error class and return
 *
 * @hidden
 */
const handleError = (error: Error): Promise<never> => {
  const idpcError = new IdealPostcodesError({
    message: `[${error.name}] ${error.message}`,
    httpStatus: 0,
    metadata: { axios: error },
  });
  return Promise.reject(idpcError);
};

// Don't throw errors for any HTTP status code
// Allow core-interface to absorb these and emit own errors
const validateStatus = () => true;

/**
 * Agent
 *
 * @hidden
 */
export class Agent implements IAgent {
  public Axios: AxiosInstance;

  constructor() {
    this.Axios = Axios.create({ validateStatus });
  }

  private requestWithBody(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { body, method, timeout, url, header, query } = httpRequest;
    return this.Axios.request({
      url,
      method,
      headers: header,
      params: query,
      data: body,
      timeout,
    })
      .then((response) => toHttpResponse(httpRequest, response))
      .catch(handleError);
  }

  private request(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { method, timeout, url, header, query } = httpRequest;
    return this.Axios.request({
      url,
      method,
      headers: header,
      params: query,
      timeout,
    })
      .then((response) => toHttpResponse(httpRequest, response))
      .catch(handleError);
  }

  public http(httpRequest: HttpRequest): Promise<HttpResponse> {
    if (httpRequest.body !== undefined)
      return this.requestWithBody(httpRequest);
    return this.request(httpRequest);
  }
}
