"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Users, Trophy, Trash2, ChevronRight, X, Check, ArrowLeft, Crown, Calendar, Sparkles, Camera, Edit3, LogOut } from "lucide-react";

/* ============ API HELPERS ============ */
const api = {
  async get(path) {
    const r = await fetch(path, { credentials: "same-origin" });
    if (r.status === 401) throw new Error("UNAUTHORIZED");
    if (!r.ok) throw new Error((await safeError(r)) || `GET ${path} failed`);
    return r.json();
  },
  async send(method, path, body) {
    const r = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (r.status === 401) throw new Error("UNAUTHORIZED");
    if (!r.ok) throw new Error((await safeError(r)) || `${method} ${path} failed`);
    return r.json();
  },
};
async function safeError(r) {
  try { const j = await r.json(); return j?.error; } catch { return null; }
}

/* ============ LOGO ============ */
function BiribAppLogo({ size = 44, showWordmark = true }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size * 1.1} viewBox="0 0 64 70" fill="none">
        <path
          d="M8 4 L56 4 L56 38 Q56 50 48 58 L32 66 L16 58 Q8 50 8 38 Z"
          fill="#D4AF37"
        />
        <text x="32" y="46" textAnchor="middle" fontFamily="'Geist', system-ui, sans-serif" fontWeight="700" fontSize="42" fill="#0A2818" style={{ letterSpacing: "-0.04em" }}>B</text>
      </svg>
      {showWordmark && (
        <div className="leading-none">
          <div className="flex items-baseline" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
            <span style={{ color: "#F5E9CF", fontWeight: 600, fontSize: "24px", letterSpacing: "-0.04em" }}>Birib</span>
            <span style={{ color: "#D4AF37", fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "30px", marginLeft: "2px", letterSpacing: "-0.01em", transform: "translateY(2px)", display: "inline-block" }}>APP</span>
          </div>
          <div className="text-[9px] uppercase tracking-[0.32em] mt-1.5 mono-font font-medium" style={{ color: "#D4AF37" }}>
            score keeper
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ AVATAR ============ */
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #1A7A3F, #22C55E)",
  "linear-gradient(135deg, #D4AF37, #F4CD5C)",
  "linear-gradient(135deg, #7A1F2B, #B8313F)",
  "linear-gradient(135deg, #14502E, #1A7A3F)",
  "linear-gradient(135deg, #A8862A, #D4AF37)",
  "linear-gradient(135deg, #2D6A4F, #52B788)",
  "linear-gradient(135deg, #6B1F2B, #D4AF37)",
  "linear-gradient(135deg, #1A7A3F, #D4AF37)",
];
function gradientForName(name) {
  let h = 0;
  for (let i = 0; i < (name || "").length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[h];
}

function Avatar({ player, size = 36 }) {
  const initial = (player?.name || "?").charAt(0).toUpperCase();
  const grad = gradientForName(player?.name || "?");
  if (player?.photo) {
    return (
      <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: size, height: size, border: `1px solid #D4AF37` }}>
        <img src={player.photo} alt={player.name} style={{ width: size, height: size, objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: size, height: size, background: grad, border: `1px solid rgba(212,175,55,0.5)`, fontSize: size * 0.42, color: "#F5E9CF", fontWeight: 500, fontFamily: "'Geist', system-ui, sans-serif", letterSpacing: "-0.02em" }}>
      {initial}
    </div>
  );
}

async function compressImage(file, maxDim = 192, quality = 0.72) {
  const dataUrl = await new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
  const img = await new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  const sz = Math.min(img.width, img.height);
  const sx = (img.width - sz) / 2;
  const sy = (img.height - sz) / 2;
  const scale = Math.min(1, maxDim / sz);
  canvas.width = Math.round(sz * scale);
  canvas.height = Math.round(sz * scale);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, sx, sy, sz, sz, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

/* ============ CARD WATERMARKS ============ */
function CardWatermarks() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice" style={{ zIndex: 0 }}>
      <defs>
        <pattern id="cardpattern" x="0" y="0" width="280" height="320" patternUnits="userSpaceOnUse">
          <g transform="translate(20 30) rotate(-12)">
            <rect width="60" height="84" rx="6" fill="none" stroke="#D4AF37" strokeWidth="0.6" opacity="0.12" />
            <text x="6" y="14" fontFamily="'Instrument Serif', serif" fontSize="11" fill="#D4AF37" opacity="0.18">A</text>
            <text x="6" y="22" fontFamily="serif" fontSize="8" fill="#22C55E" opacity="0.18">♠</text>
            <text x="30" y="50" textAnchor="middle" fontFamily="serif" fontSize="22" fill="#22C55E" opacity="0.1">♠</text>
            <text x="54" y="78" textAnchor="end" fontFamily="'Instrument Serif', serif" fontSize="11" fill="#D4AF37" opacity="0.18" transform="rotate(180 54 78)">A</text>
          </g>
          <g transform="translate(190 80) rotate(18)">
            <rect width="60" height="84" rx="6" fill="none" stroke="#D4AF37" strokeWidth="0.6" opacity="0.1" />
            <text x="6" y="14" fontFamily="'Instrument Serif', serif" fontSize="11" fill="#D4AF37" opacity="0.16">K</text>
            <text x="6" y="22" fontFamily="serif" fontSize="8" fill="#7A1F2B" opacity="0.18">♥</text>
            <text x="30" y="50" textAnchor="middle" fontFamily="serif" fontSize="22" fill="#7A1F2B" opacity="0.1">♥</text>
            <text x="54" y="78" textAnchor="end" fontFamily="'Instrument Serif', serif" fontSize="11" fill="#D4AF37" opacity="0.16" transform="rotate(180 54 78)">K</text>
          </g>
          <g transform="translate(80 180) rotate(7)">
            <rect width="60" height="84" rx="6" fill="none" stroke="#D4AF37" strokeWidth="0.6" opacity="0.1" />
            <text x="6" y="14" fontFamily="'Instrument Serif', serif" fontSize="11" fill="#D4AF37" opacity="0.16">Q</text>
            <text x="6" y="22" fontFamily="serif" fontSize="8" fill="#7A1F2B" opacity="0.18">♦</text>
            <text x="30" y="50" textAnchor="middle" fontFamily="serif" fontSize="22" fill="#7A1F2B" opacity="0.1">♦</text>
            <text x="54" y="78" textAnchor="end" fontFamily="'Instrument Serif', serif" fontSize="11" fill="#D4AF37" opacity="0.16" transform="rotate(180 54 78)">Q</text>
          </g>
          <g transform="translate(210 230) rotate(-8)">
            <rect width="60" height="84" rx="6" fill="none" stroke="#D4AF37" strokeWidth="0.6" opacity="0.1" />
            <text x="6" y="14" fontFamily="'Instrument Serif', serif" fontSize="11" fill="#D4AF37" opacity="0.16">J</text>
            <text x="6" y="22" fontFamily="serif" fontSize="8" fill="#22C55E" opacity="0.18">♣</text>
            <text x="30" y="50" textAnchor="middle" fontFamily="serif" fontSize="22" fill="#22C55E" opacity="0.1">♣</text>
          </g>
          <text x="155" y="40" fontFamily="serif" fontSize="14" fill="#D4AF37" opacity="0.08">♠</text>
          <text x="20" y="280" fontFamily="serif" fontSize="14" fill="#D4AF37" opacity="0.08">♥</text>
          <text x="265" y="180" fontFamily="serif" fontSize="14" fill="#D4AF37" opacity="0.08">♦</text>
          <text x="140" y="305" fontFamily="serif" fontSize="14" fill="#D4AF37" opacity="0.08">♣</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cardpattern)" />
    </svg>
  );
}

