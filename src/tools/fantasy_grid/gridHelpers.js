import {
  BENCH_WARMER_CATEGORY_NAME,
  BIG_GAME_CATEGORY_NAME,
  CHAMP_CATEGORY_NAME,
  EXPERIENCED_CATEGORY_NAME,
  HUGE_YEAR_CATEGORY_NAME,
  LOSER_CATEGORY_NAME,
  NEGATIVE_SCORER_CATEGORY_NAME,
  SOJOURNER_CATEGORY_NAME,
  WINNING_RECORD_CATEGORY_NAME,
  buildSharedCategoryData,
  MANY_STARTS_CATEGORY_NAME,
  normalizeCategoryValue,
} from '../shared/categoryData'
import { doesPlayerMatchCategoryForPair } from '../shared/categoryDefinitions'

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

// Fixed UTC schedule so these special grid modes land on the same weekdays.
const OWNER_ONLY_DAY_UTC = 1 // Monday
const NON_OWNER_ONLY_DAY_UTC = 4 // Thursday

function parseDateKeyToUtcDay(dateKey) {
  const parsedDate = new Date(`${dateKey}T00:00:00Z`)
  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }
  return parsedDate.getUTCDay()
}

export function getFantasyGridCategoryMode(dateKey) {
  const utcDay = parseDateKeyToUtcDay(dateKey)
  if (utcDay === OWNER_ONLY_DAY_UTC) {
    return FANTASY_GRID_CATEGORY_MODES.OWNER_ONLY
  }
  if (utcDay === NON_OWNER_ONLY_DAY_UTC) {
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
    ownerPlayerKeys,
    positionPlayerKeys,
    categoryPlayerKeys,
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

  const answersByPair = {}
  for (const rowCategory of categories) {
    answersByPair[rowCategory] = {}
    for (const colCategory of categories) {
      let answers = []

      // Handle "Many Starts" category pairs
      if (rowCategory === MANY_STARTS_CATEGORY_NAME || colCategory === MANY_STARTS_CATEGORY_NAME) {
        const otherCategory = rowCategory === MANY_STARTS_CATEGORY_NAME ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          // Many Starts paired with owner: top 20% of that owner's players by starts
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeFantasyGridValue(playerName)
            if (!playerKey) {
              continue
            }
            if (!doesPlayerMatchCategoryForPair({
              categoryName: MANY_STARTS_CATEGORY_NAME,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const weeksStarted = playerRecord['weeks started'] ?? 0
            const displayName = playerLookup[playerKey] ?? playerName
            const yearsByOwner = playerYearsByOwner[playerKey] ?? {}
            answers.push({
              key: playerKey,
              name: displayName,
              startsCount: weeksStarted,
              yearsByOwner: {
                ...(categoryTypes[otherCategory] === 'owner' ? { [otherCategory]: yearsByOwner[otherCategory] ?? [] } : {}),
              },
            })
          }
        } else {
          const candidatePlayers = categoryTypes[otherCategory] === 'position'
            ? (positionPlayerKeys[otherCategory] ?? new Set())
            : (categoryPlayerKeys[otherCategory] ?? new Set(Object.keys(playerLookup)))
          for (const playerKey of candidatePlayers) {
            if (!doesPlayerMatchCategoryForPair({
              categoryName: MANY_STARTS_CATEGORY_NAME,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const playerName = playerLookup[playerKey] ?? playerKey
            const totalStarts = playerTotalStarts[playerKey] ?? 0
            answers.push({
              key: playerKey,
              name: playerName,
              startsCount: totalStarts,
              yearsByOwner: {},
            })
          }
        }

        answers = answers
          .sort((left, right) => left.name.localeCompare(right.name))
          .map(answer => ({
            key: answer.key,
            name: answer.name,
            startsCount: answer.startsCount,
            yearsByOwner: answer.yearsByOwner,
          }))
      } else if (rowCategory === BIG_GAME_CATEGORY_NAME || colCategory === BIG_GAME_CATEGORY_NAME) {
        const otherCategory = rowCategory === BIG_GAME_CATEGORY_NAME ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          // Big Game paired with owner: use bestScore per owner
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeFantasyGridValue(playerName)
            if (!playerKey) {
              continue
            }
            if (!doesPlayerMatchCategoryForPair({
              categoryName: BIG_GAME_CATEGORY_NAME,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const bestScore = playerRecord['best score']?.[0] ?? 0
            const displayName = playerLookup[playerKey] ?? playerName
            const yearsByOwner = playerYearsByOwner[playerKey] ?? {}
            answers.push({
              key: playerKey,
              name: displayName,
              highScore: bestScore,
              yearsByOwner: {
                [ownerName]: yearsByOwner[ownerName] ?? [],
              },
            })
          }
        } else {
          // Big Game paired with position or other non-owner: use playerTracker highScore
          const playerSet = categoryTypes[otherCategory] === 'position'
            ? (positionPlayerKeys[otherCategory] ?? new Set())
            : (categoryPlayerKeys[otherCategory] ?? new Set(Object.keys(playerLookup)))
          for (const playerKey of playerSet) {
            if (!doesPlayerMatchCategoryForPair({
              categoryName: BIG_GAME_CATEGORY_NAME,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const playerName = playerLookup[playerKey] ?? playerKey
            const highScore = playerHighScore[playerKey] ?? 0
            answers.push({
              key: playerKey,
              name: playerName,
              highScore,
              yearsByOwner: {},
            })
          }
        }

        answers = answers
          .sort((left, right) => left.name.localeCompare(right.name))
          .map(answer => ({
            key: answer.key,
            name: answer.name,
            highScore: answer.highScore,
            yearsByOwner: answer.yearsByOwner,
          }))
      } else if (
        rowCategory === CHAMP_CATEGORY_NAME ||
        colCategory === CHAMP_CATEGORY_NAME ||
        rowCategory === LOSER_CATEGORY_NAME ||
        colCategory === LOSER_CATEGORY_NAME
      ) {
        const categoryName = [rowCategory, colCategory].find(
          category => category === CHAMP_CATEGORY_NAME || category === LOSER_CATEGORY_NAME
        )
        const otherCategory = rowCategory === categoryName ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeFantasyGridValue(playerName)
            if (!playerKey) {
              continue
            }
            if (!doesPlayerMatchCategoryForPair({
              categoryName,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const displayName = playerLookup[playerKey] ?? playerName
            const yearsByOwner = playerYearsByOwner[playerKey] ?? {}
            answers.push({
              key: playerKey,
              name: displayName,
              yearsByOwner: {
                [ownerName]: yearsByOwner[ownerName] ?? [],
              },
            })
          }
        } else {
          const candidatePlayers = categoryTypes[otherCategory] === 'position'
            ? (positionPlayerKeys[otherCategory] ?? new Set())
            : (categoryPlayerKeys[otherCategory] ?? new Set(Object.keys(playerLookup)))

          for (const playerKey of candidatePlayers) {
            if (!doesPlayerMatchCategoryForPair({
              categoryName,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const playerName = playerLookup[playerKey] ?? playerKey
            answers.push({
              key: playerKey,
              name: playerName,
              yearsByOwner: {},
            })
          }
        }

        answers = answers
          .sort((left, right) => left.name.localeCompare(right.name))
          .map(answer => ({
            key: answer.key,
            name: answer.name,
            yearsByOwner: answer.yearsByOwner,
          }))
      } else if (rowCategory === HUGE_YEAR_CATEGORY_NAME || colCategory === HUGE_YEAR_CATEGORY_NAME) {
        const otherCategory = rowCategory === HUGE_YEAR_CATEGORY_NAME ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeFantasyGridValue(playerName)
            if (!playerKey) {
              continue
            }
            if (!doesPlayerMatchCategoryForPair({
              categoryName: HUGE_YEAR_CATEGORY_NAME,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const displayName = playerLookup[playerKey] ?? playerName
            const yearsByOwner = playerYearsByOwner[playerKey] ?? {}
            answers.push({
              key: playerKey,
              name: displayName,
              yearsByOwner: {
                [ownerName]: yearsByOwner[ownerName] ?? [],
              },
            })
          }
        } else {
          const candidatePlayers = categoryTypes[otherCategory] === 'position'
            ? (positionPlayerKeys[otherCategory] ?? new Set())
            : (categoryPlayerKeys[otherCategory] ?? new Set(Object.keys(playerLookup)))

          for (const playerKey of candidatePlayers) {
            if (!doesPlayerMatchCategoryForPair({
              categoryName: HUGE_YEAR_CATEGORY_NAME,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const playerName = playerLookup[playerKey] ?? playerKey
            answers.push({
              key: playerKey,
              name: playerName,
              yearsByOwner: {},
            })
          }
        }

        answers = answers
          .sort((left, right) => left.name.localeCompare(right.name))
          .map(answer => ({
            key: answer.key,
            name: answer.name,
            yearsByOwner: answer.yearsByOwner,
          }))
      } else if (rowCategory === WINNING_RECORD_CATEGORY_NAME || colCategory === WINNING_RECORD_CATEGORY_NAME) {
        const otherCategory = rowCategory === WINNING_RECORD_CATEGORY_NAME ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeFantasyGridValue(playerName)
            if (!playerKey) {
              continue
            }
            if (!doesPlayerMatchCategoryForPair({
              categoryName: WINNING_RECORD_CATEGORY_NAME,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const displayName = playerLookup[playerKey] ?? playerName
            const yearsByOwner = playerYearsByOwner[playerKey] ?? {}
            answers.push({
              key: playerKey,
              name: displayName,
              yearsByOwner: {
                [ownerName]: yearsByOwner[ownerName] ?? [],
              },
            })
          }
        } else {
          const candidatePlayers = categoryTypes[otherCategory] === 'position'
            ? (positionPlayerKeys[otherCategory] ?? new Set())
            : (categoryPlayerKeys[otherCategory] ?? new Set(Object.keys(playerLookup)))

          for (const playerKey of candidatePlayers) {
            if (!doesPlayerMatchCategoryForPair({
              categoryName: WINNING_RECORD_CATEGORY_NAME,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const playerName = playerLookup[playerKey] ?? playerKey
            answers.push({
              key: playerKey,
              name: playerName,
              yearsByOwner: {},
            })
          }
        }

        answers = answers
          .sort((left, right) => left.name.localeCompare(right.name))
          .map(answer => ({
            key: answer.key,
            name: answer.name,
            yearsByOwner: answer.yearsByOwner,
          }))
      } else if (rowCategory === BENCH_WARMER_CATEGORY_NAME || colCategory === BENCH_WARMER_CATEGORY_NAME) {
        const otherCategory = rowCategory === BENCH_WARMER_CATEGORY_NAME ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeFantasyGridValue(playerName)
            if (!playerKey) {
              continue
            }
            if (!doesPlayerMatchCategoryForPair({
              categoryName: BENCH_WARMER_CATEGORY_NAME,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const displayName = playerLookup[playerKey] ?? playerName
            const yearsByOwner = playerYearsByOwner[playerKey] ?? {}
            answers.push({
              key: playerKey,
              name: displayName,
              yearsByOwner: {
                [ownerName]: yearsByOwner[ownerName] ?? [],
              },
            })
          }
        } else {
          const candidatePlayers = categoryTypes[otherCategory] === 'position'
            ? (positionPlayerKeys[otherCategory] ?? new Set())
            : (categoryPlayerKeys[otherCategory] ?? new Set(Object.keys(playerLookup)))

          for (const playerKey of candidatePlayers) {
            if (!doesPlayerMatchCategoryForPair({
              categoryName: BENCH_WARMER_CATEGORY_NAME,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const playerName = playerLookup[playerKey] ?? playerKey
            answers.push({
              key: playerKey,
              name: playerName,
              yearsByOwner: {},
            })
          }
        }

        answers = answers
          .sort((left, right) => left.name.localeCompare(right.name))
          .map(answer => ({
            key: answer.key,
            name: answer.name,
            yearsByOwner: answer.yearsByOwner,
          }))
      } else if (rowCategory === SOJOURNER_CATEGORY_NAME || colCategory === SOJOURNER_CATEGORY_NAME) {
        const otherCategory = rowCategory === SOJOURNER_CATEGORY_NAME ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeFantasyGridValue(playerName)
            if (!playerKey) {
              continue
            }
            if (!doesPlayerMatchCategoryForPair({
              categoryName: SOJOURNER_CATEGORY_NAME,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const displayName = playerLookup[playerKey] ?? playerName
            const yearsByOwner = playerYearsByOwner[playerKey] ?? {}
            answers.push({
              key: playerKey,
              name: displayName,
              yearsByOwner: {
                [ownerName]: yearsByOwner[ownerName] ?? [],
              },
            })
          }
        } else {
          const candidatePlayers = categoryTypes[otherCategory] === 'position'
            ? (positionPlayerKeys[otherCategory] ?? new Set())
            : (categoryPlayerKeys[otherCategory] ?? new Set(Object.keys(playerLookup)))

          for (const playerKey of candidatePlayers) {
            if (!doesPlayerMatchCategoryForPair({
              categoryName: SOJOURNER_CATEGORY_NAME,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const playerName = playerLookup[playerKey] ?? playerKey
            answers.push({
              key: playerKey,
              name: playerName,
              yearsByOwner: {},
            })
          }
        }

        answers = answers
          .sort((left, right) => left.name.localeCompare(right.name))
          .map(answer => ({
            key: answer.key,
            name: answer.name,
            yearsByOwner: answer.yearsByOwner,
          }))
      } else if (rowCategory === EXPERIENCED_CATEGORY_NAME || colCategory === EXPERIENCED_CATEGORY_NAME) {
        const otherCategory = rowCategory === EXPERIENCED_CATEGORY_NAME ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeFantasyGridValue(playerName)
            if (!playerKey) {
              continue
            }
            if (!doesPlayerMatchCategoryForPair({
              categoryName: EXPERIENCED_CATEGORY_NAME,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const displayName = playerLookup[playerKey] ?? playerName
            const yearsByOwner = playerYearsByOwner[playerKey] ?? {}
            answers.push({
              key: playerKey,
              name: displayName,
              yearsByOwner: {
                [ownerName]: yearsByOwner[ownerName] ?? [],
              },
            })
          }
        } else {
          const candidatePlayers = categoryTypes[otherCategory] === 'position'
            ? (positionPlayerKeys[otherCategory] ?? new Set())
            : (categoryPlayerKeys[otherCategory] ?? new Set(Object.keys(playerLookup)))

          for (const playerKey of candidatePlayers) {
            if (!doesPlayerMatchCategoryForPair({
              categoryName: EXPERIENCED_CATEGORY_NAME,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const playerName = playerLookup[playerKey] ?? playerKey
            answers.push({
              key: playerKey,
              name: playerName,
              yearsByOwner: {},
            })
          }
        }

        answers = answers
          .sort((left, right) => left.name.localeCompare(right.name))
          .map(answer => ({
            key: answer.key,
            name: answer.name,
            yearsByOwner: answer.yearsByOwner,
          }))
      } else if (rowCategory === NEGATIVE_SCORER_CATEGORY_NAME || colCategory === NEGATIVE_SCORER_CATEGORY_NAME) {
        const otherCategory = rowCategory === NEGATIVE_SCORER_CATEGORY_NAME ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeFantasyGridValue(playerName)
            if (!playerKey) {
              continue
            }
            if (!doesPlayerMatchCategoryForPair({
              categoryName: NEGATIVE_SCORER_CATEGORY_NAME,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const displayName = playerLookup[playerKey] ?? playerName
            const yearsByOwner = playerYearsByOwner[playerKey] ?? {}
            answers.push({
              key: playerKey,
              name: displayName,
              yearsByOwner: {
                [ownerName]: yearsByOwner[ownerName] ?? [],
              },
            })
          }
        } else {
          const candidatePlayers = categoryTypes[otherCategory] === 'position'
            ? (positionPlayerKeys[otherCategory] ?? new Set())
            : (categoryPlayerKeys[otherCategory] ?? new Set(Object.keys(playerLookup)))

          for (const playerKey of candidatePlayers) {
            if (!doesPlayerMatchCategoryForPair({
              categoryName: NEGATIVE_SCORER_CATEGORY_NAME,
              otherCategory,
              categoryTypes,
              gridData: sharedData,
              playerKey,
            })) {
              continue
            }
            const playerName = playerLookup[playerKey] ?? playerKey
            answers.push({
              key: playerKey,
              name: playerName,
              yearsByOwner: {},
            })
          }
        }

        answers = answers
          .sort((left, right) => left.name.localeCompare(right.name))
          .map(answer => ({
            key: answer.key,
            name: answer.name,
            yearsByOwner: answer.yearsByOwner,
          }))
      } else {
        // Existing logic for non-"Many Starts" categories
        const rowPlayers = categoryTypes[rowCategory] === 'position'
          ? (positionPlayerKeys[rowCategory] ?? new Set())
          : (ownerPlayerKeys[rowCategory] ?? new Set())
        const colPlayers = categoryTypes[colCategory] === 'position'
          ? (positionPlayerKeys[colCategory] ?? new Set())
          : (ownerPlayerKeys[colCategory] ?? new Set())

        for (const playerKey of rowPlayers) {
          if (!colPlayers.has(playerKey)) {
            continue
          }
          const playerName = playerLookup[playerKey] ?? playerKey
          const yearsByOwner = playerYearsByOwner[playerKey] ?? {}
          answers.push({
            key: playerKey,
            name: playerName,
            yearsByOwner: {
              ...(categoryTypes[rowCategory] === 'owner' ? { [rowCategory]: yearsByOwner[rowCategory] ?? [] } : {}),
              ...(categoryTypes[colCategory] === 'owner' ? { [colCategory]: yearsByOwner[colCategory] ?? [] } : {}),
            },
          })
        }

        answers = answers
          .sort((left, right) => left.name.localeCompare(right.name))
          .map(answer => ({
            key: answer.key,
            name: answer.name,
            yearsByOwner: answer.yearsByOwner,
          }))
      }

      answersByPair[rowCategory][colCategory] = answers
    }
  }

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

  const seed = typeof seedInput === 'number' ? seedInput : getDateSeed(seedInput ?? new Date().toISOString().slice(0, 10))
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
  const resolvedDateKey = dateKey ?? new Date().toISOString().slice(0, 10)
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