import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Maximize, Minus, Plus } from 'lucide-react'
import { EDGES } from '@/data/finance'
import { formatINRCompact } from '@/lib/format'
import { useBlueprintStore } from '@/store/blueprint'
import { useFinanceStore } from '@/store/finance'
import { CATEGORY_COLORS } from '@/components/blueprint/meta'
import type { EdgeRelation, FinNode } from '@/types/finance'

const EDGE_STYLES: Record<EdgeRelation, { stroke: string; dash?: string; flow?: boolean }> = {
  funds: { stroke: '#14b8a6', dash: '6 5', flow: true },
  protects: { stroke: '#a78bfa', dash: '2 4' },
  owes: { stroke: '#f59e0b' },
  plans: { stroke: 'var(--muted-foreground)' },
  shields: { stroke: '#10b981', dash: '2 4' },
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string
  data: FinNode
  r: number
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  relation: EdgeRelation
}

/** Node radius scaled by the money it represents. */
function radiusFor(node: FinNode): number {
  switch (node.category) {
    case 'self':
      return 34
    case 'goal':
      return 16 + Math.sqrt(node.targetAmount / 65000000) * 14
    case 'investment':
      return 12 + Math.sqrt(node.currentValue / 1860000) * 9
    case 'loan':
      return 13 + Math.sqrt(node.outstanding / 3260000) * 8
    case 'insurance':
      return 14
    case 'emergency':
      return 16
  }
}

/** Headline figure rendered inside larger nodes. */
function nodeAmount(node: FinNode): string | null {
  switch (node.category) {
    case 'self':
      return null
    case 'goal':
      return formatINRCompact(node.targetAmount)
    case 'investment':
      return formatINRCompact(node.currentValue)
    case 'loan':
      return formatINRCompact(node.outstanding)
    case 'insurance':
      return formatINRCompact(node.cover)
    case 'emergency':
      return formatINRCompact(node.currentAmount)
  }
}

const LINK_DISTANCE: Record<EdgeRelation, number> = {
  plans: 135,
  funds: 105,
  protects: 150,
  owes: 145,
  shields: 125,
}

/**
 * Build the force simulation and settle it synchronously so the graph is
 * fully laid out on first paint. The returned (still-paused) simulation is
 * restarted by an effect to keep drag interactions physical.
 */
function buildSimulation(visible: FinNode[]) {
  const ids = new Set(visible.map((n) => n.id))

  const simNodes: SimNode[] = visible.map((data, i) => {
    // Seed positions in category rings around the centre for a stable settle.
    const ring = data.category === 'self' ? 0 : data.category === 'goal' ? 150 : 265
    const angle = (i / visible.length) * Math.PI * 2
    return {
      id: data.id,
      data,
      r: radiusFor(data),
      x: Math.cos(angle) * ring,
      y: Math.sin(angle) * ring,
    }
  })

  const simLinks: SimLink[] = EDGES.filter((e) => ids.has(e.source) && ids.has(e.target)).map(
    (e) => ({ source: e.source, target: e.target, relation: e.relation }),
  )

  const sim = d3
    .forceSimulation(simNodes)
    .force(
      'link',
      d3
        .forceLink<SimNode, SimLink>(simLinks)
        .id((d) => d.id)
        .distance((l) => LINK_DISTANCE[l.relation])
        .strength(0.5),
    )
    .force('charge', d3.forceManyBody().strength(-520))
    .force(
      'collide',
      d3.forceCollide<SimNode>().radius((d) => d.r + 26),
    )
    .force('x', d3.forceX(0).strength(0.055))
    .force('y', d3.forceY(0).strength(0.075))
    .stop()

  sim.tick(180)
  return { sim, simNodes, simLinks }
}

