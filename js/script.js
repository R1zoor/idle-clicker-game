// вводные
let coins = 0;
let coinsPerClick = 1;

let gems = 0; // новая валюта
let gemsAutoBoostLevel = 0;
const gemsAutoBoostButton = document.getElementById('gems-auto-boost-button');
let autoIncomeMultiplier = 1;

let upgrade1Cost = 10;     // +1 за клик
let upgrade5Cost = 100;    // +5 за клик
let upgrade10Cost = 1000;  // +10 за клик

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

// уровни нового древа
let skillRootIncomeBought = false;
let skillCrit1Bought = false;
let skillCrit2Bought = false;
let skillCrit3Bought = false;
let skillMult1Bought = false;
let skillMult2Bought = false;
let skillNewCurrencyBought = false;

let hasSeenPrestigeTutorial = false;


// константы (DOM)
const coinsMainSpan = document.getElementById('coins-main');
const coinsUpgradesSpan = document.getElementById('coins-upgrades');
const coinsPerSecondSpan = document.getElementById('coins-per-second');

const gemsMainSpan = document.getElementById('gems-main');
const gemsUpgradesSpan = document.getElementById('gems-upgrades');

const clickButton = document.getElementById('click-button');

const upgrade1Button = document.getElementById('upgrade1-button');
const upgrade1CostSpan = document.getElementById('upgrade1-cost');

const upgrade5Button = document.getElementById('upgrade5-button');
const upgrade5CostSpan = document.getElementById('upgrade5-cost');

const upgrade10Button = document.getElementById('upgrade10-button');
const upgrade10CostSpan = document.getElementById('upgrade10-cost');

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

const skillRootIncomeBtn = document.getElementById('skill-root-income');
const skillCrit1Btn = document.getElementById('skill-crit1');
const skillCrit2Btn = document.getElementById('skill-crit2');
const skillCrit3Btn = document.getElementById('skill-crit3');
const skillMult1Btn = document.getElementById('skill-mult1');
const skillMult2Btn = document.getElementById('skill-mult2');
const skillNewCurrencyBtn = document.getElementById('skill-new-currency');

const skillModal = document.getElementById('skill-modal');
const skillModalTitle = document.getElementById('skill-modal-title');
const skillModalDesc = document.getElementById('skill-modal-desc');
const skillModalCost = document.getElementById('skill-modal-cost');
const skillModalBuy = document.getElementById('skill-modal-buy');
const skillModalClose = document.getElementById('skill-modal-close');

const gemsMainPanel = document.getElementById('gems-main-panel');
const gemsUpgradesPanel = document.getElementById('gems-upgrades-panel');
const gemsUpgradesShop = document.getElementById('gems-upgrades-shop');



let currentSkillId = null;

const skillModalStatus = document.getElementById('skill-modal-status');

// вкладки
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const tabBtnMain = document.getElementById('tab-btn-main');
const tabBtnPrestige = document.getElementById('tab-btn-prestige');

// переключение вкладок
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('hidden')) return;

    const tab = btn.dataset.tab;

    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    tabContents.forEach(c => {
      c.classList.toggle('active', c.id === 'tab-' + tab);
    });
  });
});

// ===== UI и функции =====

function calcPrestigeGain() {
  if (runCoins < 1000) return 0;
  return Math.floor(Math.pow(runCoins / 800, 0.6));
}

function updateTabsVisibility() {
  tabBtnPrestige.classList.remove('hidden');
}


