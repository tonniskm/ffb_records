import { useEffect, useRef, useState } from 'react'
import './connections.css'
import {
  buildConnectionsData,
  checkConnectionsGuess,
  createConnectionsSeed,
  pickConnectionsPuzzle,
} from './connectionsHelpers'
import {
  buildAllCategoryEntries,
  formatSolvedGroupPlayers,
  getDateOptionLabel,
  getRecentDateKeys,
} from './connectionsUtils'

export const Connections = ({ pickMacro, vars, records }) => {
  const ownerKey = (vars.activeNames ?? []).join('|')
  const recentDateKeys = getRecentDateKeys(7)
  const [selectedDateKey, setSelectedDateKey] = useState(recentDateKeys[0])
  const storageKey = `connections:${vars.leagueID}:${selectedDateKey}`

  const [connectionsData, setConnectionsData] = useState(null)
  const [puzzle, setPuzzle] = useState(null)
  const [solvedGroupIndices, setSolvedGroupIndices] = useState([])
  const [selectedKeys, setSelectedKeys] = useState(new Set())
  const [remainingKeys, setRemainingKeys] = useState([])
  const [feedback, setFeedback] = useState('Select four players you think belong together, then submit.')
  const [guessCount, setGuessCount] = useState(0)
  const [hasGivenUp, setHasGivenUp] = useState(false)
  const [hintedGroupIndices, setHintedGroupIndices] = useState([])
  const [incorrectFlashKeys, setIncorrectFlashKeys] = useState(new Set())
  const [savedState, setSavedState] = useState(null)
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const wrongFlashTimerRef = useRef(null)

  // Load from localStorage
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
    setSavedState(parsedState)
    setHasLoadedStorage(true)
  }, [storageKey])

  // Build connections data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setConnectionsData(buildConnectionsData(vars.activeNames, records.playerTracker, records.teamTracker))
  }, [ownerKey, records.playerTracker, records.teamTracker])

  // Build puzzle and restore state
  useEffect(() => {
    if (!connectionsData) {
      return
    }

    const seed = createConnectionsSeed(vars.leagueID, selectedDateKey)
    const nextPuzzle = pickConnectionsPuzzle(connectionsData, seed)
    setPuzzle(nextPuzzle)

    const canHydrate =
      hasLoadedStorage &&
      savedState &&
      typeof savedState === 'object' &&
      nextPuzzle !== null

    if (!canHydrate) {
      setSolvedGroupIndices([])
      setRemainingKeys(nextPuzzle?.allPlayerKeys ?? [])
      setSelectedKeys(new Set())
      setGuessCount(0)
      setHasGivenUp(false)
      setHintedGroupIndices([])
      setFeedback('Select four players you think belong together, then submit.')
      return
    }

    const restoredSolved = Array.isArray(savedState.solvedGroupIndices)
      ? savedState.solvedGroupIndices.filter(
          i => typeof i === 'number' && i >= 0 && i < nextPuzzle.groups.length
        )
      : []
    const solvedKeys = new Set(restoredSolved.flatMap(i => nextPuzzle.groups[i]?.playerKeys ?? []))
    const restoredRemaining = nextPuzzle.allPlayerKeys.filter(k => !solvedKeys.has(k))

    setSolvedGroupIndices(restoredSolved)
    setRemainingKeys(restoredRemaining)
    setSelectedKeys(new Set())
    setGuessCount(typeof savedState.guessCount === 'number' ? savedState.guessCount : 0)
    setHasGivenUp(savedState.hasGivenUp === true)
    setHintedGroupIndices(
      Array.isArray(savedState.hintedGroupIndices)
        ? savedState.hintedGroupIndices.filter(i => typeof i === 'number' && i >= 0 && i < nextPuzzle.groups.length)
        : []
    )
    setFeedback(
      typeof savedState.feedback === 'string'
        ? savedState.feedback
        : 'Select four players you think belong together, then submit.'
    )
  }, [connectionsData, hasLoadedStorage, savedState, selectedDateKey, vars.leagueID])

  // Persist state
  useEffect(() => {
    if (!hasLoadedStorage || !puzzle) {
      return
    }
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ version: 1, solvedGroupIndices, guessCount, hasGivenUp, hintedGroupIndices, feedback })
      )
    } catch (_error) {
      // Ignore storage errors.
    }
  }, [feedback, guessCount, hasGivenUp, hasLoadedStorage, hintedGroupIndices, puzzle, solvedGroupIndices, storageKey])

  useEffect(() => {
    return () => {
      if (wrongFlashTimerRef.current) {
        window.clearTimeout(wrongFlashTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!showAllCategories) {
      return
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setShowAllCategories(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [showAllCategories])

  if (!connectionsData) {
    return [
      <div className='topContainer' key='topcontconn'>
        <div className='buttonsContainer'>{pickMacro}</div>
      </div>,
      <div className='connectionsShell' key='connloading'>
        <p className='titleTxt'>Building connections...</p>
      </div>,
    ]
  }

  if (!puzzle) {
    return [
      <div className='topContainer' key='topcontconn-nopuzzle'>
        <div className='buttonsContainer'>{pickMacro}</div>
      </div>,
      <div className='connectionsShell' key='connnopuzzle'>
        <p className='titleTxt'>No valid connections puzzle could be generated. More league data is needed for unique groupings.</p>
      </div>,
    ]
  }

  const allSolved = solvedGroupIndices.length === puzzle.groups.length
  const isGameOver = allSolved || hasGivenUp

  function toggleSelect(key) {
    if (isGameOver) {
      return
    }
    setSelectedKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else if (next.size < 4) {
        next.add(key)
      }
      return next
    })
  }

  function handleSubmit() {
    if (isGameOver) {
      return
    }
    if (selectedKeys.size !== 4) {
      setFeedback('Select exactly 4 players before submitting.')
      return
    }

    setGuessCount(c => c + 1)
    const result = checkConnectionsGuess(puzzle, selectedKeys)

    if (result.isCorrect) {
      const { groupIndex, groupName } = result
      const newSolved = [...solvedGroupIndices, groupIndex]
      setSolvedGroupIndices(newSolved)
      setRemainingKeys(prev => prev.filter(k => !selectedKeys.has(k)))
      setSelectedKeys(new Set())
      if (newSolved.length === puzzle.groups.length) {
        setFeedback('Congratulations! All groups found!')
      } else {
        setFeedback(`Correct! "${groupName}" group solved.`)
      }
    } else {
      const wrongKeys = [...selectedKeys]
      setIncorrectFlashKeys(new Set(wrongKeys))
      if (wrongFlashTimerRef.current) {
        window.clearTimeout(wrongFlashTimerRef.current)
      }
      wrongFlashTimerRef.current = window.setTimeout(() => {
        setSelectedKeys(new Set())
        setIncorrectFlashKeys(new Set())
        wrongFlashTimerRef.current = null
      }, 360)
      setFeedback(result.oneAway ? 'One away! You had 3 correct — try again.' : 'Not quite. Keep trying!')
    }
  }

  function handleGiveUp() {
    if (isGameOver) {
      return
    }
    setHasGivenUp(true)
    setSelectedKeys(new Set())
    setFeedback('Gave up. Here are all the groups.')
  }

  function handleHint() {
    if (isGameOver) {
      return
    }
    const hintedSet = new Set(hintedGroupIndices)
    const nextHintIndex = puzzle.groups.findIndex((_, idx) => !solvedGroupIndices.includes(idx) && !hintedSet.has(idx))
    if (nextHintIndex === -1) {
      setFeedback('No more category hints available.')
      return
    }
    const hintedGroup = puzzle.groups[nextHintIndex]
    setHintedGroupIndices(previous => [...previous, nextHintIndex])
    setFeedback(`Hint: one category is "${hintedGroup.name}".`)
  }

  function handleReset() {
    setSolvedGroupIndices([])
    setRemainingKeys(puzzle.allPlayerKeys)
    setSelectedKeys(new Set())
    setGuessCount(0)
    setHasGivenUp(false)
    setHintedGroupIndices([])
    setIncorrectFlashKeys(new Set())
    if (wrongFlashTimerRef.current) {
      window.clearTimeout(wrongFlashTimerRef.current)
      wrongFlashTimerRef.current = null
    }
    setFeedback('Select four players you think belong together, then submit.')
  }

  const solvedGroupsDisplay = solvedGroupIndices.map(idx => puzzle.groups[idx])
  const unsolvedGroupsDisplay = hasGivenUp
    ? puzzle.groups.filter((_, idx) => !solvedGroupIndices.includes(idx))
    : []
  const hintedCategories = hintedGroupIndices
    .filter(idx => !solvedGroupIndices.includes(idx))
    .map(idx => puzzle.groups[idx]?.name)
    .filter(Boolean)
  const hintedSet = new Set(hintedGroupIndices)
  const hasUnusedHints = puzzle.groups.some((_, idx) => !solvedGroupIndices.includes(idx) && !hintedSet.has(idx))
  const allCategoryEntries = buildAllCategoryEntries(connectionsData)

  return [
    <div className='topContainer' key='topcontconn-live'>
      <div className='buttonsContainer'>
        {pickMacro}
        <div className='buttons'>
          <label style={{ textWrap: 'nowrap' }}>Date: </label>
          <select
            className='wordPicker'
            value={selectedDateKey}
            onChange={e => setSelectedDateKey(e.target.value)}
          >
            {recentDateKeys.map((d, i) => (
              <option key={d} value={d}>{getDateOptionLabel(d, i)}</option>
            ))}
          </select>
        </div>
        <div className='connectionsButtonGroup'>
          <button onClick={() => setShowAllCategories(true)}>All Categories</button>
          <button onClick={handleReset}>Reset</button>
          {!isGameOver && <button onClick={handleGiveUp}>Give Up</button>}
        </div>
      </div>
    </div>,

    <div className='connectionsShell' key='connbody'>
      <div className='connectionsIntro'>
        <p className='titleTxt connectionsTitle'>Connections</p>
        <p className='connectionsCopy'>
          Find four groups of four players that share a category. Each player belongs to exactly one group.
          Colors indicate difficulty: yellow (easiest) → purple (hardest).
        </p>
      </div>

      <div className='connectionsStats'>
        <div className='connectionsStatCard'>
          <span className='connectionsStatLabel'>Solved</span>
          <strong>{solvedGroupIndices.length} / {puzzle.groups.length}</strong>
        </div>
        <div className='connectionsStatCard'>
          <span className='connectionsStatLabel'>Total Guesses</span>
          <strong>{guessCount}</strong>
        </div>
        <div className='connectionsStatCard'>
          <span className='connectionsStatLabel'>Date</span>
          <strong>{selectedDateKey}</strong>
        </div>
      </div>

      <div className='connectionsBoard'>
        {solvedGroupsDisplay.map(group => (
          <div key={group.name} className={`connectionsSolvedRow ${group.color}`}>
            <span className='connectionsSolvedName'>{group.name}</span>
            <span className='connectionsSolvedPlayers'>
              {formatSolvedGroupPlayers(group, connectionsData)}
            </span>
          </div>
        ))}

        {unsolvedGroupsDisplay.map(group => (
          <div key={group.name} className={`connectionsSolvedRow ${group.color} is-revealed`}>
            <span className='connectionsSolvedName'>{group.name}</span>
            <span className='connectionsSolvedPlayers'>
              {formatSolvedGroupPlayers(group, connectionsData)}
            </span>
          </div>
        ))}

        {!isGameOver && remainingKeys.length > 0 && (
          <div className='connectionsPlayerGrid'>
            {remainingKeys.map(key => (
              <button
                type='button'
                key={key}
                className={`connectionsPlayerCard${selectedKeys.has(key) ? ' is-selected' : ''}${incorrectFlashKeys.has(key) ? ' is-incorrect' : ''}`}
                onClick={() => toggleSelect(key)}
              >
                {connectionsData.playerLookup[key] ?? key}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className='connectionsFeedback'>{feedback}</p>
      {hintedCategories.length > 0 && (
        <p className='connectionsHintText'>
          Hint{hintedCategories.length === 1 ? '' : 's'}: {hintedCategories.join(' | ')}
        </p>
      )}

      {!isGameOver && (
        <div className='connectionsActions'>
          <button
            type='button'
            onClick={() => setSelectedKeys(new Set())}
            disabled={selectedKeys.size === 0}
          >
            Deselect All
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={selectedKeys.size !== 4}
          >
            Submit
          </button>
          <button
            type='button'
            onClick={handleHint}
            disabled={!hasUnusedHints}
          >
            Hint
          </button>
        </div>
      )}

      {allSolved && !hasGivenUp && (
        <p className='connectionsSuccess'>
          Solved in {guessCount} guess{guessCount === 1 ? '' : 'es'}!
        </p>
      )}

      {showAllCategories && (
        <div className='connectionsModalBackdrop' onClick={() => setShowAllCategories(false)}>
          <div className='connectionsModalCard' onClick={event => event.stopPropagation()}>
            <div className='connectionsModalHeader'>
              <p className='connectionsModalTitle'>All Possible Categories</p>
              <button type='button' className='connectionsModalClose' onClick={() => setShowAllCategories(false)}>
                Close
              </button>
            </div>
            <div className='connectionsCategoryList'>
              {allCategoryEntries.map(entry => (
                <div key={entry.categoryName} className='connectionsCategoryItem'>
                  <strong>{entry.title}</strong>
                  <span>{entry.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>,
  ]
}
