import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './redux/store.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="447562974245-n3dkhp35abet7aqdvfqv8flgkd39nai0.apps.googleusercontent.com">
  <React.StrictMode>
    <Provider store={store}>
    <ToastContainer />
    <App />
    </Provider>
  </React.StrictMode>
   </GoogleOAuthProvider>,
)
