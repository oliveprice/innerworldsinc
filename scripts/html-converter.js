            /* ===========================
               HICCUP SHORTHAND CONVERTER
               ===========================
               No deps. Parses a useful subset of EDN/Hiccup:
               - Vectors: [ ... ]
               - Maps:    { :k v, "k" v, ... }
               - Keywords: :kw, :ns/kw
               - Strings:  "..."
               - Numbers, booleans, nil
               - Comments: ; ... (line)
               This is intentionally small but robust for typical Hiccup.
            */
            
            /* ---------- utils ---------- */
            const el = (id) => document.getElementById(id);
            const isWS = (ch) => ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
            const isDigit = (ch) => ch >= '0' && ch <= '9';
            const isIdentStart = (ch) => /[A-Za-z_*+\-!?<>/=.$]/.test(ch);
            const isIdent = (ch) => /[A-Za-z0-9_*+\-!?<>/=.$]/.test(ch);
            
            function die(msg, at) {
              const where = at != null ? ` at position ${at}` : '';
              throw new Error(`${msg}${where}`);
            }
            
            /* ---------- tokenizer ---------- */
            function tokenize(src) {
              const toks = [];
              let i = 0;
              const len = src.length;
            
              const push = (type, value) => toks.push({ type, value, i });
            
              while (i < len) {
                const ch = src[i];
            
                // skip whitespace
                if (isWS(ch)) { i++; continue; }
            
                // comments ; ... to EOL
                if (ch === ';') {
                  while (i < len && src[i] !== '\n') i++;
                  continue;
                }
            
                // delimiters
                if (ch === '[' || ch === ']' || ch === '{' || ch === '}' ) {
                  push('delim', ch); i++; continue;
                }
            
                // string
                if (ch === '"') {
                  let s = ''; i++; // skip opening "
                  while (i < len) {
                    const c = src[i++];
                    if (c === '"') break;
                    if (c === '\\') {
                      if (i >= len) die('Unterminated string escape', i);
                      const esc = src[i++];
                      const map = { 'n':'\n', 'r':'\r', 't':'\t', '"':'"', '\\':'\\' };
                      s += map[esc] ?? esc;
                    } else {
                      s += c;
                    }
                  }
                  push('string', s);
                  continue;
                }
            
                // keyword :abc or :ns/kw
                if (ch === ':') {
                  let s = ':'; i++;
                  while (i < len && isIdent(src[i])) s += src[i++];
                  push('keyword', s);
                  continue;
                }
            
                // number (int/float) (naive but fine)
                if (isDigit(ch) || (ch === '-' && isDigit(src[i+1]))) {
                  let s = src[i++], seenDot = false;
                  while (i < len) {
                    const c = src[i];
                    if (isDigit(c)) { s += c; i++; continue; }
                    if (c === '.' && !seenDot) { seenDot = true; s += c; i++; continue; }
                    break;
                  }
                  push('number', s);
                  continue;
                }
            
                // symbols/idents (true false nil, or tag names etc.)
                if (isIdentStart(ch)) {
                  let s = src[i++];
                  while (i < len && isIdent(src[i])) s += src[i++];
                  push('symbol', s);
                  continue;
                }
            
                // commas are whitespace in EDN
                if (ch === ',') { i++; continue; }
            
                die(`Unexpected character '${ch}'`, i);
              }
            
              return toks;
            }
            
            /* ---------- recursive descent parser ---------- */
            function parse(src) {
              const tks = tokenize(src);
              let p = 0;
            
              const peek = () => tks[p] || null;
              const take = () => tks[p++] || null;
              const want = (type, value) => {
                const t = take();
                if (!t || t.type !== type || (value != null && t.value !== value)) {
                  die(`Expected ${type}${value?` '${value}'`:''}`, t?.i);
                }
                return t;
              };
            
              function parseValue() {
                const t = peek();
                if (!t) die('Unexpected EOF');
            
                if (t.type === 'delim') {
                  if (t.value === '[') return parseVector();
                  if (t.value === '{') return parseMap();
                  die(`Unexpected delimiter '${t.value}'`, t.i);
                }
                if (t.type === 'string') { take(); return t.value; }
                if (t.type === 'number') { take(); return Number(t.value); }
                if (t.type === 'keyword') { take(); return { __kw: t.value }; }
                if (t.type === 'symbol') {
                  take();
                  if (t.value === 'nil') return null;
                  if (t.value === 'true') return true;
                  if (t.value === 'false') return false;
                  // treat other symbols as plain strings (e.g., tag names if ever needed)
                  return { __sym: t.value };
                }
            
                die(`Unexpected token '${t.type}'`, t.i);
              }
            
              function parseVector() {
                want('delim', '[');
                const arr = [];
                while (true) {
                  const t = peek();
                  if (!t) die('Unterminated vector');
                  if (t.type === 'delim' && t.value === ']') { take(); break; }
                  arr.push(parseValue());
                }
                return arr;
              }
            
              function parseMap() {
                want('delim', '{');
                const m = {};
                while (true) {
                  const t = peek();
                  if (!t) die('Unterminated map');
                  if (t.type === 'delim' && t.value === '}') { take(); break; }
                  const k = parseValue();
                  const v = parseValue();
                  m[keyToString(k)] = v;
                }
                return m;
              }
            
              function keyToString(k) {
                if (k && typeof k === 'object' && k.__kw) return k.__kw; // already like ":id"
                if (typeof k === 'string') return k;
                if (k && k.__sym) return k.__sym;
                return String(k);
              }
            
              // allow multiple top-level forms; if 1, return it; if many, return as vector of forms
              const forms = [];
              while (p < tks.length) forms.push(parseValue());
              return forms.length === 1 ? forms[0] : forms;
            }
            
            /* ---------- transformer: longhand → shorthand ---------- */
            function isKeyword(x, name) {
              return x && typeof x === 'object' && x.__kw === name;
            }
            function kwName(kw) { // ":div", ":ns/kw" -> "div" or "ns/kw"
              return kw?.__kw?.slice(1) ?? '';
            }
            function ensureKeywordTag(tagStr) { return { __kw: ':' + tagStr }; }
            function isPlainObj(o){ return o && typeof o === 'object' && !Array.isArray(o) && !o.__kw && !o.__sym; }
            
            function classesFrom(val) {
              if (!val) return [];
              if (typeof val === 'string') return val.trim().split(/\s+/).filter(Boolean);
              if (Array.isArray(val)) {
                return val.map(v => typeof v === 'string' ? v
                         : (v && v.__kw ? kwName(v) : String(v)))
                         .flatMap(s => s.split(/\s+/))
                         .filter(Boolean);
              }
              return [];
            }
            
            function mergeIdClassIntoTag(tagKw, attrs) {
              const raw = kwName(tagKw); // may be "div", or "div#x.a.b"
              let base = raw, idPart = '', clsPart = [];
            
              // parse existing shorthand bits on the tag, if any
              const m = raw.match(/^([^#.]+)(?:#([^.#]+))?(?:\.(.+))?$/);
              if (m) {
                base = m[1] || 'div';
                if (m[2]) idPart = m[2];
                if (m[3]) clsPart = m[3].split('.');
              }
            
              // lift from attrs
              const idFromAttrs = attrs[":id"];
              if (idFromAttrs && !idPart) idPart = String(idFromAttrs);
            
              const clsFromAttrs = classesFrom(attrs[":class"]);
              const mergedClasses = Array.from(new Set([...clsPart, ...clsFromAttrs]));
            
              // strip lifted keys
              const rest = { ...attrs };
              delete rest[":id"];
              delete rest[":class"];
            
              const tagStr =
                base +
                (idPart ? ('#' + idPart) : '') +
                (mergedClasses.length ? ('.' + mergedClasses.join('.')) : '');
            
              return [ensureKeywordTag(tagStr), rest];
            }
            
            function toKebab(s) {
              // handles :fontSize -> "font-size", :background-color -> "background-color"
              return String(s)
                .replace(/^:/,'')
                .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
                .replace(/_/g,'-')
                .toLowerCase();
            }
            
            function styleMapToString(v){
              if (!isPlainObj(v)) return v; // already a string or something else
              const parts = [];
              for (const [k, val] of Object.entries(v)) {
                const keyStr = k.startsWith(':') ? toKebab(k) : toKebab(k);
                const valStr = typeof val === 'string' ? val : String(val);
                parts.push(`${keyStr}: ${valStr};`);
              }
              return parts.join(' ');
            }
            
            function transform(node) {
              // vectors are Hiccup nodes; everything else pass-through
              if (Array.isArray(node) && node.length) {
                // [:tag maybe-attrs & children]
                const [t0, t1, ...restKids] = node;
            
                // tag must be a keyword like {:__kw:":div..."}
                const tagKw = (t0 && t0.__kw) ? t0 : (typeof t0 === 'string' && t0.startsWith(':') ? {__kw:t0} : t0);
                if (!tagKw || !tagKw.__kw) {
                  // Not a standard element vector; transform children anyway
                  return node.map(transform);
                }
            
                let attrs = {};
                let kids = restKids;
            
                if (isPlainObj(t1)) {
                  attrs = t1;
                } else {
                  kids = [t1, ...restKids].filter(v => v !== undefined);
                }
            
                // lift id/class to tag
                let [newTag, newAttrs] = mergeIdClassIntoTag(tagKw, attrs);
            
                // style map → string
                if (newAttrs[":style"]) {
                  newAttrs[":style"] = styleMapToString(newAttrs[":style"]);
                }
            
                // drop empty attrs map
                const attrsOut = Object.keys(newAttrs).length ? newAttrs : null;
            
                // transform children
                const kidsOut = (kids || []).map(transform);
            
                return attrsOut ? [newTag, attrsOut, ...kidsOut] : [newTag, ...kidsOut];
              }
            
              // maps inside children: still walk style maps etc.
              if (isPlainObj(node)) {
                const out = {};
                for (const [k,v] of Object.entries(node)) {
                  out[k] = (k === ":style") ? styleMapToString(v) : transform(v);
                }
                return out;
              }
            
              // scalars, strings, keywords-as-objects untouched
              return node;
            }
            
            /* ---------- pretty-printer ---------- */
            function pp(node, indent = 0, topLevel = true) {
              const pad = (n) => '  '.repeat(n);
            
              if (node && typeof node === 'object') {
                if (node.__kw) return node.__kw;
                if (node.__sym) return node.__sym;
              }
            
              if (Array.isArray(node)) {
                if (node.length === 0) return "[]";
            
                const [first, ...rest] = node;
                const firstStr = pp(first, indent + 1, false);
            
                // if tag vector
                if (first && first.__kw) {
                  let out = "[:"
                    + firstStr.slice(1); // drop the ":" already included
                  if (rest.length) {
                    out += "\n" + rest.map(n => pad(indent + 1) + pp(n, indent + 1, false)).join("\n");
                    out += "]"; // close immediately, no newline
                  } else {
                    out += "]"; // self-closing
                  }
                  return out;
                } else {
                  // generic vector
                  const inner = node.map(n => pp(n, indent + 1, false));
                  return "[" + inner.join(" ") + "]";
                }
              }
            
              if (isPlainObj(node)) {
                const entries = Object.entries(node);
                if (entries.length === 0) return "{}";
                return "{ " + entries.map(([k, v]) => `${k} ${pp(v, indent + 1, false)}`).join(" ") + " }";
              }
            
              if (typeof node === "string") {
                if (node.startsWith(":") && node.indexOf(" ") === -1) return node;
                return JSON.stringify(node);
              }
            
              if (node === null) return "nil";
              if (typeof node === "number") return String(node);
              if (typeof node === "boolean") return node ? "true" : "false";
            
              return String(node);
            }
            
            
            
            /* ---------- glue: UI handlers ---------- */
            function looksLikeHTML(s) {
              // quick heuristic: starts with "<tag" or contains closing ">" early on
              const trimmed = s.trim();
              return trimmed.startsWith("<") && /<\s*[A-Za-z]/.test(trimmed);
            }
            
            function convertNow() {
              const input = el('input').value;
              const outEl = el('output');
            
              if (!input.trim()) { outEl.value = ''; return; }
            
              try {
                let ast;
            
                if (looksLikeHTML(input)) {
                  // HTML -> longhand Hiccup AST
                  const longhandAst = htmlToHiccupAst(input);
                  // Then reuse your existing transformer to make shorthand
                  ast = transform(longhandAst);
                } else {
                  // already hiccup/edn -> shorthand
                  const parsed = parse(input);
                  ast = transform(parsed);
                }
            
                const printed = pp(ast, 0);
                outEl.value = printed;
              } catch (err) {
                outEl.value =
            `;; Parse/convert error:
            ;; ${err.message}
            
            ;; If you're pasting HTML, make sure it's valid markup.
            ;; If you're pasting Hiccup, ensure it's valid EDN/Hiccup vectors.
            `;
                console.error(err);
              }
            }
            
            
            
            function copyOutput() {
              const v = el('output').value;
              if (!v) return;
              navigator.clipboard.writeText(v).then(() => {
                flashButton('copy-output-btn');
              });
            }
            
            function clearAll() {
              el('input').value = '';
              el('output').value = '';
              flashButton('clear-btn');
            }
            
            function flashButton(id){
              const b = el(id);
              if (!b) return;
              b.style.boxShadow = '0 0 0 3px rgba(110,231,255,.25)';
              setTimeout(()=> b.style.boxShadow = '', 180);
            }
            
            /* keyboard shortcut: Cmd/Ctrl + Enter */
            document.addEventListener('keydown', (e) => {
              const meta = e.metaKey || e.ctrlKey;
              if (meta && e.key === 'Enter') {
                e.preventDefault();
                convertNow();
              }
            });
            
            /* hook up buttons (if present) */
            (() => {
              const btnConvert = el('convert-btn');
              const btnCopy = el('copy-output-btn');
              const btnClear = el('clear-btn');
            
              btnConvert && btnConvert.addEventListener('click', convertNow);
              btnCopy && btnCopy.addEventListener('click', copyOutput);
              btnClear && btnClear.addEventListener('click', clearAll);
            })();