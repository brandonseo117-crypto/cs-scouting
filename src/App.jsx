import PitScouting from './components/PitScouting'

import { useState } from 'react'
import TeamsList from './components/TeamsList.jsx'

function App() {
  const [view, setView] = useState('scout')

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, padding: 16, borderBottom: '1px solid #ccc' }}>
        <button onClick={() => setView('scout')}>Scout a Team</button>
        <button onClick={() => setView('teams')}>View Teams</button>
      </div>
      {view === 'scout' && <PitScouting />}
      {view === 'teams' && <TeamsList />}
    </div>
  )
}

export default App