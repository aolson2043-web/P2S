(() => {
  'use strict';
  const query = new URLSearchParams(window.location.search);
  const destination = new URL('https://apps.apple.com/us/app/prepared-to-serve/id6806831565');
  const defaults = {utm_source: 'p2sfitness', utm_medium: 'website', utm_campaign: 'website', utm_content: 'download_page'};
  Object.keys(defaults).forEach((key) => destination.searchParams.set(key, query.get(key) || defaults[key]));
  document.getElementById('open-app-store').href = destination.href;
  let redirected = false;
  const openStore = () => {
    if (redirected) return;
    redirected = true;
    window.location.replace(destination.href);
  };
  window.setTimeout(openStore, 2000);
  if (typeof window.gtag === 'function') {
    window.gtag('event', query.get('utm_medium') === 'qr' ? 'app_store_qr_scan' : 'app_store_redirect', {
      send_to: 'G-F4FX8FFV2Y',
      link_url: destination.href,
      download_placement: destination.searchParams.get('utm_content'),
      event_callback: openStore,
      event_timeout: 2000
    });
  } else { openStore(); }
})();
