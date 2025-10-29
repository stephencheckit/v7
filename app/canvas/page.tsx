"use client";

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Sparkles, Network, RefreshCw } from 'lucide-react';

export default function CanvasPage() {
  const { workspaceId } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load workspace data and generate initial nodes
  useEffect(() => {
    if (!workspaceId) return;
    
    async function loadWorkspaceData() {
      try {
        setIsLoading(true);
        
        // Fetch forms
        const formsRes = await fetch(`/api/forms?workspace_id=${workspaceId}`);
        const formsData = await formsRes.json();
        
        // Fetch workflows
        const workflowsRes = await fetch(`/api/workflows?workspace_id=${workspaceId}`);
        const workflowsData = await workflowsRes.json();
        
        // Fetch sensors
        const sensorsRes = await fetch(`/api/sensors?workspace_id=${workspaceId}`);
        const sensorsData = await sensorsRes.json();
        
        // Fetch courses
        const coursesRes = await fetch(`/api/courses?workspace_id=${workspaceId}`);
        const coursesData = await coursesRes.json();
        
        // Fetch cadences (form instances)
        const cadencesRes = await fetch(`/api/instances?workspace_id=${workspaceId}&limit=5`);
        const cadencesData = await cadencesRes.json();
        
        // Generate nodes from data
        const generatedNodes: Node[] = [];
        const generatedEdges: Edge[] = [];
        
        let yOffset = 0;
        
        // Add Forms (left column)
        formsData.forms?.slice(0, 5).forEach((form: any, idx: number) => {
          generatedNodes.push({
            id: `form-${form.id}`,
            type: 'default',
            position: { x: 50, y: yOffset + idx * 120 },
            data: { 
              label: `📝 ${form.title || 'Untitled Form'}`,
            },
            style: {
              background: '#c4dfc4',
              color: '#0a0a0a',
              border: '2px solid #b5d0b5',
              borderRadius: '8px',
              padding: '10px',
              width: 200,
            },
          });
        });
        
        // Add Workflows (middle column)
        workflowsData.workflows?.slice(0, 5).forEach((workflow: any, idx: number) => {
          const workflowId = `workflow-${workflow.id}`;
          generatedNodes.push({
            id: workflowId,
            type: 'default',
            position: { x: 350, y: yOffset + idx * 120 },
            data: { 
              label: `⚡ ${workflow.name}`,
            },
            style: {
              background: '#c8e0f5',
              color: '#0a0a0a',
              border: '2px solid #a8c0d5',
              borderRadius: '8px',
              padding: '10px',
              width: 200,
            },
          });
          
          // Create edge from form to workflow if trigger matches
          if (workflow.trigger_type === 'form_submitted' || workflow.trigger_type === 'form_overdue') {
            const formId = `form-${workflow.trigger_config?.form_id}`;
            if (generatedNodes.some(n => n.id === formId)) {
              generatedEdges.push({
                id: `${formId}-${workflowId}`,
                source: formId,
                target: workflowId,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#c4dfc4', strokeWidth: 2 },
                label: workflow.trigger_type === 'form_overdue' ? 'overdue' : 'submitted',
              });
            }
          }
        });
        
        // Add Sensors (right column)
        sensorsData.sensors?.slice(0, 5).forEach((sensor: any, idx: number) => {
          const sensorId = `sensor-${sensor.id}`;
          generatedNodes.push({
            id: sensorId,
            type: 'default',
            position: { x: 650, y: yOffset + idx * 120 },
            data: { 
              label: `🌡️ ${sensor.name}`,
            },
            style: {
              background: '#ffd4d4',
              color: '#0a0a0a',
              border: '2px solid #ffb4b4',
              borderRadius: '8px',
              padding: '10px',
              width: 200,
            },
          });
          
          // Create edge from sensor to workflow if trigger matches
          workflowsData.workflows?.forEach((workflow: any) => {
            if (workflow.trigger_type === 'sensor_temp_exceeds' || workflow.trigger_type === 'sensor_temp_below') {
              if (workflow.trigger_config?.sensor_id === sensor.id) {
                const workflowId = `workflow-${workflow.id}`;
                if (generatedNodes.some(n => n.id === workflowId)) {
                  generatedEdges.push({
                    id: `${sensorId}-${workflowId}`,
                    source: sensorId,
                    target: workflowId,
                    type: 'smoothstep',
                    animated: true,
                    style: { stroke: '#ff8888', strokeWidth: 2 },
                    label: workflow.trigger_type === 'sensor_temp_exceeds' ? 'temp high' : 'temp low',
                  });
                }
              }
            }
          });
        });
        
        // Add Courses (column 4)
        coursesData.courses?.slice(0, 5).forEach((course: any, idx: number) => {
          generatedNodes.push({
            id: `course-${course.id}`,
            type: 'default',
            position: { x: 950, y: yOffset + idx * 120 },
            data: { 
              label: `🎓 ${course.title}`,
            },
            style: {
              background: '#e8d4ff',
              color: '#0a0a0a',
              border: '2px solid #d0b4ff',
              borderRadius: '8px',
              padding: '10px',
              width: 200,
            },
          });
        });
        
        // Add Cadences (column 5)
        cadencesData.instances?.slice(0, 5).forEach((instance: any, idx: number) => {
          const cadenceId = `cadence-${instance.id}`;
          generatedNodes.push({
            id: cadenceId,
            type: 'default',
            position: { x: 1250, y: yOffset + idx * 120 },
            data: { 
              label: `📅 ${instance.form_title || 'Scheduled Task'}`,
            },
            style: {
              background: '#ffe4b5',
              color: '#0a0a0a',
              border: '2px solid #ffd485',
              borderRadius: '8px',
              padding: '10px',
              width: 200,
            },
          });
          
          // Create edge from form to cadence if they match
          const formId = `form-${instance.form_id}`;
          if (generatedNodes.some(n => n.id === formId)) {
            generatedEdges.push({
              id: `${formId}-${cadenceId}`,
              source: formId,
              target: cadenceId,
              type: 'smoothstep',
              style: { stroke: '#ffd485', strokeWidth: 2 },
              label: 'scheduled',
            });
          }
        });
        
        setNodes(generatedNodes);
        setEdges(generatedEdges);
      } catch (error) {
        console.error('Error loading workspace data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadWorkspaceData();
  }, [workspaceId, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAutoLayout = () => {
    // Simple auto-layout: arrange nodes in columns by type
    const formNodes = nodes.filter(n => n.id.startsWith('form-'));
    const workflowNodes = nodes.filter(n => n.id.startsWith('workflow-'));
    const sensorNodes = nodes.filter(n => n.id.startsWith('sensor-'));
    const courseNodes = nodes.filter(n => n.id.startsWith('course-'));
    const cadenceNodes = nodes.filter(n => n.id.startsWith('cadence-'));
    
    const newNodes = [
      ...formNodes.map((node, idx) => ({ ...node, position: { x: 50, y: idx * 120 } })),
      ...workflowNodes.map((node, idx) => ({ ...node, position: { x: 350, y: idx * 120 } })),
      ...sensorNodes.map((node, idx) => ({ ...node, position: { x: 650, y: idx * 120 } })),
      ...courseNodes.map((node, idx) => ({ ...node, position: { x: 950, y: idx * 120 } })),
      ...cadenceNodes.map((node, idx) => ({ ...node, position: { x: 1250, y: idx * 120 } })),
    ];
    
    setNodes(newNodes);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#c4dfc4] mx-auto mb-4" />
          <p className="text-white">Loading workspace data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-white/20 bg-gradient-to-r from-[#0a0a0a] to-[#0f0f0f] p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Network className="h-6 w-6 text-[#c4dfc4]" />
              Canvas
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Visual map of your workspace - {nodes.length} nodes, {edges.length} connections
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleAutoLayout}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Network className="h-4 w-4 mr-2" />
              Auto Layout
            </Button>
            <Button
              className="bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5]"
              disabled
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Ask AI
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          className="bg-[#0a0a0a]"
        >
          <Controls className="bg-white/10 border border-white/20" />
          <MiniMap 
            className="bg-white/10 border border-white/20" 
            nodeColor={(node) => {
              if (node.id.startsWith('form-')) return '#c4dfc4';
              if (node.id.startsWith('workflow-')) return '#c8e0f5';
              if (node.id.startsWith('sensor-')) return '#ffd4d4';
              if (node.id.startsWith('course-')) return '#e8d4ff';
              if (node.id.startsWith('cadence-')) return '#ffe4b5';
              return '#666';
            }}
          />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1} 
            color="#ffffff20"
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="absolute bottom-40 left-4 bg-black/90 border border-white/20 rounded-lg p-4 backdrop-blur-sm z-10">
        <div className="text-xs text-white space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#c4dfc4]"></div>
            <span>Forms</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#c8e0f5]"></div>
            <span>Workflows</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#ffd4d4]"></div>
            <span>Sensors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#e8d4ff]"></div>
            <span>Courses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#ffe4b5]"></div>
            <span>Cadences</span>
          </div>
        </div>
      </div>
    </div>
  );
}

