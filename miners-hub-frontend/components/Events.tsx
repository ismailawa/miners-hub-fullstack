import React, { useEffect, useState } from 'react';
import { Event } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { getUpcomingEvents } from '../lib/api/events';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const { setPage } = useAuth();

  const fetchEvents = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await getUpcomingEvents(6);
      setEvents(data);
      setSelectedEvent((current) => current && data.some((event) => event.id === current.id) ? current : data[0] || null);
    } catch {
      setApiError('Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchEvents();
  }, []);

  const handleRegister = () => {
    if (selectedEvent?.registrationUrl) {
      window.open(selectedEvent.registrationUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setPage('register');
  };

  return (
    <section id="events" className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">Featured & Upcoming Events</h2>
          <p className="text-lg text-text-secondary mt-4 max-w-2xl mx-auto">Join industry leaders, network with peers, and discover new opportunities.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 bg-secondary p-6 rounded-lg border border-border">
            {/* Main Event Display */}
            <div className="md:col-span-2">
                {apiError ? (
                    <div className="aspect-video w-full bg-primary rounded-lg flex flex-col items-center justify-center text-center p-6">
                        <p className="text-red-400">{apiError}</p>
                        <button onClick={fetchEvents} className="mt-3 text-accent underline">Retry</button>
                    </div>
                ) : isLoading ? (
                    <div className="relative rounded-lg overflow-hidden shadow-lg h-full min-h-[450px] bg-primary animate-pulse">
                        <div className="absolute inset-0 bg-border" />
                        <div className="relative p-8 h-full flex flex-col justify-end">
                            <div className="h-8 bg-secondary rounded w-2/3 mb-4" />
                            <div className="h-5 bg-secondary rounded w-1/2 mb-6" />
                            <div className="h-12 bg-secondary rounded w-40" />
                        </div>
                    </div>
                ) : selectedEvent ? (
                    <div className="relative rounded-lg overflow-hidden shadow-lg group h-full min-h-[450px] flex flex-col justify-end">
                        <img 
                            src={selectedEvent.imageUrl} 
                            alt={selectedEvent.title} 
                            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                        <div className="relative p-8 text-white">
                            <h3 className="text-3xl font-bold text-text-primary mb-4">{selectedEvent.title}</h3>
                            <div className="flex flex-col sm:flex-row sm:space-x-8 text-text-secondary mb-6">
                                <p><span className="font-semibold">Date:</span> {new Date(selectedEvent.date).toLocaleDateString()}</p>
                                <p><span className="font-semibold">Location:</span> {selectedEvent.location}</p>
                            </div>
                            {selectedEvent.description && (
                              <p className="text-sm text-text-secondary max-w-2xl mb-6">{selectedEvent.description}</p>
                            )}
                            <button onClick={handleRegister} className="inline-block bg-accent text-accent-content font-semibold py-3 px-6 rounded-md hover:bg-yellow-400 transition-colors self-start">
                              Register Now
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="aspect-video w-full bg-primary rounded-lg flex items-center justify-center">
                        <p className="text-text-muted">No upcoming events have been published yet.</p>
                    </div>
                )}
            </div>

            {/* Events List */}
            <div className="md:col-span-1">
                <h3 className="text-lg font-bold text-text-primary mb-4">Event Schedule</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto p-2 no-scrollbar">
                    {isLoading ? Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="w-full p-3 rounded-lg flex space-x-4 animate-pulse">
                            <div className="w-24 h-16 bg-border rounded-md flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-border rounded w-3/4" />
                                <div className="h-3 bg-border rounded w-1/2" />
                                <div className="h-3 bg-border rounded w-2/3" />
                            </div>
                        </div>
                    )) : events.map(event => (
                        <button
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className={`w-full text-left p-3 rounded-lg flex space-x-4 transition-colors ${
                                selectedEvent?.id === event.id ? 'bg-accent/10 ring-2 ring-accent' : 'hover:bg-border/50'
                            }`}
                        >
                            <img src={event.imageUrl} alt={event.title} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm text-text-primary leading-tight">{event.title}</h4>
                                <p className="text-xs text-text-muted mt-1">{new Date(event.date).toLocaleDateString()}</p>
                                <p className="text-xs text-text-muted">{event.location}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Events;
