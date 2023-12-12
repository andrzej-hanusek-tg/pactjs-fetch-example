import path from "path";
import { MatchersV3, PactV3 } from "@pact-foundation/pact";
import axios from "axios";
import { describe, expect, it } from "vitest";

// Create a 'pact' between the two applications in the integration we are testing
const provider = new PactV3({
  dir: path.resolve(process.cwd(), "pacts"),
  consumer: "MyConsumer",
  provider: "MyProvider",
});

class DogService {
  constructor(private url: string) {}

  public getMeDogs = async (from: string) => {
      return axios.request({
        baseURL: this.url,
        params: { from },
        headers: { Accept: "application/json" },
        method: "GET",
        url: "/dogs",
      }).catch(function (error) {
        // https://axios-http.com/docs/handling_errors
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
      });

  };

  public getMeDogsFetch = async (from: string, url: string) => {
    const res = await fetch(`${url}/dogs?from=${from}`, {
      headers: { Accept: "application/json" },
      method: "GET",
    });

    return res.json();
  };
}
// API Client that will fetch dogs from the Dog API
// This is the target of our Pact test

const dogExample = { dog: 1 };
const EXPECTED_BODY = MatchersV3.eachLike(dogExample);

describe("GET /dogs", () => {
  it.only("[AXIOS] returns an HTTP 200 and a list of dogs", () => {
    // Arrange: Setup our expected interactions
    //
    // We use Pact to mock out the backend API
    provider
      .given("I have a list of dogs")
      .uponReceiving("a request for all dogs with the builder pattern")
      .withRequest({
        method: "GET",
        path: "/dogs",
        query: { from: "today" },
        headers: { Accept: "application/json" },
      })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: EXPECTED_BODY,
      });

    return provider
      .executeTest(async (mockserver) => {
        // Act: test our API client behaves correctly
        //
        // Note we configure the DogService API client dynamically to
        // point to the mock service Pact created for us, instead of
        // the real one
        const dogService = new DogService(mockserver.url);
        return await dogService.getMeDogs("today");

        // Assert: check the result
        // expect(response.data[0]).to.deep.eq(dogExample);
        // @ts-ignore
      })
      .then((response) => {
        expect(response.data[0]).to.deep.eq(dogExample);
      });
  });
  it("[FETCH] returns an HTTP 200 and a list of dogs", () => {
    // Arrange: Setup our expected interactions
    //
    // We use Pact to mock out the backend API
    provider
      .given("I have a list of dogs #2")
      .uponReceiving("a request for all dogs with the builder pattern")
      .withRequest({
        method: "GET",
        path: "/dogs",
        query: { from: "today" },
        headers: { Accept: "application/json" },
      })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: EXPECTED_BODY,
      });

    return provider
      .executeTest(async (mockserver) => {
        // Act: test our API client behaves correctly
        //
        // Note we configure the DogService API client dynamically to
        // point to the mock service Pact created for us, instead of
        // the real one
        const dogService = new DogService(mockserver.url);
        return await dogService.getMeDogsFetch("today", mockserver.url);
      })
      .then((response) => {
        expect(response[0]).to.deep.eq(dogExample);
      });
  });
});
