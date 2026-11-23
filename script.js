const TOTAL_JUDGES = 9;
const TOTAL_TEAMS = 30;

let currentJudgeId = null;
let currentTeamId = null;
let evaluations = {}; 
let teamNames = {}; 

const screens = {
    selectJudge: document.getElementById('screen-select-judge'),
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
const teamNameInputsContainer = document.getElementById('team-name-inputs');

function init() {
    loadTeamNames();
    createJudgeButtons();
    checkLoginFromUrl();
    setupEventListeners();
}

function loadTeamNames() {
    const savedNames = localStorage.getItem('teamNames');
    if (savedNames) {
        teamNames = JSON.parse(savedNames);
    } else {
        for (let i = 1; i <= TOTAL_TEAMS; i++) {
            teamNames[i] = `팀 ${i}`;
        }
    }
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        if(screen) screen.classList.remove('active');
    });
    if(screens[screenName]) {
        screens[screenName].classList.add('active');
        window.scrollTo(0, 0);
    }
}

function checkLoginFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const judgeParam = urlParams.get('judge');
    
    if (judgeParam && judgeParam >= 1 && judgeParam <= TOTAL_JUDGES) {
        loginAsJudge(parseInt(judgeParam));
    } else {
        showScreen('selectJudge');
    }
}

function createJudgeButtons() {
    const container = document.getElementById('judge-buttons');
    if (!container) return;
    
    container.innerHTML = ''; 
    for (let i = 1; i <= TOTAL_JUDGES; i++) {
        const btn = document.createElement('button');
        btn.className = 'grid-btn';
        btn.textContent = `심사위원 ${i}`;
        btn.onclick = () => loginAsJudge(i);
        container.appendChild(btn);
    }
}

function loginAsJudge(judgeId) {
    currentJudgeId = judgeId;
    judgeInfo.textContent = `심사위원 ${judgeId}`;
    judgeInfo.style.display = 'inline-block';
    
    const savedData = localStorage.getItem(`evalData_judge_${currentJudgeId}`);
    if (savedData) {
        evaluations = JSON.parse(savedData);
    } else {
        evaluations = {};
    }
    
    renderTeamList();
    showScreen('teamList');
}

function renderTeamRegisterInputs() {
    if(!teamNameInputsContainer) return;
    
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

    for (let i = 1; i <= TOTAL_TEAMS; i++) {
        const li = document.createElement('li');
        const isCompleted = evaluations[i] != null;
        
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
    
    const data = evaluations[teamId] || { score: '', comment: '' };
    document.getElementById('score').value = data.score;
    document.getElementById('comment').value = data.comment;
    
    showScreen('evaluation');
}

function generateResults() {
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
        const savedData = localStorage.getItem(`evalData_judge_${j}`);
        if (savedData) {
            const judgeData = JSON.parse(savedData);
            for (let t = 1; t <= TOTAL_TEAMS; t++) {
                if (judgeData[t] && judgeData[t].score) {
                    teamsData[t-1].scores[j-1] = judgeData[t].score;
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
        html += `<td><strong>${team.rank}</strong></td>`;
        
        tr.innerHTML = html;
        resultsTbody.appendChild(tr);
    });
}

function setupEventListeners() {
    const btnRegister = document.getElementById('btn-register-teams');
    if(btnRegister) {
        btnRegister.addEventListener('click', () => {
            const code = prompt('팀 등록을 위한 코드번호를 입력하세요.');
            if (code === '1125') {
                renderTeamRegisterInputs();
                showScreen('teamRegister');
            } else if (code !== null) {
                alert('코드번호가 일치하지 않습니다.');
            }
        });
    }

    const btnCancelReg = document.getElementById('btn-cancel-register');
    if(btnCancelReg) {
        btnCancelReg.addEventListener('click', () => {
            showScreen('selectJudge');
        });
    }

    const formRegister = document.getElementById('team-register-form');
    if(formRegister) {
        formRegister.addEventListener('submit', (e) => {
            e.preventDefault();
            for (let i = 1; i <= TOTAL_TEAMS; i++) {
                const inputElement = document.getElementById(`input-team-name-${i}`);
                if(inputElement) {
                    const inputVal = inputElement.value.trim();
                    teamNames[i] = inputVal || `팀 ${i}`; 
                }
            }
            localStorage.setItem('teamNames', JSON.stringify(teamNames));
            alert('참가팀 이름이 성공적으로 저장되었습니다.');
            showScreen('selectJudge');
        });
    }

    const btnCancel = document.getElementById('btn-cancel');
    if(btnCancel) {
        btnCancel.addEventListener('click', () => {
            showScreen('teamList');
        });
    }

    if(evalForm) {
        evalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const score = parseInt(document.getElementById('score').value);
            const comment = document.getElementById('comment').value;

            evaluations[currentTeamId] = { score, comment };
            localStorage.setItem(`evalData_judge_${currentJudgeId}`, JSON.stringify(evaluations));

            renderTeamList();
            showScreen('teamList');
        });
    }

    const btnFinish = document.getElementById('btn-finish-judging');
    if(btnFinish) {
        btnFinish.addEventListener('click', () => {
            if(confirm('심사를 완료하고 첫 화면으로 돌아가시겠습니까?')) {
                currentJudgeId = null;
                judgeInfo.style.display = 'none';
                window.history.replaceState({}, document.title, window.location.pathname);
                showScreen('selectJudge');
            }
        });
    }

    const btnCheck = document.getElementById('btn-check-results');
    if(btnCheck) {
        btnCheck.addEventListener('click', () => {
            const code = prompt('결과 확인을 위한 코드번호를 입력하세요.');
            if (code === '1125') {
                generateResults();
                showScreen('results');
            } else if (code !== null) {
                alert('코드번호가 일치하지 않습니다.');
            }
        });
    }

    const btnBackHome = document.getElementById('btn-back-home');
    if(btnBackHome) {
        btnBackHome.addEventListener('click', () => {
            showScreen('selectJudge');
        });
    }
}

init();
