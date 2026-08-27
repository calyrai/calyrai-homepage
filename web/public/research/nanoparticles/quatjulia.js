(() => {
  const host = document.querySelector('.visual');
  if (!host) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'quat-julia';
  canvas.setAttribute('aria-label', 'Interactive Lotka–Volterra driven quaternion Julia body');
  host.prepend(canvas);
  const note = document.createElement('div');
  note.className = 'model-note';
  note.innerHTML = '<strong>LOTKA–VOLTERRA × QUATERNION JULIA</strong><span>Predator–prey states continuously deform the 3D body.</span>';
  host.append(note);
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) { canvas.remove(); return; }

  const vertex = `#version 300 es
  in vec2 p; void main(){gl_Position=vec4(p,0.,1.);}`;
  const fragment = `#version 300 es
  precision highp float;
  out vec4 outColor;
  uniform vec2 resolution;
  uniform vec2 rotation;
  uniform float zoom;
  uniform float time;
  uniform vec4 juliaC;

  mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
  vec4 qsqr(vec4 q){return vec4(q.x*q.x-dot(q.yzw,q.yzw),2.0*q.x*q.yzw);}
  float map(vec3 p){
    p.xy*=rot(rotation.x); p.yz*=rot(rotation.y);
    vec4 z=vec4(p,0.0); float dr=1.0; float r=0.0;
    for(int i=0;i<13;i++){
      r=length(z); if(r>4.0) break;
      dr=max(2.0*r*dr,0.001); z=qsqr(z)+juliaC;
    }
    return .55*log(max(r,1.001))*r/dr;
  }
  vec3 normalAt(vec3 p){
    vec2 e=vec2(.0015,0.); float d=map(p);
    return normalize(vec3(map(p+e.xyy)-d,map(p+e.yxy)-d,map(p+e.yyx)-d));
  }
  void main(){
    vec2 uv=(2.0*gl_FragCoord.xy-resolution)/resolution.y;
    vec3 ro=vec3(0.,0.,3.8/zoom), rd=normalize(vec3(uv,-1.75));
    float t=0., d=0.; bool hit=false;
    for(int i=0;i<96;i++){
      vec3 p=ro+rd*t; d=map(p);
      if(d<.0013){hit=true;break;} if(t>7.)break;
      t+=clamp(d,.004,.12);
    }
    vec3 col=vec3(.985);
    if(hit){
      vec3 p=ro+rd*t, n=normalAt(p);
      vec3 light=normalize(vec3(-.7,.9,1.2));
      float diff=max(dot(n,light),0.); float rim=pow(1.-max(dot(n,-rd),0.),2.4);
      float bands=.5+.5*sin(30.*length(p)+time*.8);
      vec3 ink=mix(vec3(.025),vec3(.72,.0,.015),diff*.75+rim*.65);
      col=ink+vec3(.22,.0,.0)*bands*rim;
    }
    float vignette=1.-.14*dot(uv,uv);
    outColor=vec4(col*vignette,1.);
  }`;
  const shader = (type, source) => {
    const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  try {
    const program=gl.createProgram();
    gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));
    gl.linkProgram(program); if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(program,'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    const u=n=>gl.getUniformLocation(program,n), U={resolution:u('resolution'),rotation:u('rotation'),zoom:u('zoom'),time:u('time'),juliaC:u('juliaC')};
    let rx=-.28, ry=.18, zoom=1, dragging=false, px=0, py=0, paused=false;
    let prey=1.15,pred=.82,last=performance.now(),elapsed=0;
    canvas.addEventListener('pointerdown',e=>{dragging=true;px=e.clientX;py=e.clientY;canvas.setPointerCapture(e.pointerId)});
    canvas.addEventListener('pointermove',e=>{if(!dragging)return;rx+=(e.clientX-px)*.007;ry+=(e.clientY-py)*.007;px=e.clientX;py=e.clientY});
    canvas.addEventListener('pointerup',()=>dragging=false);
    canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.min(1.8,Math.max(.65,zoom*Math.exp(-e.deltaY*.001)))},{passive:false});
    addEventListener('keydown',e=>{if(e.code==='Space'&&!/INPUT|TEXTAREA/.test(e.target.tagName)){e.preventDefault();paused=!paused}});
    const resize=()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight),d=Math.min(devicePixelRatio,w<700?1:1.4);canvas.width=w*d;canvas.height=h*d;gl.viewport(0,0,canvas.width,canvas.height)};
    new ResizeObserver(resize).observe(host); resize();
    const draw=now=>{
      const dt=Math.min((now-last)/1000,.03); last=now;
      if(!paused){
        const alpha=1.25,beta=.92,delta=.72,gamma=1.05;
        const dx=alpha*prey-beta*prey*pred,dy=delta*prey*pred-gamma*pred;
        prey=Math.max(.08,prey+dx*dt*.34); pred=Math.max(.08,pred+dy*dt*.34); elapsed+=dt;
      }
      gl.uniform2f(U.resolution,canvas.width,canvas.height);gl.uniform2f(U.rotation,rx,ry);gl.uniform1f(U.zoom,zoom);gl.uniform1f(U.time,elapsed);
      gl.uniform4f(U.juliaC,-.48+.055*Math.tanh(prey-1.),.52+.06*Math.tanh(pred-1.),.19+.035*Math.sin(elapsed*.23),-.31+.04*Math.cos(elapsed*.17));
      gl.drawArrays(gl.TRIANGLES,0,3); requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  } catch (error) { console.warn('Quaternion Julia unavailable', error); canvas.remove(); }
})();
