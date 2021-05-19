const defaultTitle = process.env.VUE_APP_TITLE || "TITLE";

export default function getPageTitle(pageTitle: string) {
  if (pageTitle) {
    return pageTitle + " - " + defaultTitle;
  }
  return defaultTitle;
}
