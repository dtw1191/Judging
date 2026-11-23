/* (기존 최상단 부분 동일) */
:root {
    --primary-gradient: linear-gradient(135deg, #9b59b6 0%, #ff1493 100%);
    --bg-dark: #111115;
    --card-bg: #1c1c24;
    --text-main: #ffffff;
    --text-muted: #a0a0b5;
    --neon-border: #da70d6;
    --neon-glow: 0 0 12px rgba(255, 20, 147, 0.6);
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: var(--bg-dark);
    color: var(--text-main);
    position: relative;
    min-height: 100vh;
}

body::before {
    content: "";
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background-image: 
        radial-gradient(circle 4px at 15% 25%, #00ffff 100%, transparent 100%),
        radial-gradient(circle 5px at 85% 15%, #ff00ff 100%, transparent 100%),
        radial-gradient(circle 4px at 30% 80%, #ffff00 100%, transparent 100%),
        radial-gradient(circle 6px at 80% 85%, #ff8800 100%, transparent 100%),
        radial-gradient(circle 3px at 50% 10%, #00ffff 100%, transparent 100%),
        radial-gradient(circle 5px at 10% 60%, #ff1493 100%, transparent 100%),
        radial-gradient(circle 4px at 90% 50%, #ffff00 100%, transparent 100%);
    opacity: 0.7;
    z-index: -1;
    pointer-events: none;
}

header {
    background: #000;
    border-bottom: 2px solid var(--neon-border);
    box-shadow: var(--neon-glow);
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;
}

header h1 {
    font-family: 'Black Han Sans', sans-serif;
    font-size: 1.5rem;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 1px;
}

#judge-info {
    font-weight: bold;
    font-size: 0.9rem;
    background: var(--primary-gradient);
    color: white;
    padding: 4px 10px;
    border-radius: 20px;
}

.container {
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
}

h2 {
    font-family: 'Black Han Sans', sans-serif;
    font-size: 1.6rem;
    margin-bottom: 10px;
    color: #fff;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    letter-spacing: 1px;
}

.desc {
    color: var(--text-muted);
    margin-bottom: 25px;
    font-size: 0.95rem;
}

.screen {
    display: none;
    animation: fadeIn 0.4s ease-in-out;
}

.screen.active {
    display: block;
}

@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
}

.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.grid-btn {
    background-color: var(--card-bg);
    border: 1px solid #333;
    color: #fff;
    border-radius: 10px;
    padding: 20px 10px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

.grid-btn:hover, .grid-btn:active {
    background: var(--primary-gradient);
    border-color: transparent;
    transform: translateY(-2px);
    box-shadow: var(--neon-glow);
}

.divider {
    border: none;
    border-top: 1px dashed #444;
    margin: 30px 0 20px 0;
}

.team-input-group {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    background: var(--card-bg);
    padding: 10px 15px;
    border-radius: 10px;
    border: 1px solid #333;
}

.team-input-group label {
    width: 60px;
    color: var(--neon-border);
    font-weight: bold;
    font-size: 0.9rem;
}

.team-input-group input {
    flex: 1;
    padding: 10px;
    background-color: #111;
    border: 1px solid #444;
    color: white;
    border-radius: 6px;
    outline: none;
    font-size: 1rem;
    font-family: inherit;
}

.team-input-group input:focus {
    border-color: #ff1493;
    box-shadow: 0 0 8px rgba(255, 20, 147, 0.4);
}

.admin-input {
    width: 100%;
    padding: 12px;
    background-color: #111;
    border: 1px solid #444;
    color: white;
    border-radius: 6px;
    font-size: 1rem;
}

.sticky-bottom {
    position: sticky;
    bottom: 0;
    background-color: var(--bg-dark);
    padding: 15px 0;
    border-top: 1px dashed #444;
    margin-top: 20px;
    z-index: 10;
}

#team-list {
    list-style: none;
}

#team-list li {
    background: var(--card-bg);
    border: 1px solid #333;
    margin-bottom: 12px;
    padding: 18px 20px;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: bold;
    transition: all 0.2s;
}

#team-list li:active {
    transform: scale(0.98);
}

.status-badge {
    font-size: 0.85rem;
    padding: 6px 12px;
    border-radius: 20px;
    background-color: #333;
    color: #aaa;
    font-weight: normal;
}

.status-badge.completed {
    background: var(--primary-gradient);
    color: white;
    font-weight: bold;
    box-shadow: var(--neon-glow);
}

.form-group {
    margin-bottom: 20px;
    background: var(--card-bg);
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #333;
}

.form-group label {
    display: block;
    margin-bottom: 12px;
    font-weight: bold;
    color: #da70d6;
}

.form-group select, .form-group textarea {
    width: 100%;
    padding: 15px;
    border: 1px solid #444;
    border-radius: 8px;
    font-size: 1.1rem;
    font-family: inherit;
    background-color: #111;
    color: white;
    outline: none;
}

.form-group select:focus, .form-group textarea:focus {
    border-color: #ff1493;
    box-shadow: 0 0 8px rgba(255, 20, 147, 0.3);
}

.button-group {
    display: flex;
    gap: 15px;
    margin-top: 25px;
}

.btn-primary, .btn-secondary {
    flex: 1;
    padding: 18px;
    border: none;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background: var(--primary-gradient);
    color: white;
    box-shadow: var(--neon-glow);
}

.btn-primary:active {
    transform: scale(0.95);
}

.btn-secondary {
    background-color: #333;
    color: white;
}

.full-width {
    width: 100%;
}

.table-responsive {
    overflow-x: auto;
    background: var(--card-bg);
    border-radius: 10px;
    border: 1px solid #333;
    /* 스크롤 방지를 위해 min-width 600px 제거 */
}

.results-table {
    width: 100%;
    border-collapse: collapse;
}

/* 일반 셀 크기 최소화 (가로 스크롤 방지용) */
.results-table th, .results-table td {
    padding: 6px 2px;
    text-align: center;
    border-bottom: 1px solid #333;
    white-space: nowrap;
    font-size: 0.75rem; 
}

.results-table th {
    background-color: #111;
    color: #da70d6;
    font-weight: bold;
}

.highlight-col {
    background-color: rgba(255, 20, 147, 0.1);
}

/* 합계와 순위는 기존 크기 유지 */
.results-table th.highlight-col,
.results-table td.highlight-col,
.results-table th.rank-col,
.results-table td.rank-col {
    font-size: 1.1rem;
    padding: 8px 4px;
}

.results-table td.highlight-col {
    font-weight: bold;
    color: #ff69b4;
}

.results-table td.rank-col {
    font-weight: bold;
    color: #fff;
}

.excluded-score {
    color: #ff4757;
    text-decoration: line-through;
    opacity: 0.7;
}
