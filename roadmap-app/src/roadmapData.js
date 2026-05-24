/**
 * Agentic AI Engineer Roadmap — Node & Edge Data
 *
 * All content is original. Structured as phases → topics → subtopics.
 * Each node has: id, label, description, phase, type (phase|topic|subtopic)
 */

const PHASES = {
  foundations: {
    label: 'Phase 1: Foundations',
    description: 'Engineer around non-determinism. LLMs are probabilistic functions — your code must handle that.',
    color: '#2563eb',
    topics: [
      {
        id: 'llm-mental-model',
        label: 'LLM Mental Model',
        description: 'An LLM is a function: string → probability distribution over tokens. No memory, no understanding, no determinism.',
        subtopics: [
          { id: 'tokenization', label: 'Tokenization', description: 'How text becomes integers. Why prompts are longer than you think.' },
          { id: 'context-window', label: 'Context Window', description: 'Maximum tokens per call. Hit the limit and you get a hard error.' },
          { id: 'temperature', label: 'Temperature & Sampling', description: 'The knobs that control output randomness. Temperature 0 ≈ mostly deterministic.' },
          { id: 'system-prompts', label: 'System vs User Prompts', description: 'Both go into the same context, but system prompts carry slightly more weight.' },
        ],
      },
      {
        id: 'structured-outputs',
        label: 'Structured Outputs',
        description: 'Constrain the model to a schema. The single biggest gap between hobby code and production code.',
        subtopics: [
          { id: 'json-schema', label: 'Provider-Native JSON Mode', description: 'OpenAI response_format, Anthropic tool calling, Gemini JSON mode.' },
          { id: 'pydantic-instructor', label: 'Pydantic + Instructor', description: 'Type-safe structured output with auto-retry on validation failure.' },
        ],
      },
      {
        id: 'production-failures',
        label: 'Production Failure Modes',
        description: 'The 4 failures that hit in order: malformed JSON → latency tails → cost surprise → model drift.',
        subtopics: [
          { id: 'retry-patterns', label: 'Retry & Fallback Patterns', description: 'Validation-error feedback, timeout cascades, model fallback chains.' },
          { id: 'cost-awareness', label: 'Cost Awareness', description: 'Output tokens cost 3-5x input. Prompt caching cuts repeat costs 80-90%.' },
          { id: 'version-pinning', label: 'Model Version Pinning', description: 'Pin exact model snapshots. Never use "latest" aliases in production.' },
        ],
      },
      {
        id: 'provider-selection',
        label: 'Provider Selection',
        description: 'Choose by use case, not by hype. Start capable, downsize where evals allow, escalate when needed.',
        subtopics: [
          { id: 'model-routing-intro', label: 'Model Routing Basics', description: 'Cheap model for simple tasks, strong model for hard reasoning.' },
        ],
      },
    ],
  },
  rag: {
    label: 'Phase 2: Production RAG',
    description: 'Retrieval is where RAG fails — not generation. 80% of "RAG broken" is a retrieval problem.',
    color: '#16a34a',
    topics: [
      {
        id: 'rag-decision',
        label: 'When to Use RAG',
        description: 'RAG vs long-context vs fine-tuning. If your data fits in context, skip RAG entirely.',
        subtopics: [
          { id: 'long-context-alt', label: 'Long Context Alternative', description: 'With 1M token windows, many use cases are simpler solved by putting everything in the prompt.' },
        ],
      },
      {
        id: 'chunking',
        label: 'Chunking Strategies',
        description: 'Fixed-size with overlap is the default. Chunk by function for code, by header for docs.',
        subtopics: [
          { id: 'contextual-chunking', label: 'Contextual Chunking', description: 'Prepend a short summary to each chunk before embedding. Measurable retrieval lift.' },
          { id: 'metadata', label: 'Metadata Enrichment', description: 'Every chunk needs metadata (source, date, tier). Filter before search, not after.' },
        ],
      },
      {
        id: 'retrieval-patterns',
        label: 'Retrieval Patterns',
        description: 'Dense-only is the floor. Production RAG combines hybrid retrieval + reranking.',
        subtopics: [
          { id: 'hybrid-retrieval', label: 'Hybrid (Dense + Sparse)', description: 'Combine vector similarity with BM25 keyword search. Each catches what the other misses.' },
          { id: 'reranking', label: 'Reranking', description: 'A smaller model re-scores top-k results by relevance. 15-30% quality lift for ~100-200ms.' },
          { id: 'query-rewriting', label: 'Query Rewriting', description: 'Use a cheap LLM call to rephrase ambiguous queries before retrieval.' },
        ],
      },
      {
        id: 'vector-db',
        label: 'Vector DB Selection',
        description: 'Use pgvector until you have a reason not to. Most teams over-engineer this choice.',
        subtopics: [],
      },
      {
        id: 'rag-evals',
        label: 'RAG Evals',
        description: 'You cannot ship RAG without retrieval evals. Recall@k and MRR on a labeled query set.',
        subtopics: [
          { id: 'retrieval-metrics', label: 'Retrieval Metrics', description: 'Recall@k, MRR, NDCG. If retrieval recall < 70%, fix retrieval before touching the prompt.' },
          { id: 'generation-metrics', label: 'Generation Metrics', description: 'Faithfulness (is it grounded?) and correctness (does it match the ideal answer?).' },
          { id: 'eval-set-building', label: 'Building the Eval Set', description: '50-200 labeled query/chunk/answer triples. Version-control it. Treat it as code.' },
        ],
      },
    ],
  },
  agents: {
    label: 'Phase 3: Agents & Orchestration',
    description: 'An agent is a while-loop: Think → Act → Observe → repeat. Build it yourself before buying a framework.',
    color: '#9333ea',
    topics: [
      {
        id: 'agent-definition',
        label: 'What an Agent Is',
        description: 'A program that repeatedly calls an LLM to decide what action to take, executes it, and loops until done.',
        subtopics: [
          { id: 'sophistication-ladder', label: 'Sophistication Ladder (L1-L5)', description: 'Single call → single tool → multi-tool → agent loop → multi-agent. Start at L1, move up only when needed.' },
          { id: 'workflow-patterns', label: '5 Workflow Patterns', description: 'Chaining, Routing, Parallelization, Orchestrator-Workers, Evaluator-Optimizer. Most systems are one of these.' },
        ],
      },
      {
        id: 'tool-calling',
        label: 'Tool Calling',
        description: 'The LLM proposes tool calls. Your code executes them. Never trust arguments blindly.',
        subtopics: [
          { id: 'tool-descriptions', label: 'Tool Descriptions as Prompts', description: 'Vague descriptions = 20% wrong tool selection. Add "use when" / "don\'t use when" guidance.' },
          { id: 'tool-validation', label: 'Argument Validation', description: 'Validate LLM-generated arguments before execution. This is the agentic equivalent of input sanitization.' },
          { id: 'error-feedback', label: 'Error Feedback to LLM', description: 'Return errors as tool results so the LLM can self-correct. Don\'t crash the loop.' },
        ],
      },
      {
        id: 'agent-loop',
        label: 'The Agent Loop',
        description: 'A ~100-line Python class: ReAct loop with tool calling, retries, max-turn limits, and logging.',
        subtopics: [],
      },
      {
        id: 'memory',
        label: 'Memory',
        description: 'Three types: conversation (you need this), working scratchpad (sometimes), long-term (rarely).',
        subtopics: [],
      },
      {
        id: 'frameworks',
        label: 'Framework Decision',
        description: 'Write your own loop for your first 3 agents. Evaluate frameworks from knowledge, not marketing.',
        subtopics: [
          { id: 'when-framework', label: 'When to Use a Framework', description: 'Complex branching (if-then-else, parallel, approval gates) = consider LangGraph. Linear steps = write your own.' },
        ],
      },
      {
        id: 'hitl-guardrails',
        label: 'Human-in-the-Loop & Guardrails',
        description: 'Every agent that modifies external state needs an approval gate. Max turns, token budgets, rate limits.',
        subtopics: [],
      },
      {
        id: 'failure-modes',
        label: '5 Agent Failure Modes',
        description: 'Loop of Doom, Silent Wrong Tool, Phantom Hallucination, Context Overflow, Cascading Error.',
        subtopics: [],
      },
      {
        id: 'mcp',
        label: 'MCP Protocol',
        description: 'Model Context Protocol: the standard for portable tool integration. Build MCP servers from day 1.',
        subtopics: [],
      },
    ],
  },
  production: {
    label: 'Phase 4: Production Systems',
    description: 'The layer that keeps everything alive. Evals, observability, cost engineering, and security.',
    color: '#dc2626',
    topics: [
      {
        id: 'eval-stack',
        label: 'The Eval Stack',
        description: 'Three layers: offline evals (CI/CD), online evals (production sampling), human evals (weekly reviews).',
        subtopics: [
          { id: 'offline-evals', label: 'Offline Evals', description: 'Run on every code/prompt/model change. The regression safety net.' },
          { id: 'online-evals', label: 'Online Evals', description: 'LLM-as-judge on 5% of production traffic. Catches drift offline evals miss.' },
          { id: 'human-evals', label: 'Human Evals', description: 'Weekly reviews of 20-50 production responses. Non-negotiable.' },
          { id: 'cccd', label: 'CC/CD Framework', description: 'Continuous Calibration (eval set evolves) + Continuous Development (system improves against evals).' },
        ],
      },
      {
        id: 'observability',
        label: 'Observability',
        description: 'Log every LLM call: model, tokens, latency, cost, tool calls. Without data, you\'re debugging blind.',
        subtopics: [
          { id: 'tracing', label: 'Distributed Tracing', description: 'Unique trace ID per request, propagated through every LLM call and tool execution.' },
          { id: 'dashboards', label: 'Key Metrics', description: 'Error rate, P95 latency, completion rate, cost per session, online eval score, max-turns-hit rate.' },
        ],
      },
      {
        id: 'cost-engineering',
        label: 'Cost Engineering',
        description: 'Cost kills more AI products than quality does. Model routing is the highest-impact lever.',
        subtopics: [
          { id: 'model-routing', label: 'Model Routing', description: 'Route 60-70% of queries to smaller models. Maintain >95% quality at 40-60% lower cost.' },
          { id: 'prompt-caching', label: 'Prompt Caching', description: 'Cache static system prompts. 80-90% cost reduction on the cached portion.' },
          { id: 'semantic-caching', label: 'Semantic Caching', description: 'Cache LLM responses for semantically similar queries. Saves cost + latency on FAQs.' },
        ],
      },
      {
        id: 'security',
        label: 'Security & Red-Teaming',
        description: 'Prompt injection is the #1 LLM vulnerability. Defense-in-depth: input sanitization → prompt hardening → output filtering → tool auth.',
        subtopics: [
          { id: 'red-team-evals', label: 'Red-Team Eval Set', description: 'Adversarial queries testing injection, exfiltration, and tool abuse. Run on every deploy.' },
        ],
      },
      {
        id: 'prod-checklist',
        label: 'Production Readiness Checklist',
        description: 'Pre-launch checklist (evals, guardrails, observability, safety, UX) + post-launch cadences (weekly/monthly/quarterly).',
        subtopics: [],
      },
    ],
  },
};

export default PHASES;
