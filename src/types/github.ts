export interface GithubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string; // usually empty
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: "User" | "Bot" | "Organization";
  user_view_type?: string; // e.g. "public"
  site_admin: boolean;
}

export interface ReleaseAssetUploader extends GithubUser {}

export interface ReleaseAsset {
  url: string;
  id: number;
  node_id: string;
  name: string;
  label: string;
  uploader: ReleaseAssetUploader;
  content_type: string; // e.g. "application/zip"
  state: "uploaded" | "draft";
  size: number; // in bytes
  digest: string | null; // SHA‑1 or SHA256 hash if present
  download_count: number;
  created_at: string; // ISO8601 datetime
  updated_at: string; // ISO8601 datetime
  browser_download_url: string;
}

export interface GithubRelease {
  url: string;
  assets_url: string;
  upload_url: string; // contains templated part
  html_url: string;
  id: number;
  author: GithubUser;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string | null;
  draft: boolean;
  prerelease: boolean;
  created_at: string; // ISO8601
  updated_at: string; // ISO8601
  published_at: string; // ISO8601
  assets: ReleaseAsset[];
  tarball_url: string;
  zipball_url: string;
  body: string | null;
}
