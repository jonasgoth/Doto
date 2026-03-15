'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchPlans, addPlan, updatePlan, deletePlan } from '@/lib/queries/plans';
import type { Plan } from '@/types';

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPlans().then((data) => {
      setPlans(data);
      setLoading(false);
    });

    const channel = supabase
      .channel('plans')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'plans' },
        () => fetchPlans().then(setPlans)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const add = useCallback(async (title: string, date: string) => {
    const plan = await addPlan(title, date);
    setPlans((prev) => [...prev, plan]);
  }, []);

  const update = useCallback(async (id: string, updates: Partial<Plan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    await updatePlan(id, updates);
  }, []);

  const remove = useCallback(async (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    await deletePlan(id);
  }, []);

  const reorder = useCallback(async (reordered: Plan[]) => {
    setPlans(reordered);
    await Promise.all(
      reordered.map((p, i) => updatePlan(p.id, { position: i }))
    );
  }, []);

  return { plans, loading, addPlan: add, updatePlan: update, deletePlan: remove, reorderPlans: reorder };
}
