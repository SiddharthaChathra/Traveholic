'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FollowButtonProps {
  isFollowing: boolean;
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
}

export default function FollowButton({ isFollowing, onToggle, className = '' }: FollowButtonProps) {
  const [status, setStatus] = useState<'follow' | 'checkmark' | 'following'>(
    isFollowing ? 'following' : 'follow'
  );
  const [isHovered, setIsHovered] = useState(false);

  // Sync state when props change (handles external state updates)
  useEffect(() => {
    if (isFollowing) {
      if (status === 'follow') {
        setStatus('checkmark');
        const timer = setTimeout(() => {
          setStatus('following');
        }, 900); // Checkmark displays for 900ms
        return () => clearTimeout(timer);
      } else {
        setStatus('following');
      }
    } else {
      setStatus('follow');
    }
  }, [isFollowing]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(e);
  };

  // Determine text content based on status and hover state
  let labelText = '';
  if (status === 'follow') {
    labelText = 'Follow';
  } else if (status === 'checkmark') {
    labelText = '✓';
  } else if (status === 'following') {
    labelText = isHovered ? 'Unfollow' : 'Following';
  }

  // Animation variants for background, text color, and border
  const buttonVariants = {
    follow: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)',
      color: '#ffffff',
      border: '1px solid transparent',
      boxShadow: '0 4px 10px rgba(236, 72, 153, 0.2)',
    },
    checkmark: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)',
      color: '#ffffff',
      border: '1px solid transparent',
      boxShadow: '0 4px 10px rgba(236, 72, 153, 0.2)',
    },
    following: {
      background: 'rgba(255, 255, 255, 0.08)',
      color: isHovered ? '#ef4444' : '#cbd5e1',
      border: isHovered ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 0px 0px rgba(0,0,0,0)',
    }
  };

  return (
    <motion.button
      className={`shared-follow-btn ${className}`}
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      variants={buttonVariants}
      animate={status}
      whileHover={{ 
        scale: 1.04, 
        filter: 'brightness(1.1)',
        transition: { duration: 0.15 } 
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '28px',
        padding: '0 12px',
        fontSize: '11px',
        fontWeight: 700,
        borderRadius: '9999px',
        cursor: 'pointer',
        minWidth: '85px',
        textAlign: 'center',
        outline: 'none',
        userSelect: 'none',
        transition: 'color 0.2s ease, border-color 0.2s ease'
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={labelText}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
          style={{ display: 'inline-block' }}
        >
          {labelText}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
