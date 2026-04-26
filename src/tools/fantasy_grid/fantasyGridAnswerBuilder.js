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
  normalizeCategoryValue,
} from '../shared/categoryData'
import { doesPlayerMatchCategoryForPair } from '../shared/categoryDefinitions'

function sortAnswersByName(answers) {
  return answers.sort((left, right) => left.name.localeCompare(right.name))
}

function getCandidatePlayersForCategory(otherCategory, categoryTypes, positionPlayerKeys, categoryPlayerKeys, playerLookup) {
  if (categoryTypes[otherCategory] === 'position') {
    return positionPlayerKeys[otherCategory] ?? new Set()
  }
  return categoryPlayerKeys[otherCategory] ?? new Set(Object.keys(playerLookup))
}

export function buildFantasyGridAnswersByPair(sharedData, teamTracker) {
  const {
    categories,
    categoryTypes,
    ownerPlayerKeys,
    positionPlayerKeys,
    categoryPlayerKeys,
    playerLookup,
    playerYearsByOwner,
    playerTotalStarts,
    playerHighScore,
  } = sharedData

  const answersByPair = {}
  for (const rowCategory of categories) {
    answersByPair[rowCategory] = {}
    for (const colCategory of categories) {
      let answers = []

      if (rowCategory === MANY_STARTS_CATEGORY_NAME || colCategory === MANY_STARTS_CATEGORY_NAME) {
        const otherCategory = rowCategory === MANY_STARTS_CATEGORY_NAME ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeCategoryValue(playerName)
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
          const candidatePlayers = getCandidatePlayersForCategory(
            otherCategory,
            categoryTypes,
            positionPlayerKeys,
            categoryPlayerKeys,
            playerLookup
          )
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

        answersByPair[rowCategory][colCategory] = sortAnswersByName(answers)
        continue
      }

      if (rowCategory === BIG_GAME_CATEGORY_NAME || colCategory === BIG_GAME_CATEGORY_NAME) {
        const otherCategory = rowCategory === BIG_GAME_CATEGORY_NAME ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeCategoryValue(playerName)
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
          const candidatePlayers = getCandidatePlayersForCategory(
            otherCategory,
            categoryTypes,
            positionPlayerKeys,
            categoryPlayerKeys,
            playerLookup
          )
          for (const playerKey of candidatePlayers) {
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

        answersByPair[rowCategory][colCategory] = sortAnswersByName(answers)
        continue
      }

      if (
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
            const playerKey = normalizeCategoryValue(playerName)
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
          const candidatePlayers = getCandidatePlayersForCategory(
            otherCategory,
            categoryTypes,
            positionPlayerKeys,
            categoryPlayerKeys,
            playerLookup
          )

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

        answersByPair[rowCategory][colCategory] = sortAnswersByName(answers)
        continue
      }

      if (rowCategory === HUGE_YEAR_CATEGORY_NAME || colCategory === HUGE_YEAR_CATEGORY_NAME) {
        const otherCategory = rowCategory === HUGE_YEAR_CATEGORY_NAME ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeCategoryValue(playerName)
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
          const candidatePlayers = getCandidatePlayersForCategory(
            otherCategory,
            categoryTypes,
            positionPlayerKeys,
            categoryPlayerKeys,
            playerLookup
          )

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

        answersByPair[rowCategory][colCategory] = sortAnswersByName(answers)
        continue
      }

      if (rowCategory === WINNING_RECORD_CATEGORY_NAME || colCategory === WINNING_RECORD_CATEGORY_NAME) {
        const otherCategory = rowCategory === WINNING_RECORD_CATEGORY_NAME ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeCategoryValue(playerName)
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
          const candidatePlayers = getCandidatePlayersForCategory(
            otherCategory,
            categoryTypes,
            positionPlayerKeys,
            categoryPlayerKeys,
            playerLookup
          )

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

        answersByPair[rowCategory][colCategory] = sortAnswersByName(answers)
        continue
      }

      if (rowCategory === BENCH_WARMER_CATEGORY_NAME || colCategory === BENCH_WARMER_CATEGORY_NAME) {
        const otherCategory = rowCategory === BENCH_WARMER_CATEGORY_NAME ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeCategoryValue(playerName)
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
          const candidatePlayers = getCandidatePlayersForCategory(
            otherCategory,
            categoryTypes,
            positionPlayerKeys,
            categoryPlayerKeys,
            playerLookup
          )

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

        answersByPair[rowCategory][colCategory] = sortAnswersByName(answers)
        continue
      }

      if (rowCategory === SOJOURNER_CATEGORY_NAME || colCategory === SOJOURNER_CATEGORY_NAME) {
        const otherCategory = rowCategory === SOJOURNER_CATEGORY_NAME ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeCategoryValue(playerName)
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
          const candidatePlayers = getCandidatePlayersForCategory(
            otherCategory,
            categoryTypes,
            positionPlayerKeys,
            categoryPlayerKeys,
            playerLookup
          )

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

        answersByPair[rowCategory][colCategory] = sortAnswersByName(answers)
        continue
      }

      if (rowCategory === EXPERIENCED_CATEGORY_NAME || colCategory === EXPERIENCED_CATEGORY_NAME) {
        const otherCategory = rowCategory === EXPERIENCED_CATEGORY_NAME ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeCategoryValue(playerName)
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
          const candidatePlayers = getCandidatePlayersForCategory(
            otherCategory,
            categoryTypes,
            positionPlayerKeys,
            categoryPlayerKeys,
            playerLookup
          )

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

        answersByPair[rowCategory][colCategory] = sortAnswersByName(answers)
        continue
      }

      if (rowCategory === NEGATIVE_SCORER_CATEGORY_NAME || colCategory === NEGATIVE_SCORER_CATEGORY_NAME) {
        const otherCategory = rowCategory === NEGATIVE_SCORER_CATEGORY_NAME ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeCategoryValue(playerName)
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
          const candidatePlayers = getCandidatePlayersForCategory(
            otherCategory,
            categoryTypes,
            positionPlayerKeys,
            categoryPlayerKeys,
            playerLookup
          )

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

        answersByPair[rowCategory][colCategory] = sortAnswersByName(answers)
        continue
      }

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

      answersByPair[rowCategory][colCategory] = sortAnswersByName(answers)
    }
  }

  return answersByPair
}