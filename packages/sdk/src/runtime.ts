export interface AuthorizedFetcherOptions extends RequestInit {
  /** Optional bearer token that will be inserted into the Authorization header */
  token?: string;
  /** Override base URL if different from environment default */
  baseUrl?: string;
}

const defaultBaseUrl =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || ''
    : '';

function buildHeaders(initHeaders?: RequestInit['headers'], token?: string) {
  const headers = new Headers(initHeaders || undefined);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

export async function authorizedFetcher<TResponse>(
  url: string,
  init?: AuthorizedFetcherOptions,
): Promise<TResponse> {
  const { token, baseUrl, headers: initHeaders, ...rest } = init || {};
  const headers = buildHeaders(initHeaders, token);

  if (rest.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const resolvedBaseUrl = (baseUrl ?? defaultBaseUrl).replace(/\/$/, '');
  const response = await fetch(`${resolvedBaseUrl}${url}`, {
    ...rest,
    headers,
    credentials: rest.credentials ?? 'include',
  });

  if (!response.ok) {
    let errorPayload: unknown;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      errorPayload = await response.json().catch(() => undefined);
    } else {
      errorPayload = await response.text().catch(() => undefined);
    }

    const error = new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    ) as Error & { status?: number; payload?: unknown };
    error.status = response.status;
    error.payload = errorPayload;
    throw error;
  }

  if (response.status === 204) {
    return undefined as unknown as TResponse;
  }

  const responseContentType = response.headers.get('content-type') || '';
  if (responseContentType.includes('application/json')) {
    return (await response.json()) as TResponse;
  }

  return (await response.text()) as unknown as TResponse;
}
