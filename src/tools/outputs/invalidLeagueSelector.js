import { useState } from 'react';

export function InvalidLeagueSelector({ invalidLeagueID, eligibleLeagueIDs, onSelectLeague }) {
  const [selectedLeague, setSelectedLeague] = useState(eligibleLeagueIDs[0] || '');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: '520px', width: '100%', background: '#fff', color: '#111', borderRadius: '12px', padding: '1.5rem' }}>
        <h2 style={{ marginTop: 0 }}>Select A League</h2>
        <p style={{ marginBottom: '1rem' }}>
          League <strong>{invalidLeagueID || '(missing)'}</strong> is not valid. Choose one of the available league IDs.
        </p>
        <label htmlFor="leagueSelect" style={{ display: 'block', marginBottom: '0.5rem' }}>League ID</label>
        <select
          id="leagueSelect"
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        >
          {eligibleLeagueIDs.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
        <button type="button" onClick={() => onSelectLeague(selectedLeague)} style={{ padding: '0.5rem 1rem' }}>
          Continue
        </button>
      </div>
    </div>
  );
}
