# Pueblo Builder Lab

An interactive 3D guide for a second-grade history project: building a Pueblo dwelling from cardboard and air-dry clay.

Rotate the model, explode it layer by layer, build it piece by piece, and learn the *why* behind each part — from adobe construction to desert climate design.

## Features

- **3D Builder** — rotate and zoom the finished Pueblo with orbit controls
- **Exploded view** — a slider peels the model apart so each layer is visible
- **Build Mode** — snap the pieces into place (base, walls, rooms, roof, vigas, ground) with a live materials counter
- **Build Steps** — a step-by-step illustrated sequence
- **Learn** — building theory, Pueblo history, and facts
- **Quiz** — check understanding with instant feedback
- **Reference** — finished-model and printable build/facts guides

## Tech

- [Three.js](https://threejs.org/) + OrbitControls, vendored locally under `pueblo-assets/vendor/`
- Plain HTML / CSS / vanilla JavaScript — no build step, no framework
- Responsive layout with a full mobile pass (`viewport-fit=cover` for notched phones)

## Run it

### Docker (recommended)

```bash
docker compose up --build
# open http://localhost:3003
```

### Plain static server

There is no build step — just serve the folder:

```bash
npx serve .
```

## Project layout

```
pueblo-builder-lab/
├── index.html          # app shell + panels
├── app.js              # Three.js scenes, build logic, quiz
├── styles.css          # all styling
├── nginx.conf          # nginx static config (Docker)
├── Dockerfile          # nginx:alpine image
├── docker-compose.yml
└── pueblo-assets/
    ├── vendor/         # vendored three.min.js + OrbitControls
    └── *.png           # build guide, facts guide, finished model
```

## Credits

3D rendering by [Three.js](https://threejs.org/) (MIT) and OrbitControls. All other content is original for this school project.
