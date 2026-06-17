export interface MapViewColors {
  bg: string; fg: string; border: string; accent: string; cardBg: string; muted: string;
}

export function getMapViewCss(c: MapViewColors, isDark: boolean): string {
  return `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',sans-serif;background:${c.bg};color:${c.fg};padding:20px;overflow:hidden;height:100vh;display:flex;flex-direction:column}
.header{margin-bottom:16px;flex-shrink:0}
.header h1{font-size:20px;font-weight:600;margin-bottom:4px;color:${c.accent};letter-spacing:-.3px}
.header .path{font-size:11px;color:${c.muted};margin-bottom:12px;word-break:break-all;font-family:monospace}
.summary{display:flex;gap:12px;flex-wrap:wrap}
.summary-card{background:${c.cardBg};border:1px solid ${c.border};border-radius:8px;padding:10px 16px;min-width:100px}
.summary-card .label{font-size:10px;color:${c.muted};text-transform:uppercase;letter-spacing:.8px;font-weight:500}
.summary-card .value{font-size:20px;font-weight:700;margin-top:2px;color:${c.fg}}
.controls{display:flex;gap:10px;margin-bottom:12px;flex-shrink:0;align-items:center;flex-wrap:wrap}
.btn{background:${c.accent};color:${isDark?"#1e1e1e":"#fff"};border:none;padding:5px 14px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;transition:opacity .15s}
.btn:hover{opacity:.85}
.btn:disabled{opacity:.3;cursor:default}
.btn.secondary{background:${isDark?"#3c3c3c":"#e8e8e8"};color:${c.fg}}
.breadcrumb{font-size:13px;color:${c.accent};cursor:pointer;flex:1;font-weight:500;user-select:none}
.breadcrumb span{padding:2px 4px;border-radius:4px;transition:background .15s}
.breadcrumb span:hover{background:${isDark?"#2a2d2e":"#eaeaea"};text-decoration:none}
.breadcrumb .sep{color:${c.muted};margin:0 4px;font-weight:400}
.view-toggle{display:flex;gap:0;border-radius:6px;overflow:hidden;border:1px solid ${c.border}}
.view-toggle button{background:${c.cardBg};color:${c.fg};border:none;padding:5px 12px;font-size:12px;cursor:pointer;font-weight:500;transition:all .15s}
.view-toggle button.active{background:${c.accent};color:${isDark?"#1e1e1e":"#fff"}}
.search-box{background:${c.cardBg};border:1px solid ${c.border};border-radius:6px;padding:5px 10px;font-size:12px;color:${c.fg};width:160px;outline:none}
.search-box:focus{border-color:${c.accent}}
.search-box::placeholder{color:${c.muted}}
.treemap-wrap{flex:1;border:1px solid ${c.border};border-radius:10px;overflow:hidden;position:relative;min-height:200px;background:${c.cardBg}}
.treemap-node{position:absolute;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;justify-content:center;align-items:center;border-radius:4px;padding:4px 6px;opacity:0;animation:nodeIn .25s ease forwards;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -1px 0 rgba(0,0,0,.08)}
@keyframes nodeIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
.treemap-node:hover{filter:brightness(1.12);z-index:10;transform:scale(1.02);box-shadow:inset 0 1px 0 rgba(255,255,255,.18),inset 0 -1px 0 rgba(0,0,0,.1),0 2px 8px rgba(0,0,0,.15)}
.treemap-label{font-size:13px;font-weight:700;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.45)}
.treemap-size{font-size:12px;font-weight:600;margin-top:2px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.45)}
.treemap-pct{font-size:11px;font-weight:500;margin-top:2px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.45)}
.tooltip{position:fixed;background:${isDark?"#252526":"#fff"};border:1px solid ${c.border};border-radius:8px;padding:10px 14px;font-size:12px;pointer-events:none;z-index:1000;box-shadow:0 6px 20px rgba(0,0,0,.35);max-width:340px;display:none;line-height:1.5}
.tooltip .tt-title{font-weight:700;margin-bottom:6px;font-size:13px}
.tooltip .tt-row{display:flex;justify-content:space-between;gap:24px}
.tooltip .tt-key{color:${c.muted}}
.tooltip .tt-val{font-weight:600}
.tooltip .tt-src{font-size:10px;margin:2px 0}
.tooltip .tt-src a{text-decoration:none}
.legend{display:flex;gap:14px;margin-top:10px;font-size:11px;flex-shrink:0;flex-wrap:wrap}
.legend-item{display:flex;align-items:center;gap:5px}
.legend-color{width:10px;height:10px;border-radius:3px}
.section-list{display:none;flex:1;overflow:auto;padding:8px}
.section-list.active{display:block}
.section-row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-radius:6px;font-size:14px;transition:background .1s}
.section-row:hover{background:${isDark?"#2a2d2e":"#f0f0f0"}}
.section-row .sec-name{font-weight:500;font-family:monospace;font-size:14px}
.section-row .sec-size{font-weight:600;font-size:14px}
.section-bar-bg{height:6px;background:${isDark?"#3c3c3c":"#e0e0e0"};border-radius:3px;margin:2px 14px 10px;overflow:hidden}
.section-bar{height:100%;border-radius:3px;transition:width .4s ease}
.error-msg{color:#d16969;font-size:13px;padding:12px;display:none}
.ctx-menu{position:fixed;background:${isDark?"#252526":"#fff"};border:1px solid ${isDark?"#3c3c3c":"#e0e0e0"};border-radius:6px;padding:4px 0;z-index:2000;box-shadow:0 4px 12px rgba(0,0,0,.3);min-width:140px}
.ctx-item{padding:6px 12px;font-size:12px;cursor:pointer;color:${isDark?"#cccccc":"#333333"}}
.ctx-item:hover{background:${isDark?"#094771":"#0066b8"};color:#fff}
`;
}
