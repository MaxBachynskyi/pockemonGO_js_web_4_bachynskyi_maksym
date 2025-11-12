class Pokemon {
    constructor({ name, defaultHP, damageHP, dmg, level = 1, img, elHP, elProgressbar }) {
        Object.assign(this, { name, defaultHP, damageHP, dmg, level, img, elHP, elProgressbar });
        this.isStunned = false;
    }

    renderHP() {
        this.renderHPLife();
        this.renderProgressbarHP();
    }

    renderHPLife() {
        const { elHP, damageHP, defaultHP } = this;
        elHP.innerText = `${damageHP} / ${defaultHP}`;
    }

    renderProgressbarHP() {
        const { elProgressbar, damageHP, defaultHP } = this;
        elProgressbar.style.width = `${(damageHP / defaultHP) * 100}%`;
    }

    changeHP(count) {
        if (this.damageHP <= count) {
            this.damageHP = 0;
            this.renderHP();
            return true;
        }
        this.damageHP -= count;
        this.renderHP();
        return false;
    }

    resetHP() {
        this.damageHP = this.defaultHP;
        this.renderHP();
    }
}

const getEl = (id) => document.getElementById(id);

const character = new Pokemon({
    name: 'Pikachu',
    defaultHP: 100,
    damageHP: 100,
    dmg: 25,
    elHP: getEl('health-character'),
    elProgressbar: getEl('progressbar-character')
});

const enemies = [
    new Pokemon({
        name: 'Charmander',
        defaultHP: 100,
        damageHP: 100,
        dmg: 20,
        level: 1,
        img: './assets/charmander_card_logo.png',
        elHP: getEl('health-enemy'),
        elProgressbar: getEl('progressbar-enemy')
    }),
    new Pokemon({
        name: 'Bisasam',
        defaultHP: 150,
        damageHP: 150,
        dmg: 5,
        level: 2,
        img: './assets/bisasam_card_logo.png',
        elHP: getEl('health-enemy'),
        elProgressbar: getEl('progressbar-enemy')
    })
];

const [$btnKick, $btnHeal, $btnStun] = ['btn-kick', 'btn-heal', 'btn-stun'].map(getEl);

function withClickLimit(limit, btnName, handler) {
    let count = 0;

    return function (event) {
        count++;
        const remaining = limit - count;
        console.log(`${btnName}: натискань = ${count}, залишилось = ${remaining >= 0 ? remaining : 0}`);

        if (count >= limit) {
            console.log(`${btnName} більше не можна натискати!`);
            event.currentTarget.disabled = true;
            event.currentTarget.isLimitedDisabled = true;
        }

        handler.call(this, event);
    };
}

const [enemyName, enemyImg, enemyLvl] = [
    getEl('name-enemy'),
    document.querySelector('.enemy .sprite'),
    document.querySelector('.enemy .lvl')
];

const $logs = getEl('logs');

let currentEnemyIndex = 0;
let enemy = enemies[currentEnemyIndex];

const random = (num) => Math.ceil(Math.random() * num);

function loadEnemy(pokemon) {
    const { name, img, level } = pokemon;

    enemyName.innerText = name;
    enemyImg.src = img;
    enemyLvl.innerText = `Lv. ${level}`;

    pokemon.resetHP();
}

function disableButtons(state) {
    [$btnKick, $btnHeal, $btnStun].forEach(btn => { if(!btn.isLimitedDisabled){ btn.disabled = state; } } );
}

function addBattleLog({ firstPerson, secondPerson = '', dmg = 0, remainingHP, maxHP, customText = null }) {
    const logEntry = document.createElement('div');
    logEntry.style.marginBottom = '5px';

    const story = customText
        ? customText
        : (secondPerson ? generateLog(firstPerson, secondPerson) : `${firstPerson} програв`);

    logEntry.innerHTML = `
        <p>${story}</p>
        <small>Втрати: ${dmg > 0 ? dmg : 0} HP, залишилось: ${remainingHP} / ${maxHP}</small>
    `;
    $logs.prepend(logEntry);
}

$btnKick.addEventListener('click', withClickLimit(30, 'Kick', function(){
    disableButtons(true);

    const dmgCharacter = random(character.dmg);
    const enemyIsDead = enemy.changeHP(dmgCharacter);

    addBattleLog({
        firstPerson: character.name,
        secondPerson: enemy.name,
        dmg: dmgCharacter,
        remainingHP: enemy.damageHP,
        maxHP: enemy.defaultHP
    });

    if (enemyIsDead) {
        addBattleLog({ firstPerson: enemy.name, secondPerson: '', dmg: 0, remainingHP: 0, maxHP: enemy.defaultHP });
        currentEnemyIndex++;
        if (currentEnemyIndex < enemies.length) {
            enemy = enemies[currentEnemyIndex];
            loadEnemy(enemy);
        } else {
            disableButtons(true);
            return;
        }
    }

    setTimeout(() => {
        if (!enemy.isStunned) {
            const dmgEnemy = random(enemy.dmg);
            const characterIsDead = character.changeHP(dmgEnemy);

            addBattleLog({
                firstPerson: enemy.name,
                secondPerson: character.name,
                dmg: dmgEnemy,
                remainingHP: character.damageHP,
                maxHP: character.defaultHP
            });

            if (characterIsDead) {
                disableButtons(true);
                return;
            }
        } else {
            addBattleLog({
                firstPerson: enemy.name,
                secondPerson: character.name,
                dmg: 0,
                remainingHP: enemy.damageHP,
                maxHP: enemy.defaultHP
            });
            enemy.isStunned = false;
        }
        disableButtons(false);
    }, 800);
}));

$btnHeal.addEventListener('click', withClickLimit(10, 'Heal', function() {
    disableButtons(true);
    const healChance = random(2);
    const healAmount = healChance === 1 ? Math.min(30, character.defaultHP - character.damageHP) : 0;

    if (healAmount > 0) {
        character.damageHP += healAmount;
        character.renderHP();
        addBattleLog({
            firstPerson: character.name,
            secondPerson: '',
            dmg: -healAmount,
            remainingHP: character.damageHP,
            maxHP: character.defaultHP,
            customText: `${character.name} відновив ${healAmount} HP`
        });
    } else {
        addBattleLog({
            firstPerson: character.name,
            secondPerson: '',
            dmg: 0,
            remainingHP: character.damageHP,
            maxHP: character.defaultHP,
            customText: `${character.name} спробував відновити HP, але нічого не вийшло`
        });
    }

    setTimeout(() => {
        const dmgEnemy = random(enemy.dmg);
        const characterIsDead = character.changeHP(dmgEnemy);

        addBattleLog({
            firstPerson: enemy.name,
            secondPerson: character.name,
            dmg: dmgEnemy,
            remainingHP: character.damageHP,
            maxHP: character.defaultHP
        });

        if (characterIsDead) {
            disableButtons(true);
            return;
        }
        disableButtons(false);
    }, 800);
}));

$btnStun.addEventListener('click', withClickLimit(20, 'Stun', function() {
    disableButtons(true);
    const stunChance = random(2);

    if (stunChance === 1) {
        enemy.isStunned = true;
        addBattleLog({
            firstPerson: character.name,
            secondPerson: enemy.name,
            dmg: 0,
            remainingHP: enemy.damageHP,
            maxHP: enemy.defaultHP,
            customText: `${character.name} оглушив ${enemy.name}!`
        });
    } else {
        addBattleLog({
            firstPerson: character.name,
            secondPerson: enemy.name,
            dmg: 0,
            remainingHP: enemy.damageHP,
            maxHP: enemy.defaultHP,
            customText: `${character.name} промахнувся - ${enemy.name} уникнув оглушення`
        });
    }

    const dmgCharacter = random(character.dmg * 0.25);
    const enemyIsDead = enemy.changeHP(dmgCharacter);

    addBattleLog({
        firstPerson: character.name,
        secondPerson: enemy.name,
        dmg: dmgCharacter,
        remainingHP: enemy.damageHP,
        maxHP: enemy.defaultHP
    });

    if (enemyIsDead) {
        addBattleLog({ firstPerson: enemy.name, secondPerson: '', dmg: 0, remainingHP: 0, maxHP: enemy.defaultHP });
        currentEnemyIndex++;
        if (currentEnemyIndex < enemies.length) {
            enemy = enemies[currentEnemyIndex];
            loadEnemy(enemy);
        } else {
            disableButtons(true);
            return;
        }
    }

    setTimeout(() => {
        if (!enemy.isStunned) {
            const dmgEnemy = random(enemy.dmg);
            const characterIsDead = character.changeHP(dmgEnemy);

            addBattleLog({
                firstPerson: enemy.name,
                secondPerson: character.name,
                dmg: dmgEnemy,
                remainingHP: character.damageHP,
                maxHP: character.defaultHP
            });

            if (characterIsDead) {
                addBattleLog({ firstPerson: character.name, secondPerson: '', dmg: 0, remainingHP: 0, maxHP: character.defaultHP });
                disableButtons(true);
                return;
            }
        } else {
            addBattleLog({
                firstPerson: enemy.name,
                secondPerson: character.name,
                dmg: 0,
                remainingHP: enemy.damageHP,
                maxHP: enemy.defaultHP
            });
            enemy.isStunned = false;
        }
        disableButtons(false);
    }, 800);
}));

function init() {
    console.log('Start Game!');
    character.renderHP();
    loadEnemy(enemy);
}

init();
