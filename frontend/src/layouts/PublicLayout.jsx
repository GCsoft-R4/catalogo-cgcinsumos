import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

function PublicLayout() {
  const esCatalogo = useLocation().pathname === '/' || useLocation().pathname.startsWith('/producto');

  return (
    <>
      <Navbar />
      {esCatalogo && (
        <div className="marquee-wrapper">
          <div className="marquee-track">
            <span className="marquee-text">Envíos a toda la ciudad &nbsp;·&nbsp; Consultanos por WhatsApp &nbsp;·&nbsp; Los mejores precios del mercado &nbsp;·&nbsp; Stock permanente &nbsp;·&nbsp;</span>
            <span className="marquee-text">Envíos a todo la ciudad &nbsp;·&nbsp; Consultanos por WhatsApp &nbsp;·&nbsp; Los mejores precios del mercado &nbsp;·&nbsp; Stock permanente &nbsp;·&nbsp;</span>
            <span className="marquee-text">Envíos a todo la ciudad &nbsp;·&nbsp; Consultanos por WhatsApp &nbsp;·&nbsp; Los mejores precios del mercado &nbsp;·&nbsp; Stock permanente &nbsp;·&nbsp;</span>
          </div>
        </div>
      )}
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default PublicLayout;
