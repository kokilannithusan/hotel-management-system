import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { generateId } from '../../utils/formatters';
import { RoomArea } from '../../types/entities';
import { Edit, Trash2, Plus, X, Check } from 'lucide-react';

export const RoomAreas: React.FC = () => {
  const { state, dispatch } = useHotel();
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState<RoomArea | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleEdit = (area: RoomArea) => {
    setEditingArea(area);
    setFormData({ name: area.name, description: area.description || '' });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingArea(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingArea) {
      dispatch({
        type: 'UPDATE_ROOM_AREA',
        payload: { ...editingArea, ...formData },
      });
    } else {
      dispatch({
        type: 'ADD_ROOM_AREA',
        payload: {
          id: generateId(),
          ...formData,
        },
      });
    }
    setShowModal(false);
  };

  const handleDelete = (area: RoomArea) => {
    if (window.confirm(`Are you sure you want to delete ${area.name}?`)) {
      dispatch({ type: 'DELETE_ROOM_AREA', payload: area.id });
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
    {
      key: 'actions',
      header: 'Actions',
      render: (area: RoomArea) => (
        <div className="flex gap-2">
          <Button aria-label="Edit area" title="Edit area" size="sm" variant="outline" onClick={() => handleEdit(area)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button aria-label="Delete area" title="Delete area" size="sm" variant="danger" onClick={() => handleDelete(area)}>
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
            Room Areas
          </h1>
          <p className="text-slate-600 mt-1 font-medium">Organize rooms by areas and sections</p>
        </div>
        <Button aria-label="Add area" title="Add area" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <Card>
        <Table columns={columns} data={state.roomAreas} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingArea ? 'Edit Room Area' : 'Add Room Area'}
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
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
};