export function NodeGraph() {
  const svgRef = useRef<SVGSVGElement>(null)
  const transformRef = useRef(d3.zoomIdentity)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const dragRef = useRef<{ node: SimNode; moved: boolean } | null>(null)

  const [transform, setTransform] = useState(d3.zoomIdentity)
  // Bumped on every simulation tick to re-render the mutated node positions.
  const [, setTick] = useState(0)

  const selectedId = useBlueprintStore((s) => s.selectedId)
  const hoveredId = useBlueprintStore((s) => s.hoveredId)
  const hiddenCategories = useBlueprintStore((s) => s.hiddenCategories)
  const select = useBlueprintStore((s) => s.select)
  const hover = useBlueprintStore((s) => s.hover)

  const allNodes = useFinanceStore((s) => s.nodes)
  const visible = useMemo(
    () => allNodes.filter((n) => !hiddenCategories.includes(n.category)),
    [allNodes, hiddenCategories],
  )

  const { sim, simNodes, simLinks } = useMemo(() => buildSimulation(visible), [visible])

  /* Subscribe to simulation ticks (drag physics) and stop it on unmount. */
  useEffect(() => {
    sim.on('tick', () => setTick((t) => t + 1))
    return () => {
      sim.stop()
    }
  }, [sim])

  /* Pan & zoom on the canvas (node drags are excluded via the filter). */
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.45, 2.5])
      .filter((event: PointerEvent | WheelEvent) => {
        const target = event.target as Element
        return !target.closest('[data-node]')
      })
      .on('zoom', (event) => {
        transformRef.current = event.transform
        setTransform(event.transform)
      })
    d3.select(svg).call(zoom).on('dblclick.zoom', null)
    zoomRef.current = zoom
    return () => {
      d3.select(svg).on('.zoom', null)
      zoomRef.current = null
    }
  }, [])

  /* On-canvas view controls (also make pan/zoom obvious on touch devices). */
  function zoomBy(factor: number) {
    const svg = svgRef.current
    if (!svg || !zoomRef.current) return
    d3.select(svg).transition().duration(220).call(zoomRef.current.scaleBy, factor)
  }

  function resetView() {
    const svg = svgRef.current
    if (!svg || !zoomRef.current) return
    d3.select(svg).transition().duration(320).call(zoomRef.current.transform, d3.zoomIdentity)
  }

  /* Pointer coordinates → simulation space (through viewBox + zoom). */
  function simPoint(event: React.PointerEvent): [number, number] {
    const [px, py] = d3.pointer(event.nativeEvent, svgRef.current!)
    return transformRef.current.invert([px, py])
  }

  function onNodePointerDown(event: React.PointerEvent, node: SimNode) {
    event.stopPropagation()
    try {
      ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture can fail for synthetic/stale pointers — dragging
      // still works through the React pointer-move events.
    }
    dragRef.current = { node, moved: false }
    node.fx = node.x
    node.fy = node.y
    sim.alphaTarget(0.25).restart()
  }

  function onNodePointerMove(event: React.PointerEvent) {
    const drag = dragRef.current
    if (!drag) return
    const [x, y] = simPoint(event)
    if (!drag.moved) {
      const dx = (drag.node.x ?? 0) - x
      const dy = (drag.node.y ?? 0) - y
      if (Math.hypot(dx, dy) > 4) drag.moved = true
    }
    drag.node.fx = x
    drag.node.fy = y
  }

  function onNodePointerUp(event: React.PointerEvent, node: SimNode) {
    const drag = dragRef.current
    dragRef.current = null
    node.fx = null
    node.fy = null
    sim.alphaTarget(0)
    if (drag && !drag.moved) {
      event.stopPropagation()
      select(selectedId === node.id ? null : node.id)
    }
  }

  /* Dependency highlighting: hovering or selecting a node lights up its
     direct relationships and dims the rest of the graph. */
  const activeId = hoveredId ?? selectedId
  const neighborIds = useMemo(() => {
    if (!activeId) return null
    const set = new Set<string>([activeId])
    for (const e of EDGES) {
      if (e.source === activeId) set.add(e.target)
      if (e.target === activeId) set.add(e.source)
    }
    return set
  }, [activeId])

  return (
    <>
      <svg
      ref={svgRef}
      viewBox="-460 -340 920 680"
      role="application"
      aria-label="Interactive financial node graph. Drag nodes, scroll to zoom, click a node for details."
      className="size-full min-h-105 cursor-grab touch-none select-none active:cursor-grabbing"
      onPointerDown={() => select(null)}
    >
      <g transform={transform.toString()}>
        {/* Edges */}
        {simLinks.map((link, i) => {
          const s = link.source as SimNode
          const t = link.target as SimNode
          const style = EDGE_STYLES[link.relation]
          const touchesActive = activeId != null && (s.id === activeId || t.id === activeId)
          const dimmed = activeId != null && !touchesActive
          return (
            <line
              key={i}
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke={style.stroke}
              strokeWidth={touchesActive ? 2.4 : 1.4}
              strokeDasharray={style.dash}
              strokeLinecap="round"
              className={style.flow ? 'edge-flow' : undefined}
              opacity={dimmed ? 0.07 : touchesActive ? 0.95 : 0.45}
            />
          )
        })}

        {/* Nodes */}
        {simNodes.map((node) => {
          const color = CATEGORY_COLORS[node.data.category]
          const isActive = node.id === activeId
          const isSelected = node.id === selectedId
          const dimmed = neighborIds != null && !neighborIds.has(node.id)
          const amount = nodeAmount(node.data)
          return (
            <g
              key={node.id}
              data-node
              transform={`translate(${node.x ?? 0},${node.y ?? 0})`}
              opacity={dimmed ? 0.18 : 1}
              className="cursor-pointer transition-opacity duration-200"
              onPointerDown={(e) => onNodePointerDown(e, node)}
              onPointerMove={onNodePointerMove}
              onPointerUp={(e) => onNodePointerUp(e, node)}
              onPointerEnter={() => hover(node.id)}
              onPointerLeave={() => hover(null)}
            >
              {/* Selection halo */}
              {isSelected && (
                <circle r={node.r + 7} fill="none" stroke={color} strokeWidth={2} opacity={0.5}>
                  <animate
                    attributeName="r"
                    values={`${node.r + 5};${node.r + 10};${node.r + 5}`}
                    dur="2.2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle
                r={node.r}
                fill={color}
                fillOpacity={node.data.category === 'self' ? 1 : 0.92}
                stroke="var(--background)"
                strokeWidth={2}
                style={
                  isActive
                    ? {
                        filter: `drop-shadow(0 0 10px ${color === 'var(--primary)' ? '#6366f1' : color})`,
                      }
                    : undefined
                }
              />
              {/* Figure inside the node */}
              {node.data.category === 'self' ? (
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  fontSize={12}
                  fontWeight={700}
                  fill="#fff"
                  pointerEvents="none"
                >
                  You
                </text>
              ) : (
                amount &&
                node.r >= 15 && (
                  <text
                    textAnchor="middle"
                    dy="0.35em"
                    fontSize={node.r >= 22 ? 10 : 8.5}
                    fontWeight={700}
                    fill="#fff"
                    pointerEvents="none"
                  >
                    {amount}
                  </text>
                )
              )}
              {/* Label under the node */}
              <text
                textAnchor="middle"
                y={node.r + 15}
                fontSize={11}
                fontWeight={600}
                fill="var(--foreground)"
                stroke="var(--background)"
                strokeWidth={3.5}
                paintOrder="stroke"
                pointerEvents="none"
              >
                {node.data.label}
              </text>
            </g>
          )
        })}
      </g>
      </svg>

      {/* View controls */}
      <div className="absolute left-3 top-3 z-10 flex flex-col overflow-hidden rounded-lg border bg-card/90 shadow-sm backdrop-blur">
        <button
          aria-label="Zoom in"
          onClick={() => zoomBy(1.35)}
          className="grid size-9 place-items-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Plus className="size-4" />
        </button>
        <button
          aria-label="Zoom out"
          onClick={() => zoomBy(1 / 1.35)}
          className="grid size-9 place-items-center border-t text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Minus className="size-4" />
        </button>
        <button
          aria-label="Reset view"
          onClick={resetView}
          className="grid size-9 place-items-center border-t text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Maximize className="size-4" />
        </button>
      </div>

      {/* Relationship legend — makes the dependency lines self-explanatory */}
      <div className="absolute bottom-3 left-3 z-10 hidden flex-col gap-1.5 rounded-lg border bg-card/90 p-3 backdrop-blur sm:flex">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Relationships
        </span>
        {(
          [
            ['funds', 'Funds a goal'],
            ['protects', 'Protects'],
            ['owes', 'Liability'],
            ['shields', 'Safety net'],
          ] as const
        ).map(([relation, label]) => (
          <span key={relation} className="flex items-center gap-2 text-xs text-muted-foreground">
            <svg width="26" height="4" aria-hidden>
              <line
                x1="1"
                y1="2"
                x2="25"
                y2="2"
                stroke={EDGE_STYLES[relation].stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={EDGE_STYLES[relation].dash}
              />
            </svg>
            {label}
          </span>
        ))}
      </div>
    </>
  )
}
