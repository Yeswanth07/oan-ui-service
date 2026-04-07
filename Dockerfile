# Stage 1: Build
FROM node:22-alpine AS build

# Accept build-time arguments for Vite environment variables
ARG VITE_API_BASE_URL
ARG VITE_API_KEY
ARG MODE=development

WORKDIR /usr/local/app
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps
COPY ./ ./

# Write build args to .env so Vite can pick them up during build
RUN echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}" > .env && \
    echo "VITE_API_KEY=${VITE_API_KEY}" >> .env && \
    echo "MODE=${MODE}" >> .env

RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /usr/local/app/dist .
# Add nginx config for SPA routing
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8081
CMD ["nginx", "-g", "daemon off;"]
# docker buildx build --platform linux/amd64 -t asia-south1-docker.pkg.dev/s-0-000236-99/moa-bharatvistaar-repo/oan-ui-dev:latest --push .