import { useRef, useState } from 'react';
export function useSession() {
  const [signedIn, setSignedIn] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authRevision, setAuthRevision] = useState(0);
  const authPending = useRef(false);
  async function changeSession(signingIn: boolean) {
    if (authPending.current) return;
    authPending.current = true;
    setAuthBusy(true);
    setAuthError('');
    try {
      const result = await (signingIn
        ? window.buildment.signIn()
        : window.buildment.signOut());
      if (result.ok || (!result.ok && result.code === 'LOCAL_SIGN_OUT')) {
        setSignedIn(signingIn);
        setAuthRevision((value) => value + 1);
      }
      if (!result.ok && result.code !== 'CANCELLED')
        setAuthError(result.message);
    } catch {
      setAuthError('Could not connect to your account. Please try again.');
    } finally {
      authPending.current = false;
      setAuthBusy(false);
    }
  }
  return {
    signedIn,
    setSignedIn,
    authBusy,
    authError,
    setAuthError,
    authRevision,
    changeSession,
  };
}
export type Session = ReturnType<typeof useSession>;
