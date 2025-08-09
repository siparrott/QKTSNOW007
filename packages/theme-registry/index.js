import themes from './themes.json' assert { type: 'json' };

export function getThemes() {
  return themes.themes;
}

export function getThemeById(id) {
  return themes.themes.find(theme => theme.id === id);
}

export function getThemeLabel(id) {
  const theme = getThemeById(id);
  return theme ? theme.label : 'Unknown Theme';
}

export { themes };