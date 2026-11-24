// ==========================================
// 1. 여기에 복사한 구글 Apps Script 웹 앱 URL을 붙여넣으세요
// ==========================================
const GAS_URL = "https://script.google.com/macros/s/AKfycbxOU8ccKYbO1Evogw1g1W3JiangoZCwJ4Vmpf-p80oBj0OvY9F4sbImFB0NSEdxKjw7PQ/exec";

const ADMIN_CODE = '11251125';

let TOTAL_JUDGES = 9;
let TOTAL_TEAMS = 30;
let judgePasswords = {};
let teamNames = {};
let allEvaluations = {};

let currentJudgeId = null;
let currentTeamId = null;
let currentScreen = 'selectJudge';
let isEventSetup = false;
let resultsRefreshTimer = null;

const screens = {
    selectJudge: document.getElementById('screen-select-judge'),
    admin: document.getElementById('screen-admin'),
    teamRegister: document.getElementById('screen-team-register'),
    teamList: document.getElementById('screen-team-list'),
    evaluation: document.getElementById('screen-evaluation'),
    results: document.getElementById('screen-results')
};

const judgeInfo = document.getElementById('judge-info');
const teamListUl = document.getElementById('team-list');
const progressText = document.getElementById('progress-text');
const evalForm = document.getElementById('eval-form');
const evalTeamTitle = document.getElementById('eval-team-title');
const resultsTbody = document.getElementById('results-tbody');
const resultsThead = document.getElementById('results-thead');
const teamNameInputsContainer = document.getElementById('team-name-inputs');

// ==========================================
// 2. 구글 시트 데이터 통신 함수
// ==========================================
async function loadAllData() {
    try {
        const response = await fetch(GAS_URL);
        const result = await response.json();

        if (result.status === 'success') {
            TOTAL_JUDGES = result.settings.totalJudges || 9;
            TOTAL_TEAMS = result.settings.totalTeams || 30;
            judgePasswords = result.settings.judgePasswords || {};
            teamNames = result.teamNames || {};
            allEvaluations = result.evaluations || {};

            for (let i = 1; i <= Math.max(TOTAL_JUDGES, 20); i++) {
                if (!judgePasswords[i]) judgePasswords[i] = '1234';
            }
            for (let i = 1; i <= TOTAL_TEAMS; i++) {
                if (!teamNames[i]) teamNames[i] = `팀 ${i}`;
            }

            createJudgeButtons();
            if (currentScreen === 'teamList' && currentJudgeId) renderTeamList();
            if (currentScreen === 'results') generateResults();
        }
    } catch (err) {
        console.error('데이터 불러오기 실패:', err);
        alert('구글 시트에서 데이터를 불러오지 못했습니다. URL 설정을 확인해주세요.');
    }
}

async function postToGas(payload) {
    // CORS 오류 방지를 위해 text/plain으로 전송
    const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (result.status !== 'success') {
        throw new Error(result.message || '저장 실패');
    }
    return result;
}

// ==========================================
// 3. 초기화 및 화면 제어
// ==========================================
async function init() {
    setupEventListeners();
    await loadAllData();
    checkLoginFromUrl();
}

function showScreen(screenName) {
    currentScreen = screenName;
    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.remove('active');
    });
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
        window.scrollTo(0, 0);
    }

    // 결과 화면일 때만 10초마다 자동 새로고침
    if (resultsRefreshTimer) {
        clearInterval(resultsRefreshTimer);
        resultsRefreshTimer = null;
    }
    if (screenName === 'results') {
        resultsRefreshTimer = setInterval(loadAllData, 10000);
    }
}

function checkLoginFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const judgeParam = parseInt(urlParams.get('judge'));

    if (judgeParam && judgeParam >= 1 && judgeParam <= TOTAL_JUDGES) {
        loginAsJudge(judgeParam);
    } else {
        showScreen('selectJudge');
    }
}

// ==========================================
// 4. 화면 렌더링 함수
// ==========================================
function createJudgeButtons() {
    const container = document.getElementById('judge-buttons');
    if (!container) return;

    container.innerHTML = '';
    for (let i = 1; i <= TOTAL_JUDGES; i++) {
        const btn = document.createElement('button');
        btn.className = 'grid-btn';
        btn.textContent = `심사위원 ${i}`;
        btn.onclick = () => {
            const pw = prompt(`심사위원 ${i}의 접근 코드 (4자리)를 입력하세요.`);
            if (pw === judgePasswords[i]) {
                loginAsJudge(i);
            } else if (pw !== null) {
                alert('비밀번호가 일치하지 않습니다.');
            }
        };
        container.appendChild(btn);
    }
}

function loginAsJudge(judgeId) {
    currentJudgeId = judgeId;
    judgeInfo.textContent = `심사위원 ${judgeId}`;
    judgeInfo.style.display = 'inline-block';

    renderTeamList();
    showScreen('teamList');
}

function renderAdminPasswordInputs() {
    const container = document.getElementById('admin-judge-pw-container');
    container.innerHTML = '';

    const currentInputJudges = parseInt(document.getElementById('input-total-judges').value) || TOTAL_JUDGES;

    for (let i = 1; i <= currentInputJudges; i++) {
        const val = judgePasswords[i] || '1234';
        container.innerHTML += `
            <div class="team-input-group">
                <label>심사위원 ${i}</label>
                <input type="text" id="input-pw-${i}" value="${val}" maxlength="4" required>
            </div>
        `;
    }
}

function renderTeamRegisterInputs() {
    if (!teamNameInputsContainer) return;

    teamNameInputsContainer.innerHTML = '';
    for (let i = 1; i <= TOTAL_TEAMS; i++) {
        const div = document.createElement('div');
        div.className = 'team-input-group';
        div.innerHTML = `
            <label>${i}번</label>
            <input type="text" id="input-team-name-${i}" value="${teamNames[i]}" required>
        `;
        teamNameInputsContainer.appendChild(div);
    }
}

function renderTeamList() {
    teamListUl.innerHTML = '';
    let completedCount = 0;
    const myEvals = allEvaluations[`judge_${currentJudgeId}`] || {};

    for (let i = 1; i <= TOTAL_TEAMS; i++) {
        const li = document.createElement('li');
        const isCompleted = myEvals[i] != null;

        if (isCompleted) completedCount++;

        li.innerHTML = `
            <span>${teamNames[i]}</span>
            <span class="status-badge ${isCompleted ? 'completed' : ''}">
                ${isCompleted ? '심사완료' : '대기중'}
            </span>
        `;
        li.onclick = () => openEvaluation(i);
        teamListUl.appendChild(li);
    }

    progressText.textContent = `(${completedCount}/${TOTAL_TEAMS})`;
}

function openEvaluation(teamId) {
    currentTeamId = teamId;
    evalTeamTitle.textContent = `${teamNames[teamId]} 무대 평가`;

    const myEvals = allEvaluations[`judge_${currentJudgeId}`] || {};
    const data = myEvals[teamId] || { score: '', comment: '' };
    document.getElementById('score').value = data.score;
    document.getElementById('comment').value = data.comment;

    showScreen('evaluation');
}

