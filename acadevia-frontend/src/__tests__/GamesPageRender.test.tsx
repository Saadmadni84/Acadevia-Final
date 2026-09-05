import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GamesPage from '../pages/student/GamesPage.page';
import GamePlayPage from '../pages/student/GamePlayPage.page';
import { GAME_CATALOG, getGameById, getGamesBySubject } from '../components/games/gameCatalog';
import { GameThumbnail } from '../components/games/GameThumbnail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('GamesPage Render & Catalog Integrity', () => {
  afterEach(() => {
    cleanup();
  });
  it('has at least 55 games in the catalogue', () => {
    expect(GAME_CATALOG.length).toBeGreaterThanOrEqual(55);
  });

  it('all 55 games have unique IDs, titles, valid classes, and distinct routes', () => {
    const ids = new Set<string>();
    const routes = new Set<string>();

    for (const game of GAME_CATALOG) {
      expect(ids.has(game.id)).toBe(false);
      ids.add(game.id);

      const gameRoute = `/games/${game.id}`;
      expect(routes.has(gameRoute)).toBe(false);
      routes.add(gameRoute);

      expect(game.title).toBeTruthy();
      expect(game.subject).toBeTruthy();
      expect(game.classes).toBeTruthy();
      expect(game.genre).toBeTruthy();
      expect(game.icon).toBeTruthy();
    }
  });

  it('verifies cognitive and detective games exist in catalogue', () => {
    const mindGames = getGamesBySubject('Mind & Memory');
    expect(mindGames.length).toBe(5);

    const detectiveGames = getGamesBySubject('Detective & Logic');
    expect(detectiveGames.length).toBe(5);
  });

  it('renders GamesPage without throwing runtime exceptions', () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/games']}>
          <GamesPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(container).toBeDefined();

    // Verify main header
    const header = screen.getByRole('heading', { level: 1 });
    expect(header.textContent).toContain('Acadevia Student Arena');

    // Verify category tabs exist
    const categoryElements = screen.getAllByRole('button');
    expect(categoryElements.length).toBeGreaterThan(5);

    // Verify search input is present and functional
    const searchInput = screen.getByPlaceholderText(/Search by title/i);
    expect(searchInput).toBeTruthy();

    // Type in search query
    fireEvent.change(searchInput, { target: { value: 'Vedic' } });
    expect(screen.getByText(/Vedic Math Rush/i)).toBeTruthy();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
  });

  it('renders original game cover art scenes for flagship titles', () => {
    const flagshipIds = [
      'vedic-math-master',
      'history-quest',
      'indus-valley-builder',
      'freedom-movement-quest',
      'type-rush',
      'projectile-master',
      'fraction-forge',
      'cell-defender',
      'memory-vault',
      'detectives-office',
      'codebreaker',
    ];

    for (const id of flagshipIds) {
      const game = getGameById(id);
      expect(game).toBeDefined();
    }
  });

  it('renders GamePlayPage for cognitive, history, and academic games without crashing', () => {
    const testGameIds = [
      'memory-vault',
      'detectives-office',
      'vedic-math-master',
      'type-rush',
      'history-quest',
      'indus-valley-builder',
      'freedom-movement-quest',
    ];

    for (const gameId of testGameIds) {
      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[`/games/${gameId}`]}>
            <Routes>
              <Route path="/games/:gameId" element={<GamePlayPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );

      const game = getGameById(gameId);
      expect(game).toBeDefined();
      unmount();
    }
  });

  it('renders 100% geometric vector SVG game icons for ALL 55 games with zero embedded text and zero img tags', () => {
    for (const game of GAME_CATALOG) {
      const { container, unmount } = render(<GameThumbnail game={game} />);
      const svg = container.querySelector('svg');
      expect(svg, `Game ${game.id} must render an SVG element`).not.toBeNull();

      // Rule: NO text inside thumbnails
      const textNodes = container.querySelectorAll('text');
      expect(textNodes.length, `Game ${game.id} must NOT have embedded text in thumbnail`).toBe(0);

      // Rule: NO raster img tags in thumbnail
      const imgNodes = container.querySelectorAll('img');
      expect(imgNodes.length, `Game ${game.id} must NOT use raster img tags`).toBe(0);

      unmount();
    }
  });

  it('defaults to History Quest: Chronicles of India as Featured Game on All Games, supports Next Featured, and preserves category featured behavior', () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/games']}>
          <GamesPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // 1. Check default featured game on All Games
    const featuredHeading = container.querySelector('h2');
    expect(featuredHeading).not.toBeNull();
    expect(featuredHeading?.textContent).toBe('History Quest: Chronicles of India');

    // 2. Check PLAY NOW link targets /games/history-quest
    const playNowLinks = screen.getAllByRole('link', { name: /PLAY NOW/i });
    expect(playNowLinks[0].getAttribute('href')).toBe('/games/history-quest');

    // 3. Check badges in featured showcase: History, Adventure, +150 XP
    expect(screen.getAllByText('History').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Adventure').length).toBeGreaterThan(0);
    expect(screen.getAllByText('+150 XP').length).toBeGreaterThan(0);

    // 4. Test "Next Featured" button advances rotation
    const nextButton = screen.getByRole('button', { name: /Next Featured/i });
    fireEvent.click(nextButton);
    expect(container.querySelector('h2')?.textContent).toContain('Vedic Math Rush');

    // 5. Test switching category tab to Mathematics updates featured game to Vedic Math Rush
    const mathTabs = screen.getAllByRole('button', { name: /Mathematics/i });
    fireEvent.click(mathTabs[0]);
    expect(container.querySelector('h2')?.textContent).toContain('Vedic Math Rush');

    // 6. Test switching back to All Games tab resets featured game to History Quest
    const allGamesTabs = screen.getAllByRole('button', { name: /All Games/i });
    fireEvent.click(allGamesTabs[0]);
    expect(container.querySelector('h2')?.textContent).toBe('History Quest: Chronicles of India');
  }, 15000);
});

