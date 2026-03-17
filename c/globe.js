/**
 * globe.js — Self-contained WebGL dot-matrix globe component
 * Usage: initGlobe(canvasElement, options?)
 * Options: { rotationSpeed = 0.001, hoverSpeed = 0.0002, tiltX = 0.3 }
 */
(function (global) {

  // ── Minimal mat4 math ──────────────────────────────────────────────────────
  const mat4 = {
    create() {
      return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
    },
    perspective(out, fovy, aspect, near, far) {
      const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
      out[0]=f/aspect; out[1]=0;  out[2]=0;              out[3]=0;
      out[4]=0;        out[5]=f;  out[6]=0;              out[7]=0;
      out[8]=0;        out[9]=0;  out[10]=(far+near)*nf; out[11]=-1;
      out[12]=0;       out[13]=0; out[14]=2*far*near*nf; out[15]=0;
      return out;
    },
    translate(out, a, [x,y,z]) {
      if (a === out) {
        out[12]=a[0]*x+a[4]*y+a[8]*z+a[12];
        out[13]=a[1]*x+a[5]*y+a[9]*z+a[13];
        out[14]=a[2]*x+a[6]*y+a[10]*z+a[14];
        out[15]=a[3]*x+a[7]*y+a[11]*z+a[15];
      } else {
        for (let i=0;i<12;i++) out[i]=a[i];
        out[12]=a[0]*x+a[4]*y+a[8]*z+a[12];
        out[13]=a[1]*x+a[5]*y+a[9]*z+a[13];
        out[14]=a[2]*x+a[6]*y+a[10]*z+a[14];
        out[15]=a[3]*x+a[7]*y+a[11]*z+a[15];
      }
      return out;
    },
    rotateX(out, a, r) {
      const s=Math.sin(r),c=Math.cos(r);
      const [a10,a11,a12,a13,a20,a21,a22,a23]=[a[4],a[5],a[6],a[7],a[8],a[9],a[10],a[11]];
      if(a!==out){out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];out[12]=a[12];out[13]=a[13];out[14]=a[14];out[15]=a[15];}
      out[4]=a10*c+a20*s; out[5]=a11*c+a21*s; out[6]=a12*c+a22*s; out[7]=a13*c+a23*s;
      out[8]=a20*c-a10*s; out[9]=a21*c-a11*s; out[10]=a22*c-a12*s; out[11]=a23*c-a13*s;
      return out;
    },
    rotateY(out, a, r) {
      const s=Math.sin(r),c=Math.cos(r);
      const [a00,a01,a02,a03,a20,a21,a22,a23]=[a[0],a[1],a[2],a[3],a[8],a[9],a[10],a[11]];
      if(a!==out){out[4]=a[4];out[5]=a[5];out[6]=a[6];out[7]=a[7];out[12]=a[12];out[13]=a[13];out[14]=a[14];out[15]=a[15];}
      out[0]=a00*c-a20*s; out[1]=a01*c-a21*s; out[2]=a02*c-a22*s; out[3]=a03*c-a23*s;
      out[8]=a00*s+a20*c; out[9]=a01*s+a21*c; out[10]=a02*s+a22*c; out[11]=a03*s+a23*c;
      return out;
    }
  };

  // ── Shaders ────────────────────────────────────────────────────────────────
  const VS = `
    attribute vec3 aPos;
    attribute float aType;
    uniform mat4 uMV;
    uniform mat4 uP;
    uniform float uPS;
    varying float vDepth;
    varying float vType;
    void main(void) {
      vec4 mv = uMV * vec4(aPos, 1.0);
      gl_Position = uP * mv;
      gl_PointSize = aType == 0.0 ? uPS / -mv.z * 4.0 : 1.0;
      vDepth = (mv.z + 5.0) / 4.0;
      vType  = aType;
    }
  `;

  const FS = `
    precision mediump float;
    varying float vDepth;
    varying float vType;
    uniform float uTime;
    void main(void) {
      vec3 color = vec3(0.95, 0.98, 1.0);
      float alpha = smoothstep(1.2, -0.5, vDepth);
      if (vType == 0.0) {
        vec2 coord = gl_PointCoord - vec2(0.5);
        if (length(coord) > 0.5) discard;
        alpha *= smoothstep(0.5, 0.2, length(coord));
        alpha *= 0.6 + 0.4 * sin(uTime * 2.0 + vDepth * 10.0);
      } else {
        alpha *= 0.15;
        color  = vec3(0.6, 0.7, 0.8);
      }
      if (alpha < 0.01) discard;
      gl_FragColor = vec4(color, alpha);
    }
  `;

  // ── Geometry ───────────────────────────────────────────────────────────────
  function buildGeometry() {
    const V=[], T=[], R=2.0;
    function noise(x,y,z){ return Math.sin(x*3)*Math.cos(y*4)+Math.sin(z*5)*Math.cos(x*2); }

    for(let lat=0;lat<=70;lat++){
      const t=lat*Math.PI/70, st=Math.sin(t), ct=Math.cos(t);
      for(let lon=0;lon<=140;lon++){
        const p=lon*2*Math.PI/140;
        const x=Math.cos(p)*st, y=ct, z=Math.sin(p)*st;
        if(noise(x,y,z)>-0.2||Math.random()>0.8){ V.push(R*x,R*y,R*z); T.push(0); }
      }
    }
    const G=24;
    for(let lat=1;lat<G;lat++){
      const t=lat*Math.PI/G, st=Math.sin(t), ct=Math.cos(t);
      for(let lon=0;lon<=60;lon++){
        const p=lon*2*Math.PI/60;
        V.push(R*Math.cos(p)*st, R*ct, R*Math.sin(p)*st); T.push(1);
      }
    }
    for(let lon=0;lon<G;lon++){
      const p=lon*Math.PI/G;
      for(let lat=0;lat<=60;lat++){
        const t=lat*2*Math.PI/60;
        V.push(R*Math.cos(p)*Math.sin(t), R*Math.cos(t), R*Math.sin(p)*Math.sin(t)); T.push(1);
      }
    }
    return { verts: new Float32Array(V), types: new Float32Array(T) };
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  function initGlobe(canvas, opts = {}) {
    const { rotationSpeed = 0.001, hoverSpeed = 0.0002, tiltX = 0.3 } = opts;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: true })
             || canvas.getContext('experimental-webgl');
    if (!gl) { console.error('Globe: WebGL not supported'); return; }

    // Compile shader
    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s)); gl.deleteShader(s); return null;
      }
      return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);

    const info = {
      aPos:  gl.getAttribLocation(prog,  'aPos'),
      aType: gl.getAttribLocation(prog,  'aType'),
      uMV:   gl.getUniformLocation(prog, 'uMV'),
      uP:    gl.getUniformLocation(prog, 'uP'),
      uPS:   gl.getUniformLocation(prog, 'uPS'),
      uTime: gl.getUniformLocation(prog, 'uTime'),
    };

    const geom = buildGeometry();
    const posBuf  = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geom.verts, gl.STATIC_DRAW);

    const typeBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, typeBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geom.types, gl.STATIC_DRAW);

    let rotY = 0, speed = rotationSpeed;

    canvas.addEventListener('mouseenter', () => speed = hoverSpeed);
    canvas.addEventListener('mouseleave', () => speed = rotationSpeed);

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    function draw(t) {
      resize();
      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

      const P  = mat4.create();
      mat4.perspective(P, Math.PI/4, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
      const MV = mat4.create();
      mat4.translate(MV, MV, [0,0,-6.5]);
      mat4.rotateX(MV, MV, tiltX);
      mat4.rotateY(MV, MV, rotY);

      gl.useProgram(prog);

      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.vertexAttribPointer(info.aPos, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(info.aPos);

      gl.bindBuffer(gl.ARRAY_BUFFER, typeBuf);
      gl.vertexAttribPointer(info.aType, 1, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(info.aType);

      gl.uniformMatrix4fv(info.uP,  false, P);
      gl.uniformMatrix4fv(info.uMV, false, MV);
      gl.uniform1f(info.uPS,   Math.max(2, canvas.clientHeight / 300));
      gl.uniform1f(info.uTime, t * 0.001);

      gl.drawArrays(gl.POINTS, 0, geom.verts.length / 3);

      rotY += speed;
      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  global.initGlobe = initGlobe;

})(window);
