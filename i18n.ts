import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/locales/en/translation.json';
import pt from './locales/locales/pt/translation.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            pt: { translation: pt },
        },
        lng: 'pt', // idioma padrão
        fallbackLng: 'pt',
        interpolation: {
            escapeValue: false, // React já faz isso
        },
    });

export default i18n;
