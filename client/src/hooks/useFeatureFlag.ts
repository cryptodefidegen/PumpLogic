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
  const [state, setState] = useState<{ isMaintenanceMode: boolean; isLoading: boolean }>({
    isMaintenanceMode: false,
    isLoading: true,
  });

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const response = await fetch("/api/features/maintenance_mode");
        if (response.ok) {
          const data = await response.json();
          setState({
            isMaintenanceMode: data.isEnabled === true,
            isLoading: false,
          });
        } else {
          // Default to OFF if fetch fails
          setState({
            isMaintenanceMode: false,
            isLoading: false,
          });
        }
      } catch (error) {
        // Default to OFF on network errors
        setState({
          isMaintenanceMode: false,
          isLoading: false,
        });
      }
    };

    checkMaintenance();
  }, []);

  return state;
}
