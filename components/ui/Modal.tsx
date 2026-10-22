'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
export function Modal({title,children,onClose,wide=false}:{title:string;children:ReactNode;onClose:()=>void;wide?:boolean}) {
 const ref=useRef<HTMLDialogElement>(null);
 const closeRef=useRef(onClose);
 useEffect(()=>{closeRef.current=onClose;},[onClose]);
 useEffect(()=>{
  const dialog=ref.current; const previous=document.activeElement as HTMLElement|null;
  const overflow=document.body.style.overflow;
  dialog?.showModal(); document.body.style.overflow='hidden';
  return ()=>{dialog?.close(); document.body.style.overflow=overflow; previous?.focus();};
 },[]);
 return <dialog ref={ref} aria-label={title} className={`modal ${wide?'modal-wide':''}`} onCancel={(event)=>{event.preventDefault();closeRef.current();}} onClick={(event)=>{if(event.target===event.currentTarget){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)onClose();}}}><div className="modal-top"><span className="eyebrow">SHRI PARASHAR GURUJI</span><button className="icon-button" aria-label="Close dialog" onClick={onClose} autoFocus><X size={21}/></button></div>{children}</dialog>;
}
