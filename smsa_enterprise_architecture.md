# SMSA Assistant - Enterprise-Grade Architecture
## High-Level Solution Design

---

## 1. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                          │
│  ┌──────────────────────┐        ┌──────────────────────┐          │
│  │  Web Application     │        │   Mobile Application │          │
│  │  (ai.smsaexpress.com)│        │   (SMSA Mobile App)  │          │
│  │  Next.js + TypeScript│        │   React Native/      │          │
│  │  Tailwind + Radix UI │        │   Native Integration │          │
│  └──────────┬───────────┘        └──────────┬───────────┘          │
└─────────────┼──────────────────────────────┼────────────────────────┘
              │                              │
              └──────────────┬───────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY & SECURITY LAYER                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  - Rate Limiting (Redis)                                      │  │
│  │  - Authentication & Authorization (JWT/OAuth)                 │  │
│  │  - Request Validation (Zod/Joi)                              │  │
│  │  - API Proxy (Hide SMSA endpoints)                           │  │
│  │  - CORS & Security Headers                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AI ORCHESTRATION LAYER                          │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃              🤖 AI AGENT ENGINE (Core Brain)                 ┃  │
│  ┃  ┌──────────────────────────────────────────────────────┐   ┃  │
│  ┃  │ Intent Classification & Routing                       │   ┃  │
│  ┃  │ - NLP Intent Detection                               │   ┃  │
│  ┃  │ - Entity Extraction (Tracking #, AWB, Locations)     │   ┃  │
│  ┃  │ - Context Understanding                              │   ┃  │
│  ┃  └──────────────────────────────────────────────────────┘   ┃  │
│  ┃                                                               ┃  │
│  ┃  ┌──────────────────────────────────────────────────────┐   ┃  │
│  ┃  │ Decision Engine                                       │   ┃  │
│  ┃  │ - Route to AI Processing or Direct API Call          │   ┃  │
│  ┃  │ - Determine which SMSA API to invoke                 │   ┃  │
│  ┃  │ - Session & Context Management                       │   ┃  │
│  ┃  └──────────────────────────────────────────────────────┘   ┃  │
│  ┃                                                               ┃  │
│  ┃  ┌──────────────────────────────────────────────────────┐   ┃  │
│  ┃  │ Response Generation & Streaming                       │   ┃  │
│  ┃  │ - LLM Integration (Claude/GPT-4)                     │   ┃  │
│  ┃  │ - Server-Sent Events (SSE) for real-time streaming   │   ┃  │
│  ┃  │ - Multi-language Response (Arabic/English)           │   ┃  │
│  ┃  └──────────────────────────────────────────────────────┘   ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
└─────────────────────────┬───────────────────┬───────────────────────┘
                          │                   │
              ┌───────────▼─────────┐   ┌────▼──────────────┐
              │                     │   │                   │
              ▼                     ▼   ▼                   ▼
┌─────────────────────────┐ ┌──────────────────────────────────────────┐
│   MEMORY & KNOWLEDGE    │ │       INTEGRATION LAYER                   │
│         LAYER           │ │                                           │
│  ┌──────────────────┐   │ │  ┌────────────────────────────────────┐ │
│  │ Vector Database  │   │ │  │     SMSA API Integration           │ │
│  │ (Embeddings)     │   │ │  │  ┌──────────────────────────────┐ │ │
│  │                  │   │ │  │  │ 1. Shipment Tracking API     │ │ │
│  │ Options:         │   │ │  │  │ 2. Rates Inquiry API         │ │ │
│  │ - Pinecone       │   │ │  │  │ 3. Service Center API        │ │ │
│  │ - Qdrant         │   │ │  │  │ 4. FAQ Database API          │ │ │
│  │ - Weaviate       │   │ │  │  └──────────────────────────────┘ │ │
│  │ - Supabase       │   │ │  │                                    │ │
│  │   (pgvector)     │   │ │  │  ┌──────────────────────────────┐ │ │
│  └──────────────────┘   │ │  │  │ API Client Layer             │ │ │
│                         │ │  │  │ - Connection Pooling         │ │ │
│  ┌──────────────────┐   │ │  │  │ - Retry Logic                │ │ │
│  │ Persistent DB    │   │ │  │  │ - Circuit Breaker            │ │ │
│  │ (Relational)     │   │ │  │  │ - Response Caching           │ │ │
│  │                  │   │ │  │  └──────────────────────────────┘ │ │
│  │ Options:         │   │ │  └────────────────────────────────────┘ │
│  │ - PostgreSQL     │   │ │                                           │
│  │ - MongoDB        │   │ │  ┌────────────────────────────────────┐ │
│  │                  │   │ │  │     File Storage Service           │ │
│  │ Stores:          │   │ │  │  - AWS S3 / Azure Blob / GCS       │ │
│  │ - Sessions       │   │ │  │  - User uploaded documents/images   │ │
│  │ - Conversations  │   │ │  └────────────────────────────────────┘ │
│  │ - User Metadata  │   │ └──────────────────────────────────────────┘
│  │ - Chat History   │   │
│  └──────────────────┘   │
│                         │
│  ┌──────────────────┐   │
│  │ Cache Layer      │   │
│  │ (Redis)          │   │
│  │                  │   │
│  │ - Session cache  │   │
│  │ - API responses  │   │
│  │ - Rate limiting  │   │
│  └──────────────────┘   │
└─────────────────────────┘
```

---

## 2. DETAILED COMPONENT ARCHITECTURE

### 2.1 PRESENTATION LAYER

#### Web Application (ai.smsaexpress.com)
**Technology Stack:**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Components**: Tailwind CSS + Radix UI
- **State Management**: Zustand (lightweight) or Redux Toolkit
- **i18n**: next-i18next (Arabic RTL + English LTR)
- **Real-time**: EventSource API for SSE

**Key Features:**
- ChatGPT-like interface
- Message history with infinite scroll
- File upload preview (images/documents)
- Conversation sidebar with search
- Dark/Light mode
- Responsive design

#### Mobile Application Integration
**Technology Stack:**
- React Native or Native SDK integration
- WebView embedding option
- Native API bridges

---

### 2.2 API GATEWAY & SECURITY LAYER

**Purpose:** Secure entry point, traffic management, and request validation

**Components:**

1. **Rate Limiter**
   - Technology: Redis + rate-limiter-flexible
   - Rules: 100 requests/minute per user
   - DDoS protection

2. **Authentication & Authorization**
   - JWT token validation
   - OAuth 2.0 integration
   - Session management
   - Role-based access control (RBAC)

3. **API Proxy**
   - Hides direct SMSA API endpoints from client
   - Prevents API key exposure
   - Request/Response transformation

4. **Request Validation**
   - Schema validation (Zod/Joi)
   - Input sanitization
   - XSS/SQL injection prevention

---

### 2.3 AI ORCHESTRATION LAYER (Core Intelligence)

#### 🤖 AI AGENT ENGINE

This is the **BRAIN** of the system. It decides:
- Is this a simple API call or complex AI query?
- Which SMSA API should be invoked?
- What context is needed from history?
- How to format the response?

**Sub-Components:**

##### A. Intent Classification Module
**Technology Options:**
- OpenAI GPT-4 / Claude (via API)
- Custom fine-tuned model (BERT/DistilBERT)
- LangChain for orchestration

**Responsibilities:**
- Detect user intent (tracking, rates, service center, FAQ, general chat)
- Extract entities (AWB number, locations, dates, package details)
- Classify language (Arabic/English)

**Example Intents:**
```
User: "Where is my package AWB12345?"
Intent: SHIPMENT_TRACKING
Entity: {awb: "AWB12345"}
Action: Call Shipment Tracking API

User: "How much to ship 2kg to Riyadh?"
Intent: RATES_INQUIRY
Entity: {weight: "2kg", destination: "Riyadh"}
Action: Call Rates API

User: "What are your working hours?"
Intent: GENERAL_FAQ
Action: Query FAQ Database or AI Response
```

##### B. Decision Engine (Router)
**Routing Logic:**

```
IF (intent = SHIPMENT_TRACKING):
    → Extract AWB number
    → Call SMSA Shipment Tracking API
    → Return structured response
    
ELSE IF (intent = RATES_INQUIRY):
    → Extract weight, origin, destination
    → Call SMSA Rates Inquiry API
    → Format pricing response
    
ELSE IF (intent = SERVICE_CENTER):
    → Extract location/city
    → Call SMSA Service Center API
    → Return nearby centers with map
    
ELSE IF (intent = FAQ):
    → Search FAQ Database
    → If not found, use AI to generate answer
    
ELSE:
    → Use LLM for conversational response
    → Maintain context from conversation history
```

##### C. Context & Memory Management

**Short-term Memory (Current Session):**
- Stored in Redis cache
- Sliding window approach (last N messages)
- Used for conversational context

**Long-term Memory (Historical):**
- Stored in PostgreSQL/MongoDB
- Full conversation history
- Retrieved when session is loaded

**Conversation Flow:**
```
User Session Start
    ↓
Generate session_id (UUID)
    ↓
Load previous conversations (if returning user)
    ↓
For each message:
    - Add to short-term memory (Redis)
    - Process with AI Agent
    - Store in persistent DB
    - Update vector embeddings
```

##### D. Response Generation & Streaming

**Technology:**
- Server-Sent Events (SSE) for real-time streaming
- Token-by-token response delivery
- Multi-language support

**Response Pipeline:**
```
1. Agent generates response
2. Stream via SSE to frontend
3. Store complete message in DB
4. Update vector embeddings for future context
5. Return metadata (sources, API calls made)
```

---

### 2.4 MEMORY & KNOWLEDGE LAYER

#### A. Vector Database (Semantic Search & Context)

**Purpose:**
- Store conversation embeddings
- Retrieve relevant historical context
- Train agent on SMSA domain knowledge
- Semantic search across past conversations

**Technology Options & Comparison:**

| Database | Pros | Cons | Best For |
|----------|------|------|----------|
| **Pinecone** | - Fully managed<br>- Excellent performance<br>- Easy to scale | - Paid service<br>- Vendor lock-in | Production-ready, minimal DevOps |
| **Qdrant** | - Open source<br>- Fast filtering<br>- Self-hostable | - Requires infrastructure management | Self-hosted, cost-conscious |
| **Weaviate** | - Open source<br>- GraphQL API<br>- Hybrid search | - Complex setup<br>- Resource intensive | Complex semantic queries |
| **Supabase (pgvector)** | - PostgreSQL extension<br>- Combines relational + vector<br>- Free tier | - Slower than specialized DBs<br>- Limited scale | Small to medium scale, integrated DB |

**Recommended:** **Pinecone** (for production) or **Qdrant** (for cost-effectiveness)

**What Gets Stored:**
```
{
  "conversation_id": "uuid",
  "user_id": "user123",
  "message": "Where is my package?",
  "embedding": [0.123, 0.456, ...], // 1536-dim vector
  "metadata": {
    "intent": "SHIPMENT_TRACKING",
    "timestamp": "2026-01-24T10:30:00Z",
    "language": "en"
  }
}
```

**Usage in Agent:**
```
User asks: "Is it still in Jeddah?"
    ↓
Retrieve last 5 conversation vectors from Pinecone
    ↓
Understand "it" refers to package from previous context
    ↓
Extract AWB from context
    ↓
Call Tracking API
```

#### B. Persistent Database (Relational Storage)

**Purpose:**
- Store structured conversation data
- User profiles and sessions
- Chat history with metadata
- Analytics and reporting

**Technology Options:**

| Database | Pros | Cons | Best For |
|----------|------|------|----------|
| **PostgreSQL** | - ACID compliant<br>- JSON support<br>- pgvector extension<br>- Mature ecosystem | - Vertical scaling limits | Complex queries, relational data |
| **MongoDB** | - Flexible schema<br>- Horizontal scaling<br>- Fast writes | - No ACID transactions (older versions)<br>- Larger storage footprint | Unstructured JSON, rapid iteration |

**Recommended:** **PostgreSQL** (enterprise-grade, ACID compliance, pgvector bonus)

**Database Schema Design:**

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ user_id (PK)    │
│ email           │
│ name            │
│ language_pref   │
│ created_at      │
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────┐
│   Conversations     │
├─────────────────────┤
│ conversation_id(PK) │
│ user_id (FK)        │
│ title               │
│ created_at          │
│ updated_at          │
│ is_archived         │
└─────────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────────┐
│      Messages           │
├─────────────────────────┤
│ message_id (PK)         │
│ conversation_id (FK)    │
│ role (user/assistant)   │
│ content (JSONB)         │
│ intent_detected         │
│ api_calls_made (JSONB)  │
│ timestamp               │
│ tokens_used             │
└─────────────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────────┐
│      Attachments        │
├─────────────────────────┤
│ attachment_id (PK)      │
│ message_id (FK)         │
│ file_url                │
│ file_type               │
│ file_size               │
│ uploaded_at             │
└─────────────────────────┘
```

**Session Storage Format (JSONB):**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user_123",
  "conversation_id": "conv_456",
  "messages": [
    {
      "id": "msg_1",
      "role": "user",
      "content": "Track AWB123456",
      "timestamp": "2026-01-24T10:00:00Z"
    },
    {
      "id": "msg_2",
      "role": "assistant",
      "content": "Your package is in Riyadh...",
      "metadata": {
        "api_call": "shipment_tracking",
        "awb": "AWB123456",
        "response_time_ms": 342
      },
      "timestamp": "2026-01-24T10:00:02Z"
    }
  ],
  "context": {
    "last_awb": "AWB123456",
    "last_location": "Riyadh",
    "language": "en"
  }
}
```

#### C. Cache Layer (Redis)

**Purpose:**
- Fast session retrieval
- API response caching
- Rate limiting counters
- Real-time data

**What Gets Cached:**
```
Key Pattern: session:{user_id}:{session_id}
TTL: 24 hours
Value: {
  "messages": [...last 20 messages],
  "context": {...},
  "metadata": {...}
}

