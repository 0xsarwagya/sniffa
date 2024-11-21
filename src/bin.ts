#!/usr/bin/env node --no-warnings

import path from "node:path";
import yargs, { type ArgumentsCamelCase, type CommandModule } from "yargs";
import { hideBin } from "yargs/helpers";
import { Sniffa } from "./index.ts";

type Cliopts = {
	port: number;
	secure: boolean | undefined;
	cert: string | undefined;
	key: string | undefined;
};

const commandHandler = yargs(hideBin(process.argv));

commandHandler.demandCommand();
commandHandler.scriptName("sniffa");
commandHandler.usage("Usage: $0 <command> [options]");
commandHandler.help().alias("help", "h");
commandHandler.version().alias("version", "v");
commandHandler.strict();
commandHandler.showHelpOnFail(true);

const startCommand: CommandModule = {
	command: "start",
	describe: "Start the Sniffa Proxy and Spoofing server",
	builder: (yargs) => {
		return yargs
			.option("port", {
				alias: "p",
				type: "number",
				description: "The port to run the proxy server on",
				default: 8080,
				coerce: (arg) => {
					if (arg < 1 || arg > 65535) {
						throw new Error("Port must be between 1 and 65535");
					}

					return arg;
				},
			})
			.option("secure", {
				alias: "s",
				type: "boolean",
				description: "Enable HTTPS spoofing with TLS/SSL certificates",
				default: false,
			})
			.option("cert", {
				type: "string",
				description: "Path to the SSL certificate file",
				demandOption: false,
				implies: "secure",
				coerce: (arg) => {
					if (!arg) {
						return undefined;
					}

					try {
						path.resolve(arg);
					} catch (_) {
						throw new Error("Invalid certificate file");
					}
				},
			})
			.option("key", {
				type: "string",
				description: "Path to the SSL key file",
				demandOption: false,
				implies: "secure",
				coerce: (arg) => {
					if (!arg) {
						return undefined;
					}

					try {
						path.resolve(arg);
					} catch (_) {
						throw new Error("Invalid key file");
					}
				},
			});
	},
	handler: (argv) => {
		const { port, secure, cert, key } = argv as ArgumentsCamelCase<Cliopts>;
		const options = secure ? { secure: { cert, key } } : undefined;

		const sniffa = Sniffa.createServer(options);

		sniffa.listen(port);
	},
};

commandHandler.command(startCommand);

commandHandler.parse();
