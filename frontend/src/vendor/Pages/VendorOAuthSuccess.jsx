import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleOAuthSuccess } from '../../utils/oauthUtils';

export default function VendorOAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleOAuth = async () => {
      const token = searchParams.get('token');
      const vendorId = searchParams.get('vendorId');

      if (token && vendorId) {
        try {
          // Handle OAuth success (now async - fetches vendor profile)
          await handleOAuthSuccess(token, vendorId, 'vendor');

          // Small delay to ensure token is stored
          const timer = setTimeout(() => {
            navigate('/vendor/dashboard');
          }, 500);

          return () => clearTimeout(timer);
        } catch (error) {
          console.error('OAuth success handler failed:', error);
          navigate('/vendor/login?error=auth_failed');
        }
      } else {
        // No token or vendorId, redirect to login
        navigate('/vendor/login?error=auth_failed');
      }
    };

    handleOAuth();
  }, [searchParams, navigate]);

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
        Redirecting to your dashboard.
      </div>
    </div>
  );
}
