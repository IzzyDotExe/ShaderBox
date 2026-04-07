import React from 'react'

const Card = ({ label, description, onClick, isActive }) => {
  return (
    <button
      variant={isActive ? 'secondary' : 'outline'}
      size="lg"
      className="w-full h-24 flex flex-col justify-start items-start py-4 px-3"
      onClick={onClick}
    >
      <span className="text-lg font-semibold">{label}</span>
      <span className="text-sm text-muted-foreground mt-1">{description}</span>
    </button>
  )
}

export default Card
