'use client';

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroBG() {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const requestRef = useRef<number | null>(null);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		// Store window reference to avoid TypeScript narrowing issues
		const win = typeof window !== "undefined" ? window : null;
		const scene = new THREE.Scene();

		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			powerPreference: "high-performance",
		});
		rendererRef.current = renderer;
		renderer.setPixelRatio(win?.devicePixelRatio ?? 1);
		container.appendChild(renderer.domElement);

		const geometry = new THREE.PlaneGeometry(2, 2);
		const uniforms = {
			uTime: { value: 0 },
			uResolution: { value: new THREE.Vector2(1, 1) },
			// Base near-black charcoal color #050406 in linear space
			uBase: { value: new THREE.Color(0x050406) },
		};

		const fragmentShader = `
			precision highp float;
			uniform float uTime;
			uniform vec2 uResolution;
			uniform vec3 uBase;

			// Smooth noise based on iq (simplified)
			float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
			float noise(in vec2 p){
				vec2 i = floor(p);
				vec2 f = fract(p);
				float a = hash(i);
				float b = hash(i + vec2(1.0, 0.0));
				float c = hash(i + vec2(0.0, 1.0));
				float d = hash(i + vec2(1.0, 1.0));
				vec2 u = f * f * (3.0 - 2.0 * f);
				return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
			}

			void main(){
				vec2 uv = gl_FragCoord.xy / uResolution.xy;
				uv.x *= uResolution.x / uResolution.y;

				// Layered waves with higher frequency for sharper detail
				float t = uTime * 0.08;
				float n1 = noise(uv * 4.0 + vec2(t, 0.0));
				float n2 = noise(uv * 6.5 + vec2(-t * 0.6, t * 0.4));
				float n3 = noise(uv * 3.0 + vec2(t * 0.2, -t * 0.3));

				float vignette = smoothstep(1.2, 0.4, distance(uv, vec2(0.5, 0.5)));

				// Maximum contrast for highlights rendered above the base
				float shade = (n1 * 0.5 + n2 * 0.45 + n3 * 0.4) * vignette;

				// Normalize shade to -1 to 1 range for better contrast
				shade = (shade - 0.5) * 2.0;

				// Only allow positive values to brighten above the base colour
				float highlight = max(shade, 0.0);

				vec3 base = uBase;
				vec3 highlightColour = vec3(0.42, 0.39, 0.52);

				// Blend the highlight colour on top while keeping the dark base visible underneath
				vec3 col = clamp(base + highlightColour * highlight, 0.0, 1.0);
				gl_FragColor = vec4(col, 1.0);
			}
		`;

		const material = new THREE.ShaderMaterial({
			uniforms,
			vertexShader: `void main(){ gl_Position = vec4(position, 1.0); }`,
			fragmentShader,
		});

		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		const setSize = () => {
			if (!container) return;
			const rect = container.getBoundingClientRect();
			const width = Math.max(1, Math.floor(rect.width));
			const height = Math.max(1, Math.floor(rect.height));
			renderer.setSize(width, height, false);
			material.uniforms.uResolution.value.set(width, height);
		};

		// Ensure size after layout
		requestAnimationFrame(setSize);

		// Observe container size changes
		if (win) {
			if ("ResizeObserver" in win) {
				const ro = new ResizeObserver(() => setSize());
				ro.observe(container);
				resizeObserverRef.current = ro;
			} else {
				// Fallback to window resize
				(win as Window).addEventListener("resize", setSize);
			}
		}

		const start = performance.now();
		const animate = () => {
			const now = performance.now();
			material.uniforms.uTime.value = (now - start) * 0.001;
			renderer.render(scene, camera);
			requestRef.current = requestAnimationFrame(animate);
		};
		animate();

		return () => {
			if (requestRef.current) cancelAnimationFrame(requestRef.current);
			if (resizeObserverRef.current) {
				resizeObserverRef.current.disconnect();
			} else if (win) {
				(win as Window).removeEventListener("resize", setSize);
			}
			if (rendererRef.current) {
				rendererRef.current.dispose();
				if (rendererRef.current.domElement.parentNode) {
					rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
				}
			}
			geometry.dispose();
			material.dispose();
		};
	}, []);

	return <div ref={containerRef} className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />;
}


