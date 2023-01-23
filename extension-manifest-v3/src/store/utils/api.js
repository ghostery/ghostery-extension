import * as cookies from './cookies.js';

const ACCOUNT_URL = 'https://accountapi.ghosterystage.com/api/v2.1.0';
const AUTH_URL = 'https://consumerapi.ghosterystage.com/api/v2';

const COOKIE_SHORT_DURATION = 60 * 60 * 24; // 1 day in seconds

export async function get(url) {
  const accessToken = await cookies.get('access_token');
  const csrfToken = await cookies.get('csrf_token');

  if (!accessToken || !csrfToken) throw Error('Unauthorized');

  const res = await fetch(`${ACCOUNT_URL}/${url}`, {
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${accessToken.value}`,
      'X-CSRF-Token': csrfToken.value,
    },
    credentials: 'omit',
  });

  if (res.ok) {
    return res.json();
  }

  throw res;
}

export async function session() {
  const userId = await cookies.get('user_id');
  if (!userId) return undefined;

  if (!(await cookies.get('access_token'))) {
    const refreshToken = await cookies.get('refresh_token');

    if (!refreshToken) {
      cookies.set('user_id', undefined);
      cookies.set('csrf_token', undefined);

      throw Error('Unauthorized');
    }

    const res = await fetch(`${AUTH_URL}/refresh_token`, {
      method: 'post',
      headers: {
        UserId: userId.value,
        RefreshToken: refreshToken.value,
      },
      credentials: 'omit',
    });

    if (res.ok) {
      const data = await res.json();

      await Promise.all([
        cookies.set('user_id', data.user_id),
        cookies.set('refresh_token', data.refresh_token),
        cookies.set('access_token', data.access_token, COOKIE_SHORT_DURATION),
        cookies.set('csrf_token', data.csrf_token, COOKIE_SHORT_DURATION),
      ]);
    } else {
      throw res;
    }
  }

  return userId;
}
