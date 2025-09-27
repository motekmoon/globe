import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Globe from "./components/Globe";
import LocationInput from "./components/LocationInput";
import LocationManager from "./components/LocationManager";
import "./App.css";

function App() {
  const [locations, setLocations] = React.useState<
    Array<{
      id: string;
      name: string;
      lat: number;
      lng: number;
    }>
  >([]);

  const handleLocationAdd = (location: {
    name: string;
    lat: number;
    lng: number;
  }) => {
    const newLocation = {
      id: Date.now().toString(),
      ...location,
    };
    setLocations((prev) => [...prev, newLocation]);
  };

  return (
    <div className="app">
      <div className="ui-overlay">
        <h1 className="title">Interactive Globe</h1>
        <LocationInput onLocationAdd={handleLocationAdd} />
      </div>

      <div className="canvas-container">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: "#000000" }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1.2} />
            <pointLight position={[-10, -10, -5]} intensity={0.5} />

            <Globe />
            <LocationManager locations={locations} />

            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={10}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

export default App;
