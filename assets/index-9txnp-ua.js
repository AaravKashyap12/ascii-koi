(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const h of r.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&i(h)}).observe(document,{childList:!0,subtree:!0});function n(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=n(s);fetch(s.href,r)}})();const C=12,$t=5,uo=2*$t,po=1,ge=.6,mo=.045,wo=2,qt=Math.PI/C,Qe=Array.from({length:95},(e,a)=>String.fromCharCode(32+a)),u=e=>e.charCodeAt(0)-32,Ut="ui-monospace, Menlo, monospace",go=[400,700,800],vo=.11,et=12/11,yo=10,xo=9,bo=.24,ko=2.6,Y={bg:"#e8ebe5",ink:"#16140f",accent:"#de3f1c",white:"#fdfcf7",shade:"#435a5f",glint:"#ffffff"},Bt=160,pe=4,Le=32,o={dpr:1,cellPx:12,cw:6,ch:12,cols:1,rows:1,offX:0,offY:0,gw:1,gh:1,unit:1,W:1,H:1,fbo:null,tData:null,tPageD:null,shape:null,tWater:null,atlas:null,atlasW:1,atlasH:1,hi:null,hiCw:1,hiCh:1,hiPad:2,hiW:1,hiH:1,base:null,page:null,tPage:null,box:[0,0,1,1]};let t;function Mo(e){const a=e.getContext("webgl2",{antialias:!1,alpha:!1,depth:!1,stencil:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!0,powerPreference:"high-performance"});return a&&(t=a),a}const Ao=`#version 300 es
void main(){ vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;function Rt(e,a){const n=t.createShader(e);if(t.shaderSource(n,a),t.compileShader(n),!t.getShaderParameter(n,t.COMPILE_STATUS)){const i=t.getShaderInfoLog(n);throw console.error(i),new Error(i??"shader")}return n}function Ue(e,a=Ao){const n=t.createProgram();if(t.attachShader(n,Rt(t.VERTEX_SHADER,a)),t.attachShader(n,Rt(t.FRAGMENT_SHADER,e)),t.linkProgram(n),!t.getProgramParameter(n,t.LINK_STATUS))throw new Error(t.getProgramInfoLog(n)??"link");const i={},s=t.getProgramParameter(n,t.ACTIVE_UNIFORMS);for(let r=0;r<s;r++){const h=t.getActiveUniform(n,r);i[h.name.replace(/\[0\]$/,"")]=t.getUniformLocation(n,h.name)}return{p:n,u:i}}function oe(e,a,n,i=!1){const s=t.createTexture();return t.bindTexture(t.TEXTURE_2D,s),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,i?t.LINEAR_MIPMAP_LINEAR:t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,i?t.LINEAR:t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),n instanceof Uint8Array?t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,e,a,0,t.RGBA,t.UNSIGNED_BYTE,n):n?t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,n):t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,e,a,0,t.RGBA,t.UNSIGNED_BYTE,null),i&&t.generateMipmap(t.TEXTURE_2D),s}function To(...e){const a=t.createFramebuffer();return t.bindFramebuffer(t.FRAMEBUFFER,a),e.forEach((n,i)=>t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+i,t.TEXTURE_2D,n,0)),t.drawBuffers(e.map((n,i)=>t.COLOR_ATTACHMENT0+i)),t.bindFramebuffer(t.FRAMEBUFFER,null),a}const Eo=[[.28,.2],[.72,.2],[.28,.5],[.72,.5],[.28,.8],[.72,.8]],Se=(e,a)=>`${e} ${a}px ${Ut}`,Ee=4,tt=95,Be=e=>`400 ${e}px Impact, "Arial Narrow", ${Ut}`,Po=15/12;function ot(e,a,n,i,s,r,h=0){const c=w=>w*(n+h*2)+h,f=(w,v)=>{e.save(),e.beginPath(),e.rect(c(w),r+h,n,i),e.clip(),v(),e.restore()};if(e.fillStyle="#fff",e.strokeStyle="#fff",e.lineWidth=s*vo,e.lineJoin="round",a===3){e.textAlign="center",e.textBaseline="alphabetic",e.font=Be(100);const w=i/e.measureText("H").actualBoundingBoxAscent*100,v=s*Po;e.font=Be(v);const x=e.measureText("d").actualBoundingBoxAscent,A=e.measureText("g").actualBoundingBoxDescent,M=Math.round(r+h+i-Math.max(0,(i-(x+A))/2)-A);Qe.forEach((y,l)=>{const d=y>="A"&&y<="Z";e.font=Be(d?w:v),f(l,()=>e.fillText(y,c(l)+n/2,d?r+h+i:M))})}else e.font=Se(go[a],s),e.textBaseline="middle",e.textAlign="center",Qe.forEach((w,v)=>{const x=c(v)+n/2,A=r+h+i/2+s*.04;e.fillText(w,x,A),a===2&&e.strokeText(w,x,A)})}function Io(){const a=document.createElement("canvas"),n=a.getContext("2d",{willReadFrequently:!0});n.font=Se(400,48);const i=Math.round(n.measureText("M").width),s=Math.round(48*et);a.width=i*tt,a.height=s;const r=new Uint8Array(570*4);[0,3,1].forEach((h,c)=>{n.clearRect(0,0,a.width,a.height),ot(n,h,i,s,48,0);const f=n.getImageData(0,0,a.width,a.height).data,w=.21*i,v=Qe.map((A,M)=>Eo.map(([y,l])=>{const d=M*i+y*i,g=l*s;let b=0,m=0;for(let k=Math.floor(g-w);k<=Math.ceil(g+w);k++)for(let T=Math.floor(d-w);T<=Math.ceil(d+w);T++)(T-d)**2+(k-g)**2>w*w||(b+=f[(k*a.width+T)*4+3]/255,m++);return b/m})),x=[0,1,2,3,4,5].map(A=>c?1:Math.max(.001,...v.map(M=>M[A])));v.forEach((A,M)=>{for(let y=0;y<6;y++){const l=c*2+(y<4?0:1),d=y<4?y:y-4;r[(l*95+M)*4+d]=Math.round(Math.min(1,A[y]/x[y])*255)}})}),o.shape&&t.deleteTexture(o.shape),o.shape=oe(95,6,r)}function Ro(e){const a=e*o.dpr,n=document.createElement("canvas"),i=n.getContext("2d");i.font=Se(400,a),o.cw=Math.max(2,Math.round(i.measureText("M").width)),o.ch=Math.max(3,Math.round(e*et*o.dpr)),n.width=tt*o.cw,n.height=Ee*o.ch;for(let f=0;f<Ee;f++)ot(i,f,o.cw,o.ch,a,f*o.ch);o.atlas&&t.deleteTexture(o.atlas),o.atlas=oe(n.width,n.height,n,!0),o.atlasW=n.width,o.atlasH=n.height;const s=64,r=document.createElement("canvas"),h=r.getContext("2d");h.font=Se(400,s),o.hiCw=Math.round(h.measureText("M").width),o.hiCh=Math.round(s*et);const c=o.hiPad;r.width=tt*(o.hiCw+c*2),r.height=Ee*(o.hiCh+c*2);for(let f=0;f<Ee;f++)ot(h,f,o.hiCw,o.hiCh,s,f*(o.hiCh+c*2),c);o.hiW=r.width,o.hiH=r.height,o.hi&&t.deleteTexture(o.hi),o.hi=oe(r.width,r.height,r,!0)}const Do=1,Dt={RH:.36,RT:.92,RIM_A:3.8,EASE:1.6,FLAT:1},I=1.5,N=.7,J=.019,Co=.03,X=.1*I,P=220,z=(I+N)/(P-1),he=30,le=12,Ne=4,j=6,Ct=(e,a,n)=>{const i=Math.min(1,Math.max(0,(n-e)/(a-e)));return i*i*(3-2*i)},Lo=.42,ue=e=>e+Lo*Math.sin(e),Pe=3.7,So=1.5;function Fo(e){return a=>{if(a<=e[0][0])return e[0][1];let n=0;for(;n<e.length-2&&a>e[n+1][0];)n++;const[i,s]=e[n],[r,h]=e[n+1],c=e[Math.max(0,n-1)][1],f=e[Math.min(e.length-1,n+2)][1],w=Math.min(1,(a-i)/(r-i)),v=w*w,x=v*w;return .5*(2*s+(-c+h)*w+(2*c-5*s+4*h-f)*v+(-c+3*s-3*h+f)*x)}}const at=.15,Q=Fo([[0,.3],[.02,.47],[.05,.6],[.09,.7],[.13,.76],[.17,.86],[.22,.96],[.27,1],[.34,.99],[.43,.92],[.53,.8],[.63,.64],[.73,.48],[.83,.34],[.92,.25],[1,.21]]),_o=e=>{const a=e/(he-1);return .55*(.5-.5*Math.cos(Math.PI*a))+.45*a},ee=Float64Array.from({length:P},(e,a)=>{const n=a*z/I;return n>1?0:Q(n)**2}),re=ee.reduce((e,a)=>e+a,0);class it{sx=new Float64Array(P);sy=new Float64Array(P);sth=new Float64Array(P);f={body:new Float32Array(he*4),tail:new Float32Array(le*4),fins:new Float32Array(Ne*j*4),eyes:[0,0,0,0],crown:[0,0,0,0],barbels:new Float32Array(8),gill:[0,0,0,1],tip:[0,0,0],bound:[0,0,1],flow:[1,0],psi:0};wave(a,n,i){const s=a/I,r=.62*i,h=.05*Math.sin(n.slow-2.2*Math.min(s,1.2));if(s<=1){const f=.06+.94*Math.pow(Ct(.05,1,s),1.6);return h+r*f*Math.sin(ue(n.psi-Pe*s))}const c=(a-I)/N;return h+r*.8*(1-.2*c)*Math.sin(ue(n.psi-Pe-So*c))+.6*i*c*c*Math.sin(ue(n.psi-Pe-2.2)-3.4*c)}rest={x:new Float64Array(P),y:new Float64Array(P),th:new Float64Array(P),k:new Float64Array(P)};dense={x:new Float64Array(4096),y:new Float64Array(4096),s:new Float64Array(4096)};buildRest(a){const{x:n,y:i,th:s,k:r}=this.rest,h=this.dense,{RT:c,RIM_A:f,EASE:w,FLAT:v}=Dt,x=a.rad,A=Dt.RH*a.curl,M=m=>{const k=Math.min(1,m/f),T=1-Math.pow(1-k,w),ne=k*k*k*(k*(k*6-15)+10);return x*(A+(c-A)*(T+(ne-T)*v))},y=I+N+z;let l=0,d=0,g=0;for(h.x[0]=M(0)*Math.cos(a.phi),h.y[0]=M(0)*Math.sin(a.phi),h.s[0]=0;g<y&&l<4095;){d+=.002;const m=M(d),k=m*Math.cos(a.phi-d),T=m*Math.sin(a.phi-d);g+=Math.hypot(k-h.x[l],T-h.y[l]),l++,h.x[l]=k,h.y[l]=T,h.s[l]=g}let b=0;for(let m=0;m<P;m++){const k=m*z;for(;b<l-1&&h.s[b+1]<k;)b++;const T=(k-h.s[b])/Math.max(1e-9,h.s[b+1]-h.s[b]);n[m]=h.x[b]+(h.x[b+1]-h.x[b])*T,i[m]=h.y[b]+(h.y[b+1]-h.y[b])*T}for(let m=0;m<P-1;m++){let k=Math.atan2(i[m]-i[m+1],n[m]-n[m+1]);m>0&&(k+=Math.PI*2*Math.round((s[m-1]-k)/(Math.PI*2))),s[m]=k}s[P-1]=s[P-2];for(let m=0;m<P-1;m++)r[m]=-(s[m+1]-s[m])/z;r[P-1]=r[P-2]}buildSpine(a){const{sx:n,sy:i,sth:s}=this,r=this.rest;this.buildRest(a),n[0]=0,i[0]=0,s[0]=r.th[0];for(let l=0;l<P-1;l++){const d=r.k[l]+this.wave((l+.5)*z,a,a.amp);s[l+1]=s[l]-d*z;const g=.5*(s[l]+s[l+1]);n[l+1]=n[l]-z*Math.cos(g),i[l+1]=i[l]-z*Math.sin(g)}let h=0,c=0,f=0,w=0,v=0,x=0;for(let l=0;l<P;l++)h+=ee[l]*r.x[l],c+=ee[l]*r.y[l],f+=ee[l]*r.th[l],w+=ee[l]*n[l],v+=ee[l]*i[l],x+=ee[l]*s[l];h/=re,c/=re,f/=re,w/=re,v/=re,x/=re;const A=f-x,M=Math.cos(A),y=Math.sin(A);for(let l=0;l<P;l++){const d=n[l]-w,g=i[l]-v;n[l]=h+M*d-y*g,i[l]=c+y*d+M*g,s[l]+=A}}at(a){const n=Math.min(P-1.0001,Math.max(0,a/z)),i=Math.floor(n),s=n-i;return[this.sx[i]+(this.sx[i+1]-this.sx[i])*s,this.sy[i]+(this.sy[i+1]-this.sy[i])*s,this.sth[i]+(this.sth[i+1]-this.sth[i])*s]}update(a){this.buildSpine(a);const n=this.f;n.psi=(a.psi%(2*Math.PI)+2*Math.PI)%(2*Math.PI);let i=1e9,s=1e9,r=-1e9,h=-1e9;const c=(l,d,g)=>{i=Math.min(i,l-g),r=Math.max(r,l+g),s=Math.min(s,d-g),h=Math.max(h,d+g)};for(let l=0;l<he;l++){const d=_o(l),[g,b]=this.at(d*I),m=X*Q(d);n.body.set([g,b,m,d],l*4),c(g,b,m)}const f=X*Q(1);for(let l=0;l<le;l++){const d=l/(le-1)*1.06;let[g,b,m]=this.at(I-.012+Math.min(d,1)*N);d>1&&(g-=Math.cos(m)*(d-1)*N,b-=Math.sin(m)*(d-1)*N);const k=1+.1*a.amp*Math.sin(ue(a.psi-Pe-.6)-1.6*d),T=f*.9+.26*N*Math.pow(Ct(0,.75,d),.8)*k;n.tail.set([g,b,T,d],l*4),c(g,b,T+.07)}const[w,v,x]=this.at(I+N);n.tip=[w,v,x];const A=[{u:.2,len:.25,chord:.056,fold:.7,flare:.8,lag:1.3,trail:.36,ph:.6},{u:.53,len:.13,chord:.028,fold:.4,flare:.5,lag:1,trail:.28,ph:2}],M=(l,d)=>l.fold+l.flare*a.amp*Math.pow(.5-.5*Math.cos(ue(d)),1.25);let y=0;for(const l of A)for(let d=0;d<2;d++,y++){const g=d?-1:1,[b,m,k]=this.at(l.u*I),T=X*Q(l.u),ne=Math.cos(k),ye=Math.sin(k),xe=-Math.sin(k)*g,be=Math.cos(k)*g;let fe=b+xe*T*.8-ne*T*.1,U=m+be*T*.8-ye*T*.1;const de=l.len*I/(j-1),ke=a.psi+l.ph+d*.45;for(let se=0;se<j;se++){const L=se/(j-1),Z=M(l,ke-l.lag*L)*(1-.25*L)-l.trail*L*L+.05*L*L*Math.sin(2*ke-4*L+g),B=I*l.chord*(.45+.55*Math.sin(Math.PI*Math.min(1,.15+.75*L)))*(1-.15*L);n.fins.set([fe,U,B,L],(y*j+se)*4),c(fe,U,B);const Me=-ne*Math.cos(Z)+xe*Math.sin(Z),Ae=-ye*Math.cos(Z)+be*Math.sin(Z);fe+=Me*de,U+=Ae*de}}{const[d,g,b]=this.at(.065*I),m=X*Q(.065),k=-Math.sin(b),T=Math.cos(b);n.eyes=[d+k*m*.68,g+T*m*.68,d-k*m*.68,g-T*m*.68];const[ne,ye,xe]=this.at(.112*I);n.crown=[ne,ye,Co,xe];const[be,fe,U]=this.at(.012*I),de=X*Q(.012);for(let B=0;B<2;B++){const Me=B?-1:1,Ae=-Math.sin(U)*Me,Tt=Math.cos(U)*Me,Et=be+Ae*de*.7,Pt=fe+Tt*de*.7,Te=.95+.25*Math.sin(a.psi+1.2+B*.8),It=.045,co=Math.cos(U)*Math.cos(Te)*.6+Ae*Math.sin(Te),fo=Math.sin(U)*Math.cos(Te)*.6+Tt*Math.sin(Te);n.barbels.set([Et,Pt,Et+co*It,Pt+fo*It],B*4)}const[ke,se,L]=this.at(at*I);n.gill=[ke,se,L,X*Q(at)];const[,,Z]=this.at(.33*I);n.flow=[Math.cos(Z),Math.sin(Z)]}return n.bound=[(i+r)/2,(s+h)/2,Math.hypot(r-i,h-s)/2],n}}const te=e=>e.toFixed(5),mt=e=>[...e].map(u),Ge=e=>`int[${e.length}](${e.join(", ")})`,We=mt(`NHM[]LJTFPbdqp/\\\\'".,_-`),Xe=mt("-_|/\\\\()'.,"),Oe=mt("=-_/\\\\'.,:"),Gt=`
// the koi's shadow on the pond floor: down and to the right (the light is top left), soft-edged
#define SHADOW_OFF vec2(0.05, -0.075)
#define NB ${he}
#define NT ${le}
#define NF ${Ne}
#define FP ${j}
#define BODY_L ${te(I)}
#define TAIL_L ${te(N)}
#define W_MAX ${te(X)}
#define HAIR_S 0.05
uniform vec4 uBody[NB * 2];
uniform vec4 uTail[NT * 2];
uniform vec4 uFin[NF * FP * 2];
uniform vec4 uEye[2];
uniform vec4 uCrown[2];   // x, y, radius, heading
uniform vec4 uGill[2];    // spine at the gill covers: x, y, heading, half-width
uniform vec4 uTip[2];     // caudal tip x, y, heading, swim phase of that koi
uniform vec4 uBound[2];
uniform vec4 uSwim;      // loop phase (2 pi per loop), amp, surf, wake strength

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 x){
  vec2 i = floor(x), fr = fract(x); fr = fr * fr * (3.0 - 2.0 * fr);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), fr.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), fr.x), fr.y);
}
float smin(float a, float b, float k){ float h = max(k - abs(a - b), 0.0) / k; return min(a, b) - h * h * k * 0.25; }
// the beat's quick stroke and long glide (same warp as koi.ts)
float glide(float th){ return th + 0.42 * sin(th); }

