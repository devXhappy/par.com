// client/src/components/onboarding/OnboardingRouter.tsx
import React from "react";
import { ProfileStep, ProfessionalProfileData } from "./ProfileStep";
import { SubscriptionStep } from "./SubscriptionStep";
import { VerificationStep } from "./VerificationStep";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export const OnboardingRouter: React.FC = () => {
  const { dbUser, setProfile } = useAuth(); // ⚡ refresh après update

  // 🔧 Fonction utilitaire pour mettre à jour le statut en DB
  const updateStatus = async (
    newStatus:
      | "incomplete_profile"
      | "incomplete_payment"
      | "incomplete_verification"
      | "pending_approval"
      | "completed",
  ) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Session non disponible");

      const res = await fetch("/api/profile/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ onboardingStatus: newStatus }),
      });

      if (!res.ok) throw new Error("Erreur update onboarding_status");

      console.log(`✅ onboarding_status mis à jour → ${newStatus}`);

      // 🔥 MAJ local immédiat au lieu de refreshProfile()
      if (dbUser) {
        setProfile({ ...dbUser, onboardingStatus: newStatus });
      }
    } catch (err) {
      console.error("❌ Erreur maj onboarding_status:", err);
    }
  };

  const getStepFromStatus = (status?: string) => {
    switch (status) {
      case "incomplete_profile":
        return 1;
      case "incomplete_payment":
        return 2;
      case "incomplete_verification":
        return 3;
      case "pending_approval":
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = getStepFromStatus(dbUser?.onboardingStatus);

  return (
    <div className="p-6">
      {currentStep === 1 && (
        <ProfileStep
          onNext={async (data: ProfessionalProfileData) => {
            console.log("Profil sauvegardé", data);
            await updateStatus("incomplete_payment");
          }}
          onCancel={() => console.log("Annulé")}
        />
      )}

      {currentStep === 2 && (
        <SubscriptionStep
          onBack={() => console.log("Retour profil")}
          onComplete={async () => {
            console.log("Paiement réussi");
            await updateStatus("incomplete_verification");
          }}
        />
      )}

      {currentStep === 3 && (
        <VerificationStep
          onBack={() => console.log("Retour paiement")}
          onComplete={async () => {
            console.log("Documents envoyés");
            await updateStatus("pending_approval");
          }}
        />
      )}

      {currentStep === 4 && (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold">Vérification en attente</h2>
          <p className="text-gray-600">
            Votre compte est en cours de validation par notre équipe.
          </p>
        </div>
      )}
    </div>
  );
};
