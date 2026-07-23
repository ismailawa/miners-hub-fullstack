'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { MineSite } from '../lib/api/mine-sites';

interface MapboxMineSitesMapProps {
  sites: MineSite[];
  selectedSiteId?: string | null;
  loading?: boolean;
  onSelectSite: (site: MineSite) => void;
}

type MapboxModule = typeof import('mapbox-gl').default;
type MapboxMap = import('mapbox-gl').Map;
type MapboxMarker = import('mapbox-gl').Marker;

const NIGERIA_CENTER: [number, number] = [8.6753, 9.082];

function markerColor(site: MineSite) {
  if (site.riskLevel === 'critical') return '#dc2626';
  if (site.riskLevel === 'high') return '#f97316';
  if (site.siteStatus === 'active') return '#16a34a';
  if (site.siteStatus === 'suspended') return '#ef4444';
  return '#facc15';
}

function isMapped(site: MineSite) {
  return typeof site.latitude === 'number' && typeof site.longitude === 'number';
}

export default function MapboxMineSitesMap({
  sites,
  selectedSiteId,
  loading = false,
  onSelectSite,
}: MapboxMineSitesMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const mapboxRef = useRef<MapboxModule | null>(null);
  const markersRef = useRef<MapboxMarker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mappedSites = sites.filter(isMapped);

  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current) return;

    let cancelled = false;

    void import('mapbox-gl').then((mapboxModule) => {
      if (cancelled || !containerRef.current) return;

      const mapbox = mapboxModule.default;
      mapbox.accessToken = token;
      mapboxRef.current = mapbox;

      const map = new mapbox.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: NIGERIA_CENTER,
        zoom: 5,
        pitch: 24,
        attributionControl: false,
      });

      map.addControl(new mapbox.NavigationControl({ visualizePitch: true }), 'top-right');
      map.addControl(new mapbox.AttributionControl({ compact: true }), 'bottom-right');
      map.on('load', () => setIsMapReady(true));
      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      setIsMapReady(false);
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    const mapbox = mapboxRef.current;
    if (!map || !mapbox || !isMapReady) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    mappedSites.forEach((site) => {
      const element = document.createElement('button');
      element.type = 'button';
      element.title = site.name;
      element.setAttribute('aria-label', `Select ${site.name}`);
      element.style.width = selectedSiteId === site.id ? '22px' : '16px';
      element.style.height = selectedSiteId === site.id ? '22px' : '16px';
      element.style.borderRadius = '999px';
      element.style.border = '2px solid #ffffff';
      element.style.background = markerColor(site);
      element.style.boxShadow = '0 10px 20px rgba(0,0,0,.32)';
      element.style.cursor = 'pointer';
      element.style.transition = 'transform .18s ease, width .18s ease, height .18s ease';
      element.onmouseenter = () => {
        element.style.transform = 'scale(1.18)';
      };
      element.onmouseleave = () => {
        element.style.transform = 'scale(1)';
      };
      element.onclick = () => onSelectSite(site);

      const marker = new mapbox.Marker({ element, anchor: 'center' })
        .setLngLat([site.longitude as number, site.latitude as number])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [isMapReady, mappedSites, onSelectSite, selectedSiteId]);

  useEffect(() => {
    const map = mapRef.current;
    const mapbox = mapboxRef.current;
    if (!map || !mapbox || !isMapReady || mappedSites.length === 0) return;

    if (selectedSiteId) {
      const selected = mappedSites.find((site) => site.id === selectedSiteId);
      if (selected) {
        map.flyTo({
          center: [selected.longitude as number, selected.latitude as number],
          zoom: Math.max(map.getZoom(), 10),
          speed: 0.9,
          curve: 1.2,
          essential: true,
        });
        return;
      }
    }

    const bounds = new mapbox.LngLatBounds();
    mappedSites.forEach((site) => {
      bounds.extend([site.longitude as number, site.latitude as number]);
    });
    map.fitBounds(bounds, {
      padding: { top: 90, right: 80, bottom: 80, left: 80 },
      maxZoom: 9,
      duration: 800,
    });
  }, [isMapReady, mappedSites, selectedSiteId]);

  if (!token) {
    return (
      <div className="flex h-full items-center justify-center bg-primary p-6 text-center text-sm text-text-muted">
        Add `NEXT_PUBLIC_MAPBOX_TOKEN` to `.env.local` to enable the Mapbox mine-site layer.
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[520px] bg-primary">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute left-4 top-4 rounded-md border border-border bg-secondary/95 px-3 py-2 text-xs text-text-secondary shadow-lg">
        Mapbox mine-site layer · {mappedSites.length} mapped
      </div>
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 rounded-md border border-border bg-secondary/95 px-3 py-2 text-[11px] text-text-secondary shadow-lg">
        <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-green-600" /> Active</span>
        <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-yellow-400" /> Planned</span>
        <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-orange-500" /> High risk</span>
        <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-red-600" /> Critical</span>
      </div>
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/70 text-text-muted">
          Loading mine sites...
        </div>
      ) : mappedSites.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/70 text-text-muted">
          No mapped sites match the current filters.
        </div>
      ) : null}
    </div>
  );
}
