import { useEffect, useState } from 'react'
import './App.css'

const VEHICLE_TYPES = [
  { label: 'Bike', value: 0 },
  { label: 'Car', value: 1 },
  { label: 'Truck', value: 2 }
]

function App() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [vehicleNumber, setVehicleNumber] = useState('')
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[1].value)
  const [bookingMsg, setBookingMsg] = useState('')

    const apiBase = 'https://parkinglotsuboy-c4ekcvhrcbaxhtb6.centralindia-01.azurewebsites.net/api/parking'

  async function loadTickets() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/tickets`)
      if (!res.ok) throw new Error(`Failed to load tickets (${res.status})`)
      const data = await res.json()
      setTickets(data)
    } catch (e) {
      setError(e.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  async function handleBook(e) {
    e.preventDefault()
    setBookingMsg('')
    setError('')
    try {
      const res = await fetch(`${apiBase}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleNumber, vehicleType })
      })
      if (res.status === 201) {
        const ticket = await res.json()
        setBookingMsg(`Booked ticket #${ticket.id} for ${ticket.vehicleNumber}`)
        setVehicleNumber('')
        await loadTickets()
      } else if (res.status === 409) {
        const msg = await res.json().catch(() => ({ message: 'No parking spot available' }))
        setError(msg.message || 'No parking spot available')
      } else {
        setError(`Booking failed (${res.status})`)
      }
    } catch (e) {
      setError(e.message || 'Booking failed')
    }
  }

  return (
    <div className="container">
      <h1>Parking Lot</h1>

      <section className="card">
        <h2>Add Booking</h2>
        <form onSubmit={handleBook} className="form">
          <div className="form-row">
            <label htmlFor="vehicleNumber">Vehicle Number</label>
            <input
              id="vehicleNumber"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder="e.g. ABC-1234"
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="vehicleType">Vehicle Type</label>
            <select
              id="vehicleType"
              value={vehicleType}
              onChange={(e) => setVehicleType(Number(e.target.value))}
            >
              {VEHICLE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <button type="submit">Book</button>
        </form>
        {bookingMsg && <p className="success">{bookingMsg}</p>}
      </section>

      <section className="card">
        <h2>Current Bookings</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && (
          <table className="table">
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Entry Time</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>No bookings</td>
                </tr>
              ) : (
                tickets.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.vehicleNumber}</td>
                    <td>{typeof t.vehicleType === 'number' ? VEHICLE_TYPES.find(v => v.value === t.vehicleType)?.label : t.vehicleType}</td>
                    <td>{new Date(t.entryTime).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

export default App
