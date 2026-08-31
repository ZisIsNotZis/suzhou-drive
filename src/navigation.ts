import type { RoadSegment, Vec } from './sim.ts';

export type LaneTurn = 'left' | 'right' | 'straight' | 'uturn' | 'unknown';
export type LaneDirection = 1 | -1;
export type MarkingStyle = 'dashed' | 'solid';
export type MarkingKind = 'center' | 'lane' | 'edge';
export type RoadMarkingMetadata = {
  laneMarkings?: string;
  roadMarking?: string;
  roadMarkingLanes?: string[];
  roadMarkingLanesForward?: string[];
  roadMarkingLanesBackward?: string[];
};

export type Lane = {
  id: string;
  index: number;
  direction: LaneDirection;
  turns: LaneTurn[];
};

export type LaneMarking = {
  kind: MarkingKind;
  style: MarkingStyle;
  start: Vec;
  end: Vec;
  lane?: number;
};

export type Maneuver = {
  segmentIndex: number;
  direction: LaneTurn;
  distance: number;
  recommendedLane?: string;
};

export type LaneRoute = {
  segmentIndices: number[];
  segments: RoadSegment[];
  lanes: Lane[];
  travelDirections?: LaneDirection[];
  waypoints: Vec[];
  distance: number;
  guidance: Maneuver[];
  nextManeuver?: Maneuver;
};

const pointKey = (p: Vec) => `${Math.round(p.x * 1000)},${Math.round(p.z * 1000)}`;
const length = (a: Vec, b: Vec) => Math.hypot(b.x - a.x, b.z - a.z);
const direction = (segment: RoadSegment, travel: LaneDirection) => travel > 0 ? { start: segment.a, end: segment.b } : { start: segment.b, end: segment.a };
const turn = (incoming: Vec, outgoing: Vec): LaneTurn => {
  const cross = incoming.x * outgoing.z - incoming.z * outgoing.x;
  const dot = incoming.x * outgoing.x + incoming.z * outgoing.z;
  const angle = Math.atan2(cross, dot);
  if (Math.abs(angle) < Math.PI / 6) return 'straight';
  if (Math.abs(angle) > Math.PI * 5 / 6) return 'uturn';
  // Coordinates use x/east and z/south, so positive cross is a right turn.
  return angle > 0 ? 'right' : 'left';
};

function laneTurns(value: string | undefined): LaneTurn[] {
  if (!value || value === 'none') return ['unknown'];
  return value.split(/[;|]/).map(part => {
    const name = part.trim().toLowerCase();
    if (name === 'left') return 'left';
    if (name === 'right') return 'right';
    if (name === 'through' || name === 'straight') return 'straight';
    if (name === 'uturn' || name === 'reverse') return 'uturn';
    return 'unknown';
  });
}

type MetadataRoadSegment = RoadSegment & RoadMarkingMetadata & {
  turnLanesForward?: string[];
  changeLanes?: string[];
  changeLanesForward?: string[];
  changeLanesBackward?: string[];
  turnLanesBackward?: string[];
};

const metadata = (segment: RoadSegment) => segment as MetadataRoadSegment;
const splitLanes = (value: string | undefined) => value?.split('|').map(part => part.trim());
const changeKind = (value: string | undefined) => value?.trim().toLowerCase().replace(/-/g, '_');

function laneChangeAllowed(value: string | undefined, from: number, to: number): boolean {
  if (from === to || !value) return true;
  const kind = changeKind(value);
  if (kind === 'no') return false;
  if (kind === 'not_left') return to <= from;
  if (kind === 'not_right') return to >= from;
  if (kind === 'only_left') return to > from;
  if (kind === 'only_right') return to < from;
  return true;
}

function turnLanesFor(segment: RoadSegment, travel: LaneDirection): string[] | undefined {
  const road = metadata(segment);
  return travel > 0 ? road.turnLanesForward ?? road.turnLanes : road.turnLanesBackward;
}

function changeLanesFor(segment: RoadSegment, travel: LaneDirection): string[] | undefined {
  const road = metadata(segment);
  return travel > 0 ? road.changeLanesForward ?? road.changeLanes : road.changeLanesBackward;
}