// signed distance (in units of the body's half-width, positive inside) to one streak
float streakD(float u, float v, float u0, float u1, float vc, float wd){
  float x = (u - u0) / (u1 - u0);
  float taper = pow(sin(3.14159265 * clamp(x, 0.0, 1.0)), 0.7) * (1.0 - 0.35 * x);
  float c = vc + 0.07 * sin(x * 5.0 + vc * 9.0);
  return x <= 0.0 || x >= 1.0 ? -1.0 : 0.8 * wd * taper - abs(v - c);
}
// (the same pattern on both: black streaks on the white koi answer the white streaks on the black one)
float streakDist(float u, float v){
  return max(streakD(u, v, 0.26, 0.52, 0.5, 0.12), streakD(u, v, 0.44, 0.68, -0.46, 0.1));
}
float whiteAt(float u, float v){ return step(0.0, streakDist(u, v)); }
// the streak nearest this point as a brush stroke: signed offset from its centreline and its half-width
// (both in units of the body's half-width)
vec2 streakLineOf(float u, float v, float u0, float u1, float vc, float wd){
  float x = (u - u0) / (u1 - u0);
  float taper = pow(sin(3.14159265 * clamp(x, 0.0, 1.0)), 0.7) * (1.0 - 0.35 * x);
  float c = vc + 0.07 * sin(x * 5.0 + vc * 9.0);
  return vec2(v - c, x <= 0.0 || x >= 1.0 ? 0.0 : 0.8 * wd * taper);
}
vec2 streakLine(float u, float v){
  vec2 a = streakLineOf(u, v, 0.26, 0.52, 0.5, 0.12), b = streakLineOf(u, v, 0.44, 0.68, -0.46, 0.1);
  return a.y - abs(a.x) > b.y - abs(b.x) ? a : b;
}

// bokashi: wet, dark ink on the head and down the flanks, a slightly lighter sheen along the back
// (the body is round), a light line where the gill cover lifts, and the brush running dry toward the
// tail in hairs that follow the body. All in body coordinates, so the gradation swims with the fish.
float bodyTone(float u, float v){
  float av = abs(v);
  float t = 1.0;
  t -= 0.17 * exp(-(v * v) / 0.09) * smoothstep(0.14, 0.26, u) * (1.0 - smoothstep(0.6, 0.86, u));
  float gu = ${te(at)} + 0.035 * (1.0 - av * av);
  t -= 0.3 * exp(-pow((u - gu) / 0.014, 2.0)) * smoothstep(0.25, 0.5, av) * (1.0 - smoothstep(0.88, 1.0, av));
  float dry = smoothstep(0.58, 0.97, u);
  float hn = vnoise(vec2(v * 8.0, u * 2.4));
  t -= dry * 0.5 * smoothstep(0.45, 0.75, hn);
  return clamp(t, 0.0, 1.0);
}

float tailEdge(float b){
  return b < 0.72 ? 0.5 + 0.5 * pow(sin(b / 0.72 * 1.5707963), 1.4) : 1.0 - 0.35 * pow((b - 0.72) / 0.28, 2.0);
}

struct K {
  float ink;    // coverage-based ink for shape matching (no texture)
  float crown; float body; float sd; vec2 away; float dAny; float under;
  vec2 dir;     // stroke direction here: along the spine, a tail ray or a fin
  float lineD;  // world distance to the nearest flow line / ray
  float stroky; // 0 = solid ink, 1 = frayed into strokes
  float fade;   // ink strength of strokes (silk thins toward the edges)
  float flow;   // 1 where a body flow line may run
  vec3 bq;      // body coordinates: u along (0 snout, 1 peduncle), v across (-1..1), local half-width
  float tone;   // ink tone of the wash here (bokashi), 0..1
  float hair;   // dry-brush tips: +2 inside the tip zone, +1 where this hair is not broken
  float who;    // which koi: 0 the black one, 1 the white one
  float strk;   // signed distance to a streak of the other koi's colour (world, positive inside)
  vec4 strk2;   // the two streaks as strokes: signed offset from each centreline and its half-width (world)
};

