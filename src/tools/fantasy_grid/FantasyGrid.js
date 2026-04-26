import { useEffect, useRef, useState } from 'react'
import './fantasyGrid.css'
import { CleanName } from '../calculations/other'
import { getCategoryDisplayInfo, getPlayerCategoryMetadataLines } from '../shared/categoryDefinitions'
import {
  buildFantasyGridData,
  createFantasyGridCells,
  createFantasyGridSeed,
  getFantasyGridCategoryMode,
  getFantasyGridCategoryModeLabel,
  getFantasyGridCellAnswers,
  getFantasyGridProgress,
  normalizeFantasyGridValue,
  pickFantasyGridPuzzle,
  validateFantasyGridGuess,
} from './gridHelpers'

function getCellKey(rowOwner, colOwner) {
  return `${rowOwner}__${colOwner}`
}

function getWrongGuessLabel(validation, rawGuess) {
  if (validation.displayName) {
    return validation.displayName
  }
  return (rawGuess ?? '').toString().trim()
}

function getCategoryDetails(categoryName, categoryTypes, puzzle, gridData) {
  return getCategoryDisplayInfo(categoryName, categoryTypes, puzzle, gridData)
}

function normalizeSearchText(value) {
  return normalizeFantasyGridValue(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function compactSearchText(value) {
  return normalizeFantasyGridValue(value).replace(/[^a-z0-9]+/g, '')
}

function createPlayerSearchMatcher(searchValue) {
  const rawSearch = (searchValue ?? '').toString().trim()
  if (!rawSearch) {
    return () => false
  }

  const normalizedSearch = normalizeSearchText(rawSearch)
  const cleanedSearch = normalizeSearchText(CleanName(rawSearch))
  const compactSearch = compactSearchText(rawSearch)
  const compactCleanedSearch = compactSearchText(CleanName(rawSearch))
  const spacedPhraseTerms = Array.from(new Set([normalizedSearch, cleanedSearch].filter(Boolean)))
  const phraseTerms = Array.from(new Set([
    ...spacedPhraseTerms,
    compactSearch,
    compactCleanedSearch,
  ].filter(Boolean)))
  const tokenTerms = Array.from(new Set(
    spacedPhraseTerms.flatMap(term => term.split(' ').filter(Boolean))
  ))

  return function matchesPlayerName(playerName) {
    const normalizedPlayerName = normalizeSearchText(playerName)
    const cleanedPlayerName = normalizeSearchText(CleanName(playerName))
    const compactPlayerName = compactSearchText(playerName)
    const compactCleanedPlayerName = compactSearchText(CleanName(playerName))
    const playerVariants = [
      normalizedPlayerName,
      cleanedPlayerName,
      compactPlayerName,
      compactCleanedPlayerName,
    ]

    if (phraseTerms.some(term => playerVariants.some(nameVariant => nameVariant.includes(term)))) {
      return true
    }

    return tokenTerms.length > 0 && playerVariants.some(nameVariant => tokenTerms.every(term => nameVariant.includes(term)))
  }
}

function getRecentDateKeys(numberOfDays) {
  const dates = []
  const baseDate = new Date()
  baseDate.setUTCHours(0, 0, 0, 0)

  for (let offset = 0; offset < numberOfDays; offset += 1) {
    const nextDate = new Date(baseDate)
    nextDate.setUTCDate(baseDate.getUTCDate() - offset)
    dates.push(nextDate.toISOString().slice(0, 10))
  }

  return dates
}

function getDateOptionLabel(dateKey, index) {
  const modeLabel = getFantasyGridCategoryModeLabel(dateKey)
  if (index === 0) {
    return modeLabel ? `Today (${dateKey}) - ${modeLabel}` : `Today (${dateKey})`
  }
  if (index === 1) {
    return modeLabel ? `Yesterday (${dateKey}) - ${modeLabel}` : `Yesterday (${dateKey})`
  }
  return modeLabel ? `${dateKey} - ${modeLabel}` : dateKey
}

function getFeedbackMessage(reason, displayName, rowOwner, colOwner, answerCount) {
  if (reason === 'correct') {
    return `${displayName} works for ${rowOwner} x ${colOwner}.`
  }
  if (reason === 'empty') {
    return 'Pick a square and enter a player name.'
  }
  if (reason === 'unknown-player') {
    return 'That player is not in this league history.'
  }
  if (reason === 'already-used') {
    return `${displayName} has already been used in another square.`
  }
  if (reason === 'wrong-cell') {
    return `${displayName} was not owned by both ${rowOwner} and ${colOwner}. ${answerCount} valid answers exist for this square.`
  }
  return 'Select a square to start playing.'
}

export const FantasyGrid = ({ pickMacro, vars, records }) => {
  const ownerKey = (vars.activeNames ?? []).join('|')
  const recentDateKeys = getRecentDateKeys(7)
  const [selectedDateKey, setSelectedDateKey] = useState(recentDateKeys[0])
  const storageKey = `fantasy-grid:${vars.leagueID}:${selectedDateKey}`
  const [gridData, setGridData] = useState(null)
  const [puzzle, setPuzzle] = useState(null)
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const [cells, setCells] = useState({})
  const [usedAnswers, setUsedAnswers] = useState(new Set())
  const [activeCellKey, setActiveCellKey] = useState('')
  const [guess, setGuess] = useState('')
  const [guessCount, setGuessCount] = useState(0)
  const [feedback, setFeedback] = useState('Select a square to start playing.')
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [savedState, setSavedState] = useState(null)
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [answerSearch, setAnswerSearch] = useState('')
  const [selectedSearchPlayer, setSelectedSearchPlayer] = useState('')
  const [frozenSolvedCount, setFrozenSolvedCount] = useState(null)
  const guessInputRef = useRef(null)

  useEffect(() => {
    if (!recentDateKeys.includes(selectedDateKey)) {
      setSelectedDateKey(recentDateKeys[0])
    }
  }, [recentDateKeys, selectedDateKey])

  useEffect(() => {
    let parsedState = null
    try {
      const rawValue = window.localStorage.getItem(storageKey)
      if (rawValue) {
        parsedState = JSON.parse(rawValue)
      }
    } catch (_error) {
      parsedState = null
    }

    if (typeof parsedState?.puzzleIndex === 'number' && parsedState.puzzleIndex >= 0) {
      setPuzzleIndex(parsedState.puzzleIndex)
    } else {
      setPuzzleIndex(0)
    }
    if (typeof parsedState?.guessCount === 'number' && parsedState.guessCount >= 0) {
      setGuessCount(parsedState.guessCount)
    } else {
      setGuessCount(0)
    }
    if (typeof parsedState?.frozenSolvedCount === 'number' && parsedState.frozenSolvedCount >= 0) {
      setFrozenSolvedCount(parsedState.frozenSolvedCount)
    } else {
      setFrozenSolvedCount(null)
    }
    setSavedState(parsedState)
    setHasLoadedStorage(true)
  }, [storageKey])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const nextGridData = buildFantasyGridData(vars.activeNames, records.playerTracker, records.teamTracker)
    setGridData(nextGridData)
  }, [ownerKey, records.playerTracker, records.teamTracker])

  useEffect(() => {
    if (!gridData) {
      return
    }

    const categoryMode = getFantasyGridCategoryMode(selectedDateKey)
    const nextPuzzle = pickFantasyGridPuzzle(
      gridData,
      createFantasyGridSeed(vars.leagueID, puzzleIndex, selectedDateKey),
      categoryMode
    )
    setPuzzle(nextPuzzle)
    const defaultCells = createFantasyGridCells(nextPuzzle?.rowOwners, nextPuzzle?.colOwners)

    const canHydrateFromSave =
      hasLoadedStorage &&
      savedState &&
      savedState.puzzleIndex === puzzleIndex &&
      typeof savedState.cells === 'object' &&
      savedState.cells !== null

    if (!canHydrateFromSave) {
      setCells(defaultCells)
      setUsedAnswers(new Set())
      setActiveCellKey('')
      setGuess('')
      setGuessCount(0)
      setFilteredPlayers([])
      setFrozenSolvedCount(null)
      setFeedback('Select a square to start playing.')
      return
    }

    const restoredCells = { ...defaultCells }
    for (const key of Object.keys(defaultCells)) {
      const storedCell = savedState.cells[key]
      if (!storedCell) {
        continue
      }
      const legacyGuess = typeof storedCell.guess === 'string' ? storedCell.guess : ''
      const isCorrect = storedCell.isCorrect === true
      const restoredWrongGuesses = Array.isArray(storedCell.incorrectGuesses)
        ? storedCell.incorrectGuesses.filter(name => typeof name === 'string' && name.trim())
        : (!isCorrect && legacyGuess ? [legacyGuess] : [])

      const rowOwner = defaultCells[key].rowOwner
      const colOwner = defaultCells[key].colOwner
      const restoredCorrectGuess = typeof storedCell.correctGuess === 'string'
        ? storedCell.correctGuess
        : (isCorrect ? legacyGuess : '')
      let restoredCorrectYearsByOwner = (storedCell.correctYearsByOwner && typeof storedCell.correctYearsByOwner === 'object')
        ? storedCell.correctYearsByOwner
        : {}

      if (isCorrect && restoredCorrectGuess) {
        const matchingAnswer = getFantasyGridCellAnswers(gridData, rowOwner, colOwner)
          .find(answer => answer.key === normalizeFantasyGridValue(restoredCorrectGuess))
        if (matchingAnswer?.yearsByOwner) {
          restoredCorrectYearsByOwner = matchingAnswer.yearsByOwner
        }
      }

      restoredCells[key] = {
        ...defaultCells[key],
        correctGuess: restoredCorrectGuess,
        correctYearsByOwner: restoredCorrectYearsByOwner,
        incorrectGuesses: restoredWrongGuesses,
        isRevealed: storedCell.isRevealed === true,
        isCorrect,
      }
    }

    const restoredUsedAnswers = new Set()
    for (const cellKey of Object.keys(restoredCells)) {
      const restoredCell = restoredCells[cellKey]
      if (!restoredCell?.isCorrect || !restoredCell.correctGuess) {
        continue
      }
      const normalizedName = normalizeFantasyGridValue(restoredCell.correctGuess)
      if (gridData.playerLookup?.[normalizedName]) {
        restoredUsedAnswers.add(normalizedName)
      }
    }
    if (Array.isArray(savedState.usedAnswers)) {
      for (const key of savedState.usedAnswers) {
        if (typeof key === 'string' && gridData.playerLookup?.[key]) {
          restoredUsedAnswers.add(key)
        }
      }
    }

    setCells(restoredCells)
    setUsedAnswers(restoredUsedAnswers)
  const restoredActiveCell = typeof savedState.activeCellKey === 'string' ? savedState.activeCellKey : ''
  setActiveCellKey(restoredCells[restoredActiveCell] ? restoredActiveCell : '')
    setGuess(typeof savedState.guess === 'string' ? savedState.guess : '')
    setGuessCount(typeof savedState.guessCount === 'number' && savedState.guessCount >= 0 ? savedState.guessCount : 0)
    setFilteredPlayers([])
    setFrozenSolvedCount(typeof savedState.frozenSolvedCount === 'number' && savedState.frozenSolvedCount >= 0 ? savedState.frozenSolvedCount : null)
    setFeedback(typeof savedState.feedback === 'string' ? savedState.feedback : 'Select a square to start playing.')
  }, [gridData, hasLoadedStorage, puzzleIndex, savedState, selectedDateKey, vars.leagueID])

  useEffect(() => {
    if (!hasLoadedStorage || !puzzle) {
      return
    }

    const stateToPersist = {
      version: 1,
      puzzleIndex,
      cells,
      usedAnswers: Array.from(usedAnswers),
      activeCellKey,
      guess,
      guessCount,
      frozenSolvedCount,
      feedback,
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(stateToPersist))
    } catch (_error) {
      // Ignore storage errors to avoid blocking game play.
    }
  }, [activeCellKey, cells, feedback, frozenSolvedCount, guess, guessCount, hasLoadedStorage, puzzle, puzzleIndex, storageKey, usedAnswers])

  useEffect(() => {
    if (!gridData || !guess.trim()) {
      setFilteredPlayers([])
      return
    }

    const doesPlayerMatch = createPlayerSearchMatcher(guess)
    const matchingPlayers = gridData.allPlayers.filter(playerName => doesPlayerMatch(playerName))
    setFilteredPlayers(matchingPlayers.slice(0, 12))
  }, [gridData, guess])

  useEffect(() => {
    if (!activeCellKey || cells[activeCellKey]?.isCorrect) {
      return
    }

    const focusTimer = window.setTimeout(() => {
      guessInputRef.current?.focus()
    }, 0)

    return () => window.clearTimeout(focusTimer)
  }, [activeCellKey, cells])

  useEffect(() => {
    setAnswerSearch('')
    setSelectedSearchPlayer('')
  }, [activeCellKey])

  useEffect(() => {
    if (!activeCellKey) {
      return
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeGuessPopup()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [activeCellKey])

  useEffect(() => {
    if (!selectedCategory) {
      return
    }

    function handleEscapeCategory(event) {
      if (event.key === 'Escape') {
        setSelectedCategory(null)
      }
    }

    window.addEventListener('keydown', handleEscapeCategory)
    return () => window.removeEventListener('keydown', handleEscapeCategory)
  }, [selectedCategory])

  if (!gridData) {
    return [
      <div className='topContainer' key='topcontfantasygrid'>
        <div className='buttonsContainer'>
          {pickMacro}
        </div>
      </div>,
      <div className='fantasyGridShell' key='fantasygridloading'>
        <p className='titleTxt'>Building fantasy grid...</p>
      </div>,
    ]
  }

  if ((gridData.categories?.length ?? 0) < 6) {
    return [
      <div className='topContainer' key='topcontfantasygrid-nodata'>
        <div className='buttonsContainer'>
          {pickMacro}
        </div>
      </div>,
      <div className='fantasyGridShell' key='fantasygridnodata'>
        <p className='titleTxt'>Fantasy Grid needs at least six distinct categories between owners and positions.</p>
      </div>,
    ]
  }

  if (!puzzle) {
    return [
      <div className='topContainer' key='topcontfantasygrid-nopuzzle'>
        <div className='buttonsContainer'>
          {pickMacro}
        </div>
      </div>,
      <div className='fantasyGridShell' key='fantasygridnopuzzle'>
        <p className='titleTxt'>No valid fantasy grid could be generated with distinct row and column owners.</p>
      </div>,
    ]
  }

  const progress = getFantasyGridProgress(cells)
  const displayedSolvedCount = frozenSolvedCount ?? progress.solved
  const activeCell = cells[activeCellKey]
  const activeCellShowsAnswers = !!(activeCell?.isCorrect || activeCell?.isRevealed)
  const activeCellAnswers = activeCell
    ? getFantasyGridCellAnswers(gridData, activeCell.rowOwner, activeCell.colOwner)
    : []
  const doesAnswerSearchMatchPlayer = createPlayerSearchMatcher(answerSearch)
  const searchedPlayers = !answerSearch.trim()
    ? []
    : gridData.allPlayers
      .filter(playerName => doesAnswerSearchMatchPlayer(playerName))
      .slice(0, 14)
  const normalizedAnswerSearch = normalizeFantasyGridValue(answerSearch)
  const selectedSearchPlayerName = selectedSearchPlayer || (
    gridData.playerLookup?.[normalizedAnswerSearch] ?? ''
  )
  const selectedSearchPlayerKey = normalizeFantasyGridValue(selectedSearchPlayerName)
  const searchedPlayerIsCorrect = !!activeCellAnswers.find(answer => answer.key === selectedSearchPlayerKey)
  const searchedPlayerMetadata = activeCell
    ? getPlayerCategoryMetadataLines({
      gridData,
      rowCategory: activeCell.rowOwner,
      colCategory: activeCell.colOwner,
      playerKey: selectedSearchPlayerKey,
    })
    : []

  function selectCell(rowOwner, colOwner) {
    const cellKey = getCellKey(rowOwner, colOwner)
    setActiveCellKey(cellKey)
    setGuess('')
    if (cells[cellKey]?.isCorrect || cells[cellKey]?.isRevealed) {
      setFeedback(`${rowOwner} x ${colOwner} is solved. Showing all possible answers.`)
      return
    }
    setFeedback(`Solve ${rowOwner} x ${colOwner}.`)
  }

  function closeGuessPopup() {
    setActiveCellKey('')
    setGuess('')
    setFilteredPlayers([])
  }

  function submitGuessValue(rawGuess, closeAfterSubmit = false) {
    if (!activeCellKey || !cells[activeCellKey]) {
      setFeedback('Select a square before submitting a player.')
      return false
    }
    const attemptedGuess = (rawGuess ?? '').toString().trim()
    if (!attemptedGuess) {
      setFeedback('Pick a square and enter a player name.')
      return false
    }

    if (attemptedGuess) {
      setGuessCount(previousCount => previousCount + 1)
    }

    const selectedCell = cells[activeCellKey]
    const validation = validateFantasyGridGuess(
      gridData,
      selectedCell.rowOwner,
      selectedCell.colOwner,
      attemptedGuess,
      usedAnswers
    )

    if (!validation.isCorrect) {
      setCells(previousCells => ({
        ...previousCells,
        [activeCellKey]: {
          ...previousCells[activeCellKey],
          incorrectGuesses: (() => {
            const wrongLabel = getWrongGuessLabel(validation, attemptedGuess)
            const existingGuesses = previousCells[activeCellKey]?.incorrectGuesses ?? []
            const normalizedWrongLabel = normalizeFantasyGridValue(wrongLabel)
            if (existingGuesses.some(name => normalizeFantasyGridValue(name) === normalizedWrongLabel)) {
              return existingGuesses
            }
            return [...existingGuesses, wrongLabel]
          })(),
        },
      }))
      setFeedback(
        getFeedbackMessage(
          validation.reason,
          validation.displayName,
          selectedCell.rowOwner,
          selectedCell.colOwner,
          validation.answerCount ?? activeCellAnswers.length
        )
      )
      if (closeAfterSubmit) {
        closeGuessPopup()
      }
      return false
    }

    const nextUsedAnswers = new Set(usedAnswers)
    nextUsedAnswers.add(validation.normalizedName)
    setUsedAnswers(nextUsedAnswers)
    setCells(previousCells => ({
      ...previousCells,
      [activeCellKey]: {
        ...previousCells[activeCellKey],
        correctGuess: validation.displayName,
        correctYearsByOwner: validation.yearsByOwner ?? {},
        isCorrect: true,
      },
    }))
    setFeedback(
      getFeedbackMessage(
        validation.reason,
        validation.displayName,
        selectedCell.rowOwner,
        selectedCell.colOwner,
        validation.answerCount
      )
    )
    if (closeAfterSubmit) {
      closeGuessPopup()
    }
    return true
  }

  function handleSuggestionSelect(playerName) {
    setGuess(playerName)
    submitGuessValue(playerName, true)
  }

  function handleResetPuzzle() {
    setCells(createFantasyGridCells(puzzle.rowOwners, puzzle.colOwners))
    setUsedAnswers(new Set())
    setActiveCellKey('')
    setGuess('')
    setGuessCount(0)
    setFilteredPlayers([])
    setFrozenSolvedCount(null)
    setFeedback('Puzzle reset. Select a square to start playing.')
  }

  function handleGiveUp() {
    if (!puzzle || !gridData) {
      return
    }

    const revealedCells = { ...cells }
    setFrozenSolvedCount(progress.solved)

    for (const rowOwner of puzzle.rowOwners) {
      for (const colOwner of puzzle.colOwners) {
        const cellKey = getCellKey(rowOwner, colOwner)
        const existingCell = cells[cellKey] ?? {}
        revealedCells[cellKey] = {
          ...existingCell,
          isRevealed: true,
        }
      }
    }

    setCells(revealedCells)
    setActiveCellKey('')
    setGuess('')
    setFilteredPlayers([])
    setFeedback('Gave up. All squares are now revealed.')
  }

  return [
    <div className='topContainer' key='topcontfantasygrid-live'>
      <div className='buttonsContainer'>
        {pickMacro}
        <div className='buttons'>
          <label style={{ textWrap: 'nowrap' }}>Grid Date: </label>
          <select className='wordPicker' value={selectedDateKey} onChange={event => setSelectedDateKey(event.target.value)}>
            {recentDateKeys.map((dateKeyOption, index) => (
              <option key={dateKeyOption} value={dateKeyOption}>{getDateOptionLabel(dateKeyOption, index)}</option>
            ))}
          </select>
        </div>
        <div className='fantasyGridButtonGroup'>
          <button onClick={handleResetPuzzle}>Reset Grid</button>
          <button onClick={handleGiveUp}>Give Up</button>
        </div>
      </div>
    </div>,
    <div className='fantasyGridShell' key='fantasygridbody'>
      <div className='fantasyGridIntro'>
        <p className='titleTxt fantasyGridTitle'>Fantasy Grid</p>
        <p className='fantasyGridCopy'>
          Pick one NFL player for each square. A valid answer must satisfy both the row category and the column category. Each player can only be used once.
        </p>
      </div>

      <div className='fantasyGridStats'>
        <div className='fantasyGridStatCard'>
          <span className='fantasyGridStatLabel'>Solved</span>
          <strong>{displayedSolvedCount} / {progress.total}</strong>
        </div>
        <div className='fantasyGridStatCard'>
          <span className='fantasyGridStatLabel'>Grid Date</span>
          <strong>{selectedDateKey}</strong>
        </div>
        <div className='fantasyGridStatCard'>
          <span className='fantasyGridStatLabel'>Total Guesses</span>
          <strong>{guessCount}</strong>
        </div>
      </div>

      <div className='fantasyGridBoard'>
        <div className='fantasyGridCorner'></div>
        {puzzle.colOwners.map(owner => (
          <div className='fantasyGridHeader fantasyGridHeaderTop' key={`col-${owner}`} onClick={() => setSelectedCategory(owner)} style={{ cursor: 'pointer' }}>
            {owner}
          </div>
        ))}

        {puzzle.rowOwners.map(rowOwner => ([
          <div className='fantasyGridHeader fantasyGridHeaderLeft' key={`row-${rowOwner}`} onClick={() => setSelectedCategory(rowOwner)} style={{ cursor: 'pointer' }}>
            {rowOwner}
          </div>,
          ...puzzle.colOwners.map(colOwner => {
            const cellKey = getCellKey(rowOwner, colOwner)
            const cell = cells[cellKey]
            const answerCount = getFantasyGridCellAnswers(gridData, rowOwner, colOwner).length
            const isActive = activeCellKey === cellKey
            const wrongGuessCount = cell?.incorrectGuesses?.length ?? 0
            const hasWrongGuesses = wrongGuessCount > 0
            const isCorrectAfterMisses = cell?.isCorrect && hasWrongGuesses

            return (
              <button
                type='button'
                className={`fantasyGridCell ${cell?.isCorrect ? 'is-correct' : ''} ${isCorrectAfterMisses ? 'is-correct-after-misses' : ''} ${!cell?.isCorrect && hasWrongGuesses ? 'is-incorrect' : ''} ${isActive ? 'is-active' : ''}`}
                key={cellKey}
                onClick={() => selectCell(rowOwner, colOwner)}
                disabled={answerCount === 0}
              >
                <span className='fantasyGridCellCount'>{answerCount} answers</span>
                {cell?.isCorrect && (
                  <>
                    <span className='fantasyGridCellValue'>
                      {cell.correctGuess}
                    </span>
                    {hasWrongGuesses && (
                      <span className='fantasyGridCellCount'>
                        {wrongGuessCount} incorrect guess{wrongGuessCount === 1 ? '' : 'es'}
                      </span>
                    )}
                    {!cell.isRevealed && (() => {
                      const cellAnswers = getFantasyGridCellAnswers(gridData, rowOwner, colOwner)
                      const correctAnswer = cellAnswers.find(ans => normalizeFantasyGridValue(ans.name) === normalizeFantasyGridValue(cell.correctGuess))
                      const metadataLines = getPlayerCategoryMetadataLines({
                        gridData,
                        rowCategory: rowOwner,
                        colCategory: colOwner,
                        playerKey: correctAnswer?.key,
                      })
                      return metadataLines.length > 0 ? (
                        <div className='fantasyGridCellYears'>
                          {metadataLines.map(line => (
                            <span key={`${cellKey}-${line}`}>{line}</span>
                          ))}
                        </div>
                      ) : null
                    })()}
                  </>
                )}
                {!cell?.isCorrect && cell?.isRevealed && !hasWrongGuesses && (
                  <span className='fantasyGridCellValue'>Revealed (click for answers)</span>
                )}
                {!cell?.isCorrect && hasWrongGuesses && (
                  <div className='fantasyGridWrongGuesses'>
                    {cell.incorrectGuesses.map(name => {
                      const metadataLines = getPlayerCategoryMetadataLines({
                        gridData,
                        rowCategory: rowOwner,
                        colCategory: colOwner,
                        playerKey: normalizeFantasyGridValue(name),
                      })
                      return (
                        <div key={`${cellKey}-${name}`} className='fantasyGridWrongGuess'>
                          <span>{name}</span>
                          {metadataLines.length > 0 && (
                            <div className='fantasyGridWrongGuessMetadata'>
                              {metadataLines.map(line => (
                                <span key={`${cellKey}-${name}-${line}`}>{line}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                {!cell?.isCorrect && !cell?.isRevealed && !hasWrongGuesses && (
                  <span className='fantasyGridCellValue'>Select square</span>
                )}
              </button>
            )
          }),
        ]))}
      </div>

      <p className='fantasyGridFeedback fantasyGridStatusLine'>{feedback}</p>

      {activeCell && (
        <div className='fantasyGridModalBackdrop' onClick={closeGuessPopup}>
          <div className='fantasyGridEntryCard fantasyGridModalCard' onClick={event => event.stopPropagation()}>
            <div className='fantasyGridModalHeader'>
              <p className='fantasyGridPanelTitle'>
                {activeCellShowsAnswers
                  ? `All answers for ${activeCell.rowOwner} x ${activeCell.colOwner}`
                  : `Answer for ${activeCell.rowOwner} x ${activeCell.colOwner}`}
              </p>
              <button type='button' className='fantasyGridCloseButton' onClick={closeGuessPopup}>Close</button>
            </div>

            {!activeCellShowsAnswers && (
              <div>
                <input
                  ref={guessInputRef}
                  type='text'
                  value={guess}
                  onChange={event => setGuess(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                    }
                  }}
                  placeholder='Enter an NFL player name'
                  className='fantasyGridInput'
                />
                <div className='fantasyGridSuggestionList'>
                  {filteredPlayers
                    .filter(playerName => !usedAnswers.has(normalizeFantasyGridValue(playerName)))
                    .map(playerName => (
                      <button
                        type='button'
                        key={playerName}
                        className='fantasyGridSuggestion'
                        onClick={() => handleSuggestionSelect(playerName)}
                      >
                        {playerName}
                      </button>
                    ))}
                </div>
                <div className='fantasyGridButtonGroup'>
                  <button type='button' onClick={() => setGuess('')}>Clear</button>
                </div>
                <p className='fantasyGridHint'>
                  This square has {activeCellAnswers.length} valid answers. Select one from the bubbles to submit.
                </p>
              </div>
            )}

            {activeCellShowsAnswers && (
              <>
                <div className='fantasyGridCategoryDetails'>
                  <input
                    type='text'
                    value={answerSearch}
                    onChange={event => {
                      setAnswerSearch(event.target.value)
                      setSelectedSearchPlayer('')
                    }}
                    placeholder='Search any player'
                    className='fantasyGridInput'
                  />
                  {searchedPlayers.length > 0 && (
                    <div className='fantasyGridSuggestionList'>
                      {searchedPlayers.map(playerName => (
                        <button
                          type='button'
                          key={playerName}
                          className='fantasyGridSuggestion'
                          onClick={() => {
                            setSelectedSearchPlayer(playerName)
                            setAnswerSearch(playerName)
                          }}
                        >
                          {playerName}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedSearchPlayerName && (
                    <div className='fantasyGridAnswerItem'>
                      <strong>{selectedSearchPlayerName}</strong>
                      <span>{searchedPlayerIsCorrect ? 'Valid answer for this square' : 'Not a valid answer for this square'}</span>
                      {searchedPlayerMetadata.map(line => (
                        <span key={`search-meta-${selectedSearchPlayerKey}-${line}`}>{line}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className='fantasyGridAnswerList'>
                  {activeCellAnswers.map(answer => (
                    <div className='fantasyGridAnswerItem' key={answer.key}>
                      <strong>{answer.name}</strong>
                      {getPlayerCategoryMetadataLines({
                        gridData,
                        rowCategory: activeCell.rowOwner,
                        colCategory: activeCell.colOwner,
                        playerKey: answer.key,
                      }).map(line => (
                        <span key={`${answer.key}-${line}`}>{line}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {selectedCategory && (
        <div className='fantasyGridModalBackdrop' onClick={() => setSelectedCategory(null)}>
          <div className='fantasyGridEntryCard fantasyGridModalCard' onClick={event => event.stopPropagation()}>
            <div className='fantasyGridModalHeader'>
              <p className='fantasyGridPanelTitle'>
                {getCategoryDetails(selectedCategory, gridData?.categoryTypes, puzzle, gridData).title}
              </p>
              <button type='button' className='fantasyGridCloseButton' onClick={() => setSelectedCategory(null)}>Close</button>
            </div>
            <div className='fantasyGridCategoryDetails'>
              <p className='fantasyGridCategoryType'>
                {getCategoryDetails(selectedCategory, gridData?.categoryTypes, puzzle, gridData).description}
              </p>
              <p className='fantasyGridCategoryDescription'>
                {getCategoryDetails(selectedCategory, gridData?.categoryTypes, puzzle, gridData).details}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>,
  ]
}