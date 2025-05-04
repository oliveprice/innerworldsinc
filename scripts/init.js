const scripts = [
  "./chapters-animation.js",
  "./hover.js",
  "./load.js",
  "./opener.js",
  "./moving-parts.js",
  "./change-log.js"
];

scripts.forEach(name => {
  const script = document.createElement("script");
  script.src = `./scripts/${name}`;
  script.defer = true;
  document.body.appendChild(script);
});