/**
 * Returns renderer-independent inferred markings. No markings are invented
 * when the segment has no usable lane count; styles are conservative defaults.
 */
export function laneMarkings(segment: RoadSegment): LaneMarking[] {
  const count = Math.floor(segment.lanes ?? 0);
  if (count < 1 || length(segment.a, segment.b) === 0 || segment.width <= 0) return [];
  const road = metadata(segment);
  const explicitMarking = (road.roadMarking ?? '').toLowerCase();
  const hasNoMarkings = road.laneMarkings?.toLowerCase() === 'no' || explicitMarking === 'no' || explicitMarking === 'none';
  if (hasNoMarkings) return [];
  const dx = (segment.b.x - segment.a.x) / length(segment.a, segment.b);
  const dz = (segment.b.z - segment.a.z) / length(segment.a, segment.b);
  const nx = -dz, nz = dx;
  const at = (offset: number): LaneMarking['start'] => ({ x: segment.a.x + nx * offset, z: segment.a.z + nz * offset });
  const metadataStyles = road.roadMarkingLanesForward ?? road.roadMarkingLanes ?? splitLanes(road.roadMarking?.includes('|') ? road.roadMarking : undefined);
  const parseStyle = (value: string | undefined): MarkingStyle | undefined => {
    const normalized = value?.toLowerCase().trim();
    if (normalized === 'solid' || normalized === 'solid_line' || normalized === 'continuous' || normalized === 'double_solid') return 'solid';
    if (normalized === 'dashed' || normalized === 'dashed_line' || normalized === 'broken' || normalized === 'dotted') return 'dashed';
    return undefined;
  };
  const metadataStyle = (index: number) => parseStyle(metadataStyles?.[index]) ?? parseStyle(road.roadMarking);
  const line = (kind: MarkingKind, style: MarkingStyle, offset: number, lane?: number): LaneMarking => ({ kind, style: metadataStyle(lane === undefined ? 0 : lane - 1) ?? style, start: at(offset), end: { x: segment.b.x + nx * offset, z: segment.b.z + nz * offset }, lane });
  const laneWidth = segment.width / count;
  const result: LaneMarking[] = [line('edge', 'solid', -segment.width / 2), line('edge', 'solid', segment.width / 2)];
  for (let i = 1; i < count; i++) {
    const offset = -segment.width / 2 + laneWidth * i;
    result.push(line(!segment.oneway && i * 2 === count ? 'center' : 'lane', 'dashed', offset, i));
  }
  if (!segment.oneway && !result.some(marking => marking.kind === 'center')) result.push(line('center', 'solid', 0));
  return result;
}

export const buildRoadMarkings = laneMarkings;

function lanesFor(segment: RoadSegment, travel: LaneDirection): Lane[] {
  const turnLaneValues = turnLanesFor(segment, travel);
  const count = Math.max(1, Math.floor(segment.lanes ?? turnLaneValues?.length ?? 1));
  return Array.from({ length: count }, (_, index) => ({
    id: `${segment.sourceId ?? 'road'}:lane-${index}`,
    index,
    direction: travel,
    turns: laneTurns(turnLaneValues?.[index]),
  }));
}

function targetLane(maneuver: LaneTurn, from: number, outgoingCount: number): number {
  if (maneuver === 'left') return outgoingCount - 1;
  if (maneuver === 'right') return 0;
  return Math.min(from, outgoingCount - 1);
}

/** True when at least one explicitly described incoming lane can make the turn. */
export function isLegalLaneTransition(incoming: RoadSegment, incomingTravel: LaneDirection, outgoing: RoadSegment, outgoingTravel: LaneDirection, maneuver: LaneTurn): boolean {
  const incomingLanes = lanesFor(incoming, incomingTravel);
  const outgoingCount = Math.max(1, Math.floor(outgoing.lanes ?? turnLanesFor(outgoing, outgoingTravel)?.length ?? 1));
  const described = incomingLanes.some(lane => !lane.turns.includes('unknown'));
  const candidates = described ? incomingLanes.filter(lane => lane.turns.includes(maneuver)) : incomingLanes;
  const changes = changeLanesFor(incoming, incomingTravel);
  return candidates.some(lane => laneChangeAllowed(changes?.[lane.index], lane.index, targetLane(maneuver, lane.index, outgoingCount)));
}

