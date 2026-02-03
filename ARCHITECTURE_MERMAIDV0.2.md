# JAK Delivery AI Shopping Agent - Production System Architecture

```mermaid
graph TB
    subgraph "CLIENT LAYER"
        WEB[JAK Web Application<br/>Next.js]
        WIDGET[Shopping Agent Widget<br/>Embedded React Component<br/>SSE Stream Consumer]
        WEB -->|Embeds| WIDGET
    end

    subgraph "API GATEWAY"
        GATEWAY[Express Gateway<br/>Authentication JWT<br/>Rate Limiting<br/>SSE Proxy]
    end

    subgraph "AI ENGINE - FastAPI"
        ORCHESTRATOR[Conversation Orchestrator<br/>Multi-turn State Management<br/>User Context Assembly]
        
        SHOPPING[Shopping Agent<br/>Query Understanding<br/>Merchant Recommendation<br/>Shopping Link Generation<br/>Refinement Loop]
        
        PREF_SVC[Preference Service<br/>Attribute Extraction<br/>Weighted Scoring<br/>Demographic 5% Preference 80% Behavioral 15%<br/>Adaptive Question Count<br/>Negative Preference Learning]
        
        USER_PROFILE[User Profile Service<br/>Name Retrieval<br/>Registration Status Check<br/>Personalized Greeting Generation]
        
        HISTORY_ANALYZER[Order History Analyzer<br/>SQL Aggregation Patterns<br/>Category Frequency Analysis<br/>Brand Affinity Calculation<br/>Purchase Behavior Extraction]
        
        MERCHANT_MATCHER[Merchant Matching Engine<br/>Category to Merchant Mapping<br/>Origin Filtering USA Turkey<br/>Preference Based Ranking]
        
        SHIPPING_GUIDANCE[Shipping Guidance Service<br/>Cost Estimation<br/>Timeline Calculation<br/>Restriction Validation<br/>JAK Address Instructions]
        
        ANALYTICS[Analytics Service<br/>Event Tracking<br/>Recommendation Clicks<br/>Refinement Patterns<br/>Satisfaction Scores<br/>Success Metrics Collection]
    end

    subgraph "DATA INGESTION LAYER"
        ETL[Nightly ETL Job<br/>Reads JAK Production DB<br/>Extracts User Purchase Patterns<br/>Builds Preference Summaries<br/>Incremental Updates Only]
    end

    subgraph "STORAGE LAYER"
        PREF_DB[(PostgreSQL<br/>User Preferences<br/>Conversation History<br/>Preference Learning State)]
        
        SUMMARY_DB[(PostgreSQL<br/>Order Summaries<br/>Pre-computed User Profiles<br/>Category Aggregates<br/>Brand Frequency)]
        
        MERCHANT_DB[(PostgreSQL<br/>Merchant Catalog<br/>Category Mappings<br/>Origin Availability<br/>Merchant URLs<br/>Shipping Compatible Flags]
        
        JAK_PROD[(JAK Production DB<br/>15 Years Order History<br/>User Registration<br/>Shipment Records<br/>Read-Only Access)]
        
        CACHE[(Redis<br/>Active User Preferences<br/>Session State<br/>Merchant Recommendations)]
        
        ANALYTICS_DB[(PostgreSQL<br/>Event Logs<br/>Recommendation Clicks<br/>User Interactions<br/>Satisfaction Scores<br/>Refinement Patterns)]
    end

    subgraph "EXTERNAL SERVICES"
        LLM[LLM Service<br/>Qwen DeepSeek<br/>Query Parsing<br/>Response Generation<br/>Arabic English]
        SEARCH_API[Search Enrichment Service<br/>OpenAI / Google Search API<br/>Product & Price Snippets<br/>No Direct Merchant API]
    end

    %% Client Flow
    WIDGET -->|HTTPS SSE| GATEWAY
    GATEWAY -->|HTTP| ORCHESTRATOR
    
    %% Orchestration Flow
    ORCHESTRATOR --> SHOPPING
    ORCHESTRATOR --> PREF_SVC
    ORCHESTRATOR --> USER_PROFILE
    ORCHESTRATOR --> HISTORY_ANALYZER
    ORCHESTRATOR --> SHIPPING_GUIDANCE
    ORCHESTRATOR --> ANALYTICS
    SHOPPING --> PREF_SVC
    SHOPPING --> USER_PROFILE
    SHOPPING --> HISTORY_ANALYZER
    SHOPPING --> MERCHANT_MATCHER
    SHOPPING --> SHIPPING_GUIDANCE
    SHOPPING --> ANALYTICS
    MERCHANT_MATCHER --> ANALYTICS
    PREF_SVC --> HISTORY_ANALYZER
    
    %% Data Access Patterns
    PREF_SVC --> PREF_DB
    PREF_SVC --> SUMMARY_DB
    PREF_SVC --> CACHE
    HISTORY_ANALYZER --> SUMMARY_DB
    HISTORY_ANALYZER --> JAK_PROD
    HISTORY_ANALYZER --> CACHE
    MERCHANT_MATCHER --> MERCHANT_DB
    MERCHANT_MATCHER --> CACHE
    ORCHESTRATOR --> PREF_DB
    ORCHESTRATOR --> SUMMARY_DB
    USER_PROFILE --> JAK_PROD
    USER_PROFILE --> CACHE
    SHIPPING_GUIDANCE --> JAK_PROD
    SHIPPING_GUIDANCE --> MERCHANT_DB
    SHIPPING_GUIDANCE --> SUMMARY_DB
    SHIPPING_GUIDANCE --> CACHE
    ANALYTICS --> ANALYTICS_DB
    ANALYTICS --> CACHE
    
    %% External Calls
    SHOPPING --> LLM
    ORCHESTRATOR --> LLM
    PREF_SVC --> LLM
    HISTORY_ANALYZER --> LLM
    USER_PROFILE --> LLM
    SHIPPING_GUIDANCE --> LLM
    SHOPPING --> SEARCH_API
    MERCHANT_MATCHER --> SEARCH_API
    
    %% Background Processing
    ETL --> JAK_PROD
    ETL --> SUMMARY_DB
    ETL --> PREF_DB
    ETL --> ANALYTICS_DB

    style WIDGET fill:#e1f5ff
    style GATEWAY fill:#fff4e1
    style ORCHESTRATOR fill:#f0e1ff
    style SHOPPING fill:#e1ffe1
    style PREF_SVC fill:#ffe1e1
    style USER_PROFILE fill:#ffe1e1
    style HISTORY_ANALYZER fill:#ffe1f5
    style MERCHANT_MATCHER fill:#e1fff5
    style SHIPPING_GUIDANCE fill:#ffe1e1
    style ANALYTICS fill:#e1e1ff
    style PREF_DB fill:#e1e1ff
    style SUMMARY_DB fill:#e1e1ff
    style MERCHANT_DB fill:#e1e1ff
    style JAK_PROD fill:#ffcccc
    style CACHE fill:#ffffe1
    style ETL fill:#f5e1ff
    style ANALYTICS_DB fill:#e1e1ff
```

