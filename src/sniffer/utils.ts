import type { AddressInfo } from "node:net";
import winston from "winston";

const ipRegex =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

export const isValidAddress = (
  addr: AddressInfo | string | null
): addr is AddressInfo => {
  if (addr === null) {
    return false;
  }

  if (typeof addr === "object" && "address" in addr && "port" in addr) {
    const { address: ip, port } = addr as AddressInfo;

    // Simple validation for ip (can be improved to use a more sophisticated regex)
    if (
      ipRegex.test(ip) &&
      Number.isInteger(port) &&
      port > 0 &&
      port <= 65535
    ) {
      return true;
    }
  }

  return false;
};

export const createLogger = (label: string) =>
  winston.createLogger({
    levels: {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      verbose: 4,
      debug: 5,
      silly: 6,
    },
    format: winston.format.combine(
      winston.format.label({ label }),
      winston.format.colorize(),
      winston.format.timestamp({
        format: () => {
          return new Date().toLocaleString("en-US");
        },
      }),
      winston.format.align(),
      winston.format.printf(
        (info) =>
          `\x1b[34m(${info.label})\x1b[0m \x1b[33m${info.timestamp}\x1b[0m [${info.level}]: ${info.message}`
      )
    ),
    transports: [new winston.transports.Console()],
  });
