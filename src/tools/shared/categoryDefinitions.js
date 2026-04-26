/**
 * Centralized category definitions and display information.
 * This file contains all metadata about categories used in games,
 * making it easy to update category information in one place.
 */

import {
  BENCH_WARMER_CATEGORY_NAME,
  BIG_GAME_CATEGORY_NAME,
  CHAMP_CATEGORY_NAME,
  EXPERIENCED_CATEGORY_NAME,
  HUGE_YEAR_CATEGORY_NAME,
  LOSER_CATEGORY_NAME,
  MANY_STARTS_CATEGORY_NAME,
  NEGATIVE_SCORER_CATEGORY_NAME,
  SOJOURNER_CATEGORY_NAME,
  WINNING_RECORD_CATEGORY_NAME,
} from './categoryData'

const HUGE_YEAR_THRESHOLD = 200
const WINNING_RECORD_THRESHOLD = 0.5
const SOJOURNER_TEAMS_THRESHOLD = 6
const EXPERIENCED_TOTAL_YEARS_THRESHOLD = 7
const EXPERIENCED_OWNER_YEARS_THRESHOLD = 5

function formatYearList(years) {
  if (!Array.isArray(years) || years.length === 0) {
    return 'Never'
  }
  return years.join(', ')
}

function getBigGameThresholdByPosition(position) {
  return position === 'QB' ? 30 : 20
}

function formatDecimal2(value) {
  return (Math.round((Number(value) || 0) * 100) / 100).toFixed(2)
}

function formatWinRate(value) {
  return formatDecimal2(value)
}

function formatHugeYearMetadata(meta) {
  const value = formatDecimal2(meta?.value)
  const years = Array.isArray(meta?.years) ? meta.years : []
  if (years.length === 0) {
    return `${value}`
  }
  return `${years.join(', ')} (${value})`
}

function getPairedCategoriesForCategory(categoryName, categoryTypes, puzzle) {
  const isRowCategory = puzzle?.rowOwners?.includes(categoryName)
  const pairedCategories = isRowCategory ? (puzzle?.colOwners || []) : (puzzle?.rowOwners || [])
  const ownerPairs = pairedCategories.filter(cat => categoryTypes?.[cat] === 'owner')
  const nonOwnerPairs = pairedCategories.filter(cat => categoryTypes?.[cat] !== 'owner')

  return {
    ownerPairs,
    nonOwnerPairs,
  }
}

const CATEGORY_TYPE_DEFINITIONS = {
  owner: {
    getDisplayInfo: ({ categoryName }) => ({
      title: categoryName,
      description: 'Owner/Manager',
      details: `Players owned by ${categoryName}`,
    }),
    matchesPlayer: ({ categoryName, gridData, playerKey }) => (
      (gridData?.ownerPlayerKeys?.[categoryName] ?? new Set()).has(playerKey)
    ),
    getMetadataLine: ({ categoryName, gridData, playerKey }) => {
      const yearsByOwner = gridData?.playerYearsByOwner?.[playerKey] ?? {}
      return `${categoryName}: ${formatYearList(yearsByOwner[categoryName])}`
    },
  },
  position: {
    getDisplayInfo: ({ categoryName }) => ({
      title: categoryName,
      description: 'NFL Position',
      details: `Players with position ${categoryName}`,
    }),
    matchesPlayer: ({ categoryName, gridData, playerKey }) => (
      (gridData?.positionPlayerKeys?.[categoryName] ?? new Set()).has(playerKey)
    ),
    getMetadataLine: () => null,
  },
  'many-starts': {
    getDisplayInfo: ({ categoryTypes, categoryName, puzzle, sharedData }) => {
      const { ownerPairs, nonOwnerPairs } = getPairedCategoriesForCategory(categoryName, categoryTypes, puzzle)
      const details = []

      if (nonOwnerPairs.length > 0) {
        const allThreshold = sharedData?.manyStartsAllThreshold
        const thresholdStr = allThreshold !== undefined ? ` (${Math.ceil(allThreshold)}+ starts)` : ''
        details.push(`General: Top 20% of all players by total starts${thresholdStr}`)
      }

      if (ownerPairs.length > 0) {
        const ownerThresholds = sharedData?.manyStartsByOwnerThreshold || {}
        const thresholdExamples = ownerPairs
          .slice(0, 2)
          .map(owner => {
            const threshold = ownerThresholds[owner]
            return threshold !== undefined ? `${owner} (${Math.ceil(threshold)})` : owner
          })
          .join(', ')
        details.push(`With owner: Top 20% of that owner's players (${thresholdExamples}... starts)`)
      }

      return {
        title: MANY_STARTS_CATEGORY_NAME,
        description: 'Players with significant starting history (top 20%)',
        details: details.length > 0 ? details.join(' | ') : 'High-volume starting players',
      }
    },
    matchesPlayer: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const startsByOwner = gridData?.playerStartsByOwner?.[playerKey] ?? {}
        const ownerThresholds = gridData?.manyStartsByOwnerThreshold ?? {}
        return (startsByOwner[otherCategory] ?? 0) >= (ownerThresholds[otherCategory] ?? 0)
      }
      const totalStarts = gridData?.playerTotalStarts?.[playerKey] ?? 0
      return totalStarts >= (gridData?.manyStartsAllThreshold ?? 0)
    },
    getMetadataLine: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const startsByOwner = gridData?.playerStartsByOwner?.[playerKey] ?? {}
        return `${MANY_STARTS_CATEGORY_NAME}: ${startsByOwner[otherCategory] ?? 0} starts`
      }
      const totalStarts = gridData?.playerTotalStarts?.[playerKey] ?? 0
      return `${MANY_STARTS_CATEGORY_NAME}: ${totalStarts} starts`
    },
  },
  'big-game': {
    getDisplayInfo: ({ categoryTypes, categoryName, puzzle }) => {
      const { ownerPairs, nonOwnerPairs } = getPairedCategoriesForCategory(categoryName, categoryTypes, puzzle)
      const details = []

      if (nonOwnerPairs.length > 0) {
        details.push('General: QBs with high score >30 pts, others >20 pts')
      }

      if (ownerPairs.length > 0) {
        details.push('With owner: QBs with best score >30 pts, others >20 pts with that owner')
      }

      return {
        title: BIG_GAME_CATEGORY_NAME,
        description: 'Players with a standout scoring performance',
        details: details.length > 0 ? details.join(' | ') : 'High single-game scorers',
      }
    },
    matchesPlayer: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const playerPosition = gridData?.playerPositionByKey?.[playerKey] ?? ''
      const threshold = getBigGameThresholdByPosition(playerPosition)
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const bestScoreByOwner = gridData?.playerBestScoreByOwner?.[playerKey] ?? {}
        return (bestScoreByOwner[otherCategory] ?? 0) > threshold
      }
      const highScore = gridData?.playerHighScore?.[playerKey] ?? 0
      return highScore > threshold
    },
    getMetadataLine: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const bestScoreByOwner = gridData?.playerBestScoreByOwner?.[playerKey] ?? {}
        return `${BIG_GAME_CATEGORY_NAME}: ${formatDecimal2(bestScoreByOwner[otherCategory])} pts`
      }
      const highScore = gridData?.playerHighScore?.[playerKey] ?? 0
      return `${BIG_GAME_CATEGORY_NAME}: ${formatDecimal2(highScore)} pts`
    },
  },
  champ: {
    getDisplayInfo: ({ categoryTypes, categoryName, puzzle }) => {
      const { ownerPairs, nonOwnerPairs } = getPairedCategoriesForCategory(categoryName, categoryTypes, puzzle)
      const details = []

      if (nonOwnerPairs.length > 0) {
        details.push('General: career championships across all teams')
      }

      if (ownerPairs.length > 0) {
        details.push('With owner: championships with that specific owner')
      }

      return {
        title: CHAMP_CATEGORY_NAME,
        description: 'Players with at least one championship',
        details: details.length > 0 ? details.join(' | ') : 'Championship roster history',
      }
    },
    matchesPlayer: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const championshipsByOwner = gridData?.playerChampionshipsByOwner?.[playerKey] ?? {}
        return (championshipsByOwner[otherCategory] ?? 0) > 0
      }

      const championships = gridData?.playerChampionships?.[playerKey] ?? 0
      return championships > 0
    },
    getMetadataLine: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const championshipsByOwner = gridData?.playerChampionshipsByOwner?.[playerKey] ?? {}
        return `${CHAMP_CATEGORY_NAME}: ${championshipsByOwner[otherCategory] ?? 0} rings`
      }

      const championships = gridData?.playerChampionships?.[playerKey] ?? 0
      return `${CHAMP_CATEGORY_NAME}: ${championships} rings`
    },
  },
  loser: {
    getDisplayInfo: ({ categoryTypes, categoryName, puzzle }) => {
      const { ownerPairs, nonOwnerPairs } = getPairedCategoriesForCategory(categoryName, categoryTypes, puzzle)
      const details = []

      if (nonOwnerPairs.length > 0) {
        details.push('General: career Dewey Does finishes across all teams')
      }

      if (ownerPairs.length > 0) {
        details.push('With owner: Dewey Does finishes with that specific owner')
      }

      return {
        title: LOSER_CATEGORY_NAME,
        description: 'Players with at least one Dewey Does finish',
        details: details.length > 0 ? details.join(' | ') : 'Dewey Does roster history',
      }
    },
    matchesPlayer: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const deweyByOwner = gridData?.playerDeweyDoesTimesByOwner?.[playerKey] ?? {}
        return (deweyByOwner[otherCategory] ?? 0) > 0
      }

      const deweyDoesTimes = gridData?.playerDeweyDoesTimes?.[playerKey] ?? 0
      return deweyDoesTimes > 0
    },
    getMetadataLine: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const deweyByOwner = gridData?.playerDeweyDoesTimesByOwner?.[playerKey] ?? {}
        return `${LOSER_CATEGORY_NAME}: ${deweyByOwner[otherCategory] ?? 0} dewey`
      }

      const deweyDoesTimes = gridData?.playerDeweyDoesTimes?.[playerKey] ?? 0
      return `${LOSER_CATEGORY_NAME}: ${deweyDoesTimes} dewey`
    },
  },
  'huge-year': {
    getDisplayInfo: ({ categoryTypes, categoryName, puzzle }) => {
      const { ownerPairs, nonOwnerPairs } = getPairedCategoriesForCategory(categoryName, categoryTypes, puzzle)
      const details = []

      if (nonOwnerPairs.length > 0) {
        details.push('General: max started points in any season overall > 200')
      }

      if (ownerPairs.length > 0) {
        details.push('With owner: max started points in a season with that owner > 200')
      }

      return {
        title: HUGE_YEAR_CATEGORY_NAME,
        description: 'Players with a huge starting season',
        details: details.length > 0 ? details.join(' | ') : 'Max started points in a year over 200',
      }
    },
    matchesPlayer: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const byOwner = gridData?.playerMaxStartScoreInYearByOwner?.[playerKey] ?? {}
        return (byOwner[otherCategory] ?? 0) > HUGE_YEAR_THRESHOLD
      }
      const overall = gridData?.playerMaxStartScoreInYear?.[playerKey] ?? 0
      return overall > HUGE_YEAR_THRESHOLD
    },
    getMetadataLine: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const byOwnerMeta = gridData?.playerMaxStartScoreInYearMetaByOwner?.[playerKey] ?? {}
        return `${HUGE_YEAR_CATEGORY_NAME}: ${formatHugeYearMetadata(byOwnerMeta[otherCategory])}`
      }
      const overallMeta = gridData?.playerMaxStartScoreInYearMeta?.[playerKey]
      return `${HUGE_YEAR_CATEGORY_NAME}: ${formatHugeYearMetadata(overallMeta)}`
    },
  },
  'winning-record': {
    getDisplayInfo: ({ categoryTypes, categoryName, puzzle }) => {
      const { ownerPairs, nonOwnerPairs } = getPairedCategoriesForCategory(categoryName, categoryTypes, puzzle)
      const details = []

      if (nonOwnerPairs.length > 0) {
        details.push('General: overall starting win rate > 0.500')
      }

      if (ownerPairs.length > 0) {
        details.push('With owner: starting win rate with that owner > 0.500')
      }

      return {
        title: WINNING_RECORD_CATEGORY_NAME,
        description: 'Players with a winning record while starting',
        details: details.length > 0 ? details.join(' | ') : 'Starting win rate over 0.500',
      }
    },
    matchesPlayer: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const byOwner = gridData?.playerWinningRateByOwner?.[playerKey] ?? {}
        return (byOwner[otherCategory] ?? 0) > WINNING_RECORD_THRESHOLD
      }

      const overall = gridData?.playerWinningRate?.[playerKey] ?? 0
      return overall > WINNING_RECORD_THRESHOLD
    },
    getMetadataLine: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const byOwner = gridData?.playerWinningRateByOwner?.[playerKey] ?? {}
        return `${WINNING_RECORD_CATEGORY_NAME}: ${formatWinRate(byOwner[otherCategory] ?? 0)}`
      }

      const overall = gridData?.playerWinningRate?.[playerKey] ?? 0
      return `${WINNING_RECORD_CATEGORY_NAME}: ${formatWinRate(overall)}`
    },
  },
  'bench-warmer': {
    getDisplayInfo: ({ categoryTypes, categoryName, puzzle }) => {
      const { ownerPairs, nonOwnerPairs } = getPairedCategoriesForCategory(categoryName, categoryTypes, puzzle)
      const details = []

      if (nonOwnerPairs.length > 0) {
        details.push('General: career benches > starts')
      }

      if (ownerPairs.length > 0) {
        details.push('With owner: weeks benched > weeks started with that owner')
      }

      return {
        title: BENCH_WARMER_CATEGORY_NAME,
        description: 'Players benched more often than started',
        details: details.length > 0 ? details.join(' | ') : 'Benches greater than starts',
      }
    },
    matchesPlayer: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const startsByOwner = gridData?.playerStartsByOwnerForBenchWarmer?.[playerKey] ?? {}
        const benchesByOwner = gridData?.playerBenchesByOwner?.[playerKey] ?? {}
        return (benchesByOwner[otherCategory] ?? 0) > (startsByOwner[otherCategory] ?? 0)
      }

      const starts = gridData?.playerStarts?.[playerKey] ?? 0
      const benches = gridData?.playerBenches?.[playerKey] ?? 0
      return benches > starts
    },
    getMetadataLine: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const startsByOwner = gridData?.playerStartsByOwnerForBenchWarmer?.[playerKey] ?? {}
        const benchesByOwner = gridData?.playerBenchesByOwner?.[playerKey] ?? {}
        return `${BENCH_WARMER_CATEGORY_NAME}: ${benchesByOwner[otherCategory] ?? 0} benched, ${startsByOwner[otherCategory] ?? 0} starts`
      }

      const starts = gridData?.playerStarts?.[playerKey] ?? 0
      const benches = gridData?.playerBenches?.[playerKey] ?? 0
      return `${BENCH_WARMER_CATEGORY_NAME}: ${benches} benched, ${starts} starts`
    },
  },
  sojourner: {
    getDisplayInfo: ({ categoryTypes, categoryName, puzzle }) => {
      const { ownerPairs, nonOwnerPairs } = getPairedCategoriesForCategory(categoryName, categoryTypes, puzzle)
      const details = []

      if (nonOwnerPairs.length > 0) {
        details.push(`General: played for at least ${SOJOURNER_TEAMS_THRESHOLD} different teams`)
      }

      if (ownerPairs.length > 0) {
        details.push('With owner: same rule (owner pairing does not change this category)')
      }

      return {
        title: SOJOURNER_CATEGORY_NAME,
        description: `Players who have played for at least ${SOJOURNER_TEAMS_THRESHOLD} teams`,
        details: details.length > 0 ? details.join(' | ') : `Played for ${SOJOURNER_TEAMS_THRESHOLD}+ teams`,
      }
    },
    matchesPlayer: ({ gridData, playerKey }) => {
      const teamCount = gridData?.playerTeamCount?.[playerKey] ?? 0
      return teamCount >= SOJOURNER_TEAMS_THRESHOLD
    },
    getMetadataLine: ({ gridData, playerKey }) => {
      const teamCount = gridData?.playerTeamCount?.[playerKey] ?? 0
      return `${SOJOURNER_CATEGORY_NAME}: ${teamCount} teams`
    },
  },
  experienced: {
    getDisplayInfo: ({ categoryTypes, categoryName, puzzle }) => {
      const { ownerPairs, nonOwnerPairs } = getPairedCategoriesForCategory(categoryName, categoryTypes, puzzle)
      const details = []

      if (nonOwnerPairs.length > 0) {
        details.push(`General: total years played is ${EXPERIENCED_TOTAL_YEARS_THRESHOLD}+`)
      }

      if (ownerPairs.length > 0) {
        details.push(`With owner: years with that owner is ${EXPERIENCED_OWNER_YEARS_THRESHOLD}+`)
      }

      return {
        title: EXPERIENCED_CATEGORY_NAME,
        description: 'Players with long tenure',
        details: details.length > 0 ? details.join(' | ') : `General ${EXPERIENCED_TOTAL_YEARS_THRESHOLD}+ years, owner-paired ${EXPERIENCED_OWNER_YEARS_THRESHOLD}+ years`,
      }
    },
    matchesPlayer: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const yearsByOwner = gridData?.playerExperienceYearsByOwner?.[playerKey] ?? {}
        return (yearsByOwner[otherCategory] ?? 0) >= EXPERIENCED_OWNER_YEARS_THRESHOLD
      }

      const years = gridData?.playerYears?.[playerKey] ?? 0
      return years >= EXPERIENCED_TOTAL_YEARS_THRESHOLD
    },
    getMetadataLine: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const yearsByOwner = gridData?.playerExperienceYearsByOwner?.[playerKey] ?? {}
        return `${EXPERIENCED_CATEGORY_NAME}: ${yearsByOwner[otherCategory] ?? 0} years`
      }

      const years = gridData?.playerYears?.[playerKey] ?? 0
      return `${EXPERIENCED_CATEGORY_NAME}: ${years} years`
    },
  },
  'negative-scorer': {
    getDisplayInfo: ({ categoryTypes, categoryName, puzzle }) => {
      const { ownerPairs, nonOwnerPairs } = getPairedCategoriesForCategory(categoryName, categoryTypes, puzzle)
      const details = []

      if (nonOwnerPairs.length > 0) {
        details.push('General: has scored negative while starting at least once')
      }

      if (ownerPairs.length > 0) {
        details.push('With owner: negative starts while rostered by that owner')
      }

      return {
        title: NEGATIVE_SCORER_CATEGORY_NAME,
        description: 'Players with negative starts',
        details: details.length > 0 ? details.join(' | ') : 'At least one negative start',
      }
    },
    matchesPlayer: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const byOwner = gridData?.playerTimesNegativeByOwner?.[playerKey] ?? {}
        return (byOwner[otherCategory] ?? 0) > 0
      }

      const overall = gridData?.playerTimesNegative?.[playerKey] ?? 0
      return overall > 0
    },
    getMetadataLine: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const byOwner = gridData?.playerTimesNegativeByOwner?.[playerKey] ?? {}
        return `${NEGATIVE_SCORER_CATEGORY_NAME}: ${byOwner[otherCategory] ?? 0}`
      }

      const overall = gridData?.playerTimesNegative?.[playerKey] ?? 0
      return `${NEGATIVE_SCORER_CATEGORY_NAME}: ${overall}`
    },
  },
}

