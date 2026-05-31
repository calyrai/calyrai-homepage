from __future__ import annotations

import html
import json
import re
from typing import Any

from .content import as_dict, as_list_of_dict


def _build_grid_hover_script(grid_cfg: dict[str, Any] | None = None) -> str:
	config_json = json.dumps(grid_cfg or {}, ensure_ascii=True)
	return """<script>
(() => {
	const grid = document.querySelector('.layout-grid');
	if (!grid) return;
	const CFG = """ + config_json + """;
	const cfgNum = (key, fallback) => {
		const value = Number(CFG[key]);
		return Number.isFinite(value) ? value : fallback;
	};
	const cfgStr = (key, fallback) => {
		const value = CFG[key];
		return typeof value === 'string' && value.length ? value : fallback;
	};

	const ensureDots = () => {
		let dots = Array.from(grid.querySelectorAll('circle'));
		if (dots.length) return dots;

		const spacing = cfgNum('grid_spacing_px', 30);
		const majorStep = Math.max(1, Math.floor(cfgNum('grid_major_step', 4)));
		const width = window.innerWidth;
		const height = window.innerHeight;
		grid.setAttribute('viewBox', `0 0 ${width} ${height}`);
		grid.setAttribute('preserveAspectRatio', 'none');
		grid.querySelectorAll('.grid-labels').forEach((node) => node.remove());

		const frag = document.createDocumentFragment();
		const labelsLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		labelsLayer.setAttribute('class', 'grid-labels');
		labelsLayer.setAttribute('fill', cfgStr('label_color', '#24f3ff'));
		labelsLayer.setAttribute('opacity', '1');
		labelsLayer.setAttribute('font-size', String(cfgNum('label_font_px', 6)));
		labelsLayer.setAttribute('font-family', 'system-ui, -apple-system, Segoe UI, sans-serif');
		labelsLayer.setAttribute('font-weight', '500');

		const toAlpha = (index) => {
			let value = index + 1;
			let out = '';
			while (value > 0) {
				const rem = (value - 1) % 26;
				out = String.fromCharCode(65 + rem) + out;
				value = Math.floor((value - 1) / 26);
			}
			return out;
		};
		let row = 0;
		for (let y = spacing * 0.5; y < height; y += spacing, row += 1) {
			let col = 0;
			for (let x = spacing * 0.5; x < width; x += spacing, col += 1) {
				const major = row % majorStep === 0 && col % majorStep === 0;
				const pt = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				pt.setAttribute('cx', String(x));
				pt.setAttribute('cy', String(y));
				pt.setAttribute('data-major', major ? '1' : '0');
				frag.appendChild(pt);
				if (major) {
					const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
					const majorCol = Math.floor(col / majorStep);
					const majorRow = Math.floor(row / majorStep) + 1;
					label.textContent = `${toAlpha(majorCol)}${majorRow}`;
					label.setAttribute('x', String(x + 5));
					label.setAttribute('y', String(y - 5));
					label.setAttribute('data-cx', String(x));
					label.setAttribute('data-cy', String(y));
					label.setAttribute('data-major-label', '1');
					label.setAttribute('style', 'paint-order:stroke;stroke:rgba(1,10,32,0.75);stroke-width:0.8;opacity:0;transition:opacity 120ms linear;');
					labelsLayer.appendChild(label);
				}
			}
		}
		grid.appendChild(frag);
		grid.appendChild(labelsLayer);
		return Array.from(grid.querySelectorAll('circle'));
	};

	const BASE_R_MAJOR = cfgNum('grid_base_r_major', 1.25);
	const BASE_R_MINOR = cfgNum('grid_base_r_minor', 0.42);
	const MAX_R_MAJOR = cfgNum('grid_max_r_major', 6.2);
	const MAX_R_MINOR = cfgNum('grid_max_r_minor', 1.9);
	const HOVER_R = cfgNum('grid_hover_radius_px', 88);
	const BASE_OP_MAJOR = cfgNum('grid_base_op_major', 0.62);
	const BASE_OP_MINOR = cfgNum('grid_base_op_minor', 0.16);
	const MAX_OP_MAJOR = cfgNum('grid_max_op_major', 0.96);
	const MAX_OP_MINOR = cfgNum('grid_max_op_minor', 0.34);
	const LABEL_HOVER_R = cfgNum('label_hover_radius_px', 22);
	const LABEL_REVEAL_MS = cfgNum('label_reveal_ms', 2000);
	const LABEL_VISIBLE_OPACITY = cfgNum('label_visible_opacity', 0.72);
	const LABEL_MODE = cfgStr('label_mode', 'hover').toLowerCase();
	const RING_DURATION_MS = cfgNum('ring_duration_ms', 2600);
	const RING_STROKE = cfgNum('ring_stroke_px', 1.4);
	const ACUTE_FALL_MS = cfgNum('acute_fall_ms', 980);
	const MAJOR_CLICK_SNAP_PX = cfgNum('major_click_snap_px', 14);
	const ACUTE_GLOW = cfgStr('acute_glow', 'drop-shadow(0 0 8px rgba(255,255,255,0.95)) drop-shadow(0 0 16px rgba(255,255,255,0.8)) drop-shadow(0 0 28px rgba(255,255,255,0.5))');

	let dots = ensureDots().map((pt) => {
		const major = pt.getAttribute('data-major') === '1';
		pt.setAttribute('fill', '#ffffff');
		pt.setAttribute('r', String(major ? BASE_R_MAJOR : BASE_R_MINOR));
		pt.setAttribute('opacity', String(major ? BASE_OP_MAJOR : BASE_OP_MINOR));
		pt.setAttribute('style', major
			? 'filter:drop-shadow(0 0 1.2px rgba(255,255,255,0.95)) drop-shadow(0 0 4px rgba(255,255,255,0.58));'
			: 'filter:drop-shadow(0 0 0.8px rgba(255,255,255,0.48));');
		return {
			pt,
			major,
			cx: parseFloat(pt.getAttribute('cx') || '0'),
			cy: parseFloat(pt.getAttribute('cy') || '0')
		};
	});

	let labels = Array.from(grid.querySelectorAll('.grid-labels text')).map((node) => ({
		node,
		cx: parseFloat(node.getAttribute('data-cx') || '0'),
		cy: parseFloat(node.getAttribute('data-cy') || '0'),
		hoverSince: null,
	}));
	const dotByNode = new Map(dots.map((d) => [d.pt, d]));
	const activeAcuteDots = new Set();
	let waves = [];

	const ensureFxLayers = () => {
		let ringsLayer = grid.querySelector('.grid-rings');
		if (!ringsLayer) {
			ringsLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			ringsLayer.setAttribute('class', 'grid-rings');
			ringsLayer.setAttribute('fill', 'none');
			grid.appendChild(ringsLayer);
		}
		let acutesLayer = grid.querySelector('.grid-acutes');
		if (!acutesLayer) {
			acutesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			acutesLayer.setAttribute('class', 'grid-acutes');
			grid.appendChild(acutesLayer);
		}
		return { ringsLayer, acutesLayer };
	};

	const spawnRingWave = (x, y) => {
		const { ringsLayer } = ensureFxLayers();
		const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		ring.setAttribute('cx', String(x));
		ring.setAttribute('cy', String(y));
		ring.setAttribute('r', '2');
		ring.setAttribute('stroke', 'rgba(255, 255, 255, 0.9)');
		ring.setAttribute('stroke-width', String(RING_STROKE));
		ring.setAttribute('opacity', '0.85');
		ringsLayer.appendChild(ring);
		waves.push({
			node: ring,
			start: performance.now(),
			duration: RING_DURATION_MS,
			maxR: Math.hypot(window.innerWidth, window.innerHeight) * 0.58,
		});
		requestRender();
	};

	const transformMajorDotToAcute = (dot) => {
		if (!dot || !dot.major) return;
		if (activeAcuteDots.has(dot.pt)) return;
		activeAcuteDots.add(dot.pt);
		dot.pt.setAttribute('r', '0.01');
		dot.pt.setAttribute('opacity', '0');
		dot.pt.setAttribute('fill', 'transparent');
		dot.pt.style.pointerEvents = 'none';

		const { acutesLayer } = ensureFxLayers();
		const acute = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		acute.textContent = '\\u00B4';
		acute.setAttribute('x', String(dot.cx));
		acute.setAttribute('y', String(dot.cy));
		acute.setAttribute('text-anchor', 'middle');
		acute.setAttribute('dominant-baseline', 'central');
		acute.setAttribute('fill', '#ffffff');
		acute.setAttribute('font-size', '26');
		acute.setAttribute('font-family', 'Avenir Next, Segoe UI, sans-serif');
		acute.setAttribute('font-weight', '700');
		acute.setAttribute('style', `filter:${ACUTE_GLOW};pointer-events:none;`);
		acutesLayer.appendChild(acute);
		acute.animate(
			[
				{ transform: 'translate(0, -14px) scale(1.06)', opacity: 0 },
				{ transform: 'translate(0, 0px) scale(1)', opacity: 1, offset: 0.38 },
				{ transform: 'translate(0, 8px) scale(0.74)', opacity: 0 },
			],
			{
				duration: ACUTE_FALL_MS,
				easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
			}
		);

		spawnRingWave(dot.cx, dot.cy);

		window.setTimeout(() => {
			acute.remove();
			dot.pt.style.display = '';
			dot.pt.setAttribute('fill', '#ffffff');
			dot.pt.setAttribute('opacity', String(BASE_OP_MAJOR));
			dot.pt.style.pointerEvents = '';
			activeAcuteDots.delete(dot.pt);
			requestRender();
		}, ACUTE_FALL_MS + 24);
	};

	let mouseX = -1e9;
	let mouseY = -1e9;
	let ticking = false;

	function render() {
		ticking = false;
		const now = performance.now();
		let needsFollowUp = false;
		for (const d of dots) {
			if (activeAcuteDots.has(d.pt)) continue;
			const dx = mouseX - d.cx;
			const dy = mouseY - d.cy;
			const dist = Math.hypot(dx, dy);
			const t = Math.max(0, 1 - dist / HOVER_R);
			const baseR = d.major ? BASE_R_MAJOR : BASE_R_MINOR;
			const maxR = d.major ? MAX_R_MAJOR : MAX_R_MINOR;
			const baseOp = d.major ? BASE_OP_MAJOR : BASE_OP_MINOR;
			const maxOp = d.major ? MAX_OP_MAJOR : MAX_OP_MINOR;
			const r = baseR + (maxR - baseR) * t;
			const op = baseOp + (maxOp - baseOp) * t;
			d.pt.setAttribute('r', r.toFixed(2));
			d.pt.setAttribute('opacity', op.toFixed(3));
		}

		for (const label of labels) {
			if (LABEL_MODE === 'always') {
				label.node.style.opacity = String(LABEL_VISIBLE_OPACITY);
				label.hoverSince = null;
				continue;
			}
			const dx = mouseX - label.cx;
			const dy = mouseY - label.cy;
			const dist = Math.hypot(dx, dy);
			if (dist <= LABEL_HOVER_R) {
				if (label.hoverSince === null) label.hoverSince = now;
				const visible = now - label.hoverSince >= LABEL_REVEAL_MS;
				label.node.style.opacity = visible ? String(LABEL_VISIBLE_OPACITY) : '0';
				if (!visible) needsFollowUp = true;
			} else {
				label.hoverSince = null;
				label.node.style.opacity = '0';
			}
		}

		if (waves.length) {
			const nextWaves = [];
			for (const wave of waves) {
				const t = (now - wave.start) / wave.duration;
				if (t >= 1) {
					wave.node.remove();
					continue;
				}
				const radius = 2 + wave.maxR * t;
				const opacity = Math.max(0, (1 - t) * 0.82);
				const strokeW = Math.max(0.45, RING_STROKE * (1 - 0.55 * t));
				wave.node.setAttribute('r', radius.toFixed(2));
				wave.node.setAttribute('opacity', opacity.toFixed(3));
				wave.node.setAttribute('stroke-width', strokeW.toFixed(2));
				nextWaves.push(wave);
			}
			waves = nextWaves;
			if (waves.length) needsFollowUp = true;
		}

		if (needsFollowUp) requestRender();
	}

	function requestRender() {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(render);
	}

	window.addEventListener('pointermove', (e) => {
		mouseX = e.clientX;
		mouseY = e.clientY;
		requestRender();
	}, { passive: true });

	window.addEventListener('pointerleave', () => {
		mouseX = -1e9;
		mouseY = -1e9;
		requestRender();
	});

	grid.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof SVGCircleElement)) return;
		if (target.getAttribute('data-major') !== '1') return;
		transformMajorDotToAcute(dotByNode.get(target));
	});

	document.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		if (target.closest('a, button, input, textarea, select, .study-trigger, .corner-menu-toggle, .corner-menu-link')) return;

		let best = null;
		let bestDist = MAJOR_CLICK_SNAP_PX;
		for (const dot of dots) {
			if (!dot.major) continue;
			if (activeAcuteDots.has(dot.pt)) continue;
			const dx = event.clientX - dot.cx;
			const dy = event.clientY - dot.cy;
			const dist = Math.hypot(dx, dy);
			if (dist < bestDist) {
				bestDist = dist;
				best = dot;
			}
		}
		if (!best) return;
		transformMajorDotToAcute(best);
	});

	window.addEventListener('resize', () => {
		grid.querySelectorAll('circle').forEach((node) => node.remove());
		grid.querySelectorAll('.grid-labels, .grid-rings, .grid-acutes').forEach((node) => node.remove());
		dots = ensureDots().map((pt) => ({
			pt,
			major: pt.getAttribute('data-major') === '1',
			cx: parseFloat(pt.getAttribute('cx') || '0'),
			cy: parseFloat(pt.getAttribute('cy') || '0')
		}));
		dotByNode.clear();
		for (const d of dots) dotByNode.set(d.pt, d);
		activeAcuteDots.clear();
		waves = [];
		labels = Array.from(grid.querySelectorAll('.grid-labels text')).map((node) => ({
			node,
			cx: parseFloat(node.getAttribute('data-cx') || '0'),
			cy: parseFloat(node.getAttribute('data-cy') || '0'),
			hoverSince: null,
		}));
		requestRender();
	}, { passive: true });

	render();
})();
</script>"""


