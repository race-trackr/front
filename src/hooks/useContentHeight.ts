import { useEffect, useRef, useState } from 'react';

export const useContentHeight = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    // Fonction pour calculer la hauteur du contenu actif
    const updateHeight = () => {
      const activeContent = element.querySelector('[data-state="active"]');
      if (activeContent) {
        setHeight((activeContent as HTMLElement).offsetHeight);
      }
    };

    // Appeler une première fois
    updateHeight();

    // Utiliser ResizeObserver pour mettre à jour la hauteur quand le contenu change
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(element);

    // Écouter les changements d'attribut data-state pour les TabsContent
    const mutationObserver = new MutationObserver(updateHeight);
    mutationObserver.observe(element, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-state']
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return { contentRef, height };
};