Key Pattern: api_cache:tracking:{awb}
TTL: 5 minutes
Value: {cached API response}

Key Pattern: rate_limit:{user_id}
TTL: 1 minute
Value: request_count
```

---

### 2.5 INTEGRATION LAYER

#### SMSA API Integration (4 Core APIs)

**1. Shipment Tracking API**
```
Endpoint: GET /api/track/{awb}
Purpose: Real-time tracking status
Response: {
  awb: string,
  status: string,
  current_location: string,
  estimated_delivery: date,
  history: [{location, timestamp, status}]
}
```

**2. Rates Inquiry API**
```
Endpoint: POST /api/rates
Purpose: Calculate shipping costs
Payload: {
  origin: string,
  destination: string,
  weight: number,
  dimensions: {length, width, height}
}
Response: {
  base_rate: number,
  fuel_surcharge: number,
  total: number,
  estimated_days: number
}
```

**3. Service Center API**
```
Endpoint: GET /api/service-centers
Purpose: Find nearby SMSA locations
Params: {
  city: string,
  latitude: number,
  longitude: number
}
Response: [{
  center_id: string,
  name: string,
  address: string,
  working_hours: string,
  services: [string],
  coordinates: {lat, lng}
}]
```

**4. FAQ Database API**
```
Endpoint: GET /api/faqs
Purpose: Retrieve FAQs, offers, services info
Params: {
  category: string,
  language: string,
  search: string
}
Response: [{
  question: string,
  answer: string,
  category: string,
  related_links: [string]
}]
```

#### API Client Architecture

**Design Pattern:** Adapter Pattern with Circuit Breaker

```
┌─────────────────────────────────────┐
│      API Client Manager             │
│  ┌───────────────────────────────┐  │
│  │  Connection Pooling           │  │
│  │  - Reuse HTTP connections     │  │
│  │  - Max 100 concurrent requests│  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Retry Logic                  │  │
│  │  - Exponential backoff        │  │
│  │  - Max 3 retries              │  │
│  │  - Retry on: 5xx, timeout    │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Circuit Breaker              │  │
│  │  - Fail threshold: 5 errors   │  │
│  │  - Timeout: 30 seconds        │  │
│  │  - Half-open recovery         │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Response Caching             │  │
│  │  - Cache tracking for 5 min   │  │
│  │  - Cache rates for 1 hour     │  │
│  │  - Cache centers for 24 hours │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### File Storage Service

