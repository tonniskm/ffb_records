// Same category pool as Fantasy Grid (owners, positions, Many Starts, Big Game)
// Unique-solution guarantee: each of the 16 players on the board belongs to exactly
// one of the 4 chosen categories (enforced via exclusive-set filtering).

const MANY_STARTS_TOTAL_THRESHOLD = 20
const BIG_GAME_QB_THRESHOLD = 30
const BIG_GAME_OTHER_THRESHOLD = 20

const MANY_STARTS_NAME = 'Many Starts'
const BIG_GAME_NAME = 'Big Game'

const GROUP_COLORS = ['yellow', 'green', 'blue', 'purple']

function sortStrings(values) {
  return [...values].sort((a, b) => a.localeCompare(b))
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
  return [...values].sort((a, b) => a - b)
}

export function normalizeConnectionsValue(value) {
  return (value ?? '').toString().trim().toLowerCase()
}

export function buildConnectionsData(activeNames, playerTracker, teamTracker) {
  const owners = sortStrings([...new Set((activeNames ?? []).filter(Boolean))])
  const positions = sortStrings([
    ...new Set((playerTracker ?? []).map(p => p?.pos).filter(Boolean)),
  ])

  const categoryTypes = {}
  const categoryPlayers = {}   // { catName: Set<normalizedKey> }
  const playerLookup = {}      // { normalizedKey: displayName }
  const playerPositionByKey = {}
  const playerTotalStarts = {}
  const playerHighScore = {}
  const playerYearsByOwner = {}

  for (const owner of owners) {
    categoryTypes[owner] = 'owner'
    categoryPlayers[owner] = new Set()
  }
  for (const pos of positions) {
    categoryTypes[pos] = 'position'
    categoryPlayers[pos] = new Set()
  }
  categoryTypes[MANY_STARTS_NAME] = 'many-starts'
  categoryPlayers[MANY_STARTS_NAME] = new Set()
  categoryTypes[BIG_GAME_NAME] = 'big-game'
  categoryPlayers[BIG_GAME_NAME] = new Set()

  for (const player of playerTracker ?? []) {
    if (!player?.name || !Array.isArray(player?.teams)) {
      continue
    }
    const key = normalizeConnectionsValue(player.name)
    if (!key) {
      continue
    }

    if (!(key in playerLookup)) {
      playerLookup[key] = player.name
    }
    if (!(key in playerPositionByKey)) {
      playerPositionByKey[key] = player.pos ?? ''
    }
    if (!(key in playerHighScore)) {
      playerHighScore[key] = player['highScore']?.[0] ?? 0
    }
    if (!(key in playerTotalStarts)) {
      playerTotalStarts[key] = 0
    }
    if (!(key in playerYearsByOwner)) {
      playerYearsByOwner[key] = {}
    }

    if (player.pos && categoryPlayers[player.pos]) {
      categoryPlayers[player.pos].add(key)
    }

    const ownersForPlayer = [...new Set(player.teams.filter(team => owners.includes(team)))]
    for (const owner of ownersForPlayer) {
      categoryPlayers[owner].add(key)
      if (!(owner in playerYearsByOwner[key])) {
        playerYearsByOwner[key][owner] = new Set()
      }
    }

    if (player.teamInYear && typeof player.teamInYear === 'object') {
      for (const year of Object.keys(player.teamInYear)) {
        const teamsInYear = Array.isArray(player.teamInYear[year]) ? player.teamInYear[year] : []
        for (const owner of teamsInYear) {
          if (!owners.includes(owner)) {
            continue
          }
          if (!(owner in playerYearsByOwner[key])) {
            playerYearsByOwner[key][owner] = new Set()
          }
          const parsedYear = Number(year)
          if (!Number.isNaN(parsedYear)) {
            playerYearsByOwner[key][owner].add(parsedYear)
          }
        }
      }
    }
  }

  // Accumulate starts from teamTracker
  for (const ownerName of owners) {
    for (const playerRecord of teamTracker?.[ownerName] ?? []) {
      const name = playerRecord?.name
      if (!name) {
        continue
      }
      const key = normalizeConnectionsValue(name)
      if (!key) {
        continue
      }
      if (!(key in playerTotalStarts)) {
        playerTotalStarts[key] = 0
      }
      playerTotalStarts[key] += playerRecord['weeks started'] ?? 0
    }
  }

  // Populate Many Starts and Big Game sets
  for (const key of Object.keys(playerLookup)) {
    if ((playerTotalStarts[key] ?? 0) >= MANY_STARTS_TOTAL_THRESHOLD) {
      categoryPlayers[MANY_STARTS_NAME].add(key)
    }
    const hs = playerHighScore[key] ?? 0
    const pos = playerPositionByKey[key] ?? ''
    const threshold = pos === 'QB' ? BIG_GAME_QB_THRESHOLD : BIG_GAME_OTHER_THRESHOLD
    if (hs > threshold) {
      categoryPlayers[BIG_GAME_NAME].add(key)
    }
  }

  const categories = [...owners, ...positions, MANY_STARTS_NAME, BIG_GAME_NAME]

  return {
    categories,
    categoryTypes,
    categoryPlayers,
    playerLookup,
    allPlayers: sortStrings(Object.values(playerLookup)),
    playerPositionByKey,
    playerTotalStarts,
    playerHighScore,
    playerYearsByOwner: Object.fromEntries(
      Object.entries(playerYearsByOwner).map(([playerKey, ownerMap]) => ([
        playerKey,
        Object.fromEntries(
          Object.entries(ownerMap).map(([owner, years]) => ([owner, sortYears(Array.from(years ?? []))]))
        ),
      ]))
    ),
  }
}

