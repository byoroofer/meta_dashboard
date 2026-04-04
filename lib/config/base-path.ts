export const BASE_PATH = "/meta-dashboard";

export function withBasePath(path: string) {
  if (!path.startsWith("/")) {
    return path;
  }

  return path.startsWith(BASE_PATH) ? path : `${BASE_PATH}${path}`;
}