// one koi at world point p. aa is the edge softness in world units
K koiAt(vec2 p, int k, float aa){
  K r = K(0.0, 0.0, 0.0, 1e3, vec2(0.0), 1e3, 0.0, vec2(1.0, 0.0), 1e3, 0.0, 1.0, 0.0, vec3(0.0, 0.0, 1.0), 1.0, 0.0, float(k), -1.0, vec4(3.0, 0.0, 3.0, 0.0));
  vec4 bd = uBound[k];
  float far = length(p - bd.xy) - bd.z;
  if (far > 0.14) { r.dAny = far; r.sd = far; r.away = normalize(p - bd.xy); return r; }
  float psi = uTip[k].w, amp = uSwim.y;

  // body: union of tapered capsules along the spine
  float best = 1e9, bu = 0.0, bv = 0.0, brr = 1.0; vec2 bax = vec2(0.0, 1.0), btn = vec2(1.0, 0.0);
  float spD = 1e9; vec3 sq = vec3(0.0, 0.0, 1.0);
  for (int i = 0; i < NB - 1; i++) {
    vec4 A = uBody[k * NB + i], B = uBody[k * NB + i + 1];
    vec2 ab = B.xy - A.xy, ap = p - A.xy;
    float t = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-9), 0.0, 1.0);
    vec2 q = A.xy + ab * t;
    float rr = mix(A.z, B.z, t);
    float d = length(p - q) - rr;
    if (d < best) {
      best = d; bu = mix(A.w, B.w, t); brr = rr;
      vec2 tn = normalize(ab);
      bv = (tn.x * (p.y - q.y) - tn.y * (p.x - q.x)) / max(rr, 1e-4);
      bax = p - q;
    }
    // smooth body coordinates for the scales: the nearest point of the spine itself
    float dsp = length(p - q);
    if (dsp < spD) {
      spD = dsp; vec2 tn = normalize(ab);
      sq = vec3(mix(A.w, B.w, t), (tn.x * (p.y - q.y) - tn.y * (p.x - q.x)) / max(rr, 1e-4), rr); btn = tn;
    }
  }
  float bcov = smoothstep(aa, -aa, best);
  float wh = whiteAt(bu, bv);
  // the body is solid; its streaks are the other koi's colour (drawn by the glyph pass)
  float bodyInk = 1.0;
  // dry-brush flow lines: a few broken strokes running along the body at fixed fractions of its
  // width, so they follow the contour into the peduncle and slide along themselves as it swims
  float fv = abs(bv);
  float lineV = fv < 0.55 ? 0.34 : 0.74;
  float present = smoothstep(0.4, 0.5, vnoise(vec2(bu * 9.0 + (bv > 0.0 ? 5.3 : 0.0), lineV * 7.0)));
  float bodyLineD = abs(fv - lineV) * brr;
  float bodyFlow = present * smoothstep(0.1, 0.18, bu) * (1.0 - smoothstep(0.82, 0.9, bu)) * (1.0 - smoothstep(0.05, 0.2, wh));

  // caudal fin: butterfly fork, outer lobes trailing the centre line; a ripple runs out to the edges
  float tb = 1e9, ta = 0.0, tn = 0.0, tsp = 1.0; vec2 tdir = vec2(1.0, 0.0);
  for (int i = 0; i < NT - 1; i++) {
    vec4 A = uTail[k * NT + i], B = uTail[k * NT + i + 1];
    vec2 ab = B.xy - A.xy, ap = p - A.xy;
    float traw = dot(ap, ab) / max(dot(ab, ab), 1e-9);
    float t = clamp(traw, 0.0, 1.0);
    vec2 q = A.xy + ab * t;
    float d = length(p - q);
    if (d < tb) {
      // ahead of the root the fin does not exist: keep a negative a so it is cut off there
      tb = d; ta = mix(A.w, B.w, i == 0 ? min(traw, 1.0) : t); tsp = mix(A.z, B.z, t);
      vec2 dn = ab / max(length(ab), 1e-6);
      tn = dn.x * (p.y - q.y) - dn.y * (p.x - q.x);
      tdir = dn;
    }
  }
  float b0 = abs(tn) / tsp;
  float lag = TAIL_L * pow(max(ta, 0.0), 1.5) * (0.12 * amp * sin(glide(psi - 6.0 - 2.6 * ta - 1.1 * b0)) + 0.02 * sin(2.0 * psi - 4.0 * ta + 2.2 * b0));
  float n2 = tn - lag;
  float b = abs(n2) / tsp;
  float rag = (vnoise(vec2(b * 9.0, ta * 3.0)) - 0.5) * 0.1;
  float edge = tailEdge(min(b, 1.0)) + rag;
  float tm = min(tsp - abs(n2), (edge - ta) * TAIL_L);
  float tcov = smoothstep(-aa, aa, tm) * smoothstep(-aa, aa, ta * TAIL_L);
  float tfr = ta / max(edge, 0.3);
  // dry brush at the trailing edge: the ink parts into hairs that run with the fin, a couple of cells
  // apart and broken along their length (in the fin's own coordinates, so the hairs swim with it)
  float tHairZ = smoothstep(0.74, 0.9, tfr);
  float thi = floor(n2 / HAIR_S + 0.5);
  float tHairD = abs(n2 - thi * HAIR_S);
  float tHairOn = step(0.46, vnoise(vec2(thi * 3.1, ta * 17.0)));
  // silk: solid at the root, thinning toward the trailing edge
  float tailFade = 1.0 - 0.45 * smoothstep(0.6, 1.0, tfr);
  float tailInk = tcov * 0.97 * tailFade;

  // paired fins: soft leaves, rays along their length, translucent at the tips
  float fb = 1e9, fa = 0.0, fl = 0.0, fc = 1.0; vec2 fdir = vec2(1.0, 0.0);
  for (int j = 0; j < NF; j++) for (int i = 0; i < FP - 1; i++) {
    vec4 A = uFin[(k * NF + j) * FP + i], B = uFin[(k * NF + j) * FP + i + 1];
    vec2 ab = B.xy - A.xy, ap = p - A.xy;
    float t = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-9), 0.0, 1.0);
    vec2 q = A.xy + ab * t;
    float c = mix(A.z, B.z, t);
    float d = length(p - q) - c;
    if (d < fb) {
      fb = d; fa = mix(A.w, B.w, t); fc = c;
      vec2 dn = ab / max(length(ab), 1e-6);
      fl = (dn.x * (p.y - q.y) - dn.y * (p.x - q.x)) / max(c, 1e-4);
      fdir = dn;
    }
  }
  float fcov = smoothstep(aa, -aa, fb);
  float finFade = 1.0 - 0.4 * smoothstep(0.55, 1.0, fa);
  // the same dry brush at the fin tips, hairs along the fin
  float fHairZ = smoothstep(0.62, 0.88, fa);
  float fhi = floor(fl * fc / HAIR_S + 0.5);
  float fHairD = abs(fl * fc - fhi * HAIR_S);
  float fHairOn = step(0.46, vnoise(vec2(fhi * 2.7, fa * 11.0)));
  float finInk = fcov * 0.9 * finFade;

  float under = max(tailInk, finInk);
  r.under = under * (1.0 - bcov);
  r.ink = mix(under, bodyInk, bcov);
  r.body = bcov;
  // in the spine's own coordinates, which run on smoothly from one body segment to the next
  r.strk = bcov > 0.5 ? streakDist(sq.x, sq.y) * sq.z : -1.0;
  r.strk2 = vec4(streakLineOf(sq.x, sq.y, 0.26, 0.52, 0.5, 0.12), streakLineOf(sq.x, sq.y, 0.44, 0.68, -0.46, 0.1)) * sq.z;
  if (bcov > 0.5 || under < 0.02) {
    r.dir = btn; r.lineD = bodyLineD; r.stroky = 0.0; r.fade = 1.0; r.flow = bodyFlow * step(0.5, bcov);
    r.tone = bodyTone(sq.x, sq.y);
  } else if (tailInk >= finInk) {
    r.dir = tdir; r.lineD = tHairD; r.fade = tailFade; r.hair = tHairOn + 2.0 * step(0.5, tHairZ); r.tone = mix(0.86 * tailFade, bodyTone(sq.x, sq.y), bcov);
  } else {
    r.dir = fdir; r.lineD = fHairD; r.fade = finFade; r.hair = fHairOn + 2.0 * step(0.5, fHairZ); r.tone = mix(0.84 * finFade, bodyTone(sq.x, sq.y), bcov);
  }
  vec4 cr = uCrown[k];
  vec2 cq = p - cr.xy;
  cq = vec2(dot(cq, vec2(cos(cr.w), sin(cr.w))), dot(cq, vec2(-sin(cr.w), cos(cr.w))));
  float ca = atan(cq.y, cq.x);
  // read closer, the tancho opens to a rounded patch a few letters across and two or three lines deep,
  // so it is written in the poem's own letters, in vermilion
  float crad = cr.z * mix(0.96, 1.22, uLod) * (1.0 + 0.025 * sin(3.0 * ca + 1.0));
  r.crown = smoothstep(aa, -aa, length(cq / vec2(1.08, 0.96)) - crad) * bcov;
  r.sd = best;
  r.bq = sq;
  r.away = normalize(bax);
  // body, fins and tail joined smoothly, so no sliver of water opens where a fin's root meets the body
  r.dAny = smin(best, smin(fb, max(tb - tsp, -tm), 0.02), 0.025);
  return r;
}

// the koi whose ink is here wins the strokes; the nearest body pushes the page
K both(vec2 p, float aa){
  K a = koiAt(p, 0, aa), c = koiAt(p, 1, aa);
  K r = c;
  if (a.ink > c.ink || (a.ink == c.ink && a.sd < c.sd)) r = a;
  if (a.sd < c.sd) { r.sd = a.sd; r.away = a.away; } else { r.sd = c.sd; r.away = c.away; }
  r.crown = max(a.crown, c.crown); r.body = max(a.body, c.body); r.under = max(a.under, c.under);
  r.dAny = min(a.dAny, c.dAny);
  return r;
}
float shadowAt(K sh){ float s = smoothstep(0.06, -0.07, min(sh.sd, sh.dAny + 0.015)); return s * s * (3.0 - 2.0 * s); }

`,Lt=1.9,St=.95,Wt=4,Xt=2,Ho=`#version 300 es
precision highp float;
precision highp int;
layout(location = 0) out vec4 o0;
layout(location = 1) out vec4 o1;
layout(location = 2) out vec4 o2; // the water for the painted view: its slope here, and the koi's shadow
#define MAXR ${Le}
uniform vec2 uGrid, uCell, uGridPx;
uniform float uUnit;
uniform vec4 uRing[MAXR];  // x, y, packet radius, amplitude
uniform vec4 uRingP[MAXR]; // packet half-width, wave number
uniform int uRingN;
uniform float uPageTone, uLod;
uniform sampler2D uShape; // each glyph's ink at the six sample points: rows 0-1 regular (normalised), 2-3 ink cut, 4-5 bold
uniform vec4 uBox; // the typeset page, in cells: first col, first row, end col, end row
${Gt}

// six sampling points per cell
const vec2 SP[6] = vec2[6](vec2(0.28, 0.2), vec2(0.72, 0.2), vec2(0.28, 0.5), vec2(0.72, 0.5), vec2(0.28, 0.8), vec2(0.72, 0.8));

const int INK[${We.length}] = ${Ge(We)};
const int LINE[${Xe.length}] = ${Ge(Xe)};
const int PALE[${Oe.length}] = ${Ge(Oe)};
vec2 toGridPx(vec2 w){ return vec2(w.x, -w.y) * uUnit + uGridPx * 0.5; }
vec2 cellOf(vec2 w){ return floor(toGridPx(w) / uCell); }

// the glyph of a vocabulary whose ink at the six points best matches v (blank if none beats empty paper)
float shapeD(int g, int set, vec4 v0, vec2 v1){
  vec4 a = texelFetch(uShape, ivec2(g, set * 2), 0); vec2 b = texelFetch(uShape, ivec2(g, set * 2 + 1), 0).xy;
  vec4 da = a - v0; vec2 db = b - v1;
  return dot(da, da) + dot(db, db);
}
// the koi's ink: the ink-cut letter whose own ink lies where the koi covers the cell (absolute coverage),
// so a silhouette or a streak's edge is drawn by the shapes of the letters themselves
int matchInk(float v[6]){
  vec4 v0 = vec4(v[0], v[1], v[2], v[3]); vec2 v1 = vec2(v[4], v[5]);
  float bestD = dot(v0, v0) + dot(v1, v1); int gi = 0;
  for (int n = 0; n < ${We.length}; n++) { float d = shapeD(INK[n], 1, v0, v1); if (d < bestD) { bestD = d; gi = INK[n]; } }
  return gi;
}
// a streak through the cell: the stroke shape (ink cut, absolute coverage) that matches it
int matchPale(float v[6]){
  vec4 v0 = vec4(v[0], v[1], v[2], v[3]); vec2 v1 = vec2(v[4], v[5]);
  float bestD = dot(v0, v0) + dot(v1, v1); int gi = 0;
  for (int n = 0; n < ${Oe.length}; n++) { float d = shapeD(PALE[n], 1, v0, v1); if (d < bestD) { bestD = d; gi = PALE[n]; } }
  return gi;
}
// a line through the cell (the white koi's outline): the line character whose strokes lie on it, matched
// on the regular face normalised per point with a contrast boost, as in horizon
int matchLine(float v[6]){
  float m = max(max(max(v[0], v[1]), max(v[2], v[3])), max(v[4], v[5]));
  vec4 v0 = vec4(v[0], v[1], v[2], v[3]) / m; vec2 v1 = vec2(v[4], v[5]) / m;
  v0 = pow(v0, vec4(1.8)); v1 = pow(v1, vec2(1.8));
  float bestD = 1e9; int gi = 0;
  for (int n = 0; n < ${Xe.length}; n++) { float d = shapeD(LINE[n], 0, v0, v1); if (d < bestD) { bestD = d; gi = LINE[n]; } }
  return gi;
}
// A line through the cell, drawn the way ASCII line art is drawn by hand: one character per column where
// the line runs shallow (per row where it runs steep), chosen by its angle and where it crosses the cell.
// f holds a field at the six sample points, in cell heights, whose zero is the line; the plane through
// them gives the line's place and slope. Returns 0 when the line is not this cell's to draw. side > 0
// says which way the field rises (the inside of a contour), for the bracket on steep stretches.
float lineAng = 0.0; // the angle of the last line drawn (0 level, 90 upright)
int lineGlyph(float f[6], out float yIn){
  float gx = ((f[1] + f[3] + f[5]) - (f[0] + f[2] + f[4])) / 3.0 / 0.44; // per cell width
  float gy = ((f[4] + f[5]) - (f[0] + f[1])) / 2.0 / 0.6;                // per cell height (down)
  float f0 = (f[0] + f[1] + f[2] + f[3] + f[4] + f[5]) / 6.0;
  // the gradient in screen pixels (x across, y down)
  vec2 g = vec2(gx / uCell.x, gy / uCell.y);
  float ang = atan(abs(g.x), abs(g.y)) * 57.29578; // 0: the line runs level, 90: it stands upright
  lineAng = ang;
  yIn = 0.5;
  // (a '/' stands at ~61 degrees in this cell, so it only joins up on lines at least ~52 degrees steep;
  // anything shallower is a staircase of '_' and '-')
  if (ang < 52.0) {
    // shallow: this column's crossing must fall inside this cell
    float dy = -f0 / gy; // in cell heights from the centre
    // each column's crossing is drawn in the cell whose lower part it falls in: '_' on the floor of the
    // cell, '-' across its middle (never a dotted run of ' or .)
    if (!(dy > -0.32 && dy <= 0.68)) return 0;
    yIn = 0.5 + dy;
    return yIn > 0.74 ? ${u("_")} : ${u("-")};
  }
  float dx = -f0 / gx; // in cell widths
  if (!(dx > -0.5 && dx <= 0.5)) return 0;
  if (ang < 76.0) return (gx > 0.0) == (gy > 0.0) ? ${u("/")} : ${u("\\")};
  // standing: a bracket bowed away from the inside
  return gx > 0.0 ? ${u("(")} : ${u(")")};
}
float mn6(float a[6]){ return min(min(min(a[0], a[1]), min(a[2], a[3])), min(a[4], a[5])); }
vec2 toWorld(vec2 gp){ vec2 q = (gp - uGridPx * 0.5) / uUnit; return vec2(q.x, -q.y); }

// streaks: a few slender brush strokes laid along the flanks, as in the ink painting. Each one
// starts and lifts with a taper and wavers a little across the body; never a patch or a hole
// ---------- the pond: a height field ----------
// The surface is the sum of every wave on it, so where two meet they interfere. Rings are dispersive
// packets (water.ts): crests run through the packet at twice its speed, born at its back and fading at
// its front, with the longer waves leading. Each tail trails a wake along the orbit: the two arms of a
// V opening behind it, still in the fish's own frame, so the wake travels with the fish.
float height(vec2 p, out vec2 outw){
  float h = 0.0, best = 0.0;
  outw = vec2(0.0, 1.0);
  for (int i = 0; i < MAXR; i++) {
    if (i >= uRingN) break;
    vec4 R = uRing[i]; vec4 P = uRingP[i];
    vec2 dv = p - R.xy;
    float d = length(dv);
    float x = (d - R.z) / P.x;
    if (abs(x) > 3.0) continue;
    // (a ring shows once it has opened out, never as a knot of marks round its centre)
    float env = R.w * exp(-x * x) * (1.0 - exp(-pow(d / (0.6 * P.x), 2.0))) * smoothstep(0.03, 0.1, R.z);
    float k = P.y * clamp(1.0 - 0.22 * x, 0.6, 1.6);
    h += env * cos(k * (d - 2.0 * R.z));
    if (env > best) { best = env; outw = dv / max(d, 1e-5); }
  }
  float surf = uSwim.z;
  for (int k = 0; k < 2; k++) {
    vec4 tp = uTip[k];
    float rt = length(tp.xy), rp = length(p);
    float back = mod(atan(tp.y, tp.x) - atan(p.y, p.x), 6.2831853) * rt;
    if (back > 1.8) continue;
    float x = rp - rt, ax = abs(x);
    // the two arms of the V, each a single soft ridge whose line is where it crosses rest level; a slow
    // swell runs along them, and they widen and fade behind the fish
    float arm = 0.3 * back, w = 0.016 + 0.05 * back;
    float y = (ax - arm) / w;
    float env = 0.9 * uSwim.w * surf * exp(-back / 0.85) * smoothstep(0.02, 0.16, back) * (0.75 + 0.25 * cos(26.0 * back - 0.8 * tp.w));
    h += env * y * exp(-y * y);
    float e = env * exp(-y * y);
    // (the ridge rises away from the arm, so its line is kept by pointing the reference back across it)
    if (e > best) { best = e; outw = -p / max(rp, 1e-5) * sign(x + 1e-6); }
  }
  return h;
}
float height(vec2 p){ vec2 o; return height(p, o); }

