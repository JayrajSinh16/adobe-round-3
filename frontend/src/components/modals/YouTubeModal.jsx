import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative inline-flex">
        <div className="w-10 h-10 rounded-full border-2 border-[#DC2626]/20"></div>
        <div className="w-10 h-10 rounded-full border-2 border-t-[#DC2626] border-r-transparent border-b-transparent border-l-transparent animate-spin absolute left-0 top-0"></div>
      </div>
    </div>
  );
}

export default function YouTubeModal({ isOpen, onClose, videos = [], query = '', loading = false }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 overflow-hidden border border-white/40"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <div className="px-6 py-4 border-b border-white/60 flex items-center justify-between bg-white/80 backdrop-blur-xl"
                 style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(254,242,242,0.8) 100%)' }}>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">YouTube Recommendations</h3>
                {query ? (
                  <p className="text-xs text-gray-500">for "{query}"</p>
                ) : null}
              </div>
              <button onClick={onClose} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loading ? (
              <Spinner />
            ) : (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-h-[70vh] overflow-auto bg-gradient-to-b from-white to-rose-50/30">
                {Array.isArray(videos) && videos.length > 0 ? (
                  videos.map((v) => (
                    <a
                      key={v.id || v.url}
                      href={v.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group block rounded-2xl border border-white/50 overflow-hidden hover:shadow-[0_10px_30px_rgba(220,38,38,0.15)] transition-shadow bg-white"
                    >
                      <div className="aspect-video w-full bg-gray-100 overflow-hidden">
                        {v.thumbnail ? (
                          <img src={v.thumbnail} alt={v.title || 'Video'} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No thumbnail</div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="text-sm font-semibold text-gray-900 line-clamp-2">{v.title || 'Untitled'}</div>
                        <div className="mt-1 text-xs text-gray-500 line-clamp-1">{v.channelTitle || ''}</div>
                        <div className="mt-1 text-[11px] text-gray-400">{v.publishedAt ? new Date(v.publishedAt).toLocaleDateString() : ''}</div>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-500 py-10">No videos found</div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
