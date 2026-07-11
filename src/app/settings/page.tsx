'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Logo from '@/components/Logo';
import { useTheme } from '@/context/ThemeContext';

// Static imports of all 26 settings subpages for instant dev compiling & loading
import AccessibilityPage from './accessibility/page';
import AccountCenterPage from './account/page';
import AccountTypePage from './account-type/page';
import ArchivingPage from './archiving/page';
import BlockedAccountsPage from './blocked/page';
import InnerCirclePage from './close-friends/page';
import CommentsPage from './comments/page';
import ContentPreferencesPage from './content-preferences/page';
import HelpScamProtectionPage from './help/page';
import HiddenWordsPage from './hidden-words/page';
import LanguagePage from './language/page';
import LikeShareCountsPage from './like-share-counts/page';
import MessagesStoryRepliesPage from './messages/page';
import MutedAccountsPage from './muted/page';
import NotificationsPage from './notifications/page';
import AccountPrivacyPage from './privacy/page';
import PrivacyCenterPage from './privacy-center/page';
import EditProfilePage from './profile/page';
import RestrictedAccountsPage from './restricted/page';
import SharingPage from './sharing/page';
import AccountStatusPage from './status/page';
import StoryLocationPrivacyPage from './story-location/page';
import CreatorSubscriptionsPage from './subscriptions/page';
import TagsMentionsPage from './tags-mentions/page';
import TravoraVerifiedPage from './verified/page';
import WebsitePermissionsPage from './website-permissions/page';

interface SettingsRow {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
}

interface SettingsSection {
  title: string;
  rows: SettingsRow[];
}

