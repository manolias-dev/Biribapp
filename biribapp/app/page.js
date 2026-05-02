"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Trophy, Trash2, ChevronRight, X, Check, ArrowLeft, Crown, Calendar, Sparkles, LogOut } from "lucide-react";

/* ============ LOGO ============ */
function BiribAppLogo({ size = 44, showWordmark = true }) {
  const id = `lg-${size}`;
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C5CFF" />
            <stop offset="50%" stopColor="#5B8DEF" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          <linearGradient id={`${id}-card1`} x1="0" y1="0" x2="40" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id={`${id}-card2`} x1="0" y1="0" x2="40" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.55" />
          </linearGradient>
          <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
            <feOffset dx="0" dy="1" result="offsetblur" />
            <feComponentTransfer><feFuncA type="linear" slope="0.3" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="0" y="0" width="64" height="64" rx="16" ry="16" fill={`url(#${id}-bg)`} />
        <rect x="0" y="0" width="64" height="32" rx="16" ry="16" fill="white" opacity="0.12" />
        <g transform="translate(20 12) rotate(-12 14 20)" filter={`url(#${id}-shadow)`}>
          <rect x="0" y="0" width="22" height="32" rx="3" fill={`url(#${id}-card2)`} />
        </g>
        <g transform="translate(22 16) rotate(8 12 16)" filter={`url(#${id}-shadow)`}>
          <rect x="0" y="0" width="22" height="32" rx="3" fill={`url(#${id}-card1)`} />
          <text x="11" y="22" textAnchor="middle" fontFamily="'Fraunces', Georgia, serif" fontWeight="700" fontSize="18" fill="#5B47E0">B</text>
        </g>
      </svg>
      {showWordmark && (
        <div className="leading-none">
          <div className="display-font text-2xl font-bold tracking-tight text-white">
            Birib<span style={{ background: "linear-gradient(135deg, #7C5CFF 0%, #22D3EE 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>APP</span>
          </div>
          <div className="ui-font text-[9px] uppercase tracking-[0.3em] mt-1" style={{ color: "#A78BFA" }}>
            Score Keeper
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ MAIN APP ============ */
export default function BiribAPP() {
  const [authed, setAuthed] = useState(null); // null = checking
  const [view, setView] = useState("home");
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [currentGameId, setCurrentGameId] = useState(null);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) => setAuthed(!!d.authed))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (authed) loadAll();
  }, [authed]);

  async function loadAll() {
    setLoading(true);
    try {
      const [p, t, g] = await Promise.all([
        fetch("/api/players").then((r) => r.json()),
        fetch("/api/teams").then((r) => r.json()),
        fetch("/api/games").then((r) => r.json()),
      ]);
      if (p.players) setPlayers(p.players);
      if (t.teams) setTeams(t.teams);
      if (g.games) setGames(g.games);
    } catch (e) {
      setErrorMsg("Failed to load data. Refresh to retry.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthed(false);
    setPlayers([]); setTeams([]); setGames([]);
    setView("home");
  }

  /* Player ops */
  async function addPlayer(name) {
    const res = await fetch("/api/players", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const d = await res.json();
    if (d.player) setPlayers((prev) => [...prev, d.player]);
    else setErrorMsg(d.error || "Failed to add player");
  }
  async function removePlayer(id) {
    await fetch(`/api/players/${id}`, { method: "DELETE" });
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setTeams((prev) => prev.map((t) => ({ ...t, member_ids: (t.member_ids || []).filter((m) => m !== id) })));
  }

  /* Team ops */
  async function addTeam(name, member_ids) {
    const res = await fetch("/api/teams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, member_ids }) });
    const d = await res.json();
    if (d.team) {
      setTeams((prev) => [...prev, d.team]);
      return d.team;
    } else {
      setErrorMsg(d.error || "Failed to add team");
      return null;
    }
  }
  async function removeTeam(id) {
    await fetch(`/api/teams/${id}`, { method: "DELETE" });
    setTeams((prev) => prev.filter((t) => t.id !== id));
  }

  /* Game ops */
  async function createGame(name, target_score, gameTeams) {
    const res = await fetch("/api/games", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, target_score, teams: gameTeams }) });
    const d = await res.json();
    if (d.game) {
      setGames((prev) => [d.game, ...prev]);
      return d.game;
    } else {
      setErrorMsg(d.error || "Failed to create game");
      return null;
    }
  }
  async function patchGame(id, body) {
    const res = await fetch(`/api/games/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json();
    if (d.game) setGames((prev) => prev.map((g) => (g.id === id ? d.game : g)));
    return d.game;
  }
  async function deleteGame(id) {
    await fetch(`/api/games/${id}`, { method: "DELETE" });
    setGames((prev) => prev.filter((g) => g.id !== id));
  }
  async function addRound(gameId, scores) {
    const res = await fetch(`/api/games/${gameId}/rounds`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scores }) });
    const d = await res.json();
    if (d.round) {
      setGames((prev) => prev.map((g) => g.id === gameId ? { ...g, rounds: [...(g.rounds || []), d.round] } : g));
    } else {
      setErrorMsg(d.error || "Failed to add round");
    }
  }
  async function deleteRound(gameId, roundId) {
    await fetch(`/api/games/${gameId}/rounds/${roundId}`, { method: "DELETE" });
    setGames((prev) => prev.map((g) => g.id === gameId ? { ...g, rounds: (g.rounds || []).filter((r) => r.id !== roundId) } : g));
  }

  const currentGame = games.find((g) => g.id === currentGameId);
  const selectedGame = games.find((g) => g.id === selectedGameId);

  if (authed === null) {
    return <div className="min-h-screen flex items-center justify-center text-white/50 ui-font">Loading…</div>;
  }
  if (authed === false) {
    return <PasscodeView onAuthed={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ background: "#0F0F23" }}>
      <style>{`
        .display-font { font-family: 'Fraunces', Georgia, serif; }
        .ui-font { font-family: 'Inter', system-ui, sans-serif; }
        .glass { background: rgba(255,255,255,0.06); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 8px 32px 0 rgba(0,0,0,0.3), inset 0 1px 0 0 rgba(255,255,255,0.1); }
        .glass-strong { background: rgba(255,255,255,0.1); backdrop-filter: blur(32px) saturate(200%); -webkit-backdrop-filter: blur(32px) saturate(200%); border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 16px 48px 0 rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(255,255,255,0.15); }
        .btn-primary { background: linear-gradient(135deg, #7C5CFF 0%, #5B8DEF 100%); color: white; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 8px 24px -8px rgba(124,92,255,0.6), inset 0 1px 0 0 rgba(255,255,255,0.2); transition: all 0.2s ease; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 32px -8px rgba(124,92,255,0.8), inset 0 1px 0 0 rgba(255,255,255,0.25); }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .btn-accent { background: linear-gradient(135deg, #22D3EE 0%, #0EA5E9 100%); color: white; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 8px 24px -8px rgba(34,211,238,0.6), inset 0 1px 0 0 rgba(255,255,255,0.2); transition: all 0.2s ease; }
        .btn-accent:hover { transform: translateY(-1px); box-shadow: 0 12px 32px -8px rgba(34,211,238,0.8); }
        .btn-accent:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .btn-glass { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.95); border: 1px solid rgba(255,255,255,0.12); backdrop-filter: blur(20px); transition: all 0.2s ease; }
        .btn-glass:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .btn-glass:disabled { opacity: 0.4; cursor: not-allowed; }
        .input-field { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; font-family: 'Inter', sans-serif; transition: all 0.2s; backdrop-filter: blur(20px); }
        .input-field::placeholder { color: rgba(255,255,255,0.35); }
        .input-field:focus { outline: none; border-color: rgba(124,92,255,0.6); background: rgba(255,255,255,0.08); box-shadow: 0 0 0 4px rgba(124,92,255,0.1); }
        .chip { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.85); transition: all 0.2s; }
        .chip:hover { background: rgba(255,255,255,0.1); }
        .chip-active { background: linear-gradient(135deg, rgba(124,92,255,0.3) 0%, rgba(34,211,238,0.3) 100%); border: 1px solid rgba(124,92,255,0.5); color: white; box-shadow: 0 4px 12px -4px rgba(124,92,255,0.5); }
        .gradient-text { background: linear-gradient(135deg, #7C5CFF 0%, #22D3EE 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .stat-num { font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-variant-numeric: tabular-nums; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes float-orb { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-40px) scale(1.05); } 66% { transform: translate(-20px,30px) scale(0.95); } }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .orb-1 { background: #7C5CFF; opacity: 0.4; width: 400px; height: 400px; top: -100px; left: -100px; animation: float-orb 18s ease-in-out infinite; }
        .orb-2 { background: #22D3EE; opacity: 0.3; width: 350px; height: 350px; top: 30%; right: -80px; animation: float-orb 22s ease-in-out infinite reverse; }
        .orb-3 { background: #F472B6; opacity: 0.25; width: 300px; height: 300px; bottom: -50px; left: 30%; animation: float-orb 25s ease-in-out infinite; }
        .section-label { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
        .progress-track { background: rgba(255,255,255,0.08); }
        .progress-fill { background: linear-gradient(90deg, #7C5CFF 0%, #22D3EE 100%); }
        .progress-fill-win { background: linear-gradient(90deg, #FBBF24 0%, #F472B6 100%); }
        .tab-bar { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(20px); }
        .tab-active { background: linear-gradient(135deg, rgba(124,92,255,0.4) 0%, rgba(34,211,238,0.4) 100%); color: white; box-shadow: 0 4px 12px -4px rgba(124,92,255,0.4); }
        .tab-inactive { color: rgba(255,255,255,0.5); }
        .tab-inactive:hover { color: rgba(255,255,255,0.8); }
      `}</style>

      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="relative max-w-2xl mx-auto px-5 py-7 min-h-screen">
        <header className="flex items-center justify-between mb-7 fade-up">
          <button onClick={() => setView("home")} className="text-left">
            <BiribAppLogo size={44} />
          </button>
          <div className="flex items-center gap-2">
            {view !== "home" && (
              <button onClick={() => setView("home")} className="btn-glass ui-font text-xs flex items-center gap-1.5 px-3.5 py-2 rounded-full">
                <ArrowLeft size={14} /> Home
              </button>
            )}
            <button onClick={logout} title="Lock" className="btn-glass ui-font p-2 rounded-full">
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {errorMsg && (
          <div className="mb-4 px-4 py-3 rounded-2xl flex items-start justify-between gap-3" style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", backdropFilter: "blur(20px)" }}>
            <div className="ui-font text-xs" style={{ color: "#FB7185" }}>{errorMsg}</div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-300 hover:text-rose-100 flex-shrink-0"><X size={14} /></button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 ui-font text-white/60">Loading…</div>
        ) : (
          <>
            {view === "home" && <HomeView players={players} teams={teams} games={games} setView={setView} setSelectedGameId={setSelectedGameId} setCurrentGameId={setCurrentGameId} />}
            {view === "roster" && <RosterView players={players} teams={teams} addPlayer={addPlayer} removePlayer={removePlayer} addTeam={addTeam} removeTeam={removeTeam} />}
            {view === "newGame" && <NewGameView players={players} teams={teams} addTeam={addTeam} createGame={createGame} setCurrentGameId={setCurrentGameId} setView={setView} setErrorMsg={setErrorMsg} />}
            {view === "game" && currentGame && <GameView game={currentGame} addRound={addRound} deleteRound={deleteRound} patchGame={patchGame} setView={setView} />}
            {view === "history" && <HistoryView games={games} setView={setView} setSelectedGameId={setSelectedGameId} setCurrentGameId={setCurrentGameId} deleteGame={deleteGame} />}
            {view === "gameDetail" && selectedGame && <GameDetailView game={selectedGame} setView={setView} setCurrentGameId={setCurrentGameId} />}
          </>
        )}
      </div>
    </div>
  );
}

/* ============ PASSCODE VIEW ============ */
function PasscodeView({ onAuthed }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e?.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode: code }) });
      const d = await res.json();
      if (d.ok) onAuthed();
      else setError(d.error || "Wrong passcode");
    } catch (e) {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-5 relative overflow-hidden" style={{ background: "#0F0F23" }}>
      <style>{`
        .display-font { font-family: 'Fraunces', Georgia, serif; }
        .ui-font { font-family: 'Inter', system-ui, sans-serif; }
        .glass { background: rgba(255,255,255,0.06); backdrop-filter: blur(24px) saturate(180%); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 8px 32px 0 rgba(0,0,0,0.3); }
        .input-field { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; transition: all 0.2s; }
        .input-field::placeholder { color: rgba(255,255,255,0.3); }
        .input-field:focus { outline: none; border-color: rgba(124,92,255,0.6); background: rgba(255,255,255,0.08); box-shadow: 0 0 0 4px rgba(124,92,255,0.1); }
        .btn-primary { background: linear-gradient(135deg, #7C5CFF 0%, #5B8DEF 100%); color: white; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 8px 24px -8px rgba(124,92,255,0.6); transition: all 0.2s; }
        .btn-primary:hover { transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        @keyframes float-orb { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-40px) scale(1.05); } }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .orb-1 { background: #7C5CFF; opacity: 0.4; width: 400px; height: 400px; top: -100px; left: -100px; animation: float-orb 18s ease-in-out infinite; }
        .orb-2 { background: #22D3EE; opacity: 0.3; width: 350px; height: 350px; bottom: -100px; right: -100px; animation: float-orb 22s ease-in-out infinite reverse; }
      `}</style>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <form onSubmit={submit} className="glass rounded-3xl p-8 w-full max-w-sm relative z-10">
        <div className="flex justify-center mb-6">
          <BiribAppLogo size={56} showWordmark={true} />
        </div>
        <div className="text-center mb-6">
          <div className="display-font text-2xl font-semibold text-white mb-1">Enter passcode</div>
          <div className="ui-font text-sm text-white/50">4-digit code from your group</div>
        </div>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="••••"
          autoFocus
          className="input-field w-full px-4 py-4 rounded-2xl text-center text-3xl tracking-[0.5em] font-semibold mb-4"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        />
        {error && <div className="ui-font text-xs text-rose-400 text-center mb-3">{error}</div>}
        <button type="submit" disabled={code.length !== 4 || busy} className="btn-primary ui-font w-full py-3.5 rounded-2xl text-sm font-semibold">
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}

/* ============ HOME ============ */
function HomeView({ players, teams, games, setView, setSelectedGameId, setCurrentGameId }) {
  const ongoingGames = games.filter((g) => !g.finished_at);
  const finishedGames = games.filter((g) => g.finished_at);
  const totalRounds = games.reduce((s, g) => s + (g.rounds?.length || 0), 0);

  return (
    <div className="fade-up space-y-6">
      <div className="glass rounded-3xl p-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <Stat label="Players" value={players.length} />
          <StatDivider />
          <Stat label="Games" value={games.length} />
          <StatDivider />
          <Stat label="Rounds" value={totalRounds} />
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={() => setView("newGame")} className="btn-primary ui-font w-full py-4 rounded-2xl flex items-center justify-between px-5 text-sm font-semibold">
          <span className="flex items-center gap-3"><Sparkles size={18} /> New Game</span>
          <ChevronRight size={18} />
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setView("roster")} className="btn-glass ui-font py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium">
            <Users size={16} /> Roster
          </button>
          <button onClick={() => setView("history")} className="btn-glass ui-font py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium">
            <Trophy size={16} /> History
          </button>
        </div>
      </div>

      {ongoingGames.length > 0 && (
        <div className="space-y-3">
          <div className="section-label flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            In Progress
          </div>
          <div className="space-y-2.5">
            {ongoingGames.map((g) => {
              const totals = computeTotals(g);
              const leader = [...g.teams].sort((a, b) => (totals[b.id] || 0) - (totals[a.id] || 0))[0];
              return (
                <button key={g.id} onClick={() => { setCurrentGameId(g.id); setView("game"); }} className="glass w-full p-4 rounded-2xl text-left flex items-center justify-between group hover:bg-white/10 transition">
                  <div className="flex-1 min-w-0">
                    <div className="display-font text-xl font-semibold text-white truncate">{g.name}</div>
                    <div className="ui-font text-xs text-white/50 mt-1 flex items-center gap-2">
                      <span>{g.teams.length} teams</span>
                      <span className="w-1 h-1 rounded-full bg-white/30"></span>
                      <span>Target {g.target_score}</span>
                      <span className="w-1 h-1 rounded-full bg-white/30"></span>
                      <span className="gradient-text font-medium">{leader?.name} leads</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 transition" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {finishedGames.length > 0 && (
        <div className="space-y-3">
          <div className="section-label">Recent Champions</div>
          <div className="space-y-2.5">
            {finishedGames.slice(0, 3).map((g) => {
              const winner = getWinner(g);
              return (
                <button key={g.id} onClick={() => { setSelectedGameId(g.id); setView("gameDetail"); }} className="glass w-full p-4 rounded-2xl text-left flex items-center justify-between group hover:bg-white/10 transition">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(244,114,182,0.2))", border: "1px solid rgba(251,191,36,0.3)" }}>
                      <Crown size={18} style={{ color: "#FBBF24" }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="display-font text-lg font-semibold text-white truncate">{winner?.name || "—"}</div>
                      <div className="ui-font text-xs text-white/50 truncate">{g.name} · {winner?.total || 0} pts</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-white/40 group-hover:translate-x-0.5 transition flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {games.length === 0 && players.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center">
          <div className="display-font text-2xl text-white/90 mb-2">Καλώς ήρθες</div>
          <div className="ui-font text-sm text-white/50">Add some players, then start your first game.</div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="stat-num text-3xl gradient-text">{value}</div>
      <div className="ui-font text-[10px] uppercase tracking-[0.2em] mt-1.5 text-white/50 font-medium">{label}</div>
    </div>
  );
}
function StatDivider() {
  return <div className="w-px h-12 bg-white/10 mx-auto self-center" />;
}

/* ============ ROSTER ============ */
function RosterView({ players, teams, addPlayer, removePlayer, addTeam, removeTeam }) {
  const [tab, setTab] = useState("players");
  const [newPlayer, setNewPlayer] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamMembers, setNewTeamMembers] = useState([]);

  async function submitPlayer() {
    const name = newPlayer.trim();
    if (!name) return;
    if (players.some((p) => p.name.toLowerCase() === name.toLowerCase())) return;
    await addPlayer(name);
    setNewPlayer("");
  }
  async function submitTeam() {
    if (!newTeamName.trim() || newTeamMembers.length === 0) return;
    await addTeam(newTeamName.trim(), newTeamMembers);
    setNewTeamName(""); setNewTeamMembers([]);
  }
  function toggleMember(id) {
    setNewTeamMembers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  return (
    <div className="fade-up space-y-5">
      <div className="tab-bar flex gap-1 p-1 rounded-full">
        <button onClick={() => setTab("players")} className={`flex-1 py-2.5 ui-font text-xs font-semibold tracking-wide rounded-full transition ${tab === "players" ? "tab-active" : "tab-inactive"}`}>Players</button>
        <button onClick={() => setTab("teams")} className={`flex-1 py-2.5 ui-font text-xs font-semibold tracking-wide rounded-full transition ${tab === "teams" ? "tab-active" : "tab-inactive"}`}>Teams</button>
      </div>

      {tab === "players" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={newPlayer} onChange={(e) => setNewPlayer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitPlayer()} placeholder="Add a player…" className="input-field flex-1 px-4 py-3 rounded-2xl text-sm" />
            <button onClick={submitPlayer} className="btn-primary px-4 rounded-2xl"><Plus size={18} /></button>
          </div>
          <div className="space-y-2">
            {players.length === 0 && <EmptyState text="No players yet. Add the first one above." />}
            {players.map((p, i) => (
              <div key={p.id} className="glass p-4 rounded-2xl flex items-center justify-between fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center stat-num text-sm" style={{ background: "linear-gradient(135deg, rgba(124,92,255,0.3), rgba(34,211,238,0.3))", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="display-font text-lg text-white">{p.name}</span>
                </div>
                <button onClick={() => removePlayer(p.id)} className="text-white/30 hover:text-rose-400 transition p-2"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "teams" && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-4 space-y-3">
            <input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="Team name…" className="input-field w-full px-4 py-3 rounded-2xl text-sm" />
            <div className="space-y-2">
              <div className="section-label">Select members</div>
              {players.length === 0 && <div className="ui-font text-xs italic text-white/40">Add players first.</div>}
              <div className="flex flex-wrap gap-2">
                {players.map((p) => {
                  const sel = newTeamMembers.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => toggleMember(p.id)} className={`ui-font text-xs px-3.5 py-2 rounded-full transition ${sel ? "chip-active" : "chip"}`}>
                      {sel && <Check size={12} className="inline mr-1" />}{p.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={submitTeam} disabled={!newTeamName.trim() || newTeamMembers.length === 0} className="btn-primary ui-font w-full py-3 rounded-2xl text-sm font-semibold">Create Team</button>
          </div>

          <div className="space-y-2">
            {teams.length === 0 && <EmptyState text="No saved teams yet." />}
            {teams.map((t, i) => (
              <div key={t.id} className="glass p-4 rounded-2xl flex items-center justify-between fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                <div className="min-w-0 flex-1">
                  <div className="display-font text-lg font-semibold text-white truncate">{t.name}</div>
                  <div className="ui-font text-xs text-white/50 mt-0.5 truncate">
                    {(t.member_ids || []).map((id) => players.find((p) => p.id === id)?.name).filter(Boolean).join(" · ") || "—"}
                  </div>
                </div>
                <button onClick={() => removeTeam(t.id)} className="text-white/30 hover:text-rose-400 transition p-2"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ NEW GAME ============ */
function NewGameView({ players, teams, addTeam, createGame, setCurrentGameId, setView, setErrorMsg }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState(3000);
  const [gameTeams, setGameTeams] = useState([]);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamMembers, setNewTeamMembers] = useState([]);
  const [saveToRoster, setSaveToRoster] = useState(true);
  const [starting, setStarting] = useState(false);

  function addRosterTeam(t) {
    if (gameTeams.some((x) => x.id === t.id)) return;
    setGameTeams([...gameTeams, { id: t.id, name: t.name, member_ids: t.member_ids || [] }]);
  }
  async function addAdHoc() {
    if (!newTeamName.trim()) return;
    if (saveToRoster) {
      const created = await addTeam(newTeamName.trim(), newTeamMembers);
      if (created) setGameTeams([...gameTeams, { id: created.id, name: created.name, member_ids: created.member_ids || [] }]);
    } else {
      const tempId = "tmp-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
      setGameTeams([...gameTeams, { id: tempId, name: newTeamName.trim(), member_ids: newTeamMembers }]);
    }
    setNewTeamName(""); setNewTeamMembers([]); setShowAddTeam(false);
  }
  function removeFromGame(id) { setGameTeams(gameTeams.filter((t) => t.id !== id)); }

  async function start() {
    if (!name.trim() || gameTeams.length < 2 || starting) return;
    setStarting(true);
    try {
      const game = await createGame(name.trim(), Number(target) || 3000, gameTeams);
      if (game) {
        setCurrentGameId(game.id);
        setView("game");
      }
    } catch (e) {
      if (setErrorMsg) setErrorMsg("Failed to start game. Try again.");
    } finally {
      setStarting(false);
    }
  }

  const availableRosterTeams = teams.filter((rt) => !gameTeams.some((t) => t.id === rt.id));

  return (
    <div className="fade-up space-y-5">
      <div className="glass rounded-2xl p-4 space-y-4">
        <div>
          <Label>Game name</Label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sunday Night at Yiayia's" className="input-field w-full px-4 py-3 rounded-xl text-base mt-2" />
        </div>
        <div>
          <Label>Target score</Label>
          <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} className="input-field w-full px-4 py-3 rounded-xl text-base mt-2" />
        </div>
      </div>

      <div className="section-label flex items-center justify-between">
        <span>Teams ({gameTeams.length})</span>
        <span className="text-white/30 normal-case tracking-normal text-[10px]">min. 2</span>
      </div>

      {gameTeams.length > 0 && (
        <div className="space-y-2">
          {gameTeams.map((t, i) => (
            <div key={t.id} className="glass p-4 rounded-2xl flex items-center justify-between fade-up" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="min-w-0 flex-1">
                <div className="display-font text-lg font-semibold text-white truncate">{t.name}</div>
                <div className="ui-font text-xs text-white/50 mt-0.5 truncate">
                  {(t.member_ids || []).map((id) => players.find((p) => p.id === id)?.name).filter(Boolean).join(" · ") || "—"}
                </div>
              </div>
              <button onClick={() => removeFromGame(t.id)} className="text-white/30 hover:text-rose-400 transition p-2"><X size={18} /></button>
            </div>
          ))}
        </div>
      )}

      {availableRosterTeams.length > 0 && (
        <div>
          <Label>Quick-add from roster</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {availableRosterTeams.map((t) => (
              <button key={t.id} onClick={() => addRosterTeam(t)} className="chip ui-font text-xs px-3.5 py-2 rounded-full">
                <Plus size={12} className="inline mr-1" />{t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!showAddTeam ? (
        <button onClick={() => setShowAddTeam(true)} className="btn-glass ui-font w-full py-3.5 rounded-2xl text-sm font-medium">
          <Plus size={15} className="inline mr-2" />Add ad-hoc team
        </button>
      ) : (
        <div className="glass-strong rounded-2xl p-4 space-y-3 fade-up">
          <input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="Team name…" className="input-field w-full px-4 py-3 rounded-xl text-sm" />
          {players.length > 0 && (
            <div className="space-y-2">
              <div className="section-label">Members (optional)</div>
              <div className="flex flex-wrap gap-2">
                {players.map((p) => {
                  const sel = newTeamMembers.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => setNewTeamMembers((prev) => prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id])} className={`ui-font text-xs px-3.5 py-2 rounded-full ${sel ? "chip-active" : "chip"}`}>
                      {sel && <Check size={12} className="inline mr-1" />}{p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <label className="flex items-center gap-2.5 ui-font text-xs text-white/70 cursor-pointer">
            <input type="checkbox" checked={saveToRoster} onChange={(e) => setSaveToRoster(e.target.checked)} className="accent-purple-500" /> Save to roster
          </label>
          <div className="flex gap-2">
            <button onClick={() => { setShowAddTeam(false); setNewTeamName(""); setNewTeamMembers([]); }} className="btn-glass ui-font flex-1 py-2.5 rounded-xl text-xs font-medium">Cancel</button>
            <button onClick={addAdHoc} disabled={!newTeamName.trim()} className="btn-primary ui-font flex-1 py-2.5 rounded-xl text-xs font-semibold">Add</button>
          </div>
        </div>
      )}

      <button onClick={start} disabled={!name.trim() || gameTeams.length < 2 || starting} className="btn-accent ui-font w-full py-4 rounded-2xl text-sm font-semibold tracking-wide">
        {starting ? "Starting…" : "Begin Game →"}
      </button>
      {gameTeams.length < 2 && <div className="ui-font text-xs text-center text-white/40">Add at least two teams to begin.</div>}
    </div>
  );
}

/* ============ GAME ============ */
function GameView({ game, addRound, deleteRound, patchGame, setView }) {
  const [showRoundForm, setShowRoundForm] = useState(false);
  const totals = computeTotals(game);
  const sortedTeams = [...game.teams].sort((a, b) => (totals[b.id] || 0) - (totals[a.id] || 0));
  const leader = sortedTeams[0];
  const leaderTotal = totals[leader.id] || 0;
  const reachedTarget = leaderTotal >= game.target_score;

  async function submitRound(scores) {
    await addRound(game.id, scores);
    setShowRoundForm(false);
  }
  async function finish() {
    await patchGame(game.id, { finished_at: new Date().toISOString() });
    setView("home");
  }
  async function reopen() {
    await patchGame(game.id, { finished_at: null });
  }

  return (
    <div className="fade-up space-y-5">
      <div className="text-center">
        <div className="section-label">{game.finished_at ? "Final" : `Target ${game.target_score}`}</div>
        <h2 className="display-font text-3xl font-bold mt-1.5 text-white">{game.name}</h2>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {sortedTeams.map((team, i) => {
          const total = totals[team.id] || 0;
          const pct = Math.min(100, (total / game.target_score) * 100);
          const isWinning = total >= game.target_score;
          return (
            <div key={team.id} className="px-5 py-4 border-b last:border-0 border-white/5">
              <div className="flex items-baseline justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  {i === 0 && total > 0 && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.3), rgba(244,114,182,0.3))" }}>
                      <Crown size={12} style={{ color: "#FBBF24" }} />
                    </div>
                  )}
                  <span className="display-font text-xl font-semibold text-white">{team.name}</span>
                </div>
                <span className="stat-num text-3xl text-white" style={isWinning ? { background: "linear-gradient(135deg, #FBBF24, #F472B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : {}}>{total}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden progress-track">
                <div className={`h-full transition-all duration-700 rounded-full ${isWinning ? "progress-fill-win" : "progress-fill"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {!game.finished_at && (
        <>
          {!showRoundForm ? (
            <button onClick={() => setShowRoundForm(true)} className="btn-accent ui-font w-full py-4 rounded-2xl text-sm font-semibold">
              <Plus size={16} className="inline mr-2" />Record Round {game.rounds.length + 1}
            </button>
          ) : (
            <RoundForm teams={game.teams} onCancel={() => setShowRoundForm(false)} onSubmit={submitRound} roundNumber={game.rounds.length + 1} />
          )}
          {reachedTarget && (
            <button onClick={finish} className="btn-primary ui-font w-full py-3.5 rounded-2xl text-sm font-semibold">
              <Crown size={15} className="inline mr-2" />Finish Game · {leader.name} wins
            </button>
          )}
        </>
      )}

      {game.finished_at && (
        <button onClick={reopen} className="btn-glass ui-font w-full py-3 rounded-2xl text-xs font-semibold tracking-wide uppercase">
          Reopen Game
        </button>
      )}

      {game.rounds.length > 0 && (
        <div className="space-y-3">
          <div className="section-label">Rounds</div>
          <div className="space-y-2">
            {game.rounds.slice().reverse().map((r) => (
              <div key={r.id} className="glass p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="stat-num text-lg gradient-text">{r.round_number}</div>
                    <div className="section-label">Round</div>
                  </div>
                  {!game.finished_at && (
                    <button onClick={() => deleteRound(game.id, r.id)} className="text-white/30 hover:text-rose-400 transition p-1"><Trash2 size={13} /></button>
                  )}
                </div>
                <div className="space-y-2">
                  {game.teams.map((t) => {
                    const s = r.scores[t.id] || { biriba: 0, outcome: 0, deck: 0 };
                    const sum = (s.biriba || 0) + (s.outcome || 0) + (s.deck || 0);
                    return (
                      <div key={t.id} className="flex items-center justify-between text-sm">
                        <span className="display-font text-base text-white/90">{t.name}</span>
                        <div className="flex items-center gap-3 ui-font text-[11px]">
                          <ScoreChip label="B" value={s.biriba || 0} color="violet" />
                          <ScoreChip label="O" value={s.outcome || 0} color="cyan" />
                          <ScoreChip label="D" value={s.deck || 0} color="pink" />
                          <span className="stat-num text-lg text-white" style={{ minWidth: 44, textAlign: "right" }}>{sum}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreChip({ label, value, color }) {
  const colors = {
    violet: { bg: "rgba(124,92,255,0.15)", text: "#C4B5FD", border: "rgba(124,92,255,0.3)" },
    cyan: { bg: "rgba(34,211,238,0.15)", text: "#67E8F9", border: "rgba(34,211,238,0.3)" },
    pink: { bg: "rgba(244,114,182,0.15)", text: "#F9A8D4", border: "rgba(244,114,182,0.3)" },
  };
  const c = colors[color];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md tabular-nums" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      <span className="opacity-70 font-semibold">{label}</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

/* ============ ROUND FORM ============ */
function RoundForm({ teams, onCancel, onSubmit, roundNumber }) {
  const initial = {};
  teams.forEach((t) => { initial[t.id] = { biriba: "", outcome: "", deck: "" }; });
  const [scores, setScores] = useState(initial);
  const [busy, setBusy] = useState(false);

  function update(teamId, field, value) {
    setScores((prev) => ({ ...prev, [teamId]: { ...prev[teamId], [field]: value } }));
  }
  async function submit() {
    if (busy) return;
    setBusy(true);
    const cleaned = {};
    Object.keys(scores).forEach((tid) => {
      cleaned[tid] = {
        biriba: Number(scores[tid].biriba) || 0,
        outcome: Number(scores[tid].outcome) || 0,
        deck: Number(scores[tid].deck) || 0,
      };
    });
    await onSubmit(cleaned);
    setBusy(false);
  }

  return (
    <div className="glass-strong rounded-3xl p-5 space-y-4 fade-up">
      <div className="text-center">
        <div className="section-label">Round {roundNumber}</div>
        <div className="display-font text-2xl font-semibold text-white mt-1">Enter Scores</div>
      </div>
      <div className="grid grid-cols-3 gap-2 ui-font text-[10px] uppercase tracking-wider text-center font-semibold">
        <div style={{ color: "#C4B5FD" }}>Biriba</div>
        <div style={{ color: "#67E8F9" }}>Out / Penalty</div>
        <div style={{ color: "#F9A8D4" }}>Deck Count</div>
      </div>
      <div className="space-y-3">
        {teams.map((t) => {
          const s = scores[t.id];
          const sum = (Number(s.biriba) || 0) + (Number(s.outcome) || 0) + (Number(s.deck) || 0);
          return (
            <div key={t.id} className="space-y-2 pb-3 border-b last:border-0 border-white/5">
              <div className="flex items-baseline justify-between">
                <span className="display-font text-lg font-semibold text-white">{t.name}</span>
                <span className="stat-num text-xl gradient-text">{sum}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" value={s.biriba} onChange={(e) => update(t.id, "biriba", e.target.value)} placeholder="0" className="input-field px-3 py-2.5 rounded-xl text-base text-center" />
                <input type="number" value={s.outcome} onChange={(e) => update(t.id, "outcome", e.target.value)} placeholder="0" className="input-field px-3 py-2.5 rounded-xl text-base text-center" />
                <input type="number" value={s.deck} onChange={(e) => update(t.id, "deck", e.target.value)} placeholder="0" className="input-field px-3 py-2.5 rounded-xl text-base text-center" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} disabled={busy} className="btn-glass ui-font flex-1 py-3 rounded-2xl text-sm font-medium">Cancel</button>
        <button onClick={submit} disabled={busy} className="btn-accent ui-font flex-1 py-3 rounded-2xl text-sm font-semibold">{busy ? "Saving…" : "Save Round"}</button>
      </div>
    </div>
  );
}

/* ============ HISTORY ============ */
function HistoryView({ games, setView, setSelectedGameId, setCurrentGameId, deleteGame }) {
  if (games.length === 0) {
    return <EmptyState text="No games yet. Start one to begin building your history." />;
  }
  const teamStats = {};
  games.forEach((g) => {
    if (!g.finished_at) return;
    const totals = computeTotals(g);
    const winner = getWinner(g);
    g.teams.forEach((t) => {
      if (!teamStats[t.id]) teamStats[t.id] = { name: t.name, wins: 0, plays: 0, totalPoints: 0 };
      teamStats[t.id].plays += 1;
      teamStats[t.id].totalPoints += totals[t.id] || 0;
      if (winner?.id === t.id) teamStats[t.id].wins += 1;
    });
  });
  const leaderboard = Object.values(teamStats).sort((a, b) => b.wins - a.wins || b.totalPoints - a.totalPoints);
  const medalColors = ["#FBBF24", "#E5E7EB", "#CD7F32"];

  return (
    <div className="fade-up space-y-5">
      {leaderboard.length > 0 && (
        <div className="space-y-3">
          <div className="section-label">Leaderboard</div>
          <div className="glass rounded-3xl overflow-hidden">
            {leaderboard.map((s, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center justify-between border-b last:border-0 border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center stat-num text-sm font-semibold" style={{
                    background: i < 3 ? `linear-gradient(135deg, ${medalColors[i]}30, ${medalColors[i]}10)` : "rgba(255,255,255,0.06)",
                    border: `1px solid ${i < 3 ? medalColors[i] + "60" : "rgba(255,255,255,0.1)"}`,
                    color: i < 3 ? medalColors[i] : "rgba(255,255,255,0.7)",
                  }}>{i + 1}</div>
                  <span className="display-font text-lg font-semibold text-white">{s.name}</span>
                </div>
                <div className="text-right">
                  <div className="stat-num text-lg text-white">{s.wins}<span className="ui-font text-xs ml-1 text-white/40">/ {s.plays}</span></div>
                  <div className="ui-font text-[10px] uppercase tracking-wider text-white/40">wins</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="section-label">All Games</div>
        <div className="space-y-2">
          {games.map((g, i) => {
            const winner = getWinner(g);
            const totals = computeTotals(g);
            return (
              <div key={g.id} className="glass p-4 rounded-2xl flex items-center justify-between fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                <button onClick={() => {
                  if (g.finished_at) { setSelectedGameId(g.id); setView("gameDetail"); }
                  else { setCurrentGameId(g.id); setView("game"); }
                }} className="flex-1 text-left min-w-0">
                  <div className="display-font text-lg font-semibold text-white truncate">{g.name}</div>
                  <div className="ui-font text-xs flex items-center gap-2 mt-0.5 text-white/50">
                    <Calendar size={11} />{formatDate(g.created_at)}
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    {g.finished_at ? <span className="flex items-center gap-1"><Crown size={11} style={{ color: "#FBBF24" }} /> {winner?.name} ({totals[winner?.id] || 0})</span> : <span style={{ color: "#22D3EE" }}>● In progress</span>}
                  </div>
                </button>
                <button onClick={() => { if (confirm(`Delete "${g.name}"?`)) deleteGame(g.id); }} className="text-white/30 hover:text-rose-400 transition p-2 ml-1"><Trash2 size={14} /></button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============ GAME DETAIL ============ */
function GameDetailView({ game, setView, setCurrentGameId }) {
  if (!game) return <EmptyState text="Game not found." />;
  const totals = computeTotals(game);
  const sortedTeams = [...game.teams].sort((a, b) => (totals[b.id] || 0) - (totals[a.id] || 0));
  const winner = sortedTeams[0];

  return (
    <div className="fade-up space-y-5">
      <div className="text-center">
        <div className="section-label">{formatDate(game.created_at)}</div>
        <h2 className="display-font text-3xl font-bold mt-1.5 text-white">{game.name}</h2>
        <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(244,114,182,0.15))", border: "1px solid rgba(251,191,36,0.3)" }}>
          <Crown size={14} style={{ color: "#FBBF24" }} />
          <span className="display-font text-base text-white font-semibold">{winner.name}</span>
          <span className="stat-num text-base text-white/70">· {totals[winner.id] || 0}</span>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {sortedTeams.map((team, i) => (
          <div key={team.id} className="px-5 py-3.5 flex items-center justify-between border-b last:border-0 border-white/5">
            <div className="flex items-center gap-3">
              <div className="stat-num text-xl text-white/40 w-6">{i + 1}</div>
              <span className="display-font text-lg font-semibold text-white">{team.name}</span>
            </div>
            <span className="stat-num text-2xl text-white">{totals[team.id] || 0}</span>
          </div>
        ))}
      </div>

      <button onClick={() => { setCurrentGameId(game.id); setView("game"); }} className="btn-glass ui-font w-full py-3.5 rounded-2xl text-sm font-medium">
        View Round-by-Round →
      </button>
    </div>
  );
}

/* ============ HELPERS ============ */
function Label({ children }) {
  return <div className="section-label">{children}</div>;
}
function EmptyState({ text }) {
  return (
    <div className="glass rounded-3xl py-12 px-6 text-center">
      <div className="ui-font text-sm text-white/50">{text}</div>
    </div>
  );
}
function computeTotals(game) {
  const t = {};
  game.teams.forEach((team) => { t[team.id] = 0; });
  (game.rounds || []).forEach((r) => {
    Object.keys(r.scores || {}).forEach((tid) => {
      const s = r.scores[tid];
      t[tid] = (t[tid] || 0) + (s.biriba || 0) + (s.outcome || 0) + (s.deck || 0);
    });
  });
  return t;
}
function getWinner(game) {
  const totals = computeTotals(game);
  let best = null;
  game.teams.forEach((t) => {
    if (!best || (totals[t.id] || 0) > (totals[best.id] || 0)) best = { ...t, total: totals[t.id] || 0 };
  });
  return best;
}
function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