## Phase 1 Technology Stack (End-to-End)

### Frontend Layer
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 3.x
- **Streaming**: Server-Sent Events (SSE) for real-time responses
- **State Management**: React Context API (for widget state)
- **HTTP Client**: Fetch API with SSE support

### API Gateway Layer
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js 4.x
- **Authentication**: JWT (jsonwebtoken library)
- **SSE Proxy**: Custom Express middleware for SSE streaming

### AI Engine Layer
- **Runtime**: Python 3.12
- **Framework**: FastAPI 0.109.x
- **Orchestration**: LangGraph 0.1.x (state machine for multi-turn conversations)
- **HTTP Client**: httpx (for LLM API calls)
- **Database Drivers**: 
  - asyncpg (PostgreSQL async)
  - redis-py (Redis async)
- **JSON Processing**: Pydantic v2 (data validation)
- **Logging**: structlog

### Data Processing
- **ETL Framework**: Python with pandas for data transformation
- **SQL Queries**: Raw SQL with asyncpg (no ORM for performance)
- **Pattern Recognition**: SQL aggregation (GROUP BY, COUNT, AVG) - not ML models
- **Data Transformation**: pandas DataFrame operations

### Storage Layer
- **Primary Database**: PostgreSQL 15+ (with JSONB support)
- **Cache**: Redis 7+ (in-memory key-value store)
- **Connection Pooling**: 
  - PostgreSQL: asyncpg pool (20 connections)
  - Redis: redis-py connection pool (10 connections)

### External Services
- **LLM Service**: 
  - Provider: Qwen/DeepSeek API
  - Model: Qwen3-32B or DeepSeek equivalent
  - API Client: httpx with streaming support
  - Token Management: tiktoken for token counting

### Deployment & Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose (dev) / Kubernetes (prod)
- **Reverse Proxy**: Nginx (for production)
- **Monitoring**: Prometheus + Grafana (optional for Phase 1)
- **Logging**: Centralized logging (ELK stack or cloud logging)

### Development Tools
- **Version Control**: Git
- **Package Management**: 
  - Frontend: npm/yarn
  - Backend: pip with requirements.txt or poetry
- **Code Quality**: 
  - Python: black, ruff, mypy
  - TypeScript: ESLint, Prettier
- **Testing**: 
  - Python: pytest
  - TypeScript: Jest/Vitest

## Data Flow Architecture

### 1. Historical Data Ingestion (Nightly ETL)

**Process:**
```
JAK Production DB (History)
    │
    ├─ Orders Table (Partitioned by Year)
    ├─ Shipments Table
    ├─ User Registration
    │
    ▼
[ETL Pipeline - Nightly 2AM]
    │
    ├─ Incremental Read (Last 24h Changes)
    ├─ User-Level Aggregation
    │   ├─ Category Frequency (Electronics: 45%, Fashion: 30%, Home: 25%)
    │   ├─ Brand Affinity (Nike: 12 orders, Adidas: 8 orders)
    │   ├─ Origin Preference (USA: 70%, Turkey: 30%)
    │   ├─ Purchase Frequency (Monthly, Quarterly, Yearly)
    │   └─ Average Order Value
    │
    ▼
[Summary Database - PostgreSQL]
    │
    ├─ user_preference_summary
    │   ├─ user_id
    │   ├─ top_categories JSON
    │   ├─ top_brands JSON
    │   ├─ preferred_origins JSON
    │   ├─ purchase_frequency
    │   ├─ avg_order_value
    │   └─ last_updated
    │
    └─ user_order_aggregates
        ├─ user_id
        ├─ total_orders
        ├─ category_distribution JSON
        └─ brand_distribution JSON
```

**Why This Design:**
- JAK Production DB has History of years data - cannot query in real-time
- ETL pre-computes summaries for instant access during conversations
- Incremental updates keep data fresh without full scans
- Read-only access to production DB protects operational systems

**Pattern Recognition Implementation (SQL Aggregation, Not ML):**

**SQL Aggregation Patterns Used:**
- **Category Frequency**: GROUP BY category, COUNT orders, calculate percentage per user
- **Brand Affinity**: GROUP BY brand, COUNT purchases, AVG order value per brand
- **Purchase Frequency**: Calculate time between orders, classify as monthly/quarterly/yearly
- **Origin Preference**: COUNT orders per origin, calculate percentage distribution

**Technology Used:**
- **SQL Aggregation**: PostgreSQL GROUP BY, COUNT, AVG, window functions
- **Python pandas**: For data transformation and JSON serialization
- **No ML Libraries**: Phase 1 uses rule-based pattern extraction, not machine learning models

### 2. Real-Time Preference Management