function updateUI() {
  coinsMainSpan.textContent = coins;
  coinsUpgradesSpan.textContent = coins;

  gemsMainSpan.textContent = Math.floor(gems);
  gemsUpgradesSpan.textContent = Math.floor(gems);
  gemsAutoBoostButton.disabled = !skillNewCurrencyBought || gems < 100;

  // показываем авто-добычу с учётом мультипликатора
  coinsPerSecondSpan.textContent = Math.floor(coinsPerSecond * autoIncomeMultiplier);



  // цены
  upgrade1CostSpan.textContent = upgrade1Cost;
  upgrade5CostSpan.textContent = upgrade5Cost;
  upgrade10CostSpan.textContent = upgrade10Cost;
  autoCostSpan.textContent = autoMinerCost;
  auto2CostSpan.textContent = auto2Cost;

  // доступность кнопок
  upgrade1Button.disabled = coins < upgrade1Cost;
  upgrade5Button.disabled = coins < upgrade5Cost;
  upgrade10Button.disabled = coins < upgrade10Cost;
  autoButton.disabled = coins < autoMinerCost;
  auto2Button.disabled = coins < auto2Cost;

  critChanceText.textContent = Math.round(critChance * 100) + '%';
  critMultText.textContent = 'x' + critMultiplier;

  lifetimeCoinsSpan.textContent = runCoins;
  prestigePointsSpan.textContent = prestigePoints;
  prestigeBonusText.textContent = '+' + Math.round(prestigeBonus * 100) + '%';


  const gain = calcPrestigeGain();
  prestigeButton.disabled = gain <= 0;

  // Древо: визуальное состояние
  skillRootIncomeBtn.classList.toggle('unlocked', skillRootIncomeBought);
  skillCrit1Btn.classList.toggle('unlocked', skillCrit1Bought);
  skillCrit2Btn.classList.toggle('unlocked', skillCrit2Bought);
  skillCrit3Btn.classList.toggle('unlocked', skillCrit3Bought);
  skillMult1Btn.classList.toggle('unlocked', skillMult1Bought);
  skillMult2Btn.classList.toggle('unlocked', skillMult2Bought);
  skillNewCurrencyBtn.classList.toggle('unlocked', skillNewCurrencyBought);

  // Включение веток по зависимости

  // Корень всегда виден
  skillRootIncomeBtn.classList.remove('hidden');

  // Ветка A и B и C видны только если корень куплен
  skillCrit1Btn.classList.toggle('hidden', !skillRootIncomeBought);
  skillMult1Btn.classList.toggle('hidden', !skillRootIncomeBought);
  skillNewCurrencyBtn.classList.toggle('hidden', !skillRootIncomeBought);

  // Ветка A: крит-шанс
  skillCrit2Btn.classList.toggle('hidden', !skillCrit1Bought);
  skillCrit3Btn.classList.toggle('hidden', !skillCrit2Bought);

  // Ветка B: крит-множитель
  skillMult2Btn.classList.toggle('hidden', !skillMult1Bought);

    const gemsUnlocked = skillNewCurrencyBought;
    if (gemsMainPanel && gemsUpgradesPanel && gemsUpgradesShop) {
      gemsMainPanel.classList.toggle('hidden', !gemsUnlocked);
      gemsUpgradesPanel.classList.toggle('hidden', !gemsUnlocked);
      gemsUpgradesShop.classList.toggle('hidden', !gemsUnlocked);
    }

  updateTabsVisibility();
}

// ===== Логика игры =====

