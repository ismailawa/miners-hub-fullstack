import React, { useState } from 'react';
import { NEWS_DATA, WEBINARS_DATA } from '../lib/constants/data';
import { NewsArticle, Webinar } from '../lib/types';

const HeadlineArticle: React.FC<{ article: NewsArticle }> = ({ article }) => (
    <div className="bg-secondary rounded-lg overflow-hidden shadow-lg border border-border grid md:grid-cols-2 group">
        <div className="overflow-hidden">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="p-8 flex flex-col justify-center">
            <span className="text-sm font-semibold text-accent mb-2">{article.category}</span>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4 leading-tight">{article.title}</h2>
            <p className="text-text-secondary mb-4">{article.summary}</p>
            <div className="text-sm text-text-muted mb-6">
                By <span className="font-semibold text-text-secondary">{article.author}</span> &bull; {article.date}
            </div>
            <a href="#read-more" className="self-start bg-border text-text-primary font-semibold py-2 px-5 rounded-md hover:bg-accent hover:text-accent-content transition-colors">Read More</a>
        </div>
    </div>
);

const BreakingNewsTicker: React.FC<{ articles: NewsArticle[] }> = ({ articles }) => {
    const duplicatedArticles = [...articles, ...articles];
    return (
        <div className="relative w-full overflow-hidden group">
            <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
                {duplicatedArticles.map((article, index) => (
                    <div key={`${article.id}-${index}`} className="flex-shrink-0 mx-4 w-80">
                        <div className="bg-secondary p-4 rounded-lg border border-border/50 h-full">
                            <div className="flex items-center space-x-2">
                                <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-md">BREAKING</span>
                                <span className="text-xs text-text-muted">{article.date}</span>
                            </div>
                            <h3 className="text-md font-semibold text-text-primary mt-2">{article.title}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const NewsCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
    <div className="bg-secondary rounded-lg overflow-hidden shadow-lg group flex flex-col">
        <div className="overflow-hidden">
             <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="p-6 flex flex-col flex-grow">
            <span className="text-xs font-semibold text-accent mb-2">{article.category}</span>
            <h3 className="text-lg font-bold text-text-primary mb-3 flex-grow">{article.title}</h3>
            <div className="text-xs text-text-muted mt-auto pt-3 border-t border-border">
                By {article.author} &bull; {article.date}
            </div>
        </div>
    </div>
);


const NewsPage: React.FC = () => {
    const headlineArticle = NEWS_DATA.find(a => a.isHeadline);
    const breakingArticles = NEWS_DATA.filter(a => a.isBreaking);
    
    const mainArticles = NEWS_DATA.filter(a => !a.isHeadline && !a.isBreaking);
    const domesticArticles = mainArticles.filter(a => a.country === 'Nigeria');
    const internationalArticles = mainArticles.filter(a => a.country !== 'Nigeria');

    const [currentWebinar, setCurrentWebinar] = useState<Webinar | null>(WEBINARS_DATA[0] || null);


    return (
        <main className="pt-20 pb-12 md:py-20 bg-primary">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 animate-fade-in-down">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary">Mining News & Updates</h1>
                    <p className="text-lg text-text-secondary mt-4 max-w-3xl mx-auto">Your daily source for industry insights, breaking stories, and global trends.</p>
                </div>

                {/* Headline Section */}
                {headlineArticle && (
                    <section className="mb-16">
                         <HeadlineArticle article={headlineArticle} />
                    </section>
                )}
                
                {/* Breaking News Section */}
                {breakingArticles.length > 0 && (
                     <section className="mb-16">
                        <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center">
                           <span className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></span>
                           Breaking News
                        </h2>
                        <BreakingNewsTicker articles={breakingArticles} />
                    </section>
                )}

                {/* Domestic News Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-text-primary mb-6">Domestic News</h2>
                    {domesticArticles.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {domesticArticles.map(article => (
                                <NewsCard key={article.id} article={article} />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center text-text-secondary py-16">
                            <p className="text-xl">No domestic news available at the moment.</p>
                        </div>
                    )}
                </section>

                {/* International News Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-text-primary mb-6">International News</h2>
                    {internationalArticles.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {internationalArticles.map(article => (
                                <NewsCard key={article.id} article={article} />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center text-text-secondary py-16">
                            <p className="text-xl">No international news available at the moment.</p>
                        </div>
                    )}
                </section>

                {/* Webinar Section */}
                <section>
                    <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">Industry Webinars</h2>
                    <div className="grid md:grid-cols-3 gap-8 bg-secondary p-6 rounded-lg border border-border">
                        <div className="md:col-span-2">
                            {currentWebinar ? (
                                <>
                                    <div className="relative aspect-video w-full bg-primary rounded-lg overflow-hidden border border-border">
                                        <iframe
                                            key={currentWebinar.id}
                                            src={currentWebinar.videoUrl}
                                            title={currentWebinar.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            className="w-full h-full"
                                        ></iframe>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-xl font-bold text-text-primary">{currentWebinar.title}</h3>
                                        <p className="text-sm text-text-muted mt-1">with {currentWebinar.speaker} &bull; {currentWebinar.date}</p>
                                        <p className="text-text-secondary mt-2">{currentWebinar.description}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="aspect-video w-full bg-primary rounded-lg flex items-center justify-center">
                                    <p className="text-text-muted">Select a webinar to play.</p>
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-bold text-text-primary mb-4">Up Next</h3>
                            <div className="space-y-3 max-h-[500px] overflow-y-auto p-2 no-scrollbar">
                                {WEBINARS_DATA.map(webinar => (
                                    <button
                                        key={webinar.id}
                                        onClick={() => setCurrentWebinar(webinar)}
                                        className={`w-full text-left p-3 rounded-lg flex space-x-4 transition-colors ${
                                            currentWebinar?.id === webinar.id ? 'bg-accent/10 ring-2 ring-accent' : 'hover:bg-border/50'
                                        }`}
                                    >
                                        <img src={webinar.thumbnailUrl} alt={webinar.title} className="w-32 h-20 object-cover rounded-md flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-sm text-text-primary leading-tight">{webinar.title}</h4>
                                            <p className="text-xs text-text-muted mt-1">{webinar.speaker}</p>
                                            <p className="text-xs text-text-muted">{webinar.date}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default NewsPage;