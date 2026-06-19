(function() {
    // Bail out early if reduced motion is preferred
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = document.getElementById('hero3d-canvas');
    if (!canvas) return;

    // Configuration
    const particleColor = 0xff7a3d; // Brand accent orange
    const lineColor = 0xffffff;
    const maxConnectionDistance = 150;
    
    // Scene setup
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance

    // Particle count based on screen width
    let particleCount = window.innerWidth < 768 ? 100 : 250;
    
    let particles;
    let linesMesh;
    let particlePositions = [];
    let particleVelocities = [];

    function initParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        particlePositions = [];
        particleVelocities = [];

        for (let i = 0; i < particleCount; i++) {
            // Random positions spread out
            const x = (Math.random() - 0.5) * window.innerWidth * 1.5;
            const y = (Math.random() - 0.5) * window.innerHeight * 1.5;
            const z = (Math.random() - 0.5) * 400;
            
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            particlePositions.push(new THREE.Vector3(x, y, z));
            
            // Random slow velocity
            particleVelocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 0.4
            ));
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Create points
        const material = new THREE.PointsMaterial({
            color: particleColor,
            size: 3,
            transparent: true,
            opacity: 0.8
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // Setup lines (empty initially, will be populated)
        const linesGeometry = new THREE.BufferGeometry();
        const linesMaterial = new THREE.LineBasicMaterial({
            color: lineColor,
            transparent: true,
            opacity: 0.15
        });
        
        linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
        scene.add(linesMesh);
    }

    initParticles();

    // Resize handler
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        
        // Adjust particle count on major breakpoints if needed, though usually keeping the same is okay, 
        // to avoid recreating geometry on mobile orientation change
    });

    // Animation Loop Variables
    let isVisible = true;
    let animationFrameId;
    let frameCount = 0;

    // Intersection Observer to pause rendering when off-screen
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
                if (isVisible) {
                    animate();
                } else {
                    cancelAnimationFrame(animationFrameId);
                }
            });
        }, { threshold: 0 });
        observer.observe(heroSection);
    }

    function animate() {
        if (!isVisible) return;
        animationFrameId = requestAnimationFrame(animate);

        const positions = particles.geometry.attributes.position.array;

        // Update positions
        for (let i = 0; i < particleCount; i++) {
            particlePositions[i].add(particleVelocities[i]);

            // Bounce off boundaries loosely based on screen size
            if (Math.abs(particlePositions[i].x) > window.innerWidth * 0.8) particleVelocities[i].x *= -1;
            if (Math.abs(particlePositions[i].y) > window.innerHeight * 0.8) particleVelocities[i].y *= -1;
            if (Math.abs(particlePositions[i].z) > 400) particleVelocities[i].z *= -1;

            positions[i * 3] = particlePositions[i].x;
            positions[i * 3 + 1] = particlePositions[i].y;
            positions[i * 3 + 2] = particlePositions[i].z;
        }
        
        particles.geometry.attributes.position.needsUpdate = true;

        // Throttle line segment rebuilding (every ~12 frames)
        frameCount++;
        if (frameCount % 12 === 0) {
            updateLines();
        }

        renderer.render(scene, camera);
    }

    function updateLines() {
        const linePositions = [];
        
        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                const dx = particlePositions[i].x - particlePositions[j].x;
                const dy = particlePositions[i].y - particlePositions[j].y;
                const dz = particlePositions[i].z - particlePositions[j].z;
                
                const distSq = dx*dx + dy*dy + dz*dz;
                
                if (distSq < maxConnectionDistance * maxConnectionDistance) {
                    linePositions.push(
                        particlePositions[i].x, particlePositions[i].y, particlePositions[i].z,
                        particlePositions[j].x, particlePositions[j].y, particlePositions[j].z
                    );
                }
            }
        }
        
        linesMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    }

    // Start initial animation if visible (handled by intersection observer typically, but fallback)
    if (!heroSection) animate();

})();
