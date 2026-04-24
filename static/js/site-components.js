class SiteFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
<footer>
    <a href="terms.html">Terms of Use</a> |
    <a href="privacy.html">Privacy Policy</a>
    <span>© 2024-2026 All rights reserved by Rodolfo Motta Saraiva - </span><span id="authorlink"><a href="https://rmsaraiva.com/">RMSaraiva.com</a></span>
</footer>`;
    }
}
customElements.define('site-footer', SiteFooter);