**User Preference Storage (PostgreSQL):**
```sql
-- Stores explicit preferences from conversations
CREATE TABLE user_preferences (
    user_id VARCHAR PRIMARY KEY,
    demographic JSONB,  -- age, gender, preferred_origins
    preferences JSONB,  -- colors, sizes, brands, styles, budget
    behavioral JSONB,   -- interaction_history, refinement_patterns
    learning_score FLOAT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Stores conversation context
CREATE TABLE conversation_history (
    conversation_id UUID PRIMARY KEY,
    user_id VARCHAR,
    messages JSONB[],
    intent VARCHAR,
    merchants_recommended JSONB[],
    created_at TIMESTAMP
);
```

**Why PostgreSQL:**
- Structured preference data with JSONB flexibility
- ACID transactions for preference updates
- Efficient indexing on user_id for fast lookups
- No need for vector DB - preferences are structured attributes, not embeddings

### 3. Merchant Catalog (Internal Data)

**BRD Section 12: "No external merchant APIs required for Phase 1"**

This means JAK maintains an **internal merchant catalog** mapping categories to merchant websites:

```sql
CREATE TABLE merchant_catalog (
    merchant_id VARCHAR PRIMARY KEY,
    merchant_name VARCHAR,
    merchant_url VARCHAR,
    categories VARCHAR[],  -- ['shoes', 'sportswear', 'accessories']
    brands VARCHAR[],      -- ['Nike', 'Adidas', 'Puma']
    origins VARCHAR[],     -- ['USA', 'Turkey']
    shipping_compatible BOOLEAN,
    popularity_score FLOAT,
    created_at TIMESTAMP
);

-- Example data:
-- Nike.com: categories=['shoes', 'sportswear'], origins=['USA'], brands=['Nike']
-- Amazon.com: categories=['electronics', 'home', 'fashion'], origins=['USA', 'Turkey']
-- LC Waikiki: categories=['fashion', 'home'], origins=['Turkey']
```

**Why Internal Catalog:**
- BRD explicitly states "No external merchant APIs required"
- Phase 1 provides "curated shopping links" not product search
- Merchant catalog is manually curated and maintained
- Maps user preferences (category, brand, origin) to merchant websites

### 3.1 Product & Pricing Data Sources (Phase 1)

**Internal Source (Primary):**
- **MERCHANT_DB** (PostgreSQL) is the **authoritative catalog** for:
  - Merchant names and URLs
  - Supported categories and brands
  - Supported origins (USA, Turkey)
  - Shipping compatibility flags
- **Usage:** 
  - Merchant Matcher always starts from MERCHANT_DB to decide **where** to send the user (which merchants).

**External Source (Enrichment Only):**
- **SEARCH_API** (OpenAI / Google Search API) is used **at query time** to fetch:
  - Product page snippets (title, short description)
  - Approximate price ranges (if available on public pages)
  - Availability hints (e.g., \"in stock\", \"out of stock\" text)
- **Constraints (to stay within BRD):**
  - No direct integration with merchant product APIs
  - No checkout or cart actions
  - No storage of full external product catalog (only transient snippets)
  - Still recommends **merchants**, not individual SKUs as source of truth
- **Usage Pattern in Phase 1:**
  - When a user asks a price-specific question (\"around 50 dollars?\"), Shopping Agent may call SEARCH_API to enrich the answer with **indicative price ranges**.
  - Recommendation links are **always** built from MERCHANT_DB; SEARCH_API does not create new merchants.

### 4. Preference Engine Logic

**How the engine behaves for different user types (BRD Section 5 + 7.2):**

#### 4.1 Existing User with History

```
User Query: "I need Nike shoes"
    │
    ▼
[Preference Service]
    │
    ├─ Load Order-Based Signals (from summaries)
    │   ├─ Top categories (e.g., shoes, electronics)
    │   ├─ Brand affinity (e.g., Nike, Adidas)
    │   ├─ Preferred origins (e.g., USA 70%, Turkey 30%)
    │   └─ Purchase frequency & average spend
    │
    ├─ Merge Conversational Signals
    │   ├─ Explicit brand: "Nike"
    │   ├─ Size, color, style if mentioned
    │   └─ Budget if mentioned
    │
    ├─ Apply Attribute Weights
    │   ├─ Demographic ~5%
    │   ├─ Preference ~80%
    │   └─ Behavioral ~15%
    │
    ▼
    Preference Profile for this session
        ├─ category = "shoes"
        ├─ brand_priority = ["Nike", "Adidas", ...]
        ├─ origin_priority = ["USA", "Turkey"]
        └─ budget_range = [min, max]
```

#### 4.2 First-Time / No-History User

```
New or No-History User
    │
    ▼
[Preference Service]
    │
    ├─ Start with Neutral Defaults
    │   ├─ No brand/origin bias
    │   └─ Broad budget range
    │
    ├─ Ask 3–5 Lightweight Questions
    │   ├─ "What are you looking for today?" (category)
    │   ├─ "Any preferred brands?" (brand)
    │   ├─ "What is your size?" (size where relevant)
    │   └─ "Rough budget range?" (budget)
    │
    ├─ Build Initial Preference Profile
    │   ├─ Uses only conversational answers
    │   └─ Demographic attributes optional (age, gender, origin)
    │
    ├─ Apply Same Weighting Model
    │   ├─ Demographic ~5% (if available)
    │   ├─ Preference ~80% (answers)
    │   └─ Behavioral ~15% (as we observe clicks/refinements)
    │
    ▼
    First-Time Preference Profile
        ├─ category = from answers
        ├─ brand_priority = from answers
        ├─ origin_priority = from default or answers
        └─ budget_range = from answers
```

> Over time, first-time users **become existing users** as their conversational behavior and shipments are written back into the preference and summary tables.

#### 4.3 Adaptive Question Count (Transcript Requirement)

**Technical Logic:**
```
[Preference Service - Question Count Decision]
    │
    ├─ Check learning_score from PREF_DB
    │   ├─ learning_score < 0.3 → First-time user
    │   │   └─ Ask 5 questions max
    │   │
    │   ├─ learning_score 0.3-0.7 → Learning user
    │   │   └─ Ask 3 questions max
    │   │
    │   └─ learning_score > 0.7 → Experienced user
    │       └─ Ask 2 questions max
    │
    └─ Update learning_score after each interaction
        ├─ +0.1 for each preference saved
        ├─ +0.15 for each successful recommendation (clicked)
        └─ +0.2 for each completed purchase
```

**Why This Logic:**
- Transcript: "First time five questions no problem. But the next time I need by two questions to reach to the most proper recommendation"
- Reduces cognitive load for returning users
- learning_score increases with each successful interaction

#### 4.4 Negative Preference Learning (Transcript Requirement)

**Technical Flow:**
```
[User Refinement: "I don't like red color"]
    │
    ▼
[Preference Service]
    │
    ├─ Extract Negative Signal
    │   ├─ Entity: "red color"
    │   ├─ Sentiment: negative ("don't like")
    │   └─ Context: color preference
    │
    ├─ Store in PREF_DB
    │   └─ preferences.negative_preferences.colors = ["red"]
    │
    ├─ Update Merchant Matching Logic
    │   └─ Filter out merchants/products with red color
    │
    └─ Future Recommendations
        └─ Exclude red color options automatically
```

**Data Storage:**
```sql
-- Add to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN negative_preferences JSONB;

-- Example:
{
  "negative_preferences": {
    "colors": ["red"],
    "brands": ["Fendi"],  -- Too expensive
    "styles": ["formal"]  -- Prefers casual
  }
}
```

**Why This Component:**
- Transcript: "I will know that Mahmoud he doesn't like the red color so I will not provide him"
- Continuous learning from negative feedback
- Improves recommendation accuracy over time

### 4.5 User Profile Service (Personalized Greeting)

**Technical Flow:**
```
[User Visits JAK Website]
    │
    ▼
[User Profile Service]
    │
    ├─ Check Authentication Status
    │   ├─ Logged in → Get user_id from JWT
    │   ├─ Not logged in → Prompt to login
    │   └─ New user → Prompt to register
    │
    ├─ Fetch User Profile (if logged in)
    │   ├─ Query JAK_PROD: SELECT name, phone FROM users WHERE user_id = ?
    │   ├─ Cache in Redis (TTL: 1 hour)
    │   └─ Return: {name: "Mahmoud", phone: "+966..."}
    │
    └─ Generate Personalized Greeting (LLM)
        └─ "Hi Mahmoud, how are you today? How can I help you? Are you going to do some shopping?"
```

**Data Sources:**
- **JAK_PROD**: User registration table (name, phone, registration_date)
- **CACHE**: Frequently accessed user profiles (TTL: 1 hour)

**Why This Component:**
- Transcript: "But you need to use my name as long as I have an account. The appreciation or the hello message should be... 'Hi Mahmoud how are you?'"
- Personalizes user experience from first interaction
- Builds trust and engagement

### 5. Merchant Recommendation Flow

**Phase 1: Curated Shopping Links (Not Product Search)**

```
[Shopping Agent]
    │
    ├─ Receive User Query: "I need Nike shoes"
    │
    ├─ Load User Context
    │   ├─ Preference Service → Get weighted preferences
    │   └─ History Analyzer → Get order summaries
    │
    ├─ Extract Intent
    │   ├─ Brand: Nike
    │   ├─ Category: Shoes
    │   └─ Origin: USA (from preference)
    │
    ├─ Query Merchant Catalog
    │   ├─ Filter: categories CONTAINS 'shoes'
    │   ├─ Filter: brands CONTAINS 'Nike' OR categories CONTAINS 'shoes'
    │   ├─ Filter: origins CONTAINS 'USA'
    │   └─ Return: Matching merchants
    │
    ├─ Rank Merchants (Rule-Based Scoring)
    │   ├─ Exact brand match: +40 points (Nike.com)
    │   ├─ Category match: +30 points (Foot Locker, Finish Line)
    │   ├─ Multi-category: +20 points (Amazon, eBay)
    │   ├─ Origin availability: +10 points
    │   └─ Sort by total score
    │
    ├─ Generate Match Scores
    │   ├─ Nike.com: 100 points → 100% match
    │   ├─ Foot Locker: 90 points → 90% match
    │   └─ Amazon.com: 75 points → 75% match
    │
    └─ Format Response (LLM)
        └─ "Here are 3 merchants where you can find Nike shoes:
            1. Nike.com (100% match) - Official Nike store
            2. Foot Locker (90% match) - Wide selection of athletic shoes
            3. Amazon.com (75% match) - General marketplace
            
            Use your JAK USA address for shipping."
```

**Merchant Ranking Algorithm (Rule-Based Scoring, Not ML):**

**Scoring Rules:**
- **Exact Brand Match**: +40 points (highest priority)
- **Category Match**: +30 points
- **Multi-Category Bonus**: +20 points (merchant sells multiple relevant categories)
- **Origin Availability**: +10 points (matches user preferred origin)
- **Shipping Compatibility**: +5 points (merchant flagged as shipping-compatible)
- **Popularity Boost**: +0.1 × popularity_score (optional)
- **Final Score**: Capped at 100% (normalized to match score percentage)

**Technology**: Rule-based scoring using dictionary operations, no ML libraries

**Why No Product Search API:**
- BRD Section 12: "No external merchant APIs required for Phase 1"
- BRD Section 6: "Provide personalized shopping recommendations in the form of curated shopping links"
- BRD Section 8.2: "Provide merchant links only no checkout"
- Phase 1 recommends WHERE to shop, not WHAT to buy
- User clicks merchant link and shops externally

### 5.1 Shipping Guidance Service (Phase 1 Requirement)

**BRD Section 6 Phase 1 Capability: "Explain shipping costs, timelines, and restrictions"**

**Technical Flow:**
```
[User Query: "How much does shipping cost?" OR "How long will it take?"]
    │
    ▼
[Shipping Guidance Service]
    │
    ├─ Read Shipping Rules (from MERCHANT_DB shipping_compatible flags)
    │   └─ Validate: Is merchant compatible with JAK shipping?
    │
    ├─ Calculate Timeline (from SUMMARY_DB or JAK_PROD)
    │   ├─ Query: Average shipping time for origin (USA/Turkey) → destination
    │   ├─ Query: Historical shipment records for similar orders
    │   └─ Return: Estimated delivery window (e.g., "7-10 business days")
    │
    ├─ Estimate Costs (from JAK_PROD shipment records)
    │   ├─ Query: Average shipping cost for origin → destination
    │   ├─ Factor: Package weight/category (if available from merchant metadata)
    │   └─ Return: Estimated cost range
    │
    ├─ Check Restrictions (from MERCHANT_DB + JAK shipping rules)
    │   ├─ Validate: Restricted items (electronics, liquids, etc.)
    │   ├─ Validate: Origin → destination compatibility
    │   └─ Return: Restrictions list or "No restrictions"
    │
    └─ Format Response (LLM)
        └─ "Shipping from USA to Saudi Arabia typically takes 7-10 business days. 
            Estimated cost: $15-25. Use your JAK USA address when checking out."
```

**Data Sources:**
- **MERCHANT_DB**: `shipping_compatible` boolean flag per merchant
- **SUMMARY_DB**: Average shipping times per origin (pre-computed from ETL)
- **JAK_PROD**: Historical shipment records for cost/timeline calculation
- **CACHE**: Frequently asked shipping questions (TTL: 1 hour)

**Why This Component:**
- BRD Phase 1 explicitly requires explaining shipping costs, timelines, restrictions
- Logistics-aware recommendations (BRD Section 6 Key Characteristics)
- Guides users before external checkout (BRD Section 6 Capabilities)
- No transaction handling - only informational guidance

### 5.2 LLM Integration (Qwen/DeepSeek) - Technical Implementation

**LLM Client Service:**
- **HTTP Client**: httpx (async, streaming support)
- **API Endpoint**: Qwen/DeepSeek chat completions API
- **Model**: Qwen-32B or DeepSeek equivalent
- **Streaming**: Server-Sent Events (SSE) for real-time responses
- **Authentication**: API key from environment variables

**Component-Specific LLM Usage:**

1. **Orchestrator → LLM**: Intent classification, context assembly prompts
   - Input: User message + conversation history
   - Output: Intent (shopping, shipping_question, preference_update)

2. **Shopping Agent → LLM**: Query understanding, response formatting
   - Input: User query + preferences + merchant recommendations
   - Output: Natural language response with merchant links

3. **Preference Service → LLM**: Extract preferences from conversational input
   - Input: User answers to preference questions
   - Output: Structured preference attributes (brand, size, color, budget)

4. **History Analyzer → LLM**: Explain order history patterns
   - Input: Order summaries + user query
   - Output: Natural language explanation of purchase patterns

5. **User Profile Service → LLM**: Generate personalized greeting
   - Input: User name + registration status
   - Output: Personalized greeting message

6. **Shipping Guidance → LLM**: Format shipping information
   - Input: Shipping costs, timelines, restrictions (from data)
   - Output: Natural language shipping guidance

**Technology Stack:**
- **HTTP Client**: httpx (async, streaming support)
- **Streaming**: Server-Sent Events (SSE) for real-time responses
- **Token Management**: tiktoken for token counting and cost estimation
- **Error Handling**: Exponential backoff retry logic
- **Rate Limiting**: Token bucket algorithm (client-side)

### 5.3 Analytics Service (Success Metrics Tracking)

**BRD Section 10: Success Metrics - Customer Experience & Business Impact**

**Technical Flow:**
```
[User Interaction Events]
    │
    ├─ Recommendation Click Event
    │   ├─ Track: merchant_id, match_score, user_id, timestamp
    │   ├─ Track: recommendation_position (1st, 2nd, 3rd)
    │   └─ Write to ANALYTICS_DB
    │
    ├─ Refinement Event
    │   ├─ Track: refinement_count, refinement_reason, user_id
    │   ├─ Track: original_query, refined_query
    │   └─ Write to ANALYTICS_DB
    │
    ├─ Satisfaction Score Event
    │   ├─ Track: user_feedback (1-5 scale), recommendation_id
    │   ├─ Track: user_id, conversation_id
    │   └─ Write to ANALYTICS_DB
    │
    ├─ Session Event
    │   ├─ Track: session_duration, messages_count, user_type
    │   ├─ Track: first_time_success (completed purchase flow)
    │   └─ Write to ANALYTICS_DB
    │
    └─ Shipment Outcome Event (from JAK_PROD via ETL)
        ├─ Track: user_id, shipment_success, order_value
        ├─ Track: recommendation_source (which merchant was used)
        └─ Write to ANALYTICS_DB
```

**Metrics Calculated:**
- **Recommendation Click-Through Rate**: Clicks / Recommendations shown
- **Refinement Rate**: Average refinements per search session
- **Satisfaction Score**: Average user feedback (1-5 scale)
- **First-Time Success Rate**: New users who complete purchase flow
- **Shipments per Active User**: Total shipments / Active users (from JAK_PROD)
- **Support Ticket Reduction**: Tracked via integration with JAK support system (future)

**Data Storage (ANALYTICS_DB):**
```sql
-- Event logs table
CREATE TABLE analytics_events (
    event_id UUID PRIMARY KEY,
    user_id VARCHAR,
    event_type VARCHAR,  -- 'recommendation_click', 'refinement', 'satisfaction', 'session'
    event_data JSONB,
    timestamp TIMESTAMP,
    conversation_id UUID
);

-- Aggregated metrics (pre-computed daily)
CREATE TABLE success_metrics (
    metric_date DATE,
    recommendation_ctr FLOAT,
    avg_refinement_rate FLOAT,
    avg_satisfaction_score FLOAT,
    first_time_success_rate FLOAT,
    shipments_per_user FLOAT
);
```

**Why This Component:**
- BRD Section 10 requires tracking: recommendation clicks, refinement rate, satisfaction scores, shipments per user
- Enables data-driven improvements to recommendation algorithm
- Measures business impact: increased shipments, reduced support tickets
- Non-intrusive: asynchronous event logging, no impact on user experience

### 6. Conversation State Management

**Why LangGraph:**
- Multi-turn conversations require state persistence across messages
- User journey has distinct stages: context assembly → preference gathering → merchant recommendation → refinement
- State machine handles three user types: logged-in with history, logged-in without history, new user
- Orchestrates multiple services: preference service, history analyzer, merchant matcher, LLM

**LangGraph Technical Implementation:**

**State Machine Structure:**
- **Framework**: LangGraph 0.1.x with Pydantic for state validation
- **State Model**: ConversationState (user_id, message, conversation_id, user_type, preferences, order_summary, intent, recommendations, response)
- **Nodes**: classify_user, assemble_context, gather_preferences, generate_recommendations, format_response
- **Conditional Routing**: Routes based on user_type (existing_with_history → assemble_context, existing_no_history/new → gather_preferences)
- **Technology**: LangGraph state machine, no custom state management needed

**State Flow:**
```
[User Message] → [Orchestrator]
    │
    ├─ State: NEW_USER
    │   └─ Action: Gather preferences via questions
    │
    ├─ State: EXISTING_USER_NO_HISTORY
    │   └─ Action: Gather preferences + explain JAK
    │
    ├─ State: EXISTING_USER_WITH_HISTORY
    │   ├─ Load order summaries
    │   ├─ Load preferences
    │   └─ Action: Direct to merchant recommendation
    │
    ├─ State: SEARCHING
    │   └─ Action: Query merchant catalog + rank merchants
    │
    ├─ State: REFINING
    │   └─ Action: Update preferences + re-query merchants
    │
    └─ State: COMPLETE
        └─ Action: Provide merchant shopping links
```

### 6.1 User Journey Overview (Aligned with BRD Section 5)

```mermaid
graph LR
    A[User visits JAK website] --> B[Discovery & Engagement<br/>Shopping Agent Widget visible]
    
    %% Login / Registration Paths
    B --> C{User state}
    C -->|Logged in<br/>Existing user| D[Check Order & Shipment History<br/>via Summaries]
    C -->|Logged in<br/>No history| E[Explain JAK briefly<br/>Ask initial questions]
    C -->|New user<br/>No account| F[Encourage registration<br/>Or continue as guest<br/>with minimal data]
    
    %% All paths converge into Preferences
    D --> G[Preference Understanding<br/>Preference Service + History Analyzer]
    E --> G
    F --> G
    
    %% Shopping Guidance & Recommendations
    G --> H[Shopping Guidance & Recommendations<br/>Shopping Agent + Merchant Matcher]
    H --> I[Curated Merchant Links<br/>with Match Scores]
    
    %% Purchase & Shipping Enablement (outside JAK checkout)
    I --> J[User shops externally<br/>using JAK virtual address]
    
    %% Shipment Tracking & Pickup (handled by existing logistics systems)
    J --> K[Shipment Created in JAK Systems]
    K --> L[Tracking & Pickup Support<br/>(Existing JAK/SMSA flows)]
    
    %% Learning & Experience Improvement
    L --> M[Learning Loop<br/>Write outcomes back to<br/>Preferences & Summaries]
    
    style B fill:#e1f5ff
    style G fill:#ffe1e1
    style H fill:#e1ffe1
    style I fill:#e1ffe1
    style D fill:#e1e1ff
    style M fill:#f5e1ff
```

### 7. Scalability Design

**User Scale Assumptions:**
- Phase 1: 1,000-5,000 active users
- 15 years of historical data: ~500,000 users, ~5M orders

**Performance Optimizations:**

**Caching Strategy (Redis):**
```
Active User Preferences (TTL: 1 hour)
    └─ Reduces PostgreSQL load for frequent queries

Merchant Recommendations (TTL: 30 minutes)
    └─ Avoids redundant merchant catalog queries

Session State (TTL: 30 minutes)
    └─ Conversation context for multi-turn chats
```

**Database Optimization:**
```
Summary Database:
    ├─ Indexes: user_id, last_updated
    ├─ Partitioning: Not needed for Phase 1 scale
    └─ Connection Pooling: 20 connections

Merchant Catalog:
    ├─ Indexes: categories (GIN), brands (GIN), origins (GIN)
    ├─ Small dataset (~100-500 merchants)
    └─ Fully cacheable in Redis

JAK Production DB:
    ├─ Read-Only Access
    ├─ ETL uses bulk reads (not row-by-row)
    └─ No impact on operational systems.
```

### 8. Why This Architecture is Not Generic

**Grounded in 15 Years of Operational Data:**
- ETL pipeline specifically designed to process partitioned historical data
- Order summaries pre-computed to avoid real-time queries on massive datasets
- Preference extraction based on actual purchase patterns, not assumptions

**Logistics-First Design:**
- No checkout or payment processing (BRD Section 4.2)
- Integration with existing JAK systems (production DB, user auth)
- Merchant links only - external transactions
- No product catalog - recommends merchants, not products

**Defensible Component Choices:**
- PostgreSQL: Structured preferences, ACID transactions, proven at scale
- Redis: Performance optimization for active users
- LangGraph: Multi-turn conversation orchestration (required for state management)
- Rule-based merchant ranking: Transparent, explainable, sufficient for Phase 1
- Internal merchant catalog: No external APIs needed (BRD Section 12)
- No vector DB: Preferences are structured, not semantic embeddings
- No ML models: Phase 1 scope is preference-based, not predictive
- No product search API: Phase 1 recommends merchants, not products

**Production-Ready Considerations:**
- Read-only access to production DB protects operational systems
- Incremental ETL updates avoid full scans
- Caching reduces database load
- Rate limiting protects system
- SSE streaming for real-time user experience

**Clear Separation of Concerns:**
- Data ingestion (ETL) separate from real-time serving
- Preference management separate from merchant matching
- Conversation orchestration separate from business logic
- Each component has single responsibility and clear boundaries

## Key Data Flow Relationships

### Real-Time Request Flow
1. **User Query** → Widget → Gateway → Orchestrator
2. **Orchestrator** assembles context by calling:
   - User Profile Service (get user name, registration status)
   - History Analyzer (get order summaries if user has history)
   - Preference Service (get current preferences)
3. **Shopping Agent** receives context and calls:
   - Preference Service (get weighted preferences)
   - History Analyzer (get purchase patterns)
   - Merchant Matcher (find matching merchants)
   - Shipping Guidance (if shipping questions)
4. **LLM** formats natural language response with merchant links
5. **Analytics** tracks all interactions asynchronously

### Learning Loop (Background)
1. **User completes purchase** externally using merchant link
2. **Shipment created** in JAK Production DB
3. **ETL Pipeline** (nightly) reads shipment outcomes
4. **ETL** updates:
   - Order Summaries (new purchase patterns)
   - Preference Learning Scores (successful recommendations)
   - Analytics DB (shipment outcomes linked to recommendations)
5. **Next conversation** uses updated preferences and summaries

### Critical Relationships
- **Orchestrator ↔ All Services**: Central coordinator, routes to appropriate services
- **Shopping Agent ↔ Preference Service**: Needs preferences for recommendation context
- **Shopping Agent ↔ History Analyzer**: Needs order history for existing users
- **Preference Service ↔ History Analyzer**: Preferences informed by historical patterns
- **ETL ↔ All Summary DBs**: Background updates keep data fresh
- **All Services ↔ LLM**: Natural language understanding and response generation
- **All Services ↔ Analytics**: Event tracking for success metrics

## Real-Life User Journey Examples

### Example 1: Existing User with History - Ahmad Al-Rashid

**User Profile:**
- **Name**: Ahmad Al-Rashid
- **Registration**: 3 years ago (2021)
- **Order History**: 45 orders, primarily from USA
- **Patterns**: 
  - 60% Electronics (laptops, phones, accessories)
  - 30% Fashion (Nike shoes, Adidas sportswear)
  - 10% Home goods
  - Preferred brands: Nike, Apple, Samsung
  - Average order value: $250
  - Purchase frequency: Quarterly

**Conversation Flow:**
```
[User visits JAK website, logs in]

AI Agent: "As-salamu alaykum Ahmad! How are you today? How can I help you with your shopping?"

Ahmad: "I need a new laptop"

[System Flow:]
1. Orchestrator detects: EXISTING_USER_WITH_HISTORY
2. User Profile Service: Loads "Ahmad Al-Rashid" name
3. History Analyzer: 
   - Queries SUMMARY_DB → Finds 27 electronics orders
   - Top brands: Apple (12 orders), Samsung (8 orders), Dell (7 orders)
   - Average value: $450 for electronics
   - Preferred origin: USA (100% of electronics orders)
4. Preference Service:
   - Loads from PREF_DB: Budget range $300-$600, prefers USA origin
   - Learning score: 0.85 (experienced user)
5. Shopping Agent:
   - Extracts intent: "laptop" category, electronics
   - Merchant Matcher queries MERCHANT_DB:
     - Filters: categories=['electronics'], origins=['USA']
     - Finds: Amazon.com, BestBuy.com, Apple.com
     - Scores: Apple.com (100% - exact brand match), BestBuy (90% - category + origin), Amazon (85% - multi-category)
6. LLM formats response

AI Agent: "Based on your previous purchases, I see you've bought Apple and Samsung products from USA. Here are 3 merchants where you can find laptops:

1. Apple.com (100% match) - Official Apple store, ships to your JAK USA address
2. BestBuy.com (90% match) - Wide selection of laptops including Apple and Samsung
3. Amazon.com (85% match) - General electronics marketplace

Your JAK USA address is ready. Shipping typically takes 7-10 days to Saudi Arabia. Which one interests you?"

Ahmad: "Show me Apple laptops under $600"

[Refinement Loop:]
1. Shopping Agent extracts: brand=Apple, category=laptops, budget<$600
2. Merchant Matcher: Filters Apple.com, adds budget constraint
3. Returns: Apple MacBook Air, MacBook Pro (refurbished options)
4. Match scores: 95% (within budget), 90% (slightly over budget)

AI Agent: "Here are Apple laptops under $600:

1. Apple MacBook Air M1 (Refurbished) - $549 (95% match)
2. Apple MacBook Pro 13" (Refurbished) - $599 (95% match)

Both ship from USA. Use your JAK USA address at checkout."

Ahmad: [Clicks Apple.com link, completes purchase externally]

[Learning Loop - Next Day:]
- ETL reads new shipment from JAK_PROD
- Updates SUMMARY_DB: +1 electronics order, Apple brand
- Updates PREF_DB: learning_score increases to 0.87
- Analytics: Tracks recommendation click and successful purchase
```

**Key Technical Points:**
- History Analyzer uses pre-computed summaries (no real-time JAK_PROD queries)
- Preference Service combines historical patterns (80% weight) with explicit query (20% weight)
- Merchant Matcher uses rule-based scoring (brand match + category + origin)
- Learning score increases after successful purchase

### Example 2: New User - Fatima Hassan

**User Profile:**
- **Name**: Fatima Hassan
- **Registration**: Just registered (no order history)
- **User Type**: NEW_USER
- **No existing preferences or order history**

**Conversation Flow:**
```
[User visits JAK website, logs in for first time]

AI Agent: "As-salamu alaykum Fatima! Welcome to JAK Delivery. I'm your AI shopping assistant. How can I help you today?"

Fatima: "I want to buy shoes"

[System Flow:]
1. Orchestrator detects: NEW_USER
2. User Profile Service: Loads "Fatima Hassan" name, detects no history
3. History Analyzer: Returns empty (no order summaries)
4. Preference Service:
   - No existing preferences in PREF_DB
   - Learning score: 0.0 (new user)
   - Initiates preference gathering (5 questions max for first-time)
5. Shopping Agent:
   - Extracts intent: "shoes" category
   - Insufficient context → Triggers preference gathering

AI Agent: "I'd love to help you find the perfect shoes! To give you the best recommendations, I need to know a bit about your preferences:

1. What type of shoes are you looking for? (sports, casual, formal, etc.)"

Fatima: "Sports shoes"

AI Agent: "Great! A few more questions:

2. Do you have any preferred brands? (Nike, Adidas, Puma, etc.)"

Fatima: "Nike"

AI Agent: "Perfect! 

3. What's your shoe size?"

Fatima: "38"

AI Agent: "Almost done!

4. Any preferred colors?"

Fatima: "Black or white"

AI Agent: "Last question:

5. What's your budget range?"

Fatima: "$50 to $100"

[Preference Storage:]
- Preference Service stores in PREF_DB:
  - Category: shoes (sports)
  - Brand: Nike
  - Size: 38
  - Colors: black, white
  - Budget: $50-$100
  - Learning score: 0.1 (initial preferences saved)

[Merchant Recommendation:]
1. Shopping Agent: Now has sufficient context
2. Merchant Matcher queries MERCHANT_DB:
   - Filters: categories=['shoes'], brands=['Nike'], origins=['USA', 'Turkey']
   - Finds: Nike.com, Foot Locker, Amazon.com
   - Scores: Nike.com (100% - exact match), Foot Locker (90% - category + brand), Amazon (75% - general)
3. LLM formats response

AI Agent: "Based on your preferences, here are 3 merchants where you can find Nike sports shoes in size 38, black or white, within $50-$100:

1. Nike.com (100% match) - Official Nike store, ships to your JAK USA address
2. Foot Locker (90% match) - Wide selection of Nike sports shoes
3. Amazon.com (75% match) - General marketplace with Nike options

Shipping from USA typically takes 7-10 days. Your JAK USA address is ready to use. Which merchant would you like to visit?"

Fatima: "I prefer Turkey origin, it's cheaper"

[Refinement Loop:]
1. Shopping Agent extracts: origin=Turkey preference
2. Preference Service updates: preferred_origins=['Turkey']
3. Merchant Matcher re-queries: Filters origins=['Turkey']
4. Returns: LC Waikiki, Trendyol (Turkish merchants with Nike)

AI Agent: "Great choice! Here are merchants from Turkey:

1. Trendyol.com (95% match) - Turkish marketplace with Nike shoes
2. LC Waikiki (85% match) - Turkish fashion retailer

Shipping from Turkey takes 10-14 days and is typically more affordable. Use your JAK Turkey address at checkout."

Fatima: [Clicks Trendyol.com link, completes purchase externally]

[Learning Loop - Next Day:]
- ETL reads new shipment from JAK_PROD
- Creates initial SUMMARY_DB entry: 1 order, category=shoes, brand=Nike, origin=Turkey
- Updates PREF_DB: learning_score increases to 0.25 (first purchase)
- Analytics: Tracks new user first-time success
```

**Key Technical Points:**
- New users trigger preference gathering (5 questions max)
- No historical data → relies on conversational inputs only
- Preference Service builds initial profile from answers
- Learning score starts at 0.0, increases with each interaction
- Refinement updates preferences in real-time

### Phase 1 Limitations

**1. No Structured Product Catalog Search:**
- **Limitation**: Phase 1 does **not** maintain a structured product catalog (SKUs, full attributes) inside JAK systems
- **Example**: User asks "Nike Air Max size 42" → System recommends Nike.com (and may show an approximate price range from SEARCH_API), but final product search happens on the merchant site
- **Reason**: BRD Phase 1 focuses on curated merchant links and avoids deep product integrations
- **Workaround**: 
  - MERCHANT_DB decides **which merchants** to recommend
  - SEARCH_API (OpenAI / Google Search) may provide **best-effort snippets** (titles, indicative prices), but user always completes product selection and checkout on merchant website

**2. Manual Merchant Catalog:**
- **Limitation**: Merchant catalog is manually curated and maintained
- **Example**: New merchant (e.g., Zara.com) not in catalog → Won't appear in recommendations
- **Reason**: No external merchant APIs for automatic catalog updates
- **Workaround**: Catalog team manually adds new merchants

**3. Rule-Based Ranking Only:**
- **Limitation**: Merchant ranking uses fixed rules, not ML-based personalization
- **Example**: All users see same scoring logic (brand match +40, category +30, etc.)
- **Reason**: Phase 1 focuses on preference-based, not predictive ML models
- **Workaround**: Rules are transparent and explainable, sufficient for Phase 1

**4. Limited Refinement Rounds:**
- **Limitation**: System suggests max 5 refinement rounds before suggesting new search
- **Example**: User refines 5 times without satisfaction → System suggests starting fresh
- **Reason**: Prevents infinite loops, encourages clear communication
- **Workaround**: System learns from failed refinements for future recommendations

**5. No Multi-User Profiles:**
- **Limitation**: One preference profile per user account
- **Example**: User buys for family members (different sizes/styles) → Single profile may mix preferences
- **Reason**: Phase 1 scope focuses on individual personalization
- **Workaround**: System asks "Who is this for?" if pattern detected, but stores in same profile

**6. ETL Update Frequency:**
- **Limitation**: Order summaries updated nightly (not real-time)
- **Example**: User completes purchase today → Summary updates tomorrow
- **Reason**: Protects JAK Production DB from real-time load
- **Workaround**: Real-time preferences (from conversations) update immediately

**7. No Price Comparison:**
- **Limitation**: System doesn't compare prices across merchants
- **Example**: User asks "Which is cheaper?" → System provides merchant links, user compares externally
- **Reason**: No price APIs, focuses on merchant recommendations only
- **Workaround**: User clicks multiple merchant links to compare

**8. Limited Origin Support:**
- **Limitation**: Phase 1 supports USA and Turkey origins only
- **Example**: User wants to shop from UK → System can't recommend UK merchants
- **Reason**: Phase 1 scope limited to USA/Turkey (BRD Section 1.3)
- **Workaround**: System suggests USA/Turkey alternatives or notes limitation
