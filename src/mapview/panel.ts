import * as vscode from "vscode";
import { MapParseResult, ModuleNode } from "./parser";
import { getMapViewCss } from "./style";

interface PanelData {
  sections: { name: string; size: number; addressRange: string }[];
  moduleTree: ModuleNode[];
  romUsed: number;
  ramUsed: number;
  objectCount: number;
  projDir: string;
}

export class MapViewPanel {
  public static currentPanel: MapViewPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private _disposed = false;

  public static createOrShow(extensionUri: vscode.Uri, mapPath: string, data: MapParseResult, projDir?: string) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;
    const title = mapPath.split(/[\\/]/).pop() || "Map View";
    if (MapViewPanel.currentPanel && !MapViewPanel.currentPanel._disposed) {
      MapViewPanel.currentPanel.panel.reveal(column);
      MapViewPanel.currentPanel.update(mapPath, data, projDir);
      return;
    }
    MapViewPanel.currentPanel = new MapViewPanel(extensionUri, column || vscode.ViewColumn.One, title, mapPath, data, projDir);
  }

  private constructor(
    extensionUri: vscode.Uri, column: vscode.ViewColumn,
    title: string, mapPath: string, data: MapParseResult, projDir?: string,
  ) {
    this.panel = vscode.window.createWebviewPanel("imdeMapView", title, column, {
      enableScripts: true, retainContextWhenHidden: true,
    });
    this.panel.webview.html = this.getHtml(mapPath, data, projDir);
    this.panel.onDidDispose(() => { this._disposed = true; MapViewPanel.currentPanel = undefined; });
  }

  public update(mapPath: string, data: MapParseResult, projDir?: string) {
    this.panel.webview.html = this.getHtml(mapPath, data, projDir);
  }

  private toPanelData(data: MapParseResult, projDir: string): PanelData {
    const mt = data.moduleTree || [];
    const secs = (data.sections || []).map(s => ({ name: s.name, size: s.size, addressRange: s.addressRange }));
    if (!Array.isArray(mt) || secs.length === 0) {
      console.warn("[MapView] Empty or invalid moduleTree/sections from parseMapFile");
    }
    return {
      sections: secs,
      moduleTree: mt,
      romUsed: data.romUsed || 0, ramUsed: data.ramUsed || 0,
      objectCount: data.objects?.length || 0,
      projDir,
    };
  }

  private getHtml(mapPath: string, data: MapParseResult, projDir?: string): string {
    const panelData = this.toPanelData(data, projDir || "");
    const json = JSON.stringify(panelData).replace(/</g, "\\x3c");
    const d = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
    const bg = d ? "#1e1e1e" : "#ffffff";
    const fg = d ? "#cccccc" : "#333333";
    const border = d ? "#3c3c3c" : "#e0e0e0";
    const accent = d ? "#4ec9b0" : "#007acc";
    const cardBg = d ? "#252526" : "#f8f8f8";
    const muted = d ? "#808080" : "#888888";

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Map View</title>
<style>${getMapViewCss({ bg, fg, border, accent, cardBg, muted }, !!d)}</style>
</head>
<body>
<div class="header">
  <h1>Memory Map</h1>
  <div class="path">${this.escapeHtml(mapPath)}</div>
  <div class="summary" id="summary"></div>
</div>
<div class="controls">
  <div class="breadcrumb" id="breadcrumb"></div>
  <button class="btn secondary" id="topBtn" disabled title="Back to top level">↻</button>
  <button class="btn secondary" id="backBtn" disabled>Back</button>
  <input class="search-box" id="searchBox" type="text" placeholder="Search modules...">
  <div class="view-toggle">
    <button class="active" data-view="treemap">Treemap</button>
    <button data-view="sections">Sections</button>
  </div>
</div>
<div class="treemap-wrap" id="treemap"></div>
<div class="section-list" id="sectionList"></div>
<div class="legend" id="legend"></div>
<div class="tooltip" id="tooltip"></div>
<div class="ctx-menu" id="ctxMenu" style="display:none"><div class="ctx-item" onclick="ctxCopyName()">📋 Copy Name</div><div class="ctx-item" onclick="ctxCopyPath()">📁 Copy Path</div><div class="ctx-item" onclick="ctxRevealSource()">📄 Reveal Source</div></div>
<div class="error-msg" id="errmsg"></div>

<script>
(function() {
  // --- Data ---
  var DATA = ${json};
  var PAL = ["#5B9DA5","#E88462","#7BA64E","#C978A5","#D4A74A","#6B97CE","#8EAF6B","#CC768A","#5EA391","#C58A4E","#7990C4","#AA7A5E","#63A87C","#B87594","#8E8CC4","#D49253","#5F9DBF","#9E7DBF","#BFA560","#698DA8"];

  // --- State ---
  var viewStack = [{ name: "root", children: DATA.moduleTree || [] }];
  var currentView = "treemap";
  var searchQuery = "";

  // --- Helpers ---
  function colorFor(s, idx) {
    var h = 0;
    for (var j = 0; j < s.length; j++) { h = s.charCodeAt(j) + ((h << 5) - h); }
    return PAL[Math.abs(h + idx) % PAL.length];
  }
  function fmt(b) {
    if (b >= 1048576) return (b / 1048576).toFixed(2) + " MB";
    if (b >= 1024) return (b / 1024).toFixed(1) + " KB";
    return b + " B";
  }
  function pct(v, t) { return t <= 0 ? "0%" : ((v / t) * 100).toFixed(1) + "%"; }
  function esc(t) { var d = document.createElement("div"); d.textContent = "" + t; return d.innerHTML; }

  // --- Render summary (always global) ---
  function renderSummary() {
    var r = DATA.romUsed || 0;
    var m = DATA.ramUsed || 0;
    var t = r + m;
    var html = "";
    html += '<div class="summary-card"><div class="label">Total</div><div class="value">' + fmt(t) + '</div></div>';
    html += '<div class="summary-card"><div class="label">ROM (Flash)</div><div class="value">' + fmt(r) + '</div></div>';
    html += '<div class="summary-card"><div class="label">RAM</div><div class="value">' + fmt(m) + '</div></div>';
    html += '<div class="summary-card"><div class="label">Modules</div><div class="value">' + (DATA.objectCount || 0) + '</div></div>';
    document.getElementById("summary").innerHTML = html;
  }

  // --- Breadcrumb ---
  function renderBreadcrumb() {
    var el = document.getElementById("breadcrumb");
    var parts = [];
    for (var i = 0; i < viewStack.length; i++) {
      var label = viewStack[i].name === "root" ? "All Modules" : viewStack[i].name;
      parts.push('<span onclick="window._navTo(' + i + ')">' + esc(label) + '</span>');
    }
    el.innerHTML = parts.join('<span class="sep">/</span>');
    document.getElementById("backBtn").disabled = viewStack.length <= 1;
    document.getElementById("topBtn").disabled = viewStack.length <= 1;
  }

  window._navTo = function(idx) {
    viewStack = viewStack.slice(0, idx + 1);
    searchQuery = "";
    document.getElementById("searchBox").value = "";
    renderSummary();
    renderBreadcrumb();
    renderTreemap();
  };

  document.getElementById("backBtn").onclick = function() {
    if (viewStack.length > 1) { viewStack.pop(); renderBreadcrumb(); renderTreemap(); }
  };
  document.getElementById("topBtn").onclick = function() {
    viewStack = [{ name: "root", children: DATA.moduleTree || [] }];
    searchQuery = ""; document.getElementById("searchBox").value = "";
    renderSummary(); renderBreadcrumb(); renderTreemap();
  };

  // --- Search ---
  document.getElementById("searchBox").addEventListener("input", function(e) {
    searchQuery = e.target.value.trim().toLowerCase();
    renderBreadcrumb();
    renderTreemap();
  });

  // --- Get nodes at current tree depth ---
  function getCurrentNodes() {
    var nodes = DATA.moduleTree || [];
    for (var i = 1; i < viewStack.length; i++) {
      var target = viewStack[i];
      var found = null;
      for (var j = 0; j < nodes.length; j++) {
        var n = nodes[j];
        if (n.fullPath === target.fullPath || n.name === target.name) {
          found = n.children || [];
          break;
        }
      }
      if (found === null) { return []; }
      nodes = found;
    }
    // Global search: walk the ENTIRE subtree, collect matching nodes with path labels
    if (searchQuery) {
      var results = [];
      function walk(list, prefix) {
        for (var i = 0; i < list.length; i++) {
          var n = list[i];
          var curPath = prefix ? prefix + "/" + n.name : n.name;
          if (n.name.toLowerCase().indexOf(searchQuery) >= 0) {
            results.push({ name: curPath, size: n.size, romSize: n.romSize, ramSize: n.ramSize, children: n.children, fullPath: n.fullPath });
          }
          if (n.children && n.children.length > 0) {
            walk(n.children, curPath);
          }
        }
      }
      walk(nodes, "");
      return results;
    }
    return nodes;
  }

  // --- Squarified Treemap ---
  function layoutTreemap(list, x, y, w, h) {
    if (!list.length || w <= 0 || h <= 0) return [];
    var total = 0;
    for (var i = 0; i < list.length; i++) { total += list[i].size || 0; }
    if (total <= 0) return [];

    var res = [];
    var row = [], rowSum = 0;

    function worstRatio(l, s, area) {
      var mn = Infinity, mx = 0, n = 0;
      for (var k = 0; k < l.length; k++) {
        var sz = l[k].size || 0;
        if (sz > 0) { if (sz < mn) mn = sz; if (sz > mx) mx = sz; n++; }
      }
      if (n === 0 || area <= 0) return Infinity;
      return Math.max((s * s * mx) / (n * n * area), (n * n * area) / (s * s * mn));
    }

    function flush(aw, ah, aa) {
      if (!row.length) return;
      var rowDim = aa <= 0 ? 0 : (rowSum / total) * aa / (aw >= ah ? aw : ah);
      var off = 0;
      for (var k = 0; k < row.length; k++) {
        var ratio = (row[k].size || 0) / rowSum;
        if (aw >= ah) {
          res.push({ node: row[k], rect: { x: x + off, y: y, w: ratio * aw, h: rowDim } });
          off += ratio * aw;
        } else {
          res.push({ node: row[k], rect: { x: x, y: y + off, w: rowDim, h: ratio * ah } });
          off += ratio * ah;
        }
      }
      if (aw >= ah) { y += rowDim; h -= rowDim; } else { x += rowDim; w -= rowDim; }
      row = []; rowSum = 0;
    }

    for (var i = 0; i < list.length; i++) {
      var sz = list[i].size || 0;
      if (sz <= 0) continue;
      var area = w * h;
      if (row.length === 0) {
        row.push(list[i]); rowSum += sz;
      } else {
        var pv = worstRatio(row, rowSum, area);
        var nx = worstRatio(row.concat([list[i]]), rowSum + sz, area);
        if (nx <= pv) {
          row.push(list[i]); rowSum += sz;
        } else {
          flush(w, h, area);
          row.push(list[i]); rowSum += sz;
        }
      }
    }
    flush(w, h, w * h);
    return res;
  }

  // --- Treemap render ---
  function renderTreemap() {
    var wrap = document.getElementById("treemap");
    wrap.innerHTML = "";
    if (currentView !== "treemap") return;

    var nodes = getCurrentNodes();
    // Sort by size desc
    nodes.sort(function(a, b) { return (b.size || 0) - (a.size || 0); });

    var total = 0;
    for (var i = 0; i < nodes.length; i++) { total += nodes[i].size || 0; }

    // Filter out tiny nodes only if there are many
    if (nodes.length > 10) {
      nodes = nodes.filter(function(n) { return (n.size || 0) / total > 0.003; });
    }

    if (!nodes.length || total <= 0) {
      wrap.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:' + "${muted}" + ';font-size:14px;">' +
        (searchQuery ? "No matching modules" : "No data") + '</div>';
      document.getElementById("legend").innerHTML = "";
      return;
    }

    var cw = wrap.clientWidth;
    var ch = wrap.clientHeight;
    var pad = 3;
    var layout = layoutTreemap(nodes, pad, pad, cw - pad * 2, ch - pad * 2);

    var frag = document.createDocumentFragment();
    for (var i = 0; i < layout.length; i++) {
      var item = layout[i], node = item.node, rect = item.rect;
      var el = document.createElement("div");
      el.className = "treemap-node";
      el.style.animationDelay = (i * 0.02) + "s";

      var color = colorFor(node.name || "", i);
      el.style.left = Math.round(rect.x) + "px";
      el.style.top = Math.round(rect.y) + "px";
      el.style.width = Math.max(1, Math.round(rect.w)) + "px";
      el.style.height = Math.max(1, Math.round(rect.h)) + "px";
      el.style.background = color;
      el.style.borderColor = "rgba(255,255,255,.08)";

      var sz = node.size || 0;
      var perc = total > 0 ? ((sz / total) * 100).toFixed(1) : "0";
      var showLabel = rect.w > 40 && rect.h > 22;
      var showSize = rect.w > 48 && rect.h > 36;
      var showPct = rect.w > 48 && rect.h > 50;

      if (showLabel) {
        var inner = '<div class="treemap-label">' + esc(node.name) + '</div>';
        if (showSize) inner += '<div class="treemap-size">' + fmt(sz) + '</div>';
        if (showPct) inner += '<div class="treemap-pct">' + perc + '%</div>';
        el.innerHTML = inner;
      }

      // Click to drill down
      if (node.children && node.children.length > 0) {
        (function(n) {
          el.addEventListener("click", function() {
            if (searchQuery) {
              // Search active: go to root, clear search
              viewStack = [{ name: "root", children: DATA.moduleTree || [] }];
              searchQuery = "";
              document.getElementById("searchBox").value = "";
            } else {
              viewStack.push(n);
            }
            renderSummary();
            renderBreadcrumb();
            renderTreemap();
          });
        })(node);
      }

      // Right-click context menu
      (function(n) {
        el.addEventListener("contextmenu", function(e) {
          e.preventDefault();
          hideTooltip();
          var menu = document.getElementById("ctxMenu");
          menu.style.display = "block";
          menu.style.left = e.clientX + "px";
          menu.style.top = e.clientY + "px";
          menu._node = n;
        });
      })(node);

      // Tooltip
      (function(n, c) {
        el.addEventListener("mouseenter", function(e) { showTooltip(e, n, c); });
      })(node, color);
      el.addEventListener("mouseleave", hideTooltip);
      el.addEventListener("mousemove", moveTooltip);

      frag.appendChild(el);
    }
    wrap.appendChild(frag);

    // Legend
    renderLegend(nodes, total);
  }

  function renderLegend(nodes, total) {
    var top = nodes.slice(0, 10);
    var html = "";
    for (var i = 0; i < top.length; i++) {
      var c = colorFor(top[i].name || "", i);
      html += '<div class="legend-item"><div class="legend-color" style="background:' + c + '"></div><span>' +
        esc(top[i].name) + ' <b>' + pct(top[i].size || 0, total) + '</b></span></div>';
    }
    document.getElementById("legend").innerHTML = html;
  }

  // --- Section list ---
  function renderSectionList() {
    var el = document.getElementById("sectionList");
    var secs = (DATA.sections || []).slice().sort(function(a, b) { return (b.size || 0) - (a.size || 0); });
    var maxSz = 1;
    for (var i = 0; i < secs.length; i++) { if (secs[i].size > maxSz) maxSz = secs[i].size; }
    var html = "";
    for (var i = 0; i < secs.length; i++) {
      var s = secs[i];
      var barPct = ((s.size / maxSz) * 100).toFixed(1);
      var color = PAL[i % PAL.length];
      html += '<div class="section-row"><span class="sec-name" title="' + esc(s.addressRange||'') + '">' + esc(s.name) +
        '</span><span class="sec-size" style="color:' + color + '">' + fmt(s.size) +
        (s.addressRange ? ' <span style="font-size:10px;color:' + color + '">' + s.addressRange + '</span>' : '') +
        '</span></div>' +
        '<div class="section-bar-bg"><div class="section-bar" style="width:' + barPct + '%;background:' + color + '"></div></div>';
    }
    el.innerHTML = html;
  }

  // --- Tooltip ---
  var tooltip = document.getElementById("tooltip");
  function showTooltip(e, node, color) {
    var rom = node.romSize || 0, ram = node.ramSize || 0;
    var html = '<div class="tt-title" style="color:' + color + '">' + esc(node.name) + '</div>' +
      '<div class="tt-row"><span class="tt-key">Total</span><span class="tt-val">' + fmt(node.size || 0) + '</span></div>';
    if (rom > 0) html += '<div class="tt-row"><span class="tt-key">ROM</span><span class="tt-val">' + fmt(rom) + '</span></div>';
    if (ram > 0) html += '<div class="tt-row"><span class="tt-key">RAM</span><span class="tt-val">' + fmt(ram) + '</span></div>';
    if (node.children && node.children.length) {
      html += '<div class="tt-row"><span class="tt-key">Children</span><span class="tt-val">' + node.children.length + '</span></div>';
    }
    if (node.sourceFiles && node.sourceFiles.length > 0) {
      html += '<div style="margin-top:6px;border-top:1px solid ' + (node.sourceFiles.length > 3 ? ';max-height:80px;overflow-y:auto"' : '"') + '>';
      for (var si = 0; si < node.sourceFiles.length && si < 5; si++) {
        var sf = node.sourceFiles[si];
        var full = (DATA.projDir ? DATA.projDir.replace(/\\\\/g, '/') + '/' : '') + sf;
        html += '<div class="tt-src" style="margin:2px 0"><a href="command:imde.openFile?' + encodeURIComponent(JSON.stringify([full, sf])) + '">📄 ' + esc(sf) + '</a></div>';
      }
      if (node.sourceFiles.length > 5) html += '<div style="font-size:10px;color:${muted}">+ ' + (node.sourceFiles.length - 5) + ' more</div>';
      html += '</div>';
    }
    tooltip.innerHTML = html;
    tooltip.style.display = "block";
    moveTooltip(e);
  }
  function hideTooltip() { tooltip.style.display = "none"; }
  function moveTooltip(e) {
    var rect = tooltip.getBoundingClientRect();
    var left = e.clientX + 14, top = e.clientY + 14;
    if (left + rect.width > window.innerWidth) left = e.clientX - rect.width - 8;
    if (top + rect.height > window.innerHeight) top = e.clientY - rect.height - 8;
    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  }

  // --- View toggle ---
  var toggleBtns = document.querySelectorAll(".view-toggle button");
  for (var i = 0; i < toggleBtns.length; i++) {
    toggleBtns[i].addEventListener("click", function() {
      for (var j = 0; j < toggleBtns.length; j++) { toggleBtns[j].classList.remove("active"); }
      this.classList.add("active");
      currentView = this.dataset.view;
      document.getElementById("treemap").style.display = currentView === "treemap" ? "block" : "none";
      var sl = document.getElementById("sectionList");
      if (currentView === "sections") { sl.classList.add("active"); } else { sl.classList.remove("active"); }
      if (currentView === "treemap") renderTreemap();
      if (currentView === "sections") renderSectionList();
    });
  }

  // --- Context menu handlers ---
  window.ctxCopyName = function() { var n = document.getElementById("ctxMenu")._node; if (n) { navigator.clipboard.writeText(n.name || n.fullPath || ""); } hideCtxMenu(); };
  window.ctxCopyPath = function() { var n = document.getElementById("ctxMenu")._node; if (n) { navigator.clipboard.writeText(n.fullPath || n.name || ""); } hideCtxMenu(); };
  window.ctxRevealSource = function() {
    var n = document.getElementById("ctxMenu")._node;
    if (n && n.sourceFiles && n.sourceFiles.length > 0) {
      var sf = n.sourceFiles[0];
      var full = (DATA.projDir ? DATA.projDir.replace(/\\\\/g, '/') + '/' : '') + sf;
      window.location.href = "command:imde.openFile?" + encodeURIComponent(JSON.stringify([full, sf]));
    }
    hideCtxMenu();
  };
  function hideCtxMenu() { var m = document.getElementById("ctxMenu"); m.style.display = "none"; m._node = undefined; }
  document.addEventListener("click", function(e) { if (!e.target.closest(".ctx-menu") && !e.target.closest(".treemap-node")) hideCtxMenu(); });
  document.addEventListener("scroll", hideCtxMenu);

  // --- Initial render ---
  renderSummary();
  renderBreadcrumb();
  renderTreemap();

  // --- Resize ---
  var resizeTimer;
  window.addEventListener("resize", function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() { if (currentView === "treemap") renderTreemap(); }, 100);
  });
})();
</script>
</body>
</html>`;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
}
