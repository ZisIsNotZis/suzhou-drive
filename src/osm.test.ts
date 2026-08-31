import test from 'node:test';
import { strict as assert } from 'node:assert';
import { parseOSM } from './osm.ts';

test('parses OSM nodes, roads, buildings and water into local metres',()=>{
  const xml='<osm><node id="1" lat="31.30" lon="120.60"/><node id="2" lat="31.30" lon="120.601"/><node id="3" lat="31.301" lon="120.601"/><way id="r"><nd ref="1"/><nd ref="2"/><tag k="highway" v="primary"/><tag k="lanes" v="3"/><tag k="bridge" v="yes"/></way><way id="b"><nd ref="1"/><nd ref="2"/><nd ref="3"/><tag k="building" v="yes"/><tag k="building:levels" v="4"/></way></osm>';
  const world=parseOSM(xml); assert.equal(world.roads[0].lanes,3); assert.equal(world.roads[0].elevation,1); assert.equal(world.buildings[0].height,12); assert.ok(world.roads[0].points[1].x>90);
});

test('does not turn linear waterways into filled water polygons',()=>{
  const xml='<osm><node id="1" lat="31.30" lon="120.60"/><node id="2" lat="31.30" lon="120.601"/><node id="3" lat="31.301" lon="120.601"/><way id="river"><nd ref="1"/><nd ref="2"/><nd ref="3"/><tag k="waterway" v="river"/></way><way id="lake"><nd ref="1"/><nd ref="2"/><nd ref="3"/><nd ref="1"/><tag k="natural" v="water"/></way></osm>';
  const world=parseOSM(xml);
  assert.deepEqual(world.water.map(w=>w.id),['lake']);
});

test('layer ordering does not invent an elevated road',()=>{
  const world=parseOSM('<osm><node id="a" lat="31.3" lon="120.6"/><node id="b" lat="31.3" lon="120.601"/><way id="r"><nd ref="a"/><nd ref="b"/><tag k="highway" v="primary"/><tag k="layer" v="2"/></way></osm>');
  assert.equal(world.roads[0].elevation,0);
});
test('keeps a road over water drivable and removes repeated geometry points',()=>{
  const world=parseOSM('<osm><node id="a" lat="31.3" lon="120.6"/><node id="b" lat="31.3" lon="120.601"/><node id="c" lat="31.301" lon="120.601"/><way id="crossing"><nd ref="a"/><nd ref="b"/><nd ref="b"/><nd ref="c"/><nd ref="a"/><tag k="highway" v="primary"/><tag k="bridge" v="yes"/><tag k="natural" v="water"/></way></osm>');
  assert.equal(world.roads.length,1);
  assert.equal(world.water.length,0);
  assert.equal(world.roads[0].points.length,4);
  assert.ok(Number.isFinite(world.roads[0].elevation));
});
test('bridge elevation does not depend on layer ordering',()=>{
  const world=parseOSM('<osm><node id="a" lat="31.3" lon="120.6"/><node id="b" lat="31.3" lon="120.601"/><way id="bridge"><nd ref="a"/><nd ref="b"/><tag k="highway" v="secondary"/><tag k="bridge" v="yes"/><tag k="layer" v="7"/></way></osm>');
  assert.equal(world.roads[0].elevation,1);
});
test('parses numeric and unit-bearing speed values as km/h',()=>{
  const world=parseOSM('<osm><node id="a" lat="31.3" lon="120.6"/><node id="b" lat="31.3" lon="120.601"/><way id="r"><nd ref="a"/><nd ref="b"/><tag k="highway" v="primary"/><tag k="maxspeed" v="40 km/h"/></way><way id="mph"><nd ref="a"/><nd ref="b"/><tag k="highway" v="secondary"/><tag k="maxspeed" v="30 mph"/></way></osm>');
  assert.equal(world.roads[0].maxspeed,40);
  assert.equal(world.roads[1].maxspeed,30*1.609344);
});
test('parses lane turn directions without inventing missing metadata',()=>{
  const world=parseOSM('<osm><node id="a" lat="31.3" lon="120.6"/><node id="b" lat="31.3" lon="120.601"/><way id="r"><nd ref="a"/><nd ref="b"/><tag k="highway" v="primary"/><tag k="lanes" v="3"/><tag k="turn:lanes" v="left||right"/></way><way id="plain"><nd ref="a"/><nd ref="b"/><tag k="highway" v="residential"/><tag k="lanes" v="2"/></way></osm>');
  assert.deepEqual(world.roads[0].turnLanes,['left','','right']);
  assert.equal(world.roads[1].turnLanes,undefined);
});
test('preserves lane topology and road marking metadata',()=>{
  const world=parseOSM('<osm><node id="a" lat="31.3" lon="120.6"/><node id="b" lat="31.3" lon="120.601"/><way id="r"><nd ref="a"/><nd ref="b"/><tag k="highway" v="primary"/><tag k="turn:lanes:forward" v="through|right"/><tag k="turn:lanes:backward" v="left|through"/><tag k="change:lanes" v="not_right|yes"/><tag k="change:lanes:forward" v="yes|no"/><tag k="lane_markings" v="yes"/><tag k="road_marking:lanes" v="solid|dashed"/><tag k="road_marking:lanes:forward" v="dashed|solid"/></way></osm>');
  assert.deepEqual(world.roads[0].turnLanes, ['through', 'right']);
  assert.deepEqual(world.roads[0].turnLanesForward, ['through', 'right']);
  assert.deepEqual(world.roads[0].turnLanesBackward, ['left', 'through']);
  assert.deepEqual(world.roads[0].changeLanes, ['not_right', 'yes']);
  assert.deepEqual(world.roads[0].changeLanesForward, ['yes', 'no']);
  assert.deepEqual(world.roads[0].roadMarkingLanes, ['solid', 'dashed']);
  assert.deepEqual(world.roads[0].roadMarkingLanesForward, ['dashed', 'solid']);
  assert.equal(world.roads[0].laneMarkings, 'yes');
});
test('leaves missing or ambiguous speed limits undefined',()=>{
  const world=parseOSM('<osm><node id="a" lat="31.3" lon="120.6"/><node id="b" lat="31.3" lon="120.601"/><way id="missing"><nd ref="a"/><nd ref="b"/><tag k="highway" v="primary"/></way><way id="signals"><nd ref="a"/><nd ref="b"/><tag k="highway" v="secondary"/><tag k="maxspeed" v="signals"/></way><way id="mixed"><nd ref="a"/><nd ref="b"/><tag k="highway" v="tertiary"/><tag k="maxspeed" v="40;50"/></way></osm>');
  assert.equal(world.roads[0].maxspeed,undefined);
  assert.equal(world.roads[1].maxspeed,undefined);
  assert.equal(world.roads[2].maxspeed,undefined);
});
test('keeps named areas and railway ways instead of discarding them',()=>{
  const xml='<osm><node id="a" lat="31.3" lon="120.6"/><node id="b" lat="31.3" lon="120.601"/><node id="c" lat="31.301" lon="120.601"/><way id="park"><nd ref="a"/><nd ref="b"/><nd ref="c"/><nd ref="a"/><tag k="leisure" v="park"/><tag k="name" v="Test Park"/></way><way id="rail"><nd ref="a"/><nd ref="b"/><tag k="railway" v="rail"/></way></osm>';
  const world=parseOSM(xml); assert.equal(world.areas[0].name,'Test Park'); assert.equal(world.railways[0].kind,'rail');
});
