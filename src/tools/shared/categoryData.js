export const MANY_STARTS_CATEGORY_NAME = 'Many Starts'
export const BIG_GAME_CATEGORY_NAME = 'Big Game'
export const CHAMP_LOSER_CATEGORY_NAME = 'Champ/Loser'
export const HUGE_YEAR_CATEGORY_NAME = 'Huge Year'

const BIG_GAME_QB_THRESHOLD = 30
const BIG_GAME_OTHER_THRESHOLD = 20
const HUGE_YEAR_THRESHOLD = 200

/**
 * Calculate the 80th percentile (top 20% threshold) from a list of values
 * @param {number[]} values - Array of numeric values
 * @returns {number} The 80th percentile value (minimum value to be in top 20%)
 */
function getPercentileThreshold(values) {
  if (!values || values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  // 80th percentile index: 0.8 * (length - 1)
  const index = Math.ceil(0.8 * (sorted.length - 1))
  return sorted[index]
}

function getMaxNumberValue(valueMap) {
  if (!valueMap || typeof valueMap !== 'object') {
    return 0
  }
  return Math.max(0, ...Object.values(valueMap).map(value => Number(value) || 0))
}

function getMaxNumberWithYears(valueMap) {
  if (!valueMap || typeof valueMap !== 'object') {
    return { value: 0, years: [] }
  }

  const entries = Object.entries(valueMap)
    .map(([year, value]) => ({ year: Number(year), value: Number(value) || 0 }))
    .filter(entry => !Number.isNaN(entry.year))

  if (entries.length === 0) {
    return { value: 0, years: [] }
  }

  const maxValue = Math.max(0, ...entries.map(entry => entry.value))
  const years = entries
    .filter(entry => entry.value === maxValue)
    .map(entry => entry.year)
    .sort((left, right) => left - right)

  return { value: maxValue, years }
}

export function normalizeCategoryValue(value) {
  return (value ?? '').toString().trim().toLowerCase()
}

export function sortCategoryStrings(values) {
  return [...values].sort((left, right) => left.localeCompare(right))
}

export function sortCategoryYears(values) {
  return [...values].sort((left, right) => left - right)
}

export function buildSharedCategoryData(activeNames, playerTracker, teamTracker, normalizeValue = normalizeCategoryValue) {
  const owners = sortCategoryStrings([...new Set((activeNames ?? []).filter(Boolean))])
  const positions = sortCategoryStrings([
    ...new Set((playerTracker ?? []).map(player => player?.pos).filter(Boolean)),
  ])
  const categories = [...owners, ...positions, MANY_STARTS_CATEGORY_NAME, BIG_GAME_CATEGORY_NAME, CHAMP_LOSER_CATEGORY_NAME, HUGE_YEAR_CATEGORY_NAME]

  const categoryTypes = {}
  const ownerPlayerKeys = {}
  const positionPlayerKeys = {}
  const categoryPlayerKeys = {}
  const playerLookup = {}
  const playerYearsByOwner = {}
  const playerTotalStarts = {}
  const playerStartsByOwner = {}
  const playerHighScore = {}
  const playerBestScoreByOwner = {}
  const playerPositionByKey = {}
  const playerChampionships = {}
  const playerDeweyDoesTimes = {}
  const playerChampionshipsByOwner = {}
  const playerDeweyDoesTimesByOwner = {}
  const playerMaxStartScoreInYear = {}
  const playerMaxStartScoreInYearByOwner = {}
  const playerMaxStartScoreInYearMeta = {}
  const playerMaxStartScoreInYearMetaByOwner = {}

  for (const owner of owners) {
    categoryTypes[owner] = 'owner'
    ownerPlayerKeys[owner] = new Set()
    categoryPlayerKeys[owner] = ownerPlayerKeys[owner]
  }

  for (const position of positions) {
    categoryTypes[position] = 'position'
    positionPlayerKeys[position] = new Set()
    categoryPlayerKeys[position] = positionPlayerKeys[position]
  }

  categoryTypes[MANY_STARTS_CATEGORY_NAME] = 'many-starts'
  categoryPlayerKeys[MANY_STARTS_CATEGORY_NAME] = new Set()
  categoryTypes[BIG_GAME_CATEGORY_NAME] = 'big-game'
  categoryPlayerKeys[BIG_GAME_CATEGORY_NAME] = new Set()
  categoryTypes[CHAMP_LOSER_CATEGORY_NAME] = 'champ-loser'
  categoryPlayerKeys[CHAMP_LOSER_CATEGORY_NAME] = new Set()
  categoryTypes[HUGE_YEAR_CATEGORY_NAME] = 'huge-year'
  categoryPlayerKeys[HUGE_YEAR_CATEGORY_NAME] = new Set()

  for (const player of playerTracker ?? []) {
    if (!player?.name || !Array.isArray(player?.teams)) {
      continue
    }

    const playerKey = normalizeValue(player.name)
    if (!playerKey) {
      continue
    }

    if (!(playerKey in playerLookup)) {
      playerLookup[playerKey] = player.name
    }
    if (!(playerKey in playerYearsByOwner)) {
      playerYearsByOwner[playerKey] = {}
    }
    if (!(playerKey in playerTotalStarts)) {
      playerTotalStarts[playerKey] = 0
    }
    if (!(playerKey in playerStartsByOwner)) {
      playerStartsByOwner[playerKey] = {}
    }
    if (!(playerKey in playerHighScore)) {
      playerHighScore[playerKey] = player['highScore']?.[0] ?? 0
    }
    if (!(playerKey in playerPositionByKey)) {
      playerPositionByKey[playerKey] = player.pos ?? ''
    }
    if (!(playerKey in playerChampionships)) {
      playerChampionships[playerKey] = player?.rings ?? 0
    }
    if (!(playerKey in playerDeweyDoesTimes)) {
      playerDeweyDoesTimes[playerKey] = player?.deweyDoesTimes ?? 0
    }
    if (!(playerKey in playerChampionshipsByOwner)) {
      playerChampionshipsByOwner[playerKey] = {}
    }
    if (!(playerKey in playerDeweyDoesTimesByOwner)) {
      playerDeweyDoesTimesByOwner[playerKey] = {}
    }
    if (!(playerKey in playerMaxStartScoreInYear)) {
      const maxScoreMeta = getMaxNumberWithYears(player?.startScoreInYear)
      playerMaxStartScoreInYear[playerKey] = maxScoreMeta.value
      playerMaxStartScoreInYearMeta[playerKey] = maxScoreMeta
    }
    if (!(playerKey in playerMaxStartScoreInYearByOwner)) {
      playerMaxStartScoreInYearByOwner[playerKey] = {}
    }
    if (!(playerKey in playerMaxStartScoreInYearMetaByOwner)) {
      playerMaxStartScoreInYearMetaByOwner[playerKey] = {}
    }

    if (player.pos && positionPlayerKeys[player.pos]) {
      positionPlayerKeys[player.pos].add(playerKey)
    }

    const ownersForPlayer = [...new Set(player.teams.filter(team => owners.includes(team)))]
    for (const owner of ownersForPlayer) {
      ownerPlayerKeys[owner].add(playerKey)
      if (!(owner in playerYearsByOwner[playerKey])) {
        playerYearsByOwner[playerKey][owner] = new Set()
      }
    }

    if (player.teamInYear && typeof player.teamInYear === 'object') {
      for (const year of Object.keys(player.teamInYear)) {
        const teamsInYear = Array.isArray(player.teamInYear[year]) ? player.teamInYear[year] : []
        for (const owner of teamsInYear) {
          if (!owners.includes(owner)) {
            continue
          }
          if (!(owner in playerYearsByOwner[playerKey])) {
            playerYearsByOwner[playerKey][owner] = new Set()
          }
          const parsedYear = Number(year)
          if (!Number.isNaN(parsedYear)) {
            playerYearsByOwner[playerKey][owner].add(parsedYear)
          }
        }
      }
    }
  }

  for (const ownerName of owners) {
    const ownedPlayers = teamTracker?.[ownerName] ?? []
    for (const playerRecord of ownedPlayers) {
      const playerName = playerRecord?.name
      if (!playerName) {
        continue
      }
      const playerKey = normalizeValue(playerName)
      if (!playerKey) {
        continue
      }
      if (!(playerKey in playerTotalStarts)) {
        playerTotalStarts[playerKey] = 0
      }
      if (!(playerKey in playerStartsByOwner)) {
        playerStartsByOwner[playerKey] = {}
      }
      if (!(playerKey in playerBestScoreByOwner)) {
        playerBestScoreByOwner[playerKey] = {}
      }
      if (!(playerKey in playerChampionshipsByOwner)) {
        playerChampionshipsByOwner[playerKey] = {}
      }
      if (!(playerKey in playerDeweyDoesTimesByOwner)) {
        playerDeweyDoesTimesByOwner[playerKey] = {}
      }
      if (!(playerKey in playerMaxStartScoreInYearByOwner)) {
        playerMaxStartScoreInYearByOwner[playerKey] = {}
      }
      if (!(playerKey in playerMaxStartScoreInYearMetaByOwner)) {
        playerMaxStartScoreInYearMetaByOwner[playerKey] = {}
      }

      const weeksStarted = playerRecord['weeks started'] ?? 0
      playerTotalStarts[playerKey] += weeksStarted
      playerStartsByOwner[playerKey][ownerName] = (playerStartsByOwner[playerKey][ownerName] ?? 0) + weeksStarted
      playerBestScoreByOwner[playerKey][ownerName] = playerRecord['best score']?.[0] ?? 0
      playerChampionshipsByOwner[playerKey][ownerName] = playerRecord?.rings ?? 0
      playerDeweyDoesTimesByOwner[playerKey][ownerName] = playerRecord?.deweyDoesTimes ?? 0
      const ownerMaxScoreMeta = getMaxNumberWithYears(playerRecord?.startScoreInYear)
      playerMaxStartScoreInYearByOwner[playerKey][ownerName] = ownerMaxScoreMeta.value
      playerMaxStartScoreInYearMetaByOwner[playerKey][ownerName] = ownerMaxScoreMeta
    }
  }

  // Compute Many Starts thresholds based on top 20% (80th percentile)
  const allPlayersStarts = Object.values(playerTotalStarts)
  const manyStartsAllThreshold = getPercentileThreshold(allPlayersStarts)

  const manyStartsByOwnerThreshold = {}
  for (const ownerName of owners) {
    const ownerPlayersStarts = Array.from(ownerPlayerKeys[ownerName] ?? new Set()).map(
      playerKey => playerStartsByOwner[playerKey]?.[ownerName] ?? 0
    )
    manyStartsByOwnerThreshold[ownerName] = getPercentileThreshold(ownerPlayersStarts)
  }

  // Populate Many Starts category (all players at or above 80th percentile)
  for (const playerKey of Object.keys(playerLookup)) {
    if ((playerTotalStarts[playerKey] ?? 0) >= manyStartsAllThreshold) {
      categoryPlayerKeys[MANY_STARTS_CATEGORY_NAME].add(playerKey)
    }
    const highScore = playerHighScore[playerKey] ?? 0
    const playerPosition = playerPositionByKey[playerKey] ?? ''
    const threshold = playerPosition === 'QB' ? BIG_GAME_QB_THRESHOLD : BIG_GAME_OTHER_THRESHOLD
    if (highScore > threshold) {
      categoryPlayerKeys[BIG_GAME_CATEGORY_NAME].add(playerKey)
    }
    const championships = playerChampionships[playerKey] ?? 0
    const deweyDoesTimes = playerDeweyDoesTimes[playerKey] ?? 0
    if (championships > 0 || deweyDoesTimes > 0) {
      categoryPlayerKeys[CHAMP_LOSER_CATEGORY_NAME].add(playerKey)
    }
    const maxStartScoreInYear = playerMaxStartScoreInYear[playerKey] ?? 0
    if (maxStartScoreInYear > HUGE_YEAR_THRESHOLD) {
      categoryPlayerKeys[HUGE_YEAR_CATEGORY_NAME].add(playerKey)
    }
  }

  return {
    owners,
    positions,
    categories,
    categoryTypes,
    ownerPlayerKeys,
    positionPlayerKeys,
    categoryPlayerKeys,
    playerLookup,
    playerYearsByOwner: Object.fromEntries(
      Object.entries(playerYearsByOwner).map(([playerKey, ownerMap]) => ([
        playerKey,
        Object.fromEntries(
          Object.entries(ownerMap).map(([owner, years]) => ([owner, sortCategoryYears(Array.from(years ?? []))]))
        ),
      ]))
    ),
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
    manyStartsAllThreshold,
    manyStartsByOwnerThreshold,
  }
}