function getCategoryTypeDefinition(categoryType) {
  return CATEGORY_TYPE_DEFINITIONS[categoryType] ?? null
}

export function doesPlayerMatchCategoryForPair({ categoryName, otherCategory, categoryTypes, gridData, playerKey }) {
  const categoryType = categoryTypes?.[categoryName]
  const definition = getCategoryTypeDefinition(categoryType)
  if (!definition?.matchesPlayer) {
    return false
  }

  return definition.matchesPlayer({ categoryName, otherCategory, categoryTypes, gridData, playerKey })
}

export function getPlayerCategoryMetadataLines({ gridData, rowCategory, colCategory, playerKey }) {
  if (!playerKey || !gridData) {
    return []
  }

  const categoryTypes = gridData.categoryTypes ?? {}
  const lines = []
  const categoriesForCell = [
    { categoryName: rowCategory, otherCategory: colCategory },
    { categoryName: colCategory, otherCategory: rowCategory },
  ]

  for (const item of categoriesForCell) {
    const categoryType = categoryTypes[item.categoryName]
    const definition = getCategoryTypeDefinition(categoryType)
    const line = definition?.getMetadataLine?.({
      categoryName: item.categoryName,
      otherCategory: item.otherCategory,
      categoryTypes,
      gridData,
      playerKey,
    })
    if (line) {
      lines.push(line)
    }
  }

  return lines
}

/**
 * Get the display information for a category (title, description, detailed rules)
 * @param {string} categoryName - The category name
 * @param {object} categoryTypes - Map of category name to type (owner|position|many-starts|big-game|champ|loser|huge-year|winning-record|bench-warmer|sojourner|experienced|negative-scorer)
 * @param {object} puzzle - The current puzzle containing row/col owners
 * @param {object} sharedData - Shared category data containing thresholds and stats
 * @returns {object} Object with title, description, and details fields
 */
export function getCategoryDisplayInfo(categoryName, categoryTypes, puzzle, sharedData) {
  const type = categoryTypes?.[categoryName]
  const definition = getCategoryTypeDefinition(type)
  if (!definition?.getDisplayInfo) {
    return {
      title: categoryName,
      description: 'Category',
      details: '',
    }
  }

  return definition.getDisplayInfo({
    categoryName,
    categoryTypes,
    puzzle,
    sharedData,
  })
}
