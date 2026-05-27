import { useState, useRef } from 'react'
import { Map, Marker } from 'pigeon-maps'
import { MapPin, Loader2, Navigation } from 'lucide-react'

const formatAddressParts = (address = {}) => {
  const parts = [
    address.road,
    address.neighbourhood,
    address.suburb,
    address.village,
    address.town,
    address.city,
    address.county,
    address.state,
  ].filter(Boolean)

  if (parts.length > 0) {
    const uniqueParts = [...new Set(parts.map((item) => String(item).trim()).filter(Boolean))]
    return uniqueParts.slice(0, 4).join(', ')
  }

  return ''
}

const formatSuggestionLabel = (result) => {
  const address = result?.address || {}
  const preferred = [
    address.suburb,
    address.city_district,
    address.city,
    address.county,
    address.state,
  ].filter(Boolean)

  if (preferred.length > 0) {
    return [...new Set(preferred.map((item) => String(item).trim()).filter(Boolean))].join(', ')
  }

  return result?.display_name?.split(',')?.slice(0, 2)?.join(', ') || result?.display_name || ''
}

const getSuggestionTitle = (result) => {
  const label = formatSuggestionLabel(result)
  if (label) return label

  if (typeof result?.display_name === 'string' && result.display_name.trim()) {
    return result.display_name.split(',')[0].trim()
  }

  if (typeof result?.name === 'string' && result.name.trim()) {
    return result.name.trim()
  }

  return ''
}

const parseInitialPosition = (initialLocation) => {
  if (
    initialLocation &&
    typeof initialLocation.latitude === 'number' &&
    typeof initialLocation.longitude === 'number'
  ) {
    return [initialLocation.latitude, initialLocation.longitude]
  }
  return [-6.2088, 106.8456]
}

