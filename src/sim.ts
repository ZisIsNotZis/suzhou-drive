export type Vec = { x:number; z:number };
export type Signal = { phase: 'green'|'red'; elapsed:number; period:number };
export type Car = { position:Vec; heading:number; speed:number; color:string; ai:boolean; route:number; stopped:boolean; mass:number; radius:number; velocity?:Vec; visualWidth?:number; visualLength?:number; visualHeight?:number };
export type RoadSegment = { a:Vec; b:Vec; width:number; highway?:string; lanes?:number; name?:string; maxspeed?:number; turnLanes?:string[]; elevation?:number; elevationStart?:number; elevationEnd?:number; sourceId?:string; oneway?:boolean };
export type Waypoint = Vec;
export type TrafficRoute = { waypoints:Waypoint[]; cursor:number; destination?:number };
export type WaypointFollowResult = { position:Vec; heading:number; speed:number; cursor:number; completed:boolean };
function unit(v:Vec, fallback:Vec={x:1,z:0}):Vec { const length=Math.hypot(v.x,v.z); return length>.000001?{x:v.x/length,z:v.z/length}:fallback; }
function inverseMass(mass:number):number { return Number.isFinite(mass)&&mass>0?1/mass:0; }
export function reflectedVelocity(velocity:Vec, normal:Vec, restitution=1):Vec { const n=unit(normal); const dot=velocity.x*n.x+velocity.z*n.z; return {x:velocity.x-(1+restitution)*dot*n.x,z:velocity.z-(1+restitution)*dot*n.z}; }
export function restitutionFromEnergyLoss(loss:number):number { return Math.sqrt(Math.max(0,1-Math.min(1,loss))); }
export function vehicleRadius(width:number,length:number):number { return Math.hypot(width,length)/2; }
export function carVelocity(car:Car):Vec { return car.velocity?{...car.velocity}:{x:Math.sin(car.heading)*car.speed,z:Math.cos(car.heading)*car.speed}; }
function speedAlongHeading(car:Car, velocity:Vec):number { return velocity.x*Math.sin(car.heading)+velocity.z*Math.cos(car.heading); }

export function resolveStaticCollision(position:Vec, velocity:Vec, normal:Vec, penetration:number, restitution:number):{position:Vec;velocity:Vec} {
  const n=unit(normal), correction=Math.max(0,penetration)+.002;
  const approaching=velocity.x*n.x+velocity.z*n.z<0;
  return {position:{x:position.x+n.x*correction,z:position.z+n.z*correction},velocity:approaching?reflectedVelocity(velocity,n,restitution):{...velocity}};
}

export function isOnRoad(point:Vec, roads:RoadSegment[], margin=0):boolean {
  return roads.some(({a,b,width})=>{
    const vx=b.x-a.x,vz=b.z-a.z;
    const t=Math.max(0,Math.min(1,((point.x-a.x)*vx+(point.z-a.z)*vz)/(vx*vx+vz*vz||1)));
    return Math.hypot(point.x-(a.x+vx*t),point.z-(a.z+vz*t))<=width/2+margin;
  });
}

/** Advance through waypoints without overshooting or inventing a steering target. */
export function followWaypoints(position:Vec, route:TrafficRoute, speed:number, dt:number, maxSpeed=10, arrivalDistance=.5):WaypointFollowResult {
  let cursor=Math.max(0,Math.min(route.cursor,route.waypoints.length));
  let current={...position};
  let remaining=Math.max(0,speed)*Math.max(0,dt);
  while(cursor<route.waypoints.length){
    const target=route.waypoints[cursor],dx=target.x-current.x,dz=target.z-current.z,distance=Math.hypot(dx,dz);
    if(distance<=arrivalDistance||remaining>=distance){current={...target};cursor++;remaining=Math.max(0,remaining-distance);continue;}
    const ratio=remaining/distance;current={x:current.x+dx*ratio,z:current.z+dz*ratio};remaining=0;break;
  }
  const target=route.waypoints[Math.min(cursor,route.waypoints.length-1)];
  const heading=target&&Math.hypot(target.x-current.x,target.z-current.z)>.000001?Math.atan2(target.x-current.x,target.z-current.z):0;
  return {position:current,heading,speed:Math.min(Math.max(0,speed),maxSpeed),cursor,completed:cursor>=route.waypoints.length};
}

/** Lane index 0 is always the lane on the driver's right (right-hand traffic). */
export function chooseRightSideLane(laneCount=1, direction:1|-1=1):number {
  const count=Math.max(1,Math.floor(laneCount));
  return direction===1?0:count-1;
}

/** Signed offset along a segment's left normal for a right-side lane choice. */
export function rightSideLaneOffset(segment:RoadSegment, direction:1|-1, laneIndex=chooseRightSideLane(segment.lanes,direction), laneWidth=3.2):number {
  const count=Math.max(1,Math.floor(segment.lanes??1)),index=Math.max(0,Math.min(count-1,Math.floor(laneIndex)));
  return (index-(count-1)/2)*laneWidth;
}

/** Deterministically pick another destination; stable for a fixed sequence number. */
export function reassignDestination(current:number, destinations:number[], sequence=0):number|undefined {
  const choices=destinations.filter(destination=>destination!==current);
  if(!choices.length)return destinations.includes(current)?current:undefined;
  return choices[((Math.floor(sequence)%choices.length)+choices.length)%choices.length];
}

export function shouldStopAtRedSignal(distance:number, signal:Signal|undefined, stoppingDistance=14):boolean {
  return signal?.phase==='red'&&distance>=0&&distance<=stoppingDistance;
}

/** Deterministic braking decision used before waypoint following. */
export function safeTrafficStep(position:Vec, route:TrafficRoute, speed:number, dt:number, signalDistance=Infinity, signal?:Signal):WaypointFollowResult {
  const stopped=shouldStopAtRedSignal(signalDistance,signal);
  const nextSpeed=stopped?Math.max(0,speed-dt*10):Math.min(10,speed+dt*3);
  return followWaypoints(position,route,nextSpeed,dt,nextSpeed,stopped?.5:.5);
}
export const signals: Signal[] = [{phase:'green',elapsed:0,period:12},{phase:'red',elapsed:0,period:12}];
export function stepSignal(s:Signal, dt:number):Signal { const elapsed=s.elapsed+dt; return elapsed>=s.period ? { ...s, phase:s.phase==='green'?'red':'green', elapsed:elapsed-s.period } : {...s,elapsed}; }
export function advanceCar(car:Car, dt:number, signal:Signal, playerZ=-55):Car {
  if (!car.ai) return {...car, speed:Math.max(0, car.speed)};
  const approaching = car.route===0 && car.position.x < -61 && car.position.x > -75;
  const stopped = approaching && signal.phase==='red';
  const speed = stopped ? Math.max(0, car.speed-dt*10) : Math.min(10, car.speed+dt*3);
  return {...car, speed, stopped, position:{x:car.position.x+speed*dt, z:playerZ}};
}

export function driveCar(car:Car, dt:number, input:{throttle:boolean; brake:boolean; steer:number}, coastBrake:number):Car {
  let speed=car.speed;
  if (input.throttle) speed += (speed < 0 ? 24 : 10) * dt;
  else if (input.brake) speed -= (speed > 0 ? 18 : 7) * dt;
  else speed -= Math.sign(speed) * coastBrake * dt;
  speed=Math.max(-8,Math.min(22,speed));
  if (Math.abs(speed)<.08 && !input.throttle && !input.brake) speed=0;
  return {...car,speed};
}


export function elasticBounce(speed:number, heading:number, normal:Vec, restitution=1):{speed:number; heading:number} {
  const vx=Math.sin(heading)*speed, vz=Math.cos(heading)*speed;
  const bounced=reflectedVelocity({x:vx,z:vz},normal,restitution);
  return {speed:Math.hypot(bounced.x,bounced.z),heading:Math.atan2(bounced.x,bounced.z)};
}

export function resolveCarCollision(a:Car,b:Car,restitution:number):{a:Car;b:Car} {
  const av=carVelocity(a),bv=carVelocity(b),dx=a.position.x-b.position.x,dz=a.position.z-b.position.z,distance=Math.hypot(dx,dz);
  const relative={x:av.x-bv.x,z:av.z-bv.z};
  const n=distance>.000001?{x:dx/distance,z:dz/distance}:unit({x:-relative.x,z:-relative.z},{x:1,z:0});
  const overlap=a.radius+b.radius-distance;
  if(overlap<=0)return {a,b};
  const invA=inverseMass(a.mass),invB=inverseMass(b.mass),total=invA+invB;
  const shareA=total?invA/total:0,shareB=total?invB/total:0;
  // Inverse-mass weighting keeps static (infinite-mass) bodies fixed.
  const correction=overlap+.002;
  a={...a,position:{x:a.position.x+n.x*correction*shareA,z:a.position.z+n.z*correction*shareA}};
  b={...b,position:{x:b.position.x-n.x*correction*shareB,z:b.position.z-n.z*correction*shareB}};
  const closing=relative.x*n.x+relative.z*n.z;
  if(closing>=0||total===0)return {a:{...a,velocity:av},b:{...b,velocity:bv}};
  const bounce=Math.max(0,Math.min(1,restitution));
  const impulse=-(1+bounce)*closing/total;
  const nextA={x:av.x+impulse*invA*n.x,z:av.z+impulse*invA*n.z},nextB={x:bv.x-impulse*invB*n.x,z:bv.z-impulse*invB*n.z};
  return {a:{...a,velocity:nextA,speed:speedAlongHeading(a,nextA)},b:{...b,velocity:nextB,speed:speedAlongHeading(b,nextB)}};
}

export function steerHeading(heading:number, speed:number, steer:number, dt:number, wheelbase=2.6):number {
  if (Math.abs(speed)<.01||steer===0) return heading;
  return heading + Math.atan2(Math.tan(steer*.55)*speed*dt,wheelbase);
}