// a short stroke of a curve whose outward normal on screen (in cells, y down) is n: - along its top,
// _ along its bottom, ( ) up its sides and ' , . at the shoulders
int arcGlyph(vec2 n){
  float a = atan(n.y, n.x) * 57.29578;
  if (a < 0.0) a += 360.0;
  if (a < 30.0 || a >= 330.0) return ${u(")")};
  if (a < 62.0) return ${u(".")};
  if (a < 118.0) return ${u("_")};
  if (a < 150.0) return ${u(",")};
  if (a < 210.0) return ${u("(")};
  if (a < 242.0) return ${u("'")};
  if (a < 298.0) return ${u("-")};
  return ${u("'")};
}

// the koi's letter: a capital of the condensed ink cut, N or H in a checker, which fills its cell edge to
// edge so the wash is one continuous ink texture; how light the ink is (the sheen, the fins, the drying
// tips) comes only from its strength, so a grey fin reads as thinner ink, never as a word
// tone as type: the ink-cut letter whose coverage matches t (measured: N H .9, E .68, F .61, T .59,
// L .55, J .51, I .49, i l .38, ! .34, | .21, : .12, . .06), two letters per step in a checker; all
// upright, so the wash keeps one grain from the wettest ink to the driest
int rampGlyph(float t, vec2 cid){
  bool odd = mod(cid.x + cid.y, 2.0) > 0.5;
  float tt = t + (hash(cid + 61.0) - 0.5) * 0.04;
  if (tt > 0.8) return odd ? ${u("H")} : ${u("N")};
  if (tt > 0.645) return odd ? ${u("E")} : ${u("F")};
  if (tt > 0.57) return odd ? ${u("T")} : ${u("L")};
  if (tt > 0.5) return odd ? ${u("J")} : ${u("I")};
  if (tt > 0.36) return odd ? ${u("i")} : ${u("l")};
  if (tt > 0.27) return odd ? ${u("!")} : ${u("|")};
  if (tt > 0.16) return ${u("|")};
  if (tt > 0.09) return odd ? ${u(":")} : ${u(";")};
  return odd ? ${u(".")} : ${u(",")};
}
int inkGlyph(float t, vec2 cid){
  return mod(cid.x + cid.y, 2.0) > 0.5 ? ${u("H")} : ${u("N")};
}

void main(){
  ivec2 fc = ivec2(gl_FragCoord.xy);
  float row = uGrid.y - 1.0 - float(fc.y);
  vec2 cid = vec2(float(fc.x), row);
  vec2 cellTL = cid * uCell;
  float hc = hash(cid + 17.0);
  vec2 pc = toWorld(cellTL + uCell * 0.5);
  float cellW = uCell.y / uUnit;
  float aa = 0.22 * cellW;
  float surf = uSwim.z;

  // the water's slope here: it bends the light, so the fish below and the page shift a little under
  // every wave that passes (and the wave's lines are drawn from it below)
  float e1 = 0.3 * cellW;
  float h0 = height(pc);
  vec2 slope = vec2(height(pc + vec2(e1, 0.0)) - h0, height(pc + vec2(0.0, e1)) - h0) / e1;
  vec2 refr = -slope * 1.1e-4;
  K c0 = both(pc + refr, aa);
  bool near = c0.dAny < 1.6 * cellW && surf > 0.0;

  float s[6], cs[6], ps[6], es[6], sa[6], sb[6], wa = 0.0, wb = 0.0;
  float m = 0.0, mn = 1.0, tone = 0.0, crown = 0.0, cm = 0.0, pm = 0.0, pn = 1.0, em = 0.0;
  if (near) {
    for (int i = 0; i < 6; i++) {
      K ki = both(toWorld(cellTL + uCell * SP[i]) + refr, aa);
      s[i] = ki.ink; m = max(m, s[i]); mn = min(mn, s[i]); tone += s[i];
      // signed distances in cell heights (positive inside), unclamped near the edge, so a plane through the
      // six of them is the edge's own line and stays true a cell beyond it
      ps[i] = ki.who == c0.who ? clamp(ki.strk / cellW, -2.0, 2.0) : -2.0; pm = max(pm, ps[i]); pn = min(pn, ps[i]);
      es[i] = clamp(-ki.dAny / cellW, -2.0, 2.0); em = max(em, es[i]);
      // each streak's centreline (signed, in cell heights) and half-width, traced separately
      vec4 st = ki.who == c0.who && ki.body > 0.5 ? ki.strk2 / cellW : vec4(3.0, 0.0, 3.0, 0.0);
      sa[i] = clamp(st.x, -3.0, 3.0); sb[i] = clamp(st.z, -3.0, 3.0); wa += st.y / 6.0; wb += st.w / 6.0;
      cs[i] = ki.crown; crown += ki.crown; cm = max(cm, ki.crown);
    }
    tone /= 6.0; crown /= 6.0;
  }

  // the koi surface out of the water: each cell turns to ink at its own moment, the spine first, and
  // until then the water there darkens (and a letter it covers thickens)
  float inner = clamp(-c0.sd / (0.6 * W_MAX), 0.0, 1.0);
  // (from the depths: the ink deepens from the spine outward, every cell together, nothing flickers on)
  float emerge = smoothstep(0.0, 0.45, surf * 1.5 - 0.5 * (1.0 - inner));
  bool shown = surf > 0.0;
  float rise = 0.0;

  // ---------- the page layer: how the water moves the letter that lives here ----------
  // the slope of the surface bends the page beneath it; the fish part the letters as they pass: the page
  // just outside the body eases aside. Inside, the letters the koi is written in stay on their lines, so
  // read closer every line of the written body stays whole
  vec2 disp = -slope * 3.2e-4;
  disp += c0.away * 0.03 * exp(-max(c0.sd, 0.0) / 0.085) * step(0.0, c0.sd) * surf;
  disp *= mix(1.0, 0.35, step(c0.sd, 0.0) * surf);
  vec2 dc = clamp(vec2(disp.x, -disp.y) * uUnit / uCell, vec2(-${Lt}, -${St}), vec2(${Lt}, ${St}));

  // colour codes for the glyph pass: 0 ink, 1 vermilion, 2 the white koi's white, 3 the water's shade,
  // 4 the water's glint. Every cell is one character, with one weight, colour and strength.
  int gi = 0; float outT = 0.0, accent = 0.0, wgt = 0.0;
  float code = 0.0;
  bool inkCell = false, written = false, whiteText = false, pageOver = false, streakGap = false;
  bool over = false, overW = false;
  bool lodCell = hash(cid + 53.0) < smoothstep(0.5, 0.95, uLod);
  if (near && shown && em > -0.6) {
    bool bodyHere = c0.body > 0.5;
    bool white = c0.who > 0.5;
    float tn0 = c0.tone;
    // coverage at the six points, from the signed distances (a sample's disc is ~0.23 cell high)
    float cv[6], sc[6], ink[6];
    float cmn = 1.0, cmx = 0.0, smean = 0.0, emn = 9.0, emx = -9.0;
    for (int i = 0; i < 6; i++) {
      cv[i] = clamp(0.5 + es[i] / 0.23, 0.0, 1.0); sc[i] = clamp(0.5 + ps[i] / 0.23, 0.0, 1.0) * cv[i];
      cmn = min(cmn, cv[i]); cmx = max(cmx, cv[i]); smean += sc[i] / 6.0; emn = min(emn, es[i]); emx = max(emx, es[i]);
    }
    float strength = white
      ? (bodyHere ? 0.68 + 0.32 * (1.0 - smoothstep(0.2, 1.0, abs(c0.bq.y))) : 0.32 + 0.3 * c0.fade)
      : 0.42 + 0.58 * smoothstep(0.3, 0.95, tn0);
    // the contour: one clean line of characters in ink, at the strength of the ink beside it
    float yIn;
    int edgeG = lineGlyph(es, yIn);
    float e0 = (es[0] + es[1] + es[2] + es[3] + es[4] + es[5]) / 6.0;
    // a streak: one stroke of characters along its centreline, in the other koi's colour, typed over the
    // fish's own letter; '=' where the brush is full, '-' where it thins to its ends
    int strkG = 0;
    float yS;
    for (int q = 0; q < 2; q++) {
      float w = q == 0 ? wa : wb;
      if (strkG > 0 || w < 0.13) continue; // the brush stops where it thins below a hairline
      int g = q == 0 ? lineGlyph(sa, yS) : lineGlyph(sb, yS);
      if (g == ${u("-")} || g == ${u("_")}) g = w > 0.3 && lineAng < 16.0 ? ${u("=")} : ${u("-")};
      strkG = g;
    }
    if (edgeG > 0) {
      gi = edgeG; code = 0.0; wgt = 2.0;
      outT = white ? (bodyHere ? 0.9 : 0.75) : min(1.0, 0.25 + strength);
    } else if (e0 > 0.0) {
      if (strkG > 0 && e0 > 0.4) {
        // (in the heavy monospace cut, whose '=' and '-' nearly span the cell, so the stroke runs on)
        // (the black strokes on the white koi in a lighter cut and only '-', so they are as fine as the white
        // strokes read on the black koi)
        if (white && strkG == ${u("=")}) strkG = ${u("-")};
        gi = strkG; code = white ? 0.0 : 2.0; outT = white ? 0.85 : 1.0; wgt = white ? 1.0 : 2.0; over = true; overW = white; pageOver = !white;
      } else if (!white) {
        // the black koi: wet ink capitals in its body; its fins soft, in round letters of thinner ink
        gi = inkGlyph(1.0, cid);
        code = 0.0; wgt = 3.0; inkCell = true;
        outT = bodyHere ? 1.0 : 0.3 + 0.45 * strength;
      } else {
        // the white koi: white capitals, brightest along its back, thinning to round letters toward its
        // flanks and in its fins
        float wt = bodyHere ? 1.0 - smoothstep(0.35, 1.0, abs(c0.bq.y)) : 0.0;
        gi = inkGlyph(1.0, cid);
        code = 2.0; wgt = 3.0; inkCell = true;
        outT = bodyHere ? 0.6 + 0.4 * wt : 0.5;
      }
    }
    outT *= emerge;
    if (gi == 0) outT = 0.0;
    // read closer, the tancho's cells are written in vermilion (below)
    // (read closer the tancho is a round patch on the page: three letters, five, three)
    bool crownCell = false;
    for (int k = 0; k < 2; k++) {
      vec2 cg = toGridPx(uCrown[k].xy) / uCell, dq = cid + 0.5 - cg;
      crownCell = crownCell || length(dq / vec2(2.9, 1.45)) < 1.0;
    }
    if (crownCell && lodCell && c0.body > 0.5) { gi = ${u("o")}; accent = 1.0; code = 1.0; outT = 1.0; wgt = 3.0; inkCell = false; }

    // read closer, the koi is written: as the letters grow large enough to read, its cells (cell by cell,
    // so nothing snaps) take the poem's own letter from the page here, in the koi's colour
    bool onPage = cid.x >= uBox.x && cid.x < uBox.z && cid.y >= uBox.y && cid.y < uBox.w;
    if (onPage && lodCell && gi > 0 && (inkCell || accent > 0.5 || (cmn > 0.5 && !white))) {
      written = true;
      wgt = 2.0;
      // (the white koi's text, read closer, is set in ink a little stronger than the page around it)
      if (white && accent < 0.5) { wgt = 0.0; code = 0.0; }
      // the black koi's white streaks, read closer, are the page's own pale text
      if (pageOver && accent < 0.5) { written = false; pageOver = false; gi = 0; streakGap = true; }
      over = false;
      outT = accent > 0.5 ? 1.0 : white ? 0.62 : 0.66 + 0.34 * smoothstep(0.4, 0.95, tn0);
    }
  }

  // the tancho, in characters: its cells are the koi's own letters set in vermilion, and read closer
  // the poem's letters in vermilion (above). The eyes are drawn in small characters by the glyph pass;
  // read closer, the text keeps clear of them
  bool pupil = false;
  if (surf > 0.5 && crown > 0.3 && gi > 0 && !written) { gi = ${u("o")}; wgt = 2.0; code = 1.0; accent = 1.0; outT = 1.0; over = false; pageOver = false; }
  if (surf > 0.5) for (int k = 0; k < 2; k++) for (int e = 0; e < 2; e++) {
    vec2 ew = e == 0 ? uEye[k].xy : uEye[k].zw;
    vec2 q = (pc - ew) * uUnit / uCell; // in cells
    if (length(q * vec2(1.0, 1.8)) < ${te(J)} * uUnit / uCell.x * 1.25 + 0.5 && lodCell) { gi = 0; written = false; pupil = true; }
  }



  // how much of the water (and the page under it) shows here: none through the body or the fins (the
  // white streaks are clean paper), less as the cell's ink rises, and all of it in open water
  float vis = 1.0;
  if (shown) vis = (1.0 - smoothstep(0.04, 0.3, tone)) * (1.0 - smoothstep(0.25, 0.6, max(c0.body, c0.under * 2.0)));
  if (pupil) vis = 0.0;
  if (streakGap) vis = 1.0;

  // ---------- the water, as glyphs ----------
  // Lines where the surface crosses its rest level, one stroke per cell along the wave: lit where the
  // surface there tilts toward the light (top left), in shade where it tilts away, so every ring and
  // every wake reads as a moving ridge. Between the waves, calm water. The fish cast soft shadows on
  // the pond floor, down and to the right of them.
  float kind = 0.0;
  K sh = both(pc - SHADOW_OFF, aa);
  float shadow = shadowAt(sh) * surf;
  float base = 0.12 * shadow + 0.55 * rise;
  float wl = 0.0;
  if (gi == 0 && vis > 0.02) {
    float hs[6]; float hmn = 1e9, hmx = -1e9;
    vec2 outw;
    height(pc, outw);
    for (int i = 0; i < 6; i++) { hs[i] = height(toWorld(cellTL + uCell * SP[i])); hmn = min(hmn, hs[i]); hmx = max(hmx, hs[i]); }
    float gxC = ((hs[1] + hs[3] + hs[5]) - (hs[0] + hs[2] + hs[4])) / 3.0 / 0.44;
    float gyC = ((hs[4] + hs[5]) - (hs[0] + hs[1])) / 2.0 / 0.6;
    vec2 gw = vec2(gxC / uCell.x, -gyC / uCell.y) * uUnit; // the slope in world units
    float glen = length(gw);
    wl = smoothstep(2.5, 18.0, glen);
    int wg = 0; float wt = 0.0;
    // one line per crest: where the surface falls away on the crest's outer side
    if (hmn < 0.0 && hmx > 0.0 && wl > 0.0 && dot(gw, outw) < 0.0) {
      // the stroke follows the wave's line; it bulges away from the wave's source
      vec2 nC = vec2(gxC / (uCell.x * uCell.x), gyC / (uCell.y * uCell.y));
      vec2 oC = vec2(outw.x / uCell.x, -outw.y / uCell.y);
      if (dot(nC, oC) < 0.0) nC = -nC;
      wg = arcGlyph(nC);
      const vec2 L = vec2(-0.55, 0.835);
      float lit = dot(-gw / glen, L);
      code = lit > 0.0 ? 4.0 : 3.0;
      wt = min(1.0, wl * (0.7 + 0.5 * abs(lit)));
      wgt = lit > 0.0 ? 2.0 : 1.0;
    }
    // the shadow on the pond floor: the koi's own letters in the water's shade, very light
    if (wg > 0) { gi = wg; outT = max(wt, min(0.9, 0.9 * rise)) * vis; if (rise > 0.1) wgt = rise > 0.3 ? 2.0 : 1.0; kind = 1.0; }
  }

  // the letter set here (seen when you zoom in): darker where the water is deep or shadowed, on a
  // ripple crest, and ink-dark while a koi rises through it
  float lt = uPageTone * (0.9 + 1.4 * base) + 0.22 * wl + 0.65 * rise;
  float lw = rise > 0.3 ? 2.0 : rise > 0.1 || wl > 0.6 ? 1.0 : 0.0;

  if (written) kind = 2.0;
  // overstruck: typed over the black koi's own ink letter
  if (over) kind = overW ? 5.0 : 3.0;
  // the page's own letter at this cell, in the koi's colour (5: typed over the black koi's ink)
  if (whiteText && !written) kind = 4.0;

  o0 = vec4(float(gi) / 255.0, clamp(outT, 0.0, 1.0), code / 4.0, (wgt + 4.0 * kind) / 255.0);
  o2 = vec4(clamp(0.5 + slope * 0.012, 0.0, 1.0), shadow, 1.0);
  o1 = vec4(0.5 + dc.x / ${te(Wt)}, 0.5 + dc.y / ${te(Xt)}, clamp(lt, 0.0, 1.0), (floor(vis * 63.0 + 0.5) + 64.0 * lw) / 255.0);
}`,_=e=>e.toFixed(5),zo=`#version 300 es
precision highp float;
precision highp int;
out vec4 o;
uniform sampler2D uData, uPage, uPageD, uAtlas, uHi, uWater;
uniform vec2 uGridPx;
uniform float uUnit, uPaint; // uPaint: 1 = the painted pond (normal view), 0 = all characters (read closer)
uniform vec3 uBg, uInk, uAccent;
uniform vec3 uPal[5]; // 0 ink, 1 vermilion, 2 the white koi's white, 3 the water's shade, 4 its glint
uniform vec2 uOff, uCellD, uGrid, uCanvas, uAtlasSize;
uniform vec3 uView;   // zoom, pan x, pan y (device px): screen = pan + grid * zoom
uniform vec4 uHiInfo; // hi cell w, h, pad
uniform vec2 uHiSize;
uniform float uLod;   // 0 = the pond (default size), 1 = the page (glyphs large enough to read)
${Gt}

