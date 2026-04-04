# 🚀 AI Civilization Deployment Guide

## 📋 Prerequisites

- Python 3.9+
- Docker (optional but recommended)
- Git

## 🌐 Deployment Options

### Option 1: Local Production Deployment

#### Step 1: Prepare Environment
```bash
# Clone repository
git clone <your-repo-url>
cd ai_civilization

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Step 2: Configure for Production
```bash
# Set environment variables
export FLASK_ENV=production
export FLASK_APP=app.py
export PORT=5000

# On Windows:
set FLASK_ENV=production
set FLASK_APP=app.py
set PORT=5000
```

#### Step 3: Run with Production Server
```bash
# Using Gunicorn (recommended)
gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:5000 app:app

# Or with multiple workers
gunicorn --worker-class eventlet -w 4 --bind 0.0.0.0:5000 app:app
```

### Option 2: Docker Deployment (Recommended)

#### Step 1: Build Docker Image
```bash
# Build the image
docker build -t ai-civilization .

# Or with custom tag
docker build -t ai-civilization:latest .
```

#### Step 2: Run Container
```bash
# Simple run
docker run -d -p 5000:5000 --name ai-civ ai-civilization

# Run with environment variables
docker run -d \
  -p 5000:5000 \
  -e FLASK_ENV=production \
  -e FLASK_APP=app.py \
  --name ai-civ \
  ai-civilization
```

#### Step 3: Using Docker Compose (Easiest)
```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Option 3: Cloud Deployment

#### Heroku
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set buildpack
heroku buildpacks:set heroku/python

# Deploy
git push heroku main
```

#### AWS ECS
```bash
# Build and push to ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-west-2.amazonaws.com
docker build -t ai-civilization .
docker tag ai-civilization:latest <account-id>.dkr.ecr.us-west-2.amazonaws.com/ai-civilization:latest
docker push <account-id>.dkr.ecr.us-west-2.amazonaws.com/ai-civilization:latest

# Deploy to ECS (using AWS Console or CLI)
```

#### Google Cloud Run
```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/ai-civilization

# Deploy
gcloud run deploy --image gcr.io/PROJECT_ID/ai-civilization --platform managed
```

## 🔧 Configuration

### Environment Variables
- `FLASK_ENV`: Set to 'production'
- `FLASK_APP`: Set to 'app.py'
- `PORT`: Application port (default: 5000)
- `SECRET_KEY`: Flask secret key for sessions

### Production Settings
- Use HTTPS in production
- Configure proper logging
- Set up monitoring
- Use reverse proxy (nginx) for production

## 📊 Monitoring

### Health Check
```bash
# Check if application is running
curl http://localhost:5000/api/status

# Expected response:
{"status": "running", "agents": X, "resources": {...}}
```

### Logs
```bash
# Docker logs
docker logs -f ai-civ

# Application logs
tail -f logs/app.log

# System logs
journalctl -u gunicorn
```

## 🔒 Security

### Production Security
1. **Use HTTPS**: Configure SSL certificates
2. **Firewall**: Only open necessary ports
3. **Environment Variables**: Store secrets securely
4. **Regular Updates**: Keep dependencies updated
5. **Rate Limiting**: Prevent abuse

### Docker Security
```bash
# Run as non-root user
# Add to Dockerfile:
# RUN useradd -m -u 1000 appuser && chown -R appuser /app
# USER appuser

# Use read-only filesystem
# docker run --read-only --tmpfs /tmp ai-civilization
```

## 📈 Performance Optimization

### Scaling
```bash
# Multiple workers
gunicorn --worker-class eventlet -w 4 --bind 0.0.0.0:5000 app:app

# Load balancing with nginx
upstream ai_civ {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
}

server {
    listen 80;
    location / {
        proxy_pass http://ai_civ;
    }
}
```

### Resource Limits
```yaml
# docker-compose.yml with limits
services:
  ai-civilization:
    build: .
    ports:
      - "5000:5000"
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to production
      run: |
        docker build -t ai-civilization .
        docker push ${{ secrets.DOCKER_REGISTRY }}/ai-civilization
        # Deploy commands here
```

## 🆘 Troubleshooting

### Common Issues
1. **Port already in use**
   ```bash
   # Find process using port
   lsof -i :5000
   # Kill process
   kill -9 <PID>
   ```

2. **Permission denied**
   ```bash
   # Fix permissions
   sudo chown -R $USER:$USER /path/to/app
   ```

3. **Out of memory**
   ```bash
   # Increase swap space
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

### Debug Mode
```bash
# Enable debug logging
export FLASK_DEBUG=1
export FLASK_ENV=development

# Run with verbose output
gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:5000 --log-level debug app:app
```

## 📞 Support

For deployment issues:
1. Check logs for error messages
2. Verify all prerequisites are met
3. Ensure proper environment variables
4. Test health endpoint
5. Check network connectivity

---

**🚀 Your AI Civilization is now ready for production deployment!**