**Purpose:** Store user-uploaded files (shipping documents, package images)

**Technology Options:**
- **AWS S3** (recommended for scalability)
- **Azure Blob Storage**
- **Google Cloud Storage**

**Storage Strategy:**
```
Folder Structure:
/users/{user_id}/conversations/{conversation_id}/attachments/{file_id}

File Metadata in DB:
{
  file_id: uuid,
  file_url: "https://cdn.smsa.com/...",
  file_type: "image/jpeg",
  file_size: 2048576, // bytes
  thumbnail_url: "https://cdn.smsa.com/thumbs/...",
  virus_scanned: true,
  uploaded_at: timestamp
}
```

---

## 3. DATA FLOW DIAGRAMS

### 3.1 User Message Flow (Complete Journey)

```
┌─────────┐
│  User   │
└────┬────┘
     │ "Track AWB123456"
     ▼
┌─────────────────────────┐
│   Frontend (Next.js)    │
│ - Validates input       │
│ - Shows typing indicator│
└────┬────────────────────┘
     │ POST /api/chat
     │ Body: {message, session_id, user_id}
     ▼
┌──────────────────────────────┐
│   API Gateway                │
│ - Authenticate (JWT)         │
│ - Rate limit check (Redis)   │
│ - Validate request schema    │
└────┬─────────────────────────┘
     │ ✓ Authorized
     ▼
┌──────────────────────────────────────┐
│   AI Agent Engine                    │
│                                      │
│ Step 1: Load Context                 │
│ ─────────────────────────            │
│   ↓ Query Redis                      │
│   ↓ Get last 10 messages from cache  │
│   ↓ Query Vector DB for relevant     │
│       historical context             │
│                                      │
│ Step 2: Intent Classification        │
│ ─────────────────────────            │
│   ↓ Pass to LLM/Classifier           │
│   ↓ Intent: SHIPMENT_TRACKING        │
│   ↓ Entity: {awb: "AWB123456"}       │
│                                      │
│ Step 3: Routing Decision             │
│ ─────────────────────────            │
│   ↓ Decision: Call Tracking API      │
│   ↓ No need for complex AI reasoning │
│                                      │
└────┬─────────────────────────────────┘
     │ API Call Request
     ▼
┌──────────────────────────────────────┐
│   API Client (Integration Layer)     │
│                                      │
│ Step 1: Check Cache                  │
│ ─────────────────────────            │
│   ↓ Redis key: tracking:AWB123456    │
│   ↓ Cache MISS                       │
│                                      │
│ Step 2: Call SMSA API                │
│ ─────────────────────────            │
│   ↓ GET smsa.com/api/track/AWB123456 │
│   ↓ Retry logic: Attempt 1           │
│   ↓ Success (200 OK)                 │
│                                      │
│ Step 3: Cache Response               │
│ ─────────────────────────            │
│   ↓ Store in Redis (TTL: 5 min)      │
│                                      │
└────┬─────────────────────────────────┘
     │ API Response:
     │ {status: "In Transit", location: "Riyadh"}
     ▼
┌──────────────────────────────────────┐
│   AI Agent Engine                    │
│                                      │
│ Step 4: Response Generation          │
│ ─────────────────────────            │
│   ↓ Format response for user         │
│   ↓ Add context (tracking link, map) │
│   ↓ Translate if needed (Arabic)     │
│                                      │
│ Step 5: Store Message                │
│ ─────────────────────────            │
│   ↓ PostgreSQL: Insert message row   │
│   ↓ Redis: Update session cache      │
│   ↓ Vector DB: Store embedding       │
│                                      │
└────┬─────────────────────────────────┘
     │ Response + Metadata
     ▼
┌──────────────────────────────────────┐
│   SSE Streaming Layer                │
│ - Token-by-token streaming           │
│ - Real-time to frontend              │
└────┬─────────────────────────────────┘
     │ Server-Sent Events
     ▼
┌─────────────────────────┐
│   Frontend (Next.js)    │
│ - Renders message       │
│ - Updates UI            │
│ - Shows tracking details│
└────┬────────────────────┘
     │ Display to user
     ▼
┌─────────┐
│  User   │
│ Sees:   │
│ "Your   │
│ package │
│ is in   │
│ Riyadh" │
└─────────┘
```

