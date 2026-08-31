import type { Vec } from './sim.ts';

/** Road metadata consumed by the renderer; maxspeed is normalized to km/h. */
export type OSMRoad = { id:string; points:Vec[]; width:number; lanes:number; highway:string; elevation:number; bridge?:boolean; name?:string; ref?:string; maxspeed?:number; surface?:string; oneway?:boolean; turnLanes?:string[]; turnLanesForward?:string[]; turnLanesBackward?:string[]; changeLanes?:string[]; changeLanesForward?:string[]; changeLanesBackward?:string[]; laneMarkings?:string; roadMarking?:string; roadMarkingLanes?:string[]; roadMarkingLanesForward?:string[]; roadMarkingLanesBackward?:string[] };
export type OSMBuilding = { id:string; points:Vec[]; height:number; name?:string; levels?:number; type?:string };
export type OSMWater = { id:string; points:Vec[] };
export type OSMArea = { id:string; points:Vec[]; kind:string; name?:string };
export type OSMRailway = { id:string; points:Vec[]; kind:string; name?:string };
export type OSMPoint = { id:string; point:Vec; kind:string; name?:string };
export type OSMWorld = { roads:OSMRoad[]; buildings:OSMBuilding[]; water:OSMWater[]; areas:OSMArea[]; railways:OSMRailway[]; points:OSMPoint[] };

const attr=(tag:string,name:string)=>new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1] ?? '';
const tags=(body:string)=>Object.fromEntries([...body.matchAll(/<tag\s+[^>]*k="([^"]+)"[^>]*v="([^"]*)"[^>]*\/>/g)].map(m=>[m[1],m[2]]));
const num=(v:string,fallback:number)=>{const n=Number(String(v).match(/-?\d+(?:\.\d+)?/)?.[0]);return Number.isFinite(n)?n:fallback};
const maxspeed=(value?:string):number|undefined=>{
  const match=value?.trim().match(/^(\d+(?:\.\d+)?)\s*(km\/h|kph|mph)?$/i);
  if(!match)return undefined;
  const speed=Number(match[1]);
  if(!Number.isFinite(speed)||speed<=0)return undefined;
  return match[2]?.toLowerCase()==='mph'?speed*1.609344:speed;
};
const pipe=(value?:string)=>value?.split('|').map(part=>part.trim());

/** Converts an OSM XML extract to local metres. The first node becomes the origin. */
export function parseOSM(xml:string):OSMWorld {
  const nodes=new Map<string,Vec>(); let origin:{lat:number;lon:number}|undefined;
  for(const match of xml.matchAll(/<node\s+([^>]+?)(?:\/>|>)/g)){
    const lat=Number(attr(match[0],'lat')),lon=Number(attr(match[0],'lon')); if(!Number.isFinite(lat)||!Number.isFinite(lon))continue;
    origin ??= {lat,lon}; const scale=111320*Math.cos(origin.lat*Math.PI/180);
    nodes.set(attr(match[0],'id'),{x:(lon-origin.lon)*scale,z:-(lat-origin.lat)*111320});
  }
  const roads:OSMRoad[]=[],buildings:OSMBuilding[]=[],water:OSMWater[]=[],areas:OSMArea[]=[],railways:OSMRailway[]=[],points:OSMPoint[]=[];
  for(const match of xml.matchAll(/<node\s+([^>]+)>([\s\S]*?)<\/node>/g)){
    const id=attr(match[0],'id'),lat=Number(attr(match[0],'lat')),lon=Number(attr(match[0],'lon'));if(!origin||!Number.isFinite(lat)||!Number.isFinite(lon))continue;
    const t=tags(match[0]);const kind=t.highway||t.amenity||t.shop||t.tourism||t.public_transport||t.natural||t.place;
    if(kind)points.push({id,point:{x:(lon-origin.lon)*111320*Math.cos(origin.lat*Math.PI/180),z:-(lat-origin.lat)*111320},kind,name:t.name||undefined});
  }
  for(const match of xml.matchAll(/<way\s+([^>]+)>([\s\S]*?)<\/way>/g)){
    const body=match[2], t=tags(body), points:Vec[]=[];
    for(const ref of body.matchAll(/<nd\s+[^>]*ref="([^"]+)"[^>]*\/>/g)){
      const point=nodes.get(ref[1]);
      if(point&&(!points.length||point.x!==points.at(-1)!.x||point.z!==points.at(-1)!.z))points.push(point);
    }
    if(points.length<2)continue; const id=attr(match[0],'id');
    if(t.building)buildings.push({id,points,height:num(t.height,num(t['building:levels'],3)*3),levels:num(t['building:levels'],0)||undefined,name:t.name,type:t.building});
    else if(t.highway){
      const bridge=t.bridge==='yes';
      // OSM's layer is ordering, not metres. The renderer owns the smooth
      // ground-to-deck transition; the parser supplies a finite deck height.
      const elevation=bridge?1:0;
      roads.push({id,points,width:num(t.width,Math.max(5,num(t.lanes,2)*3.4)),lanes:num(t.lanes,2),highway:t.highway,elevation,bridge,name:t.name||undefined,ref:t.ref||undefined,maxspeed:maxspeed(t.maxspeed),surface:t.surface||undefined,oneway:t.oneway==='yes',turnLanes:pipe(t['turn:lanes']||t['turn:lanes:forward']),turnLanesForward:pipe(t['turn:lanes:forward']),turnLanesBackward:pipe(t['turn:lanes:backward']),changeLanes:pipe(t['change:lanes']),changeLanesForward:pipe(t['change:lanes:forward']),changeLanesBackward:pipe(t['change:lanes:backward']),laneMarkings:t.lane_markings||undefined,roadMarking:t.road_marking||undefined,roadMarkingLanes:pipe(t['road_marking:lanes']),roadMarkingLanesForward:pipe(t['road_marking:lanes:forward']),roadMarkingLanesBackward:pipe(t['road_marking:lanes:backward'])});
    } else {
      // A linear waterway is a centreline, not an area. Passing it to the
      // polygon renderer closes it with a long diagonal and can cover roads.
      const closed=points.length>2&&points[0].x===points.at(-1)!.x&&points[0].z===points.at(-1)!.z;
      if(closed&&(t.natural==='water'||t.waterway||t.landuse==='reservoir'||t.water))water.push({id,points});
      else if(closed&&(t.landuse||t.leisure||t.natural))areas.push({id,points,kind:t.landuse||t.leisure||t.natural,name:t.name||undefined});
      else if(t.railway)railways.push({id,points,kind:t.railway,name:t.name||undefined});
    }
  }
  return {roads,buildings,water,areas,railways,points};
}
