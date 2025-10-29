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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Network, RefreshCw, ExternalLink, FileText, Zap, Thermometer, GraduationCap, Calendar, Package, TruckIcon, Factory, CheckCircle2, Tag, Search } from 'lucide-react';
import { CanvasSkeleton } from '@/components/loading';

// Sheetz prepared food menu items (DC-produced)
const sheetzMenuItems = [
  { id: 'turkey-sandwich', name: 'Turkey & Cheese Sandwich', category: 'Sandwiches', emoji: '🥪' },
  { id: 'italian-sub', name: 'Italian Sub', category: 'Sandwiches', emoji: '🥖' },
  { id: 'blt', name: 'BLT', category: 'Sandwiches', emoji: '🥓' },
  { id: 'chicken-sandwich', name: 'Grilled Chicken Sandwich', category: 'Sandwiches', emoji: '🍗' },
  { id: 'breakfast-burrito', name: 'Breakfast Burrito', category: 'Breakfast', emoji: '🌯' },
  { id: 'breakfast-sandwich', name: 'Breakfast Sandwich', category: 'Breakfast', emoji: '🥪' },
  { id: 'egg-bowl', name: 'Scrambled Egg Bowl', category: 'Breakfast', emoji: '🍳' },
  { id: 'caesar-salad', name: 'Caesar Salad', category: 'Salads', emoji: '🥗' },
  { id: 'garden-salad', name: 'Garden Salad', category: 'Salads', emoji: '🥗' },
  { id: 'chef-salad', name: 'Chef Salad', category: 'Salads', emoji: '🥗' },
  { id: 'chili-dog', name: 'Chili Dog', category: 'Hot Foods', emoji: '🌭' },
  { id: 'hot-dog', name: 'Classic Hot Dog', category: 'Hot Foods', emoji: '🌭' },
  { id: 'pizza-slice', name: 'Pizza Slice', category: 'Hot Foods', emoji: '🍕' },
  { id: 'mac-cheese', name: 'Mac & Cheese', category: 'Hot Foods', emoji: '🧀' },
  { id: 'muffin', name: 'Blueberry Muffin', category: 'Bakery', emoji: '🧁' },
  { id: 'donut', name: 'Glazed Donut', category: 'Bakery', emoji: '🍩' },
  { id: 'croissant', name: 'Butter Croissant', category: 'Bakery', emoji: '🥐' },
  { id: 'fruit-cup', name: 'Fresh Fruit Cup', category: 'Sides', emoji: '🍓' },
  { id: 'coleslaw', name: 'Coleslaw', category: 'Sides', emoji: '🥬' },
  { id: 'potato-salad', name: 'Potato Salad', category: 'Sides', emoji: '🥔' },
];