### 3.2 Session Management Flow

```
┌──────────────────────────────────────────────┐
│     User Opens Chat / Loads Previous Chat    │
└────┬─────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────┐
│  Frontend Request                  │
│  GET /api/sessions/{session_id}    │
└────┬───────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  API Gateway                             │
│  - Verify user owns this session         │
└────┬─────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  Check Redis Cache                       │
│  Key: session:{user_id}:{session_id}     │
└────┬─────────────────────────────────────┘
     │
     ├─→ CACHE HIT
     │   │
     │   ▼
     │  ┌────────────────────────────┐
     │  │ Return cached session      │
     │  │ Response time: ~5ms        │
     │  └────────────────────────────┘
     │
     └─→ CACHE MISS
         │
         ▼
        ┌─────────────────────────────────┐
        │ Query PostgreSQL                │
        │ SELECT * FROM conversations     │
        │ WHERE conversation_id = ?       │
        │                                 │
        │ SELECT * FROM messages          │
        │ WHERE conversation_id = ?       │
        │ ORDER BY timestamp DESC         │
        │ LIMIT 50                        │
        └────┬────────────────────────────┘
             │
             ▼
        ┌─────────────────────────────────┐
        │ Load Vector Context             │
        │ Query Pinecone/Qdrant           │
        │ - Get conversation embeddings   │
        │ - Load semantic context         │
        └────┬────────────────────────────┘
             │
             ▼
        ┌─────────────────────────────────┐
        │ Reconstruct Session Object      │
        │ {                               │
        │   conversation_id,              │
        │   messages: [...],              │
        │   context: {...},               │
        │   metadata: {...}               │
        │ }                               │
        └────┬────────────────────────────┘
             │
             ▼
        ┌─────────────────────────────────┐
        │ Cache in Redis                  │
        │ TTL: 24 hours                   │
        │ Return to user                  │
        └─────────────────────────────────┘
```

