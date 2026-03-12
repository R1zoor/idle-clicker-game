// вводные
let coins = 0;
let coinsPerClick = 1;
let upgradeCost = 10;

let coinsPerSecond = 0;
let autoMinerCost = 50;
let auto2Amount = 0;      // сколько супер-добыч
let auto2Power = 5;       // сколько каждая даёт в сек
let auto2Cost = 250;      // цена первой

let critChance = 0.05;       // 5% шанс крита
let critMultiplier = 3;      // крит даёт x3 от обычного клика

// перерождение — считаем только текущий заход
let runCoins = 0;            // сколько добыто в текущем заходе
let prestigePoints = 0;      // кристаллы
let prestigeBonus = 0;       // общий бонус к доходу, 0.3 = +30%

let skillCritChanceLevel = 0;
let skillCritMultLevel = 0;
let skillIncomeLevel = 0;


// константы (DOM)
const coinsSpan = document.getElementById('coins');
const coinsPerSecondSpan = document.getElementById('coins-per-second');
const incomePerClickSpan = document.getElementById('income-per-click');


const clickButton = document.getElementById('click-button');
const upgradeButton = document.getElementById('upgrade-button');
const upgradeCostSpan = document.getElementById('upgrade-cost');

const autoButton = document.getElementById('auto-button');
const autoCostSpan = document.getElementById('auto-cost');

const auto2Button = document.getElementById('auto2-button');
const auto2CostSpan = document.getElementById('auto2-cost');

const critChanceText = document.getElementById('crit-chance-text');
const critMultText = document.getElementById('crit-mult-text');

const lifetimeCoinsSpan = document.getElementById('lifetime-coins'); // будем показывать runCoins
const prestigePointsSpan = document.getElementById('prestige-points');
const prestigeBonusText = document.getElementById('prestige-bonus-text');
const prestigeButton = document.getElementById('prestige-button');
const hardResetButton = document.getElementById('hard-reset-button');

const skillCritChanceBtn = document.getElementById('skill-crit-chance');
const skillCritMultBtn = document.getElementById('skill-crit-mult');
const skillIncomeBtn = document.getElementById('skill-income');


// ===== UI и функции =====

function calcPrestigeGain() {
  if (runCoins < 1000) return 0;

  // более щедрый вариант: степень 0.6 и меньший делитель
  return Math.floor(Math.pow(runCoins / 800, 0.6));
}


function updateUI() {
  coinsSpan.textContent = coins;
  coinsPerSecondSpan.textContent = coinsPerSecond;
    // базовый доход за клик без рандома, с критом как средним значением
  const expectedCritMult = 1 + critChance * (critMultiplier - 1); // средний множитель с учётом шанса
  const baseClickGain = coinsPerClick * expectedCritMult;
  const totalClickGain = Math.floor(baseClickGain * (1 + prestigeBonus));

  incomePerClickSpan.textContent = totalClickGain;

  upgradeCostSpan.textContent = upgradeCost;
  autoCostSpan.textContent = autoMinerCost;
  auto2CostSpan.textContent = auto2Cost;

  upgradeButton.disabled = coins < upgradeCost;
  autoButton.disabled = coins < autoMinerCost;
  auto2Button.disabled = coins < auto2Cost;

  critChanceText.textContent = Math.round(critChance * 100) + '%';
  critMultText.textContent = 'x' + critMultiplier;

  lifetimeCoinsSpan.textContent = runCoins;
  prestigePointsSpan.textContent = prestigePoints;
  prestigeBonusText.textContent = '+' + Math.round(prestigeBonus * 100) + '%';

  const gain = calcPrestigeGain();
  prestigeButton.disabled = gain <= 0;

    // дерево прокачки: визуальное состояние
  skillCritChanceBtn.classList.toggle('unlocked', skillCritChanceLevel > 0);
  skillCritMultBtn.classList.toggle('unlocked', skillCritMultLevel > 0);
  skillIncomeBtn.classList.toggle('unlocked', skillIncomeLevel > 0);

  // доступность по кристаллам и зависимостям
  skillCritChanceBtn.disabled = prestigePoints < 1; // всегда доступен, если есть 1 кристалл

  skillCritMultBtn.disabled = prestigePoints < 2 || skillCritChanceLevel === 0; // требует крит-шанс

  skillIncomeBtn.disabled = prestigePoints < 3;

}

// ===== Логика игры =====

// клик
clickButton.addEventListener('click', () => {
  let mult = 1;

  // крит
  if (Math.random() < critChance) {
    mult = critMultiplier;
    clickButton.style.transform = 'scale(1.1)';
    setTimeout(() => {
      clickButton.style.transform = '';
    }, 100);
  }

  const baseGain = coinsPerClick * mult;
  const totalGain = Math.floor(baseGain * (1 + prestigeBonus));

  coins += totalGain;
  runCoins += totalGain;

  updateUI();
});

// улучшение клика
upgradeButton.addEventListener('click', () => {
  if (coins >= upgradeCost) {
    coins -= upgradeCost;
    coinsPerClick += 1;
    upgradeCost = Math.floor(upgradeCost * 1.5);
    updateUI();
  }
});

