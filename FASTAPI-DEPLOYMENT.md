# FastAPI ML Model API - Deployment Guide

This repository now includes a complete FastAPI ML Model API deployment package alongside the GitHub MCP Server.

## 📁 Files

- **`main.py`** - FastAPI application with ML prediction endpoints
- **`requirements.txt`** - Python dependencies for the FastAPI app
- **`test.py`** - Test script to verify API functionality

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Run Locally

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Step 3: Test the API

In a new terminal:

```bash
python test.py
```

Or use curl:

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test home endpoint
curl http://localhost:8000/

# Test predict endpoint
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [5.1, 3.5, 1.4, 0.2]}'
```

## 📋 API Endpoints

### GET `/`
**Home endpoint** - Returns API status
```json
{
  "message": "API Running!",
  "status": "active"
}
```

### GET `/health`
**Health check endpoint** - Returns server health status
```json
{
  "status": "healthy"
}
```

### POST `/predict`
**Prediction endpoint** - Makes predictions based on input features

**Request body:**
```json
{
  "features": [5.1, 3.5, 1.4, 0.2]
}
```

**Response:**
```json
{
  "prediction": 74.01471693416909
}
```

## 🌐 Deploy to Production

### Deploy to Render (Free)

1. Push these files to your GitHub repository
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your repository
4. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click **Create Web Service**

Your API will be live in ~2 minutes!

### Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Railway will auto-detect Python and deploy
5. Configure start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Deploy to Heroku

```bash
# Install Heroku CLI and login
heroku create your-ml-api-name

# Deploy
git push heroku main

# Open your app
heroku open
```

### Deploy with Docker

Create a `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t ml-api .
docker run -p 8000:8000 ml-api
```

## 🔧 Customization

### Add Your Own ML Model

Replace the random prediction in `main.py`:

```python
@app.post("/predict")
def predict(data: PredictionInput):
    try:
        input_data = np.array([data.features])
        
        # Load your trained model
        import joblib
        model = joblib.load('model.pkl')
        
        # Make prediction
        prediction = model.predict(input_data)
        
        return {"prediction": float(prediction[0])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Add More Endpoints

```python
@app.post("/batch-predict")
def batch_predict(data: List[PredictionInput]):
    predictions = []
    for item in data:
        input_data = np.array([item.features])
        prediction = model.predict(input_data)
        predictions.append(float(prediction[0]))
    return {"predictions": predictions}
```

## 📚 Dependencies

- **FastAPI** - Modern, fast web framework
- **Uvicorn** - ASGI server
- **NumPy** - Numerical computing
- **scikit-learn** - Machine learning library
- **Pydantic** - Data validation

## 🔒 Security Tips

1. Add authentication for production deployments
2. Use environment variables for sensitive configuration
3. Enable HTTPS/TLS
4. Add rate limiting
5. Validate and sanitize input data

## 📖 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Uvicorn Documentation](https://www.uvicorn.org/)
- [Render Deployment Guide](https://render.com/docs/deploy-fastapi)
- [Railway Deployment Guide](https://docs.railway.com/guides/fastapi)

## 🤝 Integration with GitHub MCP Server

This FastAPI ML Model API can run independently or alongside the GitHub MCP Server:

- **GitHub MCP Server** - Node.js/TypeScript service for GitHub API integration (see `README.md`)
- **FastAPI ML API** - Python service for machine learning predictions (this guide)

Both services can be deployed separately and communicate via HTTP/REST APIs.
