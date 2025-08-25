import React from 'react';
import Card from './Card.jsx';

export default function Toolbar({ left, right }){
  return <div className="grid md:grid-cols-2 gap-3"><Card>{left}</Card><Card>{right}</Card></div>;
}
