'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { parseISO } from 'date-fns';
import { usePlans } from '@/hooks/usePlans';
import { useMode } from '@/lib/ModeContext';
import { PlanCard } from '@/components/PlanCard';
import { AddButton } from '@/components/AddButton';
import { InlineAddPlan } from '@/components/InlineAddPlan';

const modeListVariants = {
  enter: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.14, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -5, transition: { duration: 0.10, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

export default function PlansPage() {
  const { plans, addPlan, updatePlan, deletePlan } = usePlans();
  const { mode } = useMode();
  const [addingPlan, setAddingPlan] = useState(false);

  const filteredPlans = plans.filter((p) => (p.mode ?? 'personal') === mode);
  const sortedPlans = [...filteredPlans].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return parseISO(a.date).getTime() - parseISO(b.date).getTime();
  });

  return (
    <div className="page-container">
      <div style={{ marginBottom: '40px' }}>
        <h1
          style={{
            color: 'var(--text-primary)',
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

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          variants={modeListVariants}
          initial="enter"
          animate="visible"
          exit="exit"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AnimatePresence initial={false}>
              {sortedPlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] } }}
                  style={{ overflow: 'hidden' }}
                >
                  <PlanCard
                    plan={plan}
                    onUpdate={(id, updates) => updatePlan(id, updates)}
                    onDelete={deletePlan}
                    onEnter={() => setAddingPlan(true)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {addingPlan && (
              <motion.div
                key="inline-add-plan"
                initial={{ opacity: 0, scale: 0.97, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } }}
                exit={{ opacity: 0, scale: 0.97, y: 4, transition: { duration: 0.12, ease: [0.4, 0, 0.2, 1] } }}
                style={{ marginTop: '8px' }}
              >
                <InlineAddPlan
                  onAdd={async (title, date) => { await addPlan(title, date, mode); }}
                  onCancel={() => setAddingPlan(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
          {!addingPlan && (
            <div style={{ marginTop: '8px' }}>
              <AddButton onClick={() => setAddingPlan(true)} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
