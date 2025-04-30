import { useEffect } from 'react';

import './App.css';
import { supabase } from './Components/Database/supabaseClient.js';

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './Components/Home/index.js';
import Navbar from './Components/Navbar/index.js';
import Register from './Components/Registration/register';
import Login from './Components/Registration/login';
import Jobsearch from './Components/jobs/jobsearch.js';
import Processing from './Components/processing/index.js';
import ApplyPage from './Components/processing/apply-page.js'; // Import the new Processing component

const {
  data: { session },
} = await supabase.auth.getSession();

if (session) {
  console.log('User is logged in:', session.user);
} else {
  console.log('No user session');
}


function App() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log("User session:", session);
      } else {
        console.log("No user session");
      }
    });
  }, []);
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/jobsearch" element={<Jobsearch />} />
        <Route path="/processing" element={<Processing />} />
        <Route path='/apply/:jobId' element={<ApplyPage />} /> 
         {/* New route */}

      </Routes>
    </Router>
  );
}

export default App;
