import React, { useState, useMemo } from 'react';
import { KNOWLEDGE_BASE_DATA } from '../lib/constants/data';

const KnowledgeBasePage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [openArticleId, setOpenArticleId] = useState<string | null>(null);
    
    const categories = useMemo(() => ['All', ...Array.from(new Set(KNOWLEDGE_BASE_DATA.map(a => a.category)))], []);
    
    const filteredArticles = useMemo(() => {
        return KNOWLEDGE_BASE_DATA.filter(article => {
            const categoryMatch = activeCategory === 'All' || article.category === activeCategory;
            const searchMatch = searchTerm === '' ||
                article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            return categoryMatch && searchMatch;
        });
    }, [searchTerm, activeCategory]);

    const toggleArticle = (id: string) => {
        setOpenArticleId(openArticleId === id ? null : id);
    };

    return (
        <main className="pt-20 pb-12 md:py-20 bg-primary">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 animate-fade-in-down">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary">Knowledge Base</h1>
                    <p className="text-lg text-text-secondary mt-4 max-w-3xl mx-auto">Your resource hub for mastering the mining industry and our platform.</p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Search Bar */}
                    <div className="relative mb-8">
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search articles, e.g., 'Export License'..."
                            className="w-full bg-secondary text-text-primary placeholder-text-muted border border-border rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap justify-center gap-2 mb-12">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                                    activeCategory === category 
                                        ? 'bg-accent text-accent-content' 
                                        : 'bg-secondary text-text-secondary hover:bg-border'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Articles List */}
                    <div className="space-y-4">
                        {filteredArticles.length > 0 ? filteredArticles.map(article => (
                            <div key={article.id} className="bg-secondary rounded-lg border border-border overflow-hidden">
                                <button
                                    onClick={() => toggleArticle(article.id)}
                                    className="w-full text-left p-6 flex justify-between items-center"
                                >
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-accent">{article.category}</p>
                                        <h2 className="text-lg font-bold text-text-primary mt-1">{article.title}</h2>
                                    </div>
                                    <svg
                                        className={`w-6 h-6 text-text-muted transform transition-transform duration-300 ${
                                            openArticleId === article.id ? 'rotate-180' : ''
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openArticleId === article.id && (
                                    <div className="px-6 pb-6 border-t border-border">
                                        <div className="prose prose-sm prose-invert max-w-none text-text-secondary mt-4">
                                            {article.content}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-16 text-text-muted">
                                <p className="text-lg">No articles found.</p>
                                <p className="mt-2">Try adjusting your search or filter.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default KnowledgeBasePage;