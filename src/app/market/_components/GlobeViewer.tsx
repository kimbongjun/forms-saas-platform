'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { X, ArrowUpRight } from 'lucide-react'

interface CountryData {
  id: string
  name: string
  nameKr: string
  continent: 'asia' | 'europe' | 'americas' | 'oceania' | 'middleeast'
  lat: number
  lng: number
  marketSize: string
  marketSizeUSD: number
  growth: string
  growthValue: number
  topDevices: string[]
  keyTrends: string[]
  regulations: string
  color: number
  colorHex: string
}

const COUNTRIES: CountryData[] = [
  { id: 'usa', name: 'United States', nameKr: '미국', continent: 'americas', lat: 37.09, lng: -95.71, marketSize: '$4.2B', marketSizeUSD: 4.2, growth: '+8.3%', growthValue: 8.3, topDevices: ['EMFACE PRO', 'CoolSculpting Elite', 'Ultherapy', 'PicoSure'], keyTrends: ['FDA SaMD 인허가 간소화', 'RF+EMS 복합기기 급성장', 'AI 피부진단 도입 증가'], regulations: 'FDA 510(k) / PMA', color: 0xff6b35, colorHex: '#ff6b35' },
  { id: 'korea', name: 'South Korea', nameKr: '한국', continent: 'asia', lat: 35.90, lng: 127.76, marketSize: '$1.8B', marketSizeUSD: 1.8, growth: '+14.2%', growthValue: 14.2, topDevices: ['VOLNEWMER', 'Shurink', 'Thermage FLX', 'PicoWay'], keyTrends: ['K-Beauty 글로벌 확산', '피부과 의사 KOL 급성장', 'HIFU 시술 대중화'], regulations: 'MFDS (식약처) 허가', color: 0x0084c9, colorHex: '#0084C9' },
  { id: 'china', name: 'China', nameKr: '중국', continent: 'asia', lat: 35.86, lng: 104.19, marketSize: '$3.1B', marketSizeUSD: 3.1, growth: '+18.7%', growthValue: 18.7, topDevices: ['HIFU Systems', 'RF Devices', 'Laser Platforms'], keyTrends: ['NMPA 규제 강화', '로컬 브랜드 급성장', '의료미용 SNS 규제'], regulations: 'NMPA 医疗器械注册', color: 0xe53e3e, colorHex: '#e53e3e' },
  { id: 'japan', name: 'Japan', nameKr: '일본', continent: 'asia', lat: 36.20, lng: 138.25, marketSize: '$2.4B', marketSizeUSD: 2.4, growth: '+6.1%', growthValue: 6.1, topDevices: ['Thermage', 'Ultherapy', 'PicoLaser', 'HIFU'], keyTrends: ['고령화 시장 안티에이징 수요', '의사 처방 기반 시장', '프리미엄 클리닉 성장'], regulations: 'PMDA 承認', color: 0xff6b6b, colorHex: '#FF6B6B' },
  { id: 'germany', name: 'Germany', nameKr: '독일', continent: 'europe', lat: 51.16, lng: 10.45, marketSize: '$1.4B', marketSizeUSD: 1.4, growth: '+5.8%', growthValue: 5.8, topDevices: ['EMFACE', 'Thermage', 'CoolSculpting', 'Fotona'], keyTrends: ['EU MDR 전환 완료', 'MEDICA 연계 전시', '공영보험 비적용 미용시술 성장'], regulations: 'EU MDR + CE 마크', color: 0x48bb78, colorHex: '#48BB78' },
  { id: 'uk', name: 'United Kingdom', nameKr: '영국', continent: 'europe', lat: 55.37, lng: -3.43, marketSize: '$0.9B', marketSizeUSD: 0.9, growth: '+7.4%', growthValue: 7.4, topDevices: ['HIFU Systems', 'RF Devices', 'BTX', 'Filler'], keyTrends: ['Post-Brexit 규제 개편', '프라이빗 클리닉 성장', 'Non-surgical 시술 급증'], regulations: 'UKCA 마크 (MHRA)', color: 0x4299e1, colorHex: '#4299E1' },
  { id: 'france', name: 'France', nameKr: '프랑스', continent: 'europe', lat: 46.22, lng: 2.21, marketSize: '$0.8B', marketSizeUSD: 0.8, growth: '+6.2%', growthValue: 6.2, topDevices: ['Botox', 'Fillers', 'HIFU', 'Laser'], keyTrends: ['AMWC Monaco 학회 주도', '유럽 미용 트렌드 선도', '비침습 시술 선호'], regulations: 'EU MDR + ANSM', color: 0x667eea, colorHex: '#667EEA' },
  { id: 'brazil', name: 'Brazil', nameKr: '브라질', continent: 'americas', lat: -14.23, lng: -51.92, marketSize: '$1.1B', marketSizeUSD: 1.1, growth: '+11.2%', growthValue: 11.2, topDevices: ['Body Contouring', 'Laser Systems', 'RF Devices'], keyTrends: ['성형·미용 선도 시장', 'SNS 기반 미용 문화', '비침습 시술 고성장'], regulations: 'ANVISA 등록', color: 0x38a169, colorHex: '#38A169' },
  { id: 'australia', name: 'Australia', nameKr: '호주', continent: 'oceania', lat: -25.27, lng: 133.77, marketSize: '$0.6B', marketSizeUSD: 0.6, growth: '+9.1%', growthValue: 9.1, topDevices: ['Ultherapy', 'HIFU', 'Laser'], keyTrends: ['TGA 규제 강화', '클리닉 체인 성장', '소비자 인식 향상'], regulations: 'TGA 등록', color: 0xed8936, colorHex: '#ED8936' },
  { id: 'uae', name: 'UAE', nameKr: '아랍에미리트', continent: 'middleeast', lat: 23.42, lng: 53.84, marketSize: '$0.7B', marketSizeUSD: 0.7, growth: '+16.3%', growthValue: 16.3, topDevices: ['Body Contouring', 'Skin Whitening', 'Anti-aging'], keyTrends: ['럭셔리 클리닉 성장', '의료관광 허브', '고소득층 수요 집중'], regulations: 'DHA / MOHAP 등록', color: 0xd69e2e, colorHex: '#D69E2E' },
  { id: 'thailand', name: 'Thailand', nameKr: '태국', continent: 'asia', lat: 15.87, lng: 100.99, marketSize: '$0.5B', marketSizeUSD: 0.5, growth: '+21.4%', growthValue: 21.4, topDevices: ['HIFU', 'RF Systems', 'Laser'], keyTrends: ['의료관광 허브', 'IMCAS Asia 개최지', '동남아 시장 거점'], regulations: 'Thai FDA 등록', color: 0x9f7aea, colorHex: '#9F7AEA' },
  { id: 'india', name: 'India', nameKr: '인도', continent: 'asia', lat: 20.59, lng: 78.96, marketSize: '$0.8B', marketSizeUSD: 0.8, growth: '+24.1%', growthValue: 24.1, topDevices: ['Laser Systems', 'RF Devices', 'HIFU'], keyTrends: ['중산층 미용 수요 폭발', '도시권 클리닉 급증', '저가-프리미엄 양극화'], regulations: 'CDSCO 등록', color: 0xf6ad55, colorHex: '#F6AD55' },
]

