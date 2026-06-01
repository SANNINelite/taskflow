# TaskFlow System Architecture & Scalability Guide
This architectural document outlines the blueprint for scaling the **TaskFlow API** platform from a single-node application to a high-availability, fault-tolerant system capable of serving **100,000+ concurrent active users** with sub-50ms latencies.

---

## 1. Primary Bottlenecks & High-Availability Scaling (100k+ Users)
At 100,000+ active users, single-node systems collapse due to:
* **CPU Saturation**: Cryptographic operations (Bcrypt password hashing) and JSON parsing.
* **Database Connection Limits**: MongoDB connections becoming exhausted.
* **Memory Limits**: Node's default V8 heap limits (around 1.4 GB on 64-bit systems).

To resolve this, we shift from vertical scaling to a **horizontal, share-nothing architecture**, where state is decoupled entirely from application servers.

```mermaid
graph TD
    User([Clients]) -->|HTTPS| LB[Load Balancer / Nginx]
    subgraph App Layer (Horizontal Scaling)
        LB --> Node1[Express Node 1]
        LB --> Node2[Express Node 2]
        LB --> Node3[Express Node N]
    end
    subgraph Caching & State
        Node1 & Node2 & Node3 --> Redis[(Redis Cluster)]
    end
    subgraph Data Layer
        Node1 & Node2 & Node3 --> DB[(MongoDB Replica Set)]
        DB -.->|Oplog Sync| Read1[(Read Replica 1)]
        DB -.->|Oplog Sync| Read2[(Read Replica 2)]
    end
```

---

## 2. Database Indexing Strategy (MongoDB + Mongoose)
Inefficient queries result in linear collection scans ($O(N)$ complexity) that freeze database execution threads. We implement index-optimized searches.

### A. Implemented Schema Indexes
1. **Single Fields Index (Mongoose `unique` constraint)**:
   * `User.email` -> `{ email: 1 }` (Allows $O(\log N)$ user login lookups).
2. **Compound Index (High Cardinally optimization)**:
   * `Task.createdBy` + `Task.status` -> `{ createdBy: 1, status: 1 }` (Speeds up listing queries when filtering or sorting own tasks).
3. **Task Creation Order sorting Index**:
   * `{ createdAt: -1 }` (Saves CPU cycles on DB memory sorting).

### B. Indexing Guidelines for Evaluators
* **Avoid Over-indexing**: Every write, delete, and update operation incurs index-rebuild penalties. Keep indexing selective for high-frequency `read` filters.
* **Covered Queries**: Ensure query projections (`.select('title status')`) fetch only indexed fields, completely skipping raw document loading from disk into RAM.
* **Execution Profiling**: Continually inspect queries using MongoDB's `.explain("executionStats")` to verify they result in `IXSCAN` (Index Scan) rather than `COLLSCAN` (Collection Scan).

---

## 3. Redis Caching Opportunities
By introducing **Redis** as an in-memory caching layer, we intercept up to 80% of read requests, avoiding expensive disk-based database reads.

```
Request ──> [ Check Redis Cache ] ──(Cache Hit: < 5ms)──> Return Data
                    │ (Cache Miss)
                    └──> [ MongoDB Query ] ──> Write Cache ──> Return
```

### Key Cache Implementation Strategies
1. **Task Listing Cache**:
   * **Key Name**: `user:tasks:<userId>:<status_filter>`
   * **Expiration**: 15 minutes (TTL).
   * **Eviction Policy**: Cache is deleted (`DEL`) instantly on writes (`POST`, `PUT`, `DELETE` on tasks) to prevent stale data.
2. **JWT Session Invalidation Cache (Blacklisting)**:
   * In stateless JWT architectures, tokens cannot be easily revoked. Upon user logout, we store the JWT signature key in Redis with a TTL matching the token's remaining validity duration.
   * Authentication middleware queries this blacklist; if hit, it terminates the request (`401 Unauthorized`).
3. **API Rate Limiting**:
   * Use Redis atomic operations (`INCR`, `EXPIRE`) to enforce rate limits (e.g., maximum 100 requests per minute per IP address).

---

