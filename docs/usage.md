---
layout: default
title: Sniffa | NodeJS Usage
---

To use **Sniffa** in your project, follow these steps:

### 1. Install Sniffa as a Dependency

Run the following command to install **Sniffa** in your project:

```bash
npm install sniffa --save
```

This will add **Sniffa** to your project's dependencies, allowing you to import and use it within your code.

### 2. Import Sniffa in Your Project

Once installed, you can import and use **Sniffa** in your JavaScript or TypeScript files. Here's how to do that:

```typescript
import { Sniffa } from 'sniffa';
```

### 3. Use Sniffa to Start a Proxy and Spoofing Server

You can now use **Sniffa** in your project to create a proxy and spoofing server. Here's an example of how to do that:

```typescript
import { Sniffa } from 'sniffa';

const sniffa = Sniffa.createServer({
  secure: {
    cert: '/path/to/your/certificate.pem',
    key: '/path/to/your/private-key.pem'
  }
});

sniffa.listen(8080); // Start the server on port 8080
```

### 4. Optionally Use It with CLI

If you want to use **Sniffa** from the command line as well (with `npx sniffa`), you can still do that. The installation allows you to run `npx sniffa` directly from the command line without additional setup.

For example, you can start the proxy server using the command:

```bash
npx sniffa start --port 8080 --secure true --cert /path/to/cert.pem --key /path/to/key.pem
```

### 5. Access the Proxy Server

Once the server is running, you can access it through the specified port (e.g., `http://localhost:8080`). The server will handle the proxying of requests and spoofing as configured.

### Summary

- **Install Sniffa** via `npm install sniffa --save`.
- **Import Sniffa** into your project.
- **Create and configure** the Sniffa server.
- **Run and listen** for incoming requests on the desired port.

This method integrates **Sniffa** into your project so you can start using it for proxying and spoofing tasks.