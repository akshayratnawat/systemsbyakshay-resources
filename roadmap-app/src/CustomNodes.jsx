import { Handle, Position } from '@xyflow/react';
import { useState } from 'react';

/* ── Phase Node (top-level) ── */
export function PhaseNode({ data }) {
  const [showDesc, setShowDesc] = useState(false);

  return (
    <div
      className="node-phase"
      style={{ borderColor: data.color }}
      onMouseEnter={() => setShowDesc(true)}
      onMouseLeave={() => setShowDesc(false)}
    >
      <Handle type="target" position={Position.Left} className="handle-hidden" />
      <div className="node-phase-label" style={{ color: data.color }}>
        {data.completed && <span className="checkmark">✓ </span>}
        {data.label}
      </div>
      {showDesc && (
        <div className="tooltip">{data.description}</div>
      )}
      <Handle type="source" position={Position.Right} className="handle-hidden" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="handle-hidden" />
    </div>
  );
}

/* ── Topic Node (mid-level) ── */
export function TopicNode({ data, id }) {
  const [showDesc, setShowDesc] = useState(false);

  return (
    <div
      className={`node-topic ${data.completed ? 'node-completed' : ''}`}
      onMouseEnter={() => setShowDesc(true)}
      onMouseLeave={() => setShowDesc(false)}
    >
      <Handle type="target" position={Position.Top} className="handle-hidden" />
      <div className="node-topic-dot" style={{ backgroundColor: data.color }} />
      <div className="node-topic-label">
        {data.completed && <span className="checkmark">✓ </span>}
        {data.label}
      </div>
      {data.hasSubtopics && <span className="subtopic-indicator">›</span>}
      {showDesc && (
        <div className="tooltip">{data.description}</div>
      )}
      <Handle type="source" position={Position.Right} id="right" className="handle-hidden" />
      <Handle type="source" position={Position.Bottom} className="handle-hidden" />
    </div>
  );
}

/* ── Subtopic Node (leaf-level) ── */
export function SubtopicNode({ data }) {
  const [showDesc, setShowDesc] = useState(false);

  return (
    <div
      className={`node-subtopic ${data.completed ? 'node-completed' : ''}`}
      onMouseEnter={() => setShowDesc(true)}
      onMouseLeave={() => setShowDesc(false)}
    >
      <Handle type="target" position={Position.Left} className="handle-hidden" />
      <div className="node-subtopic-label">
        {data.completed && <span className="checkmark">✓ </span>}
        {data.label}
      </div>
      {showDesc && (
        <div className="tooltip tooltip-right">{data.description}</div>
      )}
    </div>
  );
}
