# Single Docker Image Deployment

This Dockerfile creates a single Docker image that contains both the frontend and backend of the navigation panel application.

## Features

- **Single Image**: Both frontend and backend packaged in one Docker image
- **Single Container**: Deploy the entire application with one container
- **PM2 Process Manager**: Manages both services with automatic restarts
- **Optimized Build**: Multi-stage build for smaller image size

## Architecture

```
┌─────────────────────────────────────┐
│      Docker Container               │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   Frontend   │  │   Backend   │ │
│  │   (Port 3000)│  │  (Port 3001)│ │
│  │   (Static)   │  │   (API)     │ │
│  └──────────────┘  └─────────────┘ │
│                                     │
│  ┌──────────────────────────────┐  │
│  │      PM2 Process Manager     │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Quick Start

### Build the Image

```bash
docker build -f Dockerfile.single -t nav-panel:latest .
docker buildx build -f Dockerfile.single --platform linux/amd64,linux/arm64 -t yaonew/nav-panel:1.0.1 . --push
```

### Run the Container

```bash
docker run -d \
  --name nav-panel \
  -p 3000:3000 \
  yaonew/nav-panel:latest
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## Docker Compose (Optional)

Create a `docker-compose.single.yml` file:

```yaml
version: '3.8'

services:
  nav-panel:
    build:
      context: .
      dockerfile: Dockerfile.single
    image: nav-panel:latest
    container_name: nav-panel
    ports:
      - "3000:3000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

Run with:

```bash
docker-compose -f docker-compose.single.yml up -d
```

## Environment Variables

You can pass environment variables to the container:

```bash
docker run -d \
  --name nav-panel \
  -p 3000:3000 \
  -e NODE_ENV=production \
  nav-panel:latest
```

## Data Persistence

The application stores data in `/app/server/data.json` inside the container. To persist data:

```bash
docker run -d \
  --name nav-panel \
  -p 3000:3000 \
  -v nav-data:/app/server \
  nav-panel:latest
```

Or with docker-compose:

```yaml
services:
  nav-panel:
    # ... other config
    volumes:
      - nav-data:/app/server

volumes:
  nav-data:
```

## Viewing Logs

```bash
# View all logs
docker logs nav-panel

# Follow logs in real-time
docker logs -f nav-panel

# View PM2 logs inside container
docker exec nav-panel pm2 logs
```

## Managing the Container

```bash
# Stop the container
docker stop nav-panel

# Start the container
docker start nav-panel

# Restart the container
docker restart nav-panel

# Remove the container
docker rm -f nav-panel
```

## Health Check

Add a health check to your docker run command:

```bash
docker run -d \
  --name nav-panel \
  -p 3000:3000 \
  -p 3001:3001 \
  --health-cmd="curl -f http://localhost:3001/api/categories || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  nav-panel:latest
```

## Production Deployment

For production, consider:

1. **Use specific version tags**:
   ```bash
   docker build -f Dockerfile.single -t nav-panel:1.0.0 .
   ```

2. **Set resource limits**:
   ```bash
   docker run -d \
     --name nav-panel \
     -p 3000:3000 \
     --memory="512m" \
     --cpus="1.0" \
     nav-panel:latest
   ```

3. **Use environment file**:
   ```bash
   docker run -d \
     --name nav-panel \
     -p 3000:3000 \
     --env-file .env.production \
     nav-panel:latest
   ```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs nav-panel

# Run interactively for debugging
docker run -it --rm nav-panel:latest sh
```

### Services not responding

```bash
# Check if services are running
docker exec nav-panel pm2 list

# Check PM2 logs
docker exec nav-panel pm2 logs
```

### Data not persisting

Make sure you're using volumes:
```bash
docker inspect nav-panel | grep -A 10 "Mounts"
```

## Image Size

The optimized multi-stage build results in a relatively small image:

```bash
docker images nav-panel
```

Expected size: ~200-300MB

## Comparison with Multi-Container Setup

| Feature | Single Image | Multi-Container |
|---------|-------------|-----------------|
| Deployment | Simpler | More complex |
| Scaling | Limited | Better |
| Resource Isolation | Shared | Separate |
| Management | One container | Multiple containers |
| Use Case | Small deployments | Large scale |

## Default Credentials

- Username: `admin`
- Password: `admin123`

**Important**: Change the default password after first login!

## License

MIT License
