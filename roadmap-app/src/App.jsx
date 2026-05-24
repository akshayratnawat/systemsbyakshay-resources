import { useCallback, useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PhaseNode, TopicNode, SubtopicNode } from './CustomNodes';
import { buildFlowData } from './layoutEngine';
import './App.css';

const nodeTypes = {
  phaseNode: PhaseNode,
  topicNode: TopicNode,
  subtopicNode: SubtopicNode,
};

const STORAGE_KEY = 'sba-roadmap-progress';

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveProgress(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export default function App() {
  const [completed, setCompleted] = useState(loadProgress);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildFlowData(completed),
    [completed]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((_event, node) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(node.id)) {
        next.delete(node.id);
      } else {
        next.add(node.id);
      }
      saveProgress(next);
      const { nodes: newNodes, edges: newEdges } = buildFlowData(next);
      setNodes(newNodes);
      setEdges(newEdges);
      return next;
    });
  }, [setNodes, setEdges]);

  const totalNodes = nodes.length;
  const completedCount = completed.size;
  const progressPct = totalNodes > 0 ? Math.round((completedCount / totalNodes) * 100) : 0;

  const resetProgress = useCallback(() => {
    const empty = new Set();
    setCompleted(empty);
    saveProgress(empty);
    const { nodes: newNodes, edges: newEdges } = buildFlowData(empty);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <span className="brand-tag">@systemsbyakshay</span>
          <h1>Agentic AI Engineer Roadmap</h1>
          <p className="header-subtitle">
            A practical learning path for engineers shipping production agentic AI.
            Click any node to mark it as completed.
          </p>
        </div>
        <div className="header-right">
          <div className="progress-ring">
            <span className="progress-pct">{progressPct}%</span>
            <span className="progress-label">complete</span>
          </div>
          <button className="reset-btn" onClick={resetProgress}>Reset</button>
        </div>
      </header>

      <div className="flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#e8e4dc" gap={20} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(node) => {
              if (node.data?.completed) return '#22c55e';
              return node.data?.color || '#d1d5db';
            }}
            style={{ backgroundColor: '#fafaf8' }}
          />
        </ReactFlow>
      </div>

      <footer className="app-footer">
        <p>
          Built by <strong>@systemsbyakshay</strong> ·{' '}
          <a href="https://instagram.com/systemsbyakshay" target="_blank" rel="noopener noreferrer">Instagram</a> ·{' '}
          <a href="../">All Resources</a>
        </p>
      </footer>
    </div>
  );
}
