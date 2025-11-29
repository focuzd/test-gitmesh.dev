# GitMesh Community Edition Website

GitMesh Community Edition (CE) is the open-source foundation of the GitMesh ecosystem. It provides the core components for market-signal ingestion, engineering telemetry correlation, and automated backlog generation. CE is maintained under the Linux Foundation Decentralized Trust model, ensuring transparency, neutrality, and long-term reliability.

The project currently operates on a legacy peer-dependency architecture. Improvements to package management, module boundaries, and dependency isolation are part of the CE roadmap, and contributors are welcome to participate in this transition.

---

## Contributing

All contribution tracking is managed through the LFDT GitMesh repository.

1. Open an issue at:
   [https://github.com/LF-Decentralized-Trust-labs/gitmesh](https://github.com/LF-Decentralized-Trust-labs/gitmesh)

2. Request the issue to be labeled:
   `gitmesh-website`

3. Follow the contribution rules and workflows defined in the LFDT GitMesh project.

The website code itself lives in this repository but is pulled into the LFDT repo as a submodule.
All reviews, assignments, and governance follow LFDT’s contribution model.

---

## Development

Install dependencies:

```
npm i --legacy-peer-deps
```

Run local development:

```
npm run dev
```

Build for production:

```
npm run build
```

---

## Structure

This repository contains only the website source.
All feature requests, tasks, contributor roles, and governance are managed centrally in:

[https://github.com/LF-Decentralized-Trust-labs/gitmesh](https://github.com/LF-Decentralized-Trust-labs/gitmesh)