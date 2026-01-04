// Popular Service Icons as SVG components
export const ServiceIcons: Record<string, { icon: string; color: string; gradient: string }> = {
    // Entertainment
    netflix: {
        icon: '🎬',
        color: '#E50914',
        gradient: 'linear-gradient(135deg, #E50914 0%, #B81D24 100%)',
    },
    spotify: {
        icon: '🎵',
        color: '#1DB954',
        gradient: 'linear-gradient(135deg, #1DB954 0%, #1ED760 100%)',
    },
    youtube: {
        icon: '▶️',
        color: '#FF0000',
        gradient: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
    },
    disney: {
        icon: '✨',
        color: '#113CCF',
        gradient: 'linear-gradient(135deg, #113CCF 0%, #0063E5 100%)',
    },
    hbo: {
        icon: '📺',
        color: '#5822B4',
        gradient: 'linear-gradient(135deg, #5822B4 0%, #9747FF 100%)',
    },
    appletv: {
        icon: '🍎',
        color: '#000000',
        gradient: 'linear-gradient(135deg, #555555 0%, #000000 100%)',
    },

    // Productivity & AI
    chatgpt: {
        icon: '🤖',
        color: '#10A37F',
        gradient: 'linear-gradient(135deg, #10A37F 0%, #1A7F5A 100%)',
    },
    claude: {
        icon: '🧠',
        color: '#D97757',
        gradient: 'linear-gradient(135deg, #D97757 0%, #C4623D 100%)',
    },
    notion: {
        icon: '📝',
        color: '#000000',
        gradient: 'linear-gradient(135deg, #444444 0%, #000000 100%)',
    },
    slack: {
        icon: '💬',
        color: '#4A154B',
        gradient: 'linear-gradient(135deg, #4A154B 0%, #611F69 100%)',
    },
    zoom: {
        icon: '📹',
        color: '#2D8CFF',
        gradient: 'linear-gradient(135deg, #2D8CFF 0%, #0B5CFF 100%)',
    },
    microsoft365: {
        icon: '📊',
        color: '#D83B01',
        gradient: 'linear-gradient(135deg, #D83B01 0%, #FFB900 100%)',
    },

    // Design & Creative
    adobe: {
        icon: '🎨',
        color: '#FF0000',
        gradient: 'linear-gradient(135deg, #FF0000 0%, #FF5500 100%)',
    },
    figma: {
        icon: '🖌️',
        color: '#F24E1E',
        gradient: 'linear-gradient(135deg, #F24E1E 0%, #A259FF 100%)',
    },
    canva: {
        icon: '🎨',
        color: '#00C4CC',
        gradient: 'linear-gradient(135deg, #00C4CC 0%, #7D2AE8 100%)',
    },

    // Development
    github: {
        icon: '🐙',
        color: '#181717',
        gradient: 'linear-gradient(135deg, #333333 0%, #181717 100%)',
    },
    vercel: {
        icon: '▲',
        color: '#000000',
        gradient: 'linear-gradient(135deg, #333333 0%, #000000 100%)',
    },
    aws: {
        icon: '☁️',
        color: '#FF9900',
        gradient: 'linear-gradient(135deg, #FF9900 0%, #232F3E 100%)',
    },
    digitalocean: {
        icon: '🌊',
        color: '#0080FF',
        gradient: 'linear-gradient(135deg, #0080FF 0%, #0061C2 100%)',
    },

    // Cloud Storage
    dropbox: {
        icon: '📦',
        color: '#0061FF',
        gradient: 'linear-gradient(135deg, #0061FF 0%, #004DC9 100%)',
    },
    googledrive: {
        icon: '📁',
        color: '#4285F4',
        gradient: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
    },
    icloud: {
        icon: '☁️',
        color: '#3693F3',
        gradient: 'linear-gradient(135deg, #3693F3 0%, #5AC8FA 100%)',
    },

    // Security
    nordvpn: {
        icon: '🔒',
        color: '#4687FF',
        gradient: 'linear-gradient(135deg, #4687FF 0%, #3465C2 100%)',
    },
    '1password': {
        icon: '🔐',
        color: '#1A8CFF',
        gradient: 'linear-gradient(135deg, #1A8CFF 0%, #0064D2 100%)',
    },

    // Gaming
    gamepass: {
        icon: '🎮',
        color: '#107C10',
        gradient: 'linear-gradient(135deg, #107C10 0%, #0E5C0E 100%)',
    },
    playstation: {
        icon: '🎮',
        color: '#003791',
        gradient: 'linear-gradient(135deg, #003791 0%, #00439C 100%)',
    },

    // Default
    other: {
        icon: '📦',
        color: '#6366F1',
        gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    },
};

// Get icon by app name (fuzzy match)
export const getServiceIcon = (appName: string): typeof ServiceIcons[string] => {
    const name = appName.toLowerCase().replace(/\s+/g, '');

    // Direct match
    if (ServiceIcons[name]) {
        return ServiceIcons[name];
    }

    // Partial match
    for (const [key, value] of Object.entries(ServiceIcons)) {
        if (name.includes(key) || key.includes(name)) {
            return value;
        }
    }

    // Special matches
    if (name.includes('gpt') || name.includes('openai')) return ServiceIcons.chatgpt;
    if (name.includes('creative') || name.includes('photoshop') || name.includes('premiere')) return ServiceIcons.adobe;
    if (name.includes('office') || name.includes('word') || name.includes('excel')) return ServiceIcons.microsoft365;
    if (name.includes('prime')) return ServiceIcons.appletv;
    if (name.includes('vpn')) return ServiceIcons.nordvpn;

    return ServiceIcons.other;
};

// Popular services for quick add
export const PopularServices = [
    { name: 'Netflix', key: 'netflix', price: 260000 },
    { name: 'Spotify Premium', key: 'spotify', price: 59000 },
    { name: 'YouTube Premium', key: 'youtube', price: 79000 },
    { name: 'ChatGPT Plus', key: 'chatgpt', price: 500000 },
    { name: 'Adobe Creative Cloud', key: 'adobe', price: 1500000 },
    { name: 'Microsoft 365', key: 'microsoft365', price: 1500000 },
    { name: 'Figma Pro', key: 'figma', price: 300000 },
    { name: 'GitHub Pro', key: 'github', price: 100000 },
    { name: 'Notion Plus', key: 'notion', price: 200000 },
    { name: 'Canva Pro', key: 'canva', price: 300000 },
];
