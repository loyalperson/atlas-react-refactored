import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PopupPortalProps {
  mountNode: HTMLElement;
  children: ReactNode;
}

const PopupPortal: React.FC<PopupPortalProps> = ({ mountNode, children }) => {
  const el = document.createElement('div');

  useEffect(() => {
    mountNode.appendChild(el);
    return () => {
      mountNode.removeChild(el);
    };
  }, [el, mountNode]);

  return createPortal(children, el);
};

export default PopupPortal;
