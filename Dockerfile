# syntax=docker/dockerfile:1

# Resolve and update both the tag and digest together when upgrading base images.
FROM node:24-bookworm-slim@sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6 AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --no-audit --no-fund

COPY . .
# Vite variables are public and compiled into the bundle. Always use same-origin
# API calls in this production image; no server address or secret is needed.
RUN VITE_API_BASE_URL= npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine@sha256:ed04ec1ff34502c339ee5c3ae3f855442398edc1d05591e2b98981dcbbd20b1e AS runtime
USER root
# Apply the available PCRE2 security fix newer than this pinned base image.
RUN apk upgrade --no-cache pcre2
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

USER 101:101
EXPOSE 8080
STOPSIGNAL SIGQUIT
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

# Skip the upstream entrypoint's configuration edits: our config is immutable.
# Only /tmp must be writable; Compose supplies a small tmpfs there.
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
