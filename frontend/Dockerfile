# Stage 1: Build the React App
FROM node:18-alpine AS build

WORKDIR /app

# Ensure clean cache to avoid package-lock errors
COPY package.json package-lock.json ./
RUN npm install

# Copy source and build entirely statically
COPY . .
RUN npm run build

# Stage 2: Serve via Nginx for lightning fast static serving
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from Stage 1 into Nginx default root
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
