import { Link } from 'react-router-dom'
import {
    Calendar,
    UtensilsCrossed,
    Clock,
    Star,
    ChefHat,
    Sparkles,
    ArrowRight
} from 'lucide-react'
import { Button } from '../../components/common/UI'

export function Home() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/30" />

                {/* Decorative Elements */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-400 text-sm font-medium mb-6 animate-fade-in">
                            <Sparkles className="w-4 h-4" />
                            Fine Dining Experience
                        </span>

                        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight animate-slide-up">
                            Discover the Art of
                            <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent"> Culinary</span>
                            <br />Excellence
                        </h1>

                        <p className="text-xl text-secondary-300 mb-8 max-w-xl animate-slide-up delay-100">
                            Reserve your table, explore our exquisite menu, and pre-order your favorites
                            for a seamless dining experience.
                        </p>

                        <div className="flex flex-wrap gap-4 animate-slide-up delay-200">
                            <Link to="/reservations">
                                <Button size="lg" className="gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Reserve a Table
                                </Button>
                            </Link>
                            <Link to="/menu">
                                <Button variant="outline" size="lg" className="gap-2">
                                    <UtensilsCrossed className="w-5 h-5" />
                                    View Menu
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                            Why Choose Savoria?
                        </h2>
                        <p className="text-secondary-400 max-w-2xl mx-auto">
                            Experience the perfect blend of tradition and innovation in every dish
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: UtensilsCrossed,
                                title: 'Exquisite Cuisine',
                                description: 'Authentic Nepali flavors combined with international culinary techniques',
                                color: 'primary'
                            },
                            {
                                icon: Calendar,
                                title: 'Easy Reservations',
                                description: 'Book your table online with real-time availability and instant confirmation',
                                color: 'accent'
                            },
                            {
                                icon: Clock,
                                title: 'Pre-Order Service',
                                description: 'Order ahead and have your food ready when you arrive at your reserved table',
                                color: 'primary'
                            }
                        ].map((feature, index) => (
                            <div
                                key={feature.title}
                                className="card group cursor-pointer hover:-translate-y-1"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className={`w-14 h-14 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                <p className="text-secondary-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-secondary-900/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                            How It Works
                        </h2>
                        <p className="text-secondary-400 max-w-2xl mx-auto">
                            From reservation to dining in just a few simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: '1', title: 'Choose Date & Time', desc: 'Select your preferred dining date and time slot' },
                            { step: '2', title: 'Pick Your Table', desc: 'Browse available tables based on party size' },
                            { step: '3', title: 'Pre-Order Food', desc: 'Optionally select dishes from our menu in advance' },
                            { step: '4', title: 'Enjoy Your Meal', desc: 'Arrive and be seated with your order ready' },
                        ].map((item, index) => (
                            <div key={item.step} className="text-center relative">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                                    {item.step}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                                <p className="text-secondary-400 text-sm">{item.desc}</p>

                                {index < 3 && (
                                    <ArrowRight className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-secondary-700" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMjBMMjAgMEw0MCAxMFoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-20" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <ChefHat className="w-16 h-16 text-white/80 mx-auto mb-6" />
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
                        Ready to Experience Savoria?
                    </h2>
                    <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">
                        Make your reservation today and discover why our guests keep coming back
                    </p>
                    <Link to="/reservations">
                        <Button variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-white/90">
                            Book Your Table Now
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Reviews Preview */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                            What Our Guests Say
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'Anil Shrestha', text: 'The best fine dining experience in Kathmandu! The pre-order feature saved us so much time.', rating: 5 },
                            { name: 'Priya Tamang', text: 'Exceptional food and service. The online reservation system is incredibly convenient.', rating: 5 },
                            { name: 'Rajesh Maharjan', text: 'Perfect for special occasions. The ambiance and cuisine exceeded our expectations.', rating: 5 },
                        ].map((review) => (
                            <div key={review.name} className="card">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-accent-400 text-accent-400" />
                                    ))}
                                </div>
                                <p className="text-secondary-300 mb-4 italic">"{review.text}"</p>
                                <p className="font-semibold text-white">{review.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
