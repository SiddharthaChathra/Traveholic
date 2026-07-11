'use client';

import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onChangeTab: (tabId: string) => void;
  style?: React.CSSProperties;
}

export default function TabBar({ tabs, activeTab, onChangeTab, style }: TabBarProps) {
  return (
    <div 
      className="explore-categories-scroll-wrapper" 
      style={{ 
        margin: '0 0 20px 0', 
        overflowX: 'auto',
        display: 'flex',
        gap: '8px',
        paddingBottom: '8px',
        ...style 
      }}
    >
      <div className="explore-categories-container" style={{ display: 'flex', gap: '8px' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`explore-category-btn ${isActive ? 'active' : ''}`}
              onClick={() => onChangeTab(tab.id)}
              style={{
                padding: '8px 18px',
                borderRadius: '24px',
                border: isActive ? '1px solid transparent' : '1px solid var(--tag-border, rgba(255, 255, 255, 0.08))',
                background: isActive ? 'var(--brand-gradient)' : 'var(--tag-bg, rgba(255, 255, 255, 0.02))',
                color: isActive ? '#ffffff' : 'var(--tag-color, rgba(255, 255, 255, 0.7))',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.icon}
              <span style={{ position: 'relative', zIndex: 2 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
