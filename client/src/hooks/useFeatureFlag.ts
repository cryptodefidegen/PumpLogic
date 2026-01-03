import { useState, useEffect } from "react";

interface FeatureState {
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useFeatureFlag(featureKey: string): FeatureState {
  const [state, setState] = useState<FeatureState>({
    isEnabled: true,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const checkFeature = async () => {
      try {
        const response = await fetch(`/api/features/${featureKey}`);
        if (response.ok) {
          const data = await response.json();
          setState({
            isEnabled: data.isEnabled,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            isEnabled: true,
            isLoading: false,
            error: "Failed to check feature status",
          });
        }
      } catch (error) {
        setState({
          isEnabled: true,
          isLoading: false,
          error: "Network error",
        });
      }
    };

    checkFeature();
  }, [featureKey]);

  return state;
}

export function useMaintenanceMode(): { isMaintenanceMode: boolean; isLoading: boolean } {
  const { isEnabled, isLoading } = useFeatureFlag("maintenance_mode");
  return { isMaintenanceMode: isEnabled, isLoading };
}
