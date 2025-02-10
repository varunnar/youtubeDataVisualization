import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/layout.css';
//import HuggingFaceMistral from './ai/testMistrail.jsx';

function LoginPage({ setUser, fetchSubs, fetchLikedVideos }) {
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => initializeGoogleSignIn();
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById('signInDiv'),
      { theme: 'outline', size: 'large' }
    );

    window.google.accounts.id.prompt();
  };

  const handleCredentialResponse = (response) => {
    const userObject = parseJwt(response.credential);
    setUser(userObject);
    fetchSubs(response.credential);
    fetchLikedVideos(response.credential);
    navigate('/visualization');
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

    const requestAccessToken = () => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, // Same client ID
            scope:'https://www.googleapis.com/auth/youtube.readonly', // Scopes
            callback: (response) => {
            if (response && response.access_token) {
                //console.log("access token found", response.access_token);
                fetchSubs(response.access_token);
                fetchLikedVideos(response.access_token);
                navigate('/visualization');
            } else {
                console.log('Failed to obtain access token.');
            }å
            },
        });

        // Request the access token
        tokenClient.requestAccessToken();
    };

  return (
    <div className='login-page'>
      <h1>Youtube Stats Page</h1>
      <h3>Sign in with Google to view your Youtube stats</h3>
      {/* <div id="signInDiv"></div> */}
      <button onClick={requestAccessToken}>Sign In with Google</button>
    </div>
  );
}

export default LoginPage;