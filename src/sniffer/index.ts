import { EventEmitter } from "node:events";
import http, { type IncomingMessage } from "node:http";
import https, { type ServerOptions } from "node:https";
import net, { type Socket } from "node:net";
import type { SecureContextOptions } from "node:tls";
import type { StrictEventEmitter } from "strict-event-emitter-types";
import { SniCallback } from "./sni.ts";
import { isValidAddress } from "./utils.ts";
import { createLogger } from "./utils.ts";

const logger = createLogger("Sniffer");

export type Opt = {
	secure?: {
		key: SecureContextOptions["key"];
		cert: SecureContextOptions["cert"];
	};
};

const EventType = {
	log: "log",
	error: "error",
	request: "request",
	response: "response",
	info: "info",
} as const;

interface SniffaEvent {
	[EventType.response]: (response: http.IncomingMessage) => void;
	[EventType.request]: (request: http.IncomingMessage) => void;
	[EventType.info]: (info: string) => void;
	[EventType.error]: (error: Error) => void;
}

type SniffaEmitter = StrictEventEmitter<EventEmitter, SniffaEvent>;

const SniffaBase = EventEmitter as {
	new (): SniffaEmitter;
};

class Sniffa extends SniffaBase {
	private proxyServer: http.Server;
	private spoofingServer: http.Server;

	static createServer(opt?: Opt) {
		return new Sniffa(opt);
	}

	constructor(opt?: Opt) {
		super();
		this.proxyServer = http.createServer((fromClient, toClient) => {
			if (!fromClient.url) {
				throw new Error("Target URL not found.");
			}
			const url = new URL(fromClient.url);
			const h = url.protocol.startsWith("https") ? https : http;

			// Log the incoming request
			logger.info(`Incoming request: ${fromClient.method} ${fromClient.url}`);

			const toServer = h.request(
				{
					headers: fromClient.headers,
					protocol: url.protocol,
					method: fromClient.method,
					port: url.port,
					path: fromClient.url,
					hostname: url.hostname,
				},
				(fromServer) => {
					// Log the response details
					logger.info(
						`Response from server: ${fromServer.statusCode} ${fromServer.statusMessage}`,
					);

					toClient.writeHead(fromServer.statusCode || 500, fromServer.headers);
					fromServer.pipe(toClient, { end: true });
				},
			);
			fromClient.pipe(toServer, { end: true });
		});

		const createSpoofingServer = (reqListener: http.RequestListener) => {
			if (!opt?.secure) {
				return http.createServer(reqListener);
			}
			const tlsOpt: ServerOptions = {
				...opt.secure,
				// biome-ignore lint/style/useNamingConvention: <explanation>
				SNICallback: SniCallback(opt.secure.key, opt.secure.cert),
			};
			return https.createServer(tlsOpt, reqListener);
		};

		this.spoofingServer = createSpoofingServer((fromClient, toClient) => {
			const proxyAddress = this.proxyServer.address();
			if (!isValidAddress(proxyAddress)) {
				throw new Error(`Invalid proxy address: ${proxyAddress}`);
			}
			const toProxyServer = http.request(
				{
					port: proxyAddress.port,
					method: fromClient.method,
					headers: fromClient.headers,
					path: `https://${fromClient.headers.host}${fromClient.url}`,
				},
				(fromServer) => {
					toClient.writeHead(fromServer.statusCode || 500, fromServer.headers);
					fromServer.pipe(toClient, { end: true });
					toProxyServer.end();
				},
			);
			fromClient.pipe(toProxyServer);
		});
	}

	listen(port: number) {
		this.proxyServer.listen(port, "127.0.0.1", () => {
			// Log when the proxy server starts listening
			logger.info(`Proxy Server start listening: localhost:${port}`);
		});
		this.spoofingServer.listen(0, "127.0.0.1", () => {
			// Log when the spoofing server starts listening
			logger.info("Spoofing Server start listening: localhost:0");
		});

		this.proxyServer.on(
			"connect",
			(_: IncomingMessage, clientSocket: Socket, head: Buffer) => {
				const spoofingServerAddress = this.spoofingServer.address();
				if (!isValidAddress(spoofingServerAddress)) {
					throw new Error(`Invalid proxy address: ${spoofingServerAddress}`);
				}
				const serverSocket = net.connect(
					spoofingServerAddress.port,
					spoofingServerAddress.address,
				);
				serverSocket.on("connect", () => {
					clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
					clientSocket.write(head);
					clientSocket.pipe(serverSocket).pipe(clientSocket);
				});
			},
		);

		this.proxyServer.on("error", (e) => {
			// Log errors from the proxy server
			logger.error(`Proxy Server error: ${e.message}`);
		});
		this.spoofingServer.on("error", (e) => {
			// Log errors from the spoofing server
			logger.error(`Spoofing Server error: ${e.message}`);
		});
		this.spoofingServer.on("tlsClientError", (e) => {
			// Log TLS client errors
			logger.error(`TLS Client error: ${e.message}`);
		});
		process.on("uncaughtException", (e) => {
			// Log uncaught exceptions
			logger.error(`Uncaught exception: ${e.message}`);
		});
	}
}

export {
	Sniffa,
	type SniffaBase,
	type SniffaEmitter,
	type SniffaEvent,
	type EventType,
};
