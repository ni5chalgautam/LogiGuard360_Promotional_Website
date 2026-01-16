/* LogiGuard360 - Shared Search & Nav Behaviour (added) */
(function(){
  const routes = [
    { label: "Home", href: "index.html", keywords: ["home","dashboard","logiguard","logiguard360"] },
    { label: "Overview", href: "overview.html", keywords: ["overview","project","about","brief","problem"] },
    { label: "Features", href: "features.html", keywords: ["features","feature","quiz","hotspot","phishing","game","scoring"] },
    { label: "How It Works", href: "workflow.html", keywords: ["how","works","workflow","flow","process","journey"] },
    { label: "Technology", href: "technology.html", keywords: ["technology","tech","stack","tools","framework","libraries"] },
    { label: "Appendix", href: "appendix.html", keywords: ["appendix","references","reference","sources","citations"] }
  ];

  function getQuery(){
    const sp = new URLSearchParams(location.search);
    return (sp.get("q") || "").trim();
  }

  function setQueryInUrl(q){
    const url = new URL(location.href);
    if(q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    history.replaceState({}, "", url.toString());
  }

  function bestRoute(q){
    const lower = q.toLowerCase();
    for(const r of routes){
      if(r.keywords.some(k => lower.includes(k))) return r;
    }
    return null;
  }

  function clearHighlights(root){
    const marks = root.querySelectorAll("mark.lg-mark");
    marks.forEach(m => {
      const text = document.createTextNode(m.textContent || "");
      m.replaceWith(text);
    });
  }

  function highlightFirst(root, q){
    if(!q) return false;
    const query = q.toLowerCase();
    // walk text nodes
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        if(!node.nodeValue) return NodeFilter.FILTER_REJECT;
        const v = node.nodeValue.trim();
        if(!v) return NodeFilter.FILTER_REJECT;
        if(v.toLowerCase().includes(query)) return NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_SKIP;
      }
    });
    const node = walker.nextNode();
    if(!node) return false;

    const text = node.nodeValue;
    const idx = text.toLowerCase().indexOf(query);
    if(idx < 0) return false;

    const before = document.createTextNode(text.slice(0, idx));
    const match = document.createElement("mark");
    match.className = "lg-mark";
    match.style.background = "rgba(0,245,255,0.25)";
    match.style.color = "inherit";
    match.style.padding = "0 2px";
    match.style.borderRadius = "6px";
    match.textContent = text.slice(idx, idx + q.length);
    const after = document.createTextNode(text.slice(idx + q.length));

    const parent = node.parentNode;
    parent.replaceChild(after, node);
    parent.insertBefore(match, after);
    parent.insertBefore(before, match);

    match.scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  }

  function handleSearch(q){
    const query = (q || "").trim();
    if(!query) return;

    const route = bestRoute(query);
    if(route){
      window.location.href = route.href + "?q=" + encodeURIComponent(query);
      return;
    }
    // If no clear route, stay on current page and highlight, or fallback to features.
    const main = document.querySelector("main") || document.querySelector(".container") || document.body;
    clearHighlights(main);
    const ok = highlightFirst(main, query);
    if(!ok && !location.pathname.endsWith("features.html")){
      window.location.href = "features.html?q=" + encodeURIComponent(query);
    }else{
      setQueryInUrl(query);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll("input.global-search, .search-bar input[type='text']");
    inputs.forEach(inp => {
      inp.addEventListener("keydown", (e) => {
        if(e.key === "Enter"){
          e.preventDefault();
          handleSearch(inp.value);
        }
      });
    });

    const q = getQuery();
    if(q){
      inputs.forEach(inp => { if(!inp.value) inp.value = q; });
      const main = document.querySelector("main") || document.querySelector(".container") || document.body;
      clearHighlights(main);
      highlightFirst(main, q);
    }
  });
})();