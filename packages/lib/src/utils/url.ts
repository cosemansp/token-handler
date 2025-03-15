export function getLastPathSegment(url: string) {
  const urlObject = new URL(url);
  const path = urlObject.pathname;
  const pathSegments = path.split('/').filter((segment) => segment !== ''); // Split and remove empty segments
  return pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : '';
}
