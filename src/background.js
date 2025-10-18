function hexToRgb01(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

const VERT_SRC = `#version 300 es
void main() {
    vec2 pos = vec2( (gl_VertexID==1)? 3.0 : -1.0,
                     (gl_VertexID==2)? 3.0 : -1.0 );
    gl_Position = vec4(pos, 0.0, 1.0);
}`;

const FRAG_SRC = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_grid;
uniform float u_speed;
uniform float u_contrast;
uniform float u_pow;
uniform vec3  u_colA;
uniform vec3  u_colB;
uniform int   u_mode;
uniform float u_seed;

vec3 hash3(vec3 p){
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 19.19);
    return fract((p.xxy + p.yzz) * p.zyx);
}
vec3 grad(vec3 ip){ vec3 h = hash3(ip + vec3(u_seed)); return normalize(h*2.0-1.0); }
float fade(float t){ return t*t*t*(t*(t*6.0-15.0)+10.0); }

float perlin3(vec3 P){
    vec3 pi = floor(P);
    vec3 pf = P - pi;

    vec3 g000 = grad(pi + vec3(0,0,0));
    vec3 g100 = grad(pi + vec3(1,0,0));
    vec3 g010 = grad(pi + vec3(0,1,0));
    vec3 g110 = grad(pi + vec3(1,1,0));
    vec3 g001 = grad(pi + vec3(0,0,1));
    vec3 g101 = grad(pi + vec3(1,0,1));
    vec3 g011 = grad(pi + vec3(0,1,1));
    vec3 g111 = grad(pi + vec3(1,1,1));

    float n000 = dot(g000, pf - vec3(0,0,0));
    float n100 = dot(g100, pf - vec3(1,0,0));
    float n010 = dot(g010, pf - vec3(0,1,0));
    float n110 = dot(g110, pf - vec3(1,1,0));
    float n001 = dot(g001, pf - vec3(0,0,1));
    float n101 = dot(g101, pf - vec3(1,0,1));
    float n011 = dot(g011, pf - vec3(0,1,1));
    float n111 = dot(g111, pf - vec3(1,1,1));

    float u = fade(pf.x), v = fade(pf.y), w = fade(pf.z);

    float x00 = mix(n000, n100, u);
    float x10 = mix(n010, n110, u);
    float y0  = mix(x00,  x10,  v);

    float x01 = mix(n001, n101, u);
    float x11 = mix(n011, n111, u);
    float y1  = mix(x01,  x11,  v);

    return mix(y0, y1, w);
}

void main(){
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec3 P  = vec3(uv * u_grid, u_time * u_speed);

    float n = perlin3(P);
    float v = 0.5*(n+1.0);

    if(u_mode==1)      v = abs(2.0*v - 1.0);
    else if(u_mode==2) v = 1.0 - abs(2.0*v - 1.0);

    float k = 1.0 + u_contrast;
    v = clamp(0.5 + (v - 0.5) * k, 0.0, 1.0);
    v = pow(v, max(u_pow, 0.0001));

    vec3 col = mix(u_colA, u_colB, v);
    outColor = vec4(col, 1.0);
}`;

function createProgram(gl, vsSrc, fsSrc) {
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSrc); gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS))
        throw new Error('VS compile error: ' + gl.getShaderInfoLog(vs));

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSrc); gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS))
        throw new Error('FS compile error: ' + gl.getShaderInfoLog(fs));

    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
        throw new Error('Program link error: ' + gl.getProgramInfoLog(prog));
    gl.deleteShader(vs); gl.deleteShader(fs);
    return prog;
}

export function startBackground(canvas, settings) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const gl = canvas.getContext('webgl2', {
        antialias: false, premultipliedAlpha: false, alpha: false,
        preserveDrawingBuffer: true
    });

    if (!gl) { 
        console.error('WebGL2 not supported');
        return;
    }

    const program = createProgram(gl, VERT_SRC, FRAG_SRC);
    gl.useProgram(program);

    const u_resolution = gl.getUniformLocation(program, 'u_resolution');
    const u_time       = gl.getUniformLocation(program, 'u_time');
    const u_grid       = gl.getUniformLocation(program, 'u_grid');
    const u_speed      = gl.getUniformLocation(program, 'u_speed');
    const u_contrast   = gl.getUniformLocation(program, 'u_contrast');
    const u_pow        = gl.getUniformLocation(program, 'u_pow');
    const u_colA       = gl.getUniformLocation(program, 'u_colA');
    const u_colB       = gl.getUniformLocation(program, 'u_colB');
    const u_mode       = gl.getUniformLocation(program, 'u_mode');
    const u_seed       = gl.getUniformLocation(program, 'u_seed');

    let gridX = 12;
    let gridY = 12;

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width * dpr));
        const h = Math.max(1, Math.floor(rect.height * dpr));

        gridX = settings.grid * (w/h);
        gridY = settings.grid;

        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w; canvas.height = h;
            gl.viewport(0, 0, w, h);
        }
    }
    window.addEventListener('resize', resize);
    resize();

    function frame() {
        gl.uniform2f(u_resolution, canvas.width, canvas.height);
        gl.uniform1f(u_time, performance.now() / 1000);
        gl.uniform2f(u_grid, gridX, gridY);
        gl.uniform1f(u_speed, settings.speed);
        gl.uniform1f(u_contrast, settings.contrast);
        gl.uniform1f(u_pow, settings.pow);
        gl.uniform3f(u_colA, settings.colA[0], settings.colA[1], settings.colA[2]);
        gl.uniform3f(u_colB, settings.colB[0], settings.colB[1], settings.colB[2]);
        gl.uniform1i(u_mode, settings.mode);
        gl.uniform1f(u_seed, settings.seed);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (!prefersReducedMotion) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}