import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../../../lib/db';

export function useAddAnimal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (animal: any) => {
      console.log('🚀 [Outbox] Syncing to remote persistence layer...', animal);
      // PGlite-sync manages the bidirectional sync, so a local write 
      // will be automatically pushed once the PGlite -> Electric tunnel establishes.
      return { success: true }; 
    },
    onMutate: async (newAnimal: any) => {
      console.log('💾 [Local] Writing to PGlite vault (Outbox)...', newAnimal);
      
      const { id, entity_type, census_count, name, species, ...rest } = newAnimal;
      
      // UPSERT pattern to ensure local outbox atomicity
      await db.query(`
        INSERT INTO animals (
          id, entity_type, census_count, name, species, 
          is_venomous, weight_unit, red_list_status, display_order,
          is_dob_unknown, lineage_unknown, is_boarding, is_quarantine, 
          archived, is_deleted
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, species = EXCLUDED.species, census_count = EXCLUDED.census_count
      `, [
        id, entity_type, census_count, name, species,
        rest.is_venomous ?? false,
        rest.weight_unit ?? 'kg',
        rest.red_list_status ?? 'NOT_EVALUATED',
        rest.display_order ?? 0,
        rest.is_dob_unknown ?? false,
        rest.lineage_unknown ?? false,
        rest.is_boarding ?? false,
        rest.is_quarantine ?? false,
        rest.archived ?? false,
        rest.is_deleted ?? false
      ]);
      
      queryClient.setQueryData(['animals'], (old: any[] = []) => [...old, newAnimal]);
    },
    onError: (err) => console.error('Mutation failed:', err)
  });
}