function maneuverBetween(incoming: RoadSegment, incomingTravel: LaneDirection, outgoing: RoadSegment, outgoingTravel: LaneDirection): LaneTurn {
  const a = direction(incoming, incomingTravel), b = direction(outgoing, outgoingTravel);
  return turn({ x: a.end.x - a.start.x, z: a.end.z - a.start.z }, { x: b.end.x - b.start.x, z: b.end.z - b.start.z });
}

function nearestEndpoint(segments: RoadSegment[], point: Vec): { segment: number; node: string } {
  let best = { segment: 0, node: pointKey(segments[0].a), distance: Infinity };
  segments.forEach((segment, index) => {
    for (const endpoint of [segment.a, segment.b]) {
      const distance = length(endpoint, point);
      if (distance < best.distance) best = { segment: index, node: pointKey(endpoint), distance };
    }
  });
  return best;
}

/** Finds a shortest, endpoint-connected route and attaches lane/maneuver data. */
export function buildLaneRoute(segments: RoadSegment[], start: number | Vec, destination: number | Vec): LaneRoute | undefined {
  if (!segments.length) return undefined;
  const startInfo = typeof start === 'number' ? { segment: start, node: pointKey(segments[start]?.a ?? segments[0].a) } : nearestEndpoint(segments, start);
  const endInfo = typeof destination === 'number' ? { segment: destination, node: pointKey(segments[destination]?.b ?? segments[segments.length - 1].b) } : nearestEndpoint(segments, destination);
  if (!segments[startInfo.segment] || !segments[endInfo.segment]) return undefined;

  type Edge = { segment: number; travel: LaneDirection; from: string; to: string; cost: number };
  const edges: Edge[] = [];
  segments.forEach((segment, segmentIndex) => {
    const add = (travel: LaneDirection) => { const points = direction(segment, travel); edges.push({ segment: segmentIndex, travel, from: pointKey(points.start), to: pointKey(points.end), cost: length(points.start, points.end) }); };
    add(1);
    if (!segment.oneway) add(-1);
  });
  const outgoing = new Map<string, Edge[]>();
  for (const edge of edges) outgoing.set(edge.from, [...(outgoing.get(edge.from) ?? []), edge]);
  const stateKey = (node: string, edge?: Edge) => `${node}|${edge ? `${edge.segment}:${edge.travel}` : 'start'}`;
  const startState = stateKey(startInfo.node);
  const distance = new Map<string, number>([[startState, 0]]), states = new Map<string, { node: string; incoming?: Edge }>([[startState, { node: startInfo.node }]]), previous = new Map<string, { state: string; edge: Edge }>();
  const pending = [startState];
  while (pending.length) {
    pending.sort((a, b) => (distance.get(a) ?? Infinity) - (distance.get(b) ?? Infinity));
    const state = pending.shift()!;
    const current = states.get(state)!;
    const node = current.node;
    for (const edge of outgoing.get(node) ?? []) {
      if (current.incoming && !isLegalLaneTransition(segments[current.incoming.segment], current.incoming.travel, segments[edge.segment], edge.travel, maneuverBetween(segments[current.incoming.segment], current.incoming.travel, segments[edge.segment], edge.travel))) continue;
      const nextState = stateKey(edge.to, edge);
      const next = (distance.get(state) ?? Infinity) + edge.cost;
      if (next < (distance.get(nextState) ?? Infinity)) { distance.set(nextState, next); states.set(nextState, { node: edge.to, incoming: edge }); previous.set(nextState, { state, edge }); pending.push(nextState); }
    }
  }
  // A segment destination is reached at either endpoint; this keeps Vec routes non-teleporting.
  const targetNode = typeof destination === 'number' ? endInfo.node : [pointKey(segments[endInfo.segment].a), pointKey(segments[endInfo.segment].b)].find(node => [...states.values()].some(state => state.node === node));
  const target = [...states.entries()].filter(([state, value]) => value.node === targetNode && distance.has(state)).sort((a, b) => (distance.get(a[0]) ?? Infinity) - (distance.get(b[0]) ?? Infinity))[0]?.[0];
  if (!target || !distance.has(target)) return undefined;
  const routeEdges: Edge[] = [];
  for (let state = target; state !== startState;) { const step = previous.get(state); if (!step) return undefined; routeEdges.unshift(step.edge); state = step.state; }
  if (!routeEdges.length) return undefined;
  if (typeof start === 'number' && routeEdges[0]?.segment !== startInfo.segment) return undefined;
  const segmentIndices = routeEdges.map(edge => edge.segment);
  const routeSegments = routeEdges.map(edge => segments[edge.segment]);
  const waypoints = [direction(routeSegments[0], routeEdges[0].travel).start, ...routeEdges.map((edge, index) => direction(segments[edge.segment], edge.travel).end)];
  const maneuvers: Maneuver[] = [];
  let travelled = 0;
  for (let i = 1; i < routeEdges.length; i++) {
    const incoming = direction(segments[routeEdges[i - 1].segment], routeEdges[i - 1].travel);
    const outgoing = direction(segments[routeEdges[i].segment], routeEdges[i].travel);
    const maneuver = turn({ x: incoming.end.x - incoming.start.x, z: incoming.end.z - incoming.start.z }, { x: outgoing.end.x - outgoing.start.x, z: outgoing.end.z - outgoing.start.z });
    const lane = lanesFor(segments[routeEdges[i - 1].segment], routeEdges[i - 1].travel).find(candidate => candidate.turns.includes(maneuver));
    maneuvers.push({ segmentIndex: routeEdges[i].segment, direction: maneuver, distance: travelled + length(incoming.start, incoming.end), recommendedLane: lane?.id });
    travelled += length(incoming.start, incoming.end);
  }
  const total = routeEdges.reduce((sum, edge) => sum + edge.cost, 0);
  return { segmentIndices, segments: routeSegments, lanes: lanesFor(routeSegments[0], routeEdges[0].travel), travelDirections: routeEdges.map(edge => edge.travel), waypoints, distance: total, guidance: maneuvers, nextManeuver: maneuvers[0] };
}

