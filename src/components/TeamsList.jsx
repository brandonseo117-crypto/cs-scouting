import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot } from 'firebase/firestore'

function TeamsList() {
    const [teams, setTeams] = useState([])
    const [selected, setSelected] = useState(null)
    const [search, setSearch] = useState('')

    const filtered = teams.filter(team =>
        team.teamNumber.toString().includes(search)
    )

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'teams'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setTeams(data)
        })

        return () => unsubscribe()
    }, [])

    if (selected) {
        return (
            <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
                <button onClick={() => setSelected(null)}>← Back</button>
                <h2>Team {selected.teamNumber}</h2>
                <p style={{ color: 'gray', fontSize: 13 }}>Scouted: {selected.savedAt}</p>
                {Object.entries(selected.answers).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: 16 }}>
                        <strong>{key}</strong>
                        <p style={{ marginTop: 4 }}>{value || 'No answer recorded'}</p>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
            <h1>Scouted Teams</h1>
            <input
                type="number"
                placeholder="Search by team number..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ display: 'block', width: '100%', padding: 8, marginBottom: 16 }}
            />
            {teams.length === 0 && <p>No teams scouted yet!</p>}
            {filtered.map((team) => (
                <div
                    key={team.id}
                    onClick={() => setSelected(team)}
                    style={{
                        padding: 16, border: '1px solid #ccc',
                        borderRadius: 8, marginBottom: 12, cursor: 'pointer'
                    }}
                >
                    <strong>Team {team.teamNumber}</strong>
                    <p style={{ margin: '4px 0 0', color: 'gray', fontSize: 13 }}>{team.savedAt}</p>
                </div>
            ))}
        </div>
    )
}

export default TeamsList