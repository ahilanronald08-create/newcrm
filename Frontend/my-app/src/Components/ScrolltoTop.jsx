// components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

 useEffect(() => {
  console.log("ScrollToTop triggered for", pathname);
  window.scrollTo(0, 0);
}, [pathname]);


  return null;
};

export default ScrollToTop;