def _fallback_glyph_svg(title: str) -> str:
	initial = html.escape((title.strip()[:1] or "G").upper())
	return (
		"<svg class=\"glyph-fallback-svg\" viewBox=\"0 0 100 100\" aria-hidden=\"true\">"
		"<rect x=\"10\" y=\"10\" width=\"80\" height=\"80\" fill=\"none\" stroke=\"rgba(255,255,255,0.85)\" stroke-width=\"2\"/>"
		f"<text x=\"50\" y=\"58\" text-anchor=\"middle\" font-size=\"34\" fill=\"#fff\" font-family=\"Avenir Next, Segoe UI, sans-serif\">{initial}</text>"
		"</svg>"
	)


def _safe_span(value: Any, default: int, minimum: int = 1, maximum: int = 12) -> int:
	try:
		parsed = int(str(value).strip())
	except (TypeError, ValueError):
		return default
	return max(minimum, min(maximum, parsed))


def render_titlepage_html(data: dict[str, Any], font_css_href: str, wordmark_markup: str) -> str:
	_ = wordmark_markup
	hero = as_dict(data.get("hero"))
	meta = as_dict(data.get("meta"))
	structure = as_dict(data.get("structure"))
	template = str(structure.get("template", "calyr_titlepage_orbit"))
	if template != "calyr_titlepage_orbit":
		template = "calyr_titlepage_orbit"
	hero_class = str(structure.get("hero_class", "hero"))
	hero_copy_class = str(structure.get("hero_copy_class", "hero-copy"))
	hero_kicker_class = str(structure.get("hero_kicker_class", "hero-kicker"))
	hero_title_class = str(structure.get("hero_title_class", "hero-title"))
	hero_subtitle_class = str(structure.get("hero_subtitle_class", "hero-subtitle"))
	nav = as_dict(data.get("nav"))
	nav_top = as_list_of_dict(nav.get("top"))
	cta = as_dict(hero.get("cta"))
	cta_text = str(cta.get("text", "")).strip()
	cta_href = str(cta.get("href", "#")).strip() or "#"
	explore_sections = as_list_of_dict(data.get("explore_sections"))
	preferred_open_index = 0
	for index, section in enumerate(explore_sections, start=1):
		section_tile_kind = str(section.get("tile_kind", "glyph" if index == 1 else "text")).strip().lower()
		if section_tile_kind == "text" and bool(section.get("open_by_default", False)):
			preferred_open_index = index
			break
	if preferred_open_index == 0:
		for index, section in enumerate(explore_sections, start=1):
			section_tile_kind = str(section.get("tile_kind", "glyph" if index == 1 else "text")).strip().lower()
			if section_tile_kind == "text":
				preferred_open_index = index
				break

	grid_cfg = {
		"grid_spacing_px": structure.get("grid_spacing_px"),
		"grid_major_step": structure.get("grid_major_step"),
		"grid_base_r_major": structure.get("grid_base_r_major"),
		"grid_base_r_minor": structure.get("grid_base_r_minor"),
		"grid_max_r_major": structure.get("grid_max_r_major"),
		"grid_max_r_minor": structure.get("grid_max_r_minor"),
		"grid_hover_radius_px": structure.get("grid_hover_radius_px"),
		"grid_base_op_major": structure.get("grid_base_op_major"),
		"grid_base_op_minor": structure.get("grid_base_op_minor"),
		"grid_max_op_major": structure.get("grid_max_op_major"),
		"grid_max_op_minor": structure.get("grid_max_op_minor"),
		"label_hover_radius_px": structure.get("label_hover_radius_px"),
		"label_reveal_ms": structure.get("label_reveal_ms"),
		"label_font_px": structure.get("label_font_px"),
		"label_visible_opacity": structure.get("label_visible_opacity"),
		"label_color": structure.get("label_color"),
		"label_mode": structure.get("label_mode"),
	}
	grid_hover_script = _build_grid_hover_script(grid_cfg)

	tile_markup: list[str] = []
	closed_tile_rules: list[str] = []
	open_text_tile_rules: list[str] = []
	expanded_text_tile_rules: list[str] = []
	menu_entries: list[tuple[str, str]] = []
	for index, section in enumerate(explore_sections, start=1):
		title = str(section.get("title", "")).strip() or f"Section {index}"
		slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-") or f"section-{index}"
		body = str(section.get("body", "")).strip()
		teaser = str(section.get("teaser", "")).strip()
		default_tile_kind = "glyph" if index == 1 else "text"
		tile_kind = str(section.get("tile_kind", default_tile_kind)).strip().lower()
		if tile_kind not in {"glyph", "text"}:
			tile_kind = "text"
		paragraphs = [paragraph.strip() for paragraph in body.splitlines() if paragraph.strip()]
		excerpt = teaser or (paragraphs[0] if paragraphs else "")
		paragraph_markup = "\n".join(
			f'\t\t\t\t<p class="study-paragraph">{html.escape(paragraph)}</p>' for paragraph in paragraphs
		)
		raw_glyph_svg = str(section.get("glyph_svg", "")).strip()
		glyph_markup = raw_glyph_svg if raw_glyph_svg else _fallback_glyph_svg(title)
		open_markup = (
			f'<div class="tile-open-state">\n'
			f'\t\t\t\t<h2 class="study-heading">{html.escape(title)}</h2>\n'
			f'\t\t\t\t<p class="study-teaser">{html.escape(excerpt)}</p>\n'
			f'\t\t\t\t<div class="study-fulltext" id="detail-{html.escape(slug)}">\n'
			f'{paragraph_markup}\n'
			f'\t\t\t\t</div>\n'
			f'\t\t\t</div>'
		)
		if tile_kind == "glyph":
			open_markup = (
				'<div class="tile-open-state tile-open-state-glyph">\n'
				f'\t\t\t\t<div class="glyph-surface" aria-label="{html.escape(title)} glyph">{glyph_markup}</div>\n'
				'</div>'
			)
		is_initially_open = tile_kind == "text" and index == preferred_open_index
		initial_state_class = "is-open" if is_initially_open else "is-collapsed"
		initial_expanded = "true" if is_initially_open else "false"
		tile_variant = (index - 1) % 8 + 1
		closed_span = as_dict(section.get("closed_span"))
		open_span = as_dict(section.get("open_span"))
		expanded_span = as_dict(section.get("expanded_span"))
		closed_cols = _safe_span(closed_span.get("cols"), 2)
		closed_rows = _safe_span(closed_span.get("rows"), 2)
		open_cols = _safe_span(open_span.get("cols"), 6)
		open_rows = _safe_span(open_span.get("rows"), 5)
		expanded_cols = _safe_span(expanded_span.get("cols"), min(12, open_cols + 2))
		expanded_rows = _safe_span(expanded_span.get("rows"), min(12, open_rows + 1))
		closed_gradient = str(section.get("closed_gradient", "")).strip()
		if not closed_gradient:
			section_color = str(section.get("color", "")).strip()
			if section_color:
				closed_gradient = f"linear-gradient(135deg, {section_color} 0%, rgba(255, 255, 255, 0.24) 100%)"
			else:
				closed_gradient = "linear-gradient(135deg, rgba(53, 231, 255, 0.82) 0%, rgba(255, 63, 209, 0.84) 100%)"
		closed_tile_rules.append(
			f'.study-section.tile-{tile_variant}.is-collapsed {{ grid-column: span {closed_cols}; grid-row: span {closed_rows}; background: {closed_gradient}; }}'
		)
		open_text_tile_rules.append(
			f'.study-section.tile-{tile_variant}.is-open[data-tile-kind="text"] {{ grid-column: span {open_cols}; grid-row: span {open_rows}; }}'
		)
		expanded_text_tile_rules.append(
			f'.study-section.tile-{tile_variant}.is-open.is-expanded[data-tile-kind="text"] {{ grid-column: span {expanded_cols}; grid-row: span {expanded_rows}; z-index: 3; }}'
		)
		tile_markup.append(
			f'<section class="study-section tile-{tile_variant} {initial_state_class}" id="{html.escape(slug)}" data-tile-kind="{tile_kind}" data-tile-index="{index}">\n'
			f'\t\t<button class="study-trigger" type="button" aria-expanded="{initial_expanded}" aria-controls="detail-{html.escape(slug)}">\n'
			f'\t\t\t{open_markup}\n'
			f'\t\t</button>\n'
			f'\t</section>'
		)
		menu_entries.append((f"#{slug}", title))

	closed_tile_rules_css = "\n\t\t".join(closed_tile_rules)
	open_text_tile_rules_css = "\n\t\t".join(open_text_tile_rules)
	expanded_text_tile_rules_css = "\n\t\t".join(expanded_text_tile_rules)

	study_layout_markup = (
		"<main class=\"study-layout\" id=\"explore\">\n"
		"\t<div class=\"study-content\">\n"
		+ "\n".join(f"\t\t{tile}" for tile in tile_markup)
		+ "\n\t</div>\n"
		"</main>"
	)

	menu_links_markup = ""
	for href, label in menu_entries:
		menu_links_markup += f'\n\t\t<a class="corner-menu-link" href="{html.escape(href)}">{html.escape(label)}</a>'
	if cta_text:
		menu_links_markup += f'\n\t\t<a class="corner-menu-link" href="{html.escape(cta_href)}">{html.escape(cta_text)}</a>'
	if not menu_links_markup:
		for index, item in enumerate(nav_top, start=1):
			label = str(item.get("label", "")).strip() or f"Link {index}"
			href = str(item.get("href", "#")).strip() or "#"
			menu_links_markup += f'\n\t\t<a class="corner-menu-link" href="{html.escape(href)}">{html.escape(label)}</a>'

	page_title = str(meta.get("page_title") or hero.get("title") or "Homepage")
	hero_label = str(hero.get("label", ""))
	hero_kicker_markup = f'<div class="{html.escape(hero_kicker_class)}">{html.escape(hero_label)}</div>' if hero_label.strip() else ""
	hero_title = str(hero.get("title", "")).strip()
	hero_title_markup = html.escape(hero_title).replace("í", '<span class="hero-acute" tabindex="0">í</span>').replace("Í", '<span class="hero-acute" tabindex="0">Í</span>')
	hero_subtitle = str(hero.get("subtitle", "")).replace("\n", " ").strip()
	tagline = str(meta.get("tagline", "")).strip()
	hero_slogan_markup = f'<p class="hero-slogan" aria-live="polite">{html.escape(tagline)}</p>'
	font_link = f'  <link rel="stylesheet" href="{font_css_href}" />\n' if font_css_href else ""
	gsap_script_tag = '  <script src="../vendor/gsap/gsap.min.js"></script>\n'

	tile_runtime_script = """<script>
(() => {
	const menuToggle = document.querySelector('.corner-menu-toggle');
	const menuPanel = document.querySelector('.corner-menu-panel');
	if (menuToggle && menuPanel) {
		const closeMenu = () => {
			menuPanel.hidden = true;
			document.body.classList.remove('menu-open');
			menuToggle.setAttribute('aria-expanded', 'false');
		};
		const openMenu = () => {
			menuPanel.hidden = false;
			document.body.classList.add('menu-open');
			menuToggle.setAttribute('aria-expanded', 'true');
		};
		menuToggle.addEventListener('click', (event) => {
			event.preventDefault();
			menuPanel.hidden ? openMenu() : closeMenu();
		});
	}

	const sections = Array.from(document.querySelectorAll('.study-section'));
	const studyContent = document.querySelector('.study-content');
	let activeTextSection = sections.find((section) => section.dataset.tileKind === 'text') || null;
	let openIsExpanded = false;

	const updateDensityMode = () => {
		if (!(studyContent instanceof HTMLElement)) return;
		const textTileCount = sections.filter((section) => section.dataset.tileKind === 'text').length;
		const density = textTileCount >= 16 ? 'dense' : textTileCount >= 10 ? 'compact' : 'normal';
		studyContent.dataset.density = density;
	};

	const setExpanded = (section, expanded, expandedMode = false) => {
		if (!(section instanceof HTMLElement)) return;
		section.classList.toggle('is-open', expanded);
		section.classList.toggle('is-collapsed', !expanded);
		section.classList.toggle('is-expanded', expanded && expandedMode && section.dataset.tileKind === 'text');
		const trigger = section.querySelector('.study-trigger');
		if (trigger instanceof HTMLElement) {
			trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
		}
	};

	const enforceMondrianState = () => {
		if (!(activeTextSection instanceof HTMLElement) || activeTextSection.dataset.tileKind !== 'text') {
			activeTextSection = sections.find((section) => section.dataset.tileKind === 'text') || null;
		}
		for (const section of sections) {
			if (!(section instanceof HTMLElement)) continue;
			const isActive = section === activeTextSection;
			setExpanded(section, isActive, isActive && openIsExpanded);
		}
		if (studyContent instanceof HTMLElement) {
			const hasExpandedOpen = Boolean(activeTextSection) && openIsExpanded;
			studyContent.classList.toggle('has-expanded-open', hasExpandedOpen);
		}
	};

	const activateById = (id) => {
		if (!id) return;
		const target = document.getElementById(id);
		if (!(target instanceof HTMLElement)) return;
		if (target.dataset.tileKind === 'text') {
			activeTextSection = target;
			openIsExpanded = false;
			enforceMondrianState();
		}
		target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
	};

	updateDensityMode();
	enforceMondrianState();

	if (studyContent instanceof HTMLElement) {
		studyContent.addEventListener('click', (event) => {
			const target = event.target;
			if (!(target instanceof Element)) return;
			const trigger = target.closest('.study-trigger');
			if (!(trigger instanceof HTMLElement)) return;
			const section = trigger.closest('.study-section');
			if (!(section instanceof HTMLElement)) return;
			if (section.dataset.tileKind === 'text') {
				if (section === activeTextSection) {
					openIsExpanded = !openIsExpanded;
				} else {
					activeTextSection = section;
					openIsExpanded = false;
				}
			}
			enforceMondrianState();
		});

		studyContent.addEventListener('dblclick', (event) => {
			const target = event.target;
			if (!(target instanceof Element)) return;
			const trigger = target.closest('.study-trigger');
			if (!(trigger instanceof HTMLElement)) return;
			const section = trigger.closest('.study-section');
			if (!(section instanceof HTMLElement)) return;
			event.preventDefault();
			if (section.dataset.tileKind === 'text') {
				if (section === activeTextSection) {
					openIsExpanded = !openIsExpanded;
				} else {
					activeTextSection = section;
					openIsExpanded = true;
				}
			}
			enforceMondrianState();
		});
	}

	document.querySelectorAll('.corner-menu-link[href^="#"]').forEach((link) => {
		if (!(link instanceof HTMLAnchorElement)) return;
		link.addEventListener('click', (event) => {
			event.preventDefault();
			const targetId = link.getAttribute('href')?.replace(/^#/, '') || '';
			activateById(targetId);
			if (targetId) history.replaceState(null, '', `#${targetId}`);
		});
	});

	if (window.location.hash) {
		activateById(window.location.hash.replace(/^#/, ''));
	}

	window.addEventListener('hashchange', () => {
		activateById(window.location.hash.replace(/^#/, ''));
	});

})();
</script>"""

	return f"""<!DOCTYPE html>
<html lang=\"en\">
<head>
	<meta charset=\"UTF-8\" />
	<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
	<title>{html.escape(page_title)}</title>
{font_link}{gsap_script_tag}  <style>
		:root {{
			--bg: #0b0b0b;
			--fg: #ffffff;
			--frame-width: min(100% - 48px, 1280px);
			--frame-gutter: max(24px, calc((100vw - var(--frame-width)) / 2));
		}}
		* {{ box-sizing: border-box; }}
		body {{ margin: 0; background: var(--bg); color: var(--fg); font-family: "Avenir Next", "Segoe UI", Arial, sans-serif; }}
		.layout-grid {{ position: fixed; inset: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; opacity: 0.9; }}
		.hero {{ position: relative; z-index: 2; padding: 2.8rem 0 0.6rem; }}
		.hero-copy {{ width: var(--frame-width); margin: 0 auto; padding: 24px; border: 1px solid rgba(255,255,255,0.84); background: rgba(8,12,24,0.56); }}
		.hero-title {{ margin: 0; font-size: clamp(2rem, 4.2vw, 3.8rem); }}
		.hero-subtitle {{ margin-top: 1rem; margin-bottom: 0; max-width: 900px; line-height: 1.6; }}
		.hero-acute {{ color: #ff4df5; }}
		.hero-slogan {{ margin: 0.85rem 0 0; font-size: 0.9rem; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.88; }}
		.corner-menu-toggle {{ position: fixed; top: 26px; right: var(--frame-gutter); width: 72px; height: 54px; border: 1px solid rgba(255,255,255,0.9); background: transparent; z-index: 20; }}
		.corner-menu-line {{ display: block; width: 30px; height: 1px; margin: 6px auto; background: #fff; }}
		.corner-menu-panel {{ position: fixed; top: 72px; right: var(--frame-gutter); min-width: 260px; max-height: min(72vh, 640px); overflow: auto; padding: 14px; background: rgba(8,8,8,0.98); border: 1px solid rgba(255,255,255,0.26); z-index: 25; }}
		.corner-menu-panel[hidden] {{ display: none; }}
		.corner-menu-link {{ display: block; color: #fff; text-decoration: none; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.42rem 0; border-bottom: 1px solid rgba(255,255,255,0.18); }}
		.study-layout {{ position: relative; z-index: 2; width: var(--frame-width); margin: 0 auto; padding: 0.4rem 0 3.6rem; max-height: min(78vh, 980px); overflow: auto; overscroll-behavior: contain; }}
		.study-content {{ display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); grid-auto-rows: 54px; grid-auto-flow: dense; align-content: start; gap: 6px; border: 1px solid rgba(255,255,255,0.84); padding: 8px; min-height: 520px; max-height: min(72vh, 900px); overflow: auto; overscroll-behavior: contain; }}
		.study-section {{ border: 1px solid rgba(255,255,255,0.64); background: transparent; overflow: hidden; transition: transform 240ms ease, box-shadow 240ms ease, flex-basis 240ms ease, width 240ms ease, min-height 240ms ease, background 240ms ease, border-color 240ms ease, opacity 200ms ease, filter 200ms ease; }}
		.study-trigger {{ width: 100%; height: 100%; border: 0; background: transparent; padding: 0; color: #fff; cursor: pointer; position: relative; display: block; }}
		.tile-open-state {{ display: none; height: 100%; padding: 0.72rem; text-align: left; overflow: hidden; }}
		.tile-open-state-glyph {{ display: none; padding: 0; }}
		.glyph-surface {{ width: 100%; height: 100%; display: grid; place-items: center; border: 1px solid rgba(255,255,255,0.28); background: rgba(0,0,0,0.34); }}
		.glyph-surface svg {{ width: min(78%, 280px); height: min(78%, 280px); }}
		.study-heading {{ margin: 0 0 0.48rem; font-size: clamp(1.05rem, 1.8vw, 1.6rem); }}
		.study-teaser {{ margin: 0 0 0.64rem; font-size: 0.94rem; opacity: 0.86; }}
		.study-fulltext {{ flex: 1 1 auto; min-height: 0; overflow: auto; padding-right: 0.18rem; }}
		.study-paragraph {{ margin: 0 0 0.48rem; line-height: 1.54; font-size: 0.98rem; }}
		.study-section.is-collapsed {{ grid-column: span 2; grid-row: span 2; border-color: rgba(255, 255, 255, 0.38); background: linear-gradient(135deg, rgba(53, 231, 255, 0.82) 0%, rgba(255, 63, 209, 0.84) 100%); box-shadow: 0 0 18px rgba(53, 231, 255, 0.18), 0 0 24px rgba(255, 63, 209, 0.16); }}
		{closed_tile_rules_css}
		.study-section.is-collapsed .tile-open-state {{ display: none; }}
		.study-section.is-open {{ grid-column: span 6; grid-row: span 5; min-height: 210px; border-color: rgba(255,255,255,0.18); background: rgba(0,0,0,0.26); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.24); backdrop-filter: blur(6px); }}
		{open_text_tile_rules_css}
		{expanded_text_tile_rules_css}
		.study-section.is-open .tile-open-state {{ display: flex; flex-direction: column; }}
		.study-section.is-open.is-expanded {{ box-shadow: inset 0 0 0 1px rgba(255,255,255,0.16), 0 14px 36px rgba(0,0,0,0.34); }}
		.study-content.has-expanded-open .study-section.is-collapsed {{ transform: scale(0.96); opacity: 0.84; filter: saturate(0.85); }}
		.study-content[data-density="compact"] .study-section.is-collapsed {{ grid-column: span 2; grid-row: span 1; }}
		.study-content[data-density="dense"] .study-section.is-collapsed {{ grid-column: span 1; grid-row: span 1; }}
		.study-section[data-tile-kind="glyph"].is-open .tile-open-state-glyph {{ display: grid; }}
		@media (max-width: 940px) {{
			:root {{ --frame-width: min(100% - 36px, 1280px); }}
			.study-layout {{ max-height: none; overflow: visible; }}
			.study-content {{ min-height: auto; max-height: none; overflow: visible; grid-template-columns: repeat(6, minmax(0, 1fr)); grid-auto-rows: 44px; }}
			.study-section.is-collapsed {{ grid-column: span 2 !important; grid-row: span 2 !important; }}
			.study-section.is-open {{ grid-column: span 6 !important; grid-row: span 5 !important; min-height: 300px; }}
		}}
	</style>
</head>
<body>
	<svg class=\"layout-grid\" aria-hidden=\"true\"></svg>
	<button class=\"corner-menu-toggle\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"corner-menu-panel\" aria-expanded=\"false\">
		<span class=\"corner-menu-line\"></span>
		<span class=\"corner-menu-line\"></span>
		<span class=\"corner-menu-line\"></span>
	</button>
	<nav class=\"corner-menu-panel\" id=\"corner-menu-panel\" hidden>{menu_links_markup}
	</nav>
	<section class=\"{html.escape(hero_class)}\" data-template=\"{html.escape(template)}\">
		<div class=\"{html.escape(hero_copy_class)}\">
			{hero_kicker_markup}
			<h1 class=\"{html.escape(hero_title_class)}\">{hero_title_markup}</h1>
			<p class=\"{html.escape(hero_subtitle_class)}\">{html.escape(hero_subtitle)}</p>
			{hero_slogan_markup}
		</div>
	</section>
	{study_layout_markup}
	{tile_runtime_script}
	{grid_hover_script}
</body>
</html>
"""