// coverage of glyph gi (weight w) at q, pixels inside its cell
float glyphA(int gi, int w, vec2 q){
  if (abs(uView.x - 1.0) < 1e-3) {
    // bilinear at the cell size: crisp on whole pixels, smooth when a letter sits between them
    vec2 qq = clamp(q, vec2(0.5), uCellD - 0.5);
    return textureLod(uAtlas, (vec2(float(gi), float(w)) * uCellD + qq) / uAtlasSize, 0.0).a;
  }
  vec2 hc = uHiInfo.xy, pad = uHiInfo.zz;
  vec2 org = vec2(float(gi), float(w)) * (hc + 2.0 * pad) + pad;
  vec2 uv = (org + clamp(q / uCellD, 0.0, 1.0) * hc) / uHiSize;
  vec2 g = hc / uCellD / uView.x / uHiSize;
  return textureGrad(uHi, uv, vec2(g.x, 0.0), vec2(0.0, g.y)).a;
}

// a koi glyph's coverage: texel by texel at the cell size, from the large atlas when zoomed
float koiA(int g, int w, vec2 lp){
  return abs(uView.x - 1.0) < 1e-3
    ? texelFetch(uAtlas, ivec2(g * int(uCellD.x) + int(lp.x), w * int(uCellD.y) + int(lp.y)), 0).a
    : glyphA(g, w, lp);
}

// an edge as a plane through the cell (the scene pass fits it to the signed distance, in cell heights,
// at six points): the signed distance from the edge in screen pixels at lp, positive inside
float planeDist(vec4 eg, vec2 lp){
  float sd = (eg.r - 0.5) * 4.0 + dot(vec2(eg.g - 0.5, eg.b - 0.5) * 8.0, lp / uCellD - 0.5);
  return sd * uCellD.y * uView.x;
}
// a glyph drawn at a fraction of the cell size (s cells per cell), q in this small cell's own pixels
float smallA(int g, int w, vec2 q, float s){
  vec2 hc = uHiInfo.xy, pad = uHiInfo.zz;
  vec2 c = uCellD / s;
  vec2 org = vec2(float(g), float(w)) * (hc + 2.0 * pad) + pad;
  vec2 uv = (org + clamp(q / c, 0.0, 1.0) * hc) / uHiSize;
  vec2 gr = hc / c / uView.x / uHiSize;
  return textureGrad(uHi, uv, vec2(gr.x, 0.0), vec2(0.0, gr.y)).a;
}
vec2 toWorldPx(vec2 px){ return vec2(px.x - uGridPx.x * 0.5, uGridPx.y * 0.5 - px.y) / uUnit; }

// the painted koi eye: a dark pupil in a ring of iris (bronze on the black koi, cool grey on the white),
// a soft shadow where it sits in the head, and a small catchlight from the light above left
vec3 paintEye(vec3 col, vec2 p, vec2 ew, int k, float aa){
  float r = length(p - ew) / ${_(J)}, a = aa / ${_(J)};
  if (r > 1.6) return col;
  vec3 iris = k == 0 ? vec3(0.62, 0.53, 0.36) : vec3(0.50, 0.56, 0.58);
  col = mix(col, uPal[0], 0.35 * smoothstep(1.55, 1.0, r) * float(k));       // the socket's shade (white koi)
  col = mix(col, uPal[0], smoothstep(1.0 + a, 1.0 - a, r));                     // the rim
  // the iris, darker toward its rim, round a large round pupil
  col = mix(col, mix(iris, iris * 0.55, smoothstep(0.5, 0.92, r)), smoothstep(0.92 + a, 0.92 - a, r));
  col = mix(col, vec3(0.04, 0.035, 0.03), smoothstep(0.5 + a, 0.5 - a, r));     // the pupil
  float h = length(p - ew - vec2(-0.3, 0.32) * ${_(J)}) / ${_(J)};
  col = mix(col, vec3(1.0), 0.9 * smoothstep(0.22 + a, 0.22 - a, h));          // the catchlight
  return col;
}

