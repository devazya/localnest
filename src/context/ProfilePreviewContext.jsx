/**
 * ProfilePreviewContext.jsx — Social Identity & Follow System (Segment 5.1)
 * App-wide "click any avatar → Profile Preview Bottom Sheet" wiring.
 * Mounted once near the root; any component can call useProfilePreview()
 * and open(userId) without prop-drilling through the whole tree.
 */
import { createContext, useContext, useState, useCallback } from 'react';
import ProfilePreviewSheet from '../components/profile/ProfilePreviewSheet';

const ProfilePreviewCtx = createContext(null);

export function ProfilePreviewProvider({ children, viewerId, onViewProfile }) {
  const [userId, setUserId] = useState(null);

  const open  = useCallback((id) => setUserId(id), []);
  const close = useCallback(() => setUserId(null), []);

  return (
    <ProfilePreviewCtx.Provider value={{ open, close }}>
      {children}
      <ProfilePreviewSheet
        userId={userId}
        viewerId={viewerId}
        onClose={close}
        onViewProfile={(id) => { close(); onViewProfile?.(id); }}
      />
    </ProfilePreviewCtx.Provider>
  );
}

/** Returns null outside the provider — callers must guard, which Avatar does. */
export function useProfilePreview() {
  return useContext(ProfilePreviewCtx);
}
