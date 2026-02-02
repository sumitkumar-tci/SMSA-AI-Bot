# AI Shopping Agent - Phase 1 ETA & Delivery Plan
---

## Executive Summary

This document provides a complete end-to-end delivery plan for **Phase 1: Preference-Based Shopping Recommendations MVP** of the JAK Delivery AI Shopping Agent. The system transforms JAK Delivery into an intelligent shopping companion by providing personalized product recommendations through curated shopping links, without becoming a traditional e-commerce platform.

**Phase 1 Deliverables:**
- AI Shopping Agent with conversational product search
- Shopping Preferences Engine for personalization
- Integration with Open Search API for product discovery
- User preference management and learning system
- Iterative recommendation refinement workflow

**Timeline:** weeks??
**Risk Level:** Low-Medium

---

## 1. Phase 1 Objective and Scope

### 1.1 Business Objective

Enable JAK Delivery users to discover and shop from international merchants through an AI-powered personal shopping assistant that:
- Understands user preferences through conversation and historical data
- Provides personalized product recommendations via curated shopping links
- Guides users through the international shopping and shipping process
- Maintains JAK's logistics-first identity (no checkout, no payment processing)

### 1.2 In-Scope Features

**Core Capabilities:**
1. **AI Shopping Agent**
   - Conversational product search interface
   - Natural language understanding for shopping queries
   - Product recommendation generation with match scores
   - Iterative refinement based on user feedback
   - Shopping link curation (external merchant links only)

2. **Shopping Preferences Engine**
   - Demographic attributes collection (age, gender, preferred origin)
   - Preference attributes management (colors, sizes, brands, styles)
   - Behavioral attributes tracking (purchase frequency, categories, interactions)
   - Preference learning and evolution over time
   - Context-aware recommendation generation

3. **User Journey Support**
   - Three user types: logged-in with history, logged-in without history, new user
   - Preference gathering through conversational questions
   - Order history analysis for existing users
   - Personalized greeting and context awareness

4. **Integration Points**
   - Open Search API integration (USA, Turkey origins)
   - JAK user database access (order history, user profiles)
   - Real-time preference storage and retrieval

### 1.3 Out-of-Scope (Phase 1)

- In-app checkout or payment processing
- Direct merchant API integrations (beyond Open Search)
- Price comparison engines
- Automated purchasing on behalf of users
- Affiliate link tracking (Phase 2)
- Multi-origin support beyond USA and Turkey
- Advanced analytics dashboard

---

## 2. High-Level System Architecture

### 2.1 Architecture Overview

The system follows a **layered microservices architecture** with clear separation between presentation, orchestration, AI processing, and data layers.

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         JAK Delivery Web App (Next.js)                    │  │
│  │  - AI Shopping Agent Chat Interface                       │  │
│  │  - Preference Management UI                               │  │
│  │  - Recommendation Display with Match Scores               │  │
│  │  - SSE Streaming for Real-time Responses                  │  │
│  └───────────────────────┬───────────────────────────────────┘  │
└──────────────────────────┼───────────────────────────────────────┘
                           │ HTTP/SSE
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              API GATEWAY LAYER                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         Node.js + Express Gateway                          │  │
│  │  - Request routing and authentication                      │  │
│  │  - SSE proxy to AI Engine                                  │  │
│  │  - Rate limiting and security                               │  │
│  └───────────────────────┬───────────────────────────────────┘  │
└──────────────────────────┼───────────────────────────────────────┘
                           │ HTTP POST / SSE
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│            AI ENGINE LAYER                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │      Python + FastAPI + LangGraph Orchestrator             │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   User       │→ │  Preferences │→ │  Shopping    │    │  │
│  │  │  Context     │  │   Engine     │  │   Agent      │    │  │
│  │  │  Assembly    │  │              │  │              │    │  │
│  │  └──────────────┘  └──────────────┘  └──────┬───────┘    │  │
│  └─────────────────────────────────────────────┼─────────────┘  │
└─────────────────────────────────────────────────┼─────────────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────┐
                    ▼                             ▼             ▼
        ┌──────────────────┐      ┌──────────────────┐  ┌──────────────┐
        │  Open Search     │      │  JAK User DB     │  │  LLM Service │
        │  API (USA/Turkey)│      │  (Order History) │  │  (Qwen/DeepSeek)│
        └──────────────────┘      └──────────────────┘  └──────────────┘
