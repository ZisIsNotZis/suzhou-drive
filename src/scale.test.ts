import test from 'node:test';
import { strict as assert } from 'node:assert';
import { parseOSM } from './osm.ts';

test('OSM coordinates stay in real-world meters',()=>{
  const world=parseOSM('<osm><node id="a" lat="31.3" lon="120.6"/><node id="b" lat="31.3" lon="120.601"/><way id="r"><nd ref="a"/><nd ref="b"/><tag k="highway" v="primary"/></way></osm>');
  const distance=Math.hypot(world.roads[0].points[1].x-world.roads[0].points[0].x,world.roads[0].points[1].z-world.roads[0].points[0].z);
  assert.ok(distance>90&&distance<110);
});