const CONTINENTS = [
  { key: 'all', label: '전체' },
  { key: 'asia', label: 'Asia' },
  { key: 'europe', label: 'Europe' },
  { key: 'americas', label: 'Americas' },
  { key: 'middleeast', label: 'Middle East' },
  { key: 'oceania', label: 'Oceania' },
]

const ARC_CONNECTIONS = [
  { from: 'usa', to: 'korea', strength: 0.9 },
  { from: 'korea', to: 'china', strength: 1.0 },
  { from: 'korea', to: 'japan', strength: 0.8 },
  { from: 'usa', to: 'germany', strength: 0.7 },
  { from: 'germany', to: 'uk', strength: 0.8 },
  { from: 'korea', to: 'thailand', strength: 0.7 },
  { from: 'usa', to: 'brazil', strength: 0.5 },
  { from: 'uae', to: 'india', strength: 0.6 },
  { from: 'japan', to: 'australia', strength: 0.5 },
  { from: 'china', to: 'uae', strength: 0.6 },
]

function latLngToVec3(lat: number, lng: number, r: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return [
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ]
}

interface InternalState {
  createMarkers: (countries: CountryData[]) => void
  buildArcs: (thickness: number) => void
}

export default function GlobeViewer() {
  const mountRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const autoRotateRef = useRef(true)
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const sliderTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const internalRef = useRef<InternalState | null>(null)
  const rotRef = useRef({ x: 0.2, y: 0 })
  const isDraggingRef = useRef(false)
  const prevMouseRef = useRef({ x: 0, y: 0 })

  const [activeContinent, setActiveContinent] = useState<string>('all')
  const [hoverCountry, setHoverCountry] = useState<CountryData | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null)
  const [arcSlider, setArcSlider] = useState(8)

  const visibleCountries = useMemo(
    () => activeContinent === 'all' ? COUNTRIES : COUNTRIES.filter(c => c.continent === activeContinent),
    [activeContinent]
  )

  const handleSliderChange = useCallback((value: number) => {
    setArcSlider(value)
    clearTimeout(sliderTimerRef.current)
    sliderTimerRef.current = setTimeout(() => {
      internalRef.current?.buildArcs(value * 0.001)
    }, 40)
  }, [])

  useEffect(() => {
    let mounted = true
    let THREE: typeof import('three')

    async function init() {
      THREE = await import('three')
      if (!mounted || !mountRef.current) return

      const mount = mountRef.current
      const W = mount.clientWidth
      const H = mount.clientHeight

      // Scene + Camera + Renderer
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100)
      camera.position.z = 5.5
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      mount.appendChild(renderer.domElement)

      // Globe group (everything rotates together)
      const globeGroup = new THREE.Group()
      scene.add(globeGroup)

      // ── Canvas texture: continent shapes (equirectangular) ──────────
      function createEarthTexture() {
        const TW = 2048, TH = 1024
        const cvs = document.createElement('canvas')
        cvs.width = TW; cvs.height = TH
        const c = cvs.getContext('2d')!

        // Equirectangular projection helper
        const px = (lat: number, lng: number): [number, number] => [
          (lng + 180) / 360 * TW,
          (90 - lat) / 180 * TH,
        ]

        // Ocean fill
        c.fillStyle = '#06111e'
        c.fillRect(0, 0, TW, TH)

        // Faint grid lines (lat/lng every 30°)
        c.strokeStyle = '#0c1d35'
        c.lineWidth = 1
        for (let lat = -60; lat <= 60; lat += 30) {
          const y = (90 - lat) / 180 * TH
          c.beginPath(); c.moveTo(0, y); c.lineTo(TW, y); c.stroke()
        }
        for (let lng = -150; lng <= 150; lng += 30) {
          const x = (lng + 180) / 360 * TW
          c.beginPath(); c.moveTo(x, 0); c.lineTo(x, TH); c.stroke()
        }

        // Equator dashed highlight
        c.strokeStyle = '#162a45'
        c.lineWidth = 1.5
        c.setLineDash([10, 8])
        c.beginPath(); c.moveTo(0, TH / 2); c.lineTo(TW, TH / 2); c.stroke()
        c.setLineDash([])

        // Draw land polygon
        function land(pts: [number, number][], fill = '#152d4a', stroke = '#2a6aaa') {
          c.beginPath()
          const [x0, y0] = px(pts[0][0], pts[0][1])
          c.moveTo(x0, y0)
          for (let i = 1; i < pts.length; i++) {
            const [x, y] = px(pts[i][0], pts[i][1]); c.lineTo(x, y)
          }
          c.closePath()
          c.fillStyle = fill; c.fill()
          c.strokeStyle = stroke; c.lineWidth = 2.5; c.stroke()
        }

        // ── North America ──
        land([[72,-80],[70,-50],[63,-64],[47,-53],[45,-66],[35,-75],[24,-80],
              [10,-77],[10,-78],[15,-83],[22,-87],[24,-90],[16,-91],[17,-88],
              [23,-83],[30,-87],[29,-90],[27,-97],[19,-95],[15,-87],[22,-80],
              [27,-80],[30,-88],[40,-73],[57,-132],[63,-140],[72,-80]])
        // Greenland
        land([[84,-50],[77,-18],[72,-23],[76,-57],[84,-50]])
        // Cuba + Caribbean (rough)
        land([[23,-84],[22,-80],[20,-75],[20,-73],[22,-73],[23,-82],[23,-84]])

        // ── South America ──
        land([[12,-72],[10,-60],[7,-52],[0,-50],[-5,-36],[-10,-38],
              [-23,-43],[-35,-57],[-56,-68],[-42,-65],[-33,-52],
              [-22,-43],[-5,-35],[5,-52],[12,-72]])

        // ── Eurasia (Europe + Asia combined) ──
        land([[71,-9],[60,22],[53,9],[48,-5],[36,-9],[36,4],[44,28],
              [37,37],[22,37],[14,44],[1,42],[8,77],[0,80],[8,77],
              [22,57],[22,70],[1,103],[10,105],[22,114],[35,130],
              [43,141],[60,140],[72,130],[78,105],[76,70],[71,30],[71,-9]])
        // British Isles (rough)
        land([[60,-3],[58,-5],[55,-3],[51,0],[52,1],[55,0],[57,0],[60,-3]])
        // Japan (rough)
        land([[42,142],[40,141],[36,136],[34,131],[34,130],[38,141],[43,145],[42,142]])
        // Sri Lanka
        land([[10,80],[7,80],[7,81],[10,81],[10,80]])

        // ── Africa ──
        land([[37,-5],[38,37],[22,37],[12,43],[0,42],[-2,40],
              [-12,37],[-25,32],[-35,19],[-35,-18],[-15,-12],
              [5,-8],[15,-17],[28,-14],[37,-5]])
        // Madagascar
        land([[-13,50],[-16,50],[-25,44],[-25,48],[-13,50]])

        // ── Australia + New Zealand ──
        land([[-12,130],[-14,136],[-20,148],[-29,154],[-38,147],
              [-40,149],[-38,140],[-35,136],[-38,130],[-35,117],
              [-22,115],[-14,120],[-12,130]])
        // New Zealand (N island rough)
        land([[-37,175],[-41,174],[-38,176],[-37,175]])
        // New Zealand (S island rough)
        land([[-42,171],[-46,168],[-44,172],[-42,174],[-42,171]])

        // ── Antarctica ──
        land([[-70,-180],[-68,-120],[-70,-60],[-68,0],[-70,60],
              [-68,120],[-70,180],[-90,180],[-90,-180],[-70,-180]],
          '#0d2234', '#1a4060')

        return new THREE.CanvasTexture(cvs)
      }

      // Earth sphere — MeshPhongMaterial + DirectionalLight + AmbientLight
      const earthGeo = new THREE.SphereGeometry(2, 64, 64)
      const earthMat = new THREE.MeshPhongMaterial({
        map: createEarthTexture(),
        specular: 0x225588,
        shininess: 12,
      })
      globeGroup.add(new THREE.Mesh(earthGeo, earthMat))

      // Outer atmosphere glow
      const atmosGeo = new THREE.SphereGeometry(2.08, 64, 64)
      const atmosMat = new THREE.MeshPhongMaterial({
        color: 0x2255dd,
        transparent: true,
        opacity: 0.07,
        side: THREE.BackSide,
      })
      globeGroup.add(new THREE.Mesh(atmosGeo, atmosMat))

      // Lights — DirectionalLight + AmbientLight (brighter to show texture)
      const ambientLight = new THREE.AmbientLight(0x556688, 1.4)
      scene.add(ambientLight)
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.6)
      directionalLight.position.set(5, 3, 5)
      scene.add(directionalLight)
      const fillLight = new THREE.DirectionalLight(0x2244aa, 0.5)
      fillLight.position.set(-5, -2, -5)
      scene.add(fillLight)

      // Markers group
      const markersGroup = new THREE.Group()
      globeGroup.add(markersGroup)
      const markerMeshes: InstanceType<(typeof THREE)['Mesh']>[] = []

      function createMarkers(countries: CountryData[]) {
        while (markersGroup.children.length > 0) markersGroup.remove(markersGroup.children[0])
        markerMeshes.length = 0

        countries.forEach((country) => {
          const [x, y, z] = latLngToVec3(country.lat, country.lng, 2.03)

          // Outer pulse ring
          const ringGeo = new THREE.SphereGeometry(0.072, 16, 16)
          const ringMat = new THREE.MeshPhongMaterial({
            color: country.color,
            transparent: true,
            opacity: 0.25,
            emissive: country.color,
            emissiveIntensity: 0.3,
          })
          const ring = new THREE.Mesh(ringGeo, ringMat)
          ring.position.set(x, y, z)
          markersGroup.add(ring)

          // Core dot
          const dotGeo = new THREE.SphereGeometry(0.044, 16, 16)
          const dotMat = new THREE.MeshPhongMaterial({
            color: country.color,
            emissive: country.color,
            emissiveIntensity: 0.85,
          })
          const dot = new THREE.Mesh(dotGeo, dotMat)
          dot.position.set(x, y, z)
          dot.userData = { country }
          markersGroup.add(dot)
          markerMeshes.push(dot)
        })
      }

      createMarkers(COUNTRIES)

      // Arcs group (TubeGeometry with debounced rebuild)
      const arcsGroup = new THREE.Group()
      globeGroup.add(arcsGroup)

      function buildArcs(thickness: number) {
        while (arcsGroup.children.length > 0) arcsGroup.remove(arcsGroup.children[0])
        ARC_CONNECTIONS.forEach(({ from, to, strength }) => {
          const fC = COUNTRIES.find(c => c.id === from)
          const tC = COUNTRIES.find(c => c.id === to)
          if (!fC || !tC) return
          const [fx, fy, fz] = latLngToVec3(fC.lat, fC.lng, 2.03)
          const [tx, ty, tz] = latLngToVec3(tC.lat, tC.lng, 2.03)
          const fVec = new THREE.Vector3(fx, fy, fz)
          const tVec = new THREE.Vector3(tx, ty, tz)
          const mid = fVec.clone().add(tVec).normalize().multiplyScalar(2.8)
          const curve = new THREE.QuadraticBezierCurve3(fVec, mid, tVec)
          const tubeGeo = new THREE.TubeGeometry(curve, 40, thickness * strength, 6, false)
          const tubeMat = new THREE.MeshBasicMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.35 * strength,
          })
          arcsGroup.add(new THREE.Mesh(tubeGeo, tubeMat))
        })
      }

      buildArcs(0.008)

      // Expose internal functions via ref
      internalRef.current = { createMarkers, buildArcs }

      // Raycaster for hover/click
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()

      const canvas = renderer.domElement
      canvas.style.cursor = 'grab'

      function onMouseDown(e: MouseEvent) {
        isDraggingRef.current = true
        prevMouseRef.current = { x: e.clientX, y: e.clientY }
        autoRotateRef.current = false
        clearTimeout(autoTimerRef.current)
        canvas.style.cursor = 'grabbing'
      }

      function onMouseMove(e: MouseEvent) {
        const rect = canvas.getBoundingClientRect()
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

        if (isDraggingRef.current) {
          const dx = e.clientX - prevMouseRef.current.x
          const dy = e.clientY - prevMouseRef.current.y
          rotRef.current.y += dx * 0.005
          rotRef.current.x += dy * 0.005
          rotRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotRef.current.x))
          prevMouseRef.current = { x: e.clientX, y: e.clientY }
          return
        }

        raycaster.setFromCamera(mouse, camera)
        const hits = raycaster.intersectObjects(markerMeshes)
        if (hits.length > 0) {
          const c = hits[0].object.userData.country as CountryData
          setHoverCountry(c)
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
          canvas.style.cursor = 'pointer'
        } else {
          setHoverCountry(null)
          canvas.style.cursor = 'grab'
        }
      }

      function onMouseUp() {
        isDraggingRef.current = false
        canvas.style.cursor = 'grab'
        autoTimerRef.current = setTimeout(() => { autoRotateRef.current = true }, 3000)
      }

      function onClick(e: MouseEvent) {
        if (isDraggingRef.current) return
        const rect = canvas.getBoundingClientRect()
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(mouse, camera)
        const hits = raycaster.intersectObjects(markerMeshes)
        if (hits.length > 0) {
          setSelectedCountry(hits[0].object.userData.country as CountryData)
        }
      }

      function onWheel(e: WheelEvent) {
        e.preventDefault()
        camera.position.z = Math.max(3, Math.min(8.5, camera.position.z + e.deltaY * 0.008))
      }

      function onMouseLeave() {
        isDraggingRef.current = false
        setHoverCountry(null)
        canvas.style.cursor = 'grab'
      }

      // Touch support
      function onTouchStart(e: TouchEvent) {
        prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        autoRotateRef.current = false
        clearTimeout(autoTimerRef.current)
      }
      function onTouchMove(e: TouchEvent) {
        e.preventDefault()
        const dx = e.touches[0].clientX - prevMouseRef.current.x
        const dy = e.touches[0].clientY - prevMouseRef.current.y
        rotRef.current.y += dx * 0.005
        rotRef.current.x += dy * 0.005
        rotRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotRef.current.x))
        prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
      function onTouchEnd() {
        autoTimerRef.current = setTimeout(() => { autoRotateRef.current = true }, 3000)
      }

      canvas.addEventListener('mousedown', onMouseDown)
      canvas.addEventListener('mousemove', onMouseMove)
      canvas.addEventListener('mouseup', onMouseUp)
      canvas.addEventListener('click', onClick)
      canvas.addEventListener('mouseleave', onMouseLeave)
      canvas.addEventListener('wheel', onWheel, { passive: false })
      canvas.addEventListener('touchstart', onTouchStart, { passive: true })
      canvas.addEventListener('touchmove', onTouchMove, { passive: false })
      canvas.addEventListener('touchend', onTouchEnd, { passive: true })

      // Resize
      const ro = new ResizeObserver(() => {
        const w = mount.clientWidth
        const h = mount.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      })
      ro.observe(mount)

      // Animation loop
      function animate() {
        if (!mounted) return
        rafRef.current = requestAnimationFrame(animate)
        if (autoRotateRef.current) rotRef.current.y += 0.002
        globeGroup.rotation.y = rotRef.current.y
        globeGroup.rotation.x = rotRef.current.x
        renderer.render(scene, camera)
      }
      animate()

      return () => {
        ro.disconnect()
        canvas.removeEventListener('mousedown', onMouseDown)
        canvas.removeEventListener('mousemove', onMouseMove)
        canvas.removeEventListener('mouseup', onMouseUp)
        canvas.removeEventListener('click', onClick)
        canvas.removeEventListener('mouseleave', onMouseLeave)
        canvas.removeEventListener('wheel', onWheel)
        canvas.removeEventListener('touchstart', onTouchStart)
        canvas.removeEventListener('touchmove', onTouchMove)
        canvas.removeEventListener('touchend', onTouchEnd)
        renderer.dispose()
        renderer.domElement.remove()
      }
    }

    let cleanup: (() => void) | undefined
    init().then((fn) => { cleanup = fn })

    return () => {
      mounted = false
      cancelAnimationFrame(rafRef.current)
      clearTimeout(autoTimerRef.current)
      clearTimeout(sliderTimerRef.current)
      internalRef.current = null
      cleanup?.()
    }
  }, [])

  // Update markers when continent filter changes
  useEffect(() => {
    internalRef.current?.createMarkers(visibleCountries)
  }, [visibleCountries])

  const filteredCount = activeContinent === 'all' ? COUNTRIES.length : visibleCountries.length

  return (
    <div className="flex flex-col" style={{ minHeight: 540 }}>
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-gray-800 bg-slate-900/50">
        {CONTINENTS.map((c) => {
          const cnt = c.key === 'all' ? COUNTRIES.length : COUNTRIES.filter(cc => cc.continent === c.key).length
          return (
            <button
              key={c.key}
              onClick={() => setActiveContinent(c.key)}
              className={[
                'rounded-xl px-3 py-1.5 text-xs font-medium transition-all border',
                activeContinent === c.key
                  ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'border-gray-700 bg-slate-800 text-gray-400 hover:border-gray-500 hover:text-gray-200',
              ].join(' ')}
            >
              {c.label}
              <span className="ml-1.5 opacity-60">({cnt})</span>
            </button>
          )
        })}

        <div className="ml-auto flex items-center gap-2.5 text-xs text-gray-400">
          <span className="text-gray-500">연결선 두께</span>
          <input
            type="range"
            min={2}
            max={20}
            value={arcSlider}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-24 h-1 rounded accent-blue-500 cursor-pointer"
          />
          <span className="w-4 text-gray-500">{arcSlider}</span>
        </div>
      </div>

      {/* Globe canvas area */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 30% 40%, #0a1a3e 0%, #020c1e 60%, #000510 100%)',
          minHeight: 460,
        }}
      >
        <div ref={mountRef} className="absolute inset-0" />

        {/* Hover tooltip */}
        {hoverCountry && (
          <div
            className="pointer-events-none absolute z-20 rounded-xl border border-blue-800/60 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-sm"
            style={{
              left: tooltipPos.x + 14,
              top: tooltipPos.y - 12,
              transform: tooltipPos.x > 380 ? 'translateX(-110%)' : undefined,
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-2.5 w-2.5 rounded-full shadow-lg" style={{ background: hoverCountry.colorHex, boxShadow: `0 0 6px ${hoverCountry.colorHex}` }} />
              <span className="text-sm font-bold text-white">{hoverCountry.nameKr}</span>
              <span className="text-xs text-gray-400">{hoverCountry.name}</span>
            </div>
            <div className="flex gap-4 text-xs">
              <div>
                <span className="text-gray-500">시장 규모</span>
                <span className="ml-1.5 font-semibold text-blue-300">{hoverCountry.marketSize}</span>
              </div>
              <div>
                <span className="text-gray-500">성장률</span>
                <span className="ml-1.5 font-semibold text-emerald-300">{hoverCountry.growth}</span>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="pointer-events-none absolute right-4 top-4 space-y-1.5">
          {visibleCountries.slice(0, 6).map((c) => (
            <div key={c.id} className="flex items-center gap-1.5 text-xs">
              <div className="h-2 w-2 rounded-full shadow-sm" style={{ background: c.colorHex, boxShadow: `0 0 4px ${c.colorHex}` }} />
              <span className="text-gray-400">{c.nameKr}</span>
              <span className="text-gray-600 ml-auto">{c.marketSize}</span>
            </div>
          ))}
          {visibleCountries.length > 6 && (
            <p className="text-[10px] text-gray-600">+{visibleCountries.length - 6}개국</p>
          )}
        </div>

        {/* Interaction hint */}
        <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-slate-500">
          드래그 회전 · 스크롤 줌 · 마커 클릭 상세보기
        </p>
      </div>

      {/* Country summary bar */}
      <div className="flex items-center gap-3 overflow-x-auto bg-slate-900 px-4 py-2.5 border-t border-gray-800">
        {visibleCountries.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCountry(c)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-slate-800"
          >
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: c.colorHex }} />
            <span className="text-gray-300">{c.nameKr}</span>
            <span className="text-emerald-400 font-medium">{c.growth}</span>
          </button>
        ))}
      </div>

      {/* Country Detail Modal */}
      {selectedCountry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedCountry(null) }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg"
                  style={{ background: selectedCountry.colorHex }}
                >
                  {selectedCountry.nameKr.slice(0, 1)}
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#2C3E50' }}>{selectedCountry.nameKr}</h2>
                  <p className="text-sm text-gray-400">{selectedCountry.name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCountry(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl p-3 text-center" style={{ background: `${selectedCountry.colorHex}18` }}>
                  <p className="text-xl font-bold" style={{ color: selectedCountry.colorHex }}>{selectedCountry.marketSize}</p>
                  <p className="mt-0.5 text-xs text-gray-500">시장 규모</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 text-center">
                  <p className="text-xl font-bold text-emerald-600">{selectedCountry.growth}</p>
                  <p className="mt-0.5 text-xs text-gray-500">YoY 성장률</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold text-gray-700 leading-snug">{selectedCountry.regulations}</p>
                  <p className="mt-0.5 text-xs text-gray-400">규제 기관</p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold text-gray-500">주요 기기·브랜드</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCountry.topDevices.map((d) => (
                    <span key={d} className="rounded-lg px-2.5 py-1 text-xs font-medium" style={{ background: `${selectedCountry.colorHex}18`, color: selectedCountry.colorHex }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold text-gray-500">핵심 트렌드</h3>
                <ul className="space-y-1.5">
                  {selectedCountry.keyTrends.map((trend, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {trend}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