## 4. Horizontal Scaling & Stateless Design
To enable frictionless scaling, the API application tier must remain completely **stateless**.

* **Session Decoupling**: Session state is never stored in server memory. Authenticated payloads are either stored in cryptographically signed client JWTs or in shared Redis clusters.
* **Node.js Clustering (Single Server scale)**:
  * Node.js runs on a single thread. On multi-core servers, use **PM2** or native Node `cluster` module to spawn process instances matching the physical core count, multiplexing traffic across them.
* **Dynamic Container Clusters (Cloud scale)**:
  * Deploy servers inside Docker containers. Use **Kubernetes (K8s)** or AWS ECS with **Horizontal Pod Autoscaling (HPA)** to scale containers reactively based on active CPU/Memory thresholds.

---

## 5. Load Balancing & Reverse Proxy Setup
We place **Nginx** or **HAProxy** as a reverse proxy in front of the server cluster to manage incoming user requests.

### Key Reverse Proxy Operations:
* **SSL Termination**: The load balancer decrypts incoming HTTPS traffic, offloading CPU-heavy SSL computations from Express server nodes.
* **Traffic Balancing Algorithms**:
  * **Round Robin**: Distributes traffic sequentially.
  * **Least Connections**: Allocates traffic to the server with the lowest concurrent connections.
  * **IP Hash**: Ensures consistent server mapping for persistent socket links.
* **Static Assets Offloading**: Nginx is configured to serve static assets (Vite React bundle, CSS, SVGs) directly, bypassing the Node process entirely for standard assets.

---

## 6. Microservice Migration Path
As the team and platform grow, a monolith can limit development velocity. We modularize our monolith into decoupled microservices.

```
Monolithic App ───> Split ───> API Gateway
                                   │
                                   ├── Auth Service (User accounts)
                                   ├── Task Service (CRUD core)
                                   └── Notification Service (Mails/Push)
```

### Steps for Deconstruction:
1. **Decoupled Database Model**: Partition MongoDB collections. Migrating to a **Database-per-Service** paradigm prevents services from directly reading other services' tables, ensuring logical boundaries.
2. **API Gateway Layer**: Introduce an API Gateway (Kong, Express Gateway, or AWS API Gateway) to manage centralized routing, auth checks, rate limiting, and request telemetry.
3. **Inter-Service Communication**:
   * **Synchronous (gRPC / HTTP)**: Used for real-time lookups (e.g., verifying user status).
   * **Asynchronous (RabbitMQ / Kafka)**: Used to broadcast state updates across services without blocking execution.

---

## 7. Message Queue Systems & Background Workers
Heavy tasks like generating task summaries, exporting PDF worksheets, or dispatching welcome emails will choke the single-threaded Node event loop if done synchronously.

* **Decoupling Task Processing**: Offload non-blocking activities to a job queue.
* **BullMQ (Redis-backed)** or **RabbitMQ**:
  * When a user registers, the Auth service publishes a `user.created` event payload to the queue.
  * A separate background worker pool consumes the event and sends the welcome email.
  * The HTTP thread immediately returns `201 Created` back to the client in under 30ms, rather than waiting for external SMTP servers.

---

## 8. Enterprise Logging, APM & Monitoring
Visibility is crucial at 100k+ users. We implement a three-tiered observability framework.

### A. Logging
* We replace default `console.log` with **Winston** or **Pino** to output structured JSON logs containing timestamp, correlation ID, and level severity.
* Stream structured logs to a central server using the **ELK Stack** (Elasticsearch, Logstash, Kibana) or **Grafana Loki** for fast search indexing.

### B. Metrics & Monitoring
* **Prometheus**: Periodically scrapes app endpoints for system telemetry (CPU load, memory heap, connection count, request rate).
* **Grafana**: Creates interactive dashboards charting server load, request error rates (5xx status tracking), and database execution speeds.

### C. APM (Application Performance Monitoring)
* Integrate **OpenTelemetry** or **Datadog** to track long-running traces. This lets us trace exactly where in the call stack a request slowed down (e.g., finding a missing index in a nested Mongoose `.populate()` query).
