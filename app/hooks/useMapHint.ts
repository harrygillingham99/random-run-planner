import { useState } from 'react';

export const useMapHint = () => {
  const [showHint, setShowHint] = useState(true);

  const hideHint = () => {
    setShowHint(false);
  };

  return { showHint, hideHint };
};
