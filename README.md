
# Code DNA Visualizer 🧬

A visually striking web application that transforms GitHub profiles into beautiful interactive visualizations, representing repositories and contributions through creative patterns like DNA helixes, galaxies, and tree structures.

## ✨ Features

- **Multiple Visualization Modes**
  - 🧬 DNA Helix: Represents repositories in a spiraling double-helix pattern
  - 🌌 Galaxy: Shows repos as stars in a cosmic visualization
  - 🌳 Tree: Displays contributions in a hierarchical tree structure

- **GitHub Integration**
  - Search any GitHub username
  - View public repository statistics
  - Language distribution analysis
  - Real-time data fetching

- **Interactive Elements**
  - Smooth animations and transitions
  - Hover effects with detailed information
  - Export visualizations as images
  - Responsive design for all devices

- **Special Features**
  - Dark/Light mode support
  - Easter egg for Linux creator
  - Export visualization capability
  - Professional UI with toasts and loading states

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd code-dna-visualizer
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🛠 Tech Stack

- **Frontend Framework**: React with Vite
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Visualization**: Three.js, D3.js
- **State Management**: TanStack Query
- **Type Safety**: TypeScript
- **Routing**: React Router
- **API Integration**: GitHub REST API

## 🎨 Visualization Modes

### DNA Helix Mode
Represents repositories as nucleotides in a double helix structure, with:
- Colors representing different programming languages
- Size indicating repository activity
- Interactive animations on hover

### Galaxy Mode
Displays repositories as stars in a cosmic visualization:
- Star size based on repository size/activity
- Colors mapped to primary programming language
- Interactive star cluster navigation

### Tree Mode
Shows repositories in a hierarchical tree structure:
- Branch size based on contribution volume
- Colors indicating programming languages
- Interactive zooming and panning

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- 💻 Desktop computers
- 📱 Mobile devices
- 📟 Tablets

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- Visualization libraries: Three.js and D3.js
- UI components from shadcn/ui

