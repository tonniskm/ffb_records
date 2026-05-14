import { useEffect, useMemo, useState } from 'react'
import './fantasyWordle.css'
import {
  buildFantasyWordleData,
  compareWordleGuess,
  createFantasyWordleSeed,
  getDateOptionLabel,
  getRecentDateKeys,
  normalizeWordleValue,
  pickFantasyWordleAnswer,
} from './wordleHelpers'
import { createPlayerSearchMatcher } from '../../fantasy_grid/fantasyGridUtils'

export const FantasyWordle = ({ pickMacro, vars, records }) => {
  const ownerKey = (vars.activeNames ?? []).join('|')
  const recentDateKeys = getRecentDateKeys(7)
  const [selectedDateKey, setSelectedDateKey] = useState(recentDateKeys[0])
  const storageKey = `fantasy-wordle:${vars.leagueID}:${selectedDateKey}`

  const [wordleData, setWordleData] = useState(null)
  const [answer, setAnswer] = useState(null)
  const [guessInput, setGuessInput] = useState('')
  const [guessKeys, setGuessKeys] = useState([])
  const [feedback, setFeedback] = useState('Guess a player to start Fantasy Wordle.')
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false)
  const [savedState, setSavedState] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)

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

    setSavedState(parsedState)
    setHasLoadedStorage(true)
  }, [storageKey])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setWordleData(buildFantasyWordleData(vars.activeNames, records.playerTracker, records.teamTracker))
  }, [ownerKey, records.playerTracker, records.teamTracker])

  useEffect(() => {
    if (!wordleData) {
      return
    }

    const nextAnswer = pickFantasyWordleAnswer(
      wordleData,
      createFantasyWordleSeed(vars.leagueID, selectedDateKey)
    )
    setAnswer(nextAnswer)

    const canHydrate =
      hasLoadedStorage &&
      savedState &&
      typeof savedState === 'object'

    if (!canHydrate) {
      setGuessInput('')
      setGuessKeys([])
      setShowAnswer(false)
      setFeedback('Guess a player to start Fantasy Wordle.')
      return
    }

    const restoredGuessKeys = Array.isArray(savedState.guessKeys)
      ? savedState.guessKeys.filter(key => typeof key === 'string' && wordleData.playerLookup[key])
      : []

    setGuessInput(typeof savedState.guessInput === 'string' ? savedState.guessInput : '')
    setGuessKeys(restoredGuessKeys)
    setShowAnswer(savedState.showAnswer === true)
    setFeedback(
      typeof savedState.feedback === 'string'
        ? savedState.feedback
        : 'Guess a player to start Fantasy Wordle.'
    )
  }, [hasLoadedStorage, savedState, selectedDateKey, vars.leagueID, wordleData])

  useEffect(() => {
    if (!hasLoadedStorage || !answer) {
      return
    }

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          version: 1,
          guessInput,
          guessKeys,
          feedback,
          showAnswer,
        })
      )
    } catch (_error) {
      // Ignore storage failures.
    }
  }, [answer, feedback, guessInput, guessKeys, hasLoadedStorage, showAnswer, storageKey])

  const guessRows = useMemo(() => {
    if (!wordleData || !answer) {
      return []
    }

    return guessKeys
      .map(key => wordleData.players.find(player => player.key === key))
      .filter(Boolean)
      .map(player => ({
        player,
        comparison: compareWordleGuess(player, answer),
        isCorrect: player.key === answer.key,
      }))
  }, [answer, guessKeys, wordleData])

  const isSolved = guessRows.some(row => row.isCorrect)

  const filteredPlayers = useMemo(() => {
    if (!wordleData || !guessInput.trim()) {
      return []
    }
    const doesPlayerMatch = createPlayerSearchMatcher(guessInput)
    return wordleData.players
      .filter(player => doesPlayerMatch(player.name))
      .slice(0, 12)
  }, [guessInput, wordleData])

  if (!wordleData) {
    return [
      <div className='topContainer' key='topcontfantasywordle'>
        <div className='buttonsContainer'>{pickMacro}</div>
      </div>,
      <div className='fantasyWordleShell' key='fantasywordleloading'>
        <p className='titleTxt'>Building fantasy wordle...</p>
      </div>,
    ]
  }

  function getPlayerFromInput() {
    const normalizedGuess = normalizeWordleValue(guessInput)
    if (!normalizedGuess) {
      return null
    }

    const exactKey = wordleData.players.find(player => player.key === normalizedGuess)
    if (exactKey) {
      return exactKey
    }

    const doesPlayerMatch = createPlayerSearchMatcher(guessInput)
    return wordleData.players.find(player => doesPlayerMatch(player.name)) ?? null
  }

  function submitGuess(guessedPlayer) {
    if (isSolved || showAnswer) {
      return
    }

    if (!guessedPlayer) {
      return
    }

    if (guessKeys.includes(guessedPlayer.key)) {
      setFeedback(`${guessedPlayer.name} was already guessed.`)
      return
    }

    const nextGuessKeys = [...guessKeys, guessedPlayer.key]
    setGuessKeys(nextGuessKeys)
    setGuessInput('')

    if (guessedPlayer.key === answer.key) {
      setFeedback(`Correct! The Fantasy Wordle answer is ${answer.name}.`)
      return
    }

    setFeedback(`${guessedPlayer.name} is not the answer. Keep going.`)
  }

  function resetGame() {
    setGuessInput('')
    setGuessKeys([])
    setShowAnswer(false)
    setFeedback('Guess a player to start Fantasy Wordle.')
  }

  function revealAnswer() {
    if (isSolved) {
      return
    }
    setShowAnswer(true)
    setFeedback(`Answer revealed: ${answer.name}.`)
  }

  function getCellClass(result, isStringComparison = false) {
    if (isStringComparison) {
      return result === 'exact' ? 'wordleMetricCell is-exact' : 'wordleMetricCell'
    }
    if (result === 'exact') {
      return 'wordleMetricCell is-exact'
    }
    if (result === 'high') {
      return 'wordleMetricCell is-high'
    }
    if (result === 'low') {
      return 'wordleMetricCell is-low'
    }
    return 'wordleMetricCell'
  }

  function getDirectionLabel(result, isStringComparison = false) {
    if (isStringComparison) {
      return result === 'exact' ? 'Match' : ''
    }
    if (result === 'exact') {
      return 'Match'
    }
    if (result === 'high') {
      return 'Too high'
    }
    if (result === 'low') {
      return 'Too low'
    }
    return ''
  }

  return [
    <div className='topContainer' key='topcontfantasywordle-live'>
      <div className='buttonsContainer'>
        {pickMacro}
        <div className='buttons'>
          <label style={{ textWrap: 'nowrap' }}>Date: </label>
          <select
            className='wordPicker'
            value={selectedDateKey}
            onChange={event => setSelectedDateKey(event.target.value)}
          >
            {recentDateKeys.map((dateKey, index) => (
              <option key={dateKey} value={dateKey}>{getDateOptionLabel(dateKey, index)}</option>
            ))}
          </select>
        </div>
        <div className='wordleButtonGroup'>
          <button onClick={resetGame}>Reset</button>
          {!isSolved && !showAnswer && <button onClick={revealAnswer}>Reveal</button>}
        </div>
      </div>
    </div>,

    <div className='fantasyWordleShell' key='fantasywordlebody'>
      <div className='fantasyWordleIntro'>
        <p className='titleTxt fantasyWordleTitle'>Fantasy Wordle</p>
        <p className='fantasyWordleCopy'>
          Guess the hidden player. Each guess shows position, owner, last owner, last owned year, starts, benches, best game, and best season.
          Green is exact match, red is higher than the answer, and blue is lower than the answer.
        </p>
      </div>

      <div className='fantasyWordleStats'>
        <div className='fantasyWordleStatCard'>
          <span className='fantasyWordleStatLabel'>Guesses</span>
          <strong>{guessRows.length}</strong>
        </div>
        <div className='fantasyWordleStatCard'>
          <span className='fantasyWordleStatLabel'>Date</span>
          <strong>{selectedDateKey}</strong>
        </div>
        <div className='fantasyWordleStatCard'>
          <span className='fantasyWordleStatLabel'>Status</span>
          <strong>{isSolved ? 'Solved' : (showAnswer ? 'Revealed' : 'In Progress')}</strong>
        </div>
      </div>

      <div className='fantasyWordleGuessInput'>
        <input
          className='fantasyWordleInput'
          value={guessInput}
          onChange={event => setGuessInput(event.target.value)}
          placeholder='Type a player name'
          disabled={isSolved || showAnswer}
        />
      </div>

      {!isSolved && !showAnswer && filteredPlayers.length > 0 && (
        <div className='fantasyWordleSuggestions'>
          {filteredPlayers.map(player => (
            <button
              type='button'
              key={player.key}
              className='fantasyWordleSuggestion'
              onClick={() => submitGuess(player)}
            >
              {player.name}
            </button>
          ))}
        </div>
      )}

      <p className='fantasyWordleFeedback'>{feedback}</p>
      {showAnswer && !isSolved && (
        <p className='fantasyWordleAnswerReveal'>Answer: <strong>{answer?.name}</strong></p>
      )}

      <div className='fantasyWordleBoard'>
        <div className='wordleHeaderRow'>
          <span>Name</span>
          <span>Position</span>
          <span>Owner</span>
          <span>Last Owner</span>
          <span>Last Owned</span>
          <span>Total Starts</span>
          <span>Total Benched</span>
          <span>Best Game</span>
          <span>Best Season</span>
        </div>

        {guessRows.map(row => (
          <div className='wordleGuessRow' key={row.player.key}>
            <span className={`wordleNameCell${row.isCorrect ? ' is-exact' : ''}`}>{row.player.name}</span>
            <span className={getCellClass(row.comparison?.position, true)}>
              {row.player.position || '-'}
              <small>{getDirectionLabel(row.comparison?.position, true)}</small>
            </span>
            <span className={getCellClass(row.comparison?.owner, true)}>
              {row.player.owner || '-'}
              <small>{getDirectionLabel(row.comparison?.owner, true)}</small>
            </span>
            <span className={getCellClass(row.comparison?.lastOwner, true)}>
              {row.player.lastOwner || '-'}
              <small>{getDirectionLabel(row.comparison?.lastOwner, true)}</small>
            </span>
            <span className={getCellClass(row.comparison?.lastOwnedYear)}>
              {row.player.lastOwnedYear ?? '-'}
              <small>{getDirectionLabel(row.comparison?.lastOwnedYear)}</small>
            </span>
            <span className={getCellClass(row.comparison?.starts)}>
              {row.player.starts}
              <small>{getDirectionLabel(row.comparison?.starts)}</small>
            </span>
            <span className={getCellClass(row.comparison?.benches)}>
              {row.player.benches}
              <small>{getDirectionLabel(row.comparison?.benches)}</small>
            </span>
            <span className={getCellClass(row.comparison?.highGame)}>
              {row.player.highGame.toFixed(2)}
              <small>{getDirectionLabel(row.comparison?.highGame)}</small>
            </span>
            <span className={getCellClass(row.comparison?.highSeason)}>
              {row.player.highSeason.toFixed(2)}
              <small>{getDirectionLabel(row.comparison?.highSeason)}</small>
            </span>
          </div>
        ))}

        {guessRows.length === 0 && (
          <p className='fantasyWordleEmpty'>No guesses yet.</p>
        )}
      </div>
    </div>,
  ]
}
