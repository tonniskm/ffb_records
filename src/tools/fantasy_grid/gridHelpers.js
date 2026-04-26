import { buildSharedCategoryData, normalizeCategoryValue } from '../shared/categoryData'
import { buildFantasyGridAnswersByPair } from './fantasyGridAnswerBuilder'

// ─── Debug Mode ────────────────────────────────────────────────────────────────
// Set DEBUG_GRID_MODE to true to force today's grid to include DEBUG_FORCED_CATEGORY.
// Set to false when finished with development.
const DEBUG_GRID_MODE = false
const DEBUG_FORCED_CATEGORY = 'Negative Scorer'
// ────────────────────────────────────────────────────────────────────────────────

export const FANTASY_GRID_CATEGORY_MODES = {
  MIXED: 'mixed',
  OWNER_ONLY: 'owner-only',
  NON_OWNER_ONLY: 'non-owner-only',
}

// Fixed local-weekday schedule so these special grid modes land on the same weekdays.
const OWNER_ONLY_DAY_LOCAL = 1 // Monday
const NON_OWNER_ONLY_DAY_LOCAL = 4 // Thursday

function parseDateKeyToLocalDay(dateKey) {
  const parsedDate = new Date(`${dateKey}T00:00:00`)
  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }
  return parsedDate.getDay()
}

function getLocalDateKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getFantasyGridCategoryMode(dateKey) {
  const localDay = parseDateKeyToLocalDay(dateKey)
  if (localDay === OWNER_ONLY_DAY_LOCAL) {
    return FANTASY_GRID_CATEGORY_MODES.OWNER_ONLY
  }
  if (localDay === NON_OWNER_ONLY_DAY_LOCAL) {
    return FANTASY_GRID_CATEGORY_MODES.NON_OWNER_ONLY
  }
  return FANTASY_GRID_CATEGORY_MODES.MIXED
}

export function getFantasyGridCategoryModeLabel(dateKey) {
  const mode = getFantasyGridCategoryMode(dateKey)
  if (mode === FANTASY_GRID_CATEGORY_MODES.OWNER_ONLY) {
    return 'Owner Categories Day'
  }
  if (mode === FANTASY_GRID_CATEGORY_MODES.NON_OWNER_ONLY) {
    return 'Non-Owner Categories Day'
  }
  return ''
}

export const normalizeFantasyGridValue = normalizeCategoryValue

function getDateSeed(dateKey) {
  let hash = 0
  for (const char of dateKey) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return hash
}

function mulberry32(seed) {
  let value = seed >>> 0
  return function nextRandom() {
    value += 0x6D2B79F5
    let output = value
    output = Math.imul(output ^ (output >>> 15), output | 1)
    output ^= output + Math.imul(output ^ (output >>> 7), output | 61)
    return ((output ^ (output >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleWithSeed(list, randomFn) {
  const output = [...list]
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(randomFn() * (index + 1))
    const temp = output[index]
    output[index] = output[swapIndex]
    output[swapIndex] = temp
  }
  return output
}

export function buildFantasyGridData(activeNames, playerTracker, teamTracker) {
  const sharedData = buildSharedCategoryData(activeNames, playerTracker, teamTracker, normalizeFantasyGridValue)
  const {
    owners,
    positions,
    categories,
    categoryTypes,
    playerLookup,
    playerYearsByOwner,
    playerTotalStarts,
    playerStartsByOwner,
    playerHighScore,
    playerBestScoreByOwner,
    playerPositionByKey,
    playerChampionships,
    playerDeweyDoesTimes,
    playerChampionshipsByOwner,
    playerDeweyDoesTimesByOwner,
    playerMaxStartScoreInYear,
    playerMaxStartScoreInYearByOwner,
    playerMaxStartScoreInYearMeta,
    playerMaxStartScoreInYearMetaByOwner,
    playerWinningRate,
    playerWinningRateByOwner,
    playerStarts,
    playerBenches,
    playerStartsByOwnerForBenchWarmer,
    playerBenchesByOwner,
    playerTeamCount,
    playerYears,
    playerExperienceYearsByOwner,
    playerTimesNegative,
    playerTimesNegativeByOwner,
    manyStartsAllThreshold,
    manyStartsByOwnerThreshold,
  } = sharedData
  const answersByPair = buildFantasyGridAnswersByPair(sharedData, teamTracker)

  return {
    owners,
    positions,
    categories,
    categoryTypes,
    allPlayers: Object.values(playerLookup).sort((left, right) => left.localeCompare(right)),
    answersByPair,
    playerLookup,
    playerYearsByOwner,
    playerTotalStarts,
    playerStartsByOwner,
    playerHighScore,
    playerBestScoreByOwner,
    playerPositionByKey,
    playerChampionships,
    playerDeweyDoesTimes,
    playerChampionshipsByOwner,
    playerDeweyDoesTimesByOwner,
    playerMaxStartScoreInYear,
    playerMaxStartScoreInYearByOwner,
    playerMaxStartScoreInYearMeta,
    playerMaxStartScoreInYearMetaByOwner,
    playerWinningRate,
    playerWinningRateByOwner,
    playerStarts,
    playerBenches,
    playerStartsByOwnerForBenchWarmer,
    playerBenchesByOwner,
    playerTeamCount,
    playerYears,
    playerExperienceYearsByOwner,
    playerTimesNegative,
    playerTimesNegativeByOwner,
    manyStartsAllThreshold,
    manyStartsByOwnerThreshold,
  }
}

function buildOwnerTriples(owners, offset) {
  const triples = []
  if (owners.length < 3) {
    return triples
  }

  const rotatedOwners = owners.map((_, index) => owners[(index + offset) % owners.length])
  for (let first = 0; first < rotatedOwners.length - 2; first += 1) {
    for (let second = first + 1; second < rotatedOwners.length - 1; second += 1) {
      for (let third = second + 1; third < rotatedOwners.length; third += 1) {
        triples.push([rotatedOwners[first], rotatedOwners[second], rotatedOwners[third]])
      }
    }
  }

  return triples
}

export function pickFantasyGridPuzzle(gridData, seedInput, categoryMode = FANTASY_GRID_CATEGORY_MODES.MIXED) {
  const categories = gridData?.categories ?? []
  const categoryTypes = gridData?.categoryTypes ?? {}

  const modeFilteredCategories = categories.filter(category => {
    const categoryType = categoryTypes[category]
    if (categoryMode === FANTASY_GRID_CATEGORY_MODES.OWNER_ONLY) {
      return categoryType === 'owner'
    }
    if (categoryMode === FANTASY_GRID_CATEGORY_MODES.NON_OWNER_ONLY) {
      return categoryType !== 'owner'
    }
    return true
  })

  const puzzleCategories = modeFilteredCategories.length >= 6 ? modeFilteredCategories : categories
  if (puzzleCategories.length < 6) {
    return null
  }

  const seed = typeof seedInput === 'number' ? seedInput : getDateSeed(seedInput ?? getLocalDateKey())
  const randomFn = mulberry32(seed)
  const shuffledOwnersForRows = shuffleWithSeed(puzzleCategories, randomFn)
  const shuffledOwnersForCols = shuffleWithSeed(puzzleCategories, randomFn)
  const rowTriples = buildOwnerTriples(shuffledOwnersForRows, 0)
  const colTriples = buildOwnerTriples(shuffledOwnersForCols, 0)
  const candidates = []

  for (const rowOwners of rowTriples) {
    for (const colOwners of colTriples) {
      if (rowOwners.some(owner => colOwners.includes(owner))) {
        continue
      }
      let hasEmptySquare = false
      for (const rowOwner of rowOwners) {
        for (const colOwner of colOwners) {
          const answerCount = gridData?.answersByPair?.[rowOwner]?.[colOwner]?.length ?? 0
          if (answerCount === 0) {
            hasEmptySquare = true
            break
          }
        }
        if (hasEmptySquare) {
          break
        }
      }
      if (hasEmptySquare) {
        continue
      }
      candidates.push({
        rowOwners,
        colOwners,
      })
    }
  }

  if (candidates.length === 0) {
    return null
  }

  const eligibleCandidates = DEBUG_GRID_MODE
    ? candidates.filter(c => c.rowOwners.includes(DEBUG_FORCED_CATEGORY) || c.colOwners.includes(DEBUG_FORCED_CATEGORY))
    : candidates
  const finalCandidates = eligibleCandidates.length > 0 ? eligibleCandidates : candidates

  return finalCandidates[Math.floor(randomFn() * finalCandidates.length)]
}

export function getFantasyGridCellAnswers(gridData, rowOwner, colOwner) {
  return gridData?.answersByPair?.[rowOwner]?.[colOwner] ?? []
}

export function validateFantasyGridGuess(gridData, rowOwner, colOwner, guess, usedAnswers) {
  const normalizedGuess = normalizeFantasyGridValue(guess)
  if (!normalizedGuess) {
    return { isCorrect: false, reason: 'empty' }
  }

  const displayName = gridData?.playerLookup?.[normalizedGuess]
  if (!displayName) {
    return { isCorrect: false, reason: 'unknown-player' }
  }

  if (usedAnswers?.has(normalizedGuess)) {
    return { isCorrect: false, reason: 'already-used', displayName }
  }

  const answers = getFantasyGridCellAnswers(gridData, rowOwner, colOwner)
  const match = answers.find(answer => answer.key === normalizedGuess)
  if (!match) {
    return {
      isCorrect: false,
      reason: 'wrong-cell',
      displayName,
      answerCount: answers.length,
    }
  }

  return {
    isCorrect: true,
    reason: 'correct',
    displayName: match.name,
    normalizedName: match.key,
    answerCount: answers.length,
    yearsByOwner: match.yearsByOwner,
  }
}

export function createFantasyGridSeed(leagueID, puzzleIndex, dateKey) {
  const resolvedDateKey = dateKey ?? getLocalDateKey()
  return getDateSeed(`${leagueID}-${resolvedDateKey}-${puzzleIndex}`)
}

export function getFantasyGridProgress(cells) {
  const allCells = Object.values(cells ?? {})
  const solved = allCells.filter(cell => cell?.isCorrect).length
  return {
    solved,
    total: allCells.length,
  }
}

export function createFantasyGridCells(rowOwners, colOwners) {
  const cells = {}
  for (const rowOwner of rowOwners ?? []) {
    for (const colOwner of colOwners ?? []) {
      const key = `${rowOwner}__${colOwner}`
      cells[key] = {
        rowOwner,
        colOwner,
        correctGuess: '',
        correctYearsByOwner: {},
        incorrectGuesses: [],
        isCorrect: false,
      }
    }
  }
  return cells
}