(() => {
  const path = window.location.pathname;
  if (path.endsWith('/index.html')) {
    window.location.replace(path.slice(0, -10) + window.location.search + window.location.hash);
  }
})();
