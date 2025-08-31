            // --- HTML -> (longhand) Hiccup AST -------------------------
            
            const VOID_TAGS = new Set([
              "area","base","br","col","embed","hr","img","input",
              "link","meta","param","source","track","wbr"
            ]);
            
            function attrKey(name) {
              // html attr -> EDN keyword string like ":href", ":data-foo"
              // keep lowercase, kebab-case
              return ":" + name.replace(/([A-Z])/g, "-$1").toLowerCase();
            }
            
            function collectAttrs(el) {
              const m = {};
              for (const a of el.attributes) {
                const k = attrKey(a.name);
                if (k === ":class") {
                  // normalize class into space-separated string (your transformer handles string or vector)
                  if (a.value && a.value.trim()) m[":class"] = a.value.trim();
                } else if (k === ":id") {
                  if (a.value && a.value.trim()) m[":id"] = a.value.trim();
                } else if (k === ":style") {
                  // keep style as the raw CSS string; your transformer will leave it as string
                  if (a.value && a.value.trim()) m[":style"] = a.value.trim();
                } else {
                  // boolean-ish: HTML may give empty string for presence-only attributes
                  m[k] = a.value === "" ? true : a.value;
                }
              }
              return m;
            }
            
            function nodeToHiccup(node) {
              switch (node.nodeType) {
                case Node.ELEMENT_NODE: {
                  const tag = ":" + node.tagName.toLowerCase();
                  const attrs = collectAttrs(node);
            
                  // if classList/id missing as attributes but present on DOM, include them
                  if (!attrs[":class"] && node.classList?.length) {
                    attrs[":class"] = Array.from(node.classList).join(" ");
                  }
                  if (!attrs[":id"] && node.id) {
                    attrs[":id"] = node.id;
                  }
            
                  // children
                  const kids = [];
                  if (!VOID_TAGS.has(node.tagName.toLowerCase())) {
                    node.childNodes.forEach((ch) => {
                      const k = nodeToHiccup(ch);
                      if (k != null) kids.push(k);
                    });
                  }
            
                  // build longhand hiccup vector: [:tag {:attrs ...} ...kids]
                  const kw = { __kw: tag };
                  return Object.keys(attrs).length ? [kw, attrs, ...kids] : [kw, ...kids];
                }
            
                case Node.TEXT_NODE: {
                  // keep non-whitespace text nodes
                  const t = node.nodeValue;
                  if (t && t.replace(/\s+/g, " ").trim() !== "") {
                    return t;
                  }
                  return null;
                }
            
                case Node.COMMENT_NODE:
                  return null;
            
                default:
                  return null;
              }
            }
            
            function htmlToHiccupAst(html) {
              // Parse as a fragment so we can handle snippets (not full HTML docs)
              const doc = new DOMParser().parseFromString(html, "text/html");
              const body = doc.body;
            
              const items = [];
              body.childNodes.forEach((n) => {
                const h = nodeToHiccup(n);
                if (h != null) items.push(h);
              });
            
              // If there is exactly one root, return that vector; else return a generic vector of roots.
              return items.length === 1 ? items[0] : items;
            }
            
            // --- end HTML -> Hiccup