export default function MapLocationPicker({ onLocationSelect, initialLocation = null }) {
  const [position, setPosition] = useState(parseInitialPosition(initialLocation))
  const [zoom, setZoom] = useState(13)
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState(initialLocation?.address || 'Klik di peta untuk memilih lokasi')
  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchTimerRef = useRef(null)
  const lastBoundsChangeRef = useRef(0)

  const isCoordinateText = (value) => /^\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*$/.test(String(value || ''))

  const applyLocation = (lat, lng, locationName) => {
    setPosition([lat, lng])
    const resolvedName = locationName && !isCoordinateText(locationName)
      ? locationName
      : 'Lokasi dipilih'
    setAddress(resolvedName)
    const locationLabel = resolvedName === 'Lokasi dipilih'
      ? resolvedName
      : (resolvedName.split(',')[0] || resolvedName).trim()
    setSearchQuery(locationLabel)
    setSuggestions([])
    setShowSuggestions(false)

    onLocationSelect({
      latitude: lat,
      longitude: lng,
      address: resolvedName,
    })
  }

  const reverseGeocode = async (lat, lng) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${API_URL}/geocode/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`)
      const data = await response.json()
      let locationName = formatAddressParts(data.address) || data.display_name || ''

      // If reverse result is empty or lacks display_name, try a search fallback using lat,lng
      if (!locationName) {
        try {
          const lookup = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${lat},${lng}&limit=1&addressdetails=1&accept-language=id`)
          const lookupData = await lookup.json()
          if (Array.isArray(lookupData) && lookupData.length > 0) {
            locationName = formatAddressParts(lookupData[0].address) || lookupData[0].display_name || ''
          }
        } catch (lookupErr) {
          console.warn('Reverse lookup fallback failed:', lookupErr)
        }
      }

      if (!locationName) locationName = 'Lokasi dipilih'
      applyLocation(lat, lng, locationName)
    } catch (err) {
      console.error('Reverse geocoding error:', err)
      // Keep a human-friendly label even if geocoding fails
      applyLocation(lat, lng, 'Lokasi dipilih')
    }
  }

  // Search location using Nominatim API (OpenStreetMap)
  const searchLocation = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setSearchLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const isIndonesiaQuery = /jakarta|bandung|surabaya|indonesia|jawa|bali|medan|semarang|makassar/i.test(query)
      const countryParam = isIndonesiaQuery ? '&countrycodes=id' : ''
      const searchUrl = `${API_URL}/geocode/search?q=${encodeURIComponent(query)}${countryParam}`
      console.log('🔍 Searching:', searchUrl)
      const response = await fetch(searchUrl)
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('📦 Suggestions data:', data)
      
      // Handle if data is array or wrapped in a property
      const suggestions = Array.isArray(data) ? data : (data?.results || data?.data || [])
      console.log('✅ Setting suggestions:', suggestions.length, 'items')
      setSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
    } catch (err) {
      console.error('❌ Search error:', err)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setSearchLoading(false)
    }
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    // debounce calls to Nominatim to avoid rate-limiting and improve responsiveness
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (query.trim()) {
      searchTimerRef.current = setTimeout(() => searchLocation(query), 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Select location from search result
  const selectFromSearch = (result) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const name = formatSuggestionLabel(result) || result.display_name || 'Lokasi dipilih'

    setZoom(15)
    applyLocation(lat, lng, name)
  }

  // Get user's current location
  const getCurrentLocation = () => {
    setLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setZoom(15)
          reverseGeocode(latitude, longitude)
          setLoading(false)
        },
        (err) => {
          console.error('Geolocation error:', err)
          alert('Tidak bisa akses lokasi. Silakan klik di peta untuk memilih lokasi.')
          setLoading(false)
        }
      )
    } else {
      alert('Browser tidak mendukung geolocation')
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">📍 Pilih Lokasi dari Peta</label>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-md text-xs hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
          Lokasi Saya
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Cari lokasi (cth: Jakarta, Bandung, Malang...)"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => {
            if (searchQuery.trim() && suggestions.length > 0) {
              setShowSuggestions(true)
            } else if (searchQuery.trim().length >= 2) {
              searchLocation(searchQuery)
            }
          }}
          autoComplete="off"
          className="w-full bg-gray-50 border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-green-500 outline-none"
        />
        {searchLoading && <Loader2 size={16} className="animate-spin absolute right-3 top-2.5 text-gray-400" />}
        
        {/* Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {suggestions.map((result, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectFromSearch(result)}
                className="w-full text-left px-4 py-2 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition"
              >
                <p className="text-sm font-medium text-gray-700 truncate">{getSuggestionTitle(result) || 'Lokasi ditemukan'}</p>
                <p className="text-xs text-gray-400 truncate">{result?.display_name || getSuggestionTitle(result) || 'Pilih lokasi ini'}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-2 border-gray-300 rounded-lg overflow-hidden h-80 bg-gray-100">
        <Map
            height={320}
            center={position}
            zoom={zoom}
            minZoom={3}
            maxZoom={18}
            onBoundsChanged={({ center, zoom: nextZoom }) => {
              // Throttle frequent updates while user pans to avoid UI jank
              const now = Date.now()
              if (!lastBoundsChangeRef.current || now - lastBoundsChangeRef.current > 150) {
                setPosition(center)
                setZoom(nextZoom)
                lastBoundsChangeRef.current = now
              }
            }}
            onClick={({ latLng }) => {
              const [lat, lng] = latLng
              reverseGeocode(lat, lng)
            }}
          >
          <Marker width={44} anchor={position} />
        </Map>
      </div>

      <div className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
        <MapPin size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs">
          <p className="font-semibold text-green-900">Lokasi: {address}</p>
          <p className="text-green-700 mt-1">Koordinat: {position[0].toFixed(6)}, {position[1].toFixed(6)}</p>
          <p className="text-green-700 mt-1">💡 Cari lokasi, klik di peta, atau gunakan "Lokasi Saya" untuk GPS</p>
        </div>
      </div>
    </div>
  )
}
