import PitScouting from './components/PitScouting'

import { useState } from 'react'
import TeamsList from './components/TeamsList.jsx'

function App() {
  const [view, setView] = useState('scout')

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, padding: 16, borderBottom: '1px solid #ccc', alignItems: 'center' }}>
        <img
          src="https://i0.wp.com/makerfaire.com/wp-content/uploads/gravity_forms/208-6bb1cbe29fec28d54a67e4aeaf9487ea/2018/08/Pobots-Logo.webp?resize=1050%2C700&strip=all&ssl=1"
          alt="POBots Logo"
          style={{ height: 40, objectFit: 'contain' }}
        />
        <button onClick={() => setView('scout')}>Scout a Team</button>
        <button onClick={() => setView('teams')}>View Teams</button>
      </div>
      {view === 'scout' && <PitScouting />}
      {view === 'teams' && <TeamsList />}
    </div>
  )
}

export default App