/* ============ MAIN PAGE ============ */
export default function Page() {
  const [authed, setAuthed] = useState(null); // null=loading, false=login, true=app

  useEffect(() => {
    api.get("/api/auth/status")
      .then((r) => setAuthed(!!r.authed))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center felt-bg">
        <div className="mono-font text-sm" style={{ color: "rgba(201,185,143,0.6)" }}>loading...</div>
      </div>
    );
  }

  return authed ? <App onLogout={() => setAuthed(false)} /> : <Login onSuccess={() => setAuthed(true)} />;
}

/* ============ LOGIN ============ */
function Login({ onSuccess }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e?.preventDefault?.();
    if (!code.trim() || busy) return;
    setBusy(true);
    setErr(null);
    try {
      await api.send("POST", "/api/auth/login", { passcode: code });
      onSuccess();
    } catch (e) {
      setErr(e.message === "UNAUTHORIZED" ? "Invalid passcode" : e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden felt-bg flex items-center justify-center px-5">
      <CardWatermarks />
      <div className="relative w-full max-w-sm" style={{ zIndex: 1 }}>
        <div className="flex justify-center mb-6">
          <BiribAppLogo size={56} />
        </div>
        <form onSubmit={submit} className="surface rounded p-5 space-y-4">
          <div>
            <div className="section-label mb-2"><span className="section-prefix">//</span> enter passcode</div>
            <input
              type="tel"
              inputMode="numeric"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
              placeholder="••••"
              className="input-field w-full px-4 py-3 rounded text-center text-2xl tracking-[0.5em] font-medium"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            />
          </div>
          {err && <div className="mono-font text-xs" style={{ color: "#FB7185" }}>{err}</div>}
          <button type="submit" disabled={!code.trim() || busy} className="btn-gold mono-font w-full py-3 rounded text-sm font-semibold uppercase tracking-[0.18em]">
            {busy ? "checking..." : "unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============ APP SHELL ============ */
function App({ onLogout }) {
  const [view, setView] = useState("home");
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [currentGameId, setCurrentGameId] = useState(null);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [p, t, g] = await Promise.all([
        api.get("/api/players"),
        api.get("/api/teams"),
        api.get("/api/games"),
      ]);
      setPlayers(p.players || []);
      setTeams(t.teams || []);
      setGames(g.games || []);
    } catch (e) {
      if (e.message === "UNAUTHORIZED") { onLogout(); return; }
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleErr(e) {
    if (e.message === "UNAUTHORIZED") { onLogout(); return; }
    setErrorMsg(e.message);
  }

  async function logout() {
    try { await api.send("POST", "/api/auth/logout"); } catch {}
    onLogout();
  }

  const currentGame = games.find((g) => g.id === currentGameId);

  return (
    <div className="min-h-screen w-full relative overflow-hidden felt-bg">
      <CardWatermarks />

      <div className="relative max-w-2xl mx-auto px-5 py-7 min-h-screen" style={{ zIndex: 1 }}>
        <header className="flex items-center justify-between mb-5 fade-up">
          <button onClick={() => setView("home")} className="text-left">
            <BiribAppLogo size={44} />
          </button>
          <div className="flex items-center gap-2">
            {view !== "home" && (
              <button onClick={() => setView("home")} className="btn-ghost mono-font text-xs flex items-center gap-1.5 px-3 py-1.5 rounded font-medium">
                <ArrowLeft size={13} /> home
              </button>
            )}
            <button onClick={logout} title="Log out" className="btn-ghost mono-font text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded font-medium">
              <LogOut size={13} />
            </button>
          </div>
        </header>

        <div className="h-px mb-5" style={{ background: "rgba(212,175,55,0.2)" }}></div>

        {errorMsg && (
          <div className="mb-4 px-4 py-3 rounded flex items-start justify-between gap-3" style={{ background: "rgba(122,31,43,0.2)", border: "1px solid rgba(184,49,63,0.4)" }}>
            <div className="mono-font text-xs" style={{ color: "#F5E9CF" }}>{errorMsg}</div>
            <button onClick={() => setErrorMsg(null)} style={{ color: "#C9B98F" }} className="flex-shrink-0"><X size={14} /></button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 mono-font" style={{ color: "#C9B98F" }}>loading...</div>
        ) : (
          <>
            {view === "home" && <HomeView players={players} teams={teams} games={games} setView={setView} setSelectedGameId={setSelectedGameId} setCurrentGameId={setCurrentGameId} />}
            {view === "roster" && <RosterView players={players} teams={teams} setPlayers={setPlayers} setTeams={setTeams} setSelectedPlayerId={setSelectedPlayerId} setView={setView} handleErr={handleErr} />}
            {view === "playerStats" && selectedPlayerId && <PlayerStatsView player={players.find(p => p.id === selectedPlayerId)} teams={teams} games={games} />}
            {view === "newGame" && <NewGameView players={players} teams={teams} setTeams={setTeams} setGames={setGames} setCurrentGameId={setCurrentGameId} setView={setView} handleErr={handleErr} />}
            {view === "game" && currentGame && <GameView game={currentGame} setGames={setGames} setView={setView} players={players} handleErr={handleErr} />}
            {view === "history" && <HistoryView players={players} games={games} setView={setView} setSelectedGameId={setSelectedGameId} setCurrentGameId={setCurrentGameId} setSelectedPlayerId={setSelectedPlayerId} setGames={setGames} handleErr={handleErr} />}
            {view === "gameDetail" && selectedGameId && <GameDetailView game={games.find(g => g.id === selectedGameId)} players={players} setView={setView} setCurrentGameId={setCurrentGameId} />}
          </>
        )}
      </div>
    </div>
  );
}

/* ============ HOME ============ */
function HomeView({ players, teams, games, setView, setSelectedGameId, setCurrentGameId }) {
  const ongoingGames = games.filter(g => !g.finished_at);
  const finishedGames = games.filter(g => g.finished_at);
  const totalRounds = games.reduce((s, g) => s + (g.rounds?.length || 0), 0);

  return (
    <div className="fade-up space-y-5">
      <div className="surface rounded p-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <Stat label="players" value={players.length} />
          <StatDivider />
          <Stat label="games" value={games.length} />
          <StatDivider />
          <Stat label="rounds" value={totalRounds} />
        </div>
      </div>

      <div className="space-y-2">
        <button onClick={() => setView("newGame")} className="btn-gold mono-font w-full py-4 rounded flex items-center justify-between px-5 text-sm font-semibold uppercase tracking-[0.15em]">
          <span className="flex items-center gap-2.5"><Sparkles size={15} /> new game</span>
          <ChevronRight size={16} />
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setView("roster")} className="btn-ghost mono-font py-3 rounded flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider">
            <Users size={14} /> roster
          </button>
          <button onClick={() => setView("history")} className="btn-ghost mono-font py-3 rounded flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider">
            <Trophy size={14} /> history
          </button>
        </div>
      </div>

      {ongoingGames.length > 0 && (
        <div className="space-y-3">
          <div className="ornament-divider section-label"><span><span className="section-prefix">//</span> tables in play</span></div>
          <div className="space-y-2">
            {ongoingGames.map(g => {
              const totals = computeTotals(g);
              const leader = [...g.teams].sort((a, b) => (totals[b.id] || 0) - (totals[a.id] || 0))[0];
              return (
                <button key={g.id} onClick={() => { setCurrentGameId(g.id); setView("game"); }} className="surface w-full p-4 rounded text-left flex items-center justify-between hover:border-yellow-600/40 transition">
                  <div className="flex-1 min-w-0">
                    <div className="display-font text-2xl truncate" style={{ color: "#F5E9CF" }}>{g.name}</div>
                    <div className="mono-font text-[11px] mt-1 flex items-center gap-2 flex-wrap font-medium" style={{ color: "rgba(201,185,143,0.7)" }}>
                      <span>{g.teams.length} teams</span>
                      <span style={{ color: "#D4AF37" }}>·</span>
                      <span>target {g.target_score}</span>
                      <span style={{ color: "#D4AF37" }}>·</span>
                      <span className="gold-text">{leader?.name} leads</span>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: "#D4AF37" }} className="opacity-60 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {finishedGames.length > 0 && (
        <div className="space-y-3">
          <div className="ornament-divider section-label"><span><span className="section-prefix">//</span> recent champions</span></div>
          <div className="space-y-2">
            {finishedGames.slice(0, 3).map(g => {
              const winner = getWinner(g);
              return (
                <button key={g.id} onClick={() => { setSelectedGameId(g.id); setView("gameDetail"); }} className="surface w-full p-4 rounded text-left flex items-center justify-between hover:border-yellow-600/40 transition">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 rounded flex items-center justify-center" style={{ background: "rgba(212,175,55,0.12)", border: "1px solid #D4AF37" }}>
                      <Crown size={16} style={{ color: "#F4CD5C" }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="display-font text-xl truncate" style={{ color: "#F5E9CF" }}>{winner?.name || "—"}</div>
                      <div className="mono-font text-[11px] truncate mt-0.5" style={{ color: "rgba(201,185,143,0.65)" }}>{g.name} · {winner?.total || 0} pts</div>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: "#D4AF37" }} className="opacity-50 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="stat-num text-4xl gold-text-bright">{value}</div>
      <div className="mono-font text-[10px] uppercase tracking-[0.2em] mt-1.5 font-medium" style={{ color: "rgba(201,185,143,0.6)" }}>{label}</div>
    </div>
  );
}
function StatDivider() {
  return <div className="w-px h-10 mx-auto self-center" style={{ background: "rgba(212,175,55,0.2)" }} />;
}

/* ============ ROSTER ============ */
function RosterView({ players, teams, setPlayers, setTeams, setSelectedPlayerId, setView, handleErr }) {
  const [tab, setTab] = useState("players");
  const [newPlayer, setNewPlayer] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamMembers, setNewTeamMembers] = useState([]);
  const fileInputRef = useRef(null);
  const [uploadingForId, setUploadingForId] = useState(null);

  async function addPlayer() {
    const name = newPlayer.trim();
    if (!name) return;
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) return;
    try {
      const r = await api.send("POST", "/api/players", { name });
      setPlayers([...players, r.player]);
      setNewPlayer("");
    } catch (e) { handleErr(e); }
  }
  async function removePlayer(id) {
    try {
      await api.send("DELETE", `/api/players/${id}`);
      setPlayers(players.filter(p => p.id !== id));
      setTeams(teams.map(t => ({ ...t, member_ids: (t.member_ids || []).filter(m => m !== id) })));
    } catch (e) { handleErr(e); }
  }
  async function addTeam() {
    const name = newTeamName.trim();
    if (!name || newTeamMembers.length === 0) return;
    try {
      const r = await api.send("POST", "/api/teams", { name, member_ids: newTeamMembers });
      setTeams([...teams, r.team]);
      setNewTeamName(""); setNewTeamMembers([]);
    } catch (e) { handleErr(e); }
  }
  async function removeTeam(id) {
    try {
      await api.send("DELETE", `/api/teams/${id}`);
      setTeams(teams.filter(t => t.id !== id));
    } catch (e) { handleErr(e); }
  }
  function toggleMember(id) {
    setNewTeamMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file || !uploadingForId) return;
    try {
      const compressed = await compressImage(file);
      const r = await api.send("PATCH", `/api/players/${uploadingForId}`, { photo: compressed });
      setPlayers(players.map(p => p.id === uploadingForId ? r.player : p));
    } catch (err) { handleErr(err); }
    finally {
      setUploadingForId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }
  function triggerPhotoUpload(playerId) {
    setUploadingForId(playerId);
    setTimeout(() => fileInputRef.current?.click(), 0);
  }
  async function removePhoto(playerId) {
    try {
      const r = await api.send("PATCH", `/api/players/${playerId}`, { photo: null });
      setPlayers(players.map(p => p.id === playerId ? r.player : p));
    } catch (e) { handleErr(e); }
  }

  return (
    <div className="fade-up space-y-4">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />

      <div className="tab-bar flex gap-1 p-1 rounded">
        <button onClick={() => setTab("players")} className={`flex-1 py-2 mono-font text-xs font-medium tracking-[0.15em] uppercase rounded transition ${tab === "players" ? "tab-active" : "tab-inactive"}`}>players</button>
        <button onClick={() => setTab("teams")} className={`flex-1 py-2 mono-font text-xs font-medium tracking-[0.15em] uppercase rounded transition ${tab === "teams" ? "tab-active" : "tab-inactive"}`}>teams</button>
      </div>

      {tab === "players" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={newPlayer} onChange={e => setNewPlayer(e.target.value)} onKeyDown={e => e.key === "Enter" && addPlayer()} placeholder="add a player..." className="input-field flex-1 px-4 py-3 rounded text-sm" />
            <button onClick={addPlayer} className="btn-gold px-4 rounded"><Plus size={18} /></button>
          </div>
          <div className="space-y-2">
            {players.length === 0 && <EmptyState text="No players yet. Add the first one above." />}
            {players.map((p, i) => (
              <div key={p.id} className="surface p-3 rounded flex items-center justify-between fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                <button onClick={() => { setSelectedPlayerId(p.id); setView("playerStats"); }} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                  <Avatar player={p} size={42} />
                  <div className="min-w-0 flex-1">
                    <div className="display-font text-2xl truncate" style={{ color: "#F5E9CF" }}>{p.name}</div>
                    <div className="mono-font text-[10px] mt-0.5 font-medium" style={{ color: "rgba(201,185,143,0.5)" }}>view stats →</div>
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  {p.photo && (
                    <button onClick={() => removePhoto(p.id)} title="Remove photo" className="p-2" style={{ color: "rgba(201,185,143,0.5)" }}><X size={14} /></button>
                  )}
                  <button onClick={() => triggerPhotoUpload(p.id)} title="Add photo" className="p-2" style={{ color: "#D4AF37", opacity: 0.7 }}><Camera size={15} /></button>
                  <button onClick={() => removePlayer(p.id)} className="p-2" style={{ color: "rgba(201,185,143,0.4)" }}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "teams" && (
        <div className="space-y-4">
          <div className="surface rounded p-4 space-y-3">
            <input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="team name..." className="input-field w-full px-4 py-3 rounded text-sm" />
            <div className="space-y-2">
              <div className="section-label">select members</div>
              {players.length === 0 && <div className="mono-font text-xs italic" style={{ color: "rgba(201,185,143,0.5)" }}>add players first.</div>}
              <div className="flex flex-wrap gap-2">
                {players.map(p => {
                  const sel = newTeamMembers.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => toggleMember(p.id)} className={`ui-font text-xs px-2.5 py-1.5 rounded-full transition flex items-center gap-1.5 font-medium ${sel ? "chip-active" : "chip"}`}>
                      <Avatar player={p} size={20} />{p.name}{sel && <Check size={11} />}
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={addTeam} disabled={!newTeamName.trim() || newTeamMembers.length === 0} className="btn-primary mono-font w-full py-3 rounded text-xs font-semibold uppercase tracking-[0.15em]">create team</button>
          </div>

          <div className="space-y-2">
            {teams.length === 0 && <EmptyState text="No saved teams yet." />}
            {teams.map((t, i) => {
              const members = (t.member_ids || []).map(id => players.find(p => p.id === id)).filter(Boolean);
              return (
                <div key={t.id} className="surface p-4 rounded flex items-center justify-between fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                  <div className="min-w-0 flex-1">
                    <div className="display-font text-2xl truncate" style={{ color: "#F5E9CF" }}>{t.name}</div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {members.length > 0 ? (
                        <>
                          <div className="flex -space-x-2">
                            {members.map(m => <Avatar key={m.id} player={m} size={22} />)}
                          </div>
                          <span className="mono-font text-xs ml-1.5 truncate font-medium" style={{ color: "rgba(201,185,143,0.65)" }}>{members.map(m => m.name).join(" · ")}</span>
                        </>
                      ) : <span className="mono-font text-xs" style={{ color: "rgba(201,185,143,0.4)" }}>—</span>}
                    </div>
                  </div>
                  <button onClick={() => removeTeam(t.id)} className="p-2" style={{ color: "rgba(201,185,143,0.4)" }}><Trash2 size={15} /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ PLAYER STATS ============ */
function PlayerStatsView({ player, teams, games }) {
  if (!player) return <EmptyState text="Player not found." />;

  const playerTeamIds = teams.filter(t => (t.member_ids || []).includes(player.id)).map(t => t.id);
  const playerGames = games.filter(g => g.teams.some(t => playerTeamIds.includes(t.id) || (t.member_ids || []).includes(player.id)));
  const finishedGames = playerGames.filter(g => g.finished_at);

  let wins = 0, losses = 0, totalPoints = 0;
  finishedGames.forEach(g => {
    const totals = computeTotals(g);
    const winner = getWinner(g);
    const playerTeam = g.teams.find(t => playerTeamIds.includes(t.id) || (t.member_ids || []).includes(player.id));
    if (!playerTeam) return;
    if (winner?.id === playerTeam.id) wins++; else losses++;
    totalPoints += totals[playerTeam.id] || 0;
  });
  const winRate = (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
  const avgPerGame = finishedGames.length > 0 ? Math.round(totalPoints / finishedGames.length) : 0;
  const gamesPlayed = playerGames.length;

  return (
    <div className="fade-up space-y-5">
      <div className="text-center space-y-3">
        <div className="flex justify-center"><Avatar player={player} size={104} /></div>
        <div>
          <div className="display-font text-5xl" style={{ color: "#F5E9CF" }}>{player.name}</div>
          <div className="mono-font text-[10px] mt-2 uppercase tracking-[0.3em]" style={{ color: "rgba(201,185,143,0.6)" }}>{gamesPlayed} {gamesPlayed === 1 ? "game" : "games"} played</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="surface p-4 rounded text-center">
          <div className="stat-num text-4xl gold-text-bright">{wins}</div>
          <div className="mono-font text-[10px] uppercase tracking-[0.2em] mt-1 font-medium" style={{ color: "rgba(201,185,143,0.6)" }}>wins</div>
        </div>
        <div className="surface p-4 rounded text-center">
          <div className="stat-num text-4xl" style={{ color: "#F5E9CF" }}>{winRate}%</div>
          <div className="mono-font text-[10px] uppercase tracking-[0.2em] mt-1 font-medium" style={{ color: "rgba(201,185,143,0.6)" }}>win rate</div>
        </div>
        <div className="surface p-4 rounded text-center">
          <div className="stat-num text-4xl" style={{ color: "#F5E9CF" }}>{totalPoints.toLocaleString()}</div>
          <div className="mono-font text-[10px] uppercase tracking-[0.2em] mt-1 font-medium" style={{ color: "rgba(201,185,143,0.6)" }}>total pts</div>
        </div>
        <div className="surface p-4 rounded text-center">
          <div className="stat-num text-4xl" style={{ color: "#F5E9CF" }}>{avgPerGame}</div>
          <div className="mono-font text-[10px] uppercase tracking-[0.2em] mt-1 font-medium" style={{ color: "rgba(201,185,143,0.6)" }}>avg / game</div>
        </div>
      </div>

      {playerGames.length > 0 && (
        <div className="space-y-3">
          <div className="ornament-divider section-label"><span><span className="section-prefix">//</span> game history</span></div>
          <div className="space-y-2">
            {playerGames.map(g => {
              const totals = computeTotals(g);
              const playerTeam = g.teams.find(t => playerTeamIds.includes(t.id) || (t.member_ids || []).includes(player.id));
              const winner = getWinner(g);
              const won = g.finished_at && winner?.id === playerTeam?.id;
              return (
                <div key={g.id} className="surface p-3.5 rounded flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="display-font text-lg truncate" style={{ color: "#F5E9CF" }}>{g.name}</div>
                    <div className="mono-font text-[10px] mt-0.5 font-medium" style={{ color: "rgba(201,185,143,0.6)" }}>
                      {playerTeam?.name} · {totals[playerTeam?.id] || 0} pts {!g.finished_at && <span style={{ color: "#22C55E" }}>· in progress</span>}
                    </div>
                  </div>
                  {g.finished_at && (
                    <div className="mono-font text-[10px] uppercase tracking-wider px-2.5 py-1 rounded font-medium" style={won ? { background: "rgba(212,175,55,0.12)", color: "#F4CD5C", border: "1px solid #D4AF37" } : { background: "rgba(15,61,36,0.4)", color: "rgba(201,185,143,0.5)", border: "1px solid rgba(212,175,55,0.15)" }}>
                      {won ? "won" : "lost"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {playerGames.length === 0 && <EmptyState text="No games yet for this player." />}
    </div>
  );
}

/* ============ NEW GAME ============ */
function NewGameView({ players, teams, setTeams, setGames, setCurrentGameId, setView, handleErr }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState(3000);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamMembers, setNewTeamMembers] = useState([]);
  const [saveToRoster, setSaveToRoster] = useState(true);
  const [starting, setStarting] = useState(false);

  function addRosterTeam(t) {
    if (selectedTeams.some(x => x.id === t.id)) return;
    setSelectedTeams([...selectedTeams, { id: t.id, name: t.name, member_ids: t.member_ids, fromRoster: true }]);
  }
  async function addAdHoc() {
    if (!newTeamName.trim()) return;
    if (saveToRoster) {
      try {
        const r = await api.send("POST", "/api/teams", { name: newTeamName.trim(), member_ids: newTeamMembers });
        setTeams(prev => [...prev, r.team]);
        setSelectedTeams(prev => [...prev, { id: r.team.id, name: r.team.name, member_ids: r.team.member_ids, fromRoster: true }]);
      } catch (e) { handleErr(e); return; }
    } else {
      const tempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
      setSelectedTeams(prev => [...prev, { id: tempId, name: newTeamName.trim(), member_ids: newTeamMembers, fromRoster: false }]);
    }
    setNewTeamName(""); setNewTeamMembers([]); setShowAddTeam(false);
  }
  function removeSelected(id) { setSelectedTeams(selectedTeams.filter(t => t.id !== id)); }

  async function startGame() {
    if (!name.trim() || selectedTeams.length < 2 || starting) return;
    setStarting(true);
    try {
      const r = await api.send("POST", "/api/games", {
        name: name.trim(),
        target_score: Number(target) || 3000,
        teams: selectedTeams.map(t => ({ id: t.id, name: t.name, member_ids: t.member_ids })),
      });
      setGames(prev => [r.game, ...prev]);
      setCurrentGameId(r.game.id);
      setView("game");
    } catch (e) { handleErr(e); setStarting(false); }
  }

  const availableRosterTeams = teams.filter(rt => !selectedTeams.some(t => t.id === rt.id));

  return (
    <div className="fade-up space-y-4">
      <div className="surface rounded p-4 space-y-4">
        <div>
          <Label>game name</Label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Sunday Night at Yiayia's" className="input-field w-full px-4 py-3 rounded text-base mt-2" />
        </div>
        <div>
          <Label>target score</Label>
          <input type="number" value={target} onChange={e => setTarget(e.target.value)} className="input-field w-full px-4 py-3 rounded text-base mt-2" />
        </div>
      </div>

      <div className="section-label flex items-center justify-between">
        <span><span className="section-prefix">//</span> teams ({selectedTeams.length})</span>
        <span className="normal-case tracking-normal text-[10px]" style={{ color: "rgba(201,185,143,0.4)" }}>min. 2</span>
      </div>

      {selectedTeams.length > 0 && (
        <div className="space-y-2">
          {selectedTeams.map((t, i) => {
            const members = (t.member_ids || []).map(id => players.find(p => p.id === id)).filter(Boolean);
            return (
              <div key={t.id} className="surface p-4 rounded flex items-center justify-between fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                <div className="min-w-0 flex-1">
                  <div className="display-font text-2xl truncate" style={{ color: "#F5E9CF" }}>{t.name}</div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {members.length > 0 && (
                      <div className="flex -space-x-2">
                        {members.map(m => <Avatar key={m.id} player={m} size={20} />)}
                      </div>
                    )}
                    <span className="mono-font text-xs ml-1 truncate font-medium" style={{ color: "rgba(201,185,143,0.6)" }}>{members.map(m => m.name).join(" · ") || (t.fromRoster ? "—" : "ad-hoc")}</span>
                  </div>
                </div>
                <button onClick={() => removeSelected(t.id)} className="p-2" style={{ color: "rgba(201,185,143,0.4)" }}><X size={18} /></button>
              </div>
            );
          })}
        </div>
      )}

      {availableRosterTeams.length > 0 && (
        <div>
          <Label>quick-add from roster</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {availableRosterTeams.map(t => (
              <button key={t.id} onClick={() => addRosterTeam(t)} className="chip ui-font text-xs px-3 py-1.5 rounded-full font-medium">
                <Plus size={11} className="inline mr-1" />{t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!showAddTeam ? (
        <button onClick={() => setShowAddTeam(true)} className="btn-ghost mono-font w-full py-3 rounded text-xs font-medium uppercase tracking-[0.15em]">
          <Plus size={13} className="inline mr-2" />add ad-hoc team
        </button>
      ) : (
        <div className="surface-deeper rounded p-4 space-y-3 fade-up">
          <input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="team name..." className="input-field w-full px-4 py-3 rounded text-sm" />
          {players.length > 0 && (
            <div className="space-y-2">
              <div className="section-label">members (optional)</div>
              <div className="flex flex-wrap gap-2">
                {players.map(p => {
                  const sel = newTeamMembers.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => setNewTeamMembers(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} className={`ui-font text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium ${sel ? "chip-active" : "chip"}`}>
                      <Avatar player={p} size={20} />{p.name}{sel && <Check size={11} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <label className="flex items-center gap-2.5 mono-font text-xs cursor-pointer font-medium" style={{ color: "rgba(201,185,143,0.8)" }}>
            <input type="checkbox" checked={saveToRoster} onChange={e => setSaveToRoster(e.target.checked)} style={{ accentColor: "#D4AF37" }} /> save to roster
          </label>
          <div className="flex gap-2">
            <button onClick={() => { setShowAddTeam(false); setNewTeamName(""); setNewTeamMembers([]); }} className="btn-ghost mono-font flex-1 py-2.5 rounded text-xs font-medium uppercase tracking-wider">cancel</button>
            <button onClick={addAdHoc} disabled={!newTeamName.trim()} className="btn-primary mono-font flex-1 py-2.5 rounded text-xs font-semibold uppercase tracking-[0.15em]">add</button>
          </div>
        </div>
      )}

      <button onClick={startGame} disabled={!name.trim() || selectedTeams.length < 2 || starting} className="btn-gold mono-font w-full py-4 rounded text-sm font-semibold uppercase tracking-[0.18em]">
        {starting ? "dealing..." : "begin game →"}
      </button>
      {selectedTeams.length < 2 && <div className="mono-font text-xs text-center font-medium" style={{ color: "rgba(201,185,143,0.4)" }}>add at least two teams to begin</div>}
    </div>
  );
}

/* ============ GAME ============ */
function GameView({ game, setGames, setView, players, handleErr }) {
  const [showRoundForm, setShowRoundForm] = useState(false);
  const [editingRoundId, setEditingRoundId] = useState(null);

  const totals = computeTotals(game);
  const sortedTeams = [...game.teams].sort((a, b) => (totals[b.id] || 0) - (totals[a.id] || 0));
  const leader = sortedTeams[0];
  const leaderTotal = totals[leader.id] || 0;
  const reachedTarget = leaderTotal >= game.target_score;

  function patchGame(updater) {
    setGames(prev => prev.map(g => g.id === game.id ? updater(g) : g));
  }

  async function addRound(roundData) {
    try {
      const r = await api.send("POST", `/api/games/${game.id}/rounds`, roundData);
      patchGame(g => ({ ...g, rounds: [...(g.rounds || []), r.round] }));
      setShowRoundForm(false);
    } catch (e) { handleErr(e); }
  }
  async function updateRound(roundId, roundData) {
    try {
      const r = await api.send("PATCH", `/api/games/${game.id}/rounds/${roundId}`, roundData);
      patchGame(g => ({ ...g, rounds: (g.rounds || []).map(rr => rr.id === roundId ? r.round : rr) }));
      setEditingRoundId(null);
    } catch (e) { handleErr(e); }
  }
  async function removeRound(rid) {
    try {
      await api.send("DELETE", `/api/games/${game.id}/rounds/${rid}`);
      patchGame(g => ({ ...g, rounds: (g.rounds || []).filter(r => r.id !== rid) }));
    } catch (e) { handleErr(e); }
  }
  async function finishGame() {
    try {
      const r = await api.send("PATCH", `/api/games/${game.id}`, { finished_at: new Date().toISOString() });
      patchGame(g => ({ ...g, finished_at: r.game.finished_at }));
      setView("home");
    } catch (e) { handleErr(e); }
  }
  async function reopenGame() {
    try {
      await api.send("PATCH", `/api/games/${game.id}`, { finished_at: null });
      patchGame(g => ({ ...g, finished_at: null }));
    } catch (e) { handleErr(e); }
  }

  return (
    <div className="fade-up space-y-5">
      <div className="text-center">
        <div className="section-label">{game.finished_at ? "// final" : `// target ${game.target_score}`}</div>
        <h2 className="display-font text-5xl mt-2" style={{ color: "#F5E9CF" }}>{game.name}</h2>
      </div>

      <div className="surface-deeper rounded overflow-hidden">
        {sortedTeams.map((team, i) => {
          const total = totals[team.id] || 0;
          const pct = Math.min(100, (total / game.target_score) * 100);
          const isWinning = total >= game.target_score;
          const members = (team.member_ids || []).map(id => players.find(p => p.id === id)).filter(Boolean);
          return (
            <div key={team.id} className="px-5 py-4 border-b last:border-0" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
              <div className="flex items-baseline justify-between mb-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  {i === 0 && total > 0 && (
                    <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: "rgba(212,175,55,0.12)", border: "1px solid #D4AF37" }}>
                      <Crown size={12} style={{ color: "#F4CD5C" }} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="display-font text-3xl truncate" style={{ color: "#F5E9CF" }}>{team.name}</div>
                    {members.length > 0 && (
                      <div className="flex -space-x-1.5 mt-0.5">
                        {members.map(m => <Avatar key={m.id} player={m} size={16} />)}
                      </div>
                    )}
                  </div>
                </div>
                <span className="stat-num text-5xl flex-shrink-0 ml-2" style={isWinning ? { color: "#F4CD5C" } : { color: "#F5E9CF" }}>{total}</span>
              </div>
              <div className="h-1 rounded overflow-hidden progress-track">
                <div className={`h-full transition-all duration-700 ${isWinning ? "progress-fill-win" : "progress-fill"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {!game.finished_at && (
        <>
          {!showRoundForm && !editingRoundId ? (
            <button onClick={() => setShowRoundForm(true)} className="btn-gold mono-font w-full py-4 rounded text-sm font-semibold uppercase tracking-[0.18em]">
              <Plus size={15} className="inline mr-2" />record round {(game.rounds?.length || 0) + 1}
            </button>
          ) : showRoundForm ? (
            <RoundForm teams={game.teams} onCancel={() => setShowRoundForm(false)} onSubmit={addRound} roundNumber={(game.rounds?.length || 0) + 1} />
          ) : null}

          {reachedTarget && (
            <button onClick={finishGame} className="btn-primary mono-font w-full py-3 rounded text-xs font-semibold uppercase tracking-[0.15em]">
              <Crown size={14} className="inline mr-2" style={{ color: "#F4CD5C" }} />finish · {leader.name} wins
            </button>
          )}
        </>
      )}

      {game.finished_at && (
        <button onClick={reopenGame} className="btn-ghost mono-font w-full py-3 rounded text-xs font-semibold tracking-[0.18em] uppercase">
          reopen game
        </button>
      )}

      {(game.rounds?.length || 0) > 0 && (
        <div className="space-y-3">
          <div className="ornament-divider section-label"><span><span className="section-prefix">//</span> round log</span></div>
          <div className="space-y-2">
            {[...(game.rounds || [])].reverse().map((r, idx) => {
              const roundNum = game.rounds.length - idx;
              if (editingRoundId === r.id) {
                return (
                  <RoundForm
                    key={r.id}
                    teams={game.teams}
                    initialScores={r.scores}
                    onCancel={() => setEditingRoundId(null)}
                    onSubmit={(data) => updateRound(r.id, data)}
                    roundNumber={roundNum}
                    editing
                  />
                );
              }
              return (
                <div key={r.id} className="surface p-4 rounded">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="stat-num text-xl gold-text-bright">{roundNum}</div>
                      <div className="section-label">round {r.edited_at && <span style={{ color: "rgba(201,185,143,0.4)" }}>· edited</span>}</div>
                    </div>
                    {!game.finished_at && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingRoundId(r.id)} className="p-1.5" style={{ color: "rgba(212,175,55,0.7)" }}><Edit3 size={13} /></button>
                        <button onClick={() => { if (confirm("Delete this round?")) removeRound(r.id); }} className="p-1.5" style={{ color: "rgba(201,185,143,0.4)" }}><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {game.teams.map(t => {
                      const s = r.scores[t.id] || { biriba: 0, outcome: 0, deck: 0 };
                      const sum = (s.biriba || 0) + (s.outcome || 0) + (s.deck || 0);
                      return (
                        <div key={t.id} className="flex items-center justify-between text-sm">
                          <span className="display-font text-xl truncate flex-shrink min-w-0 mr-2" style={{ color: "rgba(245,233,207,0.95)" }}>{t.name}</span>
                          <div className="flex items-center gap-1.5 mono-font text-[11px] flex-shrink-0">
                            <ScoreChip label="B" value={s.biriba || 0} variant="emerald" />
                            <ScoreChip label="O" value={s.outcome || 0} variant="cream" />
                            <ScoreChip label="D" value={s.deck || 0} variant="gold" />
                            <span className="stat-num text-xl ml-1" style={{ color: "#F5E9CF", minWidth: 40, textAlign: "right" }}>{sum}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreChip({ label, value, variant }) {
  const variants = {
    emerald: { bg: "rgba(34,197,94,0.12)", text: "#86EFAC", border: "rgba(34,197,94,0.3)" },
    cream: { bg: "rgba(245,233,207,0.08)", text: "#F5E9CF", border: "rgba(245,233,207,0.2)" },
    gold: { bg: "rgba(212,175,55,0.12)", text: "#F4CD5C", border: "rgba(212,175,55,0.35)" },
  };
  const c = variants[variant];
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm tabular-nums font-medium" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      <span className="opacity-70 font-semibold">{label}</span>
      <span>{value}</span>
    </span>
  );
}

/* ============ ROUND FORM ============ */
function RoundForm({ teams, onCancel, onSubmit, roundNumber, initialScores, editing }) {
  const initial = {};
  teams.forEach(t => {
    const init = initialScores?.[t.id];
    initial[t.id] = {
      biriba: init?.biriba !== undefined ? String(init.biriba) : "",
      outcome: init?.outcome !== undefined ? String(init.outcome) : "",
      deck: init?.deck !== undefined ? String(init.deck) : "",
    };
  });
  const [scores, setScores] = useState(initial);

  function update(teamId, field, value) {
    setScores(prev => ({ ...prev, [teamId]: { ...prev[teamId], [field]: value } }));
  }
  function submit() {
    const cleaned = {};
    Object.keys(scores).forEach(tid => {
      cleaned[tid] = {
        biriba: Number(scores[tid].biriba) || 0,
        outcome: Number(scores[tid].outcome) || 0,
        deck: Number(scores[tid].deck) || 0,
      };
    });
    onSubmit({ scores: cleaned });
  }

  return (
    <div className="surface-deeper rounded p-5 space-y-4 fade-up">
      <div className="text-center">
        <div className="section-label">// round {roundNumber}</div>
        <div className="display-font text-3xl mt-1" style={{ color: "#F5E9CF" }}>{editing ? "edit scores" : "enter scores"}</div>
      </div>
      <div className="grid grid-cols-3 gap-2 mono-font text-[10px] uppercase tracking-[0.18em] text-center font-medium">
        <div style={{ color: "#86EFAC" }}>biriba</div>
        <div style={{ color: "#F5E9CF" }}>out / penalty</div>
        <div style={{ color: "#F4CD5C" }}>deck count</div>
      </div>
      <div className="space-y-3">
        {teams.map(t => {
          const s = scores[t.id];
          const sum = (Number(s.biriba) || 0) + (Number(s.outcome) || 0) + (Number(s.deck) || 0);
          return (
            <div key={t.id} className="space-y-2 pb-3 border-b last:border-0" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
              <div className="flex items-baseline justify-between">
                <span className="display-font text-2xl" style={{ color: "#F5E9CF" }}>{t.name}</span>
                <span className="stat-num text-2xl gold-text-bright">{sum}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" value={s.biriba} onChange={e => update(t.id, "biriba", e.target.value)} placeholder="0" className="input-field px-3 py-2.5 rounded text-base text-center" />
                <input type="number" value={s.outcome} onChange={e => update(t.id, "outcome", e.target.value)} placeholder="0" className="input-field px-3 py-2.5 rounded text-base text-center" />
                <input type="number" value={s.deck} onChange={e => update(t.id, "deck", e.target.value)} placeholder="0" className="input-field px-3 py-2.5 rounded text-base text-center" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="btn-ghost mono-font flex-1 py-3 rounded text-xs font-medium uppercase tracking-wider">cancel</button>
        <button onClick={submit} className="btn-gold mono-font flex-1 py-3 rounded text-xs font-semibold uppercase tracking-[0.15em]">{editing ? "save changes" : "save round"}</button>
      </div>
    </div>
  );
}

/* ============ HISTORY ============ */
function HistoryView({ players, games, setView, setSelectedGameId, setCurrentGameId, setSelectedPlayerId, setGames, handleErr }) {
  const [tab, setTab] = useState("teams");

  if (games.length === 0) return <EmptyState text="No games yet. Start one to begin building your history." />;

  async function deleteGame(id) {
    try {
      await api.send("DELETE", `/api/games/${id}`);
      setGames(prev => prev.filter(g => g.id !== id));
    } catch (e) { handleErr(e); }
  }

  const teamStats = {};
  games.forEach(g => {
    if (!g.finished_at) return;
    const totals = computeTotals(g);
    const winner = getWinner(g);
    g.teams.forEach(t => {
      if (!teamStats[t.id]) teamStats[t.id] = { name: t.name, member_ids: t.member_ids, wins: 0, plays: 0, totalPoints: 0 };
      teamStats[t.id].plays += 1;
      teamStats[t.id].totalPoints += totals[t.id] || 0;
      if (winner?.id === t.id) teamStats[t.id].wins += 1;
    });
  });
  const teamLeaderboard = Object.values(teamStats).sort((a, b) => b.wins - a.wins || b.totalPoints - a.totalPoints);

  const playerStats = {};
  players.forEach(p => { playerStats[p.id] = { player: p, wins: 0, plays: 0, totalPoints: 0 }; });
  games.forEach(g => {
    if (!g.finished_at) return;
    const totals = computeTotals(g);
    const winner = getWinner(g);
    g.teams.forEach(t => {
      const memberIds = t.member_ids || [];
      memberIds.forEach(mid => {
        if (!playerStats[mid]) return;
        playerStats[mid].plays += 1;
        playerStats[mid].totalPoints += totals[t.id] || 0;
        if (winner?.id === t.id) playerStats[mid].wins += 1;
      });
    });
  });
  const playerLeaderboard = Object.values(playerStats).filter(s => s.plays > 0).sort((a, b) => b.wins - a.wins || b.totalPoints - a.totalPoints);

  const medalColors = ["#F4CD5C", "#E8E4D0", "#C68B5C"];

  return (
    <div className="fade-up space-y-4">
      <div className="tab-bar flex gap-1 p-1 rounded">
        <button onClick={() => setTab("teams")} className={`flex-1 py-2 mono-font text-xs font-medium rounded transition uppercase tracking-[0.15em] ${tab === "teams" ? "tab-active" : "tab-inactive"}`}>teams</button>
        <button onClick={() => setTab("players")} className={`flex-1 py-2 mono-font text-xs font-medium rounded transition uppercase tracking-[0.15em] ${tab === "players" ? "tab-active" : "tab-inactive"}`}>players</button>
        <button onClick={() => setTab("games")} className={`flex-1 py-2 mono-font text-xs font-medium rounded transition uppercase tracking-[0.15em] ${tab === "games" ? "tab-active" : "tab-inactive"}`}>games</button>
      </div>

      {tab === "teams" && (
        teamLeaderboard.length > 0 ? (
          <div className="surface rounded overflow-hidden">
            {teamLeaderboard.map((s, i) => {
              const members = (s.member_ids || []).map(id => players.find(p => p.id === id)).filter(Boolean);
              return (
                <div key={i} className="px-5 py-3.5 flex items-center justify-between border-b last:border-0" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded flex items-center justify-center stat-num text-base font-semibold flex-shrink-0" style={{
                      background: i < 3 ? `${medalColors[i]}1a` : "rgba(15,61,36,0.5)",
                      border: `1px solid ${i < 3 ? medalColors[i] : "rgba(212,175,55,0.2)"}`,
                      color: i < 3 ? medalColors[i] : "rgba(245,233,207,0.7)",
                    }}>{i + 1}</div>
                    <div className="min-w-0">
                      <div className="display-font text-2xl truncate" style={{ color: "#F5E9CF" }}>{s.name}</div>
                      {members.length > 0 && (
                        <div className="flex -space-x-1.5 mt-0.5">
                          {members.map(m => <Avatar key={m.id} player={m} size={16} />)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="stat-num text-2xl" style={{ color: "#F5E9CF" }}>{s.wins}<span className="mono-font text-xs ml-1 font-medium" style={{ color: "rgba(201,185,143,0.5)" }}>/ {s.plays}</span></div>
                    <div className="mono-font text-[10px] uppercase tracking-wider font-medium" style={{ color: "rgba(201,185,143,0.5)" }}>wins</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <EmptyState text="No finished team games yet." />
      )}

      {tab === "players" && (
        playerLeaderboard.length > 0 ? (
          <div className="surface rounded overflow-hidden">
            {playerLeaderboard.map((s, i) => (
              <button key={s.player.id} onClick={() => { setSelectedPlayerId(s.player.id); setView("playerStats"); }} className="w-full px-5 py-3 flex items-center justify-between border-b last:border-0 hover:bg-white/5 transition text-left" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 stat-num text-lg font-semibold flex-shrink-0" style={{ color: i < 3 ? medalColors[i] : "rgba(201,185,143,0.5)" }}>{i + 1}</div>
                  <Avatar player={s.player} size={38} />
                  <div className="min-w-0">
                    <div className="display-font text-xl truncate" style={{ color: "#F5E9CF" }}>{s.player.name}</div>
                    <div className="mono-font text-[10px] font-medium" style={{ color: "rgba(201,185,143,0.6)" }}>{s.totalPoints.toLocaleString()} pts total</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="stat-num text-2xl" style={{ color: "#F5E9CF" }}>{s.wins}<span className="mono-font text-xs ml-1 font-medium" style={{ color: "rgba(201,185,143,0.5)" }}>/ {s.plays}</span></div>
                  <div className="mono-font text-[10px] uppercase tracking-wider font-medium" style={{ color: "rgba(201,185,143,0.5)" }}>wins</div>
                </div>
              </button>
            ))}
          </div>
        ) : <EmptyState text="No player stats yet — finish a game with rostered teams." />
      )}

      {tab === "games" && (
        <div className="space-y-2">
          {games.map((g, i) => {
            const winner = getWinner(g);
            const totals = computeTotals(g);
            return (
              <div key={g.id} className="surface p-4 rounded flex items-center justify-between fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                <button onClick={() => {
                  if (g.finished_at) { setSelectedGameId(g.id); setView("gameDetail"); }
                  else { setCurrentGameId(g.id); setView("game"); }
                }} className="flex-1 text-left min-w-0">
                  <div className="display-font text-2xl truncate" style={{ color: "#F5E9CF" }}>{g.name}</div>
                  <div className="mono-font text-xs flex items-center gap-2 mt-0.5 flex-wrap font-medium" style={{ color: "rgba(201,185,143,0.6)" }}>
                    <Calendar size={11} />{formatDate(g.created_at)}
                    <span style={{ color: "#D4AF37" }}>·</span>
                    {g.finished_at ? <span className="flex items-center gap-1"><Crown size={11} style={{ color: "#F4CD5C" }} /> {winner?.name} ({totals[winner?.id] || 0})</span> : <span style={{ color: "#22C55E" }}>● in progress</span>}
                  </div>
                </button>
                <button onClick={() => { if (confirm(`Delete "${g.name}"?`)) deleteGame(g.id); }} className="p-2 ml-1" style={{ color: "rgba(201,185,143,0.4)" }}><Trash2 size={14} /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============ GAME DETAIL ============ */
function GameDetailView({ game, players, setView, setCurrentGameId }) {
  if (!game) return <EmptyState text="Game not found." />;
  const totals = computeTotals(game);
  const sortedTeams = [...game.teams].sort((a, b) => (totals[b.id] || 0) - (totals[a.id] || 0));
  const winner = sortedTeams[0];

  return (
    <div className="fade-up space-y-5">
      <div className="text-center">
        <div className="section-label">// {formatDate(game.created_at)}</div>
        <h2 className="display-font text-5xl mt-2" style={{ color: "#F5E9CF" }}>{game.name}</h2>
        <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded" style={{ background: "rgba(212,175,55,0.12)", border: "1px solid #D4AF37" }}>
          <Crown size={14} style={{ color: "#F4CD5C" }} />
          <span className="display-font text-xl" style={{ color: "#F5E9CF" }}>{winner.name}</span>
          <span className="stat-num text-lg" style={{ color: "rgba(245,233,207,0.7)" }}>· {totals[winner.id] || 0}</span>
        </div>
      </div>

      <div className="surface rounded overflow-hidden">
        {sortedTeams.map((team, i) => {
          const members = (team.member_ids || []).map(id => players.find(p => p.id === id)).filter(Boolean);
          return (
            <div key={team.id} className="px-5 py-3.5 flex items-center justify-between border-b last:border-0" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="stat-num text-2xl w-6 flex-shrink-0" style={{ color: "rgba(201,185,143,0.4)" }}>{i + 1}</div>
                <div className="min-w-0">
                  <div className="display-font text-2xl truncate" style={{ color: "#F5E9CF" }}>{team.name}</div>
                  {members.length > 0 && (
                    <div className="flex -space-x-1.5 mt-0.5">
                      {members.map(m => <Avatar key={m.id} player={m} size={16} />)}
                    </div>
                  )}
                </div>
              </div>
              <span className="stat-num text-3xl flex-shrink-0" style={{ color: "#F5E9CF" }}>{totals[team.id] || 0}</span>
            </div>
          );
        })}
      </div>

      <button onClick={() => { setCurrentGameId(game.id); setView("game"); }} className="btn-ghost mono-font w-full py-3 rounded text-xs font-medium uppercase tracking-[0.15em]">
        view round-by-round →
      </button>
    </div>
  );
}

/* ============ HELPERS ============ */
function Label({ children }) { return <div className="section-label"><span className="section-prefix">//</span> {children}</div>; }
function EmptyState({ text }) {
  return (
    <div className="surface rounded py-12 px-6 text-center">
      <div className="text-2xl mb-3" style={{ color: "rgba(212,175,55,0.4)" }}>♠ ♥ ♦ ♣</div>
      <div className="mono-font text-xs font-medium" style={{ color: "rgba(201,185,143,0.7)" }}>{text}</div>
    </div>
  );
}
function computeTotals(game) {
  const t = {};
  (game.teams || []).forEach(team => { t[team.id] = 0; });
  (game.rounds || []).forEach(r => {
    Object.keys(r.scores || {}).forEach(tid => {
      const s = r.scores[tid];
      t[tid] = (t[tid] || 0) + (s.biriba || 0) + (s.outcome || 0) + (s.deck || 0);
    });
  });
  return t;
}
function getWinner(game) {
  const totals = computeTotals(game);
  let best = null;
  (game.teams || []).forEach(t => {
    if (!best || (totals[t.id] || 0) > (totals[best.id] || 0)) best = { ...t, total: totals[t.id] || 0 };
  });
  return best;
}
function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
