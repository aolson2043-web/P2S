(() => {
  'use strict';
  const MEASUREMENT_ID = 'G-F4FX8FFV2Y';
  document.addEventListener('click', (event) => {
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link || event.defaultPrevented) return;
    let url;
    try { url = new URL(link.href, window.location.href); } catch (_) { return; }
    if (typeof window.gtag !== 'function') return;
    if (link.hasAttribute('data-merch-link') && url.hostname === 'prepared-to-serve-shop.fourthwall.com') {
      window.gtag('event', 'fourthwall_product_click', {
        send_to: MEASUREMENT_ID, link_url: url.href,
        product: link.dataset.merchLink || 'p2s_gear',
        link_text: (link.textContent || '').trim().slice(0, 100),
        page_path: window.location.pathname,
        placement: url.searchParams.get('utm_content') || 'merch_link'
      });
      return;
    }
    if (url.hostname !== 'apps.apple.com' || !/\/id6806831565(?:\/|$)/.test(url.pathname)) return;
    const parameters = {
      send_to: MEASUREMENT_ID,
      link_url: url.href,
      link_text: (link.textContent || link.getAttribute('aria-label') || '').trim().slice(0, 100),
      download_placement: url.searchParams.get('utm_content') || 'app_store_link',
      download_page: window.location.pathname
    };
    const sameTab = (!link.target || link.target === '_self') && event.button === 0 &&
      !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && !link.hasAttribute('download');
    if (sameTab) {
      event.preventDefault();
      let navigated = false;
      const navigate = () => {
        if (navigated) return;
        navigated = true;
        window.location.assign(url.href);
      };
      parameters.event_callback = navigate;
      parameters.event_timeout = 800;
      window.setTimeout(navigate, 800);
    }
    window.gtag('event', 'app_store_click', parameters);
  });
})();
