const GITHUB_CODE_NAME = 'github_code';
const LATEST_CSRF_TOKEN = 'latest_csrf_token';

export const setGithubCode = (code: string) => {
  if (localStorage.getItem(GITHUB_CODE_NAME)) {
    return;
  }

  localStorage.setItem(GITHUB_CODE_NAME, code);
};

export const getGithubCode = () => {
  return localStorage.getItem(GITHUB_CODE_NAME);
};

export const setLatestCsrf = (csrf: string) => {
  if (localStorage.getItem(LATEST_CSRF_TOKEN)) {
    return;
  }

  localStorage.setItem(LATEST_CSRF_TOKEN, csrf);
};

export const getLatestCsrf = () => {
  return localStorage.getItem(LATEST_CSRF_TOKEN);
};

export const removeLatestCsrf = () => {
  localStorage.removeItem(LATEST_CSRF_TOKEN);
};
