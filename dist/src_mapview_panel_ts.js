"use strict";
exports.id = "src_mapview_panel_ts";
exports.ids = ["src_mapview_panel_ts"];
exports.modules = {

/***/ "./src/mapview/panel.ts"
/*!******************************!*\
  !*** ./src/mapview/panel.ts ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MapViewPanel: () => (/* binding */ MapViewPanel)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _style__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./style */ "./src/mapview/style.ts");


class MapViewPanel {
    static currentPanel;
    panel;
    _disposed = false;
    static createOrShow(extensionUri, mapPath, data, projDir) {
        const column = vscode__WEBPACK_IMPORTED_MODULE_0__.window.activeTextEditor
            ? vscode__WEBPACK_IMPORTED_MODULE_0__.window.activeTextEditor.viewColumn
            : undefined;
        const title = mapPath.split(/[\\/]/).pop() || "Map View";
        if (MapViewPanel.currentPanel && !MapViewPanel.currentPanel._disposed) {
            MapViewPanel.currentPanel.panel.reveal(column);
            MapViewPanel.currentPanel.update(mapPath, data, projDir);
            return;
        }
        MapViewPanel.currentPanel = new MapViewPanel(extensionUri, column || vscode__WEBPACK_IMPORTED_MODULE_0__.ViewColumn.One, title, mapPath, data, projDir);
    }
    constructor(extensionUri, column, title, mapPath, data, projDir) {
        this.panel = vscode__WEBPACK_IMPORTED_MODULE_0__.window.createWebviewPanel("imdeMapView", title, column, {
            enableScripts: true, retainContextWhenHidden: true,
        });
        this.panel.webview.html = this.getHtml(mapPath, data, projDir);
        this.panel.onDidDispose(() => { this._disposed = true; MapViewPanel.currentPanel = undefined; });
    }
    update(mapPath, data, projDir) {
        this.panel.webview.html = this.getHtml(mapPath, data, projDir);
    }
    toPanelData(data, projDir) {
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
    getHtml(mapPath, data, projDir) {
        const panelData = this.toPanelData(data, projDir || "");
        const json = JSON.stringify(panelData).replace(/</g, "\\x3c");
        const d = vscode__WEBPACK_IMPORTED_MODULE_0__.window.activeColorTheme.kind === vscode__WEBPACK_IMPORTED_MODULE_0__.ColorThemeKind.Dark;
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
<style>${(0,_style__WEBPACK_IMPORTED_MODULE_1__.getMapViewCss)({ bg, fg, border, accent, cardBg, muted }, !!d)}</style>
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
<div class="insights" id="insights"></div>
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
      document.getElementById("insights").innerHTML = "";
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
    renderInsights(nodes, total);
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

  function renderInsights(nodes, total) {
    var el = document.getElementById("insights");
    if (!el) return;

    var source = nodes.slice().sort(function(a, b) { return (b.size || 0) - (a.size || 0); });
    var top = source.slice(0, 5);
    var rom = 0, ram = 0;
    for (var i = 0; i < source.length; i++) {
      rom += source[i].romSize || 0;
      ram += source[i].ramSize || 0;
    }

    var html = '<div class="insight-card"><div class="insight-title">Current View</div>' +
      '<div class="insight-row"><span class="insight-name">Visible total</span><span class="insight-size">' + fmt(total) + '</span><span class="insight-pct">' + source.length + ' nodes</span></div>' +
      '<div class="insight-row"><span class="insight-name">ROM contribution</span><span class="insight-size">' + fmt(rom) + '</span><span class="insight-pct">' + pct(rom, total) + '</span></div>' +
      '<div class="insight-row"><span class="insight-name">RAM contribution</span><span class="insight-size">' + fmt(ram) + '</span><span class="insight-pct">' + pct(ram, total) + '</span></div>' +
      '</div>';

    html += '<div class="insight-card"><div class="insight-title">Top Modules</div>';
    for (var j = 0; j < top.length; j++) {
      var n = top[j];
      var p = total > 0 ? Math.max(0.5, ((n.size || 0) / total) * 100) : 0;
      html += '<div class="insight-row"><span class="insight-name" title="' + esc(n.fullPath || n.name) + '">' + esc(n.name) + '</span><span class="insight-size">' + fmt(n.size || 0) + '</span><span class="insight-pct">' + pct(n.size || 0, total) + '</span></div>' +
        '<div class="mini-bar"><div class="mini-fill" style="width:' + p.toFixed(1) + '%"></div></div>';
    }
    html += '</div>';
    el.innerHTML = html;
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
      document.getElementById("legend").style.display = currentView === "treemap" ? "flex" : "none";
      document.getElementById("insights").style.display = currentView === "treemap" ? "flex" : "none";
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
    escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
}


/***/ },

/***/ "./src/mapview/style.ts"
/*!******************************!*\
  !*** ./src/mapview/style.ts ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getMapViewCss: () => (/* binding */ getMapViewCss)
/* harmony export */ });
function getMapViewCss(c, isDark) {
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
.btn{background:${c.accent};color:${isDark ? "#1e1e1e" : "#fff"};border:none;padding:5px 14px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;transition:opacity .15s}
.btn:hover{opacity:.85}
.btn:disabled{opacity:.3;cursor:default}
.btn.secondary{background:${isDark ? "#3c3c3c" : "#e8e8e8"};color:${c.fg}}
.breadcrumb{font-size:13px;color:${c.accent};cursor:pointer;flex:1;font-weight:500;user-select:none}
.breadcrumb span{padding:2px 4px;border-radius:4px;transition:background .15s}
.breadcrumb span:hover{background:${isDark ? "#2a2d2e" : "#eaeaea"};text-decoration:none}
.breadcrumb .sep{color:${c.muted};margin:0 4px;font-weight:400}
.view-toggle{display:flex;gap:0;border-radius:6px;overflow:hidden;border:1px solid ${c.border}}
.view-toggle button{background:${c.cardBg};color:${c.fg};border:none;padding:5px 12px;font-size:12px;cursor:pointer;font-weight:500;transition:all .15s}
.view-toggle button.active{background:${c.accent};color:${isDark ? "#1e1e1e" : "#fff"}}
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
.tooltip{position:fixed;background:${isDark ? "#252526" : "#fff"};border:1px solid ${c.border};border-radius:8px;padding:10px 14px;font-size:12px;pointer-events:none;z-index:1000;box-shadow:0 6px 20px rgba(0,0,0,.35);max-width:340px;display:none;line-height:1.5}
.tooltip .tt-title{font-weight:700;margin-bottom:6px;font-size:13px}
.tooltip .tt-row{display:flex;justify-content:space-between;gap:24px}
.tooltip .tt-key{color:${c.muted}}
.tooltip .tt-val{font-weight:600}
.tooltip .tt-src{font-size:10px;margin:2px 0}
.tooltip .tt-src a{text-decoration:none}
.legend{display:flex;gap:14px;margin-top:12px;font-size:11px;flex-shrink:0;flex-wrap:wrap}
.legend-item{display:flex;align-items:center;gap:5px}
.legend-color{width:10px;height:10px;border-radius:3px}
.insights{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-top:16px;flex-shrink:0;overflow:auto;padding-bottom:2px}
.insight-card{background:${c.cardBg};border:1px solid ${c.border};border-radius:10px;padding:16px 18px;min-width:0;min-height:150px;box-shadow:0 1px 0 rgba(0,0,0,.04)}
.insight-title{font-size:11px;color:${c.muted};text-transform:uppercase;letter-spacing:.8px;font-weight:700;margin-bottom:12px}
.insight-row{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(52px,auto);gap:14px;align-items:center;font-size:13px;padding:6px 0}
.insight-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.insight-size{font-weight:700}
.insight-pct{color:${c.muted};font-family:monospace;font-size:12px;text-align:right}
.mini-bar{height:8px;background:${isDark ? "#3c3c3c" : "#e0e0e0"};border-radius:999px;overflow:hidden;margin:5px 0 8px}
.mini-fill{height:100%;border-radius:999px;background:${c.accent}}
.section-list{display:none;flex:1;overflow:auto;padding:8px}
.section-list.active{display:block}
.section-row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-radius:6px;font-size:14px;transition:background .1s}
.section-row:hover{background:${isDark ? "#2a2d2e" : "#f0f0f0"}}
.section-row .sec-name{font-weight:500;font-family:monospace;font-size:14px}
.section-row .sec-size{font-weight:600;font-size:14px}
.section-bar-bg{height:6px;background:${isDark ? "#3c3c3c" : "#e0e0e0"};border-radius:3px;margin:2px 14px 10px;overflow:hidden}
.section-bar{height:100%;border-radius:3px;transition:width .4s ease}
.error-msg{color:#d16969;font-size:13px;padding:12px;display:none}
.ctx-menu{position:fixed;background:${isDark ? "#252526" : "#fff"};border:1px solid ${isDark ? "#3c3c3c" : "#e0e0e0"};border-radius:6px;padding:4px 0;z-index:2000;box-shadow:0 4px 12px rgba(0,0,0,.3);min-width:140px}
.ctx-item{padding:6px 12px;font-size:12px;cursor:pointer;color:${isDark ? "#cccccc" : "#333333"}}
.ctx-item:hover{background:${isDark ? "#094771" : "#0066b8"};color:#fff}
`;
}


/***/ }

};
;
//# sourceMappingURL=src_mapview_panel_ts.js.map