```

### 2.2 Component Architecture

**Layer 1: Client Layer (Frontend)**
- **Technology:** Next.js 14, React, TypeScript, Tailwind CSS
- **Responsibilities:**
  - Chat interface with AI Shopping Agent
  - Real-time message streaming via SSE
  - Recommendation cards with match scores and shopping links
  - Preference display and editing UI
  - User authentication state management

**Layer 2: API Gateway**
- **Technology:** Node.js, Express.js, TypeScript
- **Responsibilities:**
  - Request routing to AI Engine
  - Authentication and session management
  - SSE stream proxying
  - Rate limiting and security
  - Request/response logging

**Layer 3: AI Engine (Backend)**
- **Technology:** Python 3.12, FastAPI, LangGraph
- **Responsibilities:**
  - User context assembly (order history, preferences)
  - Shopping Preferences Engine orchestration
  - AI Shopping Agent conversation management
  - Product search and recommendation generation
  - LLM integration for natural language understanding

**Layer 4: Data & External Services**
- **Shopping Preferences Database:** MongoDB/PostgreSQL
- **Open Search API:** Product discovery (USA, Turkey)
- **LLM Service:** Qwen/DeepSeek for conversational AI
- **JAK User Database:** Order history and user profiles

---

## 3. AI Components and Data Flow

### 3.1 Shopping Preferences Engine

**Purpose:** Centralized intelligence layer that transforms user attributes and behavioral signals into actionable shopping insights.

**Data Sources:**
1. **Order History** (Existing JAK user data)
   - Historical purchase data
   - Product categories purchased
   - Shipping origins used
   - Purchase frequency and patterns

2. **Conversational Inputs** (Real-time user interactions)
   - Direct preference questions and answers
   - Refinement feedback on recommendations
   - Implicit signals from user behavior

**Attribute Categories:**

**Demographic Attributes (5% weight):**
- Age (optional, inferred or declared)
- Gender (optional)
- Preferred shipping origin (USA, Turkey)

**Preference Attributes (80% weight):**
- Preferred colors
- Size preferences (clothing, shoes, etc.)
- Favorite brands
- Style or category inclinations
- Budget ranges

**Behavioral Attributes (15% weight):**
- Purchase frequency
- Average shipment value
- Product categories shipped
- Interaction patterns (accepted/skipped/refined recommendations)

**Processing Flow:**
```
User Data Sources
    │
    ├─→ Order History Analysis
    │   └─→ Extract: categories, brands, origins, frequency
    │
    └─→ Conversational Inputs
        └─→ Extract: preferences, refinements, explicit choices
            │
            ▼
[Attribute Classification Engine]
    │
    ├─→ Demographic Attributes
    ├─→ Preference Attributes
    └─→ Behavioral Attributes
        │
        ▼
[AI Processing Engine]
    │
    ├─→ Weighted attribute combination
    ├─→ Preference scoring and ranking
    └─→ Recommendation context generation
        │
        ▼
Clear visibility into shopper interests
Shortened path to likely purchases
```

### 3.2 AI Shopping Agent

**Purpose:** Conversational interface that helps users discover products through personalized recommendations.

**Core Workflow:**

1. **User Context Detection**
   - Determine user type: logged-in with history, logged-in without history, new user
   - Load existing preferences from database
   - Analyze order history (if available)

2. **Preference Gathering** (for new users or incomplete profiles)
   - Conversational questions: "What are you looking for?", "What's your budget?", "Which brands do you prefer?"
   - Store responses in Preferences Engine
   - Build initial preference profile

3. **Product Search & Recommendation**
   - Generate search query from user intent + preferences
   - Call Open Search API (filtered by origin: USA or Turkey)
   - Receive product results with metadata
   - Score and rank products based on preference match
   - Generate match scores (90%, 75%, 70%, etc.)

4. **Iterative Refinement**
   - Present top 3-4 recommendations with match scores
   - User provides feedback: "I need white stripe", "Not my style", "Too expensive"
   - Refine search query with additional constraints
   - Re-search and re-rank
   - Repeat until user satisfaction (target: 99-100% match)

5. **Shopping Link Delivery**
   - Provide curated external merchant links
   - User clicks link and completes purchase externally
   - No checkout or payment processing in JAK

**Data Flow Diagram:**

```
User Query: "I need Nike shoes size 42"
    │
    ▼