export default function CanvasPage() {
  const { workspaceId } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'workspace' | 'supply-chain'>('workspace');
  const [selectedProduct, setSelectedProduct] = useState<any>(sheetzMenuItems[0]);
  const [lotCodeSearch, setLotCodeSearch] = useState('');
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
    // Check if this is a supply chain node
    if (activeTab === 'supply-chain') {
      // Extract step type from node ID (e.g., "turkey-sandwich-receiving")
      const parts = node.id.split('-');
      const stepType = parts[parts.length - 1]; // Last part is the step (receiving, production, etc.)
      
      setSelectedNode({ 
        type: 'supply-chain-step', 
        stepType,
        product: selectedProduct 
      });
      setDrawerOpen(true);
      return;
    }

    // Workspace node click (existing logic)
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
  }, [workspaceData, activeTab, selectedProduct]);

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

  // Generate supply chain nodes for selected product
  const generateSupplyChainNodes = useCallback((product: any) => {
    const supplyChainSteps = [
      { id: 'vendor', label: '🚛 Vendor\nSupply', icon: TruckIcon, color: '#a8c0d5', x: 100 },
      { id: 'receiving', label: '📦 Receiving\nInspection', icon: Package, color: '#c4dfc4', x: 300 },
      { id: 'storage', label: '❄️ Cold\nStorage', icon: Thermometer, color: '#ffd4d4', x: 500 },
      { id: 'production', label: '🏭 Production\nLine', icon: Factory, color: '#ffe4b5', x: 700 },
      { id: 'qa', label: '✅ Quality\nAssurance', icon: CheckCircle2, color: '#e8d4ff', x: 900 },
      { id: 'labeling', label: '🏷️ Lot Code\nLabeling', icon: Tag, color: '#c8e0f5', x: 1100 },
      { id: 'shipping', label: '📦 Shipping\nManifest', icon: TruckIcon, color: '#ffd4d4', x: 1300 },
    ];

    const supplyNodes: Node[] = supplyChainSteps.map((step) => ({
      id: `${product.id}-${step.id}`,
      type: 'default',
      position: { x: step.x, y: 300 },
      data: { 
        label: step.label,
      },
      style: {
        background: step.color,
        color: '#0a0a0a',
        border: '2px solid #2a2a2a',
        borderRadius: '12px',
        padding: '16px',
        width: 140,
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: '600',
      },
    }));

    // Create edges connecting the flow
    const supplyEdges: Edge[] = [];
    for (let i = 0; i < supplyChainSteps.length - 1; i++) {
      supplyEdges.push({
        id: `${product.id}-edge-${i}`,
        source: `${product.id}-${supplyChainSteps[i].id}`,
        target: `${product.id}-${supplyChainSteps[i + 1].id}`,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#c4dfc4', strokeWidth: 3 },
      });
    }

    setNodes(supplyNodes);
    setEdges(supplyEdges);
  }, [setNodes, setEdges]);

  // Load supply chain when product changes
  useEffect(() => {
    if (activeTab === 'supply-chain' && selectedProduct) {
      generateSupplyChainNodes(selectedProduct);
    }
  }, [activeTab, selectedProduct, generateSupplyChainNodes]);

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
              {activeTab === 'workspace' 
                ? `Visual map of your workspace - ${nodes.length} nodes, ${edges.length} connections`
                : `Supply chain for ${selectedProduct.name}`
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'workspace' && (
              <Button
                onClick={handleAutoLayout}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Network className="h-4 w-4 mr-2" />
                Auto Layout
              </Button>
            )}
            {activeTab === 'supply-chain' && lotCodeSearch && (
              <Badge className="bg-[#c4dfc4]/20 text-[#c4dfc4] border-[#c4dfc4]/30">
                Tracing: {lotCodeSearch}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <div className="border-b border-white/10 bg-[#0f0f0f] px-4">
          <TabsList className="bg-transparent border-0 h-12">
            <TabsTrigger 
              value="workspace" 
              className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white"
            >
              <Network className="h-4 w-4 mr-2" />
              Workspace Map
            </TabsTrigger>
            <TabsTrigger 
              value="supply-chain"
              className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white"
            >
              <Factory className="h-4 w-4 mr-2" />
              Supply Chain
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Workspace Tab */}
        <TabsContent value="workspace" className="flex-1 m-0">
          <div className="h-full relative">
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

            {/* Legend for Workspace */}
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
          </div>
        </TabsContent>

        {/* Supply Chain Tab */}
        <TabsContent value="supply-chain" className="flex-1 m-0">
          <div className="h-full flex">
            {/* Left Panel: Product Selector */}
            <div className="w-80 border-r border-white/10 bg-[#0f0f0f] flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search lot code..."
                    value={lotCodeSearch}
                    onChange={(e) => setLotCodeSearch(e.target.value)}
                    className="pl-10 bg-[#1a1a1a] border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* Product List */}
              <ScrollArea className="flex-1">
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-3 py-2">
                    Products ({sheetzMenuItems.length})
                  </p>
                  <div className="space-y-1">
                    {sheetzMenuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedProduct(item)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedProduct.id === item.id
                            ? 'bg-[#c4dfc4]/20 border border-[#c4dfc4]/30'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.emoji}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.category}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Right: Supply Chain Flow */}
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
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={20}
                  size={1}
                  color="#ffffff20"
                />
              </ReactFlow>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Node Details Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="bg-[#0a0a0a] border-l border-white/20 text-white w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedNode && (
            <>
              <SheetHeader className="sticky top-0 bg-[#0a0a0a] pb-6 border-b border-white/10 z-10">
                <SheetTitle className="text-white flex items-center gap-2">
                  {selectedNode.type === 'supply-chain-step' ? (
                    <>
                      {selectedNode.stepType === 'vendor' && <TruckIcon className="h-5 w-5 text-[#a8c0d5]" />}
                      {selectedNode.stepType === 'receiving' && <Package className="h-5 w-5 text-[#c4dfc4]" />}
                      {selectedNode.stepType === 'storage' && <Thermometer className="h-5 w-5 text-[#ffd4d4]" />}
                      {selectedNode.stepType === 'production' && <Factory className="h-5 w-5 text-[#ffe4b5]" />}
                      {selectedNode.stepType === 'qa' && <CheckCircle2 className="h-5 w-5 text-[#e8d4ff]" />}
                      {selectedNode.stepType === 'labeling' && <Tag className="h-5 w-5 text-[#c8e0f5]" />}
                      {selectedNode.stepType === 'shipping' && <TruckIcon className="h-5 w-5 text-[#ffd4d4]" />}
                      {selectedNode.stepType.charAt(0).toUpperCase() + selectedNode.stepType.slice(1)} Step
                    </>
                  ) : (
                    <>
                      {selectedNode.type === 'form' && <FileText className="h-5 w-5 text-[#c4dfc4]" />}
                      {selectedNode.type === 'workflow' && <Zap className="h-5 w-5 text-[#c8e0f5]" />}
                      {selectedNode.type === 'sensor' && <Thermometer className="h-5 w-5 text-[#ffd4d4]" />}
                      {selectedNode.type === 'course' && <GraduationCap className="h-5 w-5 text-[#e8d4ff]" />}
                      {selectedNode.type === 'cadence' && <Calendar className="h-5 w-5 text-[#ffe4b5]" />}
                      {selectedNode.data?.title || selectedNode.data?.name || 'Details'}
                    </>
                  )}
                </SheetTitle>
                <SheetDescription className="text-gray-400 mt-2">
                  {selectedNode.type === 'supply-chain-step' 
                    ? `${selectedProduct.name} - Supply chain process`
                    : `${selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)} details and quick actions`
                  }
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

                {/* Supply Chain Step Details */}
                {selectedNode.type === 'supply-chain-step' && (
                  <>
                    {selectedNode.stepType === 'vendor' && (
                      <>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Purpose</p>
                          <p className="text-sm text-white leading-relaxed">Ingredients supplied by approved vendors with lot codes and certificates of analysis.</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Key Data</p>
                          <div className="text-sm text-gray-300 space-y-1">
                            <p>• Vendor name & certification</p>
                            <p>• Ingredient lot codes</p>
                            <p>• Ship date & temperature</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">FSMA 204 Requirement</p>
                          <Badge className="bg-blue-500/20 text-blue-300">Vendor lot codes required</Badge>
                        </div>
                      </>
                    )}

                    {selectedNode.stepType === 'receiving' && (
                      <>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Purpose</p>
                          <p className="text-sm text-white leading-relaxed">Document incoming ingredients, verify quality, capture vendor lot codes for traceability.</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Form Used</p>
                          <p className="text-sm text-white">DC Receiving Inspection</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Key Actions</p>
                          <div className="text-sm text-gray-300 space-y-1">
                            <p>• Scan vendor lot code (barcode/AI vision)</p>
                            <p>• Check temp on arrival</p>
                            <p>• Inspect for damage/quality</p>
                            <p>• Accept or reject shipment</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">FSMA 204 Critical</p>
                          <Badge className="bg-red-500/20 text-red-300">Lot codes must be captured</Badge>
                        </div>
                        <Button
                          className="w-full bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5] mt-2"
                          onClick={() => toast.info('Receiving form template coming soon')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Form Template
                        </Button>
                      </>
                    )}

                    {selectedNode.stepType === 'storage' && (
                      <>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Purpose</p>
                          <p className="text-sm text-white leading-relaxed">Maintain proper temperature for ingredients before production. Continuous monitoring prevents spoilage.</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Monitoring</p>
                          <div className="text-sm text-gray-300 space-y-1">
                            <p>• Walk-in cooler sensors (38°F target)</p>
                            <p>• Freezer sensors (-5°F target)</p>
                            <p>• Alert if out of range 15+ min</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Integration</p>
                          <p className="text-sm text-white">Sensors page + Workflow alerts</p>
                        </div>
                        <Button
                          className="w-full bg-[#ffd4d4] text-[#0a0a0a] hover:bg-[#ffc4c4] mt-2"
                          onClick={() => window.open('/sensors', '_blank')}
                        >
                          <Thermometer className="h-4 w-4 mr-2" />
                          View Sensors
                        </Button>
                      </>
                    )}

                    {selectedNode.stepType === 'production' && (
                      <>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Purpose</p>
                          <p className="text-sm text-white leading-relaxed">Assemble finished product on production line. Link ingredient lots to new output lot code.</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Form Used</p>
                          <p className="text-sm text-white">Production Batch Record</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Process</p>
                          <div className="text-sm text-gray-300 space-y-1">
                            <p>• Start batch → Auto-generate lot code</p>
                            <p>• Scan ingredient lot codes used</p>
                            <p>• Record worker, line, time</p>
                            <p>• QA checkpoints every 30 min</p>
                            <p>• Document quantity produced</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Output Lot Code</p>
                          <Badge className="bg-yellow-500/20 text-yellow-300 font-mono">
                            LOT-DC1-2025-10-29-{selectedProduct.id.toUpperCase()}-001
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">FSMA 204 Critical</p>
                          <Badge className="bg-red-500/20 text-red-300">Ingredient → Product lot linkage required</Badge>
                        </div>
                        <Button
                          className="w-full bg-[#ffe4b5] text-[#0a0a0a] hover:bg-[#ffd495] mt-2"
                          onClick={() => toast.info('Production batch form coming soon')}
                        >
                          <Factory className="h-4 w-4 mr-2" />
                          View Batch Form
                        </Button>
                      </>
                    )}

                    {selectedNode.stepType === 'qa' && (
                      <>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Purpose</p>
                          <p className="text-sm text-white leading-relaxed">Quality checkpoints during production ensure product meets safety and quality standards.</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Checkpoint Frequency</p>
                          <p className="text-sm text-white">Every 30 minutes during batch</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Checks Performed</p>
                          <div className="text-sm text-gray-300 space-y-1">
                            <p>• Weight/portion verification</p>
                            <p>• Visual inspection</p>
                            <p>• Temperature check</p>
                            <p>• Allergen cross-contamination</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Action on Failure</p>
                          <p className="text-sm text-white">Reject batch, document issue, alert supervisor</p>
                        </div>
                      </>
                    )}

                    {selectedNode.stepType === 'labeling' && (
                      <>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Purpose</p>
                          <p className="text-sm text-white leading-relaxed">Print labels with lot codes for every unit. Required for FSMA 204 traceability and store receipt.</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Label Contents</p>
                          <div className="text-sm text-gray-300 space-y-1">
                            <p>• Product name</p>
                            <p>• Lot code (barcode + readable)</p>
                            <p>• Production date & use-by</p>
                            <p>• Allergen warnings</p>
                            <p>• Storage instructions</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Example Label</p>
                          <div className="bg-white text-black p-3 rounded text-xs font-mono">
                            <p className="font-bold">TURKEY & CHEESE SANDWICH</p>
                            <p>Lot: LOT-DC1-2025-10-29-TURK-001</p>
                            <p>Made: 10/29/25 8:00 AM</p>
                            <p>Use by: 10/31/25</p>
                            <p className="text-red-600 font-bold">⚠️ Contains: Wheat, Dairy</p>
                          </div>
                        </div>
                        <Button
                          className="w-full bg-[#c8e0f5] text-[#0a0a0a] hover:bg-[#b8d0e5] mt-2"
                          onClick={() => window.open('/labeling', '_blank')}
                        >
                          <Tag className="h-4 w-4 mr-2" />
                          Open Label Designer
                        </Button>
                      </>
                    )}

                    {selectedNode.stepType === 'shipping' && (
                      <>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Purpose</p>
                          <p className="text-sm text-white leading-relaxed">Create manifest documenting which lots ship to which stores. Critical for recalls.</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Form Used</p>
                          <p className="text-sm text-white">Shipping Manifest</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Manifest Includes</p>
                          <div className="text-sm text-gray-300 space-y-1">
                            <p>• Destination store #</p>
                            <p>• Product lot codes & quantities</p>
                            <p>• Driver signature & departure time</p>
                            <p>• Truck temp at loading</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Example</p>
                          <div className="bg-[#1a1a1a] p-3 rounded text-xs text-gray-300">
                            <p>Store #142: 66 units</p>
                            <p>LOT-DC1-2025-10-29-TURK-001</p>
                            <p>Shipped: 2:00 PM, Truck temp: 38°F</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">FSMA 204 Critical</p>
                          <Badge className="bg-red-500/20 text-red-300">Required for forward traceability</Badge>
                        </div>
                        <Button
                          className="w-full bg-[#ffd4d4] text-[#0a0a0a] hover:bg-[#ffc4c4] mt-2"
                          onClick={() => toast.info('Shipping manifest form coming soon')}
                        >
                          <TruckIcon className="h-4 w-4 mr-2" />
                          View Manifest Template
                        </Button>
                      </>
                    )}
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

