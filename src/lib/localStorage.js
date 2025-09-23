export const loadSession = () => {
  try {
    return JSON.parse(localStorage.getItem('ugmt_session')) || {
      attempts: [],
      settings: { countSimplification: true, keepOnReload: false }
    };
  } catch (e) {
    return { attempts: [], settings: { countSimplification: true, keepOnReload: false } };
  }
};

export const saveSession = (s) => {
  localStorage.setItem('ugmt_session', JSON.stringify(s));
};

export const resetSession = () => {
  localStorage.removeItem('ugmt_session');
};
