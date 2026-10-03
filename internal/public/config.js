/* 3HUE Enterprise Hub — runtime configuration.
 *
 * Safe to commit: there are no secrets here. An Entra "client id" and SharePoint site/list ids are
 * public identifiers — access to the inventory is enforced by Microsoft sign-in plus SharePoint
 * permissions, never by hiding these values. See internal/README.md → "Connecting SharePoint".
 */
window.HUB_CONFIG = {
  portalName: "3HUE Enterprise Hub",

  /* Where "Request access" mails go when a tile has no ownerEmail of its own. */
  requestAccessEmail: "info@3hue.net",

  sharepoint: {
    /* Team site that holds the Document & Artifact Inventory (managed by Teriah). */
    siteUrl: "https://3hue.sharepoint.com/sites/InternalAssets",
    libraryUrl:
      "https://3hue.sharepoint.com/sites/InternalAssets/Shared%20Documents/Forms/AllItems.aspx",
    hostname: "3hue.sharepoint.com",
    sitePath: "/sites/InternalAssets",

    /* The list to read. listId (GUID) wins over listName when both are set. */
    listName: "Document & Artifact Inventory",
    listId: "",

    /* Microsoft Entra app registration (single-page application) with redirect URI
     * https://hub.3hue.net/ (plus http://localhost:8787/ for wrangler dev).
     * Leave clientId empty to keep the portal in preview mode (sample data, no Graph sign-in). */
    tenantId: "",
    clientId: "",
    scopes: ["Sites.Read.All"],

    pageSize: 200,
    cacheMinutes: 10,

    /* SharePoint column internal names → portal fields. Create the columns with these exact
     * internal names (no spaces) first, then rename the display names freely. */
    fieldMap: {
      title: "Title",
      category: "Category",
      system: "System",
      owner: "Owner",
      classification: "Classification",
      status: "Status",
      version: "Version",
      link: "Link",
      location: "Location",
      lastReviewed: "LastReviewed",
      nextReview: "NextReview",
      audience: "Audience",
      tags: "Tags",
      description: "Description",
    },
  },

  /* Sample records used until the SharePoint list is connected. */
  sampleInventoryUrl: "data/inventory.sample.json",
};