[AI Shopping Agent]
    │
    ├─→ [User Context Assembly]
    │   ├─→ Load preferences from DB
    │   ├─→ Check order history
    │   └─→ Build user profile context
    │
    ├─→ [Preference Engine Query]
    │   └─→ Get: brand preferences, size, style, budget
    │
    ├─→ [Search Query Generation]
    │   └─→ Build: "Nike shoes size 42, budget < $50, origin: USA"
    │
    ├─→ [Open Search API Call]
    │   └─→ Search products in USA origin
    │
    ├─→ [Recommendation Scoring]
    │   ├─→ Match against preferences
    │   ├─→ Calculate match scores
    │   └─→ Rank top results
    │
    └─→ [LLM Response Generation]
        └─→ Format: "Here are 3 Nike shoes matching your preferences..."
            │
            ▼
User sees recommendations with match scores
    │
    ▼
User: "I need white stripe"
    │
    ▼
[Refinement Loop]
    └─→ Re-search with "white stripe" constraint
        └─→ Present updated recommendations
```

### 3.3 LLM Integration

**Model:** Qwen/DeepSeek (similar to SMSA AI Assistant architecture)

**Use Cases:**
1. **Natural Language Understanding**
   - Parse user shopping queries
   - Extract product attributes (brand, size, color, style)
   - Understand refinement requests

2. **Conversational Flow Management**
   - Generate preference-gathering questions
   - Provide personalized greetings
   - Handle ambiguous queries

3. **Response Generation**
   - Format product recommendations naturally
   - Explain match scores and reasoning
   - Provide shipping guidance and JAK address reminders

**Prompt Engineering:**
- System prompts define agent personality (helpful shopping assistant)
- Context injection includes user preferences and order history
- Response templates ensure consistent formatting

---

## 4. Backend and Frontend Responsibilities

### 4.1 Backend Components

**4.1.1 AI Engine (Python/FastAPI)**

**Core Modules:**

1. **Orchestrator (`orchestrator/graph.py`)**
   - LangGraph workflow for agent orchestration
   - State management for conversation flow
   - Context assembly and routing

2. **Shopping Agent (`agents/shopping_agent.py`)**
   - Main conversational logic
   - Product search coordination
   - Recommendation generation and scoring
   - Refinement loop management

3. **Preferences Engine (`services/preferences_engine.py`)**
   - Attribute extraction and classification
   - Preference storage and retrieval
   - Learning and evolution logic
   - Recommendation context generation

4. **Open Search Client (`services/opensearch_client.py`)**
   - API integration for product search
   - Query building and filtering
   - Result parsing and normalization

5. **LLM Client (`services/llm_client.py`)**
   - Chat completions for conversation
   - Intent extraction
   - Response generation

6. **User Context Service (`services/user_context.py`)**
   - Order history retrieval from JAK DB
   - User profile assembly
   - Preference loading

**API Endpoints:**
- `POST /api/shopping/chat` - Main chat endpoint with SSE streaming
- `GET /api/preferences/{user_id}` - Get user preferences
- `PUT /api/preferences/{user_id}` - Update preferences
- `POST /api/shopping/search` - Direct product search (internal)

**4.1.2 Database Schema**

**Preferences Collection:**
```json
{
  "user_id": "string",
  "demographic": {
    "age": "number | null",
    "gender": "string | null",
    "preferred_origins": ["USA", "Turkey"]
  },
  "preferences": {
    "colors": ["black", "white"],
    "sizes": {
      "shoes": "42",
      "clothing": "L"
    },
    "brands": ["Nike", "Adidas"],
    "styles": ["sporty", "casual"],
    "budget_range": {"min": 0, "max": 100}
  },
  "behavioral": {
    "purchase_frequency": "monthly",
    "avg_shipment_value": 150,
    "categories": ["shoes", "electronics"],
    "interaction_history": []
  },
  "last_updated": "timestamp",
  "learning_score": 0.85
}
```

**Conversation History:**
```json
{
  "conversation_id": "string",
  "user_id": "string",
  "messages": [
    {
      "role": "user | assistant",
      "content": "string",
      "timestamp": "datetime",
      "metadata": {
        "intent": "search | refine | preference_gathering",
        "products_recommended": [],
        "match_scores": []
      }
    }
  ],
  "created_at": "timestamp"
}
```

### 4.2 Frontend Components

**4.2.1 Chat Interface (`components/ShoppingAgentChat.tsx`)**
- Real-time chat UI with SSE streaming
- Message history display
- Recommendation cards with match scores
- Shopping link buttons (external links)
- Refinement input field

**4.2.2 Recommendation Display (`components/RecommendationCard.tsx`)**
- Product information display
- Match score visualization (90%, 75%, etc.)
- Shopping link button
- "Not interested" / "Refine" actions

**4.2.3 Preferences UI (`components/PreferencesPanel.tsx`)**
- Display current preferences
- Edit preferences (colors, sizes, brands)
- Preference learning indicators
- Order history summary

**4.2.4 User Onboarding (`components/PreferenceGathering.tsx`)**
- Conversational preference questions
- Multi-step form (optional, can be conversational)
- Progress indicator

**Technology Stack:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Server-Sent Events (SSE) for streaming

---

## 5. Execution Plan and Milestones

### 5.1 Development Phases

**Phase 1.1: Foundation & Setup (Week 1)**
- Project structure and monorepo setup
- Database schema design and implementation
- API Gateway and AI Engine skeleton
- Environment configuration
- Basic authentication integration

**Deliverables:**
- ✅ Monorepo structure (apps/web, apps/gateway, apps/ai-engine)
- ✅ Database schema and migrations
- ✅ Basic API endpoints (health check, auth)
- ✅ Development environment setup

**Phase 1.2: Preferences Engine (Week 2)**
- Preferences Engine core logic
- Attribute classification system
- Preference storage and retrieval
- Order history analysis module
- Learning and evolution algorithms

**Deliverables:**
- ✅ Preferences Engine service
- ✅ Attribute extraction from order history
- ✅ Preference scoring and ranking
- ✅ Database integration for preferences

**Phase 1.3: AI Shopping Agent Core (Week 3-4)**
- Shopping Agent conversation logic
- Open Search API integration
- Product search and filtering
- Recommendation scoring algorithm
- LLM integration for natural language

**Deliverables:**
- ✅ Shopping Agent service
- ✅ Open Search API client
- ✅ Recommendation generation with match scores
- ✅ LLM integration for conversations

**Phase 1.4: Refinement Loop (Week 4-5)**
- Iterative refinement workflow
- User feedback processing
- Query refinement logic
- Re-ranking and re-scoring
- Conversation state management

**Deliverables:**
- ✅ Refinement loop implementation
- ✅ Feedback processing
- ✅ Multi-turn conversation support
- ✅ State persistence

**Phase 1.5: Frontend Development (Week 5-6)**
- Chat interface with SSE streaming
- Recommendation card components
- Preferences UI
- User onboarding flow
- Responsive design

**Deliverables:**
- ✅ Complete chat interface
- ✅ Recommendation display
- ✅ Preferences management UI
- ✅ Mobile-responsive design

**Phase 1.6: Integration & Testing (Week 6-7)**
- End-to-end integration testing
- User journey testing (all three user types)
- Performance optimization
- Error handling and edge cases
- Security review

**Deliverables:**
- ✅ Integration tests
- ✅ User acceptance testing
- ✅ Performance benchmarks
- ✅ Error handling coverage

**Phase 1.7: Deployment & Launch (Week 7-8)**
- Production environment setup
- Deployment pipeline
- Monitoring and logging
- Documentation
- Launch preparation

**Deliverables:**
- ✅ Production deployment
- ✅ Monitoring dashboards
- ✅ User documentation
- ✅ Launch readiness

### 5.2 Key Milestones

| Milestone | Week | Deliverable | Success Criteria |
|-----------|------|-------------|------------------|
| **M1: Foundation** | 1 | Project setup, DB schema | All services running locally |
| **M2: Preferences Engine** | 2 | Preferences Engine functional | Can store/retrieve preferences, analyze order history |
| **M3: Shopping Agent MVP** | 4 | Basic product search working | Can search products and generate recommendations |
| **M4: Refinement Loop** | 5 | Iterative refinement working | Users can refine recommendations successfully |
| **M5: Frontend Complete** | 6 | Full UI implemented | All user journeys functional in UI |
| **M6: Integration Complete** | 7 | End-to-end testing passed | All three user types working correctly |
| **M7: Production Ready** | 8 | Deployed to production | System live and handling real users |

---

## 6. Timeline and Delivery Estimation

### 6.1 Resource Allocation

**Team Composition:**
- **1 Senior Full-Stack Engineer** (AI Engine + Backend): 8 weeks full-time
- **1 Frontend Engineer** (UI/UX Implementation): 6 weeks full-time
- **1 ML/AI Engineer** (Preferences Engine + LLM Integration): 4 weeks full-time (overlapping)

**Total Effort:** ~18 person-weeks (144 person-hours at 8 hours/day)

### 6.2 Timeline Breakdown

| Phase | Duration | Key Activities | Dependencies |
|-------|----------|----------------|--------------|
| **Week 1** | Foundation | Setup, DB design, API skeleton | None |
| **Week 2** | Preferences Engine | Core logic, order history analysis | Week 1 complete |
| **Week 3-4** | Shopping Agent Core | Search integration, recommendations | Week 2 complete |
| **Week 4-5** | Refinement Loop | Multi-turn conversations | Week 3-4 complete |
| **Week 5-6** | Frontend | UI implementation, SSE streaming | Week 4-5 complete |
| **Week 6-7** | Integration & Testing | E2E testing, optimization | Week 5-6 complete |
| **Week 7-8** | Deployment | Production setup, launch | Week 6-7 complete |

**Total Timeline: 6-8 weeks** (depending on existing MVP leverage)

### 6.3 Risk-Adjusted Timeline

**Optimistic Scenario (6 weeks):**
- Existing MVP provides 50-70% foundation
- Open Search API integration straightforward
- No major technical blockers
- Team availability at 100%

**Realistic Scenario (7 weeks):**
- Some MVP code needs refactoring
- API integration requires iteration
- Minor technical challenges
- Team availability at 90%

**Pessimistic Scenario (8 weeks):**
- MVP code requires significant rework
- API integration complexity
- Technical challenges require research
- Team availability at 80%

**Recommendation:** Plan for **7 weeks** with 1 week buffer for unexpected issues.

### 6.4 Critical Path

The critical path for delivery:
1. Preferences Engine (Week 2) → Blocks Shopping Agent
2. Shopping Agent Core (Week 3-4) → Blocks Refinement Loop
3. Refinement Loop (Week 4-5) → Blocks Frontend Integration
4. Frontend (Week 5-6) → Blocks E2E Testing
5. Integration (Week 6-7) → Blocks Deployment

**Bottleneck:** Shopping Agent Core development (Weeks 3-4) is the longest single phase.

---

## 7. Scalability and Reliability Considerations

### 7.1 Scalability Design

**User Scale Assumptions:**
- **Phase 1 Target:** 1,000-5,000 active users
- **Future Scale:** 50,000+ active users (Phase 2+)

**Architecture Scalability:**

1. **Horizontal Scaling**
   - AI Engine: Stateless design, can scale with load balancer
   - API Gateway: Stateless, multiple instances
   - Database: Read replicas for preferences queries

2. **Caching Strategy**
   - Preference data: Redis cache (TTL: 1 hour)
   - Product search results: Cache popular queries (TTL: 15 minutes)
   - LLM responses: No caching (conversational, personalized)

3. **Database Optimization**
   - Indexes on `user_id`, `conversation_id`, `preferences.last_updated`
   - Partitioning by `user_id` for large-scale growth
   - Connection pooling for database connections

4. **API Rate Limiting**
   - Per-user rate limits: 100 requests/hour
   - Per-IP rate limits: 1000 requests/hour
   - Open Search API: Respect external API limits

**Performance Targets:**
- Chat response time: < 3 seconds (p95)
- Product search: < 2 seconds (p95)
- Preference retrieval: < 100ms (p95)
- Concurrent users: 500+ simultaneous conversations

### 7.2 Reliability and Fault Tolerance

**Error Handling:**
- Graceful degradation if Open Search API is down
- Fallback to cached recommendations
- User-friendly error messages
- Retry logic with exponential backoff for external APIs

**Data Consistency:**
- Transactional updates for preferences
- Idempotent operations for preference updates
- Eventual consistency acceptable for learning scores

**Monitoring and Observability:**
- Request/response logging
- Performance metrics (latency, throughput)
- Error tracking and alerting
- User behavior analytics
- LLM token usage tracking

**Disaster Recovery:**
- Database backups (daily)
- Preference data export (weekly)
- Rollback procedures for deployments

### 7.3 Security Considerations

**Authentication & Authorization:**
- JWT-based authentication
- User session management
- Role-based access control (if needed for admin)

**Data Privacy:**
- User preferences encrypted at rest
- PII handling compliance
- Secure API communication (HTTPS)

**Input Validation:**
- Sanitize user inputs
- Prevent injection attacks
- Validate API responses

---

## 8. Edge Cases, Risks, and Mitigation

### 8.1 Edge Cases

**User Behavior Edge Cases:**

1. **New User with No Preferences**
   - **Scenario:** User asks for recommendations without providing any preferences
   - **Handling:** Agent asks 3-5 preference questions before first recommendation
   - **Mitigation:** Default to popular/generic recommendations if user skips questions

2. **Ambiguous Queries**
   - **Scenario:** "I need shoes" (no brand, size, style)
   - **Handling:** LLM extracts what it can, asks clarifying questions for missing attributes
   - **Mitigation:** Use preference data to infer missing attributes

3. **User Refines Multiple Times**
   - **Scenario:** User keeps refining without satisfaction
   - **Handling:** Limit to 5 refinement rounds, then suggest starting new search
   - **Mitigation:** Learn from failed refinements to improve initial recommendations

4. **No Search Results**
   - **Scenario:** Open Search API returns no products for query
   - **Handling:** Suggest broadening search criteria, check other origins
   - **Mitigation:** Maintain fallback product catalog for common queries

5. **User Purchases for Others**
   - **Scenario:** User buys items for family members (different sizes, styles)
   - **Handling:** Preferences Engine recognizes this pattern, asks "Who is this for?"
   - **Mitigation:** Support multiple preference profiles per user

**Technical Edge Cases:**

1. **Open Search API Failure**
   - **Scenario:** External API is down or slow
   - **Handling:** Return cached results, show "limited results" message
   - **Mitigation:** Circuit breaker pattern, fallback to cached data

2. **LLM Service Unavailable**
   - **Scenario:** LLM API is down
   - **Handling:** Fallback to rule-based responses, queue requests
   - **Mitigation:** Retry logic, graceful degradation

3. **Database Connection Loss**
   - **Scenario:** Database is unavailable
   - **Handling:** Cache preferences in memory, queue writes
   - **Mitigation:** Connection pooling, automatic reconnection

4. **Large Order History**
   - **Scenario:** User has 1000+ orders, analysis is slow
   - **Handling:** Sample recent orders (last 100), use pagination
   - **Mitigation:** Pre-compute preference summaries, background processing

### 8.2 Risks and Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| **Open Search API Limitations** | High | Medium | Early API testing, fallback catalog, negotiate API limits |
| **LLM Response Quality** | Medium | Medium | Prompt engineering, response validation, A/B testing |
| **Preference Learning Accuracy** | Medium | Low | Start with simple rules, iterate based on user feedback |
| **Performance at Scale** | High | Low | Load testing early, caching strategy, database optimization |
| **User Adoption** | High | Medium | UX testing, clear value proposition, onboarding flow |
| **Timeline Overrun** | Medium | Medium | Buffer time, prioritize MVP features, leverage existing MVP |
| **Data Privacy Concerns** | High | Low | Encryption, compliance review, transparent privacy policy |

### 8.3 Failure Scenarios

**Scenario 1: Open Search API Rate Limit Exceeded**
- **Detection:** API returns 429 status
- **Response:** Queue requests, show "search temporarily unavailable" message
- **Recovery:** Automatic retry after rate limit window

**Scenario 2: LLM Generates Inappropriate Recommendations**
- **Detection:** Response validation, user feedback
- **Response:** Filter recommendations, flag for review
- **Recovery:** Update prompts, improve validation rules

**Scenario 3: Database Performance Degradation**
- **Detection:** Query latency > 1 second
- **Response:** Enable read replicas, optimize queries
- **Recovery:** Database indexing, query optimization

**Scenario 4: User Preference Data Corruption**
- **Detection:** Data validation errors
- **Response:** Restore from backup, rebuild from order history
- **Recovery:** Regular backups, data integrity checks

---

## 9. Ownership Boundaries Across Teams

### 9.1 Engineering Team Ownership

**AI/ML Engineering:**
- Shopping Preferences Engine design and implementation
- LLM integration and prompt engineering
- Recommendation algorithm and scoring
- Machine learning model training (future phases)

**Backend Engineering:**
- API Gateway and routing
- Database schema and migrations
- External API integrations (Open Search)
- Performance optimization
- Security implementation

**Frontend Engineering:**
- UI/UX implementation
- Chat interface and streaming
- Recommendation display components
- User onboarding flows
- Responsive design

**DevOps/Infrastructure:**
- Deployment pipeline
- Monitoring and logging setup
- Database management
- CI/CD configuration

### 9.2 Product Team Ownership

**Product Management:**
- Feature prioritization
- User journey definition
- Success metrics definition
- Stakeholder communication

**UX/Design:**
- User interface design
- User experience flows
- Preference gathering UX
- Recommendation card design

### 9.3 External Dependencies

**JAK Delivery Team:**
- User database access (order history)
- User authentication system
- Existing infrastructure (if shared)

**Open Search API Provider:**
- API availability and reliability
- Rate limits and pricing
- Documentation and support

**LLM Service Provider:**
- Model availability
- API reliability
- Token limits and pricing

---

## 10. Success Metrics and KPIs

### 10.1 User Engagement Metrics

- **Active Users:** Number of users using AI Shopping Agent per week
- **Session Duration:** Average time spent in conversation
- **Recommendation Clicks:** Percentage of recommendations clicked
- **Refinement Rate:** Average number of refinements per search
- **Satisfaction Score:** User feedback on recommendations (1-5 scale)

### 10.2 Business Impact Metrics

- **Shipments per User:** Increase in shipments from users using AI Agent
- **First-Time Success Rate:** Percentage of first-time users who complete a purchase
- **Support Ticket Reduction:** Decrease in support inquiries related to shopping
- **User Retention:** Percentage of users who return to use AI Agent

### 10.3 Technical Performance Metrics

- **Response Time:** p50, p95, p99 latency for chat responses
- **API Uptime:** Availability of AI Engine and external APIs
- **Error Rate:** Percentage of failed requests
- **LLM Token Usage:** Average tokens per conversation (cost tracking)

### 10.4 Phase 1 Success Criteria

**Minimum Viable Success:**
- ✅ 500+ active users in first month
- ✅ 60%+ recommendation click-through rate
- ✅ < 3 second average response time
- ✅ 80%+ user satisfaction score
- ✅ 20%+ increase in shipments per active user

---

## 11. Dependencies and Assumptions

### 11.1 Technical Dependencies

1. **Open Search API Access**
   - Assumption: API available for USA and Turkey origins
   - Dependency: API credentials, rate limits, documentation
   - Risk: If unavailable, need alternative product search solution

2. **JAK User Database Access**
   - Assumption: Read access to order history and user profiles
   - Dependency: Database connection, schema documentation
   - Risk: If restricted, preference learning limited to conversations only

3. **LLM Service Availability**
   - Assumption: Qwen/DeepSeek API accessible and reliable
   - Dependency: API credentials, token limits
   - Risk: If unavailable, need alternative LLM provider

4. **Existing MVP Codebase**
   - Assumption: 50-70% of code can be leveraged
   - Dependency: Code access, documentation
   - Risk: If code quality is poor, may need full rewrite

### 11.2 Business Assumptions

1. **User Adoption**
   - Assumption: Users will engage with AI Shopping Agent
   - Mitigation: Clear value proposition, intuitive UX

2. **Preference Data Quality**
   - Assumption: Order history provides meaningful preference signals
   - Mitigation: Start with simple rules, iterate based on data quality

3. **Open Search API Coverage**
   - Assumption: API covers sufficient product catalog for user needs
   - Mitigation: Monitor search success rate, expand origins if needed

### 11.3 Resource Assumptions

1. **Team Availability**
   - Assumption: 2-3 engineers available full-time for 6-8 weeks
   - Risk: If team members have other commitments, timeline extends

2. **Infrastructure**
   - Assumption: Development and production environments available
   - Dependency: Cloud infrastructure, database setup

---

## 12. Final Delivery Summary

### 12.1 Phase 1 Deliverables

**Functional Deliverables:**
1. ✅ AI Shopping Agent with conversational product search
2. ✅ Shopping Preferences Engine with learning capabilities
3. ✅ Integration with Open Search API (USA, Turkey)
4. ✅ User preference management system
5. ✅ Iterative recommendation refinement workflow
6. ✅ Chat interface with real-time streaming
7. ✅ Recommendation display with match scores
8. ✅ User onboarding and preference gathering flow

**Technical Deliverables:**
1. ✅ Complete backend API (AI Engine + Gateway)
2. ✅ Frontend web application (Next.js)
3. ✅ Database schema and migrations
4. ✅ Integration with JAK user database
5. ✅ Monitoring and logging infrastructure
6. ✅ Deployment pipeline and documentation

**Documentation Deliverables:**
1. ✅ API documentation
2. ✅ User guide
3. ✅ Technical architecture document
4. ✅ Deployment runbook

### 12.2 Timeline Summary

**Total Duration:** 6-8 weeks (recommended: 7 weeks)

**Key Milestones:**
- Week 2: Preferences Engine functional
- Week 4: Shopping Agent MVP working
- Week 5: Refinement loop complete
- Week 6: Frontend fully integrated
- Week 7: End-to-end testing passed
- Week 8: Production deployment

### 12.3 Resource Requirements

**Team:**
- 1 Senior Full-Stack Engineer (8 weeks)
- 1 Frontend Engineer (6 weeks)
- 1 ML/AI Engineer (4 weeks, overlapping)

**Infrastructure:**
- Development environment (cloud or local)
- Production environment (cloud)
- Database (MongoDB/PostgreSQL)
- LLM API access (Qwen/DeepSeek)
- Open Search API access

**Budget Considerations:**
- Engineering time: 18 person-weeks
- Infrastructure costs: Cloud hosting, database, APIs
- LLM API costs: Token usage (estimated $500-1000/month for 1000 users)
- Open Search API costs: Per-query pricing (if applicable)

### 12.4 Next Steps

**Immediate Actions:**
1. Review and approve this ETA document
2. Secure team resources and availability
3. Obtain API access credentials (Open Search, LLM)
4. Set up development environment
5. Begin Week 1: Foundation & Setup

**Pre-Launch Checklist:**
- [ ] All milestones completed
- [ ] End-to-end testing passed
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Documentation finalized
- [ ] Monitoring and alerting configured
- [ ] User acceptance testing completed
- [ ] Production deployment successful

---

## Appendix A: Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 14.x | Web application framework |
| | React | 18.x | UI library |
| | TypeScript | 5.x | Type safety |
| | Tailwind CSS | 3.x | Styling |
| **API Gateway** | Node.js | 20 LTS | Runtime |
| | Express.js | 4.x | HTTP server |
| **AI Engine** | Python | 3.12 | Backend runtime |
| | FastAPI | 0.109.x | API framework |
| | LangGraph | 0.1.x | Agent orchestration |
| **Database** | MongoDB/PostgreSQL | Latest | Data storage |
| | Redis | Latest | Caching (optional) |
| **External APIs** | Open Search API | - | Product search |
| | Qwen/DeepSeek | Latest | LLM service |

---

## Appendix B: Data Models

### User Preferences Schema
```typescript
interface UserPreferences {
  user_id: string;
  demographic: {
    age?: number;
    gender?: string;
    preferred_origins: string[];
  };
  preferences: {
    colors: string[];
    sizes: {
      shoes?: string;
      clothing?: string;
    };
    brands: string[];
    styles: string[];
    budget_range: {
      min: number;
      max: number;
    };
  };
  behavioral: {
    purchase_frequency: string;
    avg_shipment_value: number;
    categories: string[];
    interaction_history: Interaction[];
  };
  last_updated: Date;
  learning_score: number;
}
```

### Recommendation Schema
```typescript
interface Recommendation {
  product_id: string;
  title: string;
  merchant: string;
  shopping_link: string;
  match_score: number; // 0-100
  price?: number;
  image_url?: string;
  origin: string; // "USA" | "Turkey"
  attributes: {
    brand?: string;
    color?: string;
    size?: string;
    style?: string;
  };
}
```

---

**Document Status:** Final  
**Approval Required:** CTO, Product Manager  
**Next Review:** After Phase 1 completion

---

*This ETA document is a living document and will be updated as the project progresses and new information becomes available.*