### 3.3 AI vs Direct API Decision Flow

```
User Message Received
        │
        ▼
┌───────────────────────────────┐
│   Intent Classification       │
│   (via LLM or Classifier)     │
└───────┬───────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│   Intent Detection Result               │
└────┬────────────────────┬───────────────┘
     │                    │
     │                    │
┌────▼──────────┐   ┌────▼────────────────┐
│ STRUCTURED    │   │ CONVERSATIONAL      │
│ QUERY         │   │ QUERY               │
│               │   │                     │
│ Examples:     │   │ Examples:           │
│ - Track AWB   │   │ - "How are you?"    │
│ - Get rates   │   │ - "Tell me about    │
│ - Find center │   │    SMSA history"    │
│ - Search FAQ  │   │ - "What do you      │
│               │   │    think about..."  │
└────┬──────────┘   └────┬────────────────┘
     │                   │
     ▼                   ▼
┌──────────────────┐   ┌──────────────────────┐
│ DIRECT API PATH  │   │ AI PROCESSING PATH   │
│                  │   │                      │
│ 1. Extract       │   │ 1. Load full context │
│    entities      │   │    from Vector DB    │
│                  │   │                      │
│ 2. Validate      │   │ 2. Pass to LLM       │
│    parameters    │   │    (Claude/GPT-4)    │
│                  │   │                      │
│ 3. Call SMSA API │   │ 3. Generate response │
│    directly      │   │    with reasoning    │
│                  │   │                      │
│ 4. Format        │   │ 4. Stream response   │
│    response      │   │    via SSE           │
│                  │   │                      │
│ Response time:   │   │ Response time:       │
│ 200-500ms        │   │ 2-5 seconds          │
└──────────────────┘   └──────────────────────┘
```

---

## 4. TECHNOLOGY STACK SUMMARY

### Frontend Stack
```
┌─────────────────────────────────────┐
│ Web Application                     │
│ ─────────────────────────────────   │
│ • Framework: Next.js 14             │
│ • Language: TypeScript              │
│ • Styling: Tailwind CSS             │
│ • Components: Radix UI              │
│ • State: Zustand                    │
│ • i18n: next-i18next                │
│ • SSE: EventSource API              │
│ • Build: Turbopack                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Mobile Application                  │
│ ─────────────────────────────────   │
│ • Framework: React Native           │
│ • Or: Native Integration            │
│ • State: Redux Toolkit              │
│ • API: Axios/Fetch                  │
└─────────────────────────────────────┘
```

### Backend Stack
```
┌─────────────────────────────────────┐
│ API Gateway & Backend               │
│ ─────────────────────────────────   │
│ • Runtime: Node.js 20 LTS           │
│ • Framework: Next.js API Routes     │
│              or Express.js          │
│ • Language: TypeScript              │
│ • Validation: Zod                   │
│ • Authentication: JWT + OAuth 2.0   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ AI Agent Engine                     │
│ ─────────────────────────────────   │
│ • Orchestration: LangChain          │
│ • LLM: Claude 3.5 Sonnet /          │
│       GPT-4 Turbo                   │
│ • Classification: Custom fine-tuned │
│                   BERT model        │
│ • NLP: spaCy (entity extraction)    │
└─────────────────────────────────────┘
```

### Data Layer Stack
```
┌─────────────────────────────────────┐
│ Persistent Database                 │
│ ─────────────────────────────────   │
│ • Primary: PostgreSQL 15            │
│ • ORM: Prisma / TypeORM             │
│ • Migration: Flyway / Prisma Migrate│
│ • Backup: Daily automated backups   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Vector Database                     │
│ ─────────────────────────────────   │
│ • Recommended: Pinecone             │
│ • Alternative: Qdrant (self-hosted) │
│ • Embedding: OpenAI text-embedding- │
│              ada-002 (1536 dims)    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Cache Layer                         │
│ ─────────────────────────────────   │
│ • Primary: Redis 7                  │
│ • Purpose: Session, rate limiting,  │
│            API cache                │
│ • TTL Strategy: Dynamic based on    │
│                 data type           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ File Storage                        │
│ ─────────────────────────────────   │
│ • Provider: AWS S3                  │
│ • CDN: CloudFront                   │
│ • Processing: Sharp (image resize)  │
│ • Security: Signed URLs             │
└─────────────────────────────────────┘
```

---

## 5. DATABASE DESIGN RATIONALE

### Why PostgreSQL for Persistent Storage?

✅ **ACID Compliance**: Critical for conversation integrity  
✅ **JSON Support**: Store flexible message metadata  
✅ **pgvector Extension**: Bonus vector capabilities  
✅ **Enterprise Ready**: Proven at scale (Instagram, GitHub)  
✅ **Complex Queries**: Join conversations with messages efficiently  
✅ **Transaction Safety**: Ensure data consistency  

### Why Pinecone for Vector Database?

✅ **Fully Managed**: No DevOps overhead  
✅ **High Performance**: Sub-50ms queries at scale  
✅ **Metadata Filtering**: Filter by user_id, date, intent  
✅ **Auto-scaling**: Handles traffic spikes automatically  
✅ **Production Ready**: Used by major AI companies  

