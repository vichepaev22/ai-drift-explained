/**
 * Deterministic, side-effect-free comparison calculations.
 * A paper may contain many claims from the same topic; count the paper only once.
 */
export function buildProfile(members, papers, config, topicCount = 98) {
  const y0 = Number(config.y0), y1 = Number(config.y1);
  if (!Number.isInteger(y0) || !Number.isInteger(y1) || y0 > y1) {
    throw new RangeError('Начальный год должен быть не позже конечного');
  }
  if (!Number.isInteger(topicCount) || topicCount < 1) {
    throw new RangeError('Некорректное количество тематических групп');
  }
  const totalPapers = papers?.id?.length ?? papers?.year?.length ?? 0;
  if (!members?.paper || !members?.cluster || members.paper.length !== members.cluster.length ||
      !papers?.year || !papers?.venue || papers.year.length !== totalPapers ||
      papers.venue.length !== totalPapers) {
    throw new TypeError('Несогласованные массивы публикаций и утверждений');
  }
  const venue = String(config.venue || 'all').toUpperCase();
  const allowed = new Uint8Array(totalPapers);
  const countClaims = new Uint32Array(topicCount);
  const countPapers = new Uint32Array(topicCount);
  let paperTotal = 0, claimTotal = 0;
  for (let p = 0; p < totalPapers; p++) {
    const year = Number(papers.year[p]);
    if (year >= y0 && year <= y1 &&
        (venue === 'ALL' || String(papers.venue[p]).toUpperCase() === venue)) {
      allowed[p] = 1;
      paperTotal++;
    }
  }
  const seenPaperTopic = new Set();
  for (let i = 0; i < members.paper.length; i++) {
    const p = Number(members.paper[i]);
    if (!Number.isInteger(p) || p < 0 || p >= totalPapers || !allowed[p]) continue;
    claimTotal++;
    const id = Number(members.cluster[i]);
    if (!Number.isInteger(id) || id < 0 || id >= topicCount) continue;
    countClaims[id]++;
    const key = p * topicCount + id;
    if (!seenPaperTopic.has(key)) {
      seenPaperTopic.add(key);
      countPapers[id]++;
    }
  }
  return {papers:paperTotal, claims:claimTotal, countClaims, countPapers};
}
