FROM node:20-slim

WORKDIR /app

# Build frontend
COPY frontend/package*.json frontend/
RUN cd frontend && npm install

COPY frontend/ frontend/
RUN cd frontend && npm run build

# Setup backend
COPY backend/package*.json backend/
RUN cd backend && npm install --production

COPY backend/ backend/

# Copy built frontend to backend/public
RUN cp -r frontend/dist backend/public

# HF Spaces uses port 7860
ENV PORT=7860
EXPOSE 7860

WORKDIR /app/backend
CMD ["node", "server.js"]
