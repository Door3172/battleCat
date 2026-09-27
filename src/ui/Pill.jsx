import React from 'react';
import { cn } from '../utils/cn.js';

export default function Pill({ children, tone='default', className='' }){
  return (
    <span className={cn('ui-pill', tone === 'sub' && 'ui-pill-sub', className)}>{children}</span>
  );
}
