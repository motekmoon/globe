import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Globe from "./components/Globe";
import LocationInput from "./components/LocationInput";
import LocationManager from "./components/LocationManager";
import { locationService, Location } from "./lib/supabase";
import "./App.css";

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Load locations from Supabase on component mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await locationService.getLocations();
        setLocations(data);
      } catch (error) {
        console.error('Error loading locations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  const handleLocationAdd = async (location: {
    name: string;
    lat: number;
    lng: number;
  }) => {
    try {
      const newLocation = await locationService.addLocation({
        name: location.name,
        latitude: location.lat,
        longitude: location.lng,
      });

      if (newLocation) {
        setLocations((prev) => [newLocation, ...prev]);
      }
    } catch (error) {
      console.error('Error adding location:', error);
      // Fallback to local state if database fails
      const fallbackLocation = {
        id: Date.now().toString(),
        name: location.name,
        latitude: location.lat,
        longitude: location.lng,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setLocations((prev) => [fallbackLocation, ...prev]);
    }
  };

  return (
    <div className="app">
      <div className="ui-overlay">
        <h1 className="title">Interactive Globe</h1>
        <LocationInput onLocationAdd={handleLocationAdd} />
        {loading && <p className="loading-text">Loading locations...</p>}
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
