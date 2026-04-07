import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleOAuthSuccess } from '../../utils/oauthUtils';
import { useSearchStore } from '../../api/stores/searchStore';

export default function UserOAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkAuthStatus = useSearchStore(state => state.checkAuthStatus);
  const fetchUserIntents = useSearchStore(state => state.fetchUserIntents);

  useEffect(() => {
    const handleOAuth = async () => {
      const token = searchParams.get('token');
      const userId = searchParams.get('userId');

      if (token && userId) {
        try {
          // Handle OAuth success (now async - fetches user profile)
          await handleOAuthSuccess(token, userId, 'user');

          // Check auth status and fetch intents
          checkAuthStatus();
          await fetchUserIntents();

          // Small delay to ensure everything is synced
          const timer = setTimeout(() => {
            navigate('/');
          }, 500);

          return () => clearTimeout(timer);
        } catch (error) {
          console.error('OAuth success handler failed:', error);
          navigate('/userSignIn?error=auth_failed');
        }
      } else {
        // No token or userId, redirect to login
        navigate('/userSignIn?error=auth_failed');
      }
    };

    handleOAuth();
  }, [searchParams, navigate, checkAuthStatus, fetchUserIntents]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
        Completing authentication...
      </div>
      <div style={{ fontSize: '14px', color: '#666' }}>
        Please wait while we set up your account.
      </div>
    </div>
  );
}
