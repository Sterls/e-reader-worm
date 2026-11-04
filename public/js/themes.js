// Colours the board canvas uses. The page colours live in css/style.css.
export const THEMES = {
  ink: {
    name: 'Ink', board: '#0c1a22', cell: '#132a35', tile: '#f5ecd7', tileTop: '#fffaf0', tileEdge: '#cdbb94',
    letter: '#1d2a33', value: '#9b8a66', select: '#ffd166', selectTop: '#ffe7a3', selectEdge: '#c99528',
    path: 'rgba(255, 209, 102, 0.75)', pathValid: 'rgba(61, 220, 151, 0.9)', accent: '#3ddc97',
  },
  sepia: {
    name: 'Sepia', board: '#24190f', cell: '#33251a', tile: '#fbf1dc', tileTop: '#fffaf0', tileEdge: '#d8bf92',
    letter: '#3a2a1c', value: '#a88a5e', select: '#ffc46b', selectTop: '#ffe0a8', selectEdge: '#c98a2c',
    path: 'rgba(255, 196, 107, 0.75)', pathValid: 'rgba(240, 160, 75, 0.95)', accent: '#f0a04b',
  },
  midnight: {
    name: 'Midnight', board: '#08081a', cell: '#141533', tile: '#2b2e57', tileTop: '#3a3e72', tileEdge: '#16173a',
    letter: '#f0efff', value: '#9d9fd8', select: '#8b7dff', selectTop: '#b0a6ff', selectEdge: '#5a4bd6',
    path: 'rgba(139, 125, 255, 0.75)', pathValid: 'rgba(80, 230, 200, 0.9)', accent: '#8b7dff',
  },
};
export const THEME_ORDER = ['ink', 'sepia', 'midnight'];
