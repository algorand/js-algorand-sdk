import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Styles the html page
import App from './App';
// import reportWebVitals from './reportWebVitals';

// generate html code using the React framework (javascript)
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


