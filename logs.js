function generateLog(firstPerson, secondPerson) {
    const logs = [
        `${secondPerson} згадав щось важливе, але несподівано ${firstPerson}, не тямлячи себе від переляку, ударив його по руці.`,
        `${secondPerson} поперхнувся, і за це ${firstPerson} від страху врізав коліном у лоба ворога.`,
        `${secondPerson} забувся, але в цей час нахабний ${firstPerson}, прийнявши вольове рішення, підкрався і вдарив.`,
        `${secondPerson} прийшов до тями, але несподівано ${firstPerson} випадково наніс потужний удар.`,
        `${secondPerson} здивувався, а ${firstPerson}, похитнувшись, завдав підлого удару.`,
        `${secondPerson} висморкався, але ${firstPerson} несподівано провів дроблячий удар.`,
        `${secondPerson} похитнувся, і зненацька нахабний ${firstPerson} без причини вдарив у ногу.`,
        `${secondPerson} розсердився, як раптом ${firstPerson} випадково врізав стопою в живіт супротивника.`,
        `${secondPerson} намагався щось сказати, але ${firstPerson} зі скуки розбив брову супернику.`,
    ];

    return logs[random(logs.length - 1)];
}
