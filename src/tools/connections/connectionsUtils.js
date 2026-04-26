import { getCategoryDisplayInfo } from '../shared/categoryDefinitions'

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
  if (index === 0) return `Today (${dateKey})`
  if (index === 1) return `Yesterday (${dateKey})`
  return dateKey
}

function formatDecimal2(value) {
  return (Math.round((Number(value) || 0) * 100) / 100).toFixed(2)
}

function formatPlayerMetadata(group, playerKey, connectionsData) {
  if (group.type === 'owner') {
    const years = connectionsData?.playerYearsByOwner?.[playerKey]?.[group.categoryName] ?? []
    return years.length > 0 ? years.join(', ') : 'Never'
  }
  if (group.type === 'position') {
    return connectionsData?.playerPositionByKey?.[playerKey] ?? '-'
  }
  if (group.type === 'many-starts') {
    return `${connectionsData?.playerTotalStarts?.[playerKey] ?? 0} starts`
  }
  if (group.type === 'big-game') {
    return `${formatDecimal2(connectionsData?.playerHighScore?.[playerKey])} pts`
  }
  if (group.type === 'champ') {
    const rings = connectionsData?.playerChampionships?.[playerKey] ?? 0
    return `${rings} rings`
  }
  if (group.type === 'loser') {
    const dewey = connectionsData?.playerDeweyDoesTimes?.[playerKey] ?? 0
    return `${dewey} dewey`
  }
  if (group.type === 'huge-year') {
    const meta = connectionsData?.playerMaxStartScoreInYearMeta?.[playerKey]
    const value = formatDecimal2(meta?.value)
    const years = Array.isArray(meta?.years) ? meta.years : []
    if (years.length === 0) {
      return `${value}`
    }
    return `${years.join(', ')} (${value})`
  }
  if (group.type === 'winning-record') {
    return `${formatDecimal2(connectionsData?.playerWinningRate?.[playerKey])}`
  }
  if (group.type === 'bench-warmer') {
    const starts = connectionsData?.playerStarts?.[playerKey] ?? 0
    const benches = connectionsData?.playerBenches?.[playerKey] ?? 0
    return `${benches} benched, ${starts} starts`
  }
  if (group.type === 'sojourner') {
    return `${connectionsData?.playerTeamCount?.[playerKey] ?? 0} teams`
  }
  if (group.type === 'experienced') {
    return `${connectionsData?.playerYears?.[playerKey] ?? 0} years`
  }
  if (group.type === 'negative-scorer') {
    return `${connectionsData?.playerTimesNegative?.[playerKey] ?? 0} negative starts`
  }
  return ''
}

export function formatSolvedGroupPlayers(group, connectionsData) {
  return group.playerKeys
    .map(playerKey => {
      const playerName = connectionsData?.playerLookup?.[playerKey] ?? playerKey
      const metadata = formatPlayerMetadata(group, playerKey, connectionsData)
      return metadata ? `${playerName} (${metadata})` : playerName
    })
    .join(', ')
}

export function buildAllCategoryEntries(connectionsData) {
  const categoryTypeOrder = { owner: 0, position: 1 }
  return [...(connectionsData?.categories ?? [])]
    .sort((left, right) => {
      const leftType = connectionsData?.categoryTypes?.[left] ?? 'other'
      const rightType = connectionsData?.categoryTypes?.[right] ?? 'other'
      const leftOrder = categoryTypeOrder[leftType] ?? 2
      const rightOrder = categoryTypeOrder[rightType] ?? 2
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder
      }
      return left.localeCompare(right)
    })
    .map(categoryName => {
      const categoryType = connectionsData?.categoryTypes?.[categoryName] ?? 'other'
      const displayInfo = getCategoryDisplayInfo(categoryName, connectionsData?.categoryTypes, null, connectionsData)
      return {
        categoryName,
        categoryType,
        title: categoryType === 'owner' ? `Owned by ${categoryName}` : displayInfo.title,
        description: displayInfo.description,
      }
    })
}