export const editorialCss=String.raw`
.blogpost.ep{--ep-green:#0ca665;--ep-forest:#183b30;--ep-border:#dfe8e0;--ep-scale:1;max-width:1180px;margin:auto;padding:18px 20px 65px;color:var(--ep-forest)}
.ep,.ep *{box-sizing:border-box}.ep a{color:#087c4a}
.ep-progress{height:3px;background:#e3efe7;position:sticky;top:0;z-index:20}.ep-progress span{height:100%;width:0;display:block;background:var(--ep-green);transition:width .18s}
.ep-hero{display:grid;grid-template-columns:minmax(0,1.06fr) minmax(0,.94fr);align-items:center;gap:25px;padding:40px;border-radius:16px;background:#f4f8f3}
.ep-overline{display:block;color:#087d4b;font-size:10px;letter-spacing:1.25px;font-weight:800}
.ep-hero h1{font:500 clamp(32px,4.3vw,52px)/1.12 Georgia,serif;letter-spacing:-1.3px;color:var(--ep-forest);margin:15px 0}
.ep-deck{font-size:16px;color:#577063;line-height:1.7}.ep-byline{display:flex;align-items:center;gap:8px;color:#5a7466;font-size:12px;margin-top:18px}.ep-byline span{background:#d3ebdc;color:#127c4e;width:28px;height:28px;border-radius:50%;display:grid;place-items:center}
.ep-cover{margin:0;min-width:0}.ep-cover img{display:block;width:100%;height:auto;border-radius:12px}.ep-cover figcaption{font-size:10px;margin:8px 0;color:#678070}
.ep-toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:9px;padding:12px 20px;border:1px solid var(--ep-border);border-top:0;border-radius:0 0 12px 12px}
.ep-toolbar>span{font-size:10px;font-weight:800;letter-spacing:1px;color:#72877b}.ep-toolbar>div{display:flex;gap:6px}.ep-toolbar button{background:white;border:1px solid var(--ep-border);padding:8px 10px;border-radius:7px;color:#27674b;font-size:12px;cursor:pointer;font-weight:750}
.ep-toolbar button:hover{background:#e8f5ec}.ep button:focus-visible,.ep a:focus-visible,.ep summary:focus-visible{outline:3px solid #0d9559;outline-offset:3px}
.ep-layout{display:grid;grid-template-columns:200px minmax(0,1fr);gap:40px;margin-top:28px}
.ep-index nav{position:sticky;top:14px;padding:17px;border:1px solid var(--ep-border);border-radius:13px;max-height:74vh;overflow-y:auto;background:#fff}
.ep-index strong{font-size:10px;letter-spacing:1.1px;color:#078c52}.ep-index a{display:block;padding:9px 0;border-bottom:1px solid #eef2ee;color:#677c6f;font-size:12px;line-height:1.45;text-decoration:none}.ep-index a:last-child{border:0}.ep-index a:hover{color:#078b52}
.ep-content{min-width:0}.ep-summary{padding:22px 24px;margin-bottom:28px;border:1px solid #d2e9da;background:#eaf7ee;border-radius:13px}.ep-summary>span{font-size:10px;color:#07834a;font-weight:800;letter-spacing:1px}
.ep-summary h2{font:500 25px/1.3 Georgia,serif;margin:10px 0}.ep-summary p{margin:0}
.ep-section{border-bottom:1px solid var(--ep-border);scroll-margin-top:25px;padding-bottom:27px;margin-bottom:29px}
.ep-section h2{font:500 29px/1.25 Georgia,serif;letter-spacing:-.5px;color:var(--ep-forest);margin:10px 0 15px}.ep-section h3{font-size:18px;color:#24533a;margin:22px 0 10px}
.ep-section p,.ep-summary p{font-size:calc(16px * var(--ep-scale));color:#536c5e;line-height:1.84;margin:12px 0}.ep a.ep-anchor{text-decoration:underline;text-decoration-color:#a6d8b8;text-underline-offset:3px;color:#087c4d;font-weight:700}
.ep-more{margin:15px 0 0}.ep-more>summary{display:inline-flex;gap:10px;align-items:center;cursor:pointer;list-style:none;background:#e8f6ed;color:#087648;padding:11px 15px;border-radius:8px;font-size:12px;font-weight:800}.ep-more>summary::-webkit-details-marker{display:none}
.ep-more[open]>summary span{transform:rotate(180deg)}.ep-more-content{margin-top:15px;animation:epReveal .22s ease-out}
.ep-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:20px 0}
.ep-step{border:1px solid var(--ep-border);border-radius:12px;padding:15px 13px}.ep-step span{width:32px;height:32px;border-radius:9px;background:#dff3e7;color:#097947;font-weight:800;font-size:12px;display:grid;place-items:center;margin-bottom:10px}
.ep-step strong{display:block;font-size:13px}.ep-step small{font-size:11px;display:block;line-height:1.6;color:#738476;margin-top:6px}
.ep-illustration{margin:20px 0}.ep-illustration img{width:100%;height:auto;border-radius:13px}.ep-illustration figcaption{font-size:11px;color:#738478;margin-top:8px}
.ep-faq details{border-bottom:1px solid var(--ep-border);border-radius:0;padding:0}.ep-faq summary{cursor:pointer;padding:16px 4px;font-weight:700;color:#27513c}.ep-faq details p{font-size:14px}.ep-sources li{font-size:13px;margin:9px 0;overflow-wrap:anywhere}
.ep-cta{background:#183f31;color:white;display:flex;justify-content:space-between;align-items:center;gap:20px;border-radius:15px;padding:24px}
.ep-cta h2{font:500 26px Georgia,serif;color:#fff;margin:0 0 10px}.ep-cta p{font-size:13px;color:#d6e7db;line-height:1.7;margin:0}
.ep-cta a{flex-shrink:0;display:inline-block;border-radius:8px;padding:13px 16px;background:#04b26d;color:#fff;text-decoration:none;font-size:12px;font-weight:800}
.ep-related{display:grid;gap:9px;margin:25px 0}.ep-related h2{font:500 24px Georgia,serif}.ep-related a{font-size:14px}
.ep-author{font-size:13px;border-top:1px solid var(--ep-border);padding-top:20px}.ep-author p{font-size:12px;color:#587364;line-height:1.7}
.ep.ep-reader .ep-layout{grid-template-columns:1fr;max-width:760px;margin:30px auto}.ep.ep-reader .ep-index{display:none}
@keyframes epReveal{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:760px){.blogpost.ep{padding:14px 14px 48px}.ep-hero{grid-template-columns:1fr;padding:27px 19px;gap:20px}.ep-hero h1{font-size:clamp(30px,8vw,44px)}.ep-cover{max-width:440px;margin:auto}.ep-toolbar{padding:11px 14px}.ep-layout{grid-template-columns:1fr;gap:20px;margin-top:18px}.ep-index nav{position:static;max-height:none;padding:13px}.ep-index a{display:inline-block;margin-right:14px;border:0}.ep-section h2{font-size:25px}.ep-section p,.ep-summary p{font-size:calc(15px * var(--ep-scale))}.ep-cta{align-items:stretch;flex-direction:column}.ep-cta a{text-align:center}}
@media(max-width:420px){.ep-steps{grid-template-columns:1fr}.ep-step{display:grid;grid-template-columns:35px 1fr;gap:5px 9px}.ep-step span{grid-row:span 2;margin:0}.ep-step small{margin-top:0}}
@media(prefers-reduced-motion:reduce){.ep *{animation:none!important;transition:none!important}}
`;
