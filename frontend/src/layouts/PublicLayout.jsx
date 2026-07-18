import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import api from '../services/api';

function PublicLayout() {
  const esCatalogo = useLocation().pathname === '/' || useLocation().pathname.startsWith('/producto');
  const [marquesina, setMarquesina] = useState('');

  useEffect(() => {
    api.get('/config').then(res => {
      const text = res.data?.data?.marquesina || '';
      setMarquesina(text);
    }).catch(() => {});
  }, []);

  return (
    <>
      <div className="sticky-top-wrapper">
        <Navbar />
        {esCatalogo && marquesina && (
          <div className="marquee-wrapper">
            <div className="marquee-track">
              <span className="marquee-text">{marquesina} &nbsp;·&nbsp;</span>
              <span className="marquee-text">{marquesina} &nbsp;·&nbsp;</span>
              <span className="marquee-text">{marquesina} &nbsp;·&nbsp;</span>
            </div>
          </div>
        )}
      </div>
      <main>
        <Outlet />
      </main>
      <ChatBot />
    </>
  );
}

export default PublicLayout;