**Alternative: Qdrant** (if cost is a concern)
- Open source, self-hostable
- Excellent filtering capabilities
- Requires infrastructure management

### Why Redis for Caching?

✅ **Blazing Fast**: In-memory, microsecond latency  
✅ **Rich Data Types**: Strings, hashes, lists, sets  
✅ **TTL Support**: Automatic expiration  
✅ **Pub/Sub**: Real-time features  
✅ **Rate Limiting**: Built-in sliding window algorithms  

---

## 6. SESSION & CONVERSATION MANAGEMENT STRATEGY

### Session Lifecycle

```
┌─────────────────────────────────────┐
│  User Opens Chat                    │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│  Generate session_id (UUID v4)      │
│  Example: 550e8400-e29b-41d4-a716...│
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│  Create Session Record              │
│  ───────────────────────────────    │
│  PostgreSQL:                        │
│    INSERT INTO conversations        │
│      (id, user_id, title,           │
│       created_at)                   │
│    VALUES (?, ?, 'New Chat', NOW()) │
│                                     │
│  Redis:                             │
│    SET session:{user_id}:{id}       │
│    VALUE: {metadata...}             │
│    TTL: 86400 (24 hours)            │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│  Messages Flow In...                │
│  ───────────────────────────────    │
│  Each message:                      │
│  1. Store in PostgreSQL             │
│  2. Update Redis cache              │
│  3. Create embedding → Vector DB    │
│  4. Update conversation metadata    │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│  Conversation Title Auto-generation │
│  ───────────────────────────────    │
│  After 3rd message:                 │
│  • Summarize conversation with LLM  │
│  • Generate 4-6 word title          │
│  • UPDATE conversations             │
│    SET title = 'Track Package       │
│                 AWB123456'          │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│  Session Retrieval (Sidebar)       │
│  ───────────────────────────────    │
│  Query:                             │
│    SELECT id, title, created_at,    │
│           updated_at                │
│    FROM conversations               │
│    WHERE user_id = ?                │
│    ORDER BY updated_at DESC         │
│    LIMIT 50                         │
│                                     │
│  Display in sidebar grouped by:     │
│  • Today                            │
│  • Yesterday                        │
│  • Last 7 days                      │
│  • Last 30 days                     │
│  • Older                            │
└─────────────────────────────────────┘
```

### Context Window Management (N-Sliding Window)

**Problem**: Can't send entire conversation history to LLM (token limits)

**Solution**: Sliding window approach

```
Conversation with 100 messages:
┌────────────────────────────────────────────┐
│ [1][2][3]...[85][86][87][88][89][90]      │
│                  ▲                         │
│                  │                         │
│            Recent N=10 messages            │
│         [86][87][88][89][90][91]...        │
│         [96][97][98][99][100]              │
│                                            │
│ Only these 10 sent to AI Agent             │
└────────────────────────────────────────────┘

BUT: Vector DB provides semantic search across ALL messages

When user asks "What was the tracking number from yesterday?"
    ↓
Query Vector DB: similarity_search(query, k=5)
    ↓
Retrieve relevant messages from history (even if not in last 10)
    ↓
Inject into context window
```

**Implementation:**
```
const contextWindow = {
  recentMessages: last_n_messages(10), // From Redis
  relevantHistory: vector_search(query, k=5), // From Pinecone
  userMetadata: {
    language: 'en',
    timezone: 'Asia/Riyadh',
    lastAWB: 'AWB123456' // Extracted from previous interaction
  }
};

// Send to LLM
const llmInput = {
  systemPrompt: SMSA_SYSTEM_PROMPT,
  context: contextWindow,
  currentMessage: userMessage
};
```

---

## 7. ENTERPRISE FEATURES

### 7.1 Monitoring & Observability

```
┌─────────────────────────────────────┐
│  Application Performance Monitoring │
│  ─────────────────────────────────  │
│  • Tool: DataDog / New Relic        │
│  • Metrics:                         │
│    - API response times             │
│    - LLM token usage                │
│    - Database query performance     │
│    - Error rates                    │
│    - User engagement metrics        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Logging                            │
│  ─────────────────────────────────  │
│  • Tool: ELK Stack / CloudWatch     │
│  • Log Levels: ERROR, WARN, INFO    │
│  • Structured JSON logs             │
│  • Retention: 90 days               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Alerting                           │
│  ─────────────────────────────────  │
│  • Tool: PagerDuty / Slack          │
│  • Alerts for:                      │
│    - API downtime                   │
│    - High error rates (>1%)         │
│    - Slow response times (>2s)      │
│    - Database connection issues     │
└─────────────────────────────────────┘
```

### 7.2 Security Measures

```
┌─────────────────────────────────────┐
│  Authentication & Authorization     │
│  ─────────────────────────────────  │
│  • JWT with short expiry (15 min)   │
│  • Refresh token rotation           │
│  • OAuth 2.0 for third-party        │
│  • MFA support (optional)           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Data Protection                    │
│  ─────────────────────────────────  │
│  • Encryption at rest (AES-256)     │
│  • Encryption in transit (TLS 1.3)  │
│  • PII data masking in logs         │
│  • GDPR compliance                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  API Security                       │
│  ─────────────────────────────────  │
│  • Rate limiting (100 req/min)      │
│  • Request signing (HMAC)           │
│  • Input validation (Zod schemas)   │
│  • SQL injection prevention (ORM)   │
│  • XSS protection (sanitization)    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  File Upload Security               │
│  ─────────────────────────────────  │
│  • File type validation             │
│  • Size limits (10MB max)           │
│  • Virus scanning (ClamAV)          │
│  • Signed URLs (1 hour expiry)      │
└─────────────────────────────────────┘
```

