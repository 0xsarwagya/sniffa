import { equal } from "node:assert/strict";
import { Sniffa } from "../index.ts";
import { SniCallback } from "../index.ts";
import { describe, it } from "node:test";
import { isValidAddress } from "../sniffer/utils.ts";

describe("Sniffa", () => {
  // Test for server creation
  it("should create a Sniffa server instance", () => {
    const sniffa = Sniffa.createServer();
    equal(sniffa instanceof Sniffa, true); // Check that an instance of Sniffa is created
  });
});

describe("isValidAddress", () => {
  it("should return true for valid address", () => {
    const addr = {
      address: "100.0.0.1",
      family: "IPv4",
      port: 3000,
    };

    equal(isValidAddress(addr), true);
  });

  it("should return false for invalid address", () => {
    const addr = {
      address: undefined,
      family: "IPv4",
      port: 3000,
    };

    // @ts-expect-error - Testing for invalid address
    equal(isValidAddress(addr), false);
  });

  it("should return false for null address", () => {
    const addr: null = null;

    equal(isValidAddress(addr), false);
  });

  it("should return false for string address", () => {
    const addr = "127.0.0.1";

    equal(isValidAddress(addr), false);
  });
});

describe("SNI Callback", () => {
  it("should return a function", () => {
    const sniCallback = SniCallback;

    equal(typeof sniCallback, "function");
  });

  it("should return a function that returns a string", () => {
    const sniCallback = SniCallback("key", "cert");

    equal(typeof sniCallback, "function");
  });
});
