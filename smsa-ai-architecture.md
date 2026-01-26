# SMSA Express AI Assistant - System Architecture

## Abstract

This document outlines the architecture for the SMSA Express AI Assistant, an intelligent customer service platform designed to handle shipment tracking, rate inquiries, retail centre information, and frequently asked questions. The system employs a multi-agent architecture with a central orchestration layer, specialized domain agents, and advanced memory management to deliver contextual, accurate, and real-time responses to customers across web and mobile platforms.

The architecture leverages Deepseek AI for natural language understanding and generation, implements a RAG (Retrieval-Augmented Generation) pipeline for knowledge retrieval, and integrates directly with SMSA's existing APIs for real-time data access. The system is designed for high availability, scalability, and observability with comprehensive monitoring and logging capabilities.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Client Layer](#2-client-layer)
3. [API Gateway](#3-api-gateway)
4. [Master Agent - Core Orchestration](#4-master-agent---core-orchestration)
5. [Specialized Agents](#5-specialized-agents)
6. [Memory Layer](#6-memory-layer)
7. [External Services Integration](#7-external-services-integration)
8. [File Handling & Vision Processing](#8-file-handling--vision-processing)
9. [Response Delivery](#9-response-delivery)
10. [Agent Instructions Framework](#10-agent-instructions-framework)
11. [Monitoring & Observability](#11-monitoring--observability)
12. [Data Flow](#12-data-flow)
13. [Security Considerations](#13-security-considerations)
14. [Scalability & Resilience](#14-scalability--resilience)

---

## 1. System Overview

### 1.1 High-Level Architecture

The SMSA Express AI Assistant follows a layered microservices architecture with the following primary components:

| Layer | Components | Responsibility |
|-------|------------|----------------|
| Client | Web App, Mobile App | User interface and interaction |
| Gateway | API Gateway | Request routing, authentication, rate limiting |
| Orchestration | Master Agent, Intent Router, Context Assembly | Request classification and agent coordination |
| Agents | Tracking, Rates, Retail Centres, FAQ | Domain-specific request handling |
| Memory | Vector DB, MongoDB | Conversation history and semantic search |
| External | SMSA APIs, Deepseek AI | Business data and AI capabilities |

### 1.2 Design Principles

- **Separation of Concerns**: Each agent handles a specific domain, enabling independent development and scaling
- **Quadrailing AI**: Controlled response generation using Chain-of-Thought (COT) and Single Shot prompting strategies
- **Context-Aware**: Full conversation history and semantic context available for all interactions
- **Real-Time Integration**: Direct integration with SMSA APIs for live shipment and rate data
- **Observability-First**: Comprehensive logging, metrics, and monitoring throughout the system

---

## 2. Client Layer

### 2.1 Web Application

**URL**: `ai.smsaexpress.com`

The web application provides a browser-based interface for customers to interact with the AI assistant. 

**Features**:
- Real-time chat interface with SSE (Server-Sent Events) streaming
- File upload capability for SAWB (Shipping Air Waybill) documents
- Conversation history access
- Multi-language support (Arabic/English)

**Technology Stack**:
- Frontend Framework: React/Vue.js
- Real-time Communication: SSE for streaming responses
- File Handling: Direct S3 upload with presigned URLs

### 2.2 Mobile Application

**App Name**: SMSA Mobile

Native mobile application providing the same AI assistant capabilities optimized for mobile devices.

**Features**:
- Push notifications for shipment updates
- Camera integration for document capture
- Offline conversation caching
- Biometric authentication

### 2.3 Technology Stack

### **Frontend Layer**
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Web App | Next.js | 14.x | Server-side rendering, SEO optimization |
| UI Framework | Tailwind CSS | 3.x | Responsive styling |
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
| Runtime | Python | 3.12 | Agent execution environment |
| API Server | FastAPI | 0.109.x | HTTP endpoints for agents |
| LLM Integration | DeepSeek SDK | Latest | AI model access |
| Prompt Management | Custom Templates | - | Controlled AI responses |

### **Data Layer**
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Primary Database | MongoDB | 6.x | Conversations, users, messages |
| Vector Database | Qdrant | 1.7.x | Semantic search, embeddings |
| Object Storage | AWS S3 | - | Images, conversation JSONs |

### **External Services**
| Service | Provider | Purpose |
|---------|----------|---------|
| Vision AI | DeepSeek Vision | AWB extraction from images |
| Chat LLM | DeepSeek Chat V2.5 | Complex reasoning, response generation |
| Embeddings | DeepSeek Embeddings | Text vectorization for RAG |
| SMSA APIs | Internal | Tracking, Rates, Centers, FAQ |

---

---

## 3. API Gateway

The API Gateway serves as the single entry point for all client requests, providing:

### 3.1 Core Functions

| Function | Description |
|----------|-------------|
| Authentication | JWT token validation, API key management |
| Rate Limiting | Request throttling per user/IP |
| Request Routing | Directing requests to appropriate services |
| Load Balancing | Distributing traffic across service instances |
| SSL Termination | HTTPS handling |

### 3.2 Integrations

The gateway directly connects to:
- **MongoDB**: Session management and user authentication
- **S3 Bucket**: File upload coordination
- **AI Orchestrator**: Primary request routing for AI interactions

---

## 4. Master Agent - Core Orchestration

The Master Agent is the brain of the system, responsible for understanding user intent and coordinating the appropriate response.

### 4.1 Intent Classification Router

**Technology**: Python-based classification engine

**Responsibilities**:
- Parse incoming user messages
- Classify intent using template prompting
- Route to appropriate specialized agent
- Handle multi-intent queries

**Intent Categories**:
```
├── TRACKING      → Shipment Tracking Agent
├── RATES         → Rates Agent
├── LOCATIONS     → Retail Centres Agent
├── FAQ           → FAQ Agent
├── COMPLEX       → Deepseek AI (Complex Reasoning)
└── AMBIGUOUS     → Clarification Flow
```

### 4.2 Quadrailing AI

The system implements controlled AI response generation through two primary strategies:

**Chain-of-Thought (COT)**:
- Used for complex, multi-step queries
- Explicit reasoning steps before final answer
- Better accuracy for calculations and logical deductions

**Single Shot**:
- Used for straightforward queries
- Direct response generation
- Lower latency for simple requests

### 4.3 AI Orchestrator

Central coordination component managing:
- Agent selection and invocation
- Response aggregation from multiple agents
- Fallback handling when agents cannot respond
- Context injection for all agent calls

### 4.4 Context Assembly

**Responsibilities**:
- Retrieve relevant conversation history from MongoDB
- Fetch user profile and preferences
- Coordinate file context from S3
- Build complete context object for agent processing

**Context Object Structure**:
```json
{
  "user": {
    "id": "string",
    "preferences": {},
    "history_summary": "string"
  },
  "conversation": {
    "id": "string",
    "messages": [],
    "current_intent": "string"
  },
  "files": {
    "uploaded": [],
    "extracted_data": {}
  },
  "semantic_context": {
    "relevant_documents": [],
    "similarity_scores": []
  }
}
```

---

## 5. Specialized Agents

Each specialized agent is designed to handle a specific domain of customer inquiries.

### 5.1 Shipment Tracking Agent

**Purpose**: Handle all shipment tracking inquiries

**Capabilities**:
- Track shipments by AWB number
- Provide delivery status and ETA
- Show shipment history and events
- Handle tracking for multiple shipments

**Data Sources**:
- SMSA Tracking APIs
- Historical tracking data (cached)

**Example Intents**:
- "Where is my package?"
- "Track AWB 123456789"
- "When will my shipment arrive?"

### 5.2 Rates Agent

**Purpose**: Provide shipping rate quotations

**Capabilities**:
- Calculate shipping rates based on origin/destination
- Compare service levels (Express, Economy, etc.)
- Apply promotional discounts
- Handle weight/dimension-based pricing

**Data Sources**:
- SMSA Rates API
- Pricing rules engine
- Promotional offers database

**Example Intents**:
- "How much to ship to Dubai?"
- "Compare express vs economy rates"
- "What's the rate for a 5kg package?"

### 5.3 Retail Centres Agent

**Purpose**: Provide information about SMSA retail locations

**Capabilities**:
- Find nearest retail centre
- Provide operating hours
- List available services per location
- Handle appointment scheduling queries

**Data Sources**:
- SMSA Location APIs
- Store information database

**Example Intents**:
- "Nearest SMSA branch to me"
- "What time does the Riyadh branch close?"
- "Which branches offer COD pickup?"

### 5.4 FAQ Agent

**Purpose**: Answer general questions using knowledge base

**Capabilities**:
- Answer policy questions
- Provide service information
- Handle how-to queries
- Escalate complex issues

**Data Sources**:
- Deepseek AI Embeddings
- RAG Pipeline
- Vector Database

**Example Intents**:
- "What's your return policy?"
- "How do I schedule a pickup?"
- "What items are prohibited?"

---

## 6. Memory Layer

### 6.1 Vector Database

**Purpose**: Semantic search and retrieval for contextual understanding

**Contents**:
| Data Type | Description |
|-----------|-------------|
| Conversation Embeddings | Vector representations of past conversations |
| FAQ Embeddings | Knowledge base articles as vectors |
| Document Embeddings | Uploaded document content |

**Capabilities**:
- Similarity search for relevant context
- Historical conversation retrieval
- Knowledge base querying

**Integration**: Connected to RAG Pipeline for FAQ Agent

### 6.2 MongoDB

**Purpose**: Primary data store for structured and unstructured data

**Collections**:

```
├── users
│   ├── user_id
│   ├── profile
│   ├── preferences
│   └── auth_tokens
│
├── conversations
│   ├── conversation_id
│   ├── user_id
│   ├── created_at
│   ├── status
│   └── metadata
│
├── messages
│   ├── message_id
│   ├── conversation_id
│   ├── role (user/assistant)
│   ├── content
│   ├── timestamp
│   ├── intent
│   └── agent_used
│
└── analytics
    ├── session_data
    ├── agent_performance
    └── user_feedback
```

---

## 7. External Services Integration

### 7.1 SMSA APIs

**Integration Pattern**: RESTful API with resilience patterns

**Resilience Features**:

| Pattern | Implementation |
|---------|----------------|
| Circuit Breaker | Prevent cascade failures when SMSA APIs are down |
| Retry Logic | Exponential backoff for transient failures |
| Cache Layer | Reduce load and improve response times |

**API Endpoints**:
- Tracking API: `/v1/tracking/{awb}`
- Rates API: `/v1/rates/calculate`
- Locations API: `/v1/retail-centres`
- Customer API: `/v1/customers/{id}`

**Cache Strategy**:
- Tracking data: 5-minute TTL
- Rates: 1-hour TTL
- Locations: 24-hour TTL

### 7.2 Deepseek AI Integration

**Services Used**:

| Service | Purpose |
|---------|---------|
| Deepseek AI API | Complex reasoning and response generation |
| Deepseek Embeddings | Text vectorization for RAG pipeline |
| Deepseek Vision API | Image understanding for document processing |

**API Configuration**:
- Temperature: 0.7 (balanced creativity/accuracy)
- Max tokens: 2048
- Streaming: Enabled for real-time responses

---

## 8. File Handling & Vision Processing

### 8.1 File Upload Component

**Supported Files**:
- SAWB documents (PDF, Image)
- Supporting documents
- Proof of delivery images

**Upload Flow**:
1. Client requests presigned URL from API Gateway
2. Direct upload to S3 bucket
3. Metadata stored in MongoDB
4. Processing triggered for AI analysis

### 8.2 S3 Bucket Storage

**Bucket Structure**:
```
smsa-ai-storage/
├── conversations/
│   └── {conversation_id}/
│       └── context.json
├── uploads/
│   └── {user_id}/
│       └── {file_id}.{ext}
└── processed/
    └── {file_id}/
        └── extracted_data.json
```

### 8.3 Deepseek Vision API

**Capabilities**:
- Extract text from SAWB images
- Read handwritten notes
- Verify document authenticity
- Extract structured data from forms

**Processing Flow**:
```
Image Upload → S3 Storage → Vision API → Extracted Data → Orchestrator
```

---

## 9. Response Delivery

### 9.1 Response Generator (FastAPI)

**Purpose**: Format and prepare responses from all agents

**Functions**:
- Response formatting and templating
- Multi-language translation
- Markdown/rich text processing
- Response validation

### 9.2 SSE Stream

**Technology**: Server-Sent Events

**Benefits**:
- Real-time token streaming
- Reduced perceived latency
- Progressive response display
- Connection efficiency

**Implementation**:
```
Agent Response → Response Generator → SSE Stream → Client
```

---

## 10. Agent Instructions Framework

### 10.1 Prompt Engineering Instructions

Each agent receives carefully crafted instructions defining:

| Component | Description |
|-----------|-------------|
| Agent Role | Clear definition of agent's purpose and scope |
| Limitations | Boundaries of what the agent can/cannot do |
| Response Format | Expected output structure |
| Tone & Style | Communication guidelines |
| Error Handling | How to handle edge cases |

### 10.2 Validations

Pre-processing validations applied to all agent interactions:

- Input sanitization
- Intent validation
- Parameter extraction and verification
- Security checks
- Rate limit verification

### 10.3 Framework Structure

```
Agent Instructions Framework
├── System Prompts
│   ├── tracking_agent_prompt.txt
│   ├── rates_agent_prompt.txt
│   ├── retail_agent_prompt.txt
│   └── faq_agent_prompt.txt
├── Validation Rules
│   ├── input_validators.py
│   └── output_validators.py
└── Response Templates
    ├── tracking_responses.json
    └── error_responses.json
```

---

## 11. Monitoring & Observability

### 11.1 Centralized Logging

All requests and responses are logged with:
- Unique request ID
- Timestamp
- User ID
- Intent classification
- Agent used
- Response time
- Token usage

### 11.2 Metrics Dashboard

| Metric | Description | Target |
|--------|-------------|--------|
| Token Usage per Request | Monitor AI cost and efficiency | < 1000 tokens avg |
| Latency per Agent | Response time by agent type | < 2s p95 |
| Hallucination Detection | Accuracy and factual correctness | < 1% hallucination rate |
| User Satisfaction Scores | Feedback-based quality metric | > 4.5/5 rating |

### 11.3 Alerting

Automated alerts for:
- High error rates
- Increased latency
- API integration failures
- Unusual token consumption
- Hallucination detection triggers

---

## 12. Data Flow

### 12.1 Standard Query Flow

```
1. User sends message via Web/Mobile App
2. API Gateway authenticates and routes request
3. Request logged, context assembled from MongoDB
4. Intent Classification Router analyzes message
5. AI Orchestrator selects appropriate agent(s)
6. Agent processes request with SMSA API data
7. Response Generator formats output
8. SSE Stream delivers response to client
9. Conversation stored in MongoDB
10. Metrics logged for monitoring
```

### 12.2 Document Processing Flow

```
1. User uploads SAWB document
2. File stored in S3 bucket
3. Metadata recorded in MongoDB
4. Deepseek Vision API extracts content
5. Extracted data sent to Orchestrator
6. Context enriched with document data
7. Relevant agent processes enriched request
8. Response delivered via SSE Stream
```

### 12.3 RAG Query Flow

```
1. FAQ intent detected
2. User query embedded via Deepseek Embeddings
3. Vector DB searched for similar content
4. Top-k relevant documents retrieved
5. Context assembled with retrieved documents
6. FAQ Agent generates informed response
7. Response validated and delivered
```

---

## 13. Security Considerations

### 13.1 Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- API key management for service-to-service communication
- Session management with secure tokens

### 13.2 Data Protection

- Encryption at rest for all databases
- TLS 1.3 for all communications
- PII masking in logs
- Data retention policies compliance

### 13.3 API Security

- Rate limiting per user and IP
- Input validation and sanitization
- SQL injection prevention
- XSS protection

---

## 14. Scalability & Resilience

### 14.1 Horizontal Scaling

| Component | Scaling Strategy |
|-----------|------------------|
| API Gateway | Load balancer with auto-scaling |
| Agent Services | Kubernetes pods with HPA |
| MongoDB | Replica sets with sharding |
| Vector DB | Distributed cluster |

### 14.2 Fault Tolerance

- Circuit breakers for external API calls
- Retry logic with exponential backoff
- Graceful degradation when services unavailable
- Multi-region deployment for disaster recovery

### 14.3 Performance Optimization

- Response caching at multiple layers
- Connection pooling for databases
- Async processing for non-critical operations
- CDN for static assets

---

## Appendix A: Technology Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React/Vue.js, SSE |
| API Gateway | Kong/AWS API Gateway |
| Backend | Python, FastAPI |
| AI/ML | Deepseek AI (Chat, Embeddings, Vision) |
| Databases | MongoDB, Vector DB (Pinecone/Weaviate) |
| Storage | AWS S3 |
| Monitoring | Prometheus, Grafana, ELK Stack |
| Container | Docker, Kubernetes |

---

## Appendix B: API Reference

### Intent Classification Endpoint

```
POST /api/v1/chat
Content-Type: application/json

{
  "conversation_id": "string",
  "message": "string",
  "attachments": ["string"]
}

Response: SSE Stream
```

### File Upload Endpoint

```
POST /api/v1/files/upload
Content-Type: multipart/form-data

Response:
{
  "file_id": "string",
  "upload_url": "string",
  "status": "success"
}
```

---

*Document Version: 1.0*  
*Last Updated: January 2025*  
*Author: SMSA Express AI Team*