### 7.3 Scalability Strategy

```
┌─────────────────────────────────────┐
│  Horizontal Scaling                 │
│  ─────────────────────────────────  │
│  • Load Balancer (AWS ALB/Nginx)    │
│  • Auto-scaling groups              │
│  • Stateless API servers            │
│  • Session affinity (if needed)     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Database Scaling                   │
│  ─────────────────────────────────  │
│  • Read replicas (PostgreSQL)       │
│  • Connection pooling (PgBouncer)   │
│  • Partitioning by user_id          │
│  • Archive old conversations        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Caching Strategy                   │
│  ─────────────────────────────────  │
│  • Redis Cluster (high availability)│
│  • CDN for static assets            │
│  • API response caching             │
│  • Database query caching           │
└─────────────────────────────────────┘
```

### 7.4 Disaster Recovery

```
┌─────────────────────────────────────┐
│  Backup Strategy                    │
│  ─────────────────────────────────  │
│  • PostgreSQL: Daily full backups   │
│  • Redis: RDB snapshots every 6h    │
│  • S3: Cross-region replication     │
│  • Vector DB: Weekly exports        │
│  • Retention: 30 days               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  High Availability                  │
│  ─────────────────────────────────  │
│  • Multi-AZ deployment              │
│  • Database failover (30s RTO)      │
│  • Redis Sentinel (automatic        │
│    failover)                        │
│  • Health checks every 30s          │
└─────────────────────────────────────┘
```

---

## 8. DEPLOYMENT ARCHITECTURE

### Production Environment

```
┌──────────────────────────────────────────────────────┐
│                    CLOUD PROVIDER                     │
│              (AWS / Azure / GCP)                     │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │           Load Balancer (ALB/nginx)            │ │
│  │         SSL/TLS Termination                    │ │
│  └────┬───────────────────────┬───────────────────┘ │
│       │                       │                      │
│  ┌────▼─────────┐     ┌──────▼─────────┐           │
│  │  Frontend    │     │   Frontend     │           │
│  │  Server 1    │     │   Server 2     │           │
│  │  (Next.js)   │     │   (Next.js)    │           │
│  └────┬─────────┘     └──────┬─────────┘           │
│       │                      │                      │
│       └──────────┬───────────┘                      │
│                  │                                  │
│  ┌───────────────▼──────────────────────────────┐  │
│  │          API Gateway Layer                   │  │
│  │     (Next.js API / Express Servers)          │  │
│  │                                              │  │
│  │   [Server 1]  [Server 2]  [Server 3]        │  │
│  │   Auto-scaling: 3-10 instances              │  │
│  └───────┬──────────────────────────────────────┘  │
│          │                                         │
│  ┌───────▼─────────────────────────────────────┐  │
│  │        AI Agent Processing Layer            │  │
│  │    (GPU-enabled instances for inference)    │  │
│  │                                             │  │
│  │   [Agent 1]  [Agent 2]  [Agent 3]          │  │
│  │   Auto-scaling: 2-8 GPU instances          │  │
│  └───────┬─────────────────────────────────────┘  │
│          │                                         │
│  ┌───────▼──────────┬─────────────┬──────────┐   │
│  │                  │             │          │   │
│  │ ┌────────────┐   │ ┌─────────┐ │ ┌──────┐│   │
│  │ │PostgreSQL  │   │ │ Redis   │ │ │ S3   ││   │
│  │ │ Primary    │   │ │ Cluster │ │ │      ││   │
│  │ │            │   │ │         │ │ │      ││   │
│  │ │ Read       │   │ │ 3 nodes │ │ │      ││   │
│  │ │ Replicas   │   │ │         │ │ │      ││   │
│  │ └────────────┘   │ └─────────┘ │ └──────┘│   │
│  └──────────────────┴─────────────┴──────────┘   │
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │     External Services                      │  │
│  │  ┌──────────┐  ┌────────────┐  ┌────────┐ │  │
│  │  │ Pinecone │  │ OpenAI API │  │ SMSA   │ │  │
│  │  │ (Vector) │  │ (LLM)      │  │ APIs   │ │  │
│  │  └──────────┘  └────────────┘  └────────┘ │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## 9. API INTEGRATION PATTERNS

### Pattern 1: Simple Direct Call
```
User: "Track AWB123456"
    ↓
Intent: SHIPMENT_TRACKING
Entity: {awb: "AWB123456"}
    ↓
Direct Call: GET /smsa/api/track/AWB123456
    ↓
Response: Format and return
Time: ~300ms
```

### Pattern 2: AI-Enhanced Response
```
User: "Is my package delayed?"
    ↓
Intent: SHIPMENT_STATUS_INQUIRY
    ↓
Load Context: Find last AWB from conversation
    ↓
Call API: GET /smsa/api/track/{last_awb}
    ↓
AI Processing: Analyze delay, provide explanation
    ↓
Response: "Your package is currently delayed by 2 days 
          due to weather conditions in Riyadh..."
Time: ~2s
```

### Pattern 3: Multi-API Orchestration
```
User: "Compare shipping costs to Jeddah and Riyadh"
    ↓
Intent: RATES_COMPARISON
Entities: {destinations: ["Jeddah", "Riyadh"]}
    ↓
