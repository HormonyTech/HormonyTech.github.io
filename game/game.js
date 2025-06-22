// --- ИГРОВАЯ ЛОГИКА ---
document.addEventListener('DOMContentLoaded', () => {
    // --- ИГРОВЫЕ ДАННЫЕ И НАСТРОЙКИ ---
    let gameState = {
        coins: 0,
        clickMultiplier: 1,
        unlockedPhones: ['Redmi9A'],
        multiplierCost: 500
    };

    const phoneUnlockCosts = {
        'Redmi9A': 0, 'SamsungS21U': 10000, 'RealmeGT7Pro': 100000,
        'HuaweiPura70U': 200000, 'OnePlus12': 500000, 'SamsungS24U': 1000000,
        'SamsungS25U': 2000000, 'HuaweiPura80U': 3000000, 'VivoX200U': 4000000, 'Xiaomi15U': 5500000
    };
    
    // --- DOM ЭЛЕМЕНТЫ ИГРЫ ---
    const gameScreen = document.getElementById('game-screen');
    const mainAppScreen = document.getElementById('main-app');
    const loadingScreen = document.getElementById('loading-screen');
    const goToGameBtn = document.getElementById('go-to-game-btn');
    const backToMainBtn = document.getElementById('back-to-main-btn');
    const coinsDisplay = document.getElementById('game-coins');
    const clickerButton = document.getElementById('clicker-button');
    const clickValueDisplay = document.getElementById('click-value');
    const upgradesList = document.querySelector('.upgrades-list');
    const multiplierBtn = document.getElementById('upgrade-multiplier-btn');

    // --- ФУНКЦИИ СОХРАНЕНИЯ/ЗАГРУЗКИ ---
    function saveGame() {
        localStorage.setItem('stabilizerGameState', JSON.stringify(gameState));
    }
    function loadGame() {
        const savedState = localStorage.getItem('stabilizerGameState');
        if (savedState) {
            gameState = JSON.parse(savedState);
        }
        // Добавляем новые телефоны в список разблокировки, если их там нет
        if (!gameState.unlockedPhones) {
            gameState.unlockedPhones = ['Redmi9A'];
        }
    }

    // --- ИГРОВОЙ ПРОЦЕСС ---
    function handleManualClick() {
        gameState.coins += gameState.clickMultiplier;
        updateUI();
        saveGame();
    }
    function buyMultiplier() {
        if (gameState.coins >= gameState.multiplierCost) {
            gameState.coins -= gameState.multiplierCost;
            gameState.clickMultiplier += 2;
            gameState.multiplierCost = Math.round(gameState.multiplierCost * 2.5); // Увеличиваем цену
            updateUI();
            saveGame();
        }
    }
    function unlockPhone(phoneName) {
        const cost = phoneUnlockCosts[phoneName];
        if (gameState.coins >= cost && !gameState.unlockedPhones.includes(phoneName)) {
            gameState.coins -= cost;
            gameState.unlockedPhones.push(phoneName);
            updateUI();
            saveGame();
            // Обновляем список телефонов в основном приложении
            window.updatePhoneSelector(); 
        }
    }

    // --- ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ---
    function updateUI() {
        coinsDisplay.textContent = formatNumber(gameState.coins);
        clickValueDisplay.textContent = gameState.clickMultiplier;

        // Обновляем кнопку множителя
        multiplierBtn.querySelector('.upgrade-cost span').textContent = formatNumber(gameState.multiplierCost);
        multiplierBtn.classList.toggle('locked', gameState.coins < gameState.multiplierCost);
        
        // Обновляем кнопки телефонов
        document.querySelectorAll('.upgrade-btn[data-phone]').forEach(btn => {
            const phoneName = btn.dataset.phone;
            const cost = phoneUnlockCosts[phoneName];
            if (gameState.unlockedPhones.includes(phoneName)) {
                btn.classList.add('locked');
                btn.querySelector('.upgrade-cost').innerHTML = '<i class="fas fa-check"></i> Открыто';
            } else {
                btn.classList.toggle('locked', gameState.coins < cost);
            }
        });
    }

    function createUnlockButtons() {
        Object.entries(phoneUnlockCosts).forEach(([name, cost]) => {
            if (cost > 0) { // Не создаем кнопку для Redmi9A
                const button = document.createElement('button');
                button.className = 'upgrade-btn';
                button.dataset.phone = name;
                button.dataset.cost = cost;
                button.innerHTML = `
                    <div class="upgrade-info"><strong>${name}</strong><span>Разблокировать</span></div>
                    <div class="upgrade-cost"><i class="fas fa-coins"></i> <span>${formatNumber(cost)}</span></div>
                `;
                button.addEventListener('click', () => unlockPhone(name));
                upgradesList.appendChild(button);
            }
        });
    }

    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num;
    }

    // --- УПРАВЛЕНИЕ ЭКРАНАМИ ---
    function switchToGame() {
        if (confirm('Вы точно хотите зайти в мини-игру?')) {
            loadingScreen.classList.remove('hidden');
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                mainAppScreen.classList.add('hidden');
                gameScreen.classList.remove('hidden');
                updateUI();
            }, 1500);
        }
    }

    // --- ГЛОБАЛЬНАЯ ФУНКЦИЯ ДЛЯ ДОСТУПА ИЗ APP.JS ---
    window.getUnlockedPhones = () => gameState.unlockedPhones;

    // --- ИНИЦИАЛИЗАЦИЯ ИГРЫ ---
    loadGame();
    createUnlockButtons();
    goToGameBtn.addEventListener('click', switchToGame);
    backToMainBtn.addEventListener('click', () => {
        gameScreen.classList.add('hidden');
        mainAppScreen.classList.remove('hidden');
    });
    clickerButton.addEventListener('click', handleManualClick);
    multiplierBtn.addEventListener('click', buyMultiplier);
});
