const GITHUB_CODE_NAME = 'GITHUB_CODE';

export const setGithubCode = (code: string) => {
  if (localStorage.getItem(GITHUB_CODE_NAME)) {
    return;
  }

  localStorage.setItem(GITHUB_CODE_NAME, code);
};

export const getGithubCode = () => {
  return localStorage.getItem(GITHUB_CODE_NAME);
};