Parallel API Calls:
  ├─→ POST /smsa/api/rates (Jeddah)
  └─→ POST /smsa/api/rates (Riyadh)
    ↓
AI Processing: Format comparison table
    ↓
Response: Structured comparison with recommendations
Time: ~1s
```

---

## 10. CONVERSATION EXAMPLE WALKTHROUGH

**Scenario**: User wants to track package and then find nearest service center

```
┌──────────────────────────────────────────────────┐
│ Message 1: User                                  │
│ "Track AWB123456"                                │
└──────────────────────────────────────────────────┘
        │
        ▼
  Intent: SHIPMENT_TRACKING
  Entity: {awb: "AWB123456"}
        │
        ▼
  Call: GET /smsa/track/AWB123456
        │
        ▼
  Response: "Your package is currently in Riyadh
            Distribution Center. Expected delivery
            is tomorrow by 5 PM."
        │
        ▼
  Store in DB:
    - PostgreSQL: message record
    - Redis: session cache
    - Vector DB: embedding
    - Context: {last_awb: "AWB123456", 
                last_location: "Riyadh"}

┌──────────────────────────────────────────────────┐
│ Message 2: User                                  │
│ "Can I pick it up from a center?"                │
└──────────────────────────────────────────────────┘
        │
        ▼
  Intent: SERVICE_CENTER_INQUIRY
  Context Loaded:
    - Vector DB retrieves: last_location = "Riyadh"
    - Agent understands "it" = package AWB123456
        │
        ▼
  Call: GET /smsa/service-centers?city=Riyadh
        │
        ▼
  Response: "Yes! Here are 3 service centers in 
            Riyadh where you can pick up your package:
            
            1. SMSA Riyadh Main Branch
               📍 King Fahd Road
               ⏰ 8 AM - 10 PM
               📞 +966-xxx-xxxx
            
            2. SMSA Olaya Center
               📍 Olaya Street
               ⏰ 9 AM - 9 PM
            
            3. SMSA Al-Malqa Branch
               📍 Al-Malqa District
               ⏰ 8 AM - 11 PM
            
            Would you like me to provide directions?"
        │
        ▼
  Store in DB with context linkage

┌──────────────────────────────────────────────────┐
│ Message 3: User                                  │
│ "Yes, to the first one"                          │
└──────────────────────────────────────────────────┘
        │
        ▼
  Intent: NAVIGATION_REQUEST
  Context: Agent knows "first one" = Riyadh Main Branch
        │
        ▼
  Response: "Here's how to get to SMSA Riyadh Main Branch:
            
            🗺️ [Google Maps Link]
            
            From your location, it's approximately 
            15 minutes by car. The center is open 
            until 10 PM today.
            
            Pro tip: Bring your ID and the AWB number 
            (AWB123456) for quick pickup!"
```

**Key Points:**
- Context maintained across messages
- Agent remembers AWB, location, selected center
- No need to repeat information
- Natural conversation flow

---

## 11. WHY THIS ARCHITECTURE IS ENTERPRISE-GRADE

### ✅ Scalability
- Horizontal scaling of all components
- Load balancing across multiple servers
- Auto-scaling based on traffic
- Can handle 2M+ users (SMSA's mobile app user base)

### ✅ Reliability
- High availability (99.9% uptime)
- Database replication
- Automatic failover
- Circuit breakers prevent cascade failures
- Retry logic with exponential backoff

### ✅ Performance
- Redis caching for sub-50ms responses
- CDN for static assets
- Connection pooling
- Vector DB for fast semantic search
- API response caching

### ✅ Security
- End-to-end encryption
- JWT authentication
- Rate limiting
- Input validation
- API proxy hides sensitive endpoints
- GDPR compliance

### ✅ Maintainability
- Clean separation of concerns
- Modular architecture
- Comprehensive logging
- Monitoring and alerting
- Easy to debug and test

### ✅ Cost-Effective
- Cache heavily accessed data
- Use serverless for variable workloads
- Optimize LLM token usage
- Archive old conversations

---

## 12. SUMMARY & RECOMMENDATIONS

### Core Components
1. **Frontend**: Next.js (web) + React Native (mobile)
2. **API Gateway**: Next.js API Routes with security layers
3. **AI Agent**: LangChain + Claude/GPT-4
4. **Vector DB**: Pinecone (recommended) or Qdrant
5. **Persistent DB**: PostgreSQL with pgvector
6. **Cache**: Redis Cluster
7. **Storage**: AWS S3 + CloudFront

### Key Features
- Real-time SSE streaming
- Multi-language support (Arabic RTL + English)
- Session management with context preservation
- Intelligent routing (AI vs direct API)
- Conversation history with semantic search

### Enterprise Qualities
- Highly scalable (millions of users)
- Secure (encryption, authentication, validation)
- Reliable (99.9% uptime with failover)
- Observable (monitoring, logging, alerting)
- Performant (sub-second API responses)

---

## 13. NEXT STEPS

### Phase 1: Foundation (Weeks 1-2)
- Set up development environment
- Initialize PostgreSQL + Redis
- Create basic Next.js frontend
- Implement authentication

### Phase 2: Core Features (Weeks 3-5)
- Build AI Agent engine
- Integrate SMSA APIs
- Implement vector database
- Session management
- SSE streaming

### Phase 3: Enhancement (Weeks 6-7)
- Multi-language support
- File upload functionality
- Advanced caching strategies
- Monitoring and logging

### Phase 4: Testing & Launch (Week 8)
- Load testing
- Security audit
- User acceptance testing
- Production deployment

---

**END OF ARCHITECTURE DOCUMENT**