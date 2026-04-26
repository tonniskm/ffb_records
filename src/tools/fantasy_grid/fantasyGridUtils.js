import { CleanName } from '../calculations/other'
import { getCategoryDisplayInfo } from '../shared/categoryDefinitions'
import { getFantasyGridCategoryModeLabel, normalizeFantasyGridValue } from './gridHelpers'

export function getCellKey(rowOwner, colOwner) {
  return `${rowOwner}__${colOwner}`
}

export function getWrongGuessLabel(validation, rawGuess) {
  if (validation.displayName) {
    return validation.displayName
  }
  return (rawGuess ?? '').toString().trim()
}

export function getCategoryDetails(categoryName, categoryTypes, puzzle, gridData) {
  return getCategoryDisplayInfo(categoryName, categoryTypes, puzzle, gridData)
}

function normalizeSearchText(value) {
  return normalizeFantasyGridValue(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function compactSearchText(value) {
  return normalizeFantasyGridValue(value).replace(/[^a-z0-9]+/g, '')
}

export function createPlayerSearchMatcher(searchValue) {
  const rawSearch = (searchValue ?? '').toString().trim()
  if (!rawSearch) {
    return () => false
  }

  const normalizedSearch = normalizeSearchText(rawSearch)
  const cleanedSearch = normalizeSearchText(CleanName(rawSearch))
  const compactSearch = compactSearchText(rawSearch)
  const compactCleanedSearch = compactSearchText(CleanName(rawSearch))
  const spacedPhraseTerms = Array.from(new Set([normalizedSearch, cleanedSearch].filter(Boolean)))
  const phraseTerms = Array.from(new Set([
    ...spacedPhraseTerms,
    compactSearch,
    compactCleanedSearch,
  ].filter(Boolean)))
  const tokenTerms = Array.from(new Set(
    spacedPhraseTerms.flatMap(term => term.split(' ').filter(Boolean))
  ))

  return function matchesPlayerName(playerName) {
    const normalizedPlayerName = normalizeSearchText(playerName)
    const cleanedPlayerName = normalizeSearchText(CleanName(playerName))
    const compactPlayerName = compactSearchText(playerName)
    const compactCleanedPlayerName = compactSearchText(CleanName(playerName))
    const playerVariants = [
      normalizedPlayerName,
      cleanedPlayerName,
      compactPlayerName,
      compactCleanedPlayerName,
    ]

    if (phraseTerms.some(term => playerVariants.some(nameVariant => nameVariant.includes(term)))) {
      return true
    }

    return tokenTerms.length > 0 && playerVariants.some(nameVariant => tokenTerms.every(term => nameVariant.includes(term)))
  }
}

export function getRecentDateKeys(numberOfDays) {
  function toLocalDateKey(dateValue) {
    const year = dateValue.getFullYear()
    const month = String(dateValue.getMonth() + 1).padStart(2, '0')
    const day = String(dateValue.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const dates = []
  const baseDate = new Date()
  baseDate.setHours(0, 0, 0, 0)

  for (let offset = 0; offset < numberOfDays; offset += 1) {
    const nextDate = new Date(baseDate)
    nextDate.setDate(baseDate.getDate() - offset)
    dates.push(toLocalDateKey(nextDate))
  }

  return dates
}

export function getDateOptionLabel(dateKey, index) {
  const modeLabel = getFantasyGridCategoryModeLabel(dateKey)
  if (index === 0) {
    return modeLabel ? `Today (${dateKey}) - ${modeLabel}` : `Today (${dateKey})`
  }
  if (index === 1) {
    return modeLabel ? `Yesterday (${dateKey}) - ${modeLabel}` : `Yesterday (${dateKey})`
  }
  return modeLabel ? `${dateKey} - ${modeLabel}` : dateKey
}

export function getFeedbackMessage(reason, displayName, rowOwner, colOwner, answerCount) {
  if (reason === 'correct') {
    return `${displayName} works for ${rowOwner} x ${colOwner}.`
  }
  if (reason === 'empty') {
    return 'Pick a square and enter a player name.'
  }
  if (reason === 'unknown-player') {
    return 'That player is not in this league history.'
  }
  if (reason === 'already-used') {
    return `${displayName} has already been used in another square.`
  }
  if (reason === 'wrong-cell') {
    return `${displayName} was not owned by both ${rowOwner} and ${colOwner}. ${answerCount} valid answers exist for this square.`
  }
  return 'Select a square to start playing.'
}

function toNumberOrNull(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

function getSortableMetricValueForCategory({ categoryName, otherCategory, categoryTypes, gridData, playerKey }) {
  const categoryType = categoryTypes?.[categoryName]
  const otherType = categoryTypes?.[otherCategory]

  if (categoryType === 'owner') {
    const years = gridData?.playerYearsByOwner?.[playerKey]?.[categoryName]
    return Array.isArray(years) ? years.length : 0
  }

  if (categoryType === 'many-starts') {
    if (otherType === 'owner') {
      return toNumberOrNull(gridData?.playerStartsByOwner?.[playerKey]?.[otherCategory])
    }
    return toNumberOrNull(gridData?.playerTotalStarts?.[playerKey])
  }

  if (categoryType === 'big-game') {
    if (otherType === 'owner') {
      return toNumberOrNull(gridData?.playerBestScoreByOwner?.[playerKey]?.[otherCategory])
    }
    return toNumberOrNull(gridData?.playerHighScore?.[playerKey])
  }

  if (categoryType === 'champ') {
    if (otherType === 'owner') {
      return toNumberOrNull(gridData?.playerChampionshipsByOwner?.[playerKey]?.[otherCategory])
    }
    return toNumberOrNull(gridData?.playerChampionships?.[playerKey])
  }

  if (categoryType === 'loser') {
    if (otherType === 'owner') {
      return toNumberOrNull(gridData?.playerDeweyDoesTimesByOwner?.[playerKey]?.[otherCategory])
    }
    return toNumberOrNull(gridData?.playerDeweyDoesTimes?.[playerKey])
  }

  if (categoryType === 'huge-year') {
    if (otherType === 'owner') {
      return toNumberOrNull(gridData?.playerMaxStartScoreInYearByOwner?.[playerKey]?.[otherCategory])
    }
    return toNumberOrNull(gridData?.playerMaxStartScoreInYear?.[playerKey])
  }

  if (categoryType === 'winning-record') {
    if (otherType === 'owner') {
      return toNumberOrNull(gridData?.playerWinningRateByOwner?.[playerKey]?.[otherCategory])
    }
    return toNumberOrNull(gridData?.playerWinningRate?.[playerKey])
  }

  if (categoryType === 'bench-warmer') {
    if (otherType === 'owner') {
      const benches = toNumberOrNull(gridData?.playerBenchesByOwner?.[playerKey]?.[otherCategory]) ?? 0
      const starts = toNumberOrNull(gridData?.playerStartsByOwnerForBenchWarmer?.[playerKey]?.[otherCategory]) ?? 0
      return benches - starts
    }
    const benches = toNumberOrNull(gridData?.playerBenches?.[playerKey]) ?? 0
    const starts = toNumberOrNull(gridData?.playerStarts?.[playerKey]) ?? 0
    return benches - starts
  }

  if (categoryType === 'sojourner') {
    return toNumberOrNull(gridData?.playerTeamCount?.[playerKey])
  }

  if (categoryType === 'experienced') {
    if (otherType === 'owner') {
      return toNumberOrNull(gridData?.playerExperienceYearsByOwner?.[playerKey]?.[otherCategory])
    }
    return toNumberOrNull(gridData?.playerYears?.[playerKey])
  }

  if (categoryType === 'negative-scorer') {
    if (otherType === 'owner') {
      return toNumberOrNull(gridData?.playerTimesNegativeByOwner?.[playerKey]?.[otherCategory])
    }
    return toNumberOrNull(gridData?.playerTimesNegative?.[playerKey])
  }

  return null
}

function getCategoryRankingData({ gridData, categoryName, otherCategory, answers }) {
  const categoryTypes = gridData?.categoryTypes ?? {}
  const scoredAnswers = answers
    .map(answer => ({
      answer,
      metricValue: getSortableMetricValueForCategory({
        categoryName,
        otherCategory,
        categoryTypes,
        gridData,
        playerKey: answer.key,
      }),
    }))

  const sortableValues = scoredAnswers
    .map(item => item.metricValue)
    .filter(value => value !== null)

  if (sortableValues.length !== answers.length) {
    return null
  }

  const sortedScoredAnswers = [...scoredAnswers].sort((a, b) => {
    if (b.metricValue !== a.metricValue) {
      return b.metricValue - a.metricValue
    }
    return a.answer.name.localeCompare(b.answer.name)
  })

  const rankByPlayerKey = {}
  let previousValue = null
  let previousRank = 0
  sortedScoredAnswers.forEach((item, index) => {
    const isSameAsPrevious = previousValue !== null && item.metricValue === previousValue
    const rank = isSameAsPrevious ? previousRank : index + 1
    rankByPlayerKey[item.answer.key] = rank
    previousValue = item.metricValue
    previousRank = rank
  })

  return {
    categoryName,
    answers: sortedScoredAnswers.map(item => item.answer),
    rankByPlayerKey,
  }
}

export function getCellSortingData({ gridData, rowCategory, colCategory, answers, sortBy }) {
  const rowRanking = getCategoryRankingData({
    gridData,
    categoryName: rowCategory,
    otherCategory: colCategory,
    answers,
  })
  const colRanking = getCategoryRankingData({
    gridData,
    categoryName: colCategory,
    otherCategory: rowCategory,
    answers,
  })

  const availableSorts = [
    ...(rowRanking ? ['row'] : []),
    ...(colRanking ? ['col'] : []),
  ]
  const defaultSortBy = rowRanking ? 'row' : (colRanking ? 'col' : '')
  const resolvedSortBy = availableSorts.includes(sortBy) ? sortBy : defaultSortBy

  const displayedAnswers =
    resolvedSortBy === 'row' && rowRanking
      ? rowRanking.answers
      : resolvedSortBy === 'col' && colRanking
        ? colRanking.answers
        : answers

  return {
    displayedAnswers,
    rowRanking,
    colRanking,
    availableSorts,
    resolvedSortBy,
  }
}