void main(){
  vec2 sp = vec2(gl_FragCoord.x, uCanvas.y - gl_FragCoord.y);
  vec2 px = (sp - uView.yz) / uView.x - uOff;
  vec2 cf = floor(px / uCellD);
  if (cf.x < 0.0 || cf.y < 0.0 || cf.x >= uGrid.x || cf.y >= uGrid.y) { o = vec4(uBg, 1.0); return; }
  ivec2 ic = ivec2(cf);
  int R = int(uGrid.y) - 1;

  // the page: letters from this cell and its neighbours, each at its own offset. A letter whose cell
  // a koi has written (read closer, its cells take the poem's letters) is set in that koi's colour,
  // weight and strength (the white koi's white letters carry a soft shade below them, so they read on
  // the pond); the rest are the pale page, seen only where the water shows
  float pa = 0.0, ia = 0.0, sa = 0.0;
  vec3 ic3 = uPal[0];
  int va = int(floor(texelFetch(uPageD, ivec2(ic.x, R - ic.y), 0).a * 255.0 + 0.5));
  float vis = float(va & 63) / 63.0;
  if (uLod > 0.0) {
    for (int oy = -1; oy <= 1; oy++) for (int ox = -2; ox <= 2; ox++) {
      ivec2 j = ic + ivec2(ox, oy);
      if (j.x < 0 || j.y < 0 || j.x >= int(uGrid.x) || j.y > R) continue;
      vec4 pl = texelFetch(uPage, j, 0);
      if (pl.g < 0.5) continue;
      vec4 pd = texelFetch(uPageD, ivec2(j.x, R - j.y), 0);
      vec2 d = vec2((pd.r - 0.5) * ${_(Wt)}, (pd.g - 0.5) * ${_(Xt)});
      vec2 q = px - (vec2(j) + d) * uCellD;
      vec4 kd = texelFetch(uData, ivec2(j.x, R - j.y), 0);
      int kwk = int(floor(kd.a * 255.0 + 0.5));
      int kc = int(floor(kd.b * 4.0 + 0.5));
      int g = int(pl.r * 255.0 + 0.5);
      bool inCell = q.x >= 0.0 && q.y >= 0.0 && q.x < uCellD.x && q.y < uCellD.y;
      if ((kwk >> 2) == 2) {
        if (kc == 2) {
          vec2 qs = q - vec2(0.45, 0.6);
          if (qs.x >= 0.0 && qs.y >= 0.0 && qs.x < uCellD.x && qs.y < uCellD.y) sa = max(sa, glyphA(g, kwk & 3, qs) * kd.g);
        }
        if (!inCell) continue;
        float a = glyphA(g, kwk & 3, q) * kd.g;
        if (a > ia) { ia = a; ic3 = uPal[kc]; }
      } else if (vis > 0.0 && inCell) {
        int w = int(floor(pd.a * 255.0 + 0.5)) >> 6;
        pa = max(pa, glyphA(g, w, q) * pd.b);
      }
    }
  }
  vec3 col = mix(uBg, uPal[0], pa * vis * uLod);
  col = mix(col, uPal[3], sa * 0.6);
  col = mix(col, ic3, ia);

  // the koi and the water's marks: one character per cell, each with its own weight, colour and strength
  vec4 d = texelFetch(uData, ivec2(ic.x, R - ic.y), 0);
  int gi = int(floor(d.r * 255.0 + 0.5));
  int wk = int(floor(d.a * 255.0 + 0.5));
  int code = int(floor(d.b * 4.0 + 0.5));
  vec2 lp = px - cf * uCellD;
  // a written cell in a longer gap of the text (a line's end, not a word space) keeps the koi's letter,
  // set faint, so the body holds its shape there; the tancho shows only the poem's own letters
  bool written = (wk >> 2) == 2;
  if (written && texelFetch(uPage, ic, 0).g < 0.5) {
    int W = int(uGrid.x) - 1;
    bool gap = texelFetch(uPage, ivec2(max(ic.x - 1, 0), ic.y), 0).g < 0.5 && texelFetch(uPage, ivec2(min(ic.x + 1, W), ic.y), 0).g < 0.5;
    // (inside the tancho a gap between words is a small red o, so the red patch stays whole and round)
    if (code == 1) written = false;
    else if (gap) { written = false; d.g *= 0.3; } else gi = 0;
  }
  if (gi > 0 && !written) {
    int w = wk & 3;
    float k = d.g;
    // the water's own glyphs give way to the page as you zoom in
    if ((wk >> 2) == 1) k *= 1.0 - uLod;
    // the black koi's eye and tancho are typed over its own ink letter
    if ((wk >> 2) == 3) {
      int under = ((ic.x + ic.y) & 1) == 1 ? ${u("H")} : ${u("N")};
      col = mix(col, uPal[0], koiA(under, 3, lp));
    }
    if ((wk >> 2) == 5) {
      // typed over the white koi's own letter: its eye and tancho
      int under = ((ic.x + ic.y) & 1) == 1 ? ${u("H")} : ${u("N")};
      col = mix(col, uPal[2], koiA(under, 3, lp));
      col = mix(col, uPal[code], koiA(gi, w, lp) * k);
    } else if ((wk >> 2) == 4) {
      // the white koi is made of the page itself: the letter that lives in this cell (spaces stay spaces)
      vec4 pl = texelFetch(uPage, ic, 0);
      if (pl.g > 0.5) col = mix(col, uPal[code], glyphA(int(pl.r * 255.0 + 0.5), w, lp) * k);
    } else col = mix(col, uPal[code], koiA(gi, w, lp) * k);
  }

  // the eyes in characters: each a round of small type, two to a cell: '@' for the pupil, 'o' for
  // the iris round it, '*' for the catchlight, on a round of paper cut into the koi's letters
  vec2 wp = toWorldPx(px);
  if (uPaint < 1.0 && uSwim.z > 0.5) for (int k = 0; k < 2; k++) for (int e = 0; e < 2; e++) {
    vec2 ew = e == 0 ? uEye[k].xy : uEye[k].zw;
    float r = length(wp - ew) / ${_(J)};
    if (r > 1.9) continue;
    float aa = 1.0 / (uUnit * uView.x * ${_(J)});
    col = mix(col, uBg, smoothstep(1.55 + aa, 1.55 - aa, r));
    // the type is laid out from the eye's own centre, so every eye is the same round composition and
    // it travels with the fish: ' ooo ' over '(o@o)' over ' ooo ', in half-size cells
    float S = 2.0;
    vec2 mc = uCellD / S;
    vec2 ep = vec2(ew.x, -ew.y) * uUnit + uGridPx * 0.5;            // the eye in grid px
    vec2 mi = floor((px - ep) / mc + 0.5), mq = px - ep - (mi - 0.5) * mc;
    int g = 0;
    if (mi.y == 0.0 && abs(mi.x) <= 2.0) g = mi.x == 0.0 ? ${u("@")} : abs(mi.x) == 1.0 ? ${u("o")} : (mi.x < 0.0 ? ${u("(")} : ${u(")")});
    else if (abs(mi.y) == 1.0 && abs(mi.x) <= 1.0) g = ${u("o")};
    vec3 c = g == ${u("o")} ? (k == 0 ? vec3(0.55, 0.45, 0.28) : vec3(0.38, 0.45, 0.48)) : uPal[0];
    if (g > 0) col = mix(col, c, smallA(g, 2, mq, S));
  }

  // ---------- the painted pond (normal view) ----------
  if (uPaint > 0.0) {
    vec4 wt = texture(uWater, vec2(px.x / uCellD.x, uGrid.y - px.y / uCellD.y) / uGrid);
    vec2 slope = (wt.rg - 0.5) / 0.012;
    float shadow = wt.b;
    float aaw = 0.75 / (uUnit * uView.x);
    // the water: pale paper, each wave lit on the side that faces the light (above left), in cool shade on
    // the other, so the rings and wakes read as soft moving ridges
    const vec2 L = vec2(-0.55, 0.835);
    float lit = dot(-slope, L) * 0.0042;
    vec3 pc = uBg;
    pc = lit > 0.0 ? mix(pc, uPal[4], min(lit, 0.6)) : mix(pc, uPal[3], min(-lit * 0.7, 0.3));
    // the koi's shadows on the floor
    pc = mix(pc, uPal[3], 0.2 * shadow);
    // the koi, seen through the moving surface
    vec2 kw = wp - slope * 1.1e-4;
    K kp = both(kw, aaw);
    float inside = smoothstep(aaw, -aaw, kp.dAny);
    if (inside > 0.0) {
      float inner = clamp(-kp.sd / (0.6 * ${_(X)}), 0.0, 1.0);
      float emerge = smoothstep(0.0, 0.45, uSwim.z * 1.5 - 0.5 * (1.0 - inner));
      bool white = kp.who > 0.5;
      float body = kp.body;
      // a faint grain of the letters the koi is made of, the only hint at this distance
      int lg = ((ic.x + ic.y) & 1) == 1 ? ${u("H")} : ${u("N")};
      float grain = 0.94 + 0.06 * koiA(lg, 3, lp);
      float st = smoothstep(-aaw, aaw, kp.strk) * step(0.5, body);
      vec3 kc; float ka;
      if (!white) {
        // sumi ink: wet and dark on the flanks and head, a little lighter along the back, thinning in the fins
        kc = uPal[0];
        ka = mix(0.3 + 0.48 * kp.fade, 0.8 + 0.2 * smoothstep(0.3, 0.95, kp.tone), body) * grain;
        kc = mix(kc, uPal[2], st); ka = mix(ka, 1.0, st);
      } else {
        // the white koi: white, greying toward its flanks (it is round) and translucent in the fins
        float side = smoothstep(0.25, 1.0, abs(kp.bq.y));
        kc = mix(uPal[2], mix(uPal[2], uPal[3], 0.22), side * body);
        ka = mix(0.55 + 0.25 * kp.fade, 1.0, body) * grain;
        kc = mix(kc, uPal[0], st); ka = mix(ka, 0.92, st);
      }
      pc = mix(pc, kc, inside * ka * emerge);
      // the white koi's edge: a fine soft line of ink, the brush's outline
      if (white) {
        float dpx = -kp.dAny * uUnit * uView.x;
        float line = 1.0 - smoothstep(0.35, 1.0, abs(dpx - 0.7 * uView.x));
        pc = mix(pc, uPal[0], 0.6 * line * emerge * mix(0.6, 1.0, body));
      }
    } else if (kp.dAny < 3.0 * aaw && kp.who > 0.5) {
      float dpx = -kp.dAny * uUnit * uView.x;
      pc = mix(pc, uPal[0], 0.6 * (1.0 - smoothstep(0.35, 1.0, abs(dpx - 0.7 * uView.x))) * smoothstep(0.5, 0.9, uSwim.z));
    }
    // the tancho: a soft round spot of vermilion on the top of the head, a little deeper at its heart
    float show = smoothstep(0.5, 0.95, uSwim.z);
    for (int k = 0; k < 2; k++) {
      vec4 cr = uCrown[k];
      vec2 cq = kw - cr.xy;
      cq = vec2(dot(cq, vec2(cos(cr.w), sin(cr.w))), dot(cq, vec2(-sin(cr.w), cos(cr.w))));
      float ca = atan(cq.y, cq.x);
      float rr = cr.z * (1.0 + 0.025 * sin(3.0 * ca + 1.0));
      float d = length(cq / vec2(1.08, 0.96));
      // a clean round spot whose edge softens into the skin, deepest at its heart, with a faint sheen where
      // the light falls on the round of the head
      float spot = smoothstep(rr * 1.04, rr * 0.8, d);
      vec3 red = mix(uPal[1], uPal[1] * vec3(0.82, 0.74, 0.74), smoothstep(rr * 0.85, 0.0, d));
      vec2 sh = kw - cr.xy - vec2(-0.3, 0.35) * cr.z;
      red = mix(red, vec3(1.0, 0.72, 0.62), 0.14 * smoothstep(0.55, 0.0, length(sh) / cr.z));
      pc = mix(pc, red, spot * 0.97 * show);
    }
    // the eyes
    if (uSwim.z > 0.5) for (int k = 0; k < 2; k++) for (int e = 0; e < 2; e++) {
      vec2 ew = e == 0 ? uEye[k].xy : uEye[k].zw;
      vec3 ec = paintEye(pc, kw, ew, k, aaw);
      pc = mix(pc, ec, show);
    }
    col = mix(col, pc, uPaint);
  }
  o = vec4(col, 1.0);
}`,No=`#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec4 aInfo; // glyph, alpha (>1.5 = letter that knocks out the cell), scale, weight
uniform vec2 uCanvas;
uniform float uSize;
out vec4 vInfo;
void main(){
  vInfo = aInfo;
  gl_Position = vec4(aPos.x / uCanvas.x * 2.0 - 1.0, 1.0 - aPos.y / uCanvas.y * 2.0, 0.0, 1.0);
  gl_PointSize = ceil(uSize * aInfo.z);
}`,$o=`#version 300 es
precision highp float;
precision highp int;
in vec4 vInfo;
out vec4 o;
uniform sampler2D uHi;
uniform vec4 uHiInfo;
uniform vec2 uHiSize, uCellD;
uniform float uSize;
uniform vec3 uInk, uBg;
uniform float uLod, uPaint;
float glyphAt(float g, vec2 lp){
  vec2 hc = uHiInfo.xy, pad = uHiInfo.zz;
  vec2 org = vec2(g, vInfo.w) * (hc + 2.0 * pad) + pad;
  return texture(uHi, (org + lp * hc) / uHiSize).a;
}
void main(){
  float sc = vInfo.z, ps = ceil(uSize * sc);
  vec2 cd = uCellD * sc;
  vec2 lp = (gl_PointCoord * ps - (vec2(ps) - cd) * 0.5) / cd; // 0..1 inside the letter's cell
  if (lp.x < 0.0 || lp.y < 0.0 || lp.x >= 1.0 || lp.y >= 1.0) discard;
  float a = glyphAt(vInfo.x, lp);
  // in the painting a lifted letter is a small bead of water; read closer, the letter again
  float bead = smoothstep(0.32, 0.18, length(lp - 0.5));
  a = mix(a, bead * 0.18, uPaint);
  // in the pond a lifted letter is a drop of water; zoomed in it is the letter again
  if (vInfo.y > 1.5) {
    float drop = glyphAt(7.0, lp);
    float k = mix(drop * 0.5, a, uLod) * (vInfo.y - 2.0);
    if (k < 0.004) discard;
    o = vec4(uInk, k);
    return;
  }
  a *= vInfo.y * mix(0.5, 1.0, uLod);
  if (a < 0.004) discard;
  o = vec4(uInk, a);
}`;let nt,st,rt,Ot,lt,ht;const $e=e=>[1,3,5].map(a=>parseInt(e.slice(a,a+2),16)/255),Vt=$e(Y.bg),Yt=$e(Y.ink),qo=$e(Y.accent),Uo=new Float32Array([Y.ink,Y.accent,Y.white,Y.shade,Y.glint].flatMap($e)),Ve=new Float32Array(he*8),Ye=new Float32Array(le*8),je=new Float32Array(Ne*j*8),Ke=new Float32Array(8),Bo=13,wt=e=>{const a=Math.min(1,Math.max(0,(o.cellPx*e-Bo)/12));return a*a*(3-2*a)};function Go(){nt=Ue(Ho),st=Ue(zo),rt=Ue($o,No),Ot=t.createVertexArray(),lt=t.createVertexArray(),ht=t.createBuffer(),t.bindVertexArray(lt),t.bindBuffer(t.ARRAY_BUFFER,ht),t.bufferData(t.ARRAY_BUFFER,Bt*(pe+1)*24,t.DYNAMIC_DRAW),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,24,0),t.enableVertexAttribArray(1),t.vertexAttribPointer(1,4,t.FLOAT,!1,24,8),t.bindVertexArray(null)}function jt(e,a,n){Ve.set(a[0].body,0),Ve.set(a[1].body,he*4),Ye.set(a[0].tail,0),Ye.set(a[1].tail,le*4),je.set(a[0].fins,0),je.set(a[1].fins,Ne*j*4),t.uniform4fv(e.uBody,Ve),t.uniform4fv(e.uTail,Ye),t.uniform4fv(e.uFin,je);const i=s=>(Ke.fill(0),a.forEach((r,h)=>Ke.set(s(r),h*4)),Ke);t.uniform4fv(e.uEye,i(s=>s.eyes)),t.uniform4fv(e.uCrown,i(s=>s.crown)),t.uniform4fv(e.uGill,i(s=>s.gill)),t.uniform4fv(e.uTip,i(s=>[...s.tip,s.psi])),t.uniform4fv(e.uBound,i(s=>[...s.bound,0])),t.uniform4f(e.uSwim,n.loop,n.amp,n.surf,n.wake)}function Wo(e,a,n,i){t.bindVertexArray(Ot),t.disable(t.BLEND),t.bindFramebuffer(t.FRAMEBUFFER,o.fbo),t.viewport(0,0,o.cols,o.rows),t.useProgram(nt.p);const s=nt.u;t.uniform2f(s.uGrid,o.cols,o.rows),t.uniform2f(s.uCell,o.cw,o.ch),t.uniform2f(s.uGridPx,o.gw,o.gh),t.uniform1f(s.uUnit,o.unit),jt(s,e,a),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,o.shape),t.uniform1i(s.uShape,1),t.uniform4f(s.uBox,o.box[0],o.box[1],o.box[2],o.box[3]),t.uniform4fv(s.uRing,n.rings),t.uniform4fv(s.uRingP,n.ringP),t.uniform1i(s.uRingN,n.ringN),t.uniform1f(s.uPageTone,bo),t.uniform1f(s.uLod,wt(i.zoom)),t.drawArrays(t.TRIANGLES,0,3)}const Kt=e=>{const a=Math.min(1,Math.max(0,(e-1.12)/.8));return 1-a*a*(3-2*a)};function Xo(e,a,n){t.bindFramebuffer(t.FRAMEBUFFER,null),t.viewport(0,0,o.W,o.H),t.useProgram(st.p);const i=st.u;t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,o.tData),t.uniform1i(i.uData,0),t.activeTexture(t.TEXTURE4),t.bindTexture(t.TEXTURE_2D,o.tPage),t.uniform1i(i.uPage,4),t.activeTexture(t.TEXTURE5),t.bindTexture(t.TEXTURE_2D,o.tPageD),t.uniform1i(i.uPageD,5),t.uniform3fv(i.uPal,Uo),t.activeTexture(t.TEXTURE2),t.bindTexture(t.TEXTURE_2D,o.atlas),t.uniform1i(i.uAtlas,2),t.activeTexture(t.TEXTURE3),t.bindTexture(t.TEXTURE_2D,o.hi),t.uniform1i(i.uHi,3),t.uniform3fv(i.uBg,Vt),t.uniform3fv(i.uInk,Yt),t.uniform3fv(i.uAccent,qo),t.uniform2f(i.uOff,o.offX,o.offY),t.uniform2f(i.uCellD,o.cw,o.ch),t.uniform2f(i.uGrid,o.cols,o.rows),t.uniform2f(i.uCanvas,o.W,o.H),t.uniform2f(i.uAtlasSize,o.atlasW,o.atlasH),t.uniform1f(i.uLod,wt(n.zoom)),t.uniform3f(i.uView,n.zoom,n.panX,n.panY),t.uniform4f(i.uHiInfo,o.hiCw,o.hiCh,o.hiPad,0),t.uniform2f(i.uHiSize,o.hiW,o.hiH),jt(i,e,a),t.uniform2f(i.uGridPx,o.gw,o.gh),t.uniform1f(i.uUnit,o.unit),t.uniform1f(i.uPaint,Kt(n.zoom)),t.activeTexture(t.TEXTURE6),t.bindTexture(t.TEXTURE_2D,o.tWater),t.uniform1i(i.uWater,6),t.drawArrays(t.TRIANGLES,0,3)}function Oo(e,a){const n=e.partN;if(!n)return;const i=e.parts;for(let r=0;r<n;r++)i[r*6]=a.panX+(o.offX+i[r*6])*a.zoom,i[r*6+1]=a.panY+(o.offY+i[r*6+1])*a.zoom;t.bindVertexArray(lt),t.bindBuffer(t.ARRAY_BUFFER,ht),t.bufferSubData(t.ARRAY_BUFFER,0,i,0,n*6),t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA),t.useProgram(rt.p);const s=rt.u;t.activeTexture(t.TEXTURE3),t.bindTexture(t.TEXTURE_2D,o.hi),t.uniform1i(s.uHi,3),t.uniform4f(s.uHiInfo,o.hiCw,o.hiCh,o.hiPad,0),t.uniform2f(s.uHiSize,o.hiW,o.hiH),t.uniform2f(s.uCellD,o.cw*a.zoom,o.ch*a.zoom),t.uniform2f(s.uCanvas,o.W,o.H),t.uniform1f(s.uSize,Math.max(o.cw,o.ch)*a.zoom),t.uniform3fv(s.uInk,Yt),t.uniform3fv(s.uBg,Vt),t.uniform1f(s.uLod,wt(a.zoom)),t.uniform1f(s.uPaint,Kt(a.zoom)),t.drawArrays(t.POINTS,0,n),t.disable(t.BLEND),t.bindVertexArray(null)}function Vo(e,a,n,i){const s=o.page,r=o.base;s.set(r);for(const h of n.lifted)s[h*4+1]=0;t.bindTexture(t.TEXTURE_2D,o.tPage),t.texSubImage2D(t.TEXTURE_2D,0,0,0,o.cols,o.rows,t.RGBA,t.UNSIGNED_BYTE,s),Wo(e,a,n,i),Xo(e,a,i),Oo(n,i)}const Yo=`THE POND IS A PAGE

