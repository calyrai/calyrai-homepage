import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import ReactFlow, { Background, Controls, Handle, MarkerType, MiniMap, Position } from "reactflow";
import "reactflow/dist/style.css";
import "./brix-flow.css";
import "./brix-contract.css";

const accentMap = { green:"#34c759", orange:"#ff8c1a", cyan:"#00c7ff", red:"#ff3b30", violet:"#7d42ff", magenta:"#ff2d92", blue:"#2f6bff", yellow:"#ffd60a", pink:"#ff6da8" };

function IdeaNode({ data, selected }) {
  return <article className={`idea-node ${selected ? "is-selected" : ""}`} style={{ "--idea-accent": data.color }}>
    <span>{String(data.index).padStart(2, "0")} / {data.domain}</span><strong>{data.title}</strong><small>Independent surrogate</small>
  </article>;
}

function StepNode({ data }) {
  return <article className="step-node" style={{ "--idea-accent": data.color }}>
    <Handle type="target" position={Position.Left}/><span>{String(data.index).padStart(2,"0")}</span><strong>{data.label}</strong><Handle type="source" position={Position.Right}/>
  </article>;
}

function Field({ label, children }) {
  if (!children || (Array.isArray(children) && !children.length)) return null;
  return <section className="algorithm-field"><span>{label}</span>{Array.isArray(children) ? <ul>{children.map((item)=><li key={item}>{item}</li>)}</ul> : <p>{children}</p>}</section>;
}

const nodeTypes = { idea: IdeaNode, step: StepNode };

function BrixFlow({ concepts }) {
  const [activeId, setActiveId] = useState(concepts[0]?.id);
  const [activeStep, setActiveStep] = useState(0);
  const active = concepts.find((item) => item.id === activeId) || concepts[0];
  useEffect(() => setActiveStep(0), [activeId]);
  const ideaNodes = useMemo(() => concepts.map((item,index) => ({ id:item.id, type:"idea", position:{x:(index%3)*310,y:Math.floor(index/3)*175}, data:{...item,color:accentMap[item.accent]||"#00c7ff"} })), [concepts]);
  const stepNodes = useMemo(() => active.flow.map((label,index) => ({ id:`${active.id}-${index}`, type:"step", position:{x:index*225,y:index%2?150:25}, data:{label,index:index+1,color:accentMap[active.accent]||"#00c7ff"} })), [active]);
  const stepEdges = useMemo(() => active.flow.slice(1).map((_,index) => ({ id:`${active.id}-edge-${index}`, source:`${active.id}-${index}`, target:`${active.id}-${index+1}`, type:"step", markerEnd:{type:MarkerType.ArrowClosed,color:"#f2f7ff"}, style:{stroke:"#f2f7ff",strokeWidth:1.2} })), [active]);
  const selectedFunction = active.functions[activeStep];
  const functionInput = activeStep === 0 ? (active.inputs || []).join(" · ") : active.flow[activeStep - 1];
  const functionReturn = activeStep === active.flow.length - 1 ? (active.outputs || []).join(" · ") : active.flow[activeStep + 1];

  return <div className="brix-flow-system">
    <section className="brix-flow-map"><header><span>01 / Idea index</span><strong>Select an independent surrogate</strong></header><div className="brix-flow-canvas">
      <ReactFlow nodes={ideaNodes} edges={[]} nodeTypes={nodeTypes} onNodeClick={(_,node)=>setActiveId(node.id)} fitView minZoom={0.55} maxZoom={1.35} proOptions={{hideAttribution:true}}><Background variant="dots" gap={22} size={1.2} color="#343a45"/><Controls showInteractive={false}/><MiniMap nodeColor={(node)=>node.data.color} maskColor="rgba(5,7,11,.78)"/></ReactFlow>
    </div></section>
    <section className="brix-flow-detail" style={{"--idea-accent":accentMap[active.accent]||"#00c7ff"}}><div className="brix-flow-copy"><span>02 / {active.domain}</span><h3>{active.title}</h3><p>{active.summary}</p><dl><dt>Maturity</dt><dd>{active.maturity}</dd><dt>License boundary</dt><dd>{active.license}</dd><dt>Code status</dt><dd>{active.code?.repository ? <a href={active.code.repository}>{active.code.status} · open repository</a> : `${active.code?.status || "planned"} · repository link not assigned`}</dd></dl></div><div className="brix-step-canvas">
      <ReactFlow nodes={stepNodes} edges={stepEdges} nodeTypes={nodeTypes} onNodeClick={(_,node)=>setActiveStep(Number(node.id.split("-").at(-1)))} fitView minZoom={0.55} maxZoom={1.35} proOptions={{hideAttribution:true}}><Background variant="dots" gap={22} size={1.2} color="#343a45"/><Controls showInteractive={false}/></ReactFlow>
    </div><div className="function-inspector"><header><span>03 / Algorithm function</span><strong>{active.flow[activeStep]}</strong></header><div className="function-signature"><code>{selectedFunction.name}()</code><p>{selectedFunction.role}</p><dl><dt>Receives</dt><dd>{functionInput}</dd><dt>Returns / advances to</dt><dd>{functionReturn}</dd></dl></div></div><div className="algorithm-contract"><header><span>04 / Public algorithm contract</span><strong>Architecture disclosed. Sensitive implementation retained.</strong></header><div className="algorithm-grid"><Field label="Upstream systems">{active.upstream}</Field><Field label="Inputs">{active.inputs}</Field><Field label="Outputs">{active.outputs}</Field><Field label="Scientific method">{active.method}</Field><Field label="Uncertainty">{active.uncertainty}</Field><Field label="Validation">{active.validation}</Field><Field label="Evidence & provenance">{active.evidence}</Field><Field label="Protected boundary">{active.disclosure}</Field></div></div></section>
  </div>;
}

const rootElement=document.getElementById("brix-flow-root");
const dataElement=document.getElementById("brix-flow-data");
if(rootElement&&dataElement) createRoot(rootElement).render(<BrixFlow concepts={JSON.parse(dataElement.textContent)}/>);