// авто-добыча 1
autoButton.addEventListener('click', () => {
  if (coins >= autoMinerCost) {
    coins -= autoMinerCost;
    coinsPerSecond += 1;
    autoMinerCost = Math.floor(autoMinerCost * 1.7);
    updateUI();
  }
});

// авто-добыча 2
auto2Button.addEventListener('click', () => {
  if (coins >= auto2Cost) {
    coins -= auto2Cost;
    auto2Amount += 1;
    coinsPerSecond += auto2Power;               // +5 в сек за каждую
    auto2Cost = Math.floor(auto2Cost * 1.8);    // удорожание
    updateUI();
  }
});

// перерождение
prestigeButton.addEventListener('click', () => {
  const gain = calcPrestigeGain();
  if (gain <= 0) return;

  // добавляем кристаллы
  prestigePoints += gain;


  // сбрасываем текущий прогресс, но НЕ кристаллы
  coins = 0;
  coinsPerClick = 1;
  upgradeCost = 10;

  coinsPerSecond = 0;
  autoMinerCost = 50;
  auto2Amount = 0;
  auto2Cost = 250;

  runCoins = 0;

  saveGame();
  updateUI();
});

// полный сброс
hardResetButton.addEventListener('click', () => {
  const sure = confirm('Точно сбросить весь прогресс? Это действие нельзя отменить.');
  if (!sure) return;

  // очищаем сохранение только для нашей игры [web:156][web:160][web:164]
  localStorage.removeItem(SAVE_KEY);

  // стартовые значения
  coins = 0;
  coinsPerClick = 1;
  upgradeCost = 10;

  coinsPerSecond = 0;
  autoMinerCost = 50;
  auto2Amount = 0;
  auto2Cost = 250;

  critChance = 0.05;
  critMultiplier = 3;

  runCoins = 0;
  prestigePoints = 0;
  prestigeBonus = 0;

  updateUI();
});

// === ДЕРЕВО ПРОКАЧКИ ===

// узел: +крит-шанс
skillCritChanceBtn.addEventListener('click', () => {
  const cost = 1;
  if (prestigePoints < cost) return;

  prestigePoints -= cost;
  skillCritChanceLevel += 1;
  critChance += 0.05; // +5%

  saveGame();
  updateUI();
});

// узел: +крит-множитель
skillCritMultBtn.addEventListener('click', () => {
  const cost = 2;
  if (prestigePoints < cost) return;
  if (skillCritChanceLevel === 0) return; // требуем предыдущий узел

  prestigePoints -= cost;
  skillCritMultLevel += 1;
  critMultiplier += 1;

  saveGame();
  updateUI();
});

skillIncomeBtn.addEventListener('click', () => {
  const cost = 3;
  if (prestigePoints < cost) return;

  prestigePoints -= cost;
  skillIncomeLevel += 1;
  prestigeBonus += 0.2;

  saveGame();
  updateUI();
});

// авто-тик
setInterval(() => {
  if (coinsPerSecond > 0) {
    const baseGain = coinsPerSecond;
    const totalGain = Math.floor(baseGain * (1 + prestigeBonus));

    coins += totalGain;
    runCoins += totalGain;

    updateUI();
  }
}, 1000);

// ===== Сейв / загрузка =====

const SAVE_KEY = 'my_clicker_save_v1';

function saveGame() {
  const data = {
    coins,
    coinsPerClick,
    upgradeCost,
    coinsPerSecond,
    autoMinerCost,
    auto2Amount,
    auto2Cost,
    runCoins,
    prestigePoints,
    prestigeBonus,
    critChance,
    critMultiplier,
    skillCritChanceLevel,
    skillCritMultLevel,
    skillIncomeLevel
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;

  try {
    const data = JSON.parse(raw);

    if (typeof data.coins === 'number') coins = data.coins;
    if (typeof data.coinsPerClick === 'number') coinsPerClick = data.coinsPerClick;
    if (typeof data.upgradeCost === 'number') upgradeCost = data.upgradeCost;
    if (typeof data.coinsPerSecond === 'number') coinsPerSecond = data.coinsPerSecond;
    if (typeof data.autoMinerCost === 'number') autoMinerCost = data.autoMinerCost;
    if (typeof data.auto2Amount === 'number') auto2Amount = data.auto2Amount;
    if (typeof data.auto2Cost === 'number') auto2Cost = data.auto2Cost;
    if (typeof data.runCoins === 'number') runCoins = data.runCoins;
    if (typeof data.prestigePoints === 'number') prestigePoints = data.prestigePoints;
    if (typeof data.prestigeBonus === 'number') prestigeBonus = data.prestigeBonus;
    if (typeof data.critChance === 'number') critChance = data.critChance;
    if (typeof data.critMultiplier === 'number') critMultiplier = data.critMultiplier;
    if (typeof data.skillCritChanceLevel === 'number') skillCritChanceLevel = data.skillCritChanceLevel;
    if (typeof data.skillCritMultLevel === 'number') skillCritMultLevel = data.skillCritMultLevel;
    if (typeof data.skillIncomeLevel === 'number') skillIncomeLevel = data.skillIncomeLevel;
  } catch (e) {
    console.error('Ошибка загрузки сохранения', e);
  }
}

loadGame();
updateUI();

// авто-сохранение каждые 5 секунд
setInterval(() => {
  saveGame();
}, 5000);
