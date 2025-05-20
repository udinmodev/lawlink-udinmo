import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Hash, AtSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import debounce from 'lodash/debounce';

interface SearchResult {
  type: 'user' | 'tag' | 'post';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchData = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      let searchResults: SearchResult[] = [];

      if (searchQuery.startsWith('@')) {
        const { data: users } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .ilike('username', `${searchQuery.slice(1)}%`)
          .limit(5);

        if (users) {
          searchResults = users.map(user => ({
            type: 'user',
            id: user.id,
            title: user.username,
            subtitle: user.full_name || undefined,
            url: `/profile/${user.id}`
          }));
        }
      } else if (searchQuery.startsWith('#')) {
        const { data: posts } = await supabase
          .from('posts')
          .select('id, content')
          .ilike('content', `%${searchQuery}%`)
          .limit(5);

        if (posts) {
          searchResults = posts.map(post => ({
            type: 'tag',
            id: post.id,
            title: searchQuery,
            subtitle: post.content.slice(0, 50) + '...',
            url: `/post/${post.id}`
          }));
        }
      } else {
        const { data: posts } = await supabase
          .from('posts')
          .select('id, content')
          .ilike('content', `%${searchQuery}%`)
          .limit(5);

        if (posts) {
          searchResults = posts.map(post => ({
            type: 'post',
            id: post.id,
            title: post.content.slice(0, 50) + '...',
            url: `/post/${post.id}`
          }));
        }
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce(searchData, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(true);
    debouncedSearch(value);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search posts, @users, or #tags"
          className="w-full h-10 pl-10 pr-4 bg-gray-100 border border-transparent rounded-full focus:bg-white focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      </div>

      {showResults && (query.trim() || loading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-2">
              <div className="animate-pulse space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-6 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {results.map((result) => (
                <Link
                  key={result.id}
                  to={result.url}
                  className="flex items-center px-3 py-2 hover:bg-gray-50"
                  onClick={() => setShowResults(false)}
                >
                  {result.type === 'user' && <AtSign size={16} className="text-blue-500 mr-2" />}
                  {result.type === 'tag' && <Hash size={16} className="text-green-500 mr-2" />}
                  {result.type === 'post' && <Search size={16} className="text-purple-500 mr-2" />}
                  <div>
                    <div className="font-medium text-sm text-gray-900">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-xs text-gray-500">{result.subtitle}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-sm text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;