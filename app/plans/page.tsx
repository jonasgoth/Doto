'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlans } from '@/hooks/usePlans';
import { PlanCard } from '@/components/PlanCard';
import { AddButton } from '@/components/AddButton';
import { InlineAddPlan } from '@/components/InlineAddPlan';
import { SortableList } from '@/components/SortableList';
import type { Plan } from '@/types';

export default function PlansPage() {
  const { plans, addPlan, updatePlan, deletePlan, reorderPlans } = usePlans();
  const [addingPlan, setAddingPlan] = useState(false);

  return (
    <div className="page-container">
      <div style={{ marginBottom: '40px' }}>
        <h1
          style={{
            color: 'var(--Text-Primary, rgba(0, 0, 0, 0.85))',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '26px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Plans
        </h1>
      </div>

      <SortableList<Plan>
        items={plans}
        onReorder={reorderPlans}
        gap={8}
        renderItem={(plan) => (
          <AnimatePresence initial={false}>
            <motion.div
              key={plan.id}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ overflow: 'hidden' }}
            >
              <PlanCard
                plan={plan}
                onUpdate={(id, title) => updatePlan(id, { title })}
                onDelete={deletePlan}
              />
            </motion.div>
          </AnimatePresence>
        )}
      />

      {addingPlan && (
        <div style={{ marginTop: '8px' }}>
          <InlineAddPlan
            onAdd={async (title, date) => { await addPlan(title, date); setAddingPlan(false); }}
            onCancel={() => setAddingPlan(false)}
          />
        </div>
      )}
      {!addingPlan && (
        <div style={{ marginTop: '8px' }}>
          <AddButton onClick={() => setAddingPlan(true)} />
        </div>
      )}
    </div>
  );
}
