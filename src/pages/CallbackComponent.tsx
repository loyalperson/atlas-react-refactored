// import React, { useEffect } from 'react';
// import { useAuth0 } from '@auth0/auth0-react';
// import { useNavigate } from 'react-router-dom';

// export default function CallbackComponent() {
//   const { isAuthenticated, error, isLoading, getAccessTokenSilently } = useAuth0();
//   const navigate = useNavigate();

//   useEffect(() => {
//     console.log('in callback');

//     if (isLoading) {
//       console.log('Waiting');
//       // Maybe display a spinner or loading message
//       return;
//     }

//     console.log('in callback 2');


//     if (error) {
//       // Handle or display the error
//       console.log(error);
//       // Optionally redirect to a login page
//       navigate('/login');
//       return;
//     }

//     console.log('in callback 3');


//     if (isAuthenticated) {
//       // Optionally, if you need to do something with the token (like storing it)
//       const getToken = async () => {
//         try {
//           const accessToken = await getAccessTokenSilently();
//           console.log(accessToken);
//           // Store your token or do something else with it
//         } catch (e) {
//           console.error(e);
//         }
//       };

//       console.log('in callback 4');

//       getToken();

//       // Redirect to the homepage or dashboard
//       navigate('/');
//     }

//     console.log('in callback 5');

//   }, [isAuthenticated, error, isLoading, getAccessTokenSilently, navigate]);

//   // While waiting for the callback to complete, you can show a loading message or spinner
//   if (isLoading) {
//     return <div></div>;
//   }

//   // In case of an error, you can show an error message
//   if (error) {
//     return <div>{error.message}</div>;
//   }

//   // If there's no error and it's not loading, it means the callback was successful
//   return <div></div>;
// };


import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useHistory } from 'react-router-dom';

const CallbackComponent = () => {
  const { isAuthenticated, error, isLoading, getAccessTokenSilently } = useAuth0();
  const history = useHistory();

  useEffect(() => {
    if (isLoading) {
      console.log('Waiting');
      // Maybe display a spinner or loading message
      return;
    }

    if (error) {
      // Handle or display the error
      console.log(error);
      // Optionally redirect to a login page
      history.push('/login');
      return;
    }

    if (isAuthenticated) {
      // Optionally, if you need to do something with the token (like storing it)
      const getToken = async () => {
        try {
          const accessToken = await getAccessTokenSilently();
          console.log(accessToken);
          // Store your token or do something else with it
        } catch (e) {
          console.error(e);
        }
      };

      getToken();

      // Redirect to the homepage or dashboard
      history.push('/');
    }
  }, [isAuthenticated, error, isLoading, getAccessTokenSilently, history]);

  // While waiting for the callback to complete, you can show a loading message or spinner
  if (isLoading) {
    return <div></div>;
  }

  // In case of an error, you can show an error message
  if (error) {
    return <div>{error.message}</div>;
  }

  // If there's no error and it's not loading, it means the callback was successful
  return <div></div>;
};

export default CallbackComponent;
