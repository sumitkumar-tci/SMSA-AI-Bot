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
        
        LOGISTICS_ANALYZER[Logistics Analyzer<br/>Shipping Pattern Analysis<br/>Origin Frequency USA Turkey<br/>Average Shipment Weight<br/>Shipping Frequency Patterns]
        
        MERCHANT_MATCHER[Merchant Matching Engine<br/>Category to Merchant Mapping<br/>Origin Filtering USA Turkey<br/>Preference Based Ranking]
        
        SHIPPING_GUIDANCE[Shipping Guidance Service<br/>Cost Estimation<br/>Timeline Calculation<br/>Restriction Validation<br/>JAK Address Instructions]
        
        ANALYTICS[Analytics Service<br/>Event Tracking<br/>Recommendation Clicks<br/>Refinement Patterns<br/>Satisfaction Scores<br/>Success Metrics Collection]
    end

    subgraph "DATA INGESTION LAYER"
        ETL[Nightly ETL Job<br/>Reads JAK Production DB<br/>Extracts Shipping Patterns<br/>Origin Frequency Weight Frequency<br/>Builds Logistics Summaries<br/>Incremental Updates Only]
    end

    subgraph "STORAGE LAYER"
        PREF_DB[(PostgreSQL<br/>User Preferences<br/>Conversation History<br/>Preference Learning State)]
        
        SUMMARY_DB[(PostgreSQL<br/>Shipping Pattern Summaries<br/>Pre-computed Logistics Profiles<br/>Origin Frequency USA Turkey<br/>Average Shipment Weight<br/>Shipping Frequency Patterns)]
        
        MERCHANT_DB[(PostgreSQL<br/>Approved Merchant List<br/>Security Quality Filter<br/>Category Mappings<br/>Origin Availability<br/>Merchant URLs<br/>Shipping Compatible Flags]
        
        JAK_PROD[(JAK Production DB<br/>15 Years Order History<br/>User Registration<br/>Shipment Records<br/>Read-Only Access)]
        
        CACHE[(Redis<br/>Active User Preferences<br/>Session State<br/>Merchant Recommendations)]
        
        ANALYTICS_DB[(PostgreSQL<br/>Event Logs<br/>Recommendation Clicks<br/>User Interactions<br/>Satisfaction Scores<br/>Refinement Patterns)]
    end

    subgraph "EXTERNAL SERVICES"
        LLM[LLM Service<br/>Qwen DeepSeek<br/>Query Parsing<br/>Response Generation<br/>Arabic English]
        SEARCH_TOOL[Search Tool<br/>Tavily API / Google Custom Search<br/>Real-time Product Search<br/>Price & Availability Data<br/>RAG over Search Results]
    end

    %% Client Flow
    WIDGET -->|HTTPS SSE| GATEWAY
    GATEWAY -->|HTTP| ORCHESTRATOR
    
    %% Orchestration Flow
    ORCHESTRATOR --> SHOPPING
    ORCHESTRATOR --> PREF_SVC
    ORCHESTRATOR --> USER_PROFILE
    ORCHESTRATOR --> LOGISTICS_ANALYZER
    ORCHESTRATOR --> SHIPPING_GUIDANCE
    ORCHESTRATOR --> ANALYTICS
    SHOPPING --> PREF_SVC
    SHOPPING --> USER_PROFILE
    SHOPPING --> LOGISTICS_ANALYZER
    SHOPPING --> MERCHANT_MATCHER
    SHOPPING --> SEARCH_TOOL
    SHOPPING --> SHIPPING_GUIDANCE
    SHOPPING --> ANALYTICS
    MERCHANT_MATCHER --> ANALYTICS
    PREF_SVC --> LOGISTICS_ANALYZER
    
    %% Data Access Patterns
    PREF_SVC --> PREF_DB
    PREF_SVC --> SUMMARY_DB
    PREF_SVC --> CACHE
    LOGISTICS_ANALYZER --> SUMMARY_DB
    LOGISTICS_ANALYZER --> JAK_PROD
    LOGISTICS_ANALYZER --> CACHE
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
    LOGISTICS_ANALYZER --> LLM
    USER_PROFILE --> LLM
    SHIPPING_GUIDANCE --> LLM
    SHOPPING --> SEARCH_TOOL
    
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
    style LOGISTICS_ANALYZER fill:#ffe1f5
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
- **Search Tool (Product Data Source)**:
  - **Primary**: Tavily API (preferred for structured results)
  - **Alternative**: Google Programmable Search Engine (Custom Search API)
  - **Alternative**: Serper API (Google Search results)
  - **Purpose**: Real-time product search, price discovery, availability data
  - **Pattern**: RAG (Retrieval-Augmented Generation) - LLM processes search results
  - **API Client**: httpx for async HTTP requests
  - **Rate Limiting**: Respect API limits, implement exponential backoff

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

**Critical Data Reality:**
- JAK Production DB contains **shipping records only** (origin, destination, weight, date)
- **No item-level product data** (e.g., we know user shipped from USA, but not that it contained "Nike Shoes")
- ETL extracts **logistics patterns**, not product purchase patterns

**Process:**
```
JAK Production DB (History)
    │
    ├─ Shipments Table (Origin, Destination, Weight, Date)
    ├─ User Registration
    ├─ Shipping Records (No Product Details)
    │
    ▼
[ETL Pipeline - Nightly 2AM]
    │
    ├─ Incremental Read (Last 24h Changes)
    ├─ User-Level Shipping Pattern Aggregation
    │   ├─ Origin Frequency (USA: 70%, Turkey: 30%)
    │   ├─ Average Shipment Weight (kg)
    │   ├─ Shipping Frequency (Monthly, Quarterly, Yearly)
    │   ├─ Average Shipment Value (if available in metadata)
    │   └─ Preferred Destinations
    │
    ▼
[Summary Database - PostgreSQL]
    │
    ├─ user_logistics_summary
    │   ├─ user_id
    │   ├─ preferred_origins JSON  -- ['USA': 0.7, 'Turkey': 0.3]
    │   ├─ avg_shipment_weight FLOAT
    │   ├─ shipping_frequency VARCHAR  -- 'monthly', 'quarterly', 'yearly'
    │   ├─ total_shipments INTEGER
    │   ├─ avg_shipment_value FLOAT (if available)
    │   └─ last_updated TIMESTAMP
    │
    └─ user_shipping_aggregates
        ├─ user_id
        ├─ total_shipments
        ├─ origin_distribution JSON  -- {'USA': 45, 'Turkey': 12}
        └─ weight_distribution JSON  -- Average weights per origin
```

**Why This Design:**
- JAK Production DB has 15 years of shipping data - cannot query in real-time
- ETL pre-computes **logistics summaries** (not product summaries) for instant access
- Incremental updates keep data fresh without full scans
- Read-only access to production DB protects operational systems
- **No product data available** - we work with shipping patterns only

**Logistics Pattern Recognition (SQL Aggregation, Not ML):**

**SQL Aggregation Patterns Used:**
- **Origin Frequency**: GROUP BY origin, COUNT shipments, calculate percentage per user
- **Average Weight**: AVG(shipment_weight) per user, per origin
- **Shipping Frequency**: Calculate time between shipments, classify as monthly/quarterly/yearly
- **Destination Patterns**: COUNT shipments per destination country

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

### 3. Approved Merchant List (Security & Quality Filter)

**Purpose:** JAK maintains a **curated, approved merchant list** for security and quality control. This is **not** a product catalog, but a **whitelist** of trusted merchants.

```sql
CREATE TABLE approved_merchants (
    merchant_id VARCHAR PRIMARY KEY,
    merchant_name VARCHAR,
    merchant_url VARCHAR,
    categories VARCHAR[],  -- ['shoes', 'sportswear', 'accessories']
    brands VARCHAR[],      -- ['Nike', 'Adidas', 'Puma']
    origins VARCHAR[],     -- ['USA', 'Turkey']
    shipping_compatible BOOLEAN,
    quality_score FLOAT,   -- Security/trust score
    status VARCHAR,        -- 'active', 'suspended', 'pending'
    created_at TIMESTAMP,
    last_verified TIMESTAMP
);

-- Example data:
-- Nike.com: categories=['shoes', 'sportswear'], origins=['USA'], status='active'
-- Amazon.com: categories=['electronics', 'home', 'fashion'], origins=['USA', 'Turkey'], status='active'
-- LC Waikiki: categories=['fashion', 'home'], origins=['Turkey'], status='active'
```

**Why Approved Merchant List:**
- **Security**: Only trusted merchants are recommended to users
- **Quality Control**: Manually curated list ensures reliable shipping partners
- **Logistics-First**: Filters search results to merchants compatible with JAK shipping rules
- **No Product Data**: This list contains merchant metadata only, not products

### 3.1 Product & Pricing Data Sources (Search-Augmented Generation)

**Critical Architecture Decision:**
- **Product data comes from real-time search**, not internal databases
- JAK Production DB has **no item-level product history** (only shipping records)
- System uses **Search-Augmented Generation (RAG over Search)** for product discovery

**External Search Tool (Primary Product Data Source):**
- **SEARCH_TOOL** (Tavily API / Google Custom Search Engine / Serper API)
  - **Real-time product search**: Queries like "buy Nike shoes USA online"
  - **Price & availability data**: Extracts pricing from search results
  - **Product snippets**: Title, description, merchant URL from search results
  - **Technology**: RAG (Retrieval-Augmented Generation) - LLM processes search results to extract structured product data

**Approved Merchant Filter (Security Layer):**
- **MERCHANT_DB** (Approved Merchant List) acts as a **security/quality filter**
- **Step 1**: SEARCH_TOOL returns raw search results (may include any merchant)
- **Step 2**: Shopping Agent filters results against MERCHANT_DB approved list
- **Step 3**: Only merchants in approved list are recommended to users
- **Logistics-First Value**: Applies JAK shipping rules (origins, restricted items) on top of search results

**Data Flow:**
```
User Query: "I need Nike shoes"
    │
    ▼
[SHOPPING Agent]
    │
    ├─ Step 1: Understand Intent
    │   └─ Extract: brand="Nike", category="shoes", origin="USA" (from preferences)
    │
    ├─ Step 2: Live Search via SEARCH_TOOL
    │   └─ Query: "buy Nike shoes USA online"
    │   └─ Returns: Raw search results with products, prices, merchant URLs
    │
    ├─ Step 3: Filter Against Approved Merchant List
    │   └─ Check each merchant URL against MERCHANT_DB
    │   └─ Only keep results from approved merchants
    │   └─ Apply JAK shipping rules (origin compatibility, restrictions)
    │
    └─ Step 4: Present Filtered Results
        └─ Show products from approved merchants only
        └─ Include price, availability from search results
```

**Technology Stack:**
- **Search APIs**: Tavily API (preferred) or Google Programmable Search Engine
- **RAG Pattern**: LLM processes search results to extract structured product data
- **No Product Database**: All product data is search-retrieved, not stored

### 4. Preference Engine Logic

**How the engine behaves for different user types (BRD Section 5 + 7.2):**

#### 4.1 Existing User with Shipping History

**Critical Note:** We have **shipping patterns only**, not product purchase history.

```
User Query: "I need Nike shoes"
    │
    ▼
[Preference Service]
    │
    ├─ Load Logistics-Based Signals (from SUMMARY_DB)
    │   ├─ Preferred origins (e.g., USA 70%, Turkey 30%) ← From shipping records
    │   ├─ Average shipment weight (e.g., 2.5 kg)
    │   ├─ Shipping frequency (e.g., monthly, quarterly)
    │   └─ Average shipment value (if available in metadata)
    │   └─ Note: NO product categories/brands from history (not available)
    │
    ├─ Load Conversational Preferences (from PREF_DB)
    │   ├─ Brands learned from past conversations (e.g., Nike, Adidas)
    │   ├─ Categories learned from past conversations (e.g., shoes, electronics)
    │   ├─ Sizes, colors, styles from past conversations
    │   └─ Budget ranges from past conversations
    │
    ├─ Merge Current Conversational Signals
    │   ├─ Explicit brand: "Nike" (from current query)
    │   ├─ Size, color, style if mentioned
    │   └─ Budget if mentioned
    │
    ├─ Apply Attribute Weights
    │   ├─ Demographic ~5% (age, gender if available)
    │   ├─ Preference ~80% (from conversations, current + historical)
    │   └─ Behavioral ~15% (interaction patterns, refinement history)
    │
    ▼
    Preference Profile for this session
        ├─ category = "shoes" (from conversation, not history)
        ├─ brand_priority = ["Nike"] (from current query + past conversations)
        ├─ origin_priority = ["USA"] (from logistics patterns: 70% USA shipments)
        └─ budget_range = [min, max] (from conversations)
```

**Key Difference:**
- **Logistics Analyzer** provides shipping patterns (origin preference, frequency, weight)
- **Preference Service** learns product preferences from **conversations**, not shipping history
- **No product history** → All product preferences come from user conversations over time

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

### 5. Merchant Recommendation Flow (Search-Augmented Generation)

**Phase 1: Real-Time Product Search with Approved Merchant Filtering**

**Architecture Pattern: RAG over Search (Retrieval-Augmented Generation)**

```
[Shopping Agent]
    │
    ├─ Step 1: Receive User Query: "I need Nike shoes"
    │
    ├─ Step 2: Load User Context
    │   ├─ Preference Service → Get weighted preferences (brand, size, color, budget)
    │   └─ Logistics Analyzer → Get shipping patterns (preferred origin: USA)
    │
    ├─ Step 3: Extract Intent & Build Search Query
    │   ├─ Brand: Nike
    │   ├─ Category: Shoes
    │   ├─ Origin: USA (from logistics patterns)
    │   └─ Build Search Query: "buy Nike shoes USA online"
    │
    ├─ Step 4: Live Search via SEARCH_TOOL (Tavily/Google Search)
    │   ├─ Call SEARCH_TOOL API with query
    │   ├─ Returns: Raw search results
    │   │   ├─ Product titles, descriptions
    │   │   ├─ Merchant URLs (Nike.com, FootLocker.com, Amazon.com, etc.)
    │   │   ├─ Price information (if available)
    │   │   └─ Availability hints
    │   └─ Note: Results may include ANY merchant (not filtered yet)
    │
    ├─ Step 5: Filter Against Approved Merchant List (Security Layer)
    │   ├─ For each search result:
    │   │   ├─ Extract merchant domain from URL
    │   │   ├─ Query MERCHANT_DB: Is merchant in approved list?
    │   │   ├─ Check: origin compatibility (USA/Turkey)
    │   │   ├─ Check: shipping_compatible flag
    │   │   └─ Check: status = 'active'
    │   ├─ Filter: Keep only results from approved merchants
    │   └─ Discard: Results from unapproved merchants
    │
    ├─ Step 6: Apply JAK Shipping Rules (Logistics-First Layer)
    │   ├─ Validate: Origin → destination compatibility
    │   ├─ Check: Restricted items (if product category detected)
    │   ├─ Apply: Shipping cost estimates (from JAK_PROD patterns)
    │   └─ Apply: Timeline estimates (from SUMMARY_DB logistics patterns)
    │
    ├─ Step 7: Rank & Score Results (Rule-Based)
    │   ├─ Exact brand match: +40 points (Nike.com for Nike query)
    │   ├─ Category match: +30 points (shoes category)
    │   ├─ Price within budget: +20 points (if price available from search)
    │   ├─ Origin availability: +10 points (USA origin matches preference)
    │   ├─ Shipping compatible: +5 points (merchant flagged compatible)
    │   └─ Sort by total score, return top 3-5 results
    │
    ├─ Step 8: Generate Match Scores & Format Response (LLM)
    │   └─ "Here are 3 places where you can find Nike shoes:
    │       1. Nike.com (100% match) - Official Nike store, $80-120
    │       2. Foot Locker (90% match) - Wide selection, $60-150
    │       3. Amazon.com (85% match) - General marketplace, $50-200
    │       
    │       All ship from USA. Use your JAK USA address for shipping.
    │       Estimated delivery: 7-10 business days."
```

**Key Architecture Points:**

1. **Product Data Source**: Real-time search (SEARCH_TOOL), not database
2. **Security Filter**: Approved Merchant List (MERCHANT_DB) ensures only trusted merchants
3. **Logistics-First Value**: JAK shipping rules applied on top of search results
4. **RAG Pattern**: LLM processes search results to extract structured product data
5. **No Product Storage**: All product data is transient (from search), not stored

**Technology Stack:**
- **Search API**: Tavily API (preferred) or Google Programmable Search Engine
- **RAG**: LLM (Qwen/DeepSeek) processes search results
- **Filtering**: PostgreSQL MERCHANT_DB for approved merchant validation
- **Scoring**: Rule-based algorithm (no ML models)

**Why This Approach:**
- **Fresh Data**: Real-time search ensures current prices and availability
- **Security**: Approved merchant list protects users from untrusted merchants
- **Logistics-First**: JAK shipping rules applied as a layer on top of search
- **No Legacy Dependencies**: Clean architecture, no reliance on product history data
- **Scalable**: Search APIs handle product discovery, JAK focuses on logistics

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

4. **Logistics Analyzer → LLM**: Explain shipping patterns (origin preferences, frequency)
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
    D --> G[Preference Understanding<br/>Preference Service + Logistics Analyzer]
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
   - Logistics Analyzer (get shipping patterns if user has history)
   - Preference Service (get current preferences)
3. **Shopping Agent** receives context and calls:
   - Preference Service (get weighted preferences)
   - Logistics Analyzer (get shipping patterns)
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
- **Shopping Agent ↔ Logistics Analyzer**: Needs shipping patterns for existing users (origin preferences)
- **Preference Service ↔ Logistics Analyzer**: Origin preferences informed by shipping patterns
- **ETL ↔ All Summary DBs**: Background updates keep data fresh
- **All Services ↔ LLM**: Natural language understanding and response generation
- **All Services ↔ Analytics**: Event tracking for success metrics

## Real-Life User Journey Examples

### Example 1: Existing User with History - Ahmad Al-Rashid

**User Profile:**
- **Name**: Ahmad Al-Rashid
- **Registration**: 3 years ago (2021)
- **Shipping History**: 45 shipments, primarily from USA
- **Logistics Patterns** (from SUMMARY_DB):
  - Preferred origin: USA (100% of shipments)
  - Average shipment weight: 3.2 kg
  - Shipping frequency: Quarterly
  - Average shipment value: $250 (from metadata)
- **Conversational Preferences** (from PREF_DB, learned from past chats):
  - Preferred brands: Apple, Samsung (learned from conversations)
  - Categories: Electronics, laptops (learned from conversations)
  - Budget range: $300-$600 (learned from conversations)

**Conversation Flow:**
```
[User visits JAK website, logs in]

AI Agent: "As-salamu alaykum Ahmad! How are you today? How can I help you with your shopping?"

Ahmad: "I need a new laptop"

[System Flow:]
1. Orchestrator detects: EXISTING_USER_WITH_HISTORY
2. User Profile Service: Loads "Ahmad Al-Rashid" name
3. Logistics Analyzer: 
   - Queries SUMMARY_DB → Finds shipping patterns
   - Preferred origin: USA (100% of shipments)
   - Average shipment weight: 3.2 kg
   - Shipping frequency: Quarterly
   - Note: NO product categories/brands from shipping history (not available)
4. Preference Service:
   - Loads from PREF_DB: Brands (Apple, Samsung), categories (electronics), budget $300-$600
   - These were learned from past conversations, not shipping history
   - Learning score: 0.85 (experienced user)
5. Shopping Agent:
   - Extracts intent: "laptop" category, electronics
   - Builds search query: "buy laptop USA online Apple Samsung"
   - Calls SEARCH_TOOL (Tavily API):
     - Returns: Raw search results with products, prices, merchant URLs
     - Results include: Apple.com, BestBuy.com, Amazon.com, NewEgg.com, etc.
6. Filter Against Approved Merchant List:
   - Checks each merchant URL against MERCHANT_DB
   - Keeps: Apple.com, BestBuy.com, Amazon.com (all in approved list)
   - Discards: NewEgg.com (not in approved list)
7. Apply JAK Shipping Rules:
   - Validates: All merchants ship from USA (matches preference)
   - Checks: Electronics shipping compatibility
   - Estimates: Shipping cost $15-25, timeline 7-10 days
8. Rank & Score Results:
   - Apple.com: 100% (exact brand match + approved + USA origin)
   - BestBuy.com: 90% (category match + approved + USA origin)
   - Amazon.com: 85% (multi-category + approved + USA origin)
9. LLM formats response with prices from search results

AI Agent: "Based on your shipping history, I see you prefer USA origin. Here are 3 places where you can find laptops:

1. Apple.com (100% match) - Official Apple store, $800-1200, ships to your JAK USA address
2. BestBuy.com (90% match) - Wide selection including Apple and Samsung, $600-1500
3. Amazon.com (85% match) - General electronics marketplace, $400-2000

Your JAK USA address is ready. Shipping typically takes 7-10 days to Saudi Arabia. Which one interests you?"

Ahmad: "Show me Apple laptops under $600"

[Refinement Loop:]
1. Shopping Agent extracts: brand=Apple, category=laptops, budget<$600
2. Calls SEARCH_TOOL with refined query: "buy Apple laptop under $600 USA refurbished"
3. SEARCH_TOOL returns: Apple MacBook Air M1 ($549), MacBook Pro 13" ($599), etc.
4. Filters against approved merchants: All from Apple.com (approved)
5. Match scores: 95% (within budget), 90% (slightly over budget)

AI Agent: "Here are Apple laptops under $600:

1. Apple MacBook Air M1 (Refurbished) - $549 (95% match)
2. Apple MacBook Pro 13" (Refurbished) - $599 (95% match)

Both ship from USA. Use your JAK USA address at checkout."

Ahmad: [Clicks Apple.com link, completes purchase externally]

[Learning Loop - Next Day:]
- ETL reads new shipment from JAK_PROD (shipping record only, no product details)
- Updates SUMMARY_DB: +1 shipment from USA, weight 2.1 kg
- Updates PREF_DB: learning_score increases to 0.87, saves "laptop" and "Apple" from conversation
- Analytics: Tracks recommendation click and successful purchase
```

**Key Technical Points:**
- **Logistics Analyzer** uses shipping patterns (origin, weight, frequency), NOT product history
- **Preference Service** learns product preferences from **conversations**, not shipping records
- **SEARCH_TOOL** provides real-time product data (prices, availability)
- **Approved Merchant List** filters search results for security
- **JAK Shipping Rules** applied on top of search results (logistics-first)
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
3. Logistics Analyzer: Returns empty (no shipping patterns)
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
2. Builds search query: "buy Nike sports shoes size 38 black white $50-$100 USA Turkey"
3. Calls SEARCH_TOOL (Tavily API):
   - Returns: Raw search results with products, prices, merchant URLs
   - Results include: Nike.com, FootLocker.com, Amazon.com, Trendyol.com, etc.
4. Filter Against Approved Merchant List:
   - Checks each merchant URL against MERCHANT_DB
   - Keeps: Nike.com, Foot Locker, Amazon.com (all in approved list)
   - Discards: Unapproved merchants
5. Apply JAK Shipping Rules:
   - Validates: USA and Turkey origins available
   - Estimates: Shipping costs and timelines
6. Rank & Score Results:
   - Nike.com: 100% (exact brand match + approved)
   - Foot Locker: 90% (category + brand + approved)
   - Amazon.com: 75% (general + approved)
7. LLM formats response with prices from search results

AI Agent: "Based on your preferences, here are 3 places where you can find Nike sports shoes in size 38, black or white, within $50-$100:

1. Nike.com (100% match) - Official Nike store, $60-90, ships to your JAK USA address
2. Foot Locker (90% match) - Wide selection of Nike sports shoes, $50-100
3. Amazon.com (75% match) - General marketplace with Nike options, $45-120

Shipping from USA typically takes 7-10 days. Your JAK USA address is ready to use. Which one interests you?"

Fatima: "I prefer Turkey origin, it's cheaper"

[Refinement Loop:]
1. Shopping Agent extracts: origin=Turkey preference
2. Preference Service updates: preferred_origins=['Turkey']
3. Calls SEARCH_TOOL with refined query: "buy Nike shoes Turkey online $50-$100"
4. SEARCH_TOOL returns: Trendyol.com, LC Waikiki, etc.
5. Filters against approved merchants: Keeps Trendyol.com, LC Waikiki (both approved)
6. Applies JAK shipping rules: Turkey origin, 10-14 days delivery

AI Agent: "Great choice! Here are merchants from Turkey:

1. Trendyol.com (95% match) - Turkish marketplace with Nike shoes, $40-80
2. LC Waikiki (85% match) - Turkish fashion retailer, $50-90

Shipping from Turkey takes 10-14 days and is typically more affordable. Use your JAK Turkey address at checkout."

Fatima: [Clicks Trendyol.com link, completes purchase externally]

[Learning Loop - Next Day:]
- ETL reads new shipment from JAK_PROD (shipping record only, no product details)
- Creates initial SUMMARY_DB entry: 1 shipment from Turkey, weight 0.8 kg
- Updates PREF_DB: learning_score increases to 0.25, saves "shoes", "Nike", "Turkey origin" from conversation
- Analytics: Tracks new user first-time success
```

**Key Technical Points:**
- New users trigger preference gathering (5 questions max)
- No shipping history → relies on conversational inputs only
- **SEARCH_TOOL** provides real-time product data (prices, availability)
- **Approved Merchant List** filters search results for security
- Preference Service builds initial profile from answers
- Learning score starts at 0.0, increases with each interaction
- Refinement updates preferences in real-time and triggers new search queries

### Phase 1 Limitations

**1. Search-Dependent Product Data:**
- **Limitation**: Product data comes from real-time search (SEARCH_TOOL), not internal database
- **Example**: User asks "Nike Air Max size 42" → System searches via SEARCH_TOOL, filters against approved merchants, shows results with prices from search
- **Reason**: JAK Production DB has no item-level product history (only shipping records)
- **Workaround**: 
  - SEARCH_TOOL provides real-time product data (prices, availability)
  - Approved Merchant List (MERCHANT_DB) filters search results for security
  - User completes product selection and checkout on merchant website
  - Search results are transient (not stored in database)

**2. Manual Approved Merchant List:**
- **Limitation**: Approved merchant list is manually curated and maintained (security/quality filter)
- **Example**: New merchant (e.g., Zara.com) not in approved list → Search results filtered out, won't appear in recommendations
- **Reason**: Security and quality control - only trusted merchants are recommended
- **Workaround**: Catalog team manually reviews and adds new merchants to approved list

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
