import { Helmet } from 'react-helmet-async';
import { useConfig } from '../context/ConfigContext';
import { imageUrl } from '../services/api';

function SEOHead({ title, description, image }) {
  const { nombre_negocio, logo } = useConfig();
  const siteName = nombre_negocio || 'Mi Negocio';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const desc = description || `Productos y accesorios en ${siteName}.`;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const ogImage = image
    ? image.startsWith('http') ? image : `${origin}${image}`
    : logo ? `${origin}${imageUrl(logo)}` : `${origin}/gclogo.png`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}

export default SEOHead;
