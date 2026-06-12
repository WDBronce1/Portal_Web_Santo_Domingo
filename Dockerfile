# Stage 1: Build React/Ionic App
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# We build the application using the VITE_API_BASE pointing to the proxy route
ENV VITE_API_BASE=/api
RUN npm run build

# Stage 2: Serve with custom Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
