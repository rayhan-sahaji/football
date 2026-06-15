import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Football3D() {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000)
    camera.position.z = 3.2

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // Football (truncated icosahedron approximation using sphere with pentagon pattern)
    const ballGroup = new THREE.Group()

    // Main ball
    const ballGeo = new THREE.IcosahedronGeometry(1, 1)
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1,
      flatShading: true,
    })
    const ball = new THREE.Mesh(ballGeo, ballMat)
    ballGroup.add(ball)

    // Black pentagon patches
    const patchGeo = new THREE.CircleGeometry(0.28, 5)
    const patchMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.4,
      metalness: 0.0,
      flatShading: true,
    })

    const positions = ballGeo.getAttribute('position')
    const pentagonCenters = []
    const vertices = []

    for (let i = 0; i < positions.count; i++) {
      vertices.push(new THREE.Vector3(positions.getX(i), positions.getY(i), positions.getZ(i)))
    }

    // Find pentagon centers (vertices with 5 neighbors on icosahedron)
    for (let i = 0; i < vertices.length; i++) {
      let neighbors = 0
      for (let j = 0; j < vertices.length; j++) {
        if (i !== j && vertices[i].distanceTo(vertices[j]) < 1.1) {
          neighbors++
        }
      }
      if (neighbors === 5) {
        pentagonCenters.push(vertices[i].clone().normalize())
      }
    }

    pentagonCenters.forEach(center => {
      const patch = new THREE.Mesh(patchGeo, patchMat)
      patch.position.copy(center.multiplyScalar(1.01))
      patch.lookAt(center.clone().multiplyScalar(2))
      ballGroup.add(patch)
    })

    // Seam lines
    const edgesGeo = new THREE.EdgesGeometry(ballGeo)
    const edgesMat = new THREE.LineBasicMaterial({ color: 0x222222, linewidth: 1 })
    const edges = new THREE.LineSegments(edgesGeo, edgesMat)
    ballGroup.add(edges)

    scene.add(ballGroup)

    // Stadium lights / particles
    const particleCount = 200
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleSpeeds = []

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 10
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 5 - 2
      particleSpeeds.push({
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.005,
      })
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))

    const particleMat = new THREE.PointsMaterial({
      color: 0x22c55e,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
    scene.add(ambientLight)

    const spotLight1 = new THREE.SpotLight(0x22c55e, 2)
    spotLight1.position.set(5, 5, 5)
    scene.add(spotLight1)

    const spotLight2 = new THREE.SpotLight(0xffffff, 1.5)
    spotLight2.position.set(-5, 3, 2)
    scene.add(spotLight2)

    const rimLight = new THREE.PointLight(0xff6b00, 1)
    rimLight.position.set(0, -3, -3)
    scene.add(rimLight)

    // Mouse interaction
    let mouseX = 0
    let mouseY = 0
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // Animation
    let frame
    const animate = () => {
      frame = requestAnimationFrame(animate)

      ballGroup.rotation.y += 0.003
      ballGroup.rotation.x += 0.001

      // Mouse follow
      ballGroup.rotation.y += mouseX * 0.002
      ballGroup.rotation.x += mouseY * 0.001

      // Bob up and down
      ballGroup.position.y = Math.sin(Date.now() * 0.001) * 0.15

      // Animate particles
      const pos = particles.geometry.getAttribute('position')
      for (let i = 0; i < particleCount; i++) {
        pos.array[i * 3] += particleSpeeds[i].x
        pos.array[i * 3 + 1] += particleSpeeds[i].y
        if (Math.abs(pos.array[i * 3]) > 5) particleSpeeds[i].x *= -1
        if (Math.abs(pos.array[i * 3 + 1]) > 5) particleSpeeds[i].y *= -1
      }
      pos.needsUpdate = true

      renderer.render(scene, camera)
    }
    animate()

    // Resize
    const onResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="w-full h-full" />
}
