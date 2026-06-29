import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FORUM_CATEGORIES } from '../lib/constants/data';
import { ForumPost, ForumReply } from '../lib/types';
import { createForumPost, createForumReply, getForumPosts } from '../lib/api/forum';
import Pagination from './Pagination';

const ForumPage: React.FC = () => {
    const { currentUser, setPage } = useAuth();
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [view, setView] = useState<'main' | 'thread' | 'new_post'>('main');
    const [currentThread, setCurrentThread] = useState<ForumPost | null>(null);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
    const [newReply, setNewReply] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 5;

    const fetchPosts = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const data = await getForumPosts();
            setPosts(data);
            setCurrentThread((current) => current ? data.find(post => post.id === current.id) || current : current);
        } catch {
            setApiError('Failed to load forum posts. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchPosts();
    }, []);

    const handleNewPostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setIsSubmitting(true);
        setApiError(null);
        try {
            const post = await createForumPost(newPost);
            setPosts((current) => [post, ...current]);
            setView('thread');
            setCurrentThread(post);
            setNewPost({ title: '', content: '', category: 'general' });
        } catch {
            setApiError('Failed to create post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !currentThread) return;
        setIsSubmitting(true);
        try {
            const reply: ForumReply = await createForumReply(currentThread.id, { content: newReply });
            const updatedPosts = posts.map(p => {
                if (p.id === currentThread.id) {
                    return { ...p, replies: [...p.replies, reply] };
                }
                return p;
            });
            setPosts(updatedPosts);
            setCurrentThread(updatedPosts.find(p => p.id === currentThread.id) || null);
            setNewReply('');
        } catch {
            setApiError('Failed to post reply. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `${Math.floor(interval)}y ago`;
        interval = seconds / 2592000;
        if (interval > 1) return `${Math.floor(interval)}mo ago`;
        interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)}d ago`;
        interval = seconds / 3600;
        if (interval > 1) return `${Math.floor(interval)}h ago`;
        interval = seconds / 60;
        if (interval > 1) return `${Math.floor(interval)}m ago`;
        return `${Math.floor(seconds)}s ago`;
    }

    const filteredPosts = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase().trim();
        return posts.filter(post => {
            const categoryMatch = activeCategory === 'all' || post.category === activeCategory;
            if (!categoryMatch) return false;

            if (lowercasedSearchTerm === '') return true;

            const searchMatch =
                post.title.toLowerCase().includes(lowercasedSearchTerm) ||
                post.content.toLowerCase().includes(lowercasedSearchTerm) ||
                post.tags.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm));
            
            return searchMatch;
        });
    }, [posts, activeCategory, searchTerm]);

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const UserAvatar: React.FC<{ userId: string; className?: string }> = ({ userId, className = 'w-10 h-10' }) => {
        const authorName =
            posts.find(post => post.authorId === userId)?.authorName ||
            posts.flatMap(post => post.replies).find(reply => reply.authorId === userId)?.authorName ||
            'User';
        return (
            <div className={`${className} rounded-full bg-primary flex items-center justify-center text-accent font-bold border-2 border-border`}>
                {authorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
        );
    };

    const PostItem: React.FC<{ post: ForumPost }> = ({ post }) => {
        const categoryInfo = FORUM_CATEGORIES[post.category as keyof typeof FORUM_CATEGORIES];
        return (
            <button
                onClick={() => { setView('thread'); setCurrentThread(post); }}
                className="w-full text-left bg-secondary p-4 rounded-lg border border-border flex items-start space-x-4 hover:border-accent transition-colors duration-200"
            >
                <div className="flex-shrink-0 mt-1">
                    <UserAvatar userId={post.authorId} />
                </div>
                <div className="flex-grow min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <h3 className="font-bold text-text-primary text-lg truncate pr-2">{post.title}</h3>
                        <span className="text-xs text-text-muted mt-1 sm:mt-0 flex-shrink-0">{timeSince(post.date)}</span>
                    </div>
                    <div className="flex flex-col items-start sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs text-text-muted mt-2 sm:mt-1">
                        <span>by <span className="font-semibold text-text-secondary">{post.authorName}</span></span>
                        <span className="hidden sm:inline">&bull;</span>
                        <span>in <span className="font-semibold text-accent">{categoryInfo.name}</span></span>
                        <span className="hidden sm:inline">&bull;</span>
                        <span><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline -mt-0.5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.948 8.948 0 01-3.712-.766L2.35 18.283a1 1 0 01-1.195-1.195l.983-3.935A8.968 8.968 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.929 14.929a7 7 0 0110.142-9.857 7 7 0 01-10.142 9.857z" clipRule="evenodd" /></svg>{post.replies.length} replies</span>
                    </div>
                </div>
            </button>
        );
    };

    const MainView = () => (
        <>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <h2 className="text-3xl font-bold text-text-primary text-center md:text-left">Discussions</h2>
                {currentUser ? (
                    <button onClick={() => setView('new_post')} className="w-full md:w-auto bg-accent text-accent-content font-semibold py-2 px-5 rounded-md hover:bg-yellow-400">
                        Create New Post
                    </button>
                ) : (
                    <button onClick={() => setPage('login')} className="w-full md:w-auto bg-border text-text-primary font-semibold py-2 px-5 rounded-md hover:bg-border/80">
                        Login to Post
                    </button>
                )}
            </div>
            <div className="relative mb-8">
                <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset pagination on search
                    }}
                    placeholder="Search by title, content, or tag..."
                    className="w-full bg-secondary text-text-primary placeholder-text-muted border border-border rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>
            <div className="relative mb-8">
                <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
                    <button
                        onClick={() => { setActiveCategory('all'); setCurrentPage(1); }}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors flex-shrink-0 ${activeCategory === 'all' ? 'bg-accent text-accent-content' : 'bg-secondary text-text-secondary hover:bg-border'}`}
                    >
                        All Posts
                    </button>
                    {Object.entries(FORUM_CATEGORIES).map(([key, { name }]) => (
                        <button
                            key={key}
                            onClick={() => { setActiveCategory(key); setCurrentPage(1); }}
                            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors flex-shrink-0 ${activeCategory === key ? 'bg-accent text-accent-content' : 'bg-secondary text-text-secondary hover:bg-border'}`}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            {apiError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-center mb-6">
                    {apiError}
                    <button onClick={fetchPosts} className="ml-3 underline">Retry</button>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-secondary p-4 rounded-lg border border-border flex items-start space-x-4 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-border flex-shrink-0" />
                            <div className="flex-grow space-y-3">
                                <div className="h-5 bg-border rounded w-2/3" />
                                <div className="h-4 bg-border rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : currentPosts.length > 0 ? (
                <div className="space-y-4">
                    {currentPosts.map(post => <PostItem key={post.id} post={post} />)}
                </div>
            ) : (
                 <div className="text-center py-16 text-text-muted">
                    <p className="text-lg">No posts found.</p>
                    <p className="mt-1">Try adjusting your search or filters.</p>
                </div>
            )}

            <Pagination itemsPerPage={postsPerPage} totalItems={filteredPosts.length} paginate={paginate} currentPage={currentPage} />
        </>
    );

    const ThreadView = () => (
        <>
            <button onClick={() => { setView('main'); setCurrentThread(null); }} className="text-accent mb-6 flex items-center space-x-2 hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                <span>Back to Discussions</span>
            </button>
            {currentThread && (
                <div>
                    <div className="bg-secondary p-6 rounded-lg border border-border mb-8">
                        <div className="flex items-start space-x-4">
                            <UserAvatar userId={currentThread.authorId} className="w-12 h-12" />
                            <div className="flex-grow">
                                <h2 className="text-2xl md:text-3xl font-bold text-text-primary">{currentThread.title}</h2>
                                <p className="text-sm text-text-muted mt-1">
                                    By <span className="font-semibold text-text-primary">{currentThread.authorName}</span> &bull; {timeSince(currentThread.date)}
                                </p>
                            </div>
                        </div>
                        <div className="text-text-secondary mt-6 whitespace-pre-wrap md:pl-16">{currentThread.content}</div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-text-primary mb-6 pl-4">{currentThread.replies.length} Replies</h3>

                    <div className="md:pl-8 relative space-y-6">
                        {currentThread.replies.length > 0 && <div className="absolute left-4 md:left-14 top-5 bottom-5 w-0.5 bg-border"></div>}

                        {currentThread.replies.map(reply => (
                            <div key={reply.id} className="relative flex items-start space-x-4">
                                <div className="z-10 flex-shrink-0"><UserAvatar userId={reply.authorId} className="w-8 h-8 md:w-10 md:h-10" /></div>
                                <div className="bg-primary p-4 rounded-lg border border-border flex-grow">
                                    <p className="text-sm">
                                        <span className="font-semibold text-text-primary">{reply.authorName}</span>
                                        <span className="text-text-muted"> &bull; {timeSince(reply.date)}</span>
                                    </p>
                                    <p className="text-text-secondary mt-2">{reply.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {currentUser ? (
                         <form onSubmit={handleReplySubmit} className="mt-8 md:pl-16">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 hidden md:block"><UserAvatar userId={currentUser.id} /></div>
                                <div className="flex-grow">
                                    <textarea value={newReply} onChange={e => setNewReply(e.target.value)} required rows={4} placeholder="Write a reply..." className="w-full bg-primary p-3 border border-border rounded-md focus:ring-2 focus:ring-accent focus:outline-none"></textarea>
                                    <div className="text-right mt-2">
                                        <button type="submit" disabled={isSubmitting} className="bg-accent text-accent-content font-semibold py-2 px-5 rounded-md hover:bg-yellow-400 disabled:opacity-60">
                                            {isSubmitting ? 'Posting...' : 'Post Reply'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : (
                         <div className="text-center bg-secondary p-6 rounded-lg border border-border mt-8">
                            <p className="text-text-secondary">You must be logged in to reply.</p>
                             <button onClick={() => setPage('login')} className="mt-4 bg-accent text-accent-content font-semibold py-2 px-5 rounded-md hover:bg-yellow-400">
                                Login to Reply
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );

    const NewPostView = () => (
        <>
            <button onClick={() => setView('main')} className="text-accent mb-6">&larr; Back to Categories</button>
            <form onSubmit={handleNewPostSubmit} className="bg-secondary p-6 rounded-lg border border-border">
                <h2 className="text-2xl font-bold text-text-primary mb-6">Create a New Post</h2>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-text-secondary">Title</label><input type="text" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} required className="w-full bg-primary p-2 border border-border rounded-md mt-1" /></div>
                    <div><label className="block text-sm font-medium text-text-secondary">Category</label><select value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})} className="w-full bg-primary p-2 border border-border rounded-md mt-1">{Object.entries(FORUM_CATEGORIES).map(([key, {name}]) => <option key={key} value={key}>{name}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-text-secondary">Content</label><textarea value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} required rows={8} className="w-full bg-primary p-2 border border-border rounded-md mt-1" /></div>
                </div>
                {apiError && <p className="text-sm text-red-400 mt-4">{apiError}</p>}
                <div className="text-right mt-6">
                    <button type="submit" disabled={isSubmitting} className="bg-accent text-accent-content font-semibold py-2 px-6 rounded-md hover:bg-yellow-400 disabled:opacity-60">
                        {isSubmitting ? 'Creating...' : 'Create Post'}
                    </button>
                </div>
            </form>
        </>
    );

    return (
        <main className="pt-20 pb-12 md:py-20 bg-primary">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12 animate-fade-in-down">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary">Miner Forum</h1>
                    <p className="text-lg text-text-secondary mt-4 max-w-3xl mx-auto">Connect with the community. Ask questions, share knowledge, and discuss the latest trends.</p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {view === 'main' && <MainView />}
                    {view === 'thread' && <ThreadView />}
                    {view === 'new_post' && <NewPostView />}
                </div>
            </div>
        </main>
    );
};

export default ForumPage;