// клик
clickButton.addEventListener('click', () => {
  let mult = 1;

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

// апгрейд клика +1
upgrade1Button.addEventListener('click', () => {
  if (coins >= upgrade1Cost) {
    coins -= upgrade1Cost;
    coinsPerClick += 1;
    upgrade1Cost = Math.floor(upgrade1Cost * 1.5);
    updateUI();
  }
});

// апгрейд клика +5
upgrade5Button.addEventListener('click', () => {
  if (coins >= upgrade5Cost) {
    coins -= upgrade5Cost;
    coinsPerClick += 5;
    upgrade5Cost = Math.floor(upgrade5Cost * 1.5);
    updateUI();
  }
});

// апгрейд клика +10
upgrade10Button.addEventListener('click', () => {
  if (coins >= upgrade10Cost) {
    coins -= upgrade10Cost;
    coinsPerClick += 10;
    upgrade10Cost = Math.floor(upgrade10Cost * 1.5);
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
    coinsPerSecond += auto2Power;
    auto2Cost = Math.floor(auto2Cost * 1.8);
    updateUI();
  }
});

function openPrestigeScreen() {
  tabButtons.forEach(b => b.classList.remove('active'));
  tabContents.forEach(c => c.classList.remove('active'));

  const boostsTab = document.getElementById('tab-boosts');
  if (boostsTab) {
    boostsTab.classList.add('active');
  }

  skillModalTitle.textContent = 'Потрать кристаллы';

  if (!hasSeenPrestigeTutorial) {
    skillModalDesc.textContent = 'После перерождения ты попадаешь в меню бустов. Здесь тратишь кристаллы на постоянные улучшения, они работают во всех следующих запусках.';
    hasSeenPrestigeTutorial = true;
  } else {
    skillModalDesc.textContent = 'Купи новые бусты или посмотри уже взятые.';
  }

  skillModalCost.textContent = '';
  skillModalStatus.textContent = 'Выбери буст в дереве слева';
  skillModalStatus.className = '';
  skillModalBuy.disabled = true;
  currentSkillId = null;

  skillModal.classList.remove('hidden');
  skillModalBuy.classList.add('hidden-buy');
  skillModalBuy.disabled = true;
  currentSkillId = null;
}



// перерождение
prestigeButton.addEventListener('click', () => {
  const gain = calcPrestigeGain();
  if (gain <= 0) {
    alert('Слишком мало монет, чтобы переродиться.');
    return;
  }

  const confirmText =
    `Ты потеряешь весь прогресс этого цикла,\n` +
    `но получишь ${gain} кристаллов.\n\n` +
    `Переродиться?`;

  const ok = confirm(confirmText);
  if (!ok) return;

  prestigePoints += gain;

  coins = 0;
  coinsPerClick = 1;

  upgrade1Cost = 10;
  upgrade5Cost = 100;
  upgrade10Cost = 1000;

  coinsPerSecond = 0;
  autoMinerCost = 50;
  auto2Amount = 0;
  auto2Cost = 250;

  runCoins = 0;

  saveGame();
  updateUI();
  
  // экран бустов
  openPrestigeScreen();
});


// полный сброс
hardResetButton.addEventListener('click', () => {
  const sure = confirm('Точно сбросить весь прогресс? Это действие нельзя отменить.');
  if (!sure) return;

  localStorage.removeItem(SAVE_KEY);

  coins = 0;
  coinsPerClick = 1;
  gems = 0;

  upgrade1Cost = 10;
  upgrade5Cost = 100;
  upgrade10Cost = 1000;

  coinsPerSecond = 0;
  autoMinerCost = 50;
  auto2Amount = 0;
  auto2Cost = 250;

  critChance = 0.05;
  critMultiplier = 3;

  runCoins = 0;
  prestigePoints = 0;
  prestigeBonus = 0;

  skillCritChanceLevel = 0;
  skillCritMultLevel = 0;
  skillIncomeLevel = 0;

  skillRootIncomeBought = false;
  skillCrit1Bought = false;
  skillCrit2Bought = false;
  skillCrit3Bought = false;
  skillMult1Bought = false;
  skillMult2Bought = false;
  skillNewCurrencyBought = false;

  saveGame();
  updateUI();
});

const skillData = {
  'root-income': {
    title: 'Корень: доход +20%',
    desc: 'Постоянно увеличивает весь доход (клики и авто) на 20%. Открывает остальные ветки древа.',
    cost: 1,
    isBought: () => skillRootIncomeBought,
    canBuy: () => !skillRootIncomeBought && prestigePoints >= 1,
    buy: () => {
      prestigePoints -= 1;
      prestigeBonus += 0.2;
      skillRootIncomeBought = true;
    }
  },
  'crit1': {
    title: 'Крит-шанс +5%',
    desc: 'Увеличивает шанс критического клика на 5%.',
    cost: 2,
    isBought: () => skillCrit1Bought,
    canBuy: () => skillRootIncomeBought && !skillCrit1Bought && prestigePoints >= 2,
    buy: () => {
      prestigePoints -= 2;
      critChance += 0.05;
      skillCrit1Bought = true;
    }
  },
  'crit2': {
    title: 'Крит-шанс +5%',
    desc: 'Ещё +5% к шансу критического клика.',
    cost: 3,
    isBought: () => skillCrit2Bought,
    canBuy: () => skillCrit1Bought && !skillCrit2Bought && prestigePoints >= 3,
    buy: () => {
      prestigePoints -= 3;
      critChance += 0.05;
      skillCrit2Bought = true;
    }
  },
  'crit3': {
    title: 'Крит-шанс +5%',
    desc: 'Ещё +5% к шансу крита. Сильный буст для кликеров.',
    cost: 4,
    isBought: () => skillCrit3Bought,
    canBuy: () => skillCrit2Bought && !skillCrit3Bought && prestigePoints >= 4,
    buy: () => {
      prestigePoints -= 4;
      critChance += 0.05;
      skillCrit3Bought = true;
    }
  },
  'mult1': {
    title: 'Крит-множитель +1',
    desc: 'Критические клики наносят ещё больше урона по кошельку.',
    cost: 3,
    isBought: () => skillMult1Bought,
    canBuy: () => skillRootIncomeBought && !skillMult1Bought && prestigePoints >= 3,
    buy: () => {
      prestigePoints -= 3;
      critMultiplier += 1;
      skillMult1Bought = true;
    }
  },
  'mult2': {
    title: 'Крит-множитель +1',
    desc: 'Ещё +1 к крит-множителю. Криты становятся очень жирными.',
    cost: 4,
    isBought: () => skillMult2Bought,
    canBuy: () => skillMult1Bought && !skillMult2Bought && prestigePoints >= 4,
    buy: () => {
      prestigePoints -= 4;
      critMultiplier += 1;
      skillMult2Bought = true;
    }
  },
  'new-currency': {
    title: 'Новая валюта',
    desc: 'Открывает новую валюту (пока-что без эффекта).',
    cost: 5,
    isBought: () => skillNewCurrencyBought,
    canBuy: () => skillRootIncomeBought && !skillNewCurrencyBought && prestigePoints >= 5,
    buy: () => {
      prestigePoints -= 5;
      skillNewCurrencyBought = true;
    }
  }
};

// === ДЕРЕВО ПРОКАЧКИ  ===


// общий обработчик на иконки древа
document.querySelectorAll('.skill-node').forEach(btn => {
  btn.addEventListener('click', () => {
    const skillId = btn.dataset.skillId;
    const data = skillData[skillId];
    if (!data) return;

    currentSkillId = skillId;
    skillModalBuy.classList.remove('hidden-buy');


    skillModalTitle.textContent = data.title;
    skillModalDesc.textContent = data.desc;

    // сбрасываем классы статуса
    skillModalStatus.classList.remove('bought', 'locked', 'cant-buy');

    if (data.isBought()) {
      skillModalCost.textContent = `Стоимость: ${data.cost} кристаллов`;
      skillModalStatus.textContent = 'Уже куплено';
      skillModalStatus.classList.add('bought');
      skillModalBuy.disabled = true;
    } else {
      skillModalCost.textContent = `Стоимость: ${data.cost} кристаллов`;

      if (!data.canBuy()) {
        // не хватает кристаллов или не выполнены условия ветки
        skillModalStatus.textContent = 'Недоступно: не хватает условий или кристаллов';
        skillModalStatus.classList.add('cant-buy');
        skillModalBuy.disabled = true;
      } else {
        skillModalStatus.textContent = 'Доступно к покупке';
        skillModalStatus.classList.add('locked');
        skillModalBuy.disabled = false;
      }
    }

    skillModal.classList.remove('hidden');

    });
  });

  // гем-апгрейд
gemsAutoBoostButton.addEventListener('click', () => {
  if (!skillNewCurrencyBought) return;
  if (gems < 100) return;

  gems -= 100;
  gemsAutoBoostLevel += 1;
  autoIncomeMultiplier *= 1.2;

  updateUI();
});

skillModalBuy.addEventListener('click', () => {
  if (!currentSkillId) return;

  const data = skillData[currentSkillId]; // ← эта строка обязательна
  if (!data) return;
  if (!data.canBuy()) return;

  data.buy();
  saveGame();
  updateUI();

  skillModalStatus.classList.remove('bought', 'locked', 'cant-buy');

  if (data.isBought()) {
    skillModalCost.textContent = `Стоимость: ${data.cost} кристаллов`;
    skillModalStatus.textContent = 'Уже куплено';
    skillModalStatus.classList.add('bought');
    skillModalBuy.disabled = true;
  } else if (!data.canBuy()) {
    skillModalStatus.textContent = 'Недоступно: не хватает условий или кристаллов';
    skillModalStatus.classList.add('cant-buy');
    skillModalBuy.disabled = true;
  } else {
    skillModalStatus.textContent = 'Доступно к покупке';
    skillModalStatus.classList.add('locked');
    skillModalBuy.disabled = false;
  }
});


  // обновляем состояние модалки после покупки

skillModalClose.addEventListener('click', () => {
  skillModal.classList.add('hidden');
});

skillModal.addEventListener('click', (e) => {
  if (e.target === skillModal) {
    skillModal.classList.add('hidden');
  }
});

// авто-тик
setInterval(() => {
  if (coinsPerSecond > 0) {
    const baseGain = coinsPerSecond * autoIncomeMultiplier;
    const totalGain = Math.floor(baseGain * (1 + prestigeBonus));


    coins += totalGain;
    runCoins += totalGain;

    // гемы от авто-добычи
    gems += baseGain * 0.1; //10% от авто-дохода в сек

    updateUI();
  }
}, 1000);

// ===== Сейв / загрузка =====

const SAVE_KEY = 'my_clicker_save_v1';

function saveGame() {
  const data = {
    coins,
    coinsPerClick,
    upgrade1Cost,
    upgrade5Cost,
    upgrade10Cost,
    coinsPerSecond,
    autoMinerCost,
    auto2Amount,
    auto2Cost,
    runCoins,
    prestigePoints,
    prestigeBonus,
    critChance,
    critMultiplier,
    skillRootIncomeBought,
    skillCrit1Bought,
    skillCrit2Bought,
    skillCrit3Bought,
    skillMult1Bought,
    skillMult2Bought,
    skillNewCurrencyBought,
    gems,
    autoIncomeMultiplier,
    gemsAutoBoostLevel
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

    if (typeof data.upgrade1Cost === 'number') upgrade1Cost = data.upgrade1Cost;
    if (typeof data.upgrade5Cost === 'number') upgrade5Cost = data.upgrade5Cost;
    if (typeof data.upgrade10Cost === 'number') upgrade10Cost = data.upgrade10Cost;

    if (typeof data.coinsPerSecond === 'number') coinsPerSecond = data.coinsPerSecond;
    if (typeof data.autoMinerCost === 'number') autoMinerCost = data.autoMinerCost;
    if (typeof data.auto2Amount === 'number') auto2Amount = data.auto2Amount;
    if (typeof data.auto2Cost === 'number') auto2Cost = data.auto2Cost;
    if (typeof data.runCoins === 'number') runCoins = data.runCoins;
    if (typeof data.prestigePoints === 'number') prestigePoints = data.prestigePoints;
    if (typeof data.prestigeBonus === 'number') prestigeBonus = data.prestigeBonus;
    if (typeof data.critChance === 'number') critChance = data.critChance;
    if (typeof data.critMultiplier === 'number') critMultiplier = data.critMultiplier;
    if (typeof data.skillRootIncomeBought === 'boolean') skillRootIncomeBought = data.skillRootIncomeBought;
    if (typeof data.skillCrit1Bought === 'boolean') skillCrit1Bought = data.skillCrit1Bought;
    if (typeof data.skillCrit2Bought === 'boolean') skillCrit2Bought = data.skillCrit2Bought;
    if (typeof data.skillCrit3Bought === 'boolean') skillCrit3Bought = data.skillCrit3Bought;
    if (typeof data.gems === 'number') gems = data.gems;
    if (typeof data.autoIncomeMultiplier === 'number') autoIncomeMultiplier = data.autoIncomeMultiplier;
    if (typeof data.gemsAutoBoostLevel === 'number') gemsAutoBoostLevel = data.gemsAutoBoostLevel;
    if (typeof data.skillMult1Bought === 'boolean') skillMult1Bought = data.skillMult1Bought;
    if (typeof data.skillMult2Bought === 'boolean') skillMult2Bought = data.skillMult2Bought;
    if (typeof data.skillNewCurrencyBought === 'boolean') skillNewCurrencyBought = data.skillNewCurrencyBought;
  } catch (e) {
    console.error('Ошибка загрузки сохранения', e);
  }
}

loadGame();
updateUI();

setInterval(() => {
  saveGame();
}, 5000);
