import test from 'node:test';
import { strict as assert } from 'node:assert';
import { buildLaneRoute, isLegalLaneTransition, isWrongWay, laneMarkings, rerouteIfWrongWay } from './navigation.ts';
import type { RoadSegment } from './sim.ts';

const road = (a: [number, number], b: [number, number], extra: Partial<RoadSegment> & Record<string, unknown> = {}): RoadSegment => ({ a: { x: a[0], z: a[1] }, b: { x: b[0], z: b[1] }, width: 10, lanes: 2, ...extra } as RoadSegment);

test('lane markings distinguish edges, center, and dashed lane separators', () => {
  const markings = laneMarkings(road([0, 0], [10, 0]));
  assert.equal(markings.filter(marking => marking.kind === 'edge').length, 2);
  assert.equal(markings.find(marking => marking.kind === 'center')?.style, 'dashed');
  assert.equal(markings.every(marking => marking.kind === 'edge' ? marking.style === 'solid' : true), true);
  assert.deepEqual(laneMarkings(road([0, 0], [10, 0], { lanes: undefined })), []);
});

test('oneway prevents reverse traversal and turn lanes provide lane IDs/directions', () => {
  const segments = [road([0, 0], [10, 0], { sourceId: 'oneway', oneway: true, turnLanes: ['left', 'through|right'] }), road([10, 0], [10, 10], { sourceId: 'north' })];
  const route = buildLaneRoute(segments, 0, 1);
  assert.ok(route);
  assert.deepEqual(route.segmentIndices, [0, 1]);
  assert.deepEqual(route.lanes.map(lane => lane.id), ['oneway:lane-0', 'oneway:lane-1']);
  assert.deepEqual(route.lanes.map(lane => lane.direction), [1, 1]);
  assert.equal(route.nextManeuver?.direction, 'right');
  assert.equal(route.nextManeuver?.recommendedLane, 'oneway:lane-1');
  assert.equal(buildLaneRoute(segments, { x: 10, z: 0 }, { x: 0, z: 0 }), undefined);
});

test('route distance and guidance remain unknown when turn metadata is absent', () => {
  const route = buildLaneRoute([road([0, 0], [10, 0]), road([10, 0], [10, -10])], 0, 1);
  assert.ok(route);
  assert.equal(route.distance, 20);
  assert.equal(route.nextManeuver?.direction, 'left');
  assert.equal(route.nextManeuver?.recommendedLane, undefined);
});

test('wrong-way detection compares vehicle heading with route travel direction', () => {
  const route = buildLaneRoute([road([0, 0], [10, 0], { oneway: true })], 0, 0)!;
  assert.equal(isWrongWay({ x: 5, z: 0 }, Math.PI / 2, route), false);
  assert.equal(isWrongWay({ x: 5, z: 0 }, -Math.PI / 2, route), true);
});

test('reroute helper only calls recalculation for a wrong-way vehicle', () => {
  const route = buildLaneRoute([road([0, 0], [10, 0], { oneway: true })], 0, 0)!;
  let calls = 0;
  const recalculated = { ...route, distance: 99 };
  assert.equal(rerouteIfWrongWay({ position: { x: 5, z: 0 }, heading: Math.PI / 2 }, route, () => { calls++; return recalculated; }), route);
  assert.equal(rerouteIfWrongWay({ position: { x: 5, z: 0 }, heading: -Math.PI / 2 }, route, () => { calls++; return recalculated; }), recalculated);
  assert.equal(calls, 1);
});

test('change:lanes and turn:lanes reject an illegal lane transition', () => {
  const incoming = road([0, 0], [10, 0], { lanes: 2, turnLanes: ['through', 'right'], changeLanes: ['not_right', ''] });
  const right = road([10, 0], [10, 10], { lanes: 1 });
  const left = road([10, 0], [10, -10], { lanes: 1 });
  assert.equal(isLegalLaneTransition(incoming, 1, right, 1, 'right'), true);
  assert.equal(isLegalLaneTransition(incoming, 1, left, 1, 'left'), false);
});

test('explicit road marking metadata overrides inferred marking style', () => {
  const markings = laneMarkings(road([0, 0], [10, 0], { roadMarkingLanes: ['solid'] }));
  assert.equal(markings.find(marking => marking.kind !== 'edge')?.style, 'solid');
  assert.deepEqual(laneMarkings(road([0, 0], [10, 0], { laneMarkings: 'no' })), []);
});
