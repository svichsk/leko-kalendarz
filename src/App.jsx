import { useState, useEffect } from 'react'

function App() {
  const [meds, setMeds] = useState(() => {
    const saved = localStorage.getItem('mojeLeki')
    if (saved) {
      return JSON.parse(saved)
    }
    return [
      { id: 1, name: 'Acard 75 mg', totalPills: 30, packageSize: 30, pillsPerDay: 1, startDate: '2026-09-10' },
      { id: 2, name: 'Polpril 5 mg', totalPills: 28, packageSize: 28, pillsPerDay: 2, startDate: '2026-09-20' },
      { id: 3, name: 'Witaminy (Przykładowe)', totalPills: 60, packageSize: 60, pillsPerDay: 1, startDate: '2026-10-01' }
    ]
  })

  useEffect(() => {
    localStorage.setItem('mojeLeki', JSON.stringify(meds))
  }, [meds])

  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTotalPills, setNewTotalPills] = useState('')
  const [newPillsPerDay, setNewPillsPerDay] = useState('')
  const [editingId, setEditingId] = useState(null)
  
  const [expandedCards, setExpandedCards] = useState({})

  const getMedStats = (med) => {
    const start = new Date(med.startDate)
    const today = new Date()
    const daysPassed = Math.floor((today - start) / (1000 * 60 * 60 * 24))
    const safeDaysPassed = daysPassed > 0 ? daysPassed : 0 
    
    const pillsTaken = safeDaysPassed * med.pillsPerDay
    const pillsLeft = med.totalPills - pillsTaken > 0 ? med.totalPills - pillsTaken : 0
    const daysLeft = Math.floor(pillsLeft / med.pillsPerDay)

    return { 
      dni: daysLeft > 0 ? daysLeft : 0, 
      zapas: pillsLeft 
    }
  }

  const toggleCard = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setNewName('')
    setNewTotalPills('')
    setNewPillsPerDay('')
  }

  const handleSaveMed = (e) => {
    e.preventDefault() 
    if (!newName || !newTotalPills || !newPillsPerDay) return

    if (editingId) {
      setMeds(meds.map(med => med.id === editingId ? {
        ...med,
        name: newName,
        totalPills: parseInt(newTotalPills),
        packageSize: parseInt(newTotalPills),
        pillsPerDay: parseInt(newPillsPerDay)
      } : med))
    } else {
      const newMed = {
        id: Date.now(), 
        name: newName,
        totalPills: parseInt(newTotalPills),
        packageSize: parseInt(newTotalPills),
        pillsPerDay: parseInt(newPillsPerDay),
        startDate: new Date().toISOString() 
      }
      setMeds([newMed, ...meds])
    }
    closeForm()
  }

  const handleEdit = (med) => {
    setEditingId(med.id)
    setNewName(med.name)
    setNewTotalPills(med.totalPills.toString())
    setNewPillsPerDay(med.pillsPerDay.toString())
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm("Czy na pewno chcesz usunąć ten lek ze swojej listy?")) {
      setMeds(meds.filter(med => med.id !== id))
    }
  }

  const handleTakePill = (id) => {
    setMeds(meds.map(med => {
      if (med.id === id) {
        const start = new Date(med.startDate)
        const today = new Date()
        const daysPassed = Math.floor((today - start) / (1000 * 60 * 60 * 24))
        const safeDaysPassed = daysPassed > 0 ? daysPassed : 0 
        const pillsTaken = safeDaysPassed * med.pillsPerDay
        const aktualnyZapas = med.totalPills - pillsTaken

        if (aktualnyZapas > 0) {
          return { ...med, totalPills: med.totalPills - 1 }
        }
      }
      return med
    }))
  }

  const handleAddPackage = (id) => {
    setMeds(meds.map(med => {
      if (med.id === id) {
        const size = med.packageSize || parseInt(window.prompt("Ile tabletek ma nowe opakowanie?", "30") || "0")
        if (size > 0) {
          return { ...med, totalPills: med.totalPills + size, packageSize: size }
        }
      }
      return med
    }))
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans max-w-md mx-auto relative pb-24">
      
      {/* PRZYKLEJONY NAGŁÓWEK (STICKY) Z NOWĄ NAZWĄ */}
      <header className="sticky top-0 z-40 bg-gray-100 py-4 -mx-4 px-4 mb-6 shadow-sm flex items-center gap-4">
        <img 
          src="/logo.jpg" 
          alt="Logo LEKalendarz" 
          className="w-12 h-12 rounded-xl object-cover shadow-md shrink-0" 
        />
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight leading-tight">LEKalendarz</h1>
          <p className="text-gray-500 font-medium text-sm">Miej recepty pod kontrolą</p>
        </div>
      </header>
      
      <div className="space-y-4">
        {meds.map(med => {
          const { dni, zapas } = getMedStats(med)
          const dataKonca = new Date(Date.now() + dni * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL')
          const isExpanded = expandedCards[med.id]
          
          let kolor = "bg-green-100 border-green-500 text-green-900"
          let alert = "Zapas OK"
          
          if (dni < 3) {
            kolor = "bg-red-100 border-red-500 text-red-900"
            alert = "Krytycznie mało! Zamów receptę."
          } else if (dni < 7) {
            kolor = "bg-yellow-100 border-yellow-500 text-yellow-900"
            alert = "Końcówka, pomyśl o recepcie."
          }

          return (
            <div key={med.id} className={`p-5 rounded-xl border-l-8 shadow-sm relative transition-all ${kolor}`}>
              
              <button 
                onClick={() => handleEdit(med)} 
                className="absolute top-3 left-4 text-sm font-bold opacity-60 hover:opacity-100 transition-opacity uppercase tracking-wider"
              >
                Edytuj
              </button>
              
              <button 
                onClick={() => handleDelete(med.id)} 
                className="absolute top-2 right-4 text-2xl font-bold opacity-50 hover:opacity-100 transition-opacity leading-none"
                title="Usuń"
              >
                ×
              </button>
              
              <div className="flex justify-between items-end pr-2 mt-6 gap-2">
                <h2 className="text-xl font-bold leading-tight mb-1">{med.name}</h2>
                
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1.5">
                    <button 
                      onClick={() => handleTakePill(med.id)}
                      className="bg-white/70 hover:bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border border-gray-300/50 active:scale-95 transition-all text-center"
                    >
                      Wziąłem
                    </button>
                    <button 
                      onClick={() => handleAddPackage(med.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-all text-center"
                    >
                      Paczka
                    </button>
                  </div>
                  <div className="text-right min-w-[3.5rem]">
                    <span className="text-3xl font-black block leading-none">{dni}</span>
                    <span className="text-xs uppercase font-bold opacity-80">Dni</span>
                  </div>
                </div>
              </div>
              
              <p className="mt-3 text-sm font-bold opacity-90">{alert}</p>
              
              <div className="mt-3 pt-3 border-t border-current/20 flex justify-between items-center text-sm font-semibold opacity-80">
                <span>Wystarczy do:</span>
                <span>{dataKonca}</span>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-current/20 flex justify-between items-center text-sm">
                  <div>
                    <span className="block text-xs uppercase font-bold opacity-70">W zapasie</span>
                    <span className="font-bold">{zapas} szt.</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs uppercase font-bold opacity-70">Dawkowanie</span>
                    <span className="font-bold">{med.pillsPerDay} / dobę</span>
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => toggleCard(med.id)}
                className="w-full mt-3 pt-2 text-xs font-bold uppercase tracking-wider opacity-60 hover:opacity-100 text-center"
              >
                {isExpanded ? "Zwiń szczegóły" : "Rozwiń szczegóły"}
              </button>
            </div>
          )
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {editingId ? "Edytuj lek" : "Dodaj nowy lek"}
            </h2>
            <form onSubmit={handleSaveMed} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nazwa leku</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900"
                  placeholder="np. Apap Noc"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">W paczce</label>
                  <input 
                    type="number" 
                    value={newTotalPills} 
                    onChange={(e) => setNewTotalPills(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900"
                    placeholder="np. 50"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Na dobę</label>
                  <input 
                    type="number" 
                    value={newPillsPerDay} 
                    onChange={(e) => setNewPillsPerDay(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900"
                    placeholder="np. 2"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={closeForm}
                  className="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Anuluj
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors"
                >
                  Zapisz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button 
        onClick={() => {
          closeForm()
          setShowForm(true)
        }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center text-4xl font-light hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all z-40"
      >
        +
      </button>
    </div>
  )
}

export default App