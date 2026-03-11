import { useState, useRef } from 'react'
import { db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'

const groqKey = import.meta.env.VITE_GROQ_API_KEY

function PitScouting() {
    const [teamNumber, setTeamNumber] = useState('')
    const [answers, setAnswers] = useState({
        submittingForImpact: '',
        wonImpactBefore: '',
        awardsWon: '',
        keyPoints: '',
        longestImpact: '',
        plannedEvents: '',
        inclusivity: '',
        futureGoals: '',
        sustainability: '',
        otherNotes: ''
    })
    const [listening, setListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [parsing, setParsing] = useState(false)
    const recognitionRef = useRef(null)

    const questions = [
        { key: 'submittingForImpact', label: 'Are they submitting for the Impact Award?' },
        { key: 'wonImpactBefore', label: 'Did they win Impact at any regional last season?' },
        { key: 'awardsWon', label: 'What awards have they won this past season?' },
        { key: 'keyPoints', label: 'Key points they touch upon these past few seasons?' },
        { key: 'longestImpact', label: 'What is their longest standing impact and why?' },
        { key: 'plannedEvents', label: 'What events have they planned this season?' },
        { key: 'inclusivity', label: 'How does the team promote inclusivity?' },
        { key: 'futureGoals', label: 'Future goals and plans for expansion?' },
        { key: 'sustainability', label: 'How do they maintain sustainability and organization?' },
        { key: 'otherNotes', label: 'Any other key points?' },
    ]

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            alert('Your browser does not support voice input. Try Chrome!')
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onstart = () => {
            console.log('recognition started')
            setListening(true)
        }

        recognition.onerror = (event) => {
            console.log('recognition error:', event.error)
        }

        recognition.onresult = (event) => {
            console.log('heard something:', event.results)
            const text = Array.from(event.results)
                .map(result => result[0].transcript)
                .join(' ')
            console.log('transcript text:', text)
            setTranscript(prev => prev + ' ' + text)
        }

        recognition.onend = () => {
            if (recognitionRef.current) {
                recognition.start()
            }
        }

        recognitionRef.current = recognition
        recognition.start()
    }

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = null
            recognitionRef.current.stop()
            recognitionRef.current = null
            setListening(false)
        }
    }

    const parseWithGroq = async () => {
        if (!transcript) {
            alert('No transcript yet — try speaking first!')
            return
        }

        setParsing(true)

        const prompt = `
You are helping an FRC robotics team scout other teams for the Impact Award.
Here is a voice transcript from a pit scout: "${transcript}"

Extract answers to these questions from the transcript. If a question isn't answered, leave it blank.
Return ONLY a valid JSON object with exactly these keys:
{
  "submittingForImpact": "",
  "wonImpactBefore": "",
  "awardsWon": "",
  "keyPoints": "",
  "longestImpact": "",
  "plannedEvents": "",
  "inclusivity": "",
  "futureGoals": "",
  "sustainability": "",
  "otherNotes": ""
}
`

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${groqKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.2
                })
            })

            const data = await response.json()
            console.log('Groq response:', data)
            if (data.error) {
                alert('Groq error: ' + data.error.message)
                return
            }
            const raw = data.choices[0].message.content
            const cleaned = raw.replace(/```json|```/g, '').trim()
            const parsed = JSON.parse(cleaned)
            setAnswers(parsed)
        } catch (err) {
            alert('Something went wrong parsing the transcript. Try again!')
            console.error(err)
        }

        setParsing(false)
    }

    const saveTeam = async () => {
        if (!teamNumber) {
            alert('Please enter a team number!')
            return
        }

        const newTeam = {
            teamNumber,
            answers,
            savedAt: new Date().toLocaleString()
        }

        try {
            await addDoc(collection(db, 'teams'), newTeam)
            alert(`Team ${teamNumber} saved!`)

            setTeamNumber('')
            setTranscript('')
            setAnswers({
                submittingForImpact: '',
                wonImpactBefore: '',
                awardsWon: '',
                keyPoints: '',
                longestImpact: '',
                plannedEvents: '',
                inclusivity: '',
                futureGoals: '',
                sustainability: '',
                otherNotes: ''
            })
        } catch (err) {
            alert('Error saving team!')
            console.error(err)
        }
    }

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
            <h1>Pit Scouting</h1>

            <div style={{ marginBottom: 20 }}>
                <label>Team Number</label>
                <input
                    type="number"
                    placeholder="e.g. 254"
                    value={teamNumber}
                    onChange={e => setTeamNumber(e.target.value)}
                    style={{ display: 'block', width: '100%', padding: 8, marginTop: 6 }}
                />
            </div>

            <div style={{ marginBottom: 24, padding: 16, border: '1px solid #ccc', borderRadius: 8, background: '#f9f9f9' }}>
                <p style={{ margin: '0 0 12px', fontWeight: 600 }}>🎙️ Voice Input</p>
                <p style={{ margin: '0 0 12px', fontSize: 13, color: 'gray' }}>
                    Tap the mic, talk freely about the team, then hit Parse to auto-fill the form.
                </p>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    {!listening ? (
                        <button
                            onClick={startListening}
                            style={{ background: '#1B4FD8', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                        >
                            Click to start recording
                        </button>
                    ) : (
                        <button
                            onClick={stopListening}
                            style={{ background: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                        >
                            🔴 Stop
                        </button>
                    )}
                    <button
                        onClick={parseWithGroq}
                        disabled={parsing || !transcript}
                        style={{ background: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 8, cursor: 'pointer', opacity: (!transcript || parsing) ? 0.5 : 1 }}
                    >
                        {parsing ? 'Parsing...' : 'Organize'}
                    </button>
                </div>
                {transcript && (
                    <div style={{ fontSize: 13, color: '#333', background: 'white', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}>
                        <strong>Transcript:</strong> {transcript}
                    </div>
                )}
            </div>

            {questions.map(q => (
                <div key={q.key} style={{ marginBottom: 20 }}>
                    <label>{q.label}</label>
                    <textarea
                        value={answers[q.key]}
                        onChange={e => setAnswers(prev => ({ ...prev, [q.key]: e.target.value }))}
                        style={{ display: 'block', width: '100%', padding: 8, marginTop: 6, minHeight: 80 }}
                    />
                </div>
            ))}

            <button
                onClick={saveTeam}
                style={{ background: '#D72638', color: 'white', padding: '12px 28px', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 16 }}
            >
                Save Team
            </button>
        </div>
    )
}

export default PitScouting