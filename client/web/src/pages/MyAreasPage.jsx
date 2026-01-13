import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';

const MyAreasPage = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadAreas();
  }, [filter]);

  const loadAreas = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? `?is_active=${filter === 'active'}` : '';
      
      const response = await fetch(`http://localhost:8080/api/areas${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      setAreas(data.areas || []);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load AREAs' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (areaId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/areas/${areaId}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setAlert({ type: 'success', message: 'AREA status updated' });
        loadAreas();
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to toggle AREA' });
    }
  };

  const handleDelete = async (areaId) => {
    if (!window.confirm('Are you sure you want to delete this AREA?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/areas/${areaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setAlert({ type: 'success', message: 'AREA deleted successfully' });
        loadAreas();
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to delete AREA' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My AREAs</h1>
          <button
            onClick={() => navigate('/areas/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create New AREA
          </button>
        </div>

        {alert && (
          <div className="mb-6">
            <Alert {...alert} onClose={() => setAlert(null)} />
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'active', 'inactive'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Areas List */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : areas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 mb-4">No AREAs found</p>
            <button
              onClick={() => navigate('/areas/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First AREA
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {areas.map(area => (
              <AreaCard
                key={area.id}
                area={area}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={() => navigate(`/areas/${area.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AreaCard = ({ area, onToggle, onDelete, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold">{area.name}</h3>
            <span className={`text-xs px-3 py-1 rounded-full ${
              area.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {area.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          {area.description && (
            <p className="text-gray-600 text-sm mb-3">{area.description}</p>
          )}

          {/* Workflow Visualization */}
          <div className="flex items-center gap-4 py-3 px-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-1">ACTION</p>
              <p className="font-medium text-sm">{area.action.display_name}</p>
              <p className="text-xs text-gray-500">{area.action.service}</p>
            </div>
            
            <div className="text-2xl text-gray-400">→</div>
            
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-1">REACTION</p>
              <p className="font-medium text-sm">{area.reaction.display_name}</p>
              <p className="text-xs text-gray-500">{area.reaction.service}</p>
            </div>
          </div>

          {area.last_triggered && (
            <p className="text-xs text-gray-500 mt-3">
              Last triggered: {new Date(area.last_triggered).toLocaleString()}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onToggle(area.id)}
            className={`px-3 py-1 rounded text-sm ${
              area.is_active
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {area.is_active ? 'Pause' : 'Activate'}
          </button>
          
          <button
            onClick={onEdit}
            className="px-3 py-1 rounded text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
          >
            Edit
          </button>
          
          <button
            onClick={() => onDelete(area.id)}
            className="px-3 py-1 rounded text-sm bg-red-100 text-red-700 hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAreasPage;