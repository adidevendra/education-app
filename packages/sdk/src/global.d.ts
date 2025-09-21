export {};

declare global {
  interface RequestInit {
    /** Optional bearer token forwarded by the SDK runtime */
    token?: string;
    /** Override base URL per request */
    baseUrl?: string;
  }
}
