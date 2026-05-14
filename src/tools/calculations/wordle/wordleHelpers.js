import { buildSharedCategoryData, normalizeCategoryValue } from '../../shared/categoryData'

export const normalizeWordleValue = normalizeCategoryValue

const POSITION_ORDER = [
  'QB',
  'RB',
  'WR',
  'TE',
  'K',
  'D/ST',
  'DST',
  'DEF',
  'FLEX',
  'BE',
]

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

function getLocalDateKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getPositionRank(position) {
  const normalizedPosition = (position ?? '').toString().trim().toUpperCase()
  const index = POSITION_ORDER.indexOf(normalizedPosition)
  if (index === -1) {
    return POSITION_ORDER.length + 10
  }
  return index
}

function toRoundedNumber(value) {
  return Math.round((Number(value) || 0) * 100) / 100
}

export function buildFantasyWordleData(activeNames, playerTracker, teamTracker) {
  const sharedData = buildSharedCategoryData(activeNames, playerTracker, teamTracker, normalizeWordleValue)

  // Build lookup from name to playerTracker entry
  const playerTrackerLookup = {}
  for (const entry of playerTracker) {
    playerTrackerLookup[entry.name] = entry
  }

  const players = Object.entries(sharedData.playerLookup)
    .map(([key, name]) => {
      const trackerEntry = playerTrackerLookup[name]
      const yearArray = Array.isArray(trackerEntry?.years) ? trackerEntry.years : []
      const lastOwnedYear = yearArray.length > 0 ? Number(yearArray[yearArray.length - 1]) : null

      return {
        key,
        name,
        position: sharedData.playerPositionByKey?.[key] ?? '',
        starts: Number(sharedData.playerStarts?.[key] ?? sharedData.playerTotalStarts?.[key] ?? 0),
        benches: Number(sharedData.playerBenches?.[key] ?? 0),
        highGame: toRoundedNumber(sharedData.playerHighScore?.[key] ?? 0),
        highSeason: toRoundedNumber(sharedData.playerMaxStartScoreInYear?.[key] ?? 0),
        owner: trackerEntry?.owner ?? 'FA',
        lastOwner: trackerEntry?.['last owner'] ?? 'FA',
        lastOwnedYear: lastOwnedYear,
      }
    })
    .filter(player => player.name)
    .sort((left, right) => left.name.localeCompare(right.name))

  return {
    players,
    playerLookup: sharedData.playerLookup,
  }
}

export function pickFantasyWordleAnswer(wordleData, seedInput) {
  const players = wordleData?.players ?? []
  if (players.length === 0) {
    return null
  }

  const seed = typeof seedInput === 'number'
    ? seedInput
    : getDateSeed(seedInput ?? getLocalDateKey())
  const randomFn = mulberry32(seed)

  const ownedYears = players
    .map(player => Number(player.lastOwnedYear))
    .filter(year => Number.isFinite(year))
  const minYear = ownedYears.length > 0 ? Math.min(...ownedYears) : null
  const maxYear = ownedYears.length > 0 ? Math.max(...ownedYears) : null
  const maxStarts = players.reduce(
    (currentMax, player) => Math.max(currentMax, Number(player.starts) || 0),
    0
  )

  // Calculate actual FA ratio to set penalty multiplier for ~1 in 4 chance
  const faCount = players.filter(p => p.owner === 'FA').length
  const ownedCount = players.length - faCount
  const targetFAChance = 0.25 // 1 in 4
  let faMultiplier = 1.0

  if (faCount > 0 && ownedCount > 0) {
    // Solve for multiplier: faCount * mult / (faCount * mult + ownedCount * 1) = targetFAChance
    // Result: mult = ownedCount * targetFAChance / (faCount * (1 - targetFAChance))
    faMultiplier = (ownedCount * targetFAChance) / (faCount * (1 - targetFAChance))
  }

  const weightedPlayers = players.map(player => {
    const yearValue = Number(player.lastOwnedYear)
    const startsValue = Number(player.starts) || 0

    const yearScore =
      minYear !== null &&
      maxYear !== null &&
      Number.isFinite(yearValue) &&
      maxYear > minYear
        ? (yearValue - minYear) / (maxYear - minYear)
        : 0

    const startsScore = maxStarts > 0 ? startsValue / maxStarts : 0

    // Favor recently owned players most, with a smaller boost for higher starts.
    let weight = 1 + yearScore * 3 + startsScore * 0.6

    // Apply FA penalty based on actual ratio
    if (player.owner === 'FA') {
      weight *= faMultiplier
    }

    return {
      player,
      weight,
    }
  })

  const totalWeight = weightedPlayers.reduce((sum, item) => sum + item.weight, 0)
  if (totalWeight <= 0) {
    const fallbackIndex = Math.floor(randomFn() * players.length)
    return players[fallbackIndex]
  }

  let threshold = randomFn() * totalWeight
  for (const item of weightedPlayers) {
    threshold -= item.weight
    if (threshold <= 0) {
      return item.player
    }
  }

  return weightedPlayers[weightedPlayers.length - 1].player
}

export function createFantasyWordleSeed(leagueID, dateKey) {
  const resolvedDateKey = dateKey ?? getLocalDateKey()
  return getDateSeed(`wordle:${leagueID}:${resolvedDateKey}`)
}

export function compareWordleGuess(guessPlayer, answerPlayer) {
  if (!guessPlayer || !answerPlayer) {
    return null
  }

  function compareNumeric(guessValue, answerValue) {
    const guessNumber = Number(guessValue) || 0
    const answerNumber = Number(answerValue) || 0
    if (guessNumber === answerNumber) {
      return 'exact'
    }
    return guessNumber > answerNumber ? 'high' : 'low'
  }

  function compareString(guessValue, answerValue) {
    const guessStr = String(guessValue || '').trim().toUpperCase()
    const answerStr = String(answerValue || '').trim().toUpperCase()
    return guessStr === answerStr ? 'exact' : 'nomatch'
  }

  return {
    position: compareString(guessPlayer.position, answerPlayer.position),
    starts: compareNumeric(guessPlayer.starts, answerPlayer.starts),
    benches: compareNumeric(guessPlayer.benches, answerPlayer.benches),
    highGame: compareNumeric(guessPlayer.highGame, answerPlayer.highGame),
    highSeason: compareNumeric(guessPlayer.highSeason, answerPlayer.highSeason),
    owner: compareString(guessPlayer.owner, answerPlayer.owner),
    lastOwner: compareString(guessPlayer.lastOwner, answerPlayer.lastOwner),
    lastOwnedYear: compareNumeric(guessPlayer.lastOwnedYear, answerPlayer.lastOwnedYear),
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
  if (index === 0) {
    return `Today (${dateKey})`
  }
  if (index === 1) {
    return `Yesterday (${dateKey})`
  }
  return dateKey
}
