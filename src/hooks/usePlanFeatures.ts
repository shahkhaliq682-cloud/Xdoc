import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { PLANS, PlanFeatures, PlanLimits } from '../config/planConfig';
import { sanitizeFirestoreData } from '../lib/firebaseUtils';

export function usePlanFeatures() {
  const [loading, setLoading] = useState(true);
  const [hospitalData, setHospitalData] = useState<any>(null);

  useEffect(() => {
    // We check current auth user
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setHospitalData(null);
        setLoading(false);
        return;
      }

      const docRef = doc(db, 'hospitals', user.uid);
      const unsubscribeSnap = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setHospitalData(sanitizeFirestoreData(docSnap.data()));
          } else {
            setHospitalData(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error in usePlanFeatures onSnapshot:", error);
          setLoading(false);
        }
      );

      return () => unsubscribeSnap();
    });

    return () => unsubscribeAuth();
  }, []);

  const currentPlanKey = hospitalData?.currentPlan || 'trial';
  const planStatus = hospitalData?.planStatus || 'active';
  const planEndDateRaw = hospitalData?.planEndDate;

  const plan = PLANS[currentPlanKey] || PLANS['trial'];

  let daysRemaining = 0;
  if (planEndDateRaw) {
    const endDate = planEndDateRaw.toDate ? planEndDateRaw.toDate() : new Date(planEndDateRaw);
    const diffTime = endDate.getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  } else {
    daysRemaining = 0;
  }

  // Active status check - if expired/cancelled, restrict features of active plan (or fallback to trial)
  const isPlanActive = planStatus === 'active' && daysRemaining > 0;
  const features: PlanFeatures = isPlanActive ? plan.features : PLANS['trial'].features;
  const limits: PlanLimits = plan.limits;
  const isExpired = !isPlanActive || daysRemaining <= 0;

  return {
    loading,
    features,
    limits,
    planName: plan.name,
    planLabel: plan.label,
    daysRemaining,
    planStatus,
    currentPlan: currentPlanKey,
    planEndDate: planEndDateRaw,
    isExpired
  };
}
