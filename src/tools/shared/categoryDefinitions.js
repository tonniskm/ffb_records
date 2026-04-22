/**
 * Centralized category definitions and display information.
 * This file contains all metadata about categories used in games,
 * making it easy to update category information in one place.
 */

import {
  BIG_GAME_CATEGORY_NAME,
  CHAMP_LOSER_CATEGORY_NAME,
  HUGE_YEAR_CATEGORY_NAME,
  MANY_STARTS_CATEGORY_NAME,
} from './categoryData'

const HUGE_YEAR_THRESHOLD = 200

function formatYearList(years) {
  if (!Array.isArray(years) || years.length === 0) {
    return 'Never'
  }
  return years.join(', ')
}

function getBigGameThresholdByPosition(position) {
  return position === 'QB' ? 30 : 20
}

function formatHugeYearMetadata(meta) {
  const value = meta?.value ?? 0
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

      if (nonOwnerPairs.length > 0) {
        const allThreshold = sharedData?.manyStartsAllThreshold
        const thresholdStr = allThreshold !== undefined ? ` (${Math.ceil(allThreshold)}+ starts)` : ''
        details.push(`With non-owner category: Top 20% of all players by total starts${thresholdStr}`)
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

      if (ownerPairs.length > 0) {
        details.push('With owner: QBs with best score >30 pts, others >20 pts with that owner')
      }

      if (nonOwnerPairs.length > 0) {
        details.push('With non-owner category: QBs with high score >30 pts, others >20 pts')
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
        return `${BIG_GAME_CATEGORY_NAME}: ${bestScoreByOwner[otherCategory] ?? 0} pts`
      }
      const highScore = gridData?.playerHighScore?.[playerKey] ?? 0
      return `${BIG_GAME_CATEGORY_NAME}: ${highScore} pts`
    },
  },
  'champ-loser': {
    getDisplayInfo: ({ categoryTypes, categoryName, puzzle }) => {
      const { ownerPairs, nonOwnerPairs } = getPairedCategoriesForCategory(categoryName, categoryTypes, puzzle)
      const details = []

      if (ownerPairs.length > 0) {
        details.push('With owner: championships/dewey counts with that specific owner')
      }

      if (nonOwnerPairs.length > 0) {
        details.push('With non-owner category: career championships/dewey counts across all teams')
      }

      return {
        title: CHAMP_LOSER_CATEGORY_NAME,
        description: 'Players with at least one championship or Dewey Does finish',
        details: details.length > 0 ? details.join(' | ') : 'Championship or Dewey Does roster history',
      }
    },
    matchesPlayer: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const championshipsByOwner = gridData?.playerChampionshipsByOwner?.[playerKey] ?? {}
        const deweyByOwner = gridData?.playerDeweyDoesTimesByOwner?.[playerKey] ?? {}
        return (championshipsByOwner[otherCategory] ?? 0) > 0 || (deweyByOwner[otherCategory] ?? 0) > 0
      }

      const championships = gridData?.playerChampionships?.[playerKey] ?? 0
      const deweyDoesTimes = gridData?.playerDeweyDoesTimes?.[playerKey] ?? 0
      return championships > 0 || deweyDoesTimes > 0
    },
    getMetadataLine: ({ otherCategory, categoryTypes, gridData, playerKey }) => {
      const otherType = categoryTypes?.[otherCategory]
      if (otherType === 'owner') {
        const championshipsByOwner = gridData?.playerChampionshipsByOwner?.[playerKey] ?? {}
        const deweyByOwner = gridData?.playerDeweyDoesTimesByOwner?.[playerKey] ?? {}
        return `${CHAMP_LOSER_CATEGORY_NAME}: ${championshipsByOwner[otherCategory] ?? 0} rings, ${deweyByOwner[otherCategory] ?? 0} dewey`
      }

      const championships = gridData?.playerChampionships?.[playerKey] ?? 0
      const deweyDoesTimes = gridData?.playerDeweyDoesTimes?.[playerKey] ?? 0
      return `${CHAMP_LOSER_CATEGORY_NAME}: ${championships} rings, ${deweyDoesTimes} dewey`
    },
  },
  'huge-year': {
    getDisplayInfo: ({ categoryTypes, categoryName, puzzle }) => {
      const { ownerPairs, nonOwnerPairs } = getPairedCategoriesForCategory(categoryName, categoryTypes, puzzle)
      const details = []

      if (ownerPairs.length > 0) {
        details.push('With owner: max started points in a season with that owner > 200')
      }

      if (nonOwnerPairs.length > 0) {
        details.push('With non-owner category: max started points in any season overall > 200')
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
 * @param {object} categoryTypes - Map of category name to type (owner|position|many-starts|big-game|champ-loser|huge-year)
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
