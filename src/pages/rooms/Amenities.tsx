import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { generateId } from '../../utils/formatters';
import { Amenity } from '../../types/entities';
import { Edit, Trash2, Plus, X, Check } from 'lucide-react';

export const Amenities: React.FC = () => {
  const { state, dispatch } = useHotel();
  const [showModal, setShowModal] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [formData, setFormData] = useState({ name: '', icon: '' });

  const handleEdit = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setFormData({ name: amenity.name, icon: amenity.icon || '' });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingAmenity(null);
    setFormData({ name: '', icon: '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingAmenity) {
      dispatch({
        type: 'UPDATE_AMENITY',
        payload: { ...editingAmenity, ...formData },
      });
    } else {
      dispatch({
        type: 'ADD_AMENITY',
        payload: {
          id: generateId(),
          ...formData,
        },
      });
    }
    setShowModal(false);
  };

  const handleDelete = (amenity: Amenity) => {
    if (window.confirm(`Are you sure you want to delete ${amenity.name}?`)) {
      dispatch({ type: 'DELETE_AMENITY', payload: amenity.id });
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'icon', header: 'Icon' },
    {
      key: 'actions',
      header: 'Actions',
      render: (amenity: Amenity) => (
        <div className="flex gap-2">
          <Button aria-label="Edit amenity" title="Edit amenity" size="sm" variant="outline" onClick={() => handleEdit(amenity)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button aria-label="Delete amenity" title="Delete amenity" size="sm" variant="danger" onClick={() => handleDelete(amenity)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Amenities
          </h1>
          <p className="text-slate-600 mt-1 font-medium">Manage room amenities and features</p>
        </div>
        <Button aria-label="Add amenity" title="Add amenity" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <Card>
        <Table columns={columns} data={state.amenities} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAmenity ? 'Edit Amenity' : 'Add Amenity'}
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
            label="Icon (optional)"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="Icon name or emoji"
          />
        </div>
      </Modal>
    </div>
  );
};

