// ─── Debug Mode ────────────────────────────────────────────────────────────────
// Set DEBUG_GRID_MODE to true to force today's grid to include DEBUG_FORCED_CATEGORY.
// Set to false when finished with development.
const DEBUG_GRID_MODE = false
const DEBUG_FORCED_CATEGORY = 'Big Game'
// ────────────────────────────────────────────────────────────────────────────────

function sortStrings(values) {
  return [...values].sort((left, right) => left.localeCompare(right))
}

export function normalizeFantasyGridValue(value) {
  return (value ?? '').toString().trim().toLowerCase()
}

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

function sortYears(values) {
  return [...values].sort((left, right) => left - right)
}

export function buildFantasyGridData(activeNames, playerTracker, teamTracker) {
  const owners = sortStrings([...new Set((activeNames ?? []).filter(Boolean))])
  const positions = sortStrings([
    ...new Set(
      (playerTracker ?? [])
        .map(player => player?.pos)
        .filter(Boolean)
    ),
  ])
  const manyStartsCategoryName = 'Many Starts'
  const bigGameCategoryName = 'Big Game'
  const categories = [...owners, ...positions, manyStartsCategoryName, bigGameCategoryName]
  const ownerToPlayers = {}
  const positionToPlayers = {}
  const playerLookup = {}
  const playerYearsByOwner = {}
  const categoryTypes = {}
  const playerTotalStarts = {}
  const playerStartsByOwner = {}
  const playerHighScore = {}
  const playerBestScoreByOwner = {}
  const playerPositionByKey = {}

  for (const owner of owners) {
    ownerToPlayers[owner] = new Set()
    categoryTypes[owner] = 'owner'
  }

  for (const position of positions) {
    positionToPlayers[position] = new Set()
    categoryTypes[position] = 'position'
  }

  categoryTypes[manyStartsCategoryName] = 'many-starts'
  categoryTypes[bigGameCategoryName] = 'big-game'

  for (const player of playerTracker ?? []) {
    if (!player?.name || !Array.isArray(player?.teams)) {
      continue
    }

    const normalizedName = normalizeFantasyGridValue(player.name)
    if (!normalizedName) {
      continue
    }

    if (!(normalizedName in playerLookup)) {
      playerLookup[normalizedName] = player.name
    }
    if (!(normalizedName in playerYearsByOwner)) {
      playerYearsByOwner[normalizedName] = {}
    }
    if (!(normalizedName in playerTotalStarts)) {
      playerTotalStarts[normalizedName] = 0
    }
    if (!(normalizedName in playerStartsByOwner)) {
      playerStartsByOwner[normalizedName] = {}
    }
    if (!(normalizedName in playerHighScore)) {
      playerHighScore[normalizedName] = player['highScore']?.[0] ?? 0
    }
    if (!(normalizedName in playerPositionByKey)) {
      playerPositionByKey[normalizedName] = player.pos ?? ''
    }
    if (player.pos && positionToPlayers[player.pos]) {
      positionToPlayers[player.pos].add(playerLookup[normalizedName])
    }

    const ownersForPlayer = [...new Set(player.teams.filter(team => owners.includes(team)))]
    for (const owner of ownersForPlayer) {
      ownerToPlayers[owner].add(playerLookup[normalizedName])
      if (!(owner in playerYearsByOwner[normalizedName])) {
        playerYearsByOwner[normalizedName][owner] = new Set()
      }
    }

    if (player.teamInYear && typeof player.teamInYear === 'object') {
      for (const year of Object.keys(player.teamInYear)) {
        const teamsInYear = Array.isArray(player.teamInYear[year]) ? player.teamInYear[year] : []
        for (const owner of teamsInYear) {
          if (!owners.includes(owner)) {
            continue
          }
          if (!(owner in playerYearsByOwner[normalizedName])) {
            playerYearsByOwner[normalizedName][owner] = new Set()
          }
          const parsedYear = Number(year)
          if (!Number.isNaN(parsedYear)) {
            playerYearsByOwner[normalizedName][owner].add(parsedYear)
          }
        }
      }
    }
  }

  // Build playerTotalStarts from teamTracker
  for (const ownerName of owners) {
    const ownedPlayers = teamTracker?.[ownerName] ?? []
    for (const playerRecord of ownedPlayers) {
      const playerName = playerRecord?.name
      if (!playerName) {
        continue
      }
      const normalizedName = normalizeFantasyGridValue(playerName)
      if (!normalizedName) {
        continue
      }
      if (!(normalizedName in playerTotalStarts)) {
        playerTotalStarts[normalizedName] = 0
      }
      if (!(normalizedName in playerStartsByOwner)) {
        playerStartsByOwner[normalizedName] = {}
      }
      const weeksStarted = playerRecord['weeks started'] ?? 0
      playerTotalStarts[normalizedName] += weeksStarted
      playerStartsByOwner[normalizedName][ownerName] = (playerStartsByOwner[normalizedName][ownerName] ?? 0) + weeksStarted
      if (!(normalizedName in playerBestScoreByOwner)) {
        playerBestScoreByOwner[normalizedName] = {}
      }
      playerBestScoreByOwner[normalizedName][ownerName] = playerRecord['best score']?.[0] ?? 0
    }
  }

  const answersByPair = {}
  for (const rowCategory of categories) {
    answersByPair[rowCategory] = {}
    for (const colCategory of categories) {
      let answers = []

      // Handle "Many Starts" category pairs
      if (rowCategory === manyStartsCategoryName || colCategory === manyStartsCategoryName) {
        const otherCategory = rowCategory === manyStartsCategoryName ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          // Many Starts paired with owner: threshold is 10 weeks started by that owner
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const weeksStarted = playerRecord['weeks started'] ?? 0
            if (weeksStarted < 10) {
              continue
            }
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeFantasyGridValue(playerName)
            if (!playerKey) {
              continue
            }
            const displayName = playerLookup[playerKey] ?? playerName
            const yearsByOwner = playerYearsByOwner[playerKey] ?? {}
            answers.push({
              key: playerKey,
              name: displayName,
              startsCount: weeksStarted,
              yearsByOwner: {
                ...(categoryTypes[otherCategory] === 'owner' ? { [otherCategory]: sortYears(Array.from(yearsByOwner[otherCategory] ?? [])) } : {}),
              },
            })
          }
        } else if (categoryTypes[otherCategory] === 'position') {
          // Many Starts paired with position: threshold is 20 total starts
          const position = otherCategory
          const positionPlayers = positionToPlayers[position] ?? new Set()
          for (const playerName of positionPlayers) {
            const playerKey = normalizeFantasyGridValue(playerName)
            const totalStarts = playerTotalStarts[playerKey] ?? 0
            if (totalStarts < 20) {
              continue
            }
            answers.push({
              key: playerKey,
              name: playerName,
              startsCount: totalStarts,
              yearsByOwner: {},
            })
          }
        } else if (categoryTypes[otherCategory] === 'big-game') {
          // Many Starts paired with Big Game: player needs >=20 total starts AND high score > threshold
          for (const playerName of Object.values(playerLookup)) {
            const playerKey = normalizeFantasyGridValue(playerName)
            const totalStarts = playerTotalStarts[playerKey] ?? 0
            if (totalStarts < 20) {
              continue
            }
            const highScore = playerHighScore[playerKey] ?? 0
            const pos = playerPositionByKey[playerKey] ?? ''
            const threshold = pos === 'QB' ? 30 : 20
            if (highScore <= threshold) {
              continue
            }
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
      } else if (rowCategory === bigGameCategoryName || colCategory === bigGameCategoryName) {
        const otherCategory = rowCategory === bigGameCategoryName ? colCategory : rowCategory

        if (categoryTypes[otherCategory] === 'owner') {
          // Big Game paired with owner: use bestScore per owner
          const ownerName = otherCategory
          const ownedPlayers = teamTracker?.[ownerName] ?? []
          for (const playerRecord of ownedPlayers) {
            const bestScore = playerRecord['best score']?.[0] ?? 0
            const playerName = playerRecord?.name
            if (!playerName) {
              continue
            }
            const playerKey = normalizeFantasyGridValue(playerName)
            if (!playerKey) {
              continue
            }
            const pos = playerPositionByKey[playerKey] ?? ''
            const threshold = pos === 'QB' ? 30 : 20
            if (bestScore <= threshold) {
              continue
            }
            const displayName = playerLookup[playerKey] ?? playerName
            const yearsByOwner = playerYearsByOwner[playerKey] ?? {}
            answers.push({
              key: playerKey,
              name: displayName,
              highScore: bestScore,
              yearsByOwner: {
                [ownerName]: sortYears(Array.from(yearsByOwner[ownerName] ?? [])),
              },
            })
          }
        } else {
          // Big Game paired with position or other non-owner: use playerTracker highScore
          const playerSet = categoryTypes[otherCategory] === 'position'
            ? (positionToPlayers[otherCategory] ?? new Set())
            : new Set(Object.values(playerLookup))
          for (const playerName of playerSet) {
            const playerKey = normalizeFantasyGridValue(playerName)
            const highScore = playerHighScore[playerKey] ?? 0
            const pos = playerPositionByKey[playerKey] ?? ''
            const threshold = pos === 'QB' ? 30 : 20
            if (highScore <= threshold) {
              continue
            }
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
      } else {
        // Existing logic for non-"Many Starts" categories
        const rowPlayers = categoryTypes[rowCategory] === 'position'
          ? (positionToPlayers[rowCategory] ?? new Set())
          : (ownerToPlayers[rowCategory] ?? new Set())
        const colPlayers = categoryTypes[colCategory] === 'position'
          ? (positionToPlayers[colCategory] ?? new Set())
          : (ownerToPlayers[colCategory] ?? new Set())

        for (const playerName of rowPlayers) {
          if (!colPlayers.has(playerName)) {
            continue
          }
          const playerKey = normalizeFantasyGridValue(playerName)
          const yearsByOwner = playerYearsByOwner[playerKey] ?? {}
          answers.push({
            key: playerKey,
            name: playerName,
            yearsByOwner: {
              ...(categoryTypes[rowCategory] === 'owner' ? { [rowCategory]: sortYears(Array.from(yearsByOwner[rowCategory] ?? [])) } : {}),
              ...(categoryTypes[colCategory] === 'owner' ? { [colCategory]: sortYears(Array.from(yearsByOwner[colCategory] ?? [])) } : {}),
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
    allPlayers: sortStrings(Object.values(playerLookup)),
    answersByPair,
    playerLookup,
    playerYearsByOwner: Object.fromEntries(
      Object.entries(playerYearsByOwner).map(([playerKey, ownerMap]) => ([
        playerKey,
        Object.fromEntries(
          Object.entries(ownerMap).map(([owner, years]) => ([owner, sortYears(Array.from(years ?? []))]))
        ),
      ]))
    ),
    playerTotalStarts,
    playerStartsByOwner,
    playerHighScore,
    playerBestScoreByOwner,
    playerPositionByKey,
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

export function pickFantasyGridPuzzle(gridData, seedInput) {
  const categories = gridData?.categories ?? []
  if (categories.length < 6) {
    return null
  }

  const seed = typeof seedInput === 'number' ? seedInput : getDateSeed(seedInput ?? new Date().toISOString().slice(0, 10))
  const randomFn = mulberry32(seed)
  const shuffledOwnersForRows = shuffleWithSeed(categories, randomFn)
  const shuffledOwnersForCols = shuffleWithSeed(categories, randomFn)
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