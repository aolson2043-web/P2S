# P2S Fitness — GitHub Pages deployment

This folder is ready to publish as the P2S website. It includes the Privacy Policy at `/privacy/`, Support at `/support/`, the complete site, a GitHub Pages Actions workflow, and the custom-domain file for `p2sfitness.com`.

## Publish

1. Create or choose a GitHub repository for the P2S website.
2. Upload the **contents of this folder** to the repository root (including `.github/workflows/pages.yml` and `CNAME`).
3. Use the `main` branch. In **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**.
4. Confirm that GitHub Pages shows a successful deployment.
5. In **Settings → Pages → Custom domain**, set `p2sfitness.com` and enable **Enforce HTTPS** once GitHub marks it available.
6. At the domain’s DNS provider, point `p2sfitness.com` to GitHub Pages and, if you want `www.p2sfitness.com`, add its CNAME to the GitHub Pages hostname shown in the repository settings.

The workflow deploys the repository root whenever changes are pushed to `main`. App Store Connect URLs after the domain is active:

- Privacy Policy: https://p2sfitness.com/privacy/
- Support: https://p2sfitness.com/support/

After the GitHub Pages deployment completes and DNS is configured, the URLs above will be live.
