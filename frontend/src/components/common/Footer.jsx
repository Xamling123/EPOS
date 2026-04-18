import { Link } from 'react-router-dom'
import { UtensilsCrossed, Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-secondary-950 border-t border-secondary-800">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                <UtensilsCrossed className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-display text-xl font-bold text-white">Savoria</span>
                        </Link>
                        <p className="text-secondary-400 text-sm">
                            Fine dining experience with authentic flavors.
                            Reserve your table and pre-order your favorites.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/menu" className="text-secondary-400 hover:text-primary-400 transition-colors">
                                    Menu
                                </Link>
                            </li>
                            <li>
                                <Link to="/reservations" className="text-secondary-400 hover:text-primary-400 transition-colors">
                                    Reservations
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-secondary-400 hover:text-primary-400 transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-secondary-400 hover:text-primary-400 transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-secondary-400">
                                <MapPin className="w-4 h-4 text-primary-500" />
                                <span className="text-sm">Thamel, Kathmandu, Nepal</span>
                            </li>
                            <li className="flex items-center gap-2 text-secondary-400">
                                <Phone className="w-4 h-4 text-primary-500" />
                                <span className="text-sm">+977-1-4123456</span>
                            </li>
                            <li className="flex items-center gap-2 text-secondary-400">
                                <Mail className="w-4 h-4 text-primary-500" />
                                <span className="text-sm">info@savoria.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Hours & Social */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Opening Hours</h4>
                        <ul className="space-y-1 text-sm text-secondary-400 mb-4">
                            <li>Mon - Fri: 11:00 AM - 10:00 PM</li>
                            <li>Sat - Sun: 10:00 AM - 11:00 PM</li>
                        </ul>
                        <div className="flex gap-3">
                            <a href="#" className="w-10 h-10 rounded-xl bg-secondary-800 flex items-center justify-center text-secondary-400 hover:bg-primary-500 hover:text-white transition-all">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-xl bg-secondary-800 flex items-center justify-center text-secondary-400 hover:bg-primary-500 hover:text-white transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-xl bg-secondary-800 flex items-center justify-center text-secondary-400 hover:bg-primary-500 hover:text-white transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-secondary-800 mt-8 pt-8 text-center text-sm text-secondary-500">
                    © {new Date().getFullYear()} Savoria Restaurant. All rights reserved.
                </div>
            </div>
        </footer>
    )
}

export default Footer
