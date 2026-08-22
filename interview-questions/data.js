// @systemsbyakshay - AI Engineering Interview Questions bank
// Schema: id, question, topic, difficulty (easy|medium|hard), companies (string[], empty = not tagged yet), dateAdded (YYYY-MM-DD), reelUrl (optional)
const QUESTIONS = [
  { id: 1, question: "Retriever returns the correct chunk, generator still hallucinates details. 15% hallucination rate overall. How do you debug it?", topic: "RAG & Retrieval", difficulty: "medium", companies: [], dateAdded: "2026-08-20" },
  { id: 2, question: "Your RAG system's answers are correct but retrieval latency is 4s on a 50M-document index. Where do you look first?", topic: "RAG & Retrieval", difficulty: "medium", companies: [], dateAdded: "2026-08-20" },
  { id: 3, question: "Adding more chunks to context improves recall but tanks precision - how do you tune chunk size and top-k systematically, not by guessing?", topic: "RAG & Retrieval", difficulty: "medium", companies: [], dateAdded: "2026-08-20" },
  { id: 4, question: "Two documents contradict each other and your RAG system picks the wrong one 30% of the time. How do you fix retrieval ranking for this?", topic: "RAG & Retrieval", difficulty: "hard", companies: [], dateAdded: "2026-08-20" },
  { id: 5, question: "Your RAG system works great in English but retrieval quality collapses for Arabic queries even though the documents are indexed correctly. How do you debug and fix this?", topic: "RAG & Retrieval", difficulty: "hard", companies: [], dateAdded: "2026-08-20" },

  { id: 6, question: "How should you evaluate an LLM beyond just latency?", topic: "Evaluation", difficulty: "easy", companies: [], dateAdded: "2026-08-20" },
  { id: 7, question: "You want continuous evaluation measuring hallucination rate, refusal rate, Arabic quality, and more - how do you build that pipeline?", topic: "Evaluation", difficulty: "medium", companies: [], dateAdded: "2026-08-20" },
  { id: 8, question: "Build a comprehensive LLM/RAG eval framework covering retrieval, generation, hallucinations, refusals, multilingual quality, latency, and cost - what's the architecture?", topic: "Evaluation", difficulty: "hard", companies: [], dateAdded: "2026-08-20" },
  { id: 9, question: "Your eval set was built 6 months ago and the model now scores 95% on it but users complain constantly. What's wrong and how do you fix it?", topic: "Evaluation", difficulty: "medium", companies: [], dateAdded: "2026-08-20" },
  { id: 10, question: "Two LLM judges disagree on 20% of your eval set. How do you resolve which one to trust?", topic: "Evaluation", difficulty: "medium", companies: [], dateAdded: "2026-08-20" },
  { id: 11, question: "You're comparing two models on the same eval suite and one wins on automated metrics but users consistently prefer the other in blind tests. How do you reconcile this and which do you ship?", topic: "Evaluation", difficulty: "medium", companies: [], dateAdded: "2026-08-20" },

  { id: 12, question: "70B model, 5000 concurrent users, A100s, p99 TTFT <800ms, zero data leaving org. What's the serving stack and why?", topic: "Serving & Inference", difficulty: "hard", companies: [], dateAdded: "2026-08-20" },
  { id: 13, question: "13B LoRA model on a single RTX 4090 edge server, need <500ms for 1000-token responses. What optimizations get you there?", topic: "Serving & Inference", difficulty: "hard", companies: [], dateAdded: "2026-08-20" },
  { id: 14, question: "Your inference cost per request tripled after a \"minor\" model upgrade with no accuracy gain reported by the vendor. How do you investigate and what levers do you pull?", topic: "Serving & Inference", difficulty: "medium", companies: [], dateAdded: "2026-08-20" },
  { id: 15, question: "GPU utilization sits at 30% during peak traffic but requests still queue. What's actually happening and how do you fix it?", topic: "Serving & Inference", difficulty: "medium", companies: [], dateAdded: "2026-08-20" },
  { id: 16, question: "Design a feature store for a fraud detection AI model - features must reflect the last 1, 5, and 30 minutes of activity per citizen ID, with retrieval under 10ms. How do you build this?", topic: "Serving & Inference", difficulty: "hard", companies: [], dateAdded: "2026-08-20" },

  { id: 17, question: "LoRA fine-tune improves your eval benchmark by 8% but production complaints double. How do you diagnose the gap?", topic: "Fine-Tuning", difficulty: "medium", companies: [], dateAdded: "2026-08-20" },
  { id: 18, question: "You have 500 labeled examples and need a domain-specific model in 2 weeks. Fine-tune, RAG, or prompt engineering - how do you decide, and what would change your answer?", topic: "Fine-Tuning", difficulty: "easy", companies: [], dateAdded: "2026-08-20" },
  { id: 19, question: "Your fine-tuned model catastrophically forgets a capability it had before training. How do you detect this before it ships and how do you fix it?", topic: "Fine-Tuning", difficulty: "medium", companies: [], dateAdded: "2026-08-20" },

  { id: 20, question: "An org sends a daily CSV of 2M citizen records - different column names weekly, random nulls, 3 date formats, French names transliterated inconsistently. How do you stop bad data silently breaking the downstream AI model?", topic: "Data Engineering", difficulty: "medium", companies: [], dateAdded: "2026-08-20" },

  { id: 21, question: "An ML model's F1 score dropped from 0.87 to 0.71 last month. No code changes. Walk through exactly how you'd investigate.", topic: "MLOps & Pipelines", difficulty: "medium", companies: [], dateAdded: "2026-08-20" },
  { id: 22, question: "Your Airflow DAG for nightly model training is failing 40% of the time with no code changes. How do you debug it?", topic: "MLOps & Pipelines", difficulty: "medium", companies: [], dateAdded: "2026-08-20" },
  { id: 23, question: "Your model performs great in staging, degrades within a week in production, then recovers on redeploy with the same weights. What's your hypothesis and how do you test it?", topic: "MLOps & Pipelines", difficulty: "hard", companies: [], dateAdded: "2026-08-20" },

  { id: 24, question: "Build a PII detection and tokenization system for a government data lake feeding AI training. How do you prove to an auditor that no raw PII ever reaches a training job?", topic: "Governance & Compliance", difficulty: "hard", companies: [], dateAdded: "2026-08-20" },
  { id: 25, question: "For a training run 14 months ago, you must prove exactly which records were used, who approved access, and whether any have since been deletion-requested. How do you design for this?", topic: "Governance & Compliance", difficulty: "hard", companies: [], dateAdded: "2026-08-20" },
  { id: 26, question: "A regulator asks you to explain a single model decision from 6 months ago, down to the exact prompt and retrieved context. What do you need logged today to answer that tomorrow?", topic: "Governance & Compliance", difficulty: "hard", companies: [], dateAdded: "2026-08-20" },

  { id: 27, question: "Your agent completes tasks correctly 90% of the time solo, but drops to 60% when chained with 2 other agents. How do you isolate where the failure is introduced?", topic: "Agents & Multi-Agent", difficulty: "medium", companies: [], dateAdded: "2026-08-20" },
  { id: 28, question: "An autonomous agent with tool access starts taking actions outside its intended scope under edge-case inputs. How do you design guardrails without crippling its usefulness?", topic: "Agents & Multi-Agent", difficulty: "medium", companies: [], dateAdded: "2026-08-20" },

  { id: 29, question: "Your LLM API bill grew 4x in a quarter while user count grew 1.3x. How do you find where the cost is actually going, and what's your fix?", topic: "Cost & Scale", difficulty: "easy", companies: [], dateAdded: "2026-08-20" },
  { id: 30, question: "You need to serve 10x more traffic next quarter with the same infra budget. What do you optimize first: model, infra, or usage patterns - and why?", topic: "Cost & Scale", difficulty: "medium", companies: [], dateAdded: "2026-08-20" },

  { id: 31, question: "A government smart-city platform streams 10,000 events/second. You need sub-5-second latency for real-time AI alerting AND full history for model retraining. How do you design this?", topic: "Architecture Trade-offs", difficulty: "hard", companies: [], dateAdded: "2026-08-20" },
  { id: 32, question: "12 ministry datasets must be queryable by a central AI platform, but each ministry's raw data must be invisible to the others. How do you architect this?", topic: "Architecture Trade-offs", difficulty: "hard", companies: [], dateAdded: "2026-08-20" }
];

if (typeof module !== "undefined") module.exports = QUESTIONS;
