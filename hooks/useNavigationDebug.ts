import { useEffect } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';

export function useNavigationDebug() {
    useEffect(() => {
        const rootNodes = document.querySelectorAll('div[data-navigation-container]');
        if (rootNodes.length > 1) {
            console.error('⚠️ Encontrados múltiplos NavigationContainers:', rootNodes);
        }
    }, []);
}