function nearestRouteDirection(position: Vec, route: LaneRoute): Vec | undefined {
  let best = Infinity;
  let result: Vec | undefined;
  route.segments.forEach((segment, index) => {
    const dx = segment.b.x - segment.a.x, dz = segment.b.z - segment.a.z, denominator = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((position.x - segment.a.x) * dx + (position.z - segment.a.z) * dz) / denominator));
    const point = { x: segment.a.x + dx * t, z: segment.a.z + dz * t };
    const distance = length(position, point);
    if (distance < best) {
      best = distance;
      const travel = route.travelDirections?.[index] ?? 1;
      result = { x: (travel > 0 ? dx : -dx), z: (travel > 0 ? dz : -dz) };
    }
  });
  return result;
}

/** Detects a vehicle travelling more than 90 degrees against its route. */
export function isWrongWay(position: Vec, heading: number, route: LaneRoute, tolerance = Math.PI / 2): boolean {
  const expected = nearestRouteDirection(position, route);
  if (!expected || Math.hypot(expected.x, expected.z) < .000001) return false;
  const vehicle = { x: Math.sin(heading), z: Math.cos(heading) };
  return vehicle.x * expected.x + vehicle.z * expected.z < Math.cos(tolerance) * Math.hypot(expected.x, expected.z);
}

/** Rebuilds a route once when the vehicle is travelling against its direction. */
export function rerouteIfWrongWay(vehicle: { position: Vec; heading: number }, route: LaneRoute, recalculate: () => LaneRoute | undefined, tolerance = Math.PI / 2): LaneRoute | undefined {
  return isWrongWay(vehicle.position, vehicle.heading, route, tolerance) ? recalculate() : route;
}
