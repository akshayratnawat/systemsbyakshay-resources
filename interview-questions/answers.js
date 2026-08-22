// @systemsbyakshay - Answer keys for the Interview Questions bank
// Format follows the interview-question-generator skill's Answer Key Format.
// Keyed by question id (matches data.js QUESTIONS[i].id).
const ANSWERS = {
  1: {
    testing: "Ability to isolate a failure to the generation stage instead of reflexively re-tuning retrieval.",
    context: "This is the classic \"retrieval is fine, generation is the leak\" case that most RAG postmortems get wrong by re-tuning the retriever first.",
    strong: [
      "Confirm retrieval precision/recall on a labeled eval set before touching the generator - if the right chunk is in context, the bug is downstream",
      "Check context position: a chunk buried in the middle of a long context gets ignored (lost-in-the-middle), verify chunk placement/ordering",
      "Check the prompt: is it explicitly telling the model to answer only from provided context, or letting it blend in prior knowledge",
      "Check chunk granularity: the right chunk retrieved but too broad, forcing the model to extract one detail from noise",
      "Run an ablation: same query, context-only vs. context+grounding instruction, see if the hallucination rate drops",
      "Segment the 15% by query type - numbers, dates, and named entities are the usual concentration",
      "If concentrated on numeric/date extraction, consider structured extraction or a second-pass verifier model",
      "Report the fix against the eval set's before/after numbers, not an anecdote"
    ],
    redFlags: [
      "Re-tuning the retriever/chunking without first verifying the correct chunk actually reached the model",
      "Assuming more context or reranking fixes a generation problem",
      "Debugging off spot checks with no labeled eval set"
    ],
    bonus: [
      "Cites lost-in-the-middle research (models attend less to context buried mid-prompt)",
      "Proposes a groundedness/faithfulness classifier as a standing guardrail, not a one-time fix",
      "Distinguishes hallucination types: fabricated facts vs. subtly wrong numbers vs. dropped caveats"
    ],
    followUp: "If the hallucination is concentrated on numeric values specifically, what's your fix, and would a bigger model actually solve it or just hide it?"
  },
  2: {
    testing: "Systematic latency profiling instead of guessing at the most visible number.",
    context: "This is the common shape when a team scales an index built for a 100K-doc demo to a 50M-doc production corpus without re-architecting.",
    strong: [
      "Split end-to-end latency into query embedding, ANN search, reranking, and generation - don't guess which stage owns the 4s",
      "Confirm an ANN index (HNSW, IVF-PQ) is actually in use - flat/exact search doesn't scale to 50M vectors",
      "Check whether a cross-encoder reranker is running over too many candidates - top-k=100 into a reranker is a common silent bottleneck",
      "Check if query embedding happens synchronously per request with no caching or batching",
      "Check infra: vector DB colocation, network hops, and whether it's sharded across the full 50M docs",
      "Tune HNSW ef_search against the actual recall requirement instead of leaving it at a default",
      "Add caching for repeat/similar queries if traffic has any skew",
      "Report the latency breakdown before/after so it's clear which change actually moved the number"
    ],
    redFlags: [
      "Jumping to \"scale up the vector DB hardware\" without profiling first",
      "Assuming it's the LLM generation call without checking retrieval latency",
      "No mention of ANN index type at 50M-vector scale"
    ],
    bonus: [
      "Mentions product quantization (PQ) for the memory/latency trade-off at this scale",
      "Mentions pipelining retrieval and generation where possible",
      "Distinguishes p50 from p99 - a 4s mean can hide a much worse tail"
    ],
    followUp: "Your fix gets p50 to 4s but p99 is still 9s. What's different about those tail requests and how do you find them?"
  },
  3: {
    testing: "Building an eval-driven tuning process instead of hand-tuning on a handful of examples.",
    context: "Most teams tune chunk size by eyeballing five queries - this checks for a real methodology behind the word 'systematically.'",
    strong: [
      "Build a labeled eval set first (queries with known correct source spans) - this is the prerequisite for 'systematic,' not optional",
      "Score retrieval (recall@k, precision@k, MRR) separately from end-answer quality (faithfulness, correctness)",
      "Grid search chunk size x overlap x top-k against retrieval metrics first, to isolate the retrieval stage",
      "Run the winning retrieval configs through the full pipeline, since the best retrieval config isn't always best end-to-end",
      "Watch the precision/recall trade-off explicitly - bigger top-k raises recall but adds noise a weaker generator can't filter",
      "Consider variable chunk sizes by content type (tables vs. prose vs. code) instead of one global number",
      "Re-run the eval set on every material corpus change - chunking isn't a one-time decision",
      "Present results as a config-vs-metric table to make the trade-off explicit to stakeholders"
    ],
    redFlags: [
      "\"I'd try a few chunk sizes and see what looks good\" with no eval set",
      "Optimizing only for recall and ignoring the precision cost to the generator",
      "Treating chunk size as a one-time setting instead of revisiting it as the corpus grows"
    ],
    bonus: [
      "Uses an LLM-as-judge for faithfulness scoring at scale, calibrated against a human-labeled seed set",
      "Mentions semantic/structure-aware chunking (split on headers/sections) over fixed character counts",
      "Tunes top-k and reranker depth together, not independently"
    ],
    followUp: "Your eval set has 200 queries. How do you know that's enough to trust the grid search, and what would make you distrust it?"
  },
  4: {
    testing: "Reasoning about ranking signals beyond pure semantic similarity, and about document trustworthiness.",
    context: "This shows up constantly in enterprise settings with policy docs where a 'v1' and a 'v2' are both still indexed.",
    strong: [
      "Characterize the contradiction first: stale-vs-current (a versioning problem) or genuinely conflicting sources (a trust problem) - the fix differs",
      "If versioning: add recency/version metadata and boost or filter by it at retrieval time - this is the majority of real-world cases",
      "If trust: add a source-authority signal (canonical doc, owner, approval status) as a ranking feature, not pure cosine similarity",
      "Check whether the embedding model even distinguishes the two documents, or if they're near-duplicates it can't separate",
      "Flag near-duplicate conflicting docs for a human/data-owner to resolve upstream, rather than papering over it at retrieval time",
      "Add a reranker with metadata-aware features (date, authority) instead of relying on the bi-encoder alone",
      "Where the conflict is real and unresolved upstream, have the generator surface it explicitly instead of silently picking a side",
      "Measure the fix against a labeled 'known correct source' set built specifically for these conflict cases"
    ],
    redFlags: [
      "Treating it as a chunking/embedding tuning problem when it's a data-governance problem",
      "Assuming better embeddings alone fixes ranking over conflicting sources",
      "Never considering surfacing the conflict to the user as a valid answer"
    ],
    bonus: [
      "Builds a document lifecycle process (deprecation, expiry dates) upstream of retrieval, not just retrieval-time patches",
      "Uses hybrid search (BM25 + dense) since conflicting docs often differ mainly in exact terms/dates that dense embeddings blur",
      "Names this as a data quality problem wearing a retrieval-tuning costume"
    ],
    followUp: "The two docs are both current and genuinely contradict each other, no stale version to prefer. What does the product actually do at answer time?"
  },
  5: {
    testing: "Cross-lingual retrieval failure diagnosis, and awareness that most embedding models are English-optimized.",
    context: "This is the single most common production surprise for teams that build and eval only in English before a global rollout.",
    strong: [
      "Check the embedding model's multilingual training coverage - most popular embedding models skew heavily English, and Arabic is a known weak spot",
      "Check tokenization - Arabic's root-pattern morphology and diacritics fragment very differently than English",
      "Check normalization consistency - are queries and docs using the same script/diacritic handling on both sides",
      "Test retrieval-only metrics (recall@k) on an Arabic-labeled eval set in isolation before touching anything else",
      "Consider a multilingual-specific embedding model benchmarked on MTEB's multilingual/Arabic subsets instead of assuming the English-tuned model generalizes",
      "Consider a translate-to-English fallback as a stopgap, naming its trade-off (added latency, translation errors) explicitly",
      "Check for mixed-script/Arabizi (Arabic in Latin letters) in real queries - common in the wild, invisible in clean docs",
      "Keep a permanent per-language eval slice going forward so this regression is caught automatically, not fixed once and forgotten"
    ],
    redFlags: [
      "Assuming it's the same bug as English and re-tuning chunk size/top-k",
      "Never checking whether the embedding model was evaluated on Arabic at all",
      "Treating \"documents are indexed correctly\" as proof the model understands them semantically"
    ],
    bonus: [
      "Uses BM25/hybrid search as a strong fallback for morphologically rich languages where dense embeddings underperform",
      "Rules out right-to-left rendering/encoding bugs as a separate, non-ML failure mode",
      "Makes per-language evaluation a standing requirement for any multilingual product, not a one-off audit"
    ],
    followUp: "Swapping to a multilingual embedding model fixes Arabic but drops English recall by 4%. How do you decide between one model and routing by detected language?"
  },
  6: {
    testing: "Breadth of evaluation thinking, not just naming a metric.",
    context: "A warm-up question, but a surprising number of candidates only ever mention accuracy, so it's used to gauge breadth.",
    strong: [
      "Start with task-level quality: correctness against a labeled or LLM-judged eval set specific to the actual use case, not a generic benchmark",
      "Add safety dimensions: hallucination rate, and refusal rate in both directions (over- and under-refusal)",
      "Add robustness: performance on edge cases, adversarial prompts, and out-of-distribution inputs",
      "Add cost as a real product constraint, even though it isn't 'quality' - cost per request/token at target volume",
      "Add consistency: does the same input produce stable outputs across repeated calls",
      "Add user-facing signals: thumbs up/down, regeneration rate, session abandonment - these catch what offline evals miss",
      "Tie every metric back to a business or product outcome, not evaluation for its own sake"
    ],
    redFlags: [
      "Naming only accuracy or BLEU/ROUGE-style metrics",
      "No mention of safety (hallucination, refusal) at all",
      "No mention of connecting evals to real user feedback"
    ],
    bonus: [
      "Distinguishes offline (eval set) from online (production telemetry, A/B) evaluation and says both are needed",
      "Breaks metrics down by segment (language, user type, task type) instead of one aggregate number",
      "Points out that even latency isn't one number - p50 vs. p99, time-to-first-token vs. total"
    ],
    followUp: "You've got 6 metrics you like. Which one becomes the release-blocking gate, and why only one?"
  },
  7: {
    testing: "Pipeline/systems design thinking for evaluation infrastructure, not just listing metrics.",
    context: "The natural follow-up once a team has metrics in mind but no automated way to track them over time.",
    strong: [
      "Start with a versioned, curated eval set per dimension (hallucination, refusal, per-language quality), each with clear labeling criteria",
      "Decide a judge strategy per dimension: rule-based for refusal detection, LLM-as-judge for hallucination/quality, human spot-checks for calibration",
      "Run the eval suite automatically on every model/prompt change (CI-style gate), not just on a schedule",
      "Also run a scheduled slice against live production traffic samples, since offline sets drift from real usage",
      "Store results with full lineage - model version, prompt version, eval-set version - so regressions are traceable",
      "Set per-dimension thresholds and alerts, with a small number of release-blocking gates vs. advisory dashboards",
      "Calibrate the LLM judge periodically against human labels to catch judge drift - often skipped, and it quietly breaks trust in the pipeline",
      "Surface results in a dashboard segmented by dimension/language/task, not one aggregate score"
    ],
    redFlags: [
      "One giant static eval set with no versioning or refresh plan",
      "Fully trusting an LLM judge with no human calibration, ever",
      "No distinction between release-blocking gates and monitoring-only metrics"
    ],
    bonus: [
      "Samples production traffic for human review on a cadence to catch eval-set staleness",
      "Designs a tiered pipeline (fast/cheap gate pre-merge, full suite nightly) given the cost of running the suite itself",
      "Sets per-language sample-size requirements so Arabic quality isn't measured on 10 examples while English gets 1000"
    ],
    followUp: "Your LLM judge and human labelers agree 90% of the time. Is that good enough to trust the judge as the release gate, and what would change your answer?"
  },
  8: {
    testing: "End-to-end systems design for evaluation as a platform, not a single script.",
    context: "This is the \"design the whole thing\" version of the continuous-eval question, asked at senior/staff level to test platform thinking.",
    strong: [
      "Layer the architecture: a versioned eval-data layer, an orchestration/runner layer, a scoring layer (judges), and a reporting/gating layer",
      "Split retrieval eval (recall/precision/MRR on labeled query-doc pairs) from generation eval (faithfulness/correctness) - they need different data and fail independently",
      "Design the scoring layer with a common interface behind multiple judge types (rule-based, LLM-judge, human-in-the-loop)",
      "Support both offline (pre-release, curated sets) and online (production sampling, shadow evals) modes sharing the same scoring layer",
      "Treat cost and latency as first-class metrics in the same pipeline, not bolted on separately, since they gate releases too",
      "Build per-language/per-segment breakdowns in from day one, or multilingual quality quietly gets ignored",
      "Add a regression/lineage store so any score traces back to exact model, prompt, and eval-set versions",
      "Distinguish hard blockers (safety, refusal) from soft/advisory metrics in the gating layer, with clear owners for each",
      "Plan for judge recalibration and eval-set refresh as recurring operational work, not one-time setup"
    ],
    redFlags: [
      "Describing a single monolithic script instead of a layered, versioned system",
      "No separation between retrieval and generation evaluation",
      "Treating cost/latency as out of scope for the eval framework"
    ],
    bonus: [
      "Runs shadow-mode evaluation of a new model against production traffic before any rollout",
      "Designs the framework so a new eval dimension can be added via plugin-style judges without a redesign",
      "Names an explicit ownership model per eval dimension, since an unmaintained framework rots fast"
    ],
    followUp: "A new model version passes every offline gate but user complaints spike after rollout. What's missing from this architecture that would have caught it earlier?"
  },
  9: {
    testing: "Recognizing eval-set staleness/drift as a distinct failure mode from model regression.",
    context: "One of the most common real gaps between offline metrics and production reality, usually caused by user behavior shifting faster than the eval set.",
    strong: [
      "First hypothesis: the eval set no longer represents real user queries, not that the model got worse, since the score is high and stable",
      "Pull a fresh sample of real production queries and compare its distribution to the eval set - look for new topics, new query types, new segments",
      "Check whether the eval set has been \"solved\" by repeated prompt tuning against the same fixed examples - a known static-set failure mode",
      "Cross-reference complaint themes (tickets, thumbs-down, regenerations) against what the eval set actually tests",
      "Refresh the eval set with recent real traffic plus the newly found complaint patterns, retiring or reweighting stale examples",
      "Re-score the model on the refreshed set for a real current baseline - expect it to be lower, that's the point",
      "Set a recurring cadence (e.g. quarterly) to refresh the eval set against live traffic going forward",
      "Report both the old-set and new-set scores to stakeholders to make the staleness visible, rather than quietly swapping it"
    ],
    redFlags: [
      "Immediately assuming a model regression and trying to retrain or roll back",
      "Trusting the 95% number without questioning what it actually measures",
      "Fixing the eval set once with no process to keep it current"
    ],
    bonus: [
      "Names Goodhart's law explicitly - a metric stops being a good measure once it's optimized against directly",
      "Refreshes the eval set stratified by user segment/language, not just recent traffic overall",
      "Keeps a frozen \"golden\" historical slice to track true long-term regressions separately from drift"
    ],
    followUp: "You refresh the eval set and the score drops from 95% to 78%. How do you know that's a better number and not just a harder, less representative set?"
  },
  10: {
    testing: "Judge reliability/calibration methodology, not picking a favorite.",
    context: "This comes up whenever a team compares two judge prompts/models and gets conflicting verdicts with no ground truth to check against.",
    strong: [
      "Don't pick a favorite on gut feel - build a small human-labeled gold set specifically on the disagreement cases",
      "Score both judges against that gold set - whichever tracks human labels better wins on that dimension, not in general",
      "Look at disagreement cases qualitatively - is one judge systematically lenient/harsh, or are they concentrated on genuinely ambiguous edge cases",
      "Check for known judge biases: position bias, length/verbosity bias, self-preference bias toward its own model family",
      "Recognize disagreement isn't inherently a problem - a genuinely ambiguous 20% is information about the eval set's difficulty, not just judge quality",
      "If neither judge tracks humans well, use an ensemble of both with a human tie-break rather than trusting either blindly",
      "Document the chosen judge's known failure modes so downstream teams don't over-trust its score on dimensions it's weak on",
      "Re-run this calibration periodically, since judge behavior can drift with prompt or model version changes"
    ],
    redFlags: [
      "Picking the judge that gives the higher or more favorable score",
      "Assuming disagreement means one judge is simply broken",
      "No human-labeled ground truth used to resolve it at all"
    ],
    bonus: [
      "Names specific known LLM-judge biases (position, verbosity, self-preference) explicitly",
      "Uses a rubric-based judge prompt with explicit criteria instead of open-ended \"rate this 1-10\" to reduce disagreement",
      "Notes that a genuinely ambiguous 20% may mean the task's definition of 'correct' needs clarifying, not a better judge"
    ],
    followUp: "Your gold-set calibration shows Judge A tracks humans better overall, but Judge B is better specifically on refusal cases. What do you ship?"
  },
  11: {
    testing: "Trusting real user signal over a proxy metric, and diagnosing why the proxy diverged.",
    context: "This gap is common when the automated eval set measures something narrower (factual correctness) than what users actually respond to (tone, formatting, confidence).",
    strong: [
      "Start from the premise that the automated metric is a proxy, and proxies can diverge from what they're a proxy for - this isn't a paradox to explain away",
      "Dig into what the automated eval actually measures versus what blind testers are reacting to (tone, formatting, verbosity, confidence)",
      "Check the blind test's own validity first - rater count, instructions, potential bias - before fully trusting it either",
      "Look at the specific examples where the two signals disagree most, that's usually where the real explanation lives",
      "If the divergence is about style/tone and the product cares about that, extend the automated metric rather than distrust the user preference",
      "Recognize the two signals aren't always in conflict - ship what users prefer, and add the missing dimension to the automated eval going forward",
      "Segment the preference data by task type and user type rather than trusting one aggregate number",
      "Default to shipping what users actually prefer in a valid blind test, since it's the closer proxy to the real business outcome"
    ],
    redFlags: [
      "Shipping the model that wins on automated metrics because \"the numbers say so,\" ignoring real user signal",
      "Dismissing the blind test as unreliable without checking its methodology",
      "Never investigating why the two signals diverged at all"
    ],
    bonus: [
      "Names this as a textbook proxy-metric problem (Goodhart's law again) and treats the automated metric as incomplete, not ground truth",
      "Runs a proper online A/B test as the tie-breaker if the blind test's sample size is too small to trust alone",
      "Updates the automated eval rubric with the newly discovered dimension so future comparisons don't need a fresh blind test every time"
    ],
    followUp: "You ship the user-preferred model and add tone/formatting to your automated eval. Three months later the automated eval says a new candidate wins on every dimension including tone. Do you still run a blind test before shipping?"
  },
  12: {
    testing: "Production LLM serving architecture design under real self-hosting, latency, and concurrency constraints.",
    context: "The zero-data-leaving-org constraint rules out hosted APIs entirely - this separates people who've actually run self-hosted inference from people who've only called an API.",
    strong: [
      "Name the constraint first: zero data leaving org rules out any third-party API, this has to run self-hosted on org-controlled A100s, and that decision drives everything else",
      "Use a serving engine built for throughput/concurrency (e.g. vLLM or TensorRT-LLM) instead of a naive transformers loop, specifically for continuous batching and efficient KV-cache memory management",
      "Size the GPU fleet for the model to fit (tensor parallelism across multiple A100s for a 70B model in fp16), then multiply by the replica count the concurrency/TTFT target needs",
      "Use continuous batching so new requests join in-flight batches instead of waiting for a batch boundary - usually the single biggest lever for concurrent-user TTFT",
      "Consider quantization (int8/AWQ/GPTQ) to fit more replicas per GPU budget if it clears the accuracy bar, trading some quality for throughput headroom",
      "Put a request router/load balancer in front of replicas with per-replica queueing visibility, so p99 TTFT is monitored per-replica, not just in aggregate",
      "Cache KV-cache-friendly patterns (shared system prompts) if applicable, to cut prefill cost per request",
      "Load test at 5000 concurrent users to find the actual replica count needed to hit p99<800ms, not theoretical math alone",
      "Keep the whole stack inside the org's network with no external egress, and audit that logging/telemetry isn't a side-channel leak"
    ],
    redFlags: [
      "Suggesting a hosted API despite the explicit no-data-leaving-org constraint",
      "No mention of continuous batching or a real inference engine, just \"put it behind an API\"",
      "Sizing the fleet off theoretical throughput math with no load test"
    ],
    bonus: [
      "Mentions speculative decoding as a TTFT/latency lever where applicable",
      "Distinguishes the prefill-dominated TTFT from total generation latency explicitly",
      "Names autoscaler lag as a real risk against a hard p99 SLA - cold replicas don't help in the moment"
    ],
    followUp: "Your p99 is 750ms at normal load but spikes to 2s during a traffic burst. What's your first move: scale out, or something else?"
  },
  13: {
    testing: "Single-GPU inference optimization under a hard memory and latency budget, edge-specific trade-offs.",
    context: "A single consumer GPU with 24GB VRAM is a real constraint most cloud-first engineers haven't had to work within.",
    strong: [
      "Name the constraint: a 4090 has 24GB VRAM, a 13B model in fp16 already needs ~26GB just for weights, so quantization is required to fit at all, not optional",
      "Quantize the base model (4-bit AWQ/GPTQ/bitsandbytes) and keep the LoRA adapter at higher precision on top - the standard pattern for fitting under budget without gutting quality",
      "Use a serving engine with efficient LoRA support on quantized base weights (e.g. vLLM's LoRA support) instead of a naive merge-and-reload per request",
      "Use continuous batching / KV-cache reuse if serving multiple requests, and avoid redundant recomputation even on a single-stream server",
      "Check whether all 1000 tokens need to be generated live, or if streaming meets the 'user-perceived' 500ms bar even if full generation takes longer - very different targets",
      "Consider speculative decoding with a small draft model if the budget is genuinely full-generation, not perceived latency",
      "Profile the prefill/decode split for this specific workload and tune batch size/context limits to the actual request pattern, not the theoretical max",
      "Benchmark actual tokens/sec on the target hardware before promising a number - consumer GPU thermal/power behavior differs from datacenter A100s"
    ],
    redFlags: [
      "Proposing fp16/fp32 serving on a single 4090 without addressing the memory math",
      "No mention of quantization given the explicit hardware constraint",
      "Not distinguishing streaming/perceived latency from full-generation latency against the 500ms target"
    ],
    bonus: [
      "Names merging LoRA into the base model as one option and states its trade-off (faster, but loses adapter hot-swap)",
      "Mentions flash-attention-style kernels for memory-efficient attention on consumer hardware",
      "Points out an 'edge server' implies no autoscaling, so concurrent-load headroom needs its own test, not just single-request latency"
    ],
    followUp: "Your median hits 480ms but a fraction of long-context requests blow past 500ms. Do you cap max context length, or something else?"
  },
  14: {
    testing: "Cost forensics discipline, not taking a vendor's framing at face value.",
    context: "This happens constantly with API-based models when a 'minor version bump' quietly changes pricing tier, default token limits, or verbosity.",
    strong: [
      "Don't trust \"minor\" at face value - pull the actual billing breakdown: is the 3x from per-token price, token volume, or request volume",
      "Check if the new model version is simply more verbose by default, since longer completions multiply cost per request even at the same price per token",
      "Check if pricing tiers changed - a 'minor' model bump sometimes moves the account into a different price bracket entirely",
      "Check for retry/fallback logic silently multiplying requests, if the new model has a different error rate",
      "Compare input/output token ratios before and after - a longer default system prompt from the vendor is easy to miss",
      "Once the actual driver is identified, pull the matching lever: cap max output tokens, trim prompt/context size, or downgrade the model for parts of the workload that don't need the upgrade",
      "Consider routing by request complexity (cheap model for simple queries, expensive model only where needed) instead of a blanket upgrade",
      "Put a cost-per-request dashboard in place so the next \"minor\" upgrade doesn't silently 3x spend before anyone notices"
    ],
    redFlags: [
      "Accepting \"minor upgrade, no accuracy change\" from the vendor without independently verifying via billing data",
      "Jumping straight to \"negotiate a discount\" without knowing what's driving the 3x",
      "Not distinguishing price-per-token changes from volume/verbosity changes"
    ],
    bonus: [
      "Sets up standing cost-per-request alerting, not just a post-hoc investigation",
      "Verifies the vendor's \"no accuracy gain\" claim against an internal eval set instead of taking it as given",
      "Proposes model routing/cascading (cheap model first, escalate on low confidence) as the long-term fix, not just reverting"
    ],
    followUp: "You find the new model is 40% more verbose per response and that's most of the 3x. Capping max_tokens hard-truncates some answers mid-sentence. What's your actual fix?"
  },
  15: {
    testing: "Distinguishing a compute-bound bottleneck from an orchestration/scheduling-bound one.",
    context: "Low GPU utilization with a queue is the single most common \"it's not actually a GPU problem\" trap in LLM serving.",
    strong: [
      "Low utilization plus queuing means the GPU isn't the bottleneck - something upstream or in scheduling is, don't add GPUs yet",
      "Check batching configuration - if requests aren't being batched or the batch size/timeout is misconfigured, the GPU sits idle between near-sequential requests",
      "Check for a CPU-bound preprocessing step or a synchronous network call (auth, logging, retrieval) sitting in the critical path before the GPU is even invoked",
      "Check the router/queue configuration - a too-conservative max-in-flight setting can throttle far below what the GPU could actually handle",
      "Check for memory fragmentation or KV-cache allocation limits capping effective concurrency well below GPU compute capacity",
      "Check for lock contention or a single-threaded bottleneck in the serving framework itself (e.g. a naive server without proper async handling)",
      "Fix the actual bottleneck (batching config, async I/O, queue depth) rather than scaling GPU count, which won't help a non-GPU bottleneck",
      "Re-measure utilization and queue depth after each change to confirm which fix actually moved the needle"
    ],
    redFlags: [
      "Concluding \"we need more GPUs\" from a low-utilization symptom",
      "Not checking batching/scheduling configuration at all",
      "No mention of anything upstream of the GPU call (network, preprocessing, queueing)"
    ],
    bonus: [
      "Names continuous batching specifically as the fix if static/naive batching is the root cause",
      "Distinguishes prefill-bound from decode-bound stalls, since they respond to different fixes",
      "Notes that autoscaling on GPU utilization alone would be actively wrong here, since it wouldn't trigger despite real queuing"
    ],
    followUp: "You fix batching and GPU utilization climbs to 85%, but p99 latency barely improves. What do you check next?"
  },
  16: {
    testing: "Real-time feature engineering and low-latency serving architecture design.",
    context: "A classic real-time feature store design question - the tight latency bar and sensitive-entity framing push toward government/fintech-grade requirements.",
    strong: [
      "Split into two paths: a streaming path maintaining rolling aggregates (1/5/30 min windows), and a serving path that just reads precomputed values - never compute aggregates at request time",
      "Use a stream processor (e.g. Flink/Kafka Streams) to maintain windowed aggregates per citizen ID incrementally as events arrive, updating a fast key-value store",
      "Serve from an in-memory or purpose-built low-latency KV store (e.g. Redis) keyed by citizen ID - disk-backed lookups won't consistently hit 10ms at scale",
      "Precompute and materialize the windows continuously - request-time aggregation over raw events cannot hit a 10ms bar",
      "Define acceptable staleness explicitly (e.g. sub-second lag) between an event happening and it reflecting in the 1-minute window",
      "Keep training-serving consistency in mind - the offline feature computation for model training must match the online path exactly, or the model sees train/serve skew",
      "Partition/shard the KV store by citizen ID to keep lookups fast and avoid hot-key contention for high-activity accounts",
      "Add a fallback for missing recent activity (treat as zero, not an error) so a cold or delayed citizen ID doesn't break the fraud check",
      "Given the sensitive-entity framing, build access controls and audit logging into the store itself, not bolted on separately"
    ],
    redFlags: [
      "Computing windowed aggregates at request time by querying raw event logs, which cannot hit 10ms at this scale",
      "No mention of the training-serving consistency problem",
      "Using a general-purpose relational database as the hot-path store without addressing latency"
    ],
    bonus: [
      "Names sliding window counters or approximate structures (HyperLogLog, count-min-sketch) if exact counts aren't required",
      "Treats backpressure/lag monitoring on the stream processor as an operational requirement, not a design footnote",
      "Notes that a hybrid batch+stream approach might be more efficient specifically for the 30-minute window"
    ],
    followUp: "The stream processor falls behind during a traffic spike and the 1-minute window is now 90 seconds stale. Does the fraud model still trust it, and what's your circuit breaker?"
  },
  17: {
    testing: "Distinguishing benchmark improvement from real-world regression - the classic overfit-to-eval trap.",
    context: "The fine-tuning version of the eval-gap problem: the eval set improved, but it didn't represent the full production distribution.",
    strong: [
      "Start from the premise that the eval set and production traffic aren't the same distribution - an 8% eval gain with 2x complaints means the fine-tune helped what the eval measures and hurt something it doesn't",
      "Pull actual complaint examples and categorize them (tone, factuality, format, refusal, something new) rather than treating \"complaints doubled\" as one signal",
      "Compare fine-tuned vs. base model outputs on the complaint-triggering examples specifically, to see exactly where behavior diverged",
      "Check for narrow overfitting - did the fine-tuning data oversample a style/task the eval set also emphasizes, at the cost of general capability",
      "Check the fine-tuning data itself for mislabeled examples, narrow domain coverage, or a tone/format shift eval didn't penalize but users notice",
      "Run the fine-tuned model against a broader, production-representative eval slice, not just the original benchmark, to see if the 8% gain holds up",
      "If the regression is real and broad, consider a lower LoRA rank/scale or blending base and fine-tuned behavior, rather than an all-or-nothing revert",
      "Add the newly discovered complaint patterns back into both training data and the eval set so this specific gap doesn't recur"
    ],
    redFlags: [
      "Trusting the 8% eval number as proof the fine-tune is strictly better, with no further investigation",
      "Not pulling actual production complaint examples before forming a hypothesis",
      "Rolling back entirely without first understanding what specifically broke"
    ],
    bonus: [
      "Names this as a textbook train/eval distribution mismatch and audits eval-set overlap with fine-tune data emphasis directly",
      "Treats LoRA rank/scale as a lever, not just retrain-or-revert as the only two options",
      "Runs a proper online A/B rather than deciding off raw complaint volume, which isn't normalized against traffic mix"
    ],
    followUp: "You find the fine-tune improved technical accuracy but users now find it 'colder' in tone. Is that a bug or a trade-off, and how do you decide?"
  },
  18: {
    testing: "Matching a solution to data volume and time constraints instead of defaulting to fine-tuning.",
    context: "A common early-career mistake is reaching for fine-tuning first - this checks whether the candidate reasons from constraints.",
    strong: [
      "Start with the constraint: 500 examples is thin for fine-tuning a new capability from scratch, but reasonable for few-shot prompting or as an eval set",
      "Default to prompt engineering (few-shot from the 500) plus RAG if the task is knowledge-lookup-shaped, since both can ship inside 2 weeks with minimal infra",
      "Reach for fine-tuning specifically when the task is about behavior/style/format the base model can't be prompted into reliably, not new knowledge - and even then, prefer LoRA over full fine-tune given the timeline",
      "Use the 500 examples as an eval set first regardless of approach, to actually measure whether prompt/RAG alone clears the bar before investing further",
      "What changes the answer: if the task needs new factual knowledge, prioritize RAG; if it needs a very specific structured output or domain jargon the model won't follow from a prompt, lean toward fine-tuning even with 500 examples, since style transfer needs less data than knowledge injection",
      "Also reconsider if latency/cost rules out RAG's retrieval step, or the domain has no retrievable corpus at all, which pushes toward fine-tuning being the only real option",
      "Plan an eval pass in week 1 so there's still time to pivot approach if the initial choice underperforms, don't discover this in week 2"
    ],
    redFlags: [
      "Defaulting to fine-tuning without asking what the task actually needs (knowledge vs. behavior)",
      "Treating 500 examples as obviously enough or not enough without connecting it to the specific approach",
      "No mention of using the same 500 examples as an eval set regardless of approach"
    ],
    bonus: [
      "Notes RAG and fine-tuning aren't mutually exclusive - a lightweight style fine-tune on top of RAG-retrieved context is a real hybrid pattern",
      "Names the specific failure mode fine-tuning fixes that prompting doesn't (consistent output format, tone) vs. what RAG is good at (fresh/large factual corpora)",
      "Weighs time-to-first-result - prompt/RAG give a testable result in days, fine-tuning eats into 2 weeks fast with data prep and training cycles"
    ],
    followUp: "You ship with RAG in week 1 and it's 70% accurate on the eval set. You have one week left. Do you invest it in better retrieval or start a fine-tune?"
  },
  19: {
    testing: "Awareness of catastrophic forgetting as a specific, testable risk in fine-tuning workflows.",
    context: "The risk that bites teams who eval only on the new task and never re-check the model's prior general capabilities before shipping.",
    strong: [
      "Detecting it before ship requires a held-out general-capability eval suite, not just the new task's eval set, run as a standing step in the fine-tuning pipeline",
      "Include a regression suite covering the model's previously-relied-on capabilities (general reasoning, other tasks, instruction-following), run automatically before every fine-tune is approved",
      "Compare fine-tuned vs. base model side by side on that regression suite, not just checking the fine-tuned model alone against a pass/fail bar",
      "If forgetting is detected, first check hyperparameters - too high a learning rate or too many epochs on a narrow dataset is the most common direct cause",
      "Consider LoRA/adapter-based fine-tuning instead of full fine-tuning if not already using it, since it modifies far fewer parameters and typically forgets less",
      "Mix a small amount of general-purpose/instruction data into the fine-tuning set (replay/rehearsal) to preserve prior capability alongside the new one",
      "Lower the LoRA rank or the effective learning rate/epochs and re-run the regression suite, iterating until the new-task gain no longer costs general capability",
      "Keep the regression suite as a permanent gate for all future fine-tunes, not a one-time check"
    ],
    redFlags: [
      "Only evaluating the fine-tuned model on the new task's eval set, never checking prior capabilities at all",
      "Treating catastrophic forgetting as something discovered from user complaints after shipping rather than tested for before",
      "Fixing it by lowering the new-task performance target instead of addressing the training setup"
    ],
    bonus: [
      "Names replay/rehearsal and elastic weight consolidation as specific mitigation techniques",
      "Notes full fine-tuning is inherently higher-risk for forgetting than parameter-efficient methods, a reason to default to LoRA",
      "Treats capability regression suites like code regression tests - versioned and run in CI, not ad hoc"
    ],
    followUp: "Adding rehearsal data recovers most of the lost capability but costs 2 points on the new task's eval. Do you ship, and how do you decide where that line is?"
  },
  20: {
    testing: "Building a robust ingestion/validation layer, not just a parser that works today.",
    context: "The standard \"garbage in, garbage out\" scenario for any pipeline ingesting external, uncontrolled data on a recurring schedule.",
    strong: [
      "Treat the ingestion boundary as untrusted by default - build explicit schema validation at the point of ingestion, don't trust the CSV structure",
      "Decouple column mapping from the raw file with a configurable alias layer, so a weekly rename doesn't silently break the parser or misalign columns",
      "Normalize date formats explicitly against a small, tested set of expected formats and fail loudly on anything outside that set",
      "Define null-handling rules per field (required vs. optional, default vs. reject-the-row), not one blanket rule for the whole file",
      "Handle transliteration inconsistency with a normalization/fuzzy-dedup step rather than treating each variant as a different entity downstream",
      "Add a data-quality gate before the file reaches the model pipeline - row-count checks, null-rate thresholds, schema diff alerts - and quarantine any file that fails rather than processing and hoping",
      "Log and alert on every anomaly same-day, not a month later when the model's behavior has already degraded",
      "Keep a versioned record of each day's file (schema, stats) so downstream failures trace back to a specific ingestion, not guesswork"
    ],
    redFlags: [
      "Writing a parser hardcoded to today's column names/date formats with no validation layer",
      "Silently coercing bad dates/nulls to a default with no logging or alerting",
      "No quarantine/fail-loud mechanism - bad data flows straight into the model pipeline"
    ],
    bonus: [
      "Uses a schema/contract validation tool (e.g. Great Expectations, Pandera) instead of hand-rolled checks",
      "Treats transliteration inconsistency as an entity-resolution problem needing a dedicated matching step, not just string normalization",
      "Designs a circuit breaker - a failed quality gate skips that day's update and alerts, rather than pushing corrupted data forward"
    ],
    followUp: "The upstream org renames a critical column with no alias, and the whole file gets quarantined for three days straight. What's your fallback so the model doesn't run on three-day-stale data silently?"
  },
  21: {
    testing: "Methodical root-cause investigation across data, pipeline, and environment, not jumping straight to retrain.",
    context: "\"No code changes\" is the tell - the answer almost always lives in data or environment drift, not a logic bug.",
    strong: [
      "Compare last month's input distribution to training/validation, checking for feature drift, label shift, or a new data source silently mixed in",
      "Check for a labeling process change - did the ground-truth labeling pipeline, vendor, or criteria change even though the model code didn't",
      "Check upstream pipeline changes - a schema, join, or feature computation change even though \"the model code\" specifically didn't move",
      "Check for a silent dependency/environment change - library version bumps, a feature store returning stale or differently-computed values",
      "Segment the F1 drop by class/segment rather than looking at the aggregate number alone",
      "Check for seasonality or a genuine real-world distribution shift, which isn't a bug at all but still needs a response",
      "Reproduce the drop on a frozen historical dataset with the current model to rule out a serving/inference bug vs. a genuine data-driven regression",
      "Fix at the layer where the cause actually occurred, and add a monitor for that specific signal going forward"
    ],
    redFlags: [
      "Jumping straight to retraining without investigating whether it's a data/pipeline problem first",
      "Only looking at the aggregate F1 number, never segmenting by class or cohort",
      "Ignoring the \"no code changes\" clue and assuming a logic bug must exist somewhere anyway"
    ],
    bonus: [
      "Uses specific drift-detection techniques (population stability index, KL divergence on feature distributions) instead of eyeballing distributions",
      "Checks for training-serving skew specifically - features computed at serving time silently diverging from training-time computation",
      "Checks a labeling process change before data drift, since it's invisible in feature monitoring but directly changes the metric"
    ],
    followUp: "You find the drop is concentrated entirely in one customer segment that grew 3x in volume last month. Is this a model problem at all, and what do you actually fix?"
  },
  22: {
    testing: "Operational debugging of a flaky pipeline, distinguishing systemic causes from intermittent ones.",
    context: "A 40% intermittent failure rate with no code changes usually points to resource contention, timing, or upstream flakiness, not a logic bug.",
    strong: [
      "Pull failure logs across multiple recent runs first - is it the same task failing every time, or does it vary - that distinguishes a systemic bug from flakiness",
      "Check for resource contention - is this DAG competing for cluster resources with other jobs at the same nightly window, causing OOM or timeouts",
      "Check upstream data dependencies - is the DAG occasionally starting before an upstream source finishes landing, a race condition common when an upstream SLA shifted",
      "Check for external service flakiness - API rate limits, connection pool exhaustion, or a network timeout to a dependency outside the DAG's own code",
      "Check Airflow-specific causes - worker/executor capacity, overly aggressive retry/timeout config, or scheduler-level issues (stale state, zombie tasks)",
      "Correlate failure timestamps against infra metrics (cluster load, other jobs' schedules) rather than guessing at the contention window",
      "Fix at the right layer - explicit upstream sensors instead of time-based scheduling for race conditions, backoff retries for transient failures, or resource isolation for contention",
      "Add alerting on failure patterns, not just failure count, so a 40% intermittent rate gets triaged faster than \"someone notices in standup\""
    ],
    redFlags: [
      "Assuming a code bug must exist despite \"no code changes,\" and combing through DAG code before logs/infra",
      "Not checking for resource contention or scheduling/timing races at all",
      "Treating \"add a retry\" as the fix without ever finding the actual root cause"
    ],
    bonus: [
      "Checks whether the DAG's schedule now overlaps with a recent change to another team's workload on the shared cluster",
      "Names Airflow-specific concepts precisely (sensors vs. time-based triggers, executor pool sizing, task-level SLAs)",
      "Builds a lightweight postmortem/runbook so the next on-call doesn't re-derive the same investigation from scratch"
    ],
    followUp: "You find it's resource contention with another team's nightly job scheduled into the same window last month. Do you fix your DAG, or is this someone else's problem to fix?"
  },
  23: {
    testing: "Distinguishing a stateful/environmental degradation from a model-weights problem.",
    context: "\"Recovers with the same weights\" is the critical clue - if the exact same artifact works again after redeploy, the weights aren't the problem.",
    strong: [
      "Name the clue explicitly - the same weights working again after redeploy rules out the model itself, this must be state accumulating in the running process over the week",
      "Hypothesize a memory/resource leak or cache growth that degrades performance over days and resets on redeploy",
      "Hypothesize a stateful cache or connection going stale over time (a connection pool degrading, a local cache not refreshing) that a fresh process wouldn't have",
      "Hypothesize numerical drift in a stateful component (a running average, adaptive threshold, or embedding cache) that quietly drifts and resets on redeploy",
      "Hypothesize infra-level causes - a load balancer routing an increasing share of traffic to a degraded replica over the week, or GPU memory fragmentation building up over long uptimes",
      "Instrument the running process over its lifetime - memory usage, cache hit rates, prediction distribution - to catch the drift in progress rather than only before/after snapshots",
      "Test the stateful-cache hypothesis directly by clearing just that cache/connection mid-week without a full redeploy - if performance recovers, that isolates the component",
      "Fix the actual stateful component (add TTLs/refresh logic, fix the leak) rather than treating weekly redeploys as an acceptable permanent fix"
    ],
    redFlags: [
      "Treating this as a model/weights problem and considering retraining, despite the clue that rules it out",
      "Suggesting \"just redeploy weekly\" as the actual fix instead of finding the root cause",
      "Not instrumenting the running process over time, only comparing before/after snapshots"
    ],
    bonus: [
      "Names specific real-world stateful culprits (connection pool exhaustion, GPU memory fragmentation from long uptimes, stale embedding caches)",
      "Notes staging never runs long enough at real traffic to reproduce this, and proposes a longer-running soak test",
      "Proposes a canary/soak-test process specifically designed to catch time-dependent degradation before full production"
    ],
    followUp: "You isolate it to a feature cache with no TTL that starts serving stale features after about a week. What's the actual fix, and how do you make sure this class of bug doesn't happen again in a different cache somewhere else?"
  },
  24: {
    testing: "Designing verifiable, auditable data governance, not just \"we have a PII scrubber.\"",
    context: "The bar here isn't \"we detect PII,\" it's \"prove it,\" which means the design has to produce evidence, not just intent.",
    strong: [
      "Design PII detection and tokenization as a mandatory gate at ingestion into the data lake, before data is available to any downstream consumer including training jobs",
      "Use layered detection: pattern/regex for structured PII (IDs, phone numbers), NER models for unstructured PII (names, addresses in free text) - neither alone is sufficient",
      "Tokenize detected PII with a reversible mapping stored in a separate, access-controlled vault, so the data lake itself never holds raw PII even before tokenization",
      "Architecturally separate a raw zone (PII present, tightly access-controlled, short retention) from a training zone (tokenized only), so training jobs are physically incapable of reading raw data, not just told not to",
      "Instrument the boundary - every promotion from raw to training zone runs the PII gate and logs a pass/fail result, this is the actual audit trail",
      "Run periodic automated re-scans of the training zone as an ongoing control, not a one-time launch check, to catch detector drift or new PII patterns",
      "Maintain immutable logs of every training job's data access so an auditor can trace any run back to proof it only touched the tokenized zone",
      "Measure the detector's own accuracy (recall on a labeled PII test set) since running a detector isn't proof it works, its measured accuracy is",
      "Present the auditor the combination: architecture + gate logs + re-scan results + detector accuracy - that combination is what constitutes proof"
    ],
    redFlags: [
      "Relying on a single PII-scrubbing step \"before training\" with no architectural separation enforcing it",
      "Treating \"we ran a PII detector\" as sufficient proof with no accuracy measurement or audit trail",
      "No physically/access-separated raw zone vs. training zone"
    ],
    bonus: [
      "Notes regex-only detection has known high false-negative rates on unstructured PII and needs pairing with NER",
      "Uses data lineage tooling to make the raw-to-training promotion trail queryable/provable programmatically",
      "Ties this design to deletion-request evidence too, since PII governance and right-to-deletion overlap in the raw zone"
    ],
    followUp: "The PII detector has 98% recall. What do you do about the 2% that gets through, and how does that show up in what you tell the auditor?"
  },
  25: {
    testing: "Designing for long-horizon data lineage and compliance from the start, not retrofitting it later.",
    context: "This only works if the system was built to answer it from day one - most teams discover they can't answer it only when a regulator asks.",
    strong: [
      "Design the training pipeline to record its own provenance as a first-class output - immutable, versioned lineage captured at training time, not reconstructed after the fact",
      "At every training run, log the exact dataset version/hash used, the access-approval record tied to that dataset version, and a pointer to the model artifact produced",
      "Version datasets immutably (content-addressed storage or a dataset versioning tool) so \"the dataset used 14 months ago\" is a retrievable, exact artifact",
      "Tie access approvals to a formal access-request system with its own audit log, cross-referenced by dataset version at training time, not just at initial grant",
      "Maintain a separate deletion-request ledger with timestamps, cross-referenced against every historical dataset version to determine if a since-deleted record was present in that run",
      "Name the hard case explicitly - a record deleted after training means the model may have already learned from it, and this needs a documented policy, not \"we can't undo training\"",
      "Retain all lineage metadata longer than the models it describes, since the metadata is what answers the audit",
      "Present the auditor the specific chain for that run: dataset hash to access-approval to deletion-ledger cross-check to model artifact, each step independently verifiable"
    ],
    redFlags: [
      "Assuming this can be answered after the fact from application logs or memory instead of designing for it up front",
      "No distinction between raw-data-lake access and approval to use a specific dataset in a specific training run",
      "Not addressing the case where a record has since been deletion-requested"
    ],
    bonus: [
      "Names specific dataset versioning approaches (content-addressed hashes, DVC, lakeFS) rather than vague version-keeping",
      "Links model artifacts to their exact training dataset version, not just a training script/config",
      "Names the unresolved question honestly - a post-training deletion request needs a policy decision (retrain vs. documented risk), not a pretend automatic fix"
    ],
    followUp: "A citizen's deletion request predates this specific model by two months, but the training pipeline shows their record was still present in the dataset snapshot used. What's the actual remediation, and who signs off on it?"
  },
  26: {
    testing: "Designing complete request-level observability/logging for LLM systems with compliance in mind.",
    context: "The LLM-specific version of explainability-on-demand - most teams log enough to debug this week's incident but not enough to reconstruct a specific decision 6 months later.",
    strong: [
      "Log everything that determined the output at generation time: the exact final prompt after templating, the retrieved context/documents with their versions, the model version/checkpoint, and any active system-prompt/config version",
      "Use immutable, tamper-evident storage with a retention policy that explicitly covers the compliance window, since logs rotated out at 30/90 days can't answer this at all",
      "Version everything that could have varied - the retrieval corpus/index version (documents get updated), the prompt template version, the model version",
      "Tie every logged request to a stable request ID a compliance team can look up, and make sure that ID is available to the case at decision time",
      "Log the decision output alongside any post-processing/guardrail steps applied, since \"the model's decision\" often isn't just the raw generation",
      "Apply access controls appropriate to log sensitivity while keeping them retrievable for a legitimate compliance request",
      "Test the reconstruction process periodically - pull a random request from 3+ months ago and rebuild exactly what happened - rather than assume the design works until a regulator actually asks",
      "Build this as infrastructure-level middleware around every model call, not something each feature team remembers to add individually"
    ],
    redFlags: [
      "Logging only the final user-facing answer, not the exact prompt/retrieved context/model version",
      "Assuming 30-90 day retention is sufficient without checking it against the actual compliance requirement",
      "No versioning of the retrieval corpus, so context from 6 months ago can't be distinguished from the corpus today"
    ],
    bonus: [
      "Names retrieval corpus versioning as the detail most teams miss, since documents change and \"we log the query\" isn't enough",
      "Builds this as a platform-level logging middleware/gateway all model calls go through, not per-team opt-in",
      "Runs periodic reconstruction drills to actually verify the logging design works"
    ],
    followUp: "You reconstruct the exact prompt and context from 6 months ago, but the model version used has since been deprecated and is no longer deployable. Can you still answer the regulator, and what do you need to have kept to do it?"
  },
  27: {
    testing: "Systematic multi-agent debugging - isolating compounding error from an interface failure.",
    context: "A drop from 90% to 60% across a 3-agent chain is roughly what independent per-step error compounding predicts - the first job is checking if that's all that's happening.",
    strong: [
      "Do the math first: three agents at 90% each, if errors were fully independent, chained accuracy would be roughly 0.9^3 ≈ 73%, check that baseline before assuming something is uniquely broken",
      "If the observed 60% is meaningfully below the independent-compounding estimate, that gap points to an interface/handoff problem, not each agent's individual capability",
      "Test each agent in isolation but fed realistic upstream-agent outputs, not clean hand-crafted inputs - 90% on curated inputs can look very different on another agent's real output",
      "Log and inspect the exact handoff payload at each stage - format mismatches, lost context, or ambiguous instructions between agents that neither agent alone would surface as \"its\" failure",
      "Check for error propagation without recovery - does agent 2 detect that agent 1's output was bad, or does it blindly proceed and compound the error",
      "Break failures down by which stage they first appeared at, which tells you whether to fix an agent or fix the interface",
      "Add a lightweight verification/critique step between agents, even a simple schema/sanity check, instead of assuming every agent's raw output is safe to hand off",
      "Report the isolated failure rate by stage and by cause (capability vs. handoff) so the fix targets the actual bottleneck"
    ],
    redFlags: [
      "Treating the 90% to 60% drop as inherently mysterious without checking what pure compounding would predict",
      "Only testing each agent on clean, hand-crafted inputs instead of realistic upstream outputs",
      "No mention of inspecting the actual handoff/interface data between agents"
    ],
    bonus: [
      "Uses the compounding-error math explicitly as the null hypothesis to test against",
      "Adds an explicit verification/self-check step at each handoff as a general pattern, not a one-off fix",
      "Turns this diagnostic into a standing eval harness for any future multi-agent chain"
    ],
    followUp: "You find agent 2's failure rate roughly matches the compounding-math prediction, but agent 3's failure rate is way higher than expected on agent 2's real outputs specifically. What does that isolate, and what do you check next?"
  },
  28: {
    testing: "Designing proportional, layered safety controls instead of over-restricting or under-restricting.",
    context: "Tests whether a candidate reaches for a blunt \"lock it down\" instinct or designs guardrails matched to the risk of each action.",
    strong: [
      "Classify the agent's tools/actions by risk and reversibility (read-only lookup vs. sending an email vs. deleting data vs. spending money) - the right guardrail differs per class, a blanket restriction either overblocks or underblocks",
      "Add explicit scope constraints at the tool-execution layer, not just the prompt/instructions layer, since prompt-level rules aren't a reliable boundary against edge-case or adversarial inputs",
      "Require human-in-the-loop confirmation specifically for high-risk/irreversible actions, while letting low-risk actions proceed autonomously - this is what preserves usefulness instead of gating everything",
      "Add input/output validation around tool calls - constrain what parameters an action can be called with (e.g. an email tool restricted to an allowlist) so an edge-case prompt can't smuggle an unintended action through a legitimate tool",
      "Log every tool call with its triggering context so out-of-scope actions are caught and reviewable even when they do get through - a detection layer, not just prevention",
      "Test specifically against edge-case and adversarial (prompt injection style) inputs as a standing part of the eval suite, not just happy-path task completion",
      "Add a kill switch/circuit breaker - if the agent's action pattern starts deviating from expected (a spike in a particular action, an unusual sequence), automatically pause and escalate",
      "Iterate the risk classification and guardrails based on real edge cases found, rather than treating this as a one-time design"
    ],
    redFlags: [
      "Trying to solve this purely with a stricter system prompt, with no enforcement at the tool-execution layer",
      "Applying the same restriction level to every tool regardless of risk",
      "No detection/logging layer, relying entirely on prevention working perfectly"
    ],
    bonus: [
      "Names prompt injection specifically as the mechanism by which edge-case inputs cause scope violations, and treats it as a security problem",
      "Frames risk-tiered guardrails (autonomous for low-risk, confirmation for high-risk) as what actually preserves usefulness vs. a uniform lockdown",
      "Builds adversarial/red-team cases into the agent's eval suite as a permanent category, not a one-time audit"
    ],
    followUp: "Your risk classification puts 'send a Slack message' in the low-risk autonomous tier, but an edge-case input gets the agent to send an internal message with leaked customer data in it. Was that the wrong tier, or a different kind of guardrail failure?"
  },
  29: {
    testing: "Basic cost forensics - matching cost growth to usage growth before assuming waste.",
    context: "A warm-up cost question, but candidates who skip straight to \"cache more\" without breaking down the bill miss the diagnosis step.",
    strong: [
      "Start with the mismatch: 4x cost against 1.3x users means cost-per-user roughly tripled, so the driver isn't user growth, it's a usage pattern or pricing shift",
      "Break the bill down by model, endpoint/feature, and token type (input vs. output), since a single dominant driver is far more common than uniform growth everywhere",
      "Check for a model-mix shift - did a feature quietly start calling a more expensive model, or did requests-per-user go up",
      "Check for prompt/context growth - accumulated conversation history, larger retrieved context, or a verbose system prompt, since input tokens are often the sneaky driver",
      "Check for retry/error-driven waste - a bug causing repeated retries or duplicate calls can multiply cost without showing up as \"more features\" anywhere",
      "Check for missing caching on repeated/duplicate queries if the product has any query overlap across users",
      "Apply the matching fix once the driver is isolated - trim context, cache repeats, route simple requests to a cheaper model, or fix the retry bug - don't apply a generic fix before knowing which one it is",
      "Put per-feature cost dashboards in place so the next unexpected jump is caught inside the month, not at quarter's end"
    ],
    redFlags: [
      "Jumping straight to \"add caching\" or \"use a cheaper model everywhere\" without first breaking down where the cost went",
      "Assuming the 4x is proportional to hidden usage growth without checking cost-per-user directly",
      "Not distinguishing input vs. output token costs or model-mix shifts as separate possible drivers"
    ],
    bonus: [
      "Proposes request-level cost attribution (tagging every API call by feature/endpoint) as the actual infrastructure needed to answer this quickly next time",
      "Names model routing/cascading as the durable fix rather than a one-time cost cut",
      "States the cost-per-user math explicitly as the first diagnostic fact instead of treating the headline numbers as the whole story"
    ],
    followUp: "You find the driver is a feature where conversation history is appended to every call uncapped, so power users' prompts have quietly grown to 10x their original size. What's your fix, and does it change the product experience?"
  },
  30: {
    testing: "Prioritization judgment under a hard constraint, not just naming all three levers.",
    context: "A 10x traffic increase on a flat budget can't be solved by \"do all three equally\" - this tests whether the candidate can prioritize and justify the order.",
    strong: [
      "Size the gap first: at current cost-per-request, 10x traffic on the same budget requires roughly a 90% cost-per-request reduction - name that number, since it reframes the problem entirely",
      "Attack usage patterns first, usually the cheapest lever - check caching opportunities, redundant/duplicate calls, and whether every request needs the most expensive model tier",
      "Attack model choice second - evaluate whether a smaller/cheaper/quantized model meets the quality bar for most traffic, reserving the expensive model for requests that genuinely need it (a cascading/routing pattern)",
      "Attack infra last, not because it doesn't matter, but because infra optimization typically yields smaller percentage gains than fixing usage waste or model mix, and takes longer to implement safely",
      "Justify the ordering explicitly - usage/model changes ship faster and impact more per engineering-hour than infra re-architecture, even though infra work will likely still be needed to close the gap",
      "Revisit infra once the biggest levers are pulled - continuous batching, better hardware utilization, autoscaling efficiency, quantization/compilation",
      "Set a hard mid-quarter checkpoint against the target and be willing to make harder trade-offs (feature cuts, tighter rate limits) if the levers alone don't close the gap in time",
      "Frame the answer as a sequenced plan with an estimated impact per lever, not just a list of three options"
    ],
    redFlags: [
      "Listing all three (model, infra, usage) with no stated priority or reasoning for the order",
      "Not doing the math on what percentage cost reduction 10x traffic on flat budget actually requires",
      "Jumping to infra scaling first, usually the slowest and least cost-efficient lever relative to usage/model fixes"
    ],
    bonus: [
      "States the required cost-per-request reduction as a concrete number and uses it to argue the ordering",
      "Names model routing/cascading as often the single highest-leverage lever at scale",
      "Names an explicit fallback if levers don't fully close the gap - product trade-offs like rate limiting, not silently blowing the budget"
    ],
    followUp: "You've pulled usage and model levers and you're at 6x more efficient, still short of the 10x/flat-budget bar. What's the actual conversation with leadership at that point?"
  },
  31: {
    testing: "Lambda/kappa-style streaming architecture design balancing low-latency and durable-storage requirements.",
    context: "A classic dual-requirement streaming architecture question - real-time alerting and full-history retraining have genuinely different infra needs.",
    strong: [
      "Recognize the two requirements need different paths - a hot/streaming path for sub-5s alerting, and a cold/durable path for complete, queryable history - serving both from one system compromises both",
      "Ingest through a durable, high-throughput event bus (e.g. Kafka/Kinesis) at the front, since 10,000 events/sec needs sustained high-throughput write, and this bus becomes the single source of truth both paths read from",
      "Hot path: a stream processor (e.g. Flink) consuming from the bus with lightweight alerting logic and a tight latency budget, writing alerts to a low-latency serving layer, and explicitly avoiding heavy joins or uncached lookups that risk blowing the 5s budget",
      "Cold path: the same bus also sinks to durable, cheap storage (object storage/data lake) via a separate consumer with no latency pressure, feeding retraining and long-term analytics",
      "Keep the two consumers fully independent, so a slowdown or backlog in the cold path (fine to lag) never risks blowing the hot path's latency budget, and vice versa",
      "Partition the event bus appropriately (e.g. by geography/sensor type) so the hot path can parallelize and stay within the 5-second bar at sustained throughput",
      "Design the alerting model/logic in the hot path to be simple and fast, reserving heavier models for the offline pipeline fed by the cold path",
      "Ensure schema consistency between the hot and cold paths so retraining data faithfully represents what the real-time system actually saw",
      "Add backpressure and monitoring on both paths independently, since a healthy hot path can mask a silently backlogged cold path"
    ],
    redFlags: [
      "Trying to serve both real-time alerting and full-history retraining from a single unified pipeline with one latency profile",
      "No mention of a durable event bus as the shared source of truth, defaulting straight to a database write instead",
      "Coupling the hot and cold paths tightly enough that cold-path lag risks affecting real-time alert latency"
    ],
    bonus: [
      "Names this as a lambda-architecture pattern (or kappa if reprocessing from the same log) and reasons about the trade-off",
      "Evaluates the hot-path model for latency, not just accuracy, since a highly accurate but slow model breaks the 5s bar regardless of correctness",
      "Treats schema evolution/versioning on the event bus as an operational concern for a system meant to accumulate history over years"
    ],
    followUp: "The hot path hits 5s at 10,000 events/sec today, but city growth projections put you at 30,000 events/sec next year. What in this design breaks first, and what do you fix ahead of time?"
  },
  32: {
    testing: "Federated/multi-tenant data architecture design with strict isolation requirements.",
    context: "The platform needs to be genuinely useful across ministries while making cross-tenant raw data leakage structurally impossible, not just policy-forbidden.",
    strong: [
      "Start from the isolation requirement as the hard constraint - each ministry's raw data must be structurally inaccessible to others, not just access-controlled by policy, since policy-only controls fail under misconfiguration",
      "Keep each ministry's raw data in its own isolated storage/compute boundary (separate accounts/tenants/encryption keys) rather than one shared data lake with row-level permissions, since a shared store is one misconfigured policy away from cross-tenant exposure",
      "Build the central AI platform as a federated query/compute layer that runs queries/models within each ministry's boundary and only returns aggregated or derived results centrally, rather than centralizing raw data",
      "For cross-ministry insights specifically, use privacy-preserving aggregation (federated learning, secure aggregation, or differential privacy on outputs) so the central platform learns patterns without any ministry's raw records ever leaving its boundary",
      "Enforce access boundaries at the infrastructure layer (network isolation, separate encryption keys, IAM boundaries per tenant) as the primary control, with application-level permissions as a second layer",
      "Give each ministry its own audit log of what queries/models ran against its data and what results left its boundary, so it can independently verify nothing beyond agreed aggregates crossed the line",
      "Design a formal request/approval process, with per-ministry sign-off, for any cross-ministry analysis that needs more than aggregate results",
      "Test the isolation adversarially - can a query crafted in the central layer be made to exfiltrate raw records through an aggregate result, e.g. a small-group aggregate that effectively reveals an individual"
    ],
    redFlags: [
      "Proposing a single shared central data lake with row-level or role-based access control as the only isolation mechanism",
      "Treating this as purely a permissions/policy problem instead of a data architecture problem requiring structural isolation",
      "No mention of how cross-ministry insights are supposed to work at all if raw data never leaves each boundary"
    ],
    bonus: [
      "Names federated learning or secure multi-party computation specifically as the mechanism for cross-ministry value without centralizing raw data",
      "Flags small-group aggregation/re-identification risk explicitly, since aggregates over very small subgroups can still leak individual-level information",
      "Notes that independent per-ministry audit visibility is what actually makes the isolation trustworthy to stakeholders, not just technically true"
    ],
    followUp: "One ministry wants a cross-ministry insight that federated aggregation genuinely cannot answer without seeing some raw joined records. What's the actual process for that request, and who has the authority to approve it?"
  }
};

if (typeof module !== "undefined") module.exports = ANSWERS;
