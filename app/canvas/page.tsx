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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Network, RefreshCw, ExternalLink, FileText, Zap, Thermometer, GraduationCap, Calendar } from 'lucide-react';
import { CanvasSkeleton } from '@/components/loading';

export default function CanvasPage() {
  const { workspaceId } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [workspaceData, setWorkspaceData] = useState<any>({
    forms: [],
    workflows: [],
    sensors: [],
    courses: [],
    cadences: []
  });

  // Load workspace data and generate initial nodes
  useEffect(() => {
    if (!workspaceId) return;

    async function loadWorkspaceData() {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel (5x faster than sequential)
        const [formsData, workflowsData, sensorsData, coursesData, cadencesData] = await Promise.all([
          fetch(`/api/forms?workspace_id=${workspaceId}`).then(r => r.json()),
          fetch(`/api/workflows?workspace_id=${workspaceId}`).then(r => r.json()),
          fetch(`/api/sensors?workspace_id=${workspaceId}`).then(r => r.json()),
          fetch(`/api/courses?workspace_id=${workspaceId}`).then(r => r.json()),
          fetch(`/api/instances?workspace_id=${workspaceId}&limit=10`).then(r => r.json()),
        ]);

        // Generate nodes from data
        const generatedNodes: Node[] = [];
        const generatedEdges: Edge[] = [];

        let yOffset = 0;

        // Add Forms (left column)
        formsData.forms?.slice(0, 10).forEach((form: any, idx: number) => {
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
        workflowsData.workflows?.slice(0, 10).forEach((workflow: any, idx: number) => {
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
        sensorsData.sensors?.slice(0, 10).forEach((sensor: any, idx: number) => {
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
        coursesData.courses?.slice(0, 10).forEach((course: any, idx: number) => {
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
        cadencesData.instances?.slice(0, 10).forEach((instance: any, idx: number) => {
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

        // Store full data for drawer
        setWorkspaceData({
          forms: formsData.forms || [],
          workflows: workflowsData.workflows || [],
          sensors: sensorsData.sensors || [],
          courses: coursesData.courses || [],
          cadences: cadencesData.instances || []
        });
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

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    // Extract node type and ID
    const [nodeType, nodeId] = node.id.split('-');

    // Find full data object
    let fullData = null;
    if (nodeType === 'form') {
      fullData = workspaceData.forms.find((f: any) => f.id === nodeId);
    } else if (nodeType === 'workflow') {
      fullData = workspaceData.workflows.find((w: any) => w.id === nodeId);
    } else if (nodeType === 'sensor') {
      fullData = workspaceData.sensors.find((s: any) => s.id === nodeId);
    } else if (nodeType === 'course') {
      fullData = workspaceData.courses.find((c: any) => c.id === nodeId);
    } else if (nodeType === 'cadence') {
      fullData = workspaceData.cadences.find((c: any) => c.id === nodeId);
    }

    if (fullData) {
      setSelectedNode({ type: nodeType, data: fullData });
      setDrawerOpen(true);
    }
  }, [workspaceData]);

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
    return <CanvasSkeleton />;
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
          onNodeClick={onNodeClick}
          fitView
          className="bg-[#0a0a0a]"
        >
          <Controls className="bg-white/10 border border-white/20 !bottom-6" />
          <MiniMap
            className="bg-white/10 border border-white/20 !bottom-6"
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
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/90 border border-white/20 rounded-lg px-6 py-3 backdrop-blur-sm z-50">
        <div className="flex items-center gap-6 text-xs text-white">
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

      {/* Node Details Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="bg-[#0a0a0a] border-l border-white/20 text-white w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedNode && (
            <>
              <SheetHeader className="sticky top-0 bg-[#0a0a0a] pb-6 border-b border-white/10 z-10">
                <SheetTitle className="text-white flex items-center gap-2">
                  {selectedNode.type === 'form' && <FileText className="h-5 w-5 text-[#c4dfc4]" />}
                  {selectedNode.type === 'workflow' && <Zap className="h-5 w-5 text-[#c8e0f5]" />}
                  {selectedNode.type === 'sensor' && <Thermometer className="h-5 w-5 text-[#ffd4d4]" />}
                  {selectedNode.type === 'course' && <GraduationCap className="h-5 w-5 text-[#e8d4ff]" />}
                  {selectedNode.type === 'cadence' && <Calendar className="h-5 w-5 text-[#ffe4b5]" />}
                  {selectedNode.data.title || selectedNode.data.name || 'Details'}
                </SheetTitle>
                <SheetDescription className="text-gray-400 mt-2">
                  {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)} details and quick actions
                </SheetDescription>
              </SheetHeader>

              <div className="px-6 py-6 space-y-6">
                {/* Form Details */}
                {selectedNode.type === 'form' && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Description</p>
                      <p className="text-sm text-white leading-relaxed">{selectedNode.data.description || 'No description'}</p>
                    </div>
                    
                    <div className="flex gap-6">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Questions</p>
                        <p className="text-2xl font-bold text-[#c4dfc4]">
                          {Array.isArray(selectedNode.data.schema)
                            ? selectedNode.data.schema.length
                            : (selectedNode.data.schema?.fields?.length || 0)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Responses</p>
                        <p className="text-2xl font-bold text-[#c4dfc4]">0</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Sample Questions</p>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const fields = Array.isArray(selectedNode.data.schema)
                            ? selectedNode.data.schema
                            : (selectedNode.data.schema?.fields || []);
                          return fields.slice(0, 3).map((field: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs text-gray-300 border-white/20">
                              {field.label}
                            </Badge>
                          ));
                        })()}
                      </div>
                    </div>
                    
                    <Button
                      className="w-full bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5] mt-2"
                      onClick={() => window.open(`/forms/builder?formId=${selectedNode.data.id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in Form Builder
                    </Button>
                  </>
                )}

                {/* Workflow Details */}
                {selectedNode.type === 'workflow' && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Description</p>
                      <p className="text-sm text-white leading-relaxed">{selectedNode.data.description || 'No description'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Status</p>
                      <Badge className={selectedNode.data.is_active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>
                        {selectedNode.data.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Trigger</p>
                      <p className="text-sm text-white capitalize">{selectedNode.data.trigger_type?.replace(/_/g, ' ')}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Actions</p>
                      <p className="text-2xl font-bold text-[#c8e0f5]">{selectedNode.data.actions?.length || 0}</p>
                    </div>
                    
                    <Button
                      className="w-full bg-[#c8e0f5] text-[#0a0a0a] hover:bg-[#b8d0e5] mt-2"
                      onClick={() => window.open(`/workflows`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in Workflows
                    </Button>
                  </>
                )}

                {/* Sensor Details */}
                {selectedNode.type === 'sensor' && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Type</p>
                      <p className="text-sm text-white capitalize">{selectedNode.data.type}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Location</p>
                      <p className="text-sm text-white">{selectedNode.data.location || 'Unknown'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Current Reading</p>
                      <p className="text-2xl font-bold text-[#ffd4d4]">
                        {selectedNode.data.current_value ? `${selectedNode.data.current_value}°${selectedNode.data.unit}` : 'No data'}
                      </p>
                    </div>
                    
                    <Button
                      className="w-full bg-[#ffd4d4] text-[#0a0a0a] hover:bg-[#ffc4c4] mt-2"
                      onClick={() => window.open(`/sensors`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in Sensors
                    </Button>
                  </>
                )}

                {/* Course Details */}
                {selectedNode.type === 'course' && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Description</p>
                      <p className="text-sm text-white leading-relaxed">{selectedNode.data.description || 'No description'}</p>
                    </div>
                    
                    <div className="flex gap-6">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Estimated Time</p>
                        <p className="text-2xl font-bold text-[#e8d4ff]">{selectedNode.data.estimated_minutes || 0} min</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Points</p>
                        <p className="text-2xl font-bold text-[#e8d4ff]">{selectedNode.data.total_points || 0}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Blocks</p>
                      <p className="text-2xl font-bold text-[#e8d4ff]">{selectedNode.data.blocks?.length || 0}</p>
                    </div>
                    
                    <Button
                      className="w-full bg-[#e8d4ff] text-[#0a0a0a] hover:bg-[#d8c4ef] mt-2"
                      onClick={() => window.open(`/learn/${selectedNode.data.id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Course
                    </Button>
                  </>
                )}

                {/* Cadence Details */}
                {selectedNode.type === 'cadence' && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Form</p>
                      <p className="text-sm text-white">{selectedNode.data.form_title}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Status</p>
                      <Badge className={
                        selectedNode.data.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                        selectedNode.data.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }>
                        {selectedNode.data.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Scheduled For</p>
                      <p className="text-sm text-white">
                        {selectedNode.data.scheduled_for ? new Date(selectedNode.data.scheduled_for).toLocaleString() : 'Not scheduled'}
                      </p>
                    </div>
                    
                    <Button
                      className="w-full bg-[#ffe4b5] text-[#0a0a0a] hover:bg-[#ffd495] mt-2"
                      onClick={() => window.open(`/f/${selectedNode.data.form_id}?source=canvas&instance_id=${selectedNode.data.id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Form
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

