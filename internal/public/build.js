/* Build marker shared by the Worker and the browser app.
 * Bump it whenever portal.js / index.html change in a way users should notice. The Worker reports
 * it from /api/me; the page compares and offers a reload when its own copy is older. */
export const HUB_BUILD = "2026.10.04-02";