function generateResults() {
    let theadHtml = `<tr><th>팀명</th>`;
    for (let i = 1; i <= TOTAL_JUDGES; i++) {
        theadHtml += `<th>${i}</th>`;
    }
    theadHtml += `<th class="highlight-col">합계</th><th class="rank-col">순위</th></tr>`;
    resultsThead.innerHTML = theadHtml;

    resultsTbody.innerHTML = '';

    let teamsData = [];
    for (let i = 1; i <= TOTAL_TEAMS; i++) {
        teamsData.push({
            id: i,
            scores: new Array(TOTAL_JUDGES).fill(null),
            excludedIndices: [],
            total: 0,
            rank: 1
        });
    }

    for (let j = 1; j <= TOTAL_JUDGES; j++) {
        const judgeData = allEvaluations[`judge_${j}`];
        if (judgeData) {
            for (let t = 1; t <= TOTAL_TEAMS; t++) {
                if (judgeData[t] && judgeData[t].score) {
                    teamsData[t - 1].scores[j - 1] = judgeData[t].score;
                }
            }
        }
    }

    teamsData.forEach(team => {
        let validScores = team.scores
            .map((score, index) => ({ score, index }))
            .filter(item => item.score !== null);

        if (validScores.length > 2) {
            validScores.sort((a, b) => a.score - b.score);
            const minItem = validScores[0];
            const maxItem = validScores[validScores.length - 1];
            team.excludedIndices.push(minItem.index, maxItem.index);

            for (let i = 1; i < validScores.length - 1; i++) {
                team.total += validScores[i].score;
            }
        } else {
            team.total = validScores.reduce((sum, item) => sum + item.score, 0);
        }
    });

    let sortedTeams = [...teamsData].sort((a, b) => b.total - a.total);
    let currentRank = 1;

    sortedTeams.forEach((team, index) => {
        if (index > 0 && team.total < sortedTeams[index - 1].total) {
            currentRank = index + 1;
        }
        teamsData[team.id - 1].rank = currentRank;
    });

    teamsData.forEach(team => {
        const tr = document.createElement('tr');
        let html = `<td><strong>${teamNames[team.id]}</strong></td>`;

        for (let j = 0; j < TOTAL_JUDGES; j++) {
            let score = team.scores[j];
            let cellText = score !== null ? score : '-';
            let isExcluded = team.excludedIndices.includes(j);

            if (isExcluded) {
                html += `<td class="excluded-score">${cellText}</td>`;
            } else {
                html += `<td>${cellText}</td>`;
            }
        }

        html += `<td class="highlight-col">${team.total}</td>`;
        html += `<td class="rank-col">${team.rank}</td>`;

        tr.innerHTML = html;
        resultsTbody.appendChild(tr);
    });
}

