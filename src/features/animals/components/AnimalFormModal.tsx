import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';
import { useAddAnimal } from '../api/mutations';
import { v4 as uuidv4 } from 'uuid';

export function AnimalFormModal({ onClose }: { onClose: () => void }) {
  const mutation = useAddAnimal();

  const form = useForm({
    validatorAdapter: zodValidator(),
    defaultValues: {
      name: '',
      species: '',
      census_count: 1,
      is_venomous: false,
      weight_unit: 'kg',
      red_list_status: 'LC',
    },
    onSubmit: async ({ value }) => {
      // DTO Scrubber
      const scrubbedData = {
        id: uuidv4(),
        entity_type: 'ANIMAL',
        name: value.name === '' ? null : value.name,
        species: value.species === '' ? null : value.species,
        census_count: value.census_count,
        is_venomous: value.is_venomous ?? false,
        weight_unit: value.weight_unit,
        red_list_status: value.red_list_status,
        display_order: 0,
        // Ensure booleans for optional fields
        is_dob_unknown: false,
        lineage_unknown: false,
        is_boarding: false,
        is_quarantine: false,
        archived: false,
        is_deleted: false,
      };

      try {
        await mutation.mutateAsync(scrubbedData);
        onClose();
      } catch (e) {
        alert('Failed to save animal. Check console.');
      }
    },
  });

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4">
      <form
        className="bg-slate-900 border border-slate-700 p-6 w-full max-w-lg rounded-sm"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <h2 className="text-lg font-bold text-white mb-4">Add Animal</h2>
        
        <div className="grid gap-4">
          <form.Field name="name" children={(field) => (
            <div>
              <label className="block text-xs uppercase text-slate-500">Name</label>
              <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 text-sm text-white" />
            </div>
          )} />
          
          <form.Field name="species" children={(field) => (
            <div>
              <label className="block text-xs uppercase text-slate-500">Species</label>
              <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 text-sm text-white" />
            </div>
          )} />

          <button type="submit" className="bg-emerald-600 text-white p-2 text-sm font-bold mt-4">Save Animal</button>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 text-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}
