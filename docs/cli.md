---
layout: default
title: Sniffa | CLI Usage
---

# Sniffa CLI Tool

Sniffa comes with a powerful CLI tool that allows you to easily start the Sniffa Proxy and Spoofing server from your terminal. You can run it using `npx sniffa` with various options to configure the server behavior.

## CLI Usage

To use the CLI, simply run the following command:

```bash
npx sniffa <command> [options]
```

### Commands

#### `start`

Starts the Sniffa Proxy and Spoofing server with the specified options.

##### Options:

- `-p, --port <number>`  
  Specifies the port to run the proxy server on (default: `8080`).
  - **Example**: `--port 8080`
  
- `-s, --secure <boolean>`  
  Enables HTTPS spoofing with TLS/SSL certificates. Default is `false`.
  - **Example**: `--secure true`

- `--cert <path>`  
  Specifies the path to the SSL certificate file (required if `secure` is enabled).
  - **Example**: `--cert /path/to/cert.pem`

- `--key <path>`  
  Specifies the path to the SSL key file (required if `secure` is enabled).
  - **Example**: `--key /path/to/key.pem`

##### Example Commands:

1. **Start the proxy server on port 8080 without HTTPS**:
    ```bash
    npx sniffa start
    ```

2. **Start the proxy server on port 8081 with HTTPS**:
    ```bash
    npx sniffa start --port 8081 --secure true --cert /path/to/cert.pem --key /path/to/key.pem
    ```

3. **Start the proxy server with a custom port**:
    ```bash
    npx sniffa start --port 3000
    ```

### Help

To view more details about available commands and options, use the `help` flag:

```bash
npx sniffa --help
```

---

**Sniffa** is open-source and licensed under the MIT License.
