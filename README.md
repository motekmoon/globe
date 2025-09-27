# 🌍 Interactive 3D Globe

A stunning interactive 3D globe built with React, TypeScript, and Three.js featuring real NASA Blue Marble satellite imagery, neon green location markers, and smooth animations.

![Interactive Globe](https://img.shields.io/badge/React-3D%20Globe-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)

## ✨ Features

- 🌍 **Real NASA Blue Marble Texture** - High-resolution satellite imagery from NASA
- 🎯 **Interactive Location Markers** - Add locations by address or coordinates
- 💚 **Neon Green Visual Effects** - Glowing dots and animated lines
- 🔄 **Three-Axis Rotation** - Smooth animation on all axes
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🗺️ **Mapbox Geocoding** - Real-time address to coordinate conversion
- ⚡ **TypeScript** - Full type safety and better development experience

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/motekmoon/globe.git
   cd globe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎮 Usage

### Adding Locations

**By Address:**
1. Type a city or address in the input field
2. Click "Add Location"
3. Watch the neon green dot appear on the globe!

**By Coordinates:**
1. Enter latitude and longitude values
2. Click "Add Coordinates"
3. See your exact location marked

### Controls

- **Mouse/Touch**: Rotate the globe
- **Scroll/Pinch**: Zoom in and out
- **Pan**: Move around the globe (disabled for better UX)

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D graphics
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers and abstractions
- **Mapbox Geocoding API** - Address to coordinates conversion
- **NASA Blue Marble** - Real satellite imagery

## 📁 Project Structure

```
src/
├── components/
│   ├── Globe.tsx           # Main 3D globe component
│   ├── LocationDot.tsx     # Neon green location markers
│   ├── LocationLine.tsx    # Animated lines from center
│   ├── LocationInput.tsx   # Address/coordinate input
│   └── LocationManager.tsx # Manages all locations
├── App.tsx                 # Main application component
├── App.css                 # Global styles
└── index.tsx              # Application entry point
```

## 🔧 Configuration

### Mapbox API Setup

To enable real geocoding, you'll need a Mapbox API token:

1. Sign up at [Mapbox](https://www.mapbox.com/)
2. Get your API token
3. Replace the placeholder in `src/components/LocationInput.tsx`:

```typescript
const MAPBOX_TOKEN = 'your_actual_token_here';
```

### Customization

**Colors:**
- Change neon green color in `LocationDot.tsx` and `LocationLine.tsx`
- Modify `color="#00ff41"` to your preferred color

**Animation Speed:**
- Adjust rotation speed in `Globe.tsx`
- Modify `delta * 0.1` values for different speeds

**Globe Size:**
- Change sphere radius in `Globe.tsx`
- Modify `args={[2, 64, 32]}` (radius, widthSegments, heightSegments)

## 🎨 Visual Features

- **NASA Blue Marble Texture** - Real Earth satellite imagery
- **Three-Axis Rotation** - Complex, smooth animation
- **Neon Green Effects** - Glowing dots and lines
- **Animated Line Drawing** - Lines draw from center to locations
- **Location Labels** - Text labels appear after animation
- **Responsive UI** - Adapts to all screen sizes

## 🌐 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Deploy automatically on every push
3. Get a live URL instantly

### Netlify

1. Build the project: `npm run build`
2. Deploy the `build` folder to Netlify
3. Configure redirects for React Router

### GitHub Pages

1. Run `npm run build`
2. Deploy the `build` folder to GitHub Pages
3. Configure the repository settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA** - For the incredible Blue Marble satellite imagery
- **Mapbox** - For geocoding services
- **Three.js** - For the amazing 3D graphics library
- **React Three Fiber** - For seamless React integration

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Made with ❤️ and lots of ☕**

*Experience the world like never before with this interactive 3D globe!*