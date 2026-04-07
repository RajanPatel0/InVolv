import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Map as MapIcon, MapPin } from 'lucide-react';
import { completeVendorProfile } from '../../utils/oauthUtils';

const markerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [35, 35],
});

// LocationSelector component for map clicks
function LocationSelector({ coords, setCoords, setMapOpen }) {
  useMapEvents({
    click(e) {
      setCoords(e.latlng);
      setMapOpen(false);
    }
  });
  return coords ? <Marker position={coords} icon={markerIcon} /> : null;
}

export default function VendorCompleteProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const [formData, setFormData] = useState({
    storeName: '',
    phone: '',
    address: '',
    category: '',
    location: {
      type: 'Point',
      coordinates: [0, 0]
    }
  });

  const token = searchParams.get('token');
  const vendorId = searchParams.get('vendorId');

  if (!token || !vendorId) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Invalid session. Please login again.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate map location is selected
    if (!coords) {
      setError('Please select your store location on the map');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        location: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        }
      };

      const result = await completeVendorProfile(submitData, token);

      if (result.success) {
        // Redirect to vendor dashboard
        navigate('/vendor/dashboard');
      } else {
        setError(result.error || 'Failed to complete profile');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>Complete Your Vendor Profile</h1>
      <p>Please fill in the required information to complete your store setup.</p>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
          color: '#c33'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Store Name */}
        <div>
          <label htmlFor="storeName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Store Name *
          </label>
          <input
            type="text"
            id="storeName"
            name="storeName"
            placeholder="Enter your store name"
            value={formData.storeName}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            placeholder="Enter your store address"
            value={formData.address}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">Select a category</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Cafe">Cafe</option>
            <option value="Bakery">Bakery</option>
            <option value="Fast Food">Fast Food</option>
            <option value="Desserts">Desserts</option>
            <option value="Beverages">Beverages</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Location Picker */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Store Location *
          </label>
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#000075',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <MapIcon size={18} />
            {coords ? 'Change Store Location' : 'Pick Store Location on Map'}
          </button>

          {mapOpen && (
            <div style={{
              marginTop: '10px',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid #ddd',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                style={{ height: '300px', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationSelector coords={coords} setCoords={setCoords} setMapOpen={setMapOpen} />
              </MapContainer>
            </div>
          )}

          {coords && (
            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              ✓ Location selected: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: loading ? '#ccc' : '#FF6B35',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '10px'
          }}
        >
          {loading ? 'Completing Profile...' : 'Complete Profile'}
        </button>
      </form>
    </div>
  );
}