import * as THREE from './vendor/three.module.js';

// Original low-poly scenery, built from geometry. No external models or textures.
export function createWorld({canvas, container, onSelect, onReady, onFallback}) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-7,7,5,-5,.1,100);
  camera.position.set(11,12,15);
  camera.lookAt(0,.65,0);
  const world = new THREE.Group();
  world.rotation.y = -.13;
  scene.add(world);

  scene.add(new THREE.AmbientLight(0xfff8e7, .35));
  const hemisphere = new THREE.HemisphereLight(0xe3efff,0xa48c64,1.05);
  scene.add(hemisphere);
  const sunlight = new THREE.DirectionalLight(0xffe8c7,2.9);
  sunlight.position.set(-6,10,6);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(1024,1024);
  Object.assign(sunlight.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:35});
  sunlight.shadow.normalBias = .035;
  sunlight.shadow.bias = -.00025;
  sunlight.shadow.radius = 4;
  scene.add(sunlight);
  const fill = new THREE.DirectionalLight(0xd5e5ff,.65);
  fill.position.set(6,4,-4);
  scene.add(fill);
  const animatedTrees=[],animatedFlags=[],animatedCoins=[],animatedMushrooms=[],smokePuffs=[],waterfalls=[],waterRipples=[],littleBirds=[],fireflies=[],questionBlocks=[];
  let motionPlaying=!reducedMotion;

  const materials = new Map();
  function material(color, options={}) {
    const key = color + JSON.stringify(options);
    if (!materials.has(key)) materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.88,...options}));
    return materials.get(key);
  }
  function mesh(geometry,color,parent,x=0,y=0,z=0,options) {
    const item = new THREE.Mesh(geometry,material(color,options));
    item.position.set(x,y,z);item.castShadow=true;item.receiveShadow=true;parent.add(item);return item;
  }
  function box(w,h,d,color,parent,x=0,y=0,z=0) {return mesh(new THREE.BoxGeometry(w,h,d),color,parent,x,y,z);}
  function softBox(w,h,d,color,parent,x=0,y=0,z=0,r=.045) {
    r=Math.min(r,w/4,h/4,d/4);
    const shape=new THREE.Shape();
    const a=-w/2,b=-h/2;
    shape.moveTo(a+r,b);shape.lineTo(a+w-r,b);shape.quadraticCurveTo(a+w,b,a+w,b+r);
    shape.lineTo(a+w,b+h-r);shape.quadraticCurveTo(a+w,b+h,a+w-r,b+h);
    shape.lineTo(a+r,b+h);shape.quadraticCurveTo(a,b+h,a,b+h-r);
    shape.lineTo(a,b+r);shape.quadraticCurveTo(a,b,a+r,b);
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:d-r*2,bevelEnabled:true,bevelThickness:r,bevelSize:r/2,bevelSegments:2,steps:1,curveSegments:3});
    geometry.translate(0,0,-d/2+r);
    return mesh(geometry,color,parent,x,y,z);
  }
  function cylinder(rt,rb,h,color,parent,x=0,y=0,z=0,n=12) {return mesh(new THREE.CylinderGeometry(rt,rb,h,n),color,parent,x,y,z);}
  function sphere(radius,color,parent,x=0,y=0,z=0,s=1) {const item=mesh(new THREE.SphereGeometry(radius,12,8),color,parent,x,y,z);item.scale.y=s;return item;}
  function cone(r,h,color,parent,x=0,y=0,z=0,n=8) {return mesh(new THREE.ConeGeometry(r,h,n),color,parent,x,y,z);}
  function roof(w,h,d,color,parent,x=0,y=0,z=0) {
    const points=[[-w/2,0,-d/2],[w/2,0,-d/2],[0,h,-d/2],[-w/2,0,d/2],[w/2,0,d/2],[0,h,d/2]];
    const positions=[];
    [[0,2,1],[3,4,5],[0,3,5],[0,5,2],[1,2,5],[1,5,4],[0,1,4],[0,4,3]].forEach(face=>face.forEach(i=>positions.push(...points[i])));
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.computeVertexNormals();
    return mesh(geo,color,parent,x,y,z);
  }
  function tree(parent,x,z,size=1,type='pine') {
    const g=new THREE.Group();g.position.set(x,.55,z);g.scale.setScalar(size);parent.add(g);
    cylinder(.07,.09,.53,'#92724c',g,0,.25,0,7);
    if(type==='pine') {
      cone(.39,.67,'#64865c',g,0,.66,0,7);
      cone(.31,.61,'#79975f',g,0,.97,0,7);
      cone(.22,.49,'#8caa6f',g,0,1.23,0,7);
    } else {
      mesh(new THREE.IcosahedronGeometry(.46,1),'#88a56a',g,0,.83,0).scale.set(1,1.1,1);
      mesh(new THREE.IcosahedronGeometry(.31,0),'#a3b97c',g,.2,.83,.15);
    }
    animatedTrees.push({group:g,phase:x*3+z*2});
  }
  function mushroom(parent,x,z,size=.25) {
    cylinder(size*.19,size*.23,size*.7,'#ffedcf',parent,x,.57+size*.35,z,8);
    const cap=sphere(size,'#c98067',parent,x,.57+size*.78,z,.58);
    sphere(size*.13,'#f9e4bf',parent,x-size*.3,.57+size*1.27,z+size*.18);
    sphere(size*.1,'#f9e4bf',parent,x+size*.32,.57+size*1.24,z-size*.16);
    animatedMushrooms.push({mesh:cap,baseY:cap.position.y,phase:x*4+z});
    return cap;
  }
  function flag(parent,x,y,z,color='#dfac5b',scale=1) {
    const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);
    cylinder(.025,.025,.94,'#7f7961',g,0,.47,0,6);
    const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(.41,-.06);shape.lineTo(.34,-.24);shape.lineTo(0,-.21);shape.closePath();
    const banner=mesh(new THREE.ShapeGeometry(shape),color,g,.02,.91,0,{side:THREE.DoubleSide});
    animatedFlags.push({mesh:banner,positions:banner.geometry.attributes.position.array.slice(),phase:x*2+z});
    return banner;
  }
  function coin(parent,x,y,z) {
    const group=new THREE.Group();group.position.set(x,y,z);parent.add(group);
    const coin=cylinder(.105,.105,.045,'#ebc46c',group);coin.rotation.x=Math.PI/2;
    const center=cylinder(.072,.072,.049,'#f3d38b',group);center.rotation.x=Math.PI/2;
    animatedCoins.push({group,y,phase:x*2+z});
  }
  function cragGeometry(radius,height,seed) {
    const geo=new THREE.CylinderGeometry(radius,radius*.62,height,9,2).toNonIndexed();
    const positions=geo.attributes.position;
    for(let i=0;i<positions.count;i++) {
      const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
      const angle=Math.atan2(z,x);
      const variation=1+Math.sin(angle*5+seed)*.052+Math.cos(angle*3+seed)*.04;
      positions.setXYZ(i,x*variation,y+(Math.sin(angle*4+seed)*.055),z*variation);
    }
    geo.computeVertexNormals();return geo;
  }
  function terrainDetail(group,r,index) {
    const grassColors=['#72904f','#8caa5c','#9aae67'];
    for(let n=0;n<19;n++) {
      const angle=n*2.399+index*1.5;
      const radius=r*(.74+(n%4)*.045),x=Math.cos(angle)*radius,z=Math.sin(angle)*radius;
      const tuft=new THREE.Group();tuft.position.set(x,.59,z);group.add(tuft);
      for(let j=0;j<3;j++){
        const blade=cone(.018,.09+(n%3)*.025,grassColors[n%3],tuft,(j-1)*.027,.05,0,3);blade.rotation.z=(j-1)*.23;
      }
      if(n%5===0) {
        cylinder(.012,.012,.15,'#779257',group,x,.65,z,4);
        sphere(.035,n%2?'#ecd578':'#e3ba9c',group,x,.74,z,.65);
      }
    }
    for(let n=0;n<4;n++) {
      const a=n*1.51+index;
      const rock=mesh(new THREE.DodecahedronGeometry(.21+(n%2)*.08,0),'#a69778',group,Math.cos(a)*r*.75,-.44,Math.sin(a)*r*.75);
      rock.scale.set(1,.8,1);rock.rotation.set(.3*n,.7*n,.2);
    }
  }
  const islands=[];
  const islandSpec=[
    {x:-3.3,z:1.65,r:1.18,grass:'#8eaa5e',dirt:'#ac8156'},
    {x:-3,z:-1.65,r:1.26,grass:'#709359',dirt:'#967857'},
    {x:.12,z:-2.23,r:1.36,grass:'#8c9d71',dirt:'#9e8c73'},
    {x:3.1,z:-.65,r:1.22,grass:'#a3ac70',dirt:'#aa875a'},
    {x:1.08,z:2.35,r:1.49,grass:'#86a359',dirt:'#a4865d'}
  ];
  islandSpec.forEach((spec,index)=>{
    const group=new THREE.Group();group.position.set(spec.x,0,spec.z);group.userData.stage=index;world.add(group);islands.push(group);
    const earth=mesh(cragGeometry(spec.r,.9,index),spec.dirt,group,0,-.02,0,{flatShading:true});earth.rotation.y=.2;
    const strata=cylinder(spec.r*1.005,spec.r*.97,.15,'#e1c79e',group,0,.34,0,9);strata.rotation.y=.2;
    const turf=cylinder(spec.r*1.025,spec.r*1.005,.17,spec.grass,group,0,.49,0,9);turf.rotation.y=.2;
    const patch=cylinder(spec.r*.57,spec.r*.57,.016,'#b9b87d',group,.04,.582,.1,9);
    terrainDetail(group,spec.r,index);
    for(let n=0;n<7;n++) {
      const angle=n*2.399+index;
      const px=Math.cos(angle)*spec.r*.78,pz=Math.sin(angle)*spec.r*.78;
      const stone=mesh(new THREE.DodecahedronGeometry(.09+(n%3)*.025,0),n%2?'#a0a27b':'#d9c69d',group,px,.62,pz);stone.scale.y=.5;
    }
    for(let n=0;n<4;n++) {
      const a=.6+n*.25;
      box(.16,.025,.22,'#e6d6ab',group,Math.sin(a)*.38,.601,.42+n*.16).rotation.y=a;
    }
  });

  // Beginner village: a little house, a mushroom and a first flag.
  const village=islands[0];
  softBox(.91,.68,.72,'#f6e7bb',village,-.07,.91,-.06);
  roof(1.1,.53,.96,'#c88465',village,-.07,1.25,-.06);
  box(.2,.38,.03,'#698371',village,-.15,.79,.32);
  box(.2,.2,.035,'#e9c876',village,.24,.99,.32);
  box(.025,.21,.04,'#e5d3a4',village,.24,.99,.335);
  box(.21,.025,.04,'#e5d3a4',village,.24,.99,.335);
  softBox(.14,.35,.16,'#d8b48a',village,.25,1.56,-.22,.02);
  tree(village,-.73,-.33,.64,'round');mushroom(village,.64,.4,.28);mushroom(village,.48,.7,.16);
  flag(village,.68,.58,-.5,'#e7c064',.65);
  box(.26,.035,.18,'#d8b98b',village,-.15,.61,.46);

  // Coding forest: a tiny open laptop surrounded by pines.
  const forest=islands[1];
  tree(forest,-.67,-.4,.9);tree(forest,.57,-.48,.74);tree(forest,-.85,.32,.58);
  softBox(.88,.12,.63,'#a7b798',forest,.05,.69,.26);
  const laptop=new THREE.Group();laptop.position.set(.05,.75,.23);forest.add(laptop);
  softBox(.83,.08,.54,'#dce1ce',laptop,0,0,.05,.025);
  const screen=softBox(.8,.55,.07,'#4e7064',laptop,0,.3,-.19,.025);screen.rotation.x=-.16;
  const display=box(.69,.43,.015,'#2d4b40',laptop,0,.31,-.138);display.rotation.x=-.16;
  // Code strokes are geometric marks rather than an unreadable text texture.
  [0,1,2,3].forEach(i=>box(.17+(i%3)*.08,.019,.018,i%2?'#d4c17e':'#a2bf99',laptop,-.14+(i%2)*.07,.43-i*.075,-.1));
  box(.21,.022,.1,'#a9b79e',laptop,0,.05,.15);
  mushroom(forest,.78,.51,.18);coin(forest,-.5,1.13,.51);
  const pipeGroup=new THREE.Group();pipeGroup.position.set(.79,.59,-.02);forest.add(pipeGroup);
  cylinder(.17,.17,.33,'#4f8051',pipeGroup,0,.17,0,18);
  cylinder(.215,.215,.11,'#72975d',pipeGroup,0,.36,0,18);
  cylinder(.165,.165,.012,'#2c5137',pipeGroup,0,.421,0,18);
  const pipeRim=new THREE.Mesh(new THREE.TorusGeometry(.19,.027,6,24),material('#9eb77e'));
  pipeRim.rotation.x=-Math.PI/2;pipeRim.position.y=.421;pipeGroup.add(pipeRim);

  // Agent castle: lilac towers and a little robot companion.
  const castle=islands[2];
  softBox(1.05,.76,.57,'#d9d5e0',castle,0,.96,-.03);
  box(.27,.44,.045,'#807a93',castle,0,.8,.28);
  box(.17,.31,.05,'#5d6273',castle,0,.77,.31);
  [-.61,.61].forEach((x,i)=>{
    cylinder(.245,.27,1.11,'#d9d5df',castle,x,1.13,-.03,10);
    cylinder(.265,.265,.14,'#e9e1e7',castle,x,1.63,-.03,10);
    cone(.33,.55,i?'#8896af':'#a09cbb',castle,x,1.97,-.03,10);
    box(.07,.18,.015,'#7d8498',castle,x,1.4,.215);
  });
  softBox(.37,1.23,.41,'#e1dce5',castle,0,1.4,-.26);
  cone(.31,.6,'#a59cbc',castle,0,2.26,-.26,8);
  flag(castle,0,2.52,-.26,'#d4ac57',.57);
  [-.38,-.19,0,.19,.38].forEach(x=>box(.11,.13,.19,'#e6dfe8',castle,x,1.41,.19));
  tree(castle,-.88,-.44,.52,'round');
  const robot=new THREE.Group();robot.position.set(.58,.68,.61);castle.add(robot);robot.rotation.y=.25;
  softBox(.34,.25,.27,'#f5e9ca',robot,0,.3,0);
  softBox(.28,.23,.22,'#839b88',robot,0,.07,0);
  box(.24,.1,.02,'#547565',robot,0,.31,.146);
  sphere(.024,'#f0d37a',robot,-.064,.32,.164);sphere(.024,'#f0d37a',robot,.064,.32,.164);
  cylinder(.014,.014,.14,'#b3b69c',robot,0,.5,0,6);sphere(.034,'#d6b96a',robot,0,.59,0);
  box(.065,.08,.12,'#547563',robot,-.085,-.08,.03);box(.065,.08,.12,'#547563',robot,.085,-.08,.03);

  // In the field: a workshop, solar panel and a delivery crate.
  const field=islands[3];
  softBox(.94,.7,.8,'#eddfbc',field,0,.94,-.1);
  roof(1.12,.25,1.02,'#70978a',field,0,1.3,-.1);
  softBox(.4,.4,.035,'#7e9d90',field,-.15,.9,.32,.025);
  box(.17,.28,.04,'#e9ba6d',field,.28,.84,.32);
  box(.02,.38,.04,'#d9cba6',field,-.15,.9,.35);
  box(.37,.02,.04,'#d9cba6',field,-.15,.9,.35);
  const panel=box(.48,.045,.5,'#577c84',field,-.12,1.5,-.09);panel.rotation.z=.04;panel.rotation.x=-.27;
  const grid=new THREE.Group();grid.position.copy(panel.position);grid.rotation.copy(panel.rotation);field.add(grid);
  [-.15,0,.15].forEach(x=>box(.01,.007,.46,'#93b0b1',grid,x,.025,0));
  [-.15,0,.15].forEach(z=>box(.45,.007,.01,'#93b0b1',grid,0,.025,z));
  softBox(.3,.3,.3,'#bd946b',field,.65,.73,.31,.025);
  box(.32,.035,.32,'#e2c398',field,.65,.76,.31);
  tree(field,-.69,-.34,.66,'round');flag(field,.61,.58,-.55,'#e2b661',.78);

  // Base camp: lighthouse, a little creator and a mailbox.
  const base=islands[4];
  cylinder(.32,.4,1.42,'#f5ead0',base,.2,1.29,-.13,12);
  cylinder(.333,.348,.21,'#b8785d',base,.2,1.39,-.13,12);
  cylinder(.28,.31,.2,'#6b8a79',base,.2,2.03,-.13,12);
  cylinder(.33,.3,.3,'#e0c477',base,.2,2.25,-.13,10);
  cylinder(.38,.38,.08,'#527568',base,.2,2.43,-.13,12);
  cone(.43,.29,'#bc805e',base,.2,2.59,-.13,12);
  sphere(.055,'#eed6a5',base,.2,2.79,-.13);
  box(.16,.29,.03,'#6d8470',base,.2,.74,.253);
  [-1,1].forEach(s=>box(.033,.25,.03,'#aa9e78',base,.2+s*.16,2.25,.14));
  tree(base,-.68,-.33,.74,'round');tree(base,.82,-.56,.58);
  cylinder(.025,.025,.5,'#8d8062',base,-.78,.85,.65,6);
  softBox(.3,.2,.25,'#ce936b',base,-.78,1.15,.65,.025);
  box(.11,.025,.02,'#8f6e53',base,-.78,1.17,.785);
  const player=new THREE.Group();player.position.set(-.21,.59,.71);player.rotation.y=.15;base.add(player);
  softBox(.27,.36,.21,'#d9b55d',player,0,.35,0,.055);
  sphere(.16,'#eed4ad',player,0,.69,0);
  const hair=sphere(.17,'#4e5144',player,0,.77,-.025,.72);
  softBox(.28,.08,.26,'#567d59',player,0,.84,0,.02);
  softBox(.29,.035,.15,'#567d59',player,0,.81,.12,.012);
  sphere(.014,'#333d31',player,-.051,.7,.15);sphere(.014,'#333d31',player,.051,.7,.15);
  box(.09,.15,.12,'#556b5b',player,-.08,.095,.01);box(.09,.15,.12,'#556b5b',player,.08,.095,.01);
  softBox(.1,.05,.18,'#e2d6b6',player,-.08,.025,.05,.015);softBox(.1,.05,.18,'#e2d6b6',player,.08,.025,.05,.015);
  softBox(.1,.25,.12,'#e7cca2',player,-.19,.35,0,.025);softBox(.1,.25,.12,'#e7cca2',player,.19,.35,0,.025);
  softBox(.21,.23,.11,'#9b805c',player,0,.38,-.16,.025);
  mushroom(base,1.02,.45,.19);mushroom(base,.87,.72,.12);
  flag(base,-.73,.58,-.82,'#d9b45b',.75);

  // Surface water, a falling stream and moving ripples give the terrain depth.
  function pond(parent,x,z,r) {
    cylinder(r*1.13,r*1.13,.035,'#c9c59c',parent,x,.608,z,16);
    const water=cylinder(r,r,.028,'#6baba6',parent,x,.632,z,24);
    water.material=material('#6baba6',{roughness:.2,metalness:.12});
    for(let n=0;n<3;n++) {
      const ring=mesh(new THREE.TorusGeometry(r*.5,.008,4,28),'#b7dad0',parent,x,.655,z,{transparent:true,opacity:.45});
      ring.rotation.x=-Math.PI/2;ring.material=ring.material.clone();waterRipples.push({mesh:ring,phase:n/3});
    }
  }
  pond(village,.7,-.37,.22);pond(base,-.63,.89,.36);
  const stream=new THREE.Group();stream.position.set(-.63,.64,1.26);base.add(stream);
  const waterGeo=new THREE.PlaneGeometry(.25,1.7,4,16);
  const waterfall=mesh(waterGeo,'#73b8b4',stream,0,-.81,.035,{roughness:.14,metalness:.08,transparent:true,opacity:.79,side:THREE.DoubleSide});
  waterfalls.push({mesh:waterfall,positions:waterGeo.attributes.position.array.slice()});
  for(let n=0;n<7;n++) {
    const drop=sphere(.025,'#a3d4c8',stream,(n%3-1)*.075,-n*.22,.08,1.7);
    drop.material=material('#a3d4c8',{transparent:true,opacity:.7});
    waterfalls.push({drop,phase:n/7});
  }
  // Chimney smoke rises and dissolves instead of being painted into a backdrop.
  [[village,.25,1.78,-.22],[field,.37,1.5,-.4]].forEach(([parent,x,y,z])=>{
    for(let n=0;n<5;n++) {
      const puff=sphere(.1,'#dbd5c3',parent,x,y,z);
      puff.material=new THREE.MeshStandardMaterial({color:'#d8d3c1',transparent:true,opacity:.25,depthWrite:false,roughness:1});
      puff.castShadow=false;smokePuffs.push({mesh:puff,x,y,z,phase:n/5});
    }
  });
  const turbine=new THREE.Group();turbine.position.set(.72,.59,-.5);field.add(turbine);
  cylinder(.027,.04,1.19,'#e0d5b6',turbine,0,.59,0,7);
  const rotor=new THREE.Group();rotor.position.set(0,1.2,.04);turbine.add(rotor);
  sphere(.062,'#f2e8ca',rotor);
  for(let i=0;i<3;i++) {
    const blade=new THREE.Group();blade.rotation.z=i*Math.PI*2/3;rotor.add(blade);
    softBox(.075,.4,.028,'#e8e1c8',blade,0,.21,0,.012);
  }
  const beacon=new THREE.Group();beacon.position.set(.2,2.27,-.13);base.add(beacon);
  const beamGeo=new THREE.ConeGeometry(.58,1.8,20,1,true);beamGeo.translate(0,-.9,0);beamGeo.rotateZ(Math.PI/2);
  const beam=new THREE.Mesh(beamGeo,new THREE.MeshBasicMaterial({color:'#ffe4a0',transparent:true,opacity:.07,depthWrite:false,side:THREE.DoubleSide}));beacon.add(beam);
  for(let n=0;n<6;n++) {
    const light=sphere(.025,'#efce75',forest,-.7+n*.24,.9+(n%3)*.2,.58);
    light.material=new THREE.MeshBasicMaterial({color:'#e9d681',transparent:true,opacity:.8});
    light.castShadow=false;fireflies.push({mesh:light,x:light.position.x,y:light.position.y,z:light.position.z,phase:n*1.7});
  }
  // The player's limbs pivot from the hips and shoulders while traversing the map.
  const armLeft=player.children[player.children.length-3];
  const armRight=player.children[player.children.length-2];
  const legs=player.children.filter(object=>object.geometry?.type==='BoxGeometry' && Math.abs(object.position.y-.095)<.001);
  const feet=player.children.filter(object=>Math.abs(object.position.y-.025)<.001);
  base.remove(player);world.add(player);player.scale.setScalar(1.16);
  const standPoints=islandSpec.map(spec=>new THREE.Vector3(spec.x,.62,spec.z+.7));
  player.position.copy(standPoints[0]);
  let walkingFrom=0,walkingTo=1,walkProgress=0,walkPause=.7,requestedStage=null;
  let walkCurve=null,walkDuration=5;
  const walkingPosition=new THREE.Vector3(),walkingTangent=new THREE.Vector3();
  function beginWalk(destination) {
    walkingTo=destination;walkProgress=0;
    const from=standPoints[walkingFrom],to=standPoints[walkingTo];
    const middle=new THREE.Vector3().lerpVectors(from,to,.5);middle.y+=.075;
    walkCurve=new THREE.CatmullRomCurve3([from,from.clone().lerp(middle,.55),middle,to.clone().lerp(middle,.55),to]);
    walkDuration=Math.max(4,from.distanceTo(to)*1.55);
  }

  // Stepping stones link neighboring chapters across the empty space.
  for(let i=0;i<islands.length;i++) {
    const next=(i+1)%islands.length;
    const from=standPoints[i],to=standPoints[next];
    const distance=from.distanceTo(to),r1=islandSpec[i].r,r2=islandSpec[next].r;
    const steps=Math.max(2,Math.round(distance/.24));
    for(let s=0;s<steps;s++) {
      const t=(s+.5)/steps;
      const p=new THREE.Vector3().lerpVectors(from,to,t);
      const stone=cylinder(.105,.105,.045,'#d2be92',world,p.x,.605+Math.sin(t*Math.PI)*.045,p.z,8);
      stone.scale.z=.8;
    }
  }
  // A few floating golden collectibles complete the miniature world.
  coin(world,-3.9,1,-.02);coin(world,-1.55,.94,-2);coin(world,2,.96,-1.5);
  function questionBlock(x,y,z) {
    const block=new THREE.Group();block.position.set(x,y,z);world.add(block);
    softBox(.36,.36,.36,'#dbad50',block,0,0,0,.035);
    box(.29,.29,.015,'#e9c46f',block,0,0,.19);
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.067,.042,.212),new THREE.Vector3(-.04,.092,.212),new THREE.Vector3(.033,.085,.212),new THREE.Vector3(.062,.038,.212),new THREE.Vector3(.003,-.005,.212),new THREE.Vector3(.003,-.047,.212)]);
    mesh(new THREE.TubeGeometry(curve,16,.017,6,false),'#fff0bf',block);
    sphere(.02,'#fff0bf',block,.003,-.107,.212);
    questionBlocks.push({group:block,y,phase:x+z});
  }
  questionBlock(-3.75,1.66,.1);questionBlock(2.0,1.42,.85);

  // Soft contact shadow under the archipelago, with no external texture.
  const shadowPlane=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({color:'#4d6348',opacity:.12}));
  shadowPlane.rotation.x=-Math.PI/2;shadowPlane.position.y=-1.05;shadowPlane.receiveShadow=true;scene.add(shadowPlane);
  const clouds=[];
  function cloud(x,y,z,size) {
    const g=new THREE.Group();world.add(g);g.position.set(x,y,z);g.scale.setScalar(size);
    [[-.35,0,0,.34],[0,.1,0,.42],[.38,-.025,.02,.32],[.06,-.11,.15,.37]].forEach(([cx,cy,cz,r])=>sphere(r,'#fffdf4',g,cx,cy,cz,.55));
    clouds.push({group:g,x,y,z,phase:x+z});
  }
  cloud(-4.7,.08,-.15,.68);cloud(3.6,.05,2.1,.8);cloud(-.7,-.55,3.25,.8);cloud(1.5,-.37,-3.4,.65);
  for(let n=0;n<3;n++) {
    const bird=new THREE.Group();world.add(bird);
    const left=box(.18,.018,.055,'#537164',bird,-.08,0,0);
    const right=box(.18,.018,.055,'#537164',bird,.08,0,0);
    littleBirds.push({group:bird,left,right,phase:n*2.1});
  }

  const marker=new THREE.Group();
  const markerRing=mesh(new THREE.TorusGeometry(.2,.027,6,32),'#e5bc61',marker,0,0,0);
  markerRing.rotation.x=Math.PI/2;
  const diamond=mesh(new THREE.OctahedronGeometry(.105),'#f0ca6b',marker,0,.19,0);
  world.add(marker);
  const labels=[...document.querySelectorAll('.map-label')];
  const labelOffsets=[new THREE.Vector3(0,2.1,0),new THREE.Vector3(0,2.16,0),new THREE.Vector3(0,3.12,0),new THREE.Vector3(.3,2.15,0),new THREE.Vector3(.1,-.12,1.38)];
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),projected=new THREE.Vector3();
  let width=0,height=0,renderRequested=true,visible=true,disposed=false;
  let targetRotation=-.13,currentRotation=-.13;
  let pointerStart=null,dragged=false,activePointer=null;
  let lastFrame=0,elapsed=0;
  function updateSize() {
    width=container.clientWidth;height=container.clientHeight;
    renderer.setSize(width,height,false);
    const aspect=width/height;
    const view=aspect<1.15?7.8:7.6;
    camera.left=-view*aspect/2;camera.right=view*aspect/2;camera.top=view/2;camera.bottom=-view/2;
    if(aspect<1.15) {
      const horizontal=11.45;
      camera.left=-horizontal/2;camera.right=horizontal/2;camera.top=horizontal/aspect/2;camera.bottom=-horizontal/aspect/2;
    }
    camera.updateProjectionMatrix();renderRequested=true;
  }
  const resizeObserver=new ResizeObserver(updateSize);resizeObserver.observe(container);
  const visibilityObserver=new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible){renderRequested=true;lastFrame=0;}
  },{rootMargin:'100px'});visibilityObserver.observe(container);
  function positionLabels() {
    world.updateMatrixWorld(true);camera.updateMatrixWorld();
    islands.forEach((island,i)=>{
      projected.copy(labelOffsets[i]);island.localToWorld(projected);projected.project(camera);
      const x=Math.max(42,Math.min(width-42,(projected.x*.5+.5)*width));
      const y=Math.max(32,Math.min(height-18,(-projected.y*.5+.5)*height));
      labels[i].style.transform=`translate(${x}px, ${y}px) translate(-50%, -100%)`;
      labels[i].style.visibility='visible';
    });
  }
  function hitStage(event) {
    const rect=canvas.getBoundingClientRect();
    pointer.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
    raycaster.setFromCamera(pointer,camera);
    const hits=raycaster.intersectObjects(islands,true);
    if(hits.length) {
      let object=hits[0].object;
      while(object && object.userData.stage===undefined) object=object.parent;
      if(object) onSelect(object.userData.stage);
    }
  }
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    activePointer=event.pointerId;pointerStart={x:event.clientX,y:event.clientY,rotation:targetRotation};dragged=false;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove',event=>{
    if(!pointerStart || event.pointerId!==activePointer)return;
    const dx=event.clientX-pointerStart.x;
    if(Math.abs(dx)>6)dragged=true;
    if(dragged) {targetRotation=Math.max(-.7,Math.min(.5,pointerStart.rotation+dx*.004));renderRequested=true;}
  });
  canvas.addEventListener('pointerup',event=>{
    if(!pointerStart || event.pointerId!==activePointer)return;
    if(!dragged && Math.abs(event.clientY-pointerStart.y)<8)hitStage(event);
    pointerStart=null;activePointer=null;
    if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointercancel',()=>{pointerStart=null;activePointer=null;});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();disposed=true;renderer.setAnimationLoop(null);resizeObserver.disconnect();visibilityObserver.disconnect();onFallback();});
  function select(index) {
    const spec=islandSpec[index];
    const markerHeights=[1.99,2.05,2.96,1.94,2.98];
    marker.position.set(spec.x,markerHeights[index],spec.z);
    marker.userData.baseY=markerHeights[index];
    requestedStage=index;
    renderRequested=true;
  }
  function reset() {targetRotation=-.13;renderRequested=true;}
  function setMotion(playing){motionPlaying=Boolean(playing);renderRequested=true;lastFrame=0;return motionPlaying;}
  function toggleMotion(){return setMotion(!motionPlaying);}
  onReady({select,reset,setMotion,toggleMotion,isPlaying:()=>motionPlaying});
  updateSize();select(2);
  renderer.setAnimationLoop(time=>{
    if(disposed || !visible || document.hidden)return;
    if(time-lastFrame<33 && !renderRequested)return;
    const delta=lastFrame?Math.min((time-lastFrame)/1000,.1):0;lastFrame=time;if(motionPlaying)elapsed+=delta;
    const turning=Math.abs(currentRotation-targetRotation)>.0005;
    if(!renderRequested && !motionPlaying && !turning)return;
    currentRotation+=(targetRotation-currentRotation)*(reducedMotion?1:.13);world.rotation.y=currentRotation;
    if(motionPlaying){
      world.position.y=Math.sin(elapsed*.7)*.026;
      marker.position.y=marker.userData.baseY+Math.sin(elapsed*2)*.06;diamond.rotation.y=elapsed*.65;
      animatedMushrooms.forEach(({mesh,baseY,phase})=>{mesh.position.y=baseY+Math.sin(elapsed*1.7+phase)*.014;mesh.scale.y=.58+Math.sin(elapsed*1.7+phase)*.025;});
      questionBlocks.forEach(({group,y,phase})=>{group.position.y=y+Math.sin(elapsed*1.35+phase)*.085;group.rotation.y=Math.sin(elapsed*.55+phase)*.13;});
      animatedTrees.forEach(({group,phase})=>{group.rotation.z=Math.sin(elapsed*1.3+phase)*.028;group.rotation.x=Math.cos(elapsed+phase)*.012;});
      animatedCoins.forEach(({group,y,phase})=>{group.rotation.y=elapsed*1.3+phase;group.position.y=y+Math.sin(elapsed*1.9+phase)*.08;});
      animatedFlags.forEach(({mesh,positions,phase})=>{
        const p=mesh.geometry.attributes.position;
        for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(positions[i*3]*12-elapsed*4+phase)*.055*(positions[i*3]/.41));
        p.needsUpdate=true;mesh.geometry.computeVertexNormals();
      });
      clouds.forEach(({group,x,y,z,phase})=>{group.position.set(x+Math.sin(elapsed*.16+phase)*.24,y+Math.sin(elapsed*.35+phase)*.07,z+Math.cos(elapsed*.13+phase)*.15);});
      smokePuffs.forEach(({mesh,x,y,z,phase})=>{const t=(elapsed*.18+phase)%1;mesh.position.set(x+Math.sin(t*4)*.15+t*.15,y+t*.9,z-t*.13);mesh.scale.setScalar(.5+t*1.6);mesh.material.opacity=(1-t)*.32;});
      waterRipples.forEach(({mesh,phase})=>{const t=(elapsed*.35+phase)%1;mesh.scale.setScalar(.4+t*1.6);mesh.material.opacity=(1-t)*.55;});
      waterfalls.forEach(item=>{
        if(item.drop){const t=(elapsed*.7+item.phase)%1;item.drop.position.y=-t*1.8;item.drop.position.x=Math.sin(t*8+item.phase)*.09;return;}
        const p=item.mesh.geometry.attributes.position;
        for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(item.positions[i*3+1]*13+elapsed*7)*.026);
        p.needsUpdate=true;
      });
      rotor.rotation.z=-elapsed*1.5;beacon.rotation.y=elapsed*.35;
      fireflies.forEach(({mesh,x,y,z,phase})=>{mesh.position.set(x+Math.sin(elapsed*.7+phase)*.13,y+Math.sin(elapsed*1.1+phase)*.1,z+Math.cos(elapsed*.5+phase)*.12);mesh.material.opacity=.45+Math.sin(elapsed*2+phase)*.3;});
      littleBirds.forEach(({group,left,right,phase})=>{const angle=elapsed*.19+phase;group.position.set(Math.cos(angle)*2.8,2.9+Math.sin(angle*2)*.15,Math.sin(angle)*1.8-.2);group.rotation.y=-angle;left.rotation.z=Math.sin(elapsed*7+phase)*.45;right.rotation.z=-Math.sin(elapsed*7+phase)*.45;});
      if(walkPause>0){
        walkPause-=delta;
        if(walkPause<=0){
          const next=requestedStage!==null && requestedStage!==walkingFrom ? (walkingFrom+(requestedStage>walkingFrom?1:-1)+5)%5 : (walkingFrom+1)%5;
          if(requestedStage===walkingFrom)requestedStage=null;
          beginWalk(next);
        }
      } else if(walkCurve){
        walkProgress=Math.min(1,walkProgress+delta/walkDuration);
        walkCurve.getPointAt(walkProgress,walkingPosition);walkCurve.getTangentAt(walkProgress,walkingTangent);
        player.position.copy(walkingPosition);player.position.y+=Math.abs(Math.sin(elapsed*9))*.065;
        player.rotation.y=Math.atan2(walkingTangent.x,walkingTangent.z);
        player.rotation.z=Math.sin(elapsed*9)*.035;
        legs.forEach((leg,i)=>{leg.rotation.x=Math.sin(elapsed*9+i*Math.PI)*.5;leg.position.z=.01+Math.sin(elapsed*9+i*Math.PI)*.055;});
        feet.forEach((foot,i)=>{foot.position.z=.05+Math.sin(elapsed*9+i*Math.PI)*.085;foot.position.y=.025+Math.max(0,Math.sin(elapsed*9+i*Math.PI))*.06;});
        if(armLeft)armLeft.rotation.x=-Math.sin(elapsed*9)*.4;
        if(armRight)armRight.rotation.x=Math.sin(elapsed*9)*.4;
        if(walkProgress>=1){walkingFrom=walkingTo;walkCurve=null;walkPause=2.8;legs.forEach(leg=>{leg.rotation.x=0;});if(armLeft)armLeft.rotation.x=0;if(armRight)armRight.rotation.x=0;}
      }
    }
    canvas.dataset.ready='true';canvas.dataset.motion=motionPlaying?'playing':'paused';
    container.classList.add('scene-ready');
    renderer.render(scene,camera);positionLabels();renderRequested=false;
  });
  return {select,reset,setMotion,toggleMotion,isPlaying:()=>motionPlaying};
}