You found the page. From a distance it is a pond, two black koi turning in still water, a lily pad in the corner and a few stones on the floor. Lean in far enough and the water turns out to be letters, set in lines like a book, and the fish are swimming through the sentences you are reading now.

Every letter here is a pebble on the bottom of the pond. When a koi passes over a line, the line bends the way a reed bends when you look at it through moving water, and then it straightens again behind the tail. Nothing is erased. The words part to let the fish through and close up after them, the way water does.

I. The two fish

The black one is chasing the white one, and the white one is chasing the black one. They have been doing this since the page was opened, half a turn apart on one circle, and neither has ever caught up. It is an old picture: two fish nose to tail, a dark one and a light one, each carrying a spot of the other. Here the light one is mostly ink too. You tell them apart by the white streaks along their flanks, and after twelve seconds you cannot tell them apart at all, because each has swum to exactly where the other one was.

Watch one of them for a while. The head hardly moves. A koi swims from behind the shoulders, with a long slow wave that starts small near the gills and grows on its way to the tail, so the front of the fish seems to float while the back of it does the work. Then it stops working and glides. One stroke, a long coast, another stroke. The tail arrives late, like the end of a sentence you had already understood.

The fins are silk. When the fish pushes, they fold back against the body; when it glides, they open and trail and lift at the tips a moment after the root has turned. The tail is two long sheets of it, rippling out to the edges and spilling a little ink into the water when it turns.

II. The red mark

Each fish carries one red mark on its head. Breeders call a koi with a single red circle on a white face tancho, after the crane with the red crown, and prize it above the rest. On this page it is the only colour, a handful of letters that are allowed to be warm. Everything else is ink on paper, the way the old painters kept it.

III. The water

The surface is never quite still. Light comes down through it and lays a slow net of brightness on the floor that slides and folds and comes back to where it began. The fish throw shadows down onto the stones. Where the pond is deepest the letters sit a little darker, and toward the edges they thin out into the shallows.

Each time a tail turns, it pushes a ring out across the water. The ring runs through the text and lifts a few letters as it passes. They hang in the air for a moment like drops thrown off the fin, then fall back onto the page in the places they came from, a little out of order and then in order again.

IV. What you can do

Drag across the water to turn it, and the two fish swim harder to keep their places on the circle. Let go and they settle back into their slow chase. Click anywhere to drop a stone. The ring it makes runs out through the lines and you can watch the words ride up over it and settle. Scroll to lean closer. Far away the page is a pond; close up every ripple is a run of commas and dashes, every scale is a letter, every fin is a row of strokes, and the eye is a small o looking back at you. Press H and the instructions go away, so the pond is only a pond again.

V. On reading water

If you keep fish you learn to watch a pond for a long time before you change anything in it. The fish teach you where the water is cold and where the light falls in the afternoon. They come up to the surface for some people and not for others. A good pond looks as though nobody built it.

A page is a very patient pond. It holds whatever you put in it and gives it back unchanged, which is more than water usually does. You can leave in the middle of a line and come back a year later, and the line will be waiting, and the fish will still be going round, half a turn apart, the black one chasing the white one.

VI. A short list of things that are letters here

The wake behind each tail. The shadow under each fish. The stones on the floor. The rim of the lily pad and the notch cut into it. The net of light. The drops that lift off the water when a ring goes by. The white streaks, which are where the paper shows through. The eye. The red crown. This sentence, and the one you will read next, which the black fish is about to swim across.

VII. Twelve seconds

The whole pond repeats every twelve seconds, and you will never see the seam. In twelve seconds each fish travels half the circle. The light on the floor completes its slow figure and returns to the start. The tails beat three and a half times, so that at the end of the turn the black fish's stroke has become the white fish's stroke, and the white fish's stroke has become the black one's. The breath of the circle, wider on one side and tighter on the other, takes two turns to come back, and by then the fish have traded places twice.

