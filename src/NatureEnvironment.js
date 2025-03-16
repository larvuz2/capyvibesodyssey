import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

export default class NatureEnvironment {
  constructor(scene) {
    this.scene = scene;
    
    // Configuration options
    this.config = {
      terrain: {
        width: 200,
        height: 200,
        segments: 50,  // Reduced segments since we don't need as many for flat terrain
        heightScale: 0, // Set to 0 to make terrain flat
        noiseScale: 0.1,
      },
      trees: {
        count: 100,
        minHeight: 1,
        maxHeight: 3,
        minRadius: 0.5,
        maxRadius: 1.5,
      },
      rocks: {
        pairCount: 30,     // Number of rock pairs to generate
        minSize: 0.3,      // Minimum rock size
        maxSize: 0.8,      // Maximum rock size
        pairDistance: 0.8, // Average distance between rocks in a pair
        roughness: 0.7,    // Material roughness
      },
      clouds: {
        count: 20,
        minHeight: 25,
        maxHeight: 40,
        minSize: 5,
        maxSize: 15,
        speed: 0.02,
      }
    };
    
    // Container for environment objects
    this.objects = {
      terrain: null,
      trees: [],
      rocks: [],
      clouds: [],
    };
    
    // Initialize noise generator
    this.noise = new SimplexNoise();
  }
  
  // Initialize the entire environment
  init() {
    this.createTerrain();
    this.createTrees();
    this.createRocks();
    this.createClouds();
    return this;
  }
  
  // Create flat terrain
  createTerrain() {
    const { width, height, segments } = this.config.terrain;
    
    // Create geometry - we don't need to modify the vertices anymore
    const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
    
    // Create material with green color for fields
    const material = new THREE.MeshStandardMaterial({
      color: 0x4CAF50,
      roughness: 0.8,
      metalness: 0.2,
      flatShading: false,
    });
    
    // Create mesh and add to scene
    this.objects.terrain = new THREE.Mesh(geometry, material);
    this.objects.terrain.rotation.x = -Math.PI / 2; // Make it horizontal
    this.objects.terrain.receiveShadow = true;
    this.scene.add(this.objects.terrain);
    
    return this.objects.terrain;
  }
  
  // Create trees distributed across the terrain
  createTrees() {
    const { count, minHeight, maxHeight, minRadius, maxRadius } = this.config.trees;
    const { width, height } = this.config.terrain;
    
    for (let i = 0; i < count; i++) {
      // Random position on the terrain
      const x = (Math.random() - 0.5) * width * 0.8; // Keep away from edges
      const z = (Math.random() - 0.5) * height * 0.8;
      
      // For flat terrain, y is always 0
      const y = 0;
      
      // Random tree properties
      const treeHeight = minHeight + Math.random() * (maxHeight - minHeight);
      const trunkRadius = minRadius + Math.random() * (maxRadius - minRadius);
      
      // Create tree
      const tree = this.createTree(treeHeight, trunkRadius);
      tree.position.set(x, y, z);
      
      // Add to scene and store in objects
      this.scene.add(tree);
      this.objects.trees.push(tree);
    }
    
    return this.objects.trees;
  }
  
  // Create a simple tree with trunk and leaves
  createTree(height, radius) {
    const group = new THREE.Group();
    
    // Create trunk
    const trunkGeometry = new THREE.CylinderGeometry(radius * 0.3, radius * 0.4, height * 0.6, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 0.9,
      metalness: 0.1,
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = height * 0.3;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);
    
    // Create leaves (as a cone)
    const leavesGeometry = new THREE.ConeGeometry(radius, height, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228B22,
      roughness: 0.8,
      metalness: 0.1,
    });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = height * 0.5 + height * 0.25;
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    group.add(leaves);
    
