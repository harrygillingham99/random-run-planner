import { useCallback, useState } from 'react';

export const useMapHint = () => {
  const [showHint, setShowHint] = useState(true);

  const hideHint = useCallback(() => {
    setShowHint(false);
  }, []);

  return { showHint, hideHint };
};
