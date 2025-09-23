// src/services/googleQuestions.js
const APPS_SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE'; // <-- EDIT

export async function fetchQuestionsFromGoogle() {
  const r = await fetch(APPS_SCRIPT_URL, { method: 'GET' });
  if (!r.ok) throw new Error('Failed to load questions from Google');
  const data = await r.json();
  return data.rows || [];
}

/** Map your filter UI → question fields */
export function makeFilterPredicate(filters) {
  const codeMap = {
    all: () => true,
    ASCE: q => /^ASCE 7/.test(q.code_source),
    AISC: q => q.code_source === 'AISC' || /^AISC Seismic/.test(q.code_source),
    ACI : q => q.code_source === 'ACI 318',
    IBC : q => q.code_source === 'IBC',
    TMS : q => q.code_source === 'TMS 402',
    // keep these even if you don't have data yet:
    NDS : q => /NDS/.test(q.code_source),
    CBC : q => /CBC/.test(q.code_source),
    UBC : q => /UBC/.test(q.code_source),
  };

  const matMap = {
    all: () => true,
    steel:     q => /steel/i.test(q.material_type)     || /AISC/.test(q.code_source),
    concrete:  q => /concrete/i.test(q.material_type)  || q.code_source === 'ACI 318',
    masonry:   q => /masonry/i.test(q.material_type)   || q.code_source === 'TMS 402',
    wood:      q => /wood/i.test(q.material_type)      || /NDS/.test(q.code_source),
    general:   q => /general/i.test(q.material_type)   || q.code_source === 'IBC',
  };

  const themeMap = {
    all: () => true,
    seismic:        q => /seismic/i.test(q.theme) || /seismic/i.test(q.code_source),
    wind:           q => /wind/i.test(q.theme),
    gravity:        q => /gravity/i.test(q.theme),
    connections:    q => /connection/i.test(q.theme) || q.code_source === 'AISC',
    design_theory:  q => /theory/i.test(q.theme),
    general_code:   q => /general/i.test(q.theme) || q.code_source === 'IBC',
  };

  const diffMap = {
    all: () => true,
    easy:        q => q.difficulty === 'easy',
    medium:      q => q.difficulty === 'medium',
    hard:        q => q.difficulty === 'hard',
    impossible:  q => q.difficulty === 'impossible',
  };

  return q =>
    (codeMap[filters.code_source] || codeMap.all)(q) &&
    (matMap[filters.material_type] || matMap.all)(q) &&
    (themeMap[filters.theme] || themeMap.all)(q) &&
    (diffMap[filters.difficulty] || diffMap.all)(q);
}