    return group;
  }
  
  // Create rocks distributed across the terrain
  createRocks() {
    const { pairCount, minSize, maxSize, pairDistance, roughness } = this.config.rocks;
    const { width, height } = this.config.terrain;
    
    for (let i = 0; i < pairCount; i++) {
      // Random position for the pair center
      const centerX = (Math.random() - 0.5) * width * 0.8; // Keep away from edges
      const centerZ = (Math.random() - 0.5) * height * 0.8;
      
      // For flat terrain, y is always 0
      const y = 0;
      
      // Create the first rock
      const size1 = minSize + Math.random() * (maxSize - minSize);
      const rock1 = this.createRock(size1);
      
      // Random angle for pair positioning
      const angle = Math.random() * Math.PI * 2;
      const distance = pairDistance * (0.8 + Math.random() * 0.4); // Varied distance
      
      // Position and rotate first rock
      rock1.position.set(
        centerX + Math.cos(angle) * distance * 0.5,
        y,
        centerZ + Math.sin(angle) * distance * 0.5
      );
      rock1.rotation.y = Math.random() * Math.PI * 2; // Random rotation
      
      // Create the second rock with a different size
      const size2 = minSize + Math.random() * (maxSize - minSize);
      const rock2 = this.createRock(size2);
      
      // Position and rotate second rock 
      rock2.position.set(
        centerX - Math.cos(angle) * distance * 0.5,
        y,
        centerZ - Math.sin(angle) * distance * 0.5
      );
      rock2.rotation.y = Math.random() * Math.PI * 2; // Random rotation
      
      // Add to scene and store in objects
      this.scene.add(rock1);
      this.scene.add(rock2);
      this.objects.rocks.push(rock1);
      this.objects.rocks.push(rock2);
    }
    
    return this.objects.rocks;
  }
  
  // Create a rock with realistic appearance
  createRock(size) {
    const group = new THREE.Group();
    
    // Create a random color variation for the rock
    const colorVariation = Math.random() * 0.2 - 0.1; // -0.1 to 0.1
    const rockColor = new THREE.Color(0x7D7D7D); // Base gray color
    rockColor.r += colorVariation;
    rockColor.g += colorVariation;
    rockColor.b += colorVariation;
    
    const material = new THREE.MeshStandardMaterial({
      color: rockColor,
      roughness: this.config.rocks.roughness,
      metalness: 0.1,
      flatShading: true, // Enable flat shading for rocky appearance
    });
    
    // Determine rock shape type
    const shapeType = Math.floor(Math.random() * 3); // 0, 1, or 2 for different shapes
    
    if (shapeType === 0) {
      // Angular rock using modified box geometry
      const geometry = new THREE.BoxGeometry(
        size * (0.8 + Math.random() * 0.4),
        size * (0.6 + Math.random() * 0.3),
        size * (0.7 + Math.random() * 0.5)
      );
      
      // Displace vertices for irregular shape
      const positions = geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        // Random displacement
        const displacement = (Math.random() - 0.5) * size * 0.2;
        positions.setXYZ(i, x + displacement, y + displacement, z + displacement);
      }
      
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
    } 
    else if (shapeType === 1) {
      // Round rock using sphere-based geometry
      const mainSphere = new THREE.Mesh(
        new THREE.SphereGeometry(size * 0.5, 7, 7),
        material
      );
      group.add(mainSphere);
      
      // Add some smaller spheres for a more irregular appearance
      const smallSphereCount = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < smallSphereCount; i++) {
        const smallSize = size * (0.2 + Math.random() * 0.3);
        const smallSphere = new THREE.Mesh(
          new THREE.SphereGeometry(smallSize, 5, 5),
          material
        );
        
        // Position around the main sphere
        const angle = Math.random() * Math.PI * 2;
        const elevation = Math.random() * Math.PI - Math.PI / 2;
        const distance = size * 0.4;
        
        smallSphere.position.set(
          Math.cos(angle) * Math.cos(elevation) * distance,
          Math.sin(elevation) * distance,
          Math.sin(angle) * Math.cos(elevation) * distance
        );
        
        group.add(smallSphere);
      }
    }
    else {
      // Jagged rock using tetrahedron-based geometry
      const tetraGeometry = new THREE.TetrahedronGeometry(size * 0.5, 1);
      
      // Displace vertices for irregular shape
      const tetraPositions = tetraGeometry.attributes.position;
      for (let i = 0; i < tetraPositions.count; i++) {
        const x = tetraPositions.getX(i);
        const y = tetraPositions.getY(i);
        const z = tetraPositions.getZ(i);
        
        // Random displacement (more pronounced than for box)
        const displacement = (Math.random() - 0.5) * size * 0.4;
        tetraPositions.setXYZ(i, x + displacement, y + displacement, z + displacement);
      }
      
      tetraGeometry.computeVertexNormals();
      const tetraMesh = new THREE.Mesh(tetraGeometry, material);
      
      // Random rotation
      tetraMesh.rotation.x = Math.random() * Math.PI;
      tetraMesh.rotation.z = Math.random() * Math.PI;
      
      group.add(tetraMesh);
    }
    
    // Apply shadow settings to all objects in group
    group.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    
    return group;
  }
  
  // Create cloud shapes in the sky
  createClouds() {
    const { count, minHeight, maxHeight, minSize, maxSize } = this.config.clouds;
    const { width, height } = this.config.terrain;
    
    for (let i = 0; i < count; i++) {
      // Random position in the sky
      const x = (Math.random() - 0.5) * width * 1.5; // Wider distribution than terrain
      const z = (Math.random() - 0.5) * height * 1.5;
      const y = minHeight + Math.random() * (maxHeight - minHeight);
      
      // Random cloud size
      const size = minSize + Math.random() * (maxSize - minSize);
      
      // Create cloud
      const cloud = this.createCloud(size);
      cloud.position.set(x, y, z);
      
      // Random rotation
      cloud.rotation.y = Math.random() * Math.PI * 2;
      
      // Add to scene and store in objects
      this.scene.add(cloud);
      this.objects.clouds.push(cloud);
    }
    
    return this.objects.clouds;
  }
  
  // Create a fluffy cloud shape
  createCloud(size) {
    const group = new THREE.Group();
    
    // Cloud material - bright white with some translucency
    const material = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.9,
    });
    
    // Create a cluster of spheres for cloud shape
    const sphereCount = 5 + Math.floor(Math.random() * 7);
    
    // Start with a central sphere
    const mainSphere = new THREE.Mesh(
      new THREE.SphereGeometry(size * 0.5, 7, 7),
      material
    );
    group.add(mainSphere);
    
    // Add surrounding spheres
    for (let i = 0; i < sphereCount; i++) {
      const sphereSize = size * (0.3 + Math.random() * 0.4);
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(sphereSize, 6, 6),
        material
      );
      
      // Position around the main sphere
      const angle = Math.random() * Math.PI * 2;
      const distance = size * (0.3 + Math.random() * 0.3);
      const height = (Math.random() - 0.5) * size * 0.3;
      
      sphere.position.set(
        Math.cos(angle) * distance,
        height,
        Math.sin(angle) * distance
      );
      
      group.add(sphere);
    }
    
    return group;
  }
  
  // Get height at a specific point on the terrain (always returns 0 for flat terrain)
  getTerrainHeight(x, z) {
    return 0; // Flat terrain
  }
  
  // Update function called every frame
  update(deltaTime) {
    // Move clouds slowly across the sky
    this.objects.clouds.forEach((cloud, index) => {
      // Move in different directions
      const direction = index % 2 === 0 ? 1 : -1;
      cloud.position.x += this.config.clouds.speed * direction * deltaTime;
      
      // Wrap around when they go too far
      const halfWidth = this.config.terrain.width * 0.75;
      if (cloud.position.x > halfWidth) {
        cloud.position.x = -halfWidth;
      } else if (cloud.position.x < -halfWidth) {
        cloud.position.x = halfWidth;
      }
    });
  }
}