import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidedrawer from './Components/Sidedrawer';
import Add_lead from './Pages/Add_lead';
import Dashboard from './Pages/Dashboard';
import ScrolltoTop from './Components/ScrolltoTop';
import Preference from './Pages/Preference';
import Additional from './Pages/Additional';
import SearchLead from './Pages/Search_lead';
import Follow_Up_Lead from './Pages/Follow_Up_lead';
import Auth from "./Components/Auth";
import Sales from "../src/Pages/Sales"
import Payment from './Components/Payment';
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (token && username) {
      setUser({ email: username });
    } else {
      setUser(null);
    }
    
    setLoading(false);
  }, []); // Only run once on mount

  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Check if current page is login page
  const isLoginPage = location.pathname === '/';

  return (
    <>
      <ScrolltoTop />
      <Routes>
        {/* Public Route - Login */}
        <Route path="/" element={<Auth setUser={setUser} />} />
        
        {/* Protected Routes with Sidebar */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Sidedrawer>
              <Dashboard />
            </Sidedrawer>
          </PrivateRoute>
        } />
        
        <Route path="/addlead" element={
          <PrivateRoute>
            <Sidedrawer>
              <Add_lead />
            </Sidedrawer>
          </PrivateRoute>
        } />
        
        <Route path="/preference" element={
          <PrivateRoute>
            <Sidedrawer>
              <Preference />
            </Sidedrawer>
          </PrivateRoute>
        } />
        
        <Route path="/additional" element={
          <PrivateRoute>
            <Sidedrawer>
              <Additional />
            </Sidedrawer>
          </PrivateRoute>
        } />
        
        <Route path="/searchlead" element={
          <PrivateRoute>
            <Sidedrawer>
              <SearchLead />
            </Sidedrawer>
          </PrivateRoute>
        } />
        
        <Route path="/followuplead" element={
          <PrivateRoute>
            <Sidedrawer>
              <Follow_Up_Lead />
            </Sidedrawer>
          </PrivateRoute>
        } />
         <Route path="/Sales" element={
          <PrivateRoute>
            <Sidedrawer>
              <Sales />
            </Sidedrawer>
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
};

export default App;

