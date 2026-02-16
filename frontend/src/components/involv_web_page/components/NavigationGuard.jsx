import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSearchStore } from '../../../api/stores/searchStore';

const NavigationGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const clearSelectedStore = useSearchStore(state => state.clearSelectedStore);
  const initializeFromStorage = useSearchStore(state => state.initializeFromStorage);

  useEffect(() => {
    // Check if we're coming from MyInvolv to Home
    if (location.pathname === '/' && location.state?.fromMyInvolv) {
      // Clear the selected store to prevent map errors
      clearSelectedStore();
      
      // Re-initialize from storage to get clean state
      setTimeout(() => {
        initializeFromStorage();
      }, 100);
    }
  }, [location, clearSelectedStore, initializeFromStorage]);

  return null;
};

export default NavigationGuard;