// Returns, for each category in combo, the list of player keys that belong to that
// category and NO other category in the combo. This is what ensures a unique solution.
function buildExclusiveSets(combo, categoryPlayers) {
  return combo.map((catName, idx) => {
    const others = combo.filter((_, i) => i !== idx)
    const otherKeys = new Set(others.flatMap(c => [...(categoryPlayers[c] ?? new Set())]))
    return [...(categoryPlayers[catName] ?? new Set())].filter(k => !otherKeys.has(k))
  })
}

export function pickConnectionsPuzzle(connectionsData, seedInput) {
  const { categories, categoryPlayers, categoryTypes } = connectionsData
  if (categories.length < 4) {
    return null
  }

  const seed = typeof seedInput === 'number'
    ? seedInput
    : getDateSeed(seedInput ?? new Date().toISOString().slice(0, 10))
  const randomFn = mulberry32(seed)

  // Enumerate all valid 4-category combos where each category has >= 4 exclusive players
  const validCombos = []
  const n = categories.length
  for (let i = 0; i < n - 3; i += 1) {
    for (let j = i + 1; j < n - 2; j += 1) {
      for (let k = j + 1; k < n - 1; k += 1) {
        for (let l = k + 1; l < n; l += 1) {
          const combo = [categories[i], categories[j], categories[k], categories[l]]
          const exclusiveSets = buildExclusiveSets(combo, categoryPlayers)
          if (exclusiveSets.every(s => s.length >= 4)) {
            validCombos.push({ combo, exclusiveSets })
          }
        }
      }
    }
  }

  if (validCombos.length === 0) {
    return null
  }

  const shuffledCombos = shuffleWithSeed(validCombos, randomFn)
  const chosen = shuffledCombos[Math.floor(randomFn() * shuffledCombos.length)]

  const comboWithSizes = chosen.combo.map((catName, idx) => ({
    catName,
    type: categoryTypes[catName],
    exclusiveSet: chosen.exclusiveSets[idx],
    size: chosen.exclusiveSets[idx].length,
  }))

  const colorsByHardness = [...GROUP_COLORS]
  const availableColors = new Set(colorsByHardness)
  const colorByCategory = {}

  // Owner categories are always hardest available.
  const ownerEntries = comboWithSizes.filter(entry => entry.type === 'owner')
  ownerEntries.sort((a, b) => b.size - a.size)
  for (const entry of ownerEntries) {
    const hardestAvailable = [...colorsByHardness].reverse().find(color => availableColors.has(color))
    if (!hardestAvailable) {
      break
    }
    colorByCategory[entry.catName] = hardestAvailable
    availableColors.delete(hardestAvailable)
  }

  // Position categories are always easiest available.
  const positionEntries = comboWithSizes.filter(entry => entry.type === 'position')
  positionEntries.sort((a, b) => b.size - a.size)
  for (const entry of positionEntries) {
    const easiestAvailable = colorsByHardness.find(color => availableColors.has(color))
    if (!easiestAvailable) {
      break
    }
    colorByCategory[entry.catName] = easiestAvailable
    availableColors.delete(easiestAvailable)
  }

  // Remaining categories use previous behavior: larger exclusive set gets easier color.
  const remainingEntries = comboWithSizes
    .filter(entry => !(entry.catName in colorByCategory))
    .sort((a, b) => b.size - a.size)
  const remainingColorsByEase = colorsByHardness.filter(color => availableColors.has(color))
  for (let i = 0; i < remainingEntries.length; i += 1) {
    colorByCategory[remainingEntries[i].catName] = remainingColorsByEase[i]
  }

  const groups = comboWithSizes
    .map(entry => {
      const shuffledExclusive = shuffleWithSeed(entry.exclusiveSet, randomFn)
      return {
        name: entry.type === 'owner' ? `Owned by ${entry.catName}` : entry.catName,
        categoryName: entry.catName,
        type: entry.type,
        color: colorByCategory[entry.catName],
        playerKeys: shuffledExclusive.slice(0, 4),
      }
    })
    .sort((left, right) => GROUP_COLORS.indexOf(left.color) - GROUP_COLORS.indexOf(right.color))

  const allPlayerKeys = shuffleWithSeed(groups.flatMap(g => g.playerKeys), randomFn)

  return { groups, allPlayerKeys }
}

export function checkConnectionsGuess(puzzle, selectedKeys) {
  const selectedSet = new Set(selectedKeys)
  if (selectedSet.size !== 4) {
    return { isCorrect: false, oneAway: false }
  }

  for (let i = 0; i < puzzle.groups.length; i += 1) {
    const group = puzzle.groups[i]
    if (group.playerKeys.every(k => selectedSet.has(k))) {
      return {
        isCorrect: true,
        groupIndex: i,
        groupName: group.name,
        groupColor: group.color,
      }
    }
  }

  const maxMatch = Math.max(
    ...puzzle.groups.map(group => group.playerKeys.filter(k => selectedSet.has(k)).length)
  )

  return { isCorrect: false, oneAway: maxMatch === 3 }
}

export function createConnectionsSeed(leagueID, dateKey) {
  const resolvedDateKey = dateKey ?? new Date().toISOString().slice(0, 10)
  return getDateSeed(`connections:${leagueID}:${resolvedDateKey}`)
}
