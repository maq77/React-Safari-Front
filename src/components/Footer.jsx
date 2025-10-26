// src/components/Footer.jsx
import React from 'react'
import { Compass, Share2, Camera, Users } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Compass className="w-8 h-8 text-gold"/>
              <span className="text-xl font-bold text-gold">Hurghada Safari</span>
            </div>
            <p className="text-gray-400 text-sm">
              Experience the magic of the Egyptian desert with professional safari tours.
            </p>
          </div>

          <div>
            <h4 className="footer-title">Quick Links</h4>
            <div className="space-y-2">
              <a href="/trips" className="footer-link">Trips</a>
              <a href="#about" className="footer-link">About</a>
              <a href="#contact" className="footer-link">Contact</a>
            </div>
          </div>

          <div>
            <h4 className="footer-title">Popular Tours</h4>
            <div className="space-y-2 text-sm">
              <p className="footer-link">Desert Safari</p>
              <p className="footer-link">Sunrise Tour</p>
              <p className="footer-link">Stargazing Safari</p>
            </div>
          </div>

          <div>
            <h4 className="footer-title">Follow Us</h4>
            <div className="flex space-x-4">
              <button className="icon-btn"><Share2 size={18} /></button>
              <button className="icon-btn"><Camera size={18} /></button>
              <button className="icon-btn"><Users size={18} /></button>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-400 text-sm pt-8 border-t border-[#D4AF37]/20">
          <p>© 2025 Hurghada Safari Adventures. All rights reserved.</p>
          <p className="mt-2">Made with ❤️ in Egypt</p>
        </div>
      </div>
    </footer>
  )
}
