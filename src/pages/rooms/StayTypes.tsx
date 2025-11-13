import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { generateId } from '../../utils/formatters';
import { StayType } from '../../types/entities';
import { Edit, Trash2, Plus, X, Check } from 'lucide-react';

export const StayTypes: React.FC = () => {
  const { state, dispatch } = useHotel();
  const [showModal, setShowModal] = useState(false);
  const [editingStayType, setEditingStayType] = useState<StayType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    hours: 24,
    rateMultiplier: 1.0,
    description: '',
  });

  const handleEdit = (stayType: StayType) => {
    setEditingStayType(stayType);
    setFormData({
      name: stayType.name,
      hours: stayType.hours || 24,
      rateMultiplier: stayType.rateMultiplier,
      description: stayType.description || '',
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingStayType(null);
    setFormData({ name: '', hours: 24, rateMultiplier: 1.0, description: '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingStayType) {
      dispatch({
        type: 'UPDATE_STAY_TYPE',
        payload: { ...editingStayType, ...formData },
      });
    } else {
      dispatch({
        type: 'ADD_STAY_TYPE',
        payload: {
          id: generateId(),
          ...formData,
        },
      });
    }
    setShowModal(false);
  };

  const handleDelete = (stayType: StayType) => {
    if (window.confirm(`Are you sure you want to delete ${stayType.name}?`)) {
      dispatch({ type: 'DELETE_STAY_TYPE', payload: stayType.id });
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'hours', header: 'Hours', render: (st: StayType) => st.hours || '-' },
    { key: 'rateMultiplier', header: 'Rate Multiplier', render: (st: StayType) => `${st.rateMultiplier}x` },
    { key: 'description', header: 'Description' },
    {
      key: 'actions',
      header: 'Actions',
      render: (st: StayType) => (
        <div className="flex gap-2">
          <Button aria-label="Edit stay type" title="Edit stay type" size="sm" variant="outline" onClick={() => handleEdit(st)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button aria-label="Delete stay type" title="Delete stay type" size="sm" variant="danger" onClick={() => handleDelete(st)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            Stay Types
          </h1>
          <p className="text-gray-600 mt-1 font-medium">Configure different stay duration options</p>
        </div>
        <Button aria-label="Add stay type" title="Add stay type" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <Card>
        <Table columns={columns} data={state.stayTypes} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingStayType ? 'Edit Stay Type' : 'Add Stay Type'}
        footer={
          <>
            <Button aria-label="Cancel" title="Cancel" variant="secondary" onClick={() => setShowModal(false)}>
              <X className="w-4 h-4" />
            </Button>
            <Button aria-label="Save" title="Save" onClick={handleSave}>
              <Check className="w-4 h-4" />
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            type="number"
            label="Hours"
            value={formData.hours}
            onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) || 24 })}
            min={1}
          />
          <Input
            type="number"
            label="Rate Multiplier"
            value={formData.rateMultiplier}
            onChange={(e) => setFormData({ ...formData, rateMultiplier: parseFloat(e.target.value) || 1.0 })}
            step="0.1"
            min={0.1}
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
};

