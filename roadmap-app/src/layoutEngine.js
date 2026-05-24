/**
 * Converts roadmap phase data into React Flow nodes and edges
 * with a vertical flow layout: phases → topics → subtopics
 */
import PHASES from './roadmapData';

const PHASE_GAP_Y = 100;
const TOPIC_START_Y = 120;
const TOPIC_GAP_Y = 90;
const SUBTOPIC_GAP_Y = 60;
const PHASE_WIDTH = 280;
const PHASE_GAP_X = 360;

export function buildFlowData(completedNodes = new Set()) {
  const nodes = [];
  const edges = [];
  const phaseKeys = Object.keys(PHASES);

  // Phase nodes across the top
  phaseKeys.forEach((key, phaseIdx) => {
    const phase = PHASES[key];
    const phaseX = phaseIdx * PHASE_GAP_X;
    const phaseId = `phase-${key}`;

    nodes.push({
      id: phaseId,
      type: 'phaseNode',
      position: { x: phaseX, y: 0 },
      data: {
        label: phase.label,
        description: phase.description,
        color: phase.color,
        completed: completedNodes.has(phaseId),
      },
    });

    // Connect phases horizontally
    if (phaseIdx > 0) {
      const prevKey = phaseKeys[phaseIdx - 1];
      edges.push({
        id: `phase-${prevKey}-to-${key}`,
        source: `phase-${prevKey}`,
        target: phaseId,
        type: 'smoothstep',
        style: { stroke: '#d1d5db', strokeWidth: 2 },
        animated: true,
      });
    }

    // Topic nodes below each phase
    let topicY = TOPIC_START_Y;
    phase.topics.forEach((topic) => {
      const topicId = `topic-${topic.id}`;

      nodes.push({
        id: topicId,
        type: 'topicNode',
        position: { x: phaseX, y: topicY },
        data: {
          label: topic.label,
          description: topic.description,
          color: phase.color,
          completed: completedNodes.has(topicId),
          hasSubtopics: topic.subtopics.length > 0,
        },
      });

      edges.push({
        id: `${phaseId}-to-${topicId}`,
        source: phaseId,
        target: topicId,
        type: 'smoothstep',
        style: { stroke: phase.color + '40', strokeWidth: 1.5 },
      });

      // Subtopic nodes to the right of topics
      if (topic.subtopics.length > 0) {
        let subY = topicY - ((topic.subtopics.length - 1) * SUBTOPIC_GAP_Y) / 2;
        topic.subtopics.forEach((sub) => {
          const subId = `sub-${sub.id}`;

          nodes.push({
            id: subId,
            type: 'subtopicNode',
            position: { x: phaseX + PHASE_WIDTH + 40, y: subY },
            data: {
              label: sub.label,
              description: sub.description,
              color: phase.color,
              completed: completedNodes.has(subId),
            },
          });

          edges.push({
            id: `${topicId}-to-${subId}`,
            source: topicId,
            target: subId,
            type: 'smoothstep',
            sourceHandle: 'right',
            style: { stroke: phase.color + '30', strokeWidth: 1 },
          });

          subY += SUBTOPIC_GAP_Y;
        });
      }

      topicY += TOPIC_GAP_Y + (topic.subtopics.length > 0 ? topic.subtopics.length * 20 : 0);
    });
  });

  return { nodes, edges };
}