// ==========================================
// 5. 버튼 이벤트 등록 (구글 시트 저장)
// ==========================================
function setupEventListeners() {
    if (isEventSetup) return;
    isEventSetup = true;

    // 관리자 모드 진입
    const btnAdminMode = document.getElementById('btn-admin-mode');
    if (btnAdminMode) {
        btnAdminMode.addEventListener('click', () => {
            const code = prompt('관리자 코드를 입력하세요.');
            if (code === ADMIN_CODE) {
                document.getElementById('input-total-judges').value = TOTAL_JUDGES;
                document.getElementById('input-total-teams').value = TOTAL_TEAMS;
                renderAdminPasswordInputs();
                showScreen('admin');
            } else if (code !== null) {
                alert('코드번호가 일치하지 않습니다.');
            }
        });
    }

    const inputTotalJudges = document.getElementById('input-total-judges');
    if (inputTotalJudges) {
        inputTotalJudges.addEventListener('input', renderAdminPasswordInputs);
    }

    // 관리자 설정 저장
    const formAdmin = document.getElementById('admin-form');
    if (formAdmin) {
        formAdmin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const saveBtn = document.getElementById('btn-save-admin');
            saveBtn.disabled = true;
            saveBtn.textContent = '저장 중...';

            const newJudges = parseInt(document.getElementById('input-total-judges').value);
            const newTeams = parseInt(document.getElementById('input-total-teams').value);
            const newPasswords = { ...judgePasswords };

            for (let i = 1; i <= newJudges; i++) {
                const pwInput = document.getElementById(`input-pw-${i}`);
                if (pwInput) newPasswords[i] = pwInput.value.trim();
            }

            try {
                await postToGas({
                    action: 'saveSettings',
                    totalJudges: newJudges,
                    totalTeams: newTeams,
                    judgePasswords: newPasswords
                });
                await loadAllData();
                alert('시스템 설정이 구글 시트에 저장되었습니다.');
                showScreen('selectJudge');
            } catch (err) {
                alert('저장 중 오류가 발생했습니다: ' + err.message);
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = '저장하기';
            }
        });
    }

    const btnCancelAdmin = document.getElementById('btn-cancel-admin');
    if (btnCancelAdmin) {
        btnCancelAdmin.addEventListener('click', () => showScreen('selectJudge'));
    }

    // 팀 이름 등록 진입
    const btnRegister = document.getElementById('btn-register-teams');
    if (btnRegister) {
        btnRegister.addEventListener('click', () => {
            const code = prompt('팀 등록을 위한 코드번호를 입력하세요.');
            if (code === ADMIN_CODE) {
                renderTeamRegisterInputs();
                showScreen('teamRegister');
            } else if (code !== null) {
                alert('코드번호가 일치하지 않습니다.');
            }
        });
    }

    const btnCancelReg = document.getElementById('btn-cancel-register');
    if (btnCancelReg) {
        btnCancelReg.addEventListener('click', () => showScreen('selectJudge'));
    }

    // 팀 이름 저장
    const formRegister = document.getElementById('team-register-form');
    if (formRegister) {
        formRegister.addEventListener('submit', async (e) => {
            e.preventDefault();
            const saveBtn = document.getElementById('btn-save-teams');
            saveBtn.disabled = true;
            saveBtn.textContent = '저장 중...';

            const newTeamNames = {};
            for (let i = 1; i <= TOTAL_TEAMS; i++) {
                const inputElement = document.getElementById(`input-team-name-${i}`);
                if (inputElement) {
                    const inputVal = inputElement.value.trim();
                    newTeamNames[i] = inputVal || `팀 ${i}`;
                }
            }

            try {
                await postToGas({
                    action: 'saveTeamNames',
                    teamNames: newTeamNames
                });
                await loadAllData();
                alert('참가팀 이름이 구글 시트에 저장되었습니다.');
                showScreen('selectJudge');
            } catch (err) {
                alert('저장 중 오류가 발생했습니다: ' + err.message);
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = '저장하기';
            }
        });
    }

    const btnCancel = document.getElementById('btn-cancel');
    if (btnCancel) {
        btnCancel.addEventListener('click', () => showScreen('teamList'));
    }

    // 개별 팀 평가 저장
    if (evalForm) {
        evalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const saveBtn = document.getElementById('btn-save');
            saveBtn.disabled = true;
            saveBtn.textContent = '저장 중...';

            const score = parseInt(document.getElementById('score').value);
            const comment = document.getElementById('comment').value;

            try {
                await postToGas({
                    action: 'saveEvaluation',
                    judgeId: currentJudgeId,
                    teamId: currentTeamId,
                    score,
                    comment
                });
                
                // 로컬 상태 즉시 반영
                const judgeKey = `judge_${currentJudgeId}`;
                if (!allEvaluations[judgeKey]) allEvaluations[judgeKey] = {};
                allEvaluations[judgeKey][currentTeamId] = { score, comment };

                renderTeamList();
                showScreen('teamList');
            } catch (err) {
                alert('점수 저장 중 오류가 발생했습니다: ' + err.message);
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = '저장하기';
            }
        });
    }

    // 심사 완료 (첫 화면으로)
    const btnFinish = document.getElementById('btn-finish-judging');
    if (btnFinish) {
        btnFinish.addEventListener('click', () => {
            if (confirm('심사를 완료하고 첫 화면으로 돌아가시겠습니까?')) {
                currentJudgeId = null;
                judgeInfo.style.display = 'none';
                window.history.replaceState({}, document.title, window.location.pathname);
                showScreen('selectJudge');
            }
        });
    }

    // 전체 심사결과 확인
    const btnCheck = document.getElementById('btn-check-results');
    if (btnCheck) {
        btnCheck.addEventListener('click', async () => {
            const code = prompt('결과 확인을 위한 코드번호를 입력하세요.');
            if (code === ADMIN_CODE) {
                await loadAllData();
                generateResults();
                showScreen('results');
            } else if (code !== null) {
                alert('코드번호가 일치하지 않습니다.');
            }
        });
    }

    const btnBackHome = document.getElementById('btn-back-home');
    if (btnBackHome) {
        btnBackHome.addEventListener('click', () => showScreen('selectJudge'));
    }
}

init();