export default function SettingsLandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState<string | null>(null);

  // Sync state with URL pathname instantly
  useEffect(() => {
    if (!pathname) return;
    const slug = pathname.split('/').pop();
    if (slug && slug !== 'settings') {
      setActiveView(slug);
    } else {
      setActiveView(null);
    }
  }, [pathname]);

  const sections: SettingsSection[] = [
    {
      title: 'Your Account',
      rows: [
        {
          id: 'account',
          title: 'Account Center',
          description: 'Personal details, security controls, password, and sponsorship preferences',
          path: '/settings/account',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'How You Use Travora',
      rows: [
        {
          id: 'profile',
          title: 'Edit Profile',
          description: 'Update avatar, bio details, travel links, and view your ranking status',
          path: '/settings/profile',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )
        },
        {
          id: 'notifications',
          title: 'Notifications',
          description: 'Configure push alerts and email summaries for likes, bookings, and live-streams',
          path: '/settings/notifications',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'Who Can See Your Content',
      rows: [
        {
          id: 'privacy',
          title: 'Account Privacy',
          description: 'Switch between a public profile and a private traveler journal',
          path: '/settings/privacy',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )
        },
        {
          id: 'close-friends',
          title: 'Inner Circle',
          description: 'Manage your close travel buddies list for exclusive stories and maps',
          path: '/settings/close-friends',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          )
        },
        {
          id: 'blocked',
          title: 'Blocked Accounts',
          description: 'See which travel profiles and accounts you have blocked from contacting you',
          path: '/settings/blocked',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          )
        },
        {
          id: 'story-location',
          title: 'Story and Location Privacy',
          description: 'Hide live-streams and location pins from specific accounts',
          path: '/settings/story-location',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'How Others Can Interact With You',
      rows: [
        {
          id: 'messages',
          title: 'Messages and Story Replies',
          description: 'Control message requests, reply settings, and active online status',
          path: '/settings/messages',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )
        },
        {
          id: 'tags-mentions',
          title: 'Tags and Mentions',
          description: 'Choose who can tag you in posts or mentions. Toggle manual tag approval',
          path: '/settings/tags-mentions',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="9" x2="15" y2="15" />
              <line x1="15" y1="9" x2="9" y2="15" />
            </svg>
          )
        },
        {
          id: 'comments',
          title: 'Comments',
          description: 'Control comment rules, filter vulgarity, and allow GIF comments',
          path: '/settings/comments',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          )
        },
        {
          id: 'sharing',
          title: 'Sharing',
          description: 'Configure reposts, story sharing, and message attachment parameters',
          path: '/settings/sharing',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          )
        },
        {
          id: 'restricted',
          title: 'Restricted Accounts',
          description: 'Manage accounts restricted from comments or direct chat visibility',
          path: '/settings/restricted',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )
        },
        {
          id: 'hidden-words',
          title: 'Hidden Words',
          description: 'Filter custom offensive words, phrases, and spam comments',
          path: '/settings/hidden-words',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 7 4 4 20 4 20 7" />
              <line x1="9" y1="20" x2="15" y2="20" />
              <line x1="12" y1="4" x2="12" y2="20" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'What You See',
      rows: [
        {
          id: 'muted',
          title: 'Muted Accounts',
          description: 'View travelers you have muted on the explore grid or story list',
          path: '/settings/muted',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )
        },
        {
          id: 'content-preferences',
          title: 'Content Preferences',
          description: 'Adjust recommendations and limits on sensitive travel videos',
          path: '/settings/content-preferences',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          )
        },
        {
          id: 'like-share-counts',
          title: 'Like and Share Counts',
          description: 'Toggle counts platform-wide for a cleaner, stats-free scrolling feed',
          path: '/settings/like-share-counts',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )
        },
        {
          id: 'subscriptions',
          title: 'Creator Subscriptions',
          description: 'Manage active viewer subscriptions and supporting creator channels',
          path: '/settings/subscriptions',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'Your App and Media',
      rows: [
        {
          id: 'archiving',
          title: 'Archiving and Downloading',
          description: 'Auto-archive past travel stories and request copies of your files',
          path: '/settings/archiving',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
          )
        },
        {
          id: 'accessibility',
          title: 'Accessibility',
          description: 'Manage captions, text size, and reduce motion effects app-wide',
          path: '/settings/accessibility',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-4 5h8v2H8zm0-4h8v2H8z" />
            </svg>
          )
        },
        {
          id: 'language',
          title: 'Language',
          description: 'Change translations and search language settings',
          path: '/settings/language',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          )
        },
        {
          id: 'website-permissions',
          title: 'Website Permissions',
          description: 'Manage active keys, OAuth permissions, and external map embeds',
          path: '/settings/website-permissions',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'For Professionals & Creators',
      rows: [
        {
          id: 'account-type',
          title: 'Account Type and Tools',
          description: 'Switch between Traveler, Vlogger, and Venture account profiles',
          path: '/settings/account-type',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          )
        },
        {
          id: 'verified',
          title: 'Travora Verified',
          description: 'Apply for the official Travora badge to unlock premium visibility features',
          path: '/settings/verified',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'More Info and Support',
      rows: [
        {
          id: 'help',
          title: 'Help & Scam Protection',
          description: 'Help center guides, scam reports, support tickets, and direct feedback',
          path: '/settings/help',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )
        },
        {
          id: 'privacy-center',
          title: 'Privacy Center',
          description: 'Informational data protection logs and policies',
          path: '/settings/privacy-center',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          )
        },
        {
          id: 'status',
          title: 'Account Status',
          description: 'Verify your standing card, check content removals and guidelines standing',
          path: '/settings/status',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )
        }
      ]
    }
  ];

  // Filtering sections based on search query
  const filteredSections = sections
    .map(section => {
      const matchedRows = section.rows.filter(
        row =>
          row.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...section, rows: matchedRows };
    })
    .filter(section => section.rows.length > 0);

  if (activeView) {
    switch (activeView) {
      case 'accessibility': return <AccessibilityPage />;
      case 'account': return <AccountCenterPage />;
      case 'account-type': return <AccountTypePage />;
      case 'archiving': return <ArchivingPage />;
      case 'blocked': return <BlockedAccountsPage />;
      case 'close-friends': return <InnerCirclePage />;
      case 'comments': return <CommentsPage />;
      case 'content-preferences': return <ContentPreferencesPage />;
      case 'help': return <HelpScamProtectionPage />;
      case 'hidden-words': return <HiddenWordsPage />;
      case 'language': return <LanguagePage />;
      case 'like-share-counts': return <LikeShareCountsPage />;
      case 'messages': return <MessagesStoryRepliesPage />;
      case 'muted': return <MutedAccountsPage />;
      case 'notifications': return <NotificationsPage />;
      case 'privacy': return <AccountPrivacyPage />;
      case 'privacy-center': return <PrivacyCenterPage />;
      case 'profile': return <EditProfilePage />;
      case 'restricted': return <RestrictedAccountsPage />;
      case 'sharing': return <SharingPage />;
      case 'status': return <AccountStatusPage />;
      case 'story-location': return <StoryLocationPrivacyPage />;
      case 'subscriptions': return <CreatorSubscriptionsPage />;
      case 'tags-mentions': return <TagsMentionsPage />;
      case 'verified': return <TravoraVerifiedPage />;
      case 'website-permissions': return <WebsitePermissionsPage />;
      default: break;
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Title Header */}
      <div>
        <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
          Settings
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Configure your personal profiles, moderation filters, and developer tools
        </p>
      </div>

      {/* Search Input */}
      <div 
        className="search-input-wrapper explore-search-input-wrapper"
        style={{
          maxWidth: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        {/* App Logo */}
        <div className="explore-search-logo-container" title="Travora">
          <Logo theme={theme} width={20} showText={false} />
        </div>
        
        {/* SVG Search Icon */}
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="explore-search-svg-icon"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>

        <input
          type="text"
          placeholder="Search settings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="comment-input explore-search-field"
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '13px',
            width: '100%',
            marginLeft: '2px'
          }}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}
          >
            &times;
          </button>
        )}
      </div>

      {/* Settings Sections Group */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {filteredSections.map((section, idx) => (
          <div 
            key={idx} 
            style={{
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <h3 style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              paddingLeft: '4px',
              margin: 0
            }}>
              {section.title}
            </h3>

            <div 
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {section.rows.map((row, rowIdx) => (
                <div
                  key={row.id}
                  onClick={() => {
                    setActiveView(row.id);
                    window.history.pushState(null, '', row.path);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    borderBottom: rowIdx < section.rows.length - 1 ? '1px solid var(--card-border)' : 'none'
                  }}
                  className="settings-list-item-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      color: 'var(--primary)',
                      background: 'var(--primary-glow)',
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {row.icon}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.title}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.description}</span>
                    </div>
                  </div>

                  <div style={{ color: 'var(--text-muted)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredSections.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '14px' }}>No settings found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
