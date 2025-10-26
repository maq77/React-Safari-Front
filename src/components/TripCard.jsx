// src/components/TripCard.jsx
import React from 'react'
import { Star, Clock, Users, Camera, ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TripCard({
  trip,
  currentImageIndex = 0,
  onNextImage,
  onPrevImage,
  isFavorite,
  onToggleFavorite,
  onBook
}) {
  return (
    <div className="group card overflow-hidden">
      <div className="relative h-64 overflow-hidden">
        <img
          src={trip.images[currentImageIndex || 0]}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {trip.images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrevImage(trip.id) }}
              className="absolute left-2 top-1/2 -translate-y-1/2 pill-dark"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNextImage(trip.id) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 pill-dark"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(trip.id) }}
          className="absolute top-4 right-4 pill-dark"
        >
          <Heart size={20} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-white'} />
        </button>

        <div className="absolute top-4 left-4 pill-dark flex items-center space-x-1">
          <Star size={16} className="text-gold-light fill-gold-light" />
          <span className="font-bold">{trip.rating}</span>
        </div>

        <div className="absolute bottom-4 left-4 badge-gold capitalize">
          {trip.type}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-bold text-gold mb-2 group-hover:text-gold-light transition-colors">
          {trip.name}
        </h3>

        <p className="text-gray-300 mb-4 line-clamp-2">{trip.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gold/90">
          <div className="flex items-center space-x-2"><Clock size={16} /> <span>{trip.duration}</span></div>
          <div className="flex items-center space-x-2"><Users size={16} /> <span>Max {trip.maxGuests}</span></div>
          <div className="flex items-center space-x-2"><Camera size={16} /> <span>Photos incl.</span></div>
          <div className="flex items-center space-x-2"><span className="capitalize">{trip.difficulty}</span></div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#D4AF37]/20">
          <div>
            <span className="text-sm text-gray-400">From</span>
            <div className="text-3xl font-bold text-gold">
              ${trip.price}<span className="text-sm text-gray-400">/person</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link to={`/trip/${trip.id}`} className="btn-ghost">View</Link>
            <button onClick={() => onBook(trip)} className="btn-gold">Book</button>
          </div>
        </div>
      </div>
    </div>
  )
}
