# SMSA AI Assistant - Production Architecture

**Enterprise-grade conversational AI system for SMSA Express logistics platform**

---

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Monitoring](#monitoring)

---

## Overview

An intelligent conversational assistant that integrates with SMSA Express's existing APIs to provide natural language access to shipment tracking, rate inquiries, service center locations, and FAQ support for 2.2M+ active users.

**Key Features:**
- Context-aware conversations that persist across days
- Multi-language support (English/Arabic with RTL)
- Image-based AWB extraction via DeepSeek Vision
- Real-time response streaming (SSE)
- Intelligent routing between direct API calls and AI reasoning
- Enterprise-grade security and monitoring

---

## System Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  Web App (ai.smsaexpress.com)  |  Mobile App (SMSA Mobile)      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY                                │
│  Node.js + Express | JWT Auth | Rate Limiting | Load Balancing  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MASTER AGENT ORCHESTRATION                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Intent Router (Python) - Template Prompting + COT       │  │
│  │  Guardrails: Single-shot, controlled responses           │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AI Orchestrator                                          │  │
│  │  • Intent Classification                                  │  │
│  │  • Routing Decision (API vs LLM)                         │  │
│  │  • Response Coordination                                  │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Context Assembly                                         │  │
│  │  • Load session from MongoDB                              │  │
│  │  • Semantic search in Vector DB                           │  │
│  │  • Assemble context window                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬──────────────┐
         ▼               ▼               ▼              ▼
┌────────────────────────────────────────────────────────────────┐
│                    SPECIALIZED AGENTS                           │
│  Tracking Agent | Rates Agent | Centers Agent | FAQ Agent      │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                         │
│  SMSA APIs (4 endpoints) | DeepSeek Vision | DeepSeek Chat      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### **Frontend Layer**
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Web App | Next.js | 14.x | Server-side rendering, SEO optimization |
| UI Framework | Tailwind CSS | 3.x | Responsive styling |
| Component Library | Radix UI | Latest | Accessible UI components |
| Mobile App | React Native | 0.73.x | Cross-platform mobile interface |
| Real-time | EventSource API | Native | SSE streaming client |

### **API Gateway Layer**
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Node.js | 20 LTS | JavaScript runtime |
| Framework | Express.js | 4.18.x | HTTP server framework |
| Authentication | jsonwebtoken | 9.x | JWT validation |
| Rate Limiting | express-rate-limit | 7.x | Request throttling |
| HTTP Client | Axios | 1.6.x | SMSA API integration |
| Retry Logic | axios-retry | 4.x | Automatic retry on failures |

### **Orchestration Layer**
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Agent Framework | LangGraph | 0.1.x | Stateful agent workflows |
| Runtime | Python | 3.11 | Agent execution environment |
| API Server | FastAPI | 0.109.x | HTTP endpoints for agents |
| LLM Integration | DeepSeek SDK | Latest | AI model access |
| Prompt Management | Custom Templates | - | Controlled AI responses |

### **Data Layer**
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Primary Database | MongoDB | 6.x | Conversations, users, messages |
| Vector Database | Qdrant | 1.7.x | Semantic search, embeddings |
| Cache | Redis | 7.2.x | Session storage, API cache |
| Object Storage | AWS S3 | - | Images, conversation JSONs |
| Message Queue | Apache Kafka | 3.6.x | Async event processing |

### **External Services**
| Service | Provider | Purpose |
|---------|----------|---------|
| Vision AI | DeepSeek Vision | AWB extraction from images |
| Chat LLM | DeepSeek Chat V2.5 | Complex reasoning, response generation |
| Embeddings | DeepSeek Embeddings | Text vectorization for RAG |
| SMSA APIs | Internal | Tracking, Rates, Centers, FAQ |

---

## Core Components

### 1. **API Gateway (Node.js)**

**Location:** `/services/api-gateway`

**Responsibilities:**
- JWT token validation from SMSA's auth system
- Rate limiting (100 requests/min per user)
- Request routing to orchestration layer
- Response streaming (SSE) to clients

**Key Files:**
```
api-gateway/
├── src/
│   ├── middleware/
│   │   ├── auth.js          # JWT validation
│   │   ├── rateLimiter.js   # Rate limiting logic
│   │   └── validator.js     # Request schema validation
│   ├── routes/
│   │   ├── chat.js          # POST /api/chat endpoint
│   │   └── sessions.js      # Session management
│   └── server.js            # Express app setup
├── package.json
└── Dockerfile
```

**Environment Variables:**
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<from_smsa_auth>
MONGODB_URI=mongodb://mongo:27017/smsa_ai
REDIS_URL=redis://redis:6379
ORCHESTRATOR_URL=http://orchestrator:8000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

---

### 2. **Master Agent Orchestration (Python)**

**Location:** `/services/orchestrator`

**Responsibilities:**
- Intent classification (simple regex + LLM fallback)
- Context assembly from MongoDB + Qdrant
- Routing decisions (Direct API vs AI reasoning)
- Agent coordination via LangGraph state machine

**Key Files:**
```
orchestrator/
├── src/
│   ├── agents/
│   │   ├── tracking_agent.py
│   │   ├── rates_agent.py
│   │   ├── centers_agent.py
│   │   └── faq_agent.py
│   ├── core/
│   │   ├── intent_router.py      # Intent classification
│   │   ├── context_manager.py    # Context assembly
│   │   └── orchestrator.py       # LangGraph workflow
│   ├── prompts/
│   │   ├── system_prompts.py     # Agent instructions
│   │   └── templates.py          # Prompt templates
│   └── main.py                   # FastAPI app
├── requirements.txt
└── Dockerfile
```

**Environment Variables:**
```env
DEEPSEEK_API_KEY=<api_key>
MONGODB_URI=mongodb://mongo:27017/smsa_ai
QDRANT_URL=http://qdrant:6333
REDIS_URL=redis://redis:6379
SMSA_API_BASE_URL=https://api.smsa.com
SMSA_API_KEY=<api_key>
```

---

### 3. **Specialized Agents**

#### **Tracking Agent**
```python
# /services/orchestrator/src/agents/tracking_agent.py

class TrackingAgent:
    """Handles shipment tracking queries"""
    
    def __init__(self, smsa_client):
        self.smsa_client = smsa_client
        self.cache_ttl = 300  # 5 minutes
    
    async def execute(self, awb_number, context):
        # Check cache first
        cached = await self.get_cached_status(awb_number)
        if cached:
            return cached
        
        # Call SMSA Tracking API
        try:
            response = await self.smsa_client.get_tracking(awb_number)
            await self.cache_response(awb_number, response)
            return self.format_response(response)
        except Exception as e:
            return self.handle_error(e, awb_number)
```

**Agent-specific configurations:**
- **Tracking**: Cache 5 min, circuit breaker enabled
- **Rates**: Cache 1 hour, batch-friendly
- **Centers**: Cache 24 hours, geocoding integration
- **FAQ**: Vector search, no external API

---

### 4. **Memory Layer**

#### **MongoDB Schema**
```javascript
// users collection
{
  _id: ObjectId,
  external_id: "smsa_user_12345",  // From SMSA auth
  metadata: {
    name: "John Doe",
    email: "john@example.com",
    language: "en"
  },
  created_at: ISODate
}

// conversations collection
{
  _id: ObjectId,
  user_id: ObjectId,
  title: "Shipment tracking AWB123",
  context: {
    current_awb: "12345678",
    last_query: {
      type: "tracking",
      timestamp: ISODate
    }
  },
  created_at: ISODate,
  updated_at: ISODate
}

// messages collection (partitioned by date)
{
  _id: ObjectId,
  conversation_id: ObjectId,
  role: "user" | "assistant",
  content: "Where is my package?",
  metadata: {
    intent: "TRACKING",
    api_calls: ["tracking_api"],
    tokens_used: 150
  },
  created_at: ISODate
}
```

#### **Qdrant Collections**
```python
# Collection: conversation_embeddings
{
  "id": "msg_12345",
  "vector": [0.123, -0.456, ...],  # 1536 dimensions
  "payload": {
    "user_id": "user_123",
    "conversation_id": "conv_456",
    "content": "Ship 2kg from India to USA",
    "intent": "RATES_INQUIRY",
    "timestamp": 1706140800
  }
}
```

**Indexing:**
- HNSW index (M=16, ef_construct=100)
- Filter by `user_id` first (partition search space)
- Top-k=5 results, similarity threshold 0.7

---

### 5. **Image Processing Flow**
```
User uploads image
    ↓
API Gateway validates (type, size <5MB)
    ↓
Upload to S3 with pre-signed URL
    ↓
Trigger DeepSeek Vision API
    ↓
Extract AWB number + metadata
    ↓
Store in MongoDB conversation context
    ↓
Route to Tracking Agent with extracted AWB
```

**DeepSeek Vision Integration:**
```python
async def process_image(image_url):
    response = await deepseek_vision.analyze(
        image_url=image_url,
        task="extract_shipping_info",
        language="en"  # or "ar"
    )
    
    return {
        "awb": response.awb,
        "origin": response.origin,
        "destination": response.destination,
        "confidence": response.confidence
    }
```

---

### 6. **Response Generation**

#### **Fast Path (Direct API calls)**
```javascript
// Node.js API Gateway
app.post('/api/chat', async (req, res) => {
  const { message, session_id } = req.body;
  
  // Simple intent -> Direct response
  if (isSimpleTracking(message)) {
    const awb = extractAWB(message);
    const result = await smsaClient.getTracking(awb);
    
    return res.json({
      message: formatTracking(result),
      metadata: { awb, status: result.status }
    });
  }
  
  // Complex -> Stream from orchestrator
  res.setHeader('Content-Type', 'text/event-stream');
  const stream = await orchestrator.execute(message, session_id);
  stream.pipe(res);
});
```

#### **Streaming Path (LLM reasoning)**
```python
# Python Orchestrator
@app.post("/execute")
async def execute(request: ChatRequest):
    async def generate():
        # Load context
        context = await context_manager.assemble(request.session_id)
        
        # LangGraph agent execution
        async for event in langgraph_agent.stream(request.message, context):
            if event.type == "token":
                yield f"data: {json.dumps({'type': 'token', 'content': event.content})}\n\n"
            elif event.type == "complete":
                yield f"data: {json.dumps({'type': 'complete'})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
```

---

## Data Flow

### **Scenario 1: Simple Tracking Query**
```
User: "Track AWB12345678"
  ↓
API Gateway (Node.js)
  ↓
Intent Router: HIGH confidence -> TRACKING
  ↓
Tracking Agent (Python)
  ↓
Check Redis cache (5min TTL)
  ↓ [miss]
SMSA Tracking API
  ↓
Format response
  ↓
Cache in Redis
  ↓
JSON response to user (total: 300ms)
```

### **Scenario 2: Context-Aware Follow-up**
```
Day 1: "Ship 2kg India to USA, cost?"
  ↓
Rates Agent -> $45
  ↓
Save to MongoDB context: {origin: India, dest: USA, weight: 2}
  ↓
Generate embedding -> Store in Qdrant

Day 3: "How about 3kg?"
  ↓
Context Manager loads from MongoDB
  ↓
Qdrant semantic search finds "2kg India USA" (similarity 0.92)
  ↓
Context: {origin: India, dest: USA, weight: 3}  # Updated
  ↓
Rates Agent -> $62
  ↓
Response: "For 3kg India to USA: $62"
```

### **Scenario 3: Image Upload**
```
User uploads AWB image
  ↓
API Gateway -> S3 upload
  ↓
DeepSeek Vision API extracts AWB
  ↓
Confidence > 0.8? -> Use extracted AWB
  ↓
Confidence < 0.8? -> Ask user to confirm
  ↓
Route to Tracking Agent
  ↓
SMSA API -> Status
  ↓
Response streamed to user
```

---

## Deployment

### **Infrastructure Requirements**

**Kubernetes Cluster:**
```yaml
# Minimum resources for 10K concurrent users
Nodes:
  - 3x m5.xlarge (API Gateway, Orchestrator)
  - 2x c5.2xlarge (LLM inference workers)
  - 3x r5.2xlarge (MongoDB, Redis, Qdrant)

Storage:
  - MongoDB: 500GB SSD
  - Qdrant: 200GB SSD
  - Redis: 64GB RAM
  - S3: Unlimited (pay per use)
```

### **Docker Compose (Development)**
```yaml
version: '3.8'

services:
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/smsa_ai
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
      - orchestrator

  orchestrator:
    build: ./services/orchestrator
    ports:
      - "8000:8000"
    environment:
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - MONGODB_URI=mongodb://mongo:27017/smsa_ai
      - QDRANT_URL=http://qdrant:6333
    depends_on:
      - mongo
      - qdrant
      - redis

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7.2-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  qdrant:
    image: qdrant/qdrant:v1.7.4
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

volumes:
  mongo_data:
  redis_data:
  qdrant_data:
```

### **Kubernetes Deployment**
```yaml
# api-gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: smsa/api-gateway:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: smsa-secrets
              key: mongodb-uri
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
spec:
  selector:
    app: api-gateway
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

---

## API Documentation

### **Chat Endpoint**

#### `POST /api/chat`

**Request:**
```json
{
  "message": "Track AWB12345678",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "language": "en"
}
```

**Response (Simple Query - JSON):**
```json
{
  "success": true,
  "message": "Your package is in transit, arriving tomorrow at 3 PM",
  "metadata": {
    "awb": "12345678",
    "status": "in_transit",
    "eta": "2026-01-27T15:00:00Z",
    "current_location": "Jeddah Distribution Center"
  }
}
```

**Response (Complex Query - SSE Stream):**
```
Content-Type: text/event-stream

data: {"type": "thinking", "content": "Analyzing your shipment history..."}

data: {"type": "token", "content": "Your"}
data: {"type": "token", "content": " package"}
data: {"type": "token", "content": " was"}
data: {"type": "token", "content": " delayed"}

data: {"type": "complete", "metadata": {"tokens_used": 245}}
```

### **Session Management**

#### `GET /api/sessions`
List all conversations for authenticated user.

#### `GET /api/sessions/:session_id`
Retrieve specific conversation history.

#### `DELETE /api/sessions/:session_id`
Delete conversation (GDPR compliance).

---

## Monitoring

### **Metrics Collected**
```yaml
# Prometheus metrics
smsa_ai_requests_total{endpoint, status}
smsa_ai_request_duration_seconds{endpoint, percentile}
smsa_ai_intent_classification{intent, confidence}
smsa_ai_agent_execution_duration{agent, status}
smsa_ai_tokens_used_total{model, operation}
smsa_ai_cache_hit_ratio{cache_type}
smsa_ai_smsa_api_calls_total{api, status}
smsa_ai_circuit_breaker_state{api}
```

### **Centralized Logging**
```json
{
  "timestamp": "2026-01-26T10:30:00Z",
  "level": "INFO",
  "service": "orchestrator",
  "trace_id": "abc123",
  "user_id": "user_12345",
  "session_id": "session_456",
  "event": "agent_execution",
  "details": {
    "intent": "TRACKING",
    "agent": "tracking_agent",
    "awb": "12345678",
    "latency_ms": 245,
    "api_calls": ["smsa_tracking"],
    "cache_hit": false
  }
}
```

### **Key Dashboards**

**1. System Health:**
- Request rate (req/sec)
- Error rate (%)
- p50/p95/p99 latency
- Active sessions

**2. Business Metrics:**
- Intent distribution (tracking vs rates vs FAQ)
- Direct API vs LLM routing ratio
- User satisfaction scores
- Conversation completion rate

**3. Cost Tracking:**
- Tokens consumed per hour
- Cost per conversation
- Daily/monthly spend
- Budget utilization

**4. Agent Performance:**
- Agent execution time by type
- Success/failure rates
- Cache hit rates
- SMSA API response times

---

## Security

### **Authentication Flow**
```
User logs into SMSA app
  ↓
SMSA auth issues JWT token
  ↓
Token contains: {user_id, exp, permissions}
  ↓
AI Assistant validates JWT signature
  ↓
Extract user_id from token
  ↓
All queries scoped to this user_id
```

### **Data Encryption**

- **In Transit:** TLS 1.3 for all HTTP traffic
- **At Rest:** 
  - MongoDB: Encryption at rest enabled
  - S3: Server-side encryption (SSE-S3)
  - Redis: RDB encryption enabled

### **Access Controls**
```yaml
# RBAC policies
Roles:
  - customer: Read own conversations
  - support: Read all conversations
  - admin: Read/write/delete all data

Session Ownership:
  - Query: SELECT * FROM conversations WHERE user_id = {jwt.user_id}
  - Prevents unauthorized access to other users' data
```

---

## Cost Estimation

### **Monthly Costs (100K conversations/month)**

| Component | Cost | Notes |
|-----------|------|-------|
| DeepSeek LLM | $1,200 | ~40% queries @ $0.03/query |
| DeepSeek Embeddings | $50 | Background processing |
| Infrastructure (AWS/Azure) | $800 | Kubernetes nodes, load balancers |
| MongoDB Atlas | $300 | M30 cluster |
| Redis | $200 | ElastiCache |
| S3 Storage | $50 | Images, JSONs |
| **Total** | **$2,600** | ~$0.026 per conversation |

### **Cost Optimization Strategies**

1. **Aggressive Caching:** 70% cache hit rate reduces LLM calls
2. **Intent Routing:** 60% queries use direct API (cheap), 40% use LLM
3. **Prompt Optimization:** Reduce token count per query by 30%
4. **Semantic Cache:** Qdrant stores similar query responses

---

## Troubleshooting

### **Common Issues**

#### Issue: High Latency (>5s responses)
```
Check:
1. Qdrant query time: Should be <100ms
2. MongoDB query time: Should be <50ms
3. SMSA API response time: Should be <500ms
4. LLM API response time: Should be <3s

Solution:
- Scale Qdrant replicas if query time high
- Add MongoDB indexes on frequently queried fields
- Check SMSA API circuit breaker state
- Switch to faster LLM model (Haiku instead of Sonnet)
```

#### Issue: Circuit Breaker Open on SMSA API
```
Check:
1. SMSA API health status
2. Recent error logs from api-client
3. Current failure count

Solution:
- Verify SMSA API credentials not expired
- Check network connectivity to SMSA backend
- Increase circuit breaker threshold if transient failures
- Serve cached responses while API recovers
```

#### Issue: MongoDB Connection Pool Exhausted
```
Error: "MongoServerError: too many connections"

Solution:
1. Check active connections: db.currentOp()
2. Kill idle connections > 10 minutes
3. Increase PgBouncer pool size
4. Check for connection leaks in code
```

---

## Development Setup

### **Prerequisites**
- Node.js 20+
- Python 3.11+
- Docker + Docker Compose
- DeepSeek API key

### **Local Setup**
```bash
# Clone repository
git clone https://github.com/smsa/ai-assistant.git
cd ai-assistant

# Copy environment template
cp .env.example .env
# Edit .env with your credentials

# Start services
docker-compose up -d

# Run migrations
docker-compose exec orchestrator python manage.py migrate

# Seed FAQ data
docker-compose exec orchestrator python scripts/seed_faqs.py

# Run tests
docker-compose exec api-gateway npm test
docker-compose exec orchestrator pytest

# View logs
docker-compose logs -f orchestrator
```

### **Running Locally Without Docker**
```bash
# Terminal 1: MongoDB + Redis + Qdrant
docker-compose up mongo redis qdrant

# Terminal 2: Orchestrator
cd services/orchestrator
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000

# Terminal 3: API Gateway
cd services/api-gateway
npm install
npm run dev
```

---

## Testing

### **Unit Tests**
```bash
# Node.js tests
cd services/api-gateway
npm test

# Python tests
cd services/orchestrator
pytest tests/unit/
```

### **Integration Tests**
```bash
# Test full flow
pytest tests/integration/test_chat_flow.py

# Test SMSA API integration
pytest tests/integration/test_smsa_apis.py
```

### **Load Testing**
```bash
# Using k6
k6 run scripts/load-test.js --vus 100 --duration 5m
```

---

## License

Proprietary - SMSA Express © 2026

---

## Support

For technical issues, contact:
- **Email:** ai-support@smsaexpress.com
- **Slack:** #ai-assistant-support
- **On-call:** PagerDuty escalation

---

**Last Updated:** January 26, 2026