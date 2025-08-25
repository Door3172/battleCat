import React from 'react';
import { SKIN } from '../data/skin.js';

export default function Divider(){
  return <div style={{ height:1, background:SKIN.color.line, margin:`${SKIN.size.gapMd}px 0` }} />;
}
