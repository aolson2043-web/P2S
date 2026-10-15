# P2S website — full upload package

Upload the contents of this ZIP to the root of your existing P2S website repository. It includes all HTML, artwork, CSS, JavaScript, QR assets, CNAME, sitemap, robots.txt, and the GitHub Pages workflow. Keep the files in their existing directories. Do not upload the ZIP itself as the website.

## Included in this build

- Folder URLs throughout navigation and footer links; program cards now link to dedicated pages.
- Six program pages with duration, schedule, level, equipment and intended audience, verified against PreparedToServe 4.0.28 RC42 program definitions.
- Clear app titles/descriptions, descriptive home-page introduction, and a distinct About heading.
- MobileApplication markup on the home page and visible/structured breadcrumbs on content pages.
- Unique 1200 × 630 PNG social cards, Open Graph dimensions/alt text, and complete Twitter metadata.
- Expanded ruck/Watch information, descriptive artwork alt text, true support/privacy subheadings, and image dimensions.
- Previous Google tag G-F4FX8FFV2Y, App Store click events, Smart App Banners, QR download attribution, P2S-blue download buttons and About principle highlight.
- QR card hidden at phone screen sizes. QR landing page remains noindex and is excluded from the sitemap.
- lastmod dates in sitemap.xml.

## Hosting checks after upload

GitHub Pages cannot apply server redirects from an uploaded _redirects or .htaccess file. This package provides canonical tags and a client redirect for explicit index.html visits. For HTTP 301 redirects, use GitHub Pages HTTPS/domain settings or Cloudflare Redirect Rules.

1. Keep the custom domain set to p2sfitness.com and enable Enforce HTTPS in GitHub Pages.
2. Configure www.p2sfitness.com DNS for the same GitHub Pages site; check that https://www.p2sfitness.com/ forwards to https://p2sfitness.com/.
3. If GitHub Pages does not handle a required redirect, configure Cloudflare redirect rules for www and HTTP requests to the corresponding path on https://p2sfitness.com/. Use status 301 and preserve query strings. Cloudflare rules apply only when the relevant hostnames are proxied and SSL is correctly configured.
4. To consolidate explicit index.html requests with HTTP 301, add hosting redirect rules to their matching folder paths, for example /training/index.html → /training/ and /index.html → /. Preserve query strings. The static client redirect supplied here is a fallback and is not an HTTP 301.
5. Test home, program pages and assets on desktop and iPhone after deployment. HTTP and www checks could not be performed from this build environment.

## Support address

The site retains aodigital.lab@gmail.com so support messages continue to reach the confirmed inbox. Create support@p2sfitness.com and verify forwarding/delivery before replacing the current address. An uploaded website cannot provision the mailbox.

## Search Console and Bing

After deployment, submit https://p2sfitness.com/sitemap.xml in Google Search Console and Bing Webmaster Tools. Inspect https://p2sfitness.com/ and request indexing, then inspect the six new program pages. Submission requires your verified webmaster accounts and was not performed by this ZIP build.

New pages:
- /training/operational-strength/
- /training/forged-performance/
- /training/bodyweight-warrior/
- /training/forged-operator/
- /training/gladiator-standard/
- /training/back-in-the-fight/

## App Store Connect

Verify the Support URL is https://p2sfitness.com/support/ and the Marketing URL is https://p2sfitness.com/. Keep the Privacy Policy URL at https://p2sfitness.com/privacy/. The home schema describes the $49.99 USD offer as the optional lifetime Pro unlock, not an automatic trial charge. Current App Store pricing and the listing’s website links could not be independently fetched; confirm them in App Store Connect.


## Pricing, Terms and exercise-risk update

The About closing actions are now spaced apart with an outlined training button and a blue download button. The same spacing treatment applies to other closing sections with adjacent buttons. Download cards and the home hero explain free download, the 7-day trial, and the $49.99 USD one-time lifetime Pro unlock. Compact header/footer logo sizing is preserved.

New pages: /terms/ and /disclaimer/. Both are linked from the footer. Training and ruck pages also link directly to exercise-risk information. The sitemap includes both new pages.

These are general legal and fitness-risk drafts for your review, not a legal opinion or a guarantee of enforceability. Have a qualified attorney review them before relying on them, including the correct legal identity of the operator and the terms applicable in your markets. The pages preserve mandatory consumer rights and avoid a blanket injury release. They do not replace Apple’s applicable app license. Adding a website notice alone does not establish that an app user saw or accepted it.

For a future app build, consider links to these pages in Settings and a clear acknowledgment of training risks before the first workout. This website update does not alter the app or App Store Connect license settings.

References checked: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/ and https://developer.apple.com/help/app-store-connect/manage-app-information/provide-a-custom-license-agreement/ . General exercise safety reference: https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/exercise/art-20048389 .