So keep reading. They will come round again.`;function jo(){const e=o.cols,a=o.rows,n=Yo.split(/\n\s*\n/).map(l=>l.replace(/\s*\n\s*/g," ").trim()).filter(Boolean),i=Math.max(2,Math.round(e*.045)),s=Math.max(2,Math.ceil(54*o.dpr/o.ch)),r=Math.max(2,Math.ceil(48*o.dpr/o.ch)),h=Math.max(8,e-i*2),[c,...f]=n,w=f.map(l=>/^[IVX]+\. /.test(l)?l+".":l).join("  "),v=[c,""];let x="",A=0;for(;v.length<a&&A++<80;){for(let l of w.split(new RegExp("(?<=\\S) (?=\\S)"))){for(;l.length>h;)x&&(v.push(x),x=""),v.push(l.slice(0,h)),l=l.slice(h);const d=x?" "+l:l.trimStart();x.length+d.length<=h?x+=d:(v.push(x),x=l.trimStart())}x+="  "}x.trim()&&v.push(x),o.box=[i,s,e-i,a-r];const M=new Uint8Array(e*a*4);let y=0;for(let l=s;l<a-r&&y<v.length;l++,y++){const d=v[y];for(let g=0;g<d.length&&i+g<e;g++){const b=d.charCodeAt(g)-32;if(b<=0||b>94)continue;const m=(l*e+i+g)*4;M[m]=b,M[m+1]=255,M[m+3]=255}}o.base=M,o.page=new Uint8Array(M),o.tPage&&t.deleteTexture(o.tPage),o.tPage=oe(e,a,M)}function Ko(e,a){if(!o.base||e<0||a<0||e>=o.cols||a>=o.rows)return 0;const n=(a*o.cols+e)*4;return o.base[n+1]?o.base[n]:0}const gt=.35,ce=2*Math.PI*po/C,me=2*Math.PI*$t/C,Zt=2*Math.PI*wo/C,qe=e=>({t:e,phi:gt+ce*e,psi:me*e,slow:Zt*e,br:qt*e,amp:ge,surf:1,wake:1}),vt=(e,a)=>({phi:e.phi+a*Math.PI+mo*Math.sin(e.psi+a*Math.PI-.6)*e.amp/ge,psi:e.psi+a*Math.PI,amp:e.amp,slow:e.slow,rad:Do,curl:1+Zo*Math.sin(2*e.br+.7)}),Zo=.02;var ae=(e=>(e[e.Flick=0]="Flick",e[e.Stone=1]="Stone",e[e.Intro=2]="Intro",e[e.Hover=3]="Hover",e[e.Drop=4]="Drop",e))(ae||{});const Jt={0:{life:3.4,speed:.15,sigma0:.04,lambda:.1,amp:.6,decay:1.3},1:{life:6,speed:.19,sigma0:.07,lambda:.15,amp:1.5,decay:2.4},2:{life:6,speed:.17,sigma0:.08,lambda:.15,amp:1.2,decay:2.2},3:{life:2.8,speed:.11,sigma0:.03,lambda:.085,amp:.5,decay:1},4:{life:6,speed:.14,sigma0:.055,lambda:.12,amp:1,decay:2.2}},Fe=6.2;function F(e,a,n){let i=e*374761393+a*668265263+n*2147483647|0;return i=Math.imul(i^i>>>13,1274126177),i^=i>>>16,(i>>>0)/4294967295}const Ze=(e,a,n)=>{const i=Math.min(1,Math.max(0,(n-e)/(a-e)));return i*i*(3-2*i)},R={rings:new Float32Array(Le*4),ringP:new Float32Array(Le*4),ringN:0,parts:new Float32Array(Bt*(pe+1)*6),partN:0,lifted:[]},Jo=(e,a)=>[o.gw/2+e*o.unit,o.gh/2-a*o.unit];function Qo(e){const[a,n]=Jo(e.x,e.y),i=Math.floor(a/o.cw),s=Math.floor(n/o.ch),r=[];if(e.kind===3||e.kind===4)return r;if(e.kind===0){const h=e.fx,c=-e.fy;for(let f=0;f<4;f++){const w=F(e.seed,f,1)*Math.PI*2,v=.6+2.6*F(e.seed,f,2),x=i+Math.round(Math.cos(w)*v*1.6),A=s+Math.round(Math.sin(w)*v*.8),M=(2+3*F(e.seed,f,3))*o.cw,y=(F(e.seed,f,4)-.5)*2,l=((x+.5)*o.cw-o.gw/2)/o.unit,d=(o.gh/2-(A+.5)*o.ch)/o.unit;Math.hypot(l,d)<.82||r.push({c:x,r:A,delay:.04*f,life:1.3+.5*F(e.seed,f,5),dx:(h-c*y*.6)*M,dy:(c+h*y*.6)*M,curl:y*1.2})}}else{const h=e.kind===1?26:12,c=Jt[e.kind].speed;for(let f=0;f<h;f++){const w=f/h*Math.PI*2+F(e.seed,f,6)*.5,v=1.5+6*F(e.seed,f,7),x=i+Math.round(Math.cos(w)*v*2),A=s+Math.round(Math.sin(w)*v),M=Math.hypot((x-i)*o.cw,(A-s)*o.ch)/o.unit,y=(1.5+2.5*F(e.seed,f,8))*o.cw;r.push({c:x,r:A,delay:M/c,life:1.8+.9*F(e.seed,f,9),dx:Math.cos(w)*y*1.4,dy:Math.sin(w)*y,curl:(F(e.seed,f,10)-.5)*1.6})}}return r}function Ft(e,a){const n=Math.sin(Math.PI*Math.pow(Math.min(1,Math.max(0,a)),.55)),i=e.curl*a,s=Math.cos(i),r=Math.sin(i);return[(e.dx*s-e.dy*r)*n,(e.dx*r+e.dy*s)*n]}function ea(e,a){R.ringN=0,R.partN=0,R.lifted.length=0;const n=a.filter(i=>e-i.t0>=0&&e-i.t0<Fe).sort((i,s)=>s.t0-i.t0);for(const i of n){const s=e-i.t0,r=Jt[i.kind];if(s<r.life&&R.ringN<Le){const h=R.ringN++,c=r.speed*s,f=(i.amp??1)*r.amp*Math.exp(-s/r.decay)*Ze(0,.15,s)*(1-Ze(r.life*.7,r.life,s))/Math.sqrt(1+c/.12);R.rings.set([i.x,i.y,c,f],h*4),R.ringP.set([r.sigma0*(1+.9*s),2*Math.PI/r.lambda,0,0],h*4)}for(const h of Qo(i)){const c=(s-h.delay)/h.life;if(c<0||c>=1)continue;const f=Ko(h.c,h.r);if(!f)continue;if((R.partN+pe+1)*6>R.parts.length)break;R.lifted.push(h.r*o.cols+h.c);const w=(h.c+.5)*o.cw,v=(h.r+.5)*o.ch,x=Ze(0,.08,c);for(let l=pe;l>=1;l--){const d=c-l*.025;if(d<=0)continue;const[g,b]=Ft(h,d);R.parts.set([w+g,v+b,14,.5*x*(1-l/(pe+1))*(1-c),1,0],R.partN*6),R.partN++}const[A,M]=Ft(h,c),y=Math.sin(Math.PI*Math.pow(c,.6));R.parts.set([w+A,v+M,f,2+.55+.4*y,1+.5*y,y>.45?1:0],R.partN*6),R.partN++}}return R}const Qt=new URLSearchParams(location.search),ie=Qt.has("capture"),eo=ie&&Qt.has("reveal"),ta=2.4,_e=Math.PI*2,D=document.createElement("canvas");document.body.appendChild(D);const yt=document.createElement("div");yt.className="hint";yt.textContent="drag to turn the water · click to drop a stone · scroll to read closer · H hides this";const xt=document.createElement("div");xt.className="mark";xt.textContent="koi / page";ie||document.body.append(yt,xt);ie&&document.body.classList.add("capture");const oa=[new it,new it],E={zoom:1,panX:0,panY:0};let O=ie?{w:1920,h:1080,pr:1}:null,_t=0;function bt(){const e=O?O.w:innerWidth,a=O?O.h:innerHeight,n=O?O.pr:Math.min(2,devicePixelRatio||1);D.style.width=e+"px",D.style.height=a+"px",o.dpr=n;const i=Math.min(e,a)<600?xo:yo;if((_t!==n||o.cellPx!==i)&&(o.cellPx=i,Ro(i),_t=n),o.W=Math.max(1,Math.round(e*n)),o.H=Math.max(1,Math.round(a*n)),(D.width!==o.W||D.height!==o.H)&&(D.width=o.W,D.height=o.H),o.cols=Math.max(1,Math.floor(o.W/o.cw)),o.rows=Math.max(1,Math.floor(o.H/o.ch)),o.gw=o.cols*o.cw,o.gh=o.rows*o.ch,o.offX=Math.floor((o.W-o.gw)/2),o.offY=Math.floor((o.H-o.gh)/2),o.unit=Math.min(o.gw,o.gh)/ko,o.tData){for(const s of[o.tData,o.tPageD,o.tWater])t.deleteTexture(s);t.deleteFramebuffer(o.fbo)}o.tData=oe(o.cols,o.rows),o.tPageD=oe(o.cols,o.rows),o.tWater=oe(o.cols,o.rows),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),o.fbo=To(o.tData,o.tPageD,o.tWater),jo(),Mt(E.zoom,o.W/2,o.H/2)}function aa(e){return oa.map((a,n)=>a.update(vt(e,n)))}const to=new it,Ht=(e,a)=>(e%a+a)%a;function oo(e,a){const n=to.update(vt(e,Ht(a,2)));return{t0:e.t,x:n.tip[0],y:n.tip[1],fx:-Math.cos(n.tip[2]),fy:-Math.sin(n.tip[2]),kind:ae.Flick,seed:Ht(a,uo)}}const ia=[{t:.4,x:-1.72,y:.42},{t:2.3,x:1.62,y:-.5},{t:4.2,x:-1.55,y:-.58},{t:6.1,x:1.85,y:.36},{t:8,x:-1.9,y:-.08},{t:9.9,x:1.58,y:.62}];function ao(e){const a=[],n=Math.floor(me*e/Math.PI),i=Math.ceil(me*(e-Fe)/Math.PI);for(let s=i;s<=n;s++)a.push(oo(qe(s*Math.PI/me),s));for(const s of ia){const r=s.t+C*Math.floor((e-s.t)/C);e-r<Fe&&a.push({t0:r,x:s.x,y:s.y,fx:0,fy:0,kind:ae.Drop,seed:Math.round(s.t*10)})}return a}function kt(e,a){const n=aa(e);Vo(n,{loop:_e*e.t/C,amp:e.amp,surf:e.surf,wake:e.wake},ea(e.t,a),E)}function ct(e){const a=(e%C+C)%C;eo&&io(a),kt(qe(a),ao(a))}function io(e){const a=ut(0,1,Math.min(1,(.5-.5*Math.cos(_e*e/C))*1.3)),n=to.update(vt(qe(e),0)),i=.5*(n.crown[0]+n.gill[0]),s=.5*(n.crown[1]+n.gill[1]),r=o.gw/2+i*o.unit,h=o.gh/2-s*o.unit,c=Math.exp(Math.log(ta)*a),f=o.gw/2+(r-o.gw/2)*a,w=o.gh/2+(h-o.gh/2)*a;E.zoom=c,E.panX=Math.min(0,Math.max(o.W-o.W*c,o.W/2-(o.offX+f)*c)),E.panY=Math.min(0,Math.max(o.H-o.H*c,o.H/2-(o.offY+w)*c))}const p={t:0,intro:0,phi:gt,psi:0,slow:0,br:0,amp:ge,omega:ce,beat:0},S={x:0,y:0,lastT:-1,has:!1};let ft=4,$=[],q=ie,no=0,ve=!1,W=!1,Je=0,dt=0,He=0;function so(e){const a=ut(2,5.2,e),n=ut(3.6,7,e);return{surf:a,chase:n}}function ut(e,a,n){const i=Math.min(1,Math.max(0,(n-e)/(a-e)));return i*i*(3-2*i)}function na(){p.t=0,p.intro=0,p.phi=gt,p.psi=0,p.slow=0,p.br=0,p.amp=ge,p.omega=ce,p.beat=0,S.has=!1,ft=4,He=0,$=[],pt=!1}let pt=!1;function sa(e){p.t+=e,p.intro+=e;const a=so(p.intro);!pt&&p.intro>1.3&&(pt=!0,$.push({t0:p.t,x:0,y:0,fx:0,fy:0,kind:ae.Intro,seed:1})),W?performance.now()-dt>80&&(p.omega*=Math.exp(-e/.08)):(p.omega+=(ce-p.omega)*(1-Math.exp(-e/1.6)),p.phi+=p.omega*e*(.15+.85*a.chase));const n=He*(1-Math.exp(-e/.12));p.phi+=n,He-=n;const i=Math.min(1,Math.max(0,(Math.abs(p.omega)-ce)/1.5));p.amp+=(ge*(.55+.45*a.chase)+.6*i-p.amp)*(1-Math.exp(-e/.4)),p.psi+=me*(1+1.8*i)*(.6+.4*a.chase)*e,p.slow+=Zt*e,p.br+=qt*e;const s=Math.floor(p.psi/Math.PI);if(s!==p.beat&&(p.beat=s,a.chase>.9&&$.push(oo(ro(),s))),p.t>ft&&a.chase>.9){const r=Math.random()<.5?-1:1,h=o.gw/o.unit/2,c=r*(1.45+Math.random()*Math.max(.1,h-1.65)),f=(Math.random()-.5)*1.5;$.push({t0:p.t,x:c,y:f,fx:0,fy:0,kind:ae.Drop,seed:Math.floor(Math.random()*997)}),ft=p.t+1.6+Math.random()*2}$=$.filter(r=>p.t-r.t0<Fe)}const ro=()=>{const e=so(p.intro);return{t:p.t,phi:p.phi,psi:p.psi,slow:p.slow,br:p.br,amp:p.amp,surf:e.surf,wake:e.surf}};let ze=0,De=0;function lo(e){ze=requestAnimationFrame(lo);const a=Math.min(.05,De?(e-De)/1e3:0);if(De=e,Math.abs(K-E.zoom)>1e-4&&Mt(E.zoom+(K-E.zoom)*(1-Math.exp(-a/.09)),V.x,V.y),q){ct((e-no)/1e3);return}ve||sa(a),kt(ro(),$)}function we(){q&&(no=performance.now()),ve=!1,cancelAnimationFrame(ze),De=0,ze=requestAnimationFrame(lo)}function Ce(){ve=!0,cancelAnimationFrame(ze)}let K=1;const V={x:0,y:0};function Mt(e,a,n){const i=Math.min(8,Math.max(1,e)),s=(a-E.panX)/E.zoom,r=(n-E.panY)/E.zoom;E.zoom=i,E.panX=Math.min(0,Math.max(o.W-o.W*i,a-s*i)),E.panY=Math.min(0,Math.max(o.H-o.H*i,n-r*i)),Math.abs(i-1)<.001&&(E.zoom=1,E.panX=0,E.panY=0)}const Ie=e=>{const a=D.getBoundingClientRect();return{x:(e.clientX-a.left)*o.dpr,y:(e.clientY-a.top)*o.dpr}},Re=e=>{const a=(e.x-E.panX)/E.zoom-o.offX,n=(e.y-E.panY)/E.zoom-o.offY;return{x:(a-o.gw/2)/o.unit,y:-(n-o.gh/2)/o.unit}},G=new Map;let H=null,zt=0,Nt=1;function ra(){D.addEventListener("pointerdown",a=>{D.setPointerCapture(a.pointerId);const n=Ie(a);if(G.set(a.pointerId,n),G.size===2){const[s,r]=[...G.values()];zt=Math.hypot(s.x-r.x,s.y-r.y),Nt=K,H=null,W=!1;return}H={...n,t:performance.now()};const i=Re(n);Je=Math.atan2(i.y,i.x)}),D.addEventListener("pointermove",a=>{if(a.pointerType==="mouse"&&!q&&!W){const i=Re(Ie(a));(!S.has||p.t-S.lastT>.14&&Math.hypot(i.x-S.x,i.y-S.y)>.05)&&(S.has&&$.push({t0:p.t,x:i.x,y:i.y,fx:0,fy:0,kind:ae.Hover,seed:Math.floor(p.t*131)%997}),S.x=i.x,S.y=i.y,S.lastT=p.t,S.has=!0)}if(!G.has(a.pointerId))return;const n=Ie(a);if(G.set(a.pointerId,n),G.size===2){const[i,s]=[...G.values()],r=Math.hypot(i.x-s.x,i.y-s.y);K=Math.min(8,Math.max(1,Nt*r/Math.max(zt,1))),V.x=(i.x+s.x)/2,V.y=(i.y+s.y)/2;return}if(!(!H||q)&&(!W&&Math.hypot(n.x-H.x,n.y-H.y)>6*o.dpr&&(W=!0),W)){const i=Re(n),s=Math.atan2(i.y,i.x);let r=s-Je;r-=_e*Math.round(r/_e),Je=s;const h=performance.now(),c=Math.max(1,h-dt)/1e3;dt=h,He+=r,p.omega=Math.max(ce*.3,Math.min(6,p.omega*.6+r/c*.4))}});const e=a=>{if(G.delete(a.pointerId),H&&!W&&!q&&performance.now()-H.t<500){const n=Re(H);$.push({t0:p.t,x:n.x,y:n.y,fx:0,fy:0,kind:ae.Stone,seed:Math.floor(p.t*1e3)%9973})}W=!1,H=null};D.addEventListener("pointerup",e),D.addEventListener("pointerleave",()=>{S.has=!1}),D.addEventListener("pointercancel",e),D.addEventListener("wheel",a=>{a.preventDefault();const n=Ie(a);V.x=n.x,V.y=n.y,K=Math.min(8,Math.max(1,K*Math.exp(-a.deltaY*.0018)))},{passive:!1}),addEventListener("keydown",a=>{a.key==="h"||a.key==="H"?document.body.classList.toggle("rec"):a.key===" "?(a.preventDefault(),ve?we():Ce()):a.key==="r"||a.key==="R"?At.replay():a.key==="0"&&(K=1,V.x=o.W/2,V.y=o.H/2)}),addEventListener("resize",()=>{O||bt()})}let ho=()=>{};const At={ready:new Promise(e=>{ho=e}),isReady:!1,duration:C,renderAt(e){Ce(),q=!0,ct(e)},play(){we()},pause(){Ce()},replay(){if(K=1,Mt(1,0,0),ie){q=!0,we();return}q=!1,na(),we()},renderUnwrapped(e){Ce(),q=!0,eo&&io((e%C+C)%C),kt(qe(e),ao(e))},setSize(e,a,n=1){O={w:e,h:a,pr:n},bt(),ve&&ct(0)}};window.asciiPiece=At;async function la(){if(!Mo(D)){document.body.insertAdjacentHTML("beforeend",'<p class="fallback">This piece needs WebGL 2.</p>');return}await Promise.race([document.fonts.ready,new Promise(e=>setTimeout(e,1500))]),Io(),Go(),bt(),ie||ra(),we(),At.isReady=!0,ho()}la();
