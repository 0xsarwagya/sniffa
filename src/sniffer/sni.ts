import tls, {
	type SecureContext,
	type CommonConnectionOptions,
	type SecureContextOptions,
} from "node:tls";
import pem from "pem";

const cache = new Map<string, SecureContext | undefined>();

export const SniCallback =
	(
		serviceKey: SecureContextOptions["key"],
		serviceCertificate: SecureContextOptions["cert"],
	): CommonConnectionOptions["SNICallback"] =>
	(serverName, cb) => {
		if (cache.has(serverName)) {
			const ctx = cache.get(serverName);
			return cb(null, ctx);
		}

		const key = serviceKey?.toString();
		if (!key) {
			throw new Error("Root Key not found");
		}

		pem.createCertificate(
			{
				country: "IN",
				state: "Bihar",
				locality: "Muzaffarpur",
				commonName: serverName,
				altNames: [serverName],
				serviceKey: key,
				serviceCertificate,
				serial: Date.now(),
				days: 365,
			},
			(err, result) => {
				const { clientKey, certificate } = result;
				const ctx = tls.createSecureContext({
					key: clientKey,
					cert: certificate,
				});
				cache.set(serverName, ctx);
				cb(err, ctx);
			},
		);
	};
