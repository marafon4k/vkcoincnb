/**
 * 
 * @author: marafon4k
 * @name: russia.effect
 * @version: 1.1.0
 * @description: vkcoin game: CNB.
 * VK: https://vk.com/id144068466 
 * GitHub: https://github.com/marafon4k
 * @license: MIT
 * 
 */

const { VK } = require('vk-io');
const vk = new VK({ token: " ТОКЕН " });
const acc = require('ПУТЬ БД');
const fs = require('fs');
const { Keyboard } = require('vk-io');
const { PhotoAttachment } = require('vk-io');
const { WallAttachment } = require('vk-io');
const { Attachment } = require('vk-io');
var timeInMs = Math.floor(Date.now() / 1000);

// VKCOIN 
const VKCOINAPI = require('node-vkcoinapi');
const vkcoin = new VKCOINAPI({
	key: " ТОКЕН VK COIN API",
	userId: 1,
	token: " ТОКЕН "
});
vkcoin.api.setShopName('Камень, ножницы, бумага');

// Заносим новых пользователей в БД
vk.updates.use((ctx, next) => {
	sid = ctx.senderId;

	if (!acc.users.find(a => a.vk === sid)) {
		acc.number++;
		acc.users.push({
			id: acc.number,
			vk: ctx.senderId,
			nickname: 'nickunknown',
			admin: 0,
			balance: 1000,
			bet: 0,
			avgBet: 0,
			freecoin: 0,
			blackList: false,
			coinsImport: 0,
			coinsExport: 0,
			betGame: 0,
			winGame: 0,
			lossGame: 0,
			dateReg: timeInMs,
			date: timeInMs,
			dateWithdraw: timeInMs,
			gameDate: timeInMs,
			dateHourBonuss: timeInMs,
			personEx: 1.5,
			level: 1,
			minGame: 5,
			minCoin: 2000
		});
		
	}
	
	if (ctx.senderId < 0) return;
	return next();
});

// Переменные и массивы
let minExport = 10000,					// Минимальная сумма вывода VKM
	countExport = 0,					// Общая сумма вывода
	countImport = 0,					// Общая сумма пополнений
	comissionSend = 1.2;

// personEx - персональный курс вывода

// ** start Commands **

vk.updates.setHearFallbackHandler(async(context, next) =>
{
	if (context.senderId != 144068466) {
	await vk.api.messages.send({
		peer_id: context.senderId,
		message: `Такой команды нет :-(`,
	   });
	}
});


vk.updates.hear(/^(🗺️меню|🗺️|меню|команды|старт|start|menu|начать|help|cmds|commands|назад)\s*$/i, async (context) => {
	
	await vk.api.messages.send({
	 peer_id: context.senderId,
	 message: `🗺️ Вы вернулись на главную`,
	 attachment: 'photo-181706017_456239169',
	 keyboard: Keyboard.keyboard([
	  [
	   Keyboard.textButton({
		label: '🎮Играть',
		color: Keyboard.POSITIVE_COLOR
	   }),
	   Keyboard.textButton({
		label: '🏧Пополнить',
		color: Keyboard.POSITIVE_COLOR
	   })
	  ],
	  [
	   Keyboard.textButton({
		label: '🎲Бонусы',
		color: Keyboard.DEFAULT_COLOR
	   }),
	   Keyboard.textButton({
		label: '📋Профиль',
		color: Keyboard.PRIMARY_COLOR
	   }),
	   Keyboard.textButton({
		label: '📖Помощь',
		color: Keyboard.DEFAULT_COLOR
	   })
	  ]
	 ])
	});
   });

vk.updates.hear(/^(📖Помощь|Помощь)\s*$/i, async(context) => {
	return context.send(`https://vk.com/@coinknb-fq`);
});

vk.updates.hear(/^(🎲Конкурс|конкурс|🎲)\s*$/i, async(context) => {	
	return context.send(`https://vk.com/coinknb?w=wall-181706017_480`);
});

vk.updates.hear(/setnickname\s(\d+)\s(.+)/i, async(context) => {

	let id = Number(context.$match[1]);
	let amount = context.$match[2];

	let user = acc.users.find(a => a.vk == context.senderId);
		if(user.admin == 1) {
			if(!context.$match[1]) return context.send(`Ошибка #1`);

			let giveUser = acc.users.find(a => a.vk === id)
				giveUser.nickname = amount;
			await context.send(`Успешно. Новый ник: ${giveUser.nickname}`)	
	}
});

vk.updates.hear(/^(🎮играть|🎮|играть|игра)/i, async(context) => {
	let user = acc.users.find(a => a.vk === context.senderId);
	let userBalanceVKC = user.balance;
	if(user.minCoin < 0) { user.minCoin = 5000; }
	if (user.balance >= 1000) {
	await context.send(`Выберите готовую сумму ставки или напишите произвольную (ставка сумма)`, {
		keyboard:
		Keyboard.keyboard([
			[
				Keyboard.textButton({
					label: `Ставка ` + userBalanceVKC,
					color: Keyboard.POSITIVE_COLOR
				})
			],
			[
				Keyboard.textButton({
					label: 'Ставка 10000',
					color: Keyboard.PRIMARY_COLOR
				}),
				Keyboard.textButton({
					label: 'Ставка 50000',
					color: Keyboard.PRIMARY_COLOR
				}),
				Keyboard.textButton({
					label: 'Ставка 100000',
					color: Keyboard.PRIMARY_COLOR
				})
			],
			[
				Keyboard.textButton({
					label: 'Ставка 250000',
					color: Keyboard.PRIMARY_COLOR
				}),
				Keyboard.textButton({
					label: 'Ставка 500000',
					color: Keyboard.PRIMARY_COLOR
				}),
				Keyboard.textButton({
					label: 'Ставка 1000000',
					color: Keyboard.PRIMARY_COLOR
				})
			],
			[
				Keyboard.textButton({
					label: '🗺️Меню',
					color: Keyboard.DEFAULT_COLOR
				})
			]])
		});
	} else {
		context.send(`Минимальная сумма для игры 1000 монет. Пополните счет или соберите бонусы для игры.\n\nВаш Баланс: ${user.balance}`);
	}
});

vk.updates.hear(/ставка\s([\d]+)/i, async(context) => {
	let amount = Number(context.$match[1]);
	let user = acc.users.find(a => a.vk === context.senderId);

	if(!context.$match[1]) return context.send(`Выберите готовую сумму ставки или напишите произвольную (ставка сумма)`);
	if(user.balance < amount) return context.send(`У вас недостаточно средств! Текущий баланс: ${user.balance}`);


	if (amount >= 1000) {

		user.betGame = amount; // сумма последней ставки	
		user.gameDate = 1; // начала ли игра
	
		await context.send(`[🔹] Бот сделал свой выбор! Если вы готовы, выберите камень ножницы или бумага`, {
			keyboard:
			Keyboard.keyboard([
				[
					Keyboard.textButton({
						label: 'Камень🕳',
						color: Keyboard.POSITIVE_COLOR
					}),
					Keyboard.textButton({
						label: 'Ножницы✂️',
						color: Keyboard.POSITIVE_COLOR
					}),
					Keyboard.textButton({
						label: 'Бумага📄',
						color: Keyboard.POSITIVE_COLOR
					})
				],
				[
					Keyboard.textButton({
						label: '🗺️Меню',
						color: Keyboard.DEFAULT_COLOR
					})
				]])
			});
} else {
	context.send('Вы не ввели сумму для ставки или сумма меньше 1000')
}
});

vk.updates.hear(/^(камень🕳|🕳|камень)\s*$/i, async(context) => {
	let user = acc.users.find(a => a.vk === context.senderId);
	if (user.gameDate == 1) {
		let selectBot = Math.random(1,0);
		let sum = (user.betGame*user.personEx)-user.betGame;
		user.bet++;
		user.avgBet += user.betGame;

		let raschet = Math.ceil(user.minCoin - user.betGame);
		if (raschet <= 0) {
			user.minCoin = 0
		} else {
			user.minCoin = Math.ceil(user.minCoin - user.betGame);
		}
		
		if (selectBot > 0.6) {
			user.balance = Math.ceil(user.balance + sum);
			user.gameDate *= 0;
			user.winGame++;
			context.send(`Вы выиграли. Бот выбрал ножницы`);
		} else {
			user.balance = user.balance - user.betGame;
			user.gameDate *= 0;
			user.lossGame++;
			context.send(`Вы проиграли. Бот выбрал бумагу`);
		}
	} else {
		context.send(`Вы не сделали ставку!`)
		user.gameDate *= 0;
	}
	await context.send(`🗺️ Вы вернулись на главную`, {
		keyboard:
		Keyboard.keyboard([
			[
				Keyboard.textButton({
					label: '🎮Играть',
					color: Keyboard.POSITIVE_COLOR
				})
			],
			[
				Keyboard.textButton({
					label: '🎲Бонусы',
					color: Keyboard.DEFAULT_COLOR
				}),
				Keyboard.textButton({
					label: '📋Профиль',
					color: Keyboard.PRIMARY_COLOR
				}),
				Keyboard.textButton({
					label: '📖Помощь',
					color: Keyboard.DEFAULT_COLOR
				})
			]])
		});
});


vk.updates.hear(/^(ножницы✂️|✂️|ножницы)\s*$/i, async(context) => {
	let user = acc.users.find(a => a.vk === context.senderId);
	if (user.gameDate == 1) {
		let selectBot = Math.random(1,0);
		let sum = (user.betGame*user.personEx)-user.betGame;
		user.bet++;
		user.avgBet += user.betGame;

		let raschet = Math.ceil(user.minCoin - user.betGame);
		if (raschet <= 0) {
			user.minCoin = 0
		} else {
			user.minCoin = Math.ceil(user.minCoin - user.betGame);
		}

		if (selectBot > 0.55) {
			user.balance = Math.ceil(user.balance + sum);
			user.gameDate *= 0;
			user.winGame++;
			context.send(`Вы выиграли. Бот выбрал бумагу`);
		} else {
			user.balance = user.balance - user.betGame;
			user.gameDate *= 0;
			user.lossGame++;
			context.send(`Вы проиграли. Бот выбрал камень`);
		}
	} else {
		context.send(`Вы не сделали ставку!`)
		user.gameDate *= 0;
	}
	await context.send(`🗺️ Вы вернулись на главную`, {
		keyboard:
		Keyboard.keyboard([
			[
				Keyboard.textButton({
					label: '🎮Играть',
					color: Keyboard.POSITIVE_COLOR
				})
			],
			[
				Keyboard.textButton({
					label: '🎲Бонусы',
					color: Keyboard.DEFAULT_COLOR
				}),
				Keyboard.textButton({
					label: '📋Профиль',
					color: Keyboard.PRIMARY_COLOR
				}),
				Keyboard.textButton({
					label: '📖Помощь',
					color: Keyboard.DEFAULT_COLOR
				})
			]])
		});
});

vk.updates.hear(/^(бумага📄|📄|бумага)\s*$/i, async(context) => {
	let user = acc.users.find(a => a.vk === context.senderId);
	if (user.gameDate == 1) {
		let selectBot = Math.random(1,0);
		let sum = (user.betGame*user.personEx)-user.betGame;
		user.bet++;
		user.avgBet += user.betGame;

		let raschet = Math.ceil(user.minCoin - user.betGame);
		if (raschet <= 0) {
			user.minCoin = 0
		} else {
			user.minCoin = Math.ceil(user.minCoin - user.betGame);
		}

		if (selectBot > 0.6) {
			user.balance = Math.ceil(user.balance + sum);
			user.gameDate *= 0;
			user.winGame++;
			context.send(`Вы выиграли. Бот выбрал камень`);
		} else {
			user.balance = user.balance - user.betGame;
			user.gameDate *= 0;
user.lossGame++;
			context.send(`Вы проиграли. Бот выбрал ножницы`);
		}
	} else {
		context.send(`Вы не сделали ставку!`)
		user.gameDate *= 0;
	}
	await context.send(`🗺️ Вы вернулись на главную`, {
		keyboard:
		Keyboard.keyboard([
			[
				Keyboard.textButton({
					label: '🎮Играть',
					color: Keyboard.POSITIVE_COLOR
				})
			],
			[
				Keyboard.textButton({
					label: '🎲Бонусы',
					color: Keyboard.DEFAULT_COLOR
				}),
				Keyboard.textButton({
					label: '📋Профиль',
					color: Keyboard.PRIMARY_COLOR
				}),
				Keyboard.textButton({
					label: '📖Помощь',
					color: Keyboard.DEFAULT_COLOR
				})
			]])
		});
});

vk.updates.hear(/^(📋профиль|📋|профиль|баланс|balance|банкомат)\s*$/i, async(context) => {
	let user = acc.users.find(a => a.vk === context.senderId);
	if(user.avgBet >= 10000 && user.level == 1) {
		user.level++;
		user.personEx = 1.51;
		user.balance += 1000;
		vk.api.messages.send({
			message: `Поздравляем, ваш уровень был повышен. Теперь ваш уровень: ${user.level-1}\nСумма с побед увеличена до ${user.personEx}
			Так же вы получили дополнительный бонус в размере 1000 монет.`,
			peer_id: context.senderId,
		})
	} else if (user.avgBet >= 50000 && user.level == 2) {
		user.level++;
		user.personEx = 1.53;
		user.balance += 2000;
		vk.api.messages.send({
			message: `Поздравляем, ваш уровень был повышен. Теперь ваш уровень: ${user.level-1}\nСумма с побед увеличена до ${user.personEx}
			Так же вы получили дополнительный бонус в размере 2000 монет`,
			peer_id: context.senderId,
		})
	} else if (user.avgBet >= 250000 && user.level == 3) {
		user.level++;
		user.personEx = 1.55;
		user.balance += 3000;
		vk.api.messages.send({
			message: `Поздравляем, ваш уровень был повышен. Теперь ваш уровень: ${user.level-1}\nСумма с побед увеличена до ${user.personEx}
			Так же вы получили дополнительный бонус в размере 3000 монет`,
			peer_id: context.senderId,
		})
	} else if (user.avgBet >= 500000 && user.level == 4) {
		user.level++;
		user.personEx = 1.6;
		user.balance += 5000;
		vk.api.messages.send({
			message: `Поздравляем, ваш уровень был повышен. Теперь ваш уровень: ${user.level-1}\nСумма с побед увеличена до ${user.personEx}
			Так же вы получили дополнительный бонус в размере 5000 монет`,
			peer_id: context.senderId,
		})
	} else if (user.avgBet >= 1000000 && user.level == 5) {
		user.level++;
		user.personEx = 1.65;
		user.balance += 10000;
		vk.api.messages.send({
			message: `Поздравляем, ваш уровень был повышен. Теперь ваш уровень: ${user.level-1}\nСумма с побед увеличена до ${user.personEx}
			Так же вы получили дополнительный бонус в размере 10000 монет`,
			peer_id: context.senderId,
		})
	} else if (user.avgBet >= 7500000 && user.level == 6) {
		user.level++;
		user.personEx = 1.7;
		user.balance += 25000;
		vk.api.messages.send({
			message: `Поздравляем, ваш уровень был повышен. Теперь ваш уровень: ${user.level-1}\nСумма с побед увеличена до ${user.personEx}
			Так же вы получили дополнительный бонус в размере 25000 монет`,
			peer_id: context.senderId,
		})
	} else if (user.avgBet >= 500000000 && user.level == 7) {
		user.level++;
		user.personEx = 1.75;
		user.balance += 100000;
		vk.api.messages.send({
			message: `Поздравляем, ваш уровень был повышен. Теперь ваш уровень: ${user.level-1}\nСумма с побед увеличена до ${user.personEx}
			Так же вы получили дополнительный бонус в размере 100000 монет`,
			peer_id: context.senderId,
		})
		await vk.api.messages.send({
			peer_id: 144068466,
			message: `Пользователь @id${user.vk} (${user.nickname}) достиг ${user.level} уровня.`
	});	
	} else if (user.avgBet >= 1000000000 && user.level == 8) {
		user.level++;
		user.personEx = 1.80;
		user.balance += 1000000;
		vk.api.messages.send({
			message: `Поздравляем, ваш уровень был повышен. Теперь ваш уровень: ${user.level-1}\nСумма с побед увеличена до ${user.personEx}
			Так же вы получили дополнительный бонус в размере 1000000 монет`,
			peer_id: context.senderId,
		})
	} else if (user.avgBet >= 10000000000 && user.level == 9) {
		user.level++;
		user.personEx = 1.85;
		user.balance += 10000000;
		vk.api.messages.send({
			message: `Поздравляем, ваш уровень был повышен. Теперь ваш уровень: ${user.level-1}\nСумма с побед увеличена до ${user.personEx}
			Так же вы получили дополнительный бонус в размере 10000000 монет`,
			peer_id: context.senderId,
		})
	} else if (user.avgBet >= 100000000000 && user.level == 10) {
		user.level++;
		user.personEx = 1.9;
		user.balance += 1000000000;
		vk.api.messages.send({
			message: `Поздравляем, ваш уровень был повышен. Теперь ваш уровень: ${user.level-1}\nСумма с побед увеличена до ${user.personEx}
			Так же вы получили дополнительный бонус в размере 1000000000 монет`,
			peer_id: context.senderId,
		})
	} else if (user.avgBet > 100000000000 && user.level == 11) {
		vk.api.messages.send({
			message: `Ваш уровень: ${user.level-1}\nСумма с побед: ${user.personEx}`,
			peer_id: context.senderId,
		})
	}
	let procWin = Number(Math.ceil((user.winGame/user.bet)*100));
	await context.send(`📋 Ваш профиль:

	💰 Баланс: ${user.balance} коинов
	🎮 Всего игр: ${user.bet}
	🎲 Процент побед: ${procWin}%
	📲 Всего выведено: ${user.coinsExport}
	🆙 Ваш уровень: ${user.level-1}
	👱 Ник: ${user.nickname}
	🆔 Ваш ID: ${user.vk}

	Напишите сменитьник для изменения`, {
		keyboard:
		Keyboard.keyboard([
			[
				Keyboard.textButton({
					label: '🏧Пополнить',
					color: Keyboard.POSITIVE_COLOR
				}),
				Keyboard.textButton({
					label: 'Перевести другу',
					color: Keyboard.POSITIVE_COLOR
				}),
				Keyboard.textButton({
					label: '🎁Вывод',
					color: Keyboard.NEGATIVE_COLOR
				})
			],
			[
				Keyboard.textButton({
					label: '🗺️Меню',
					color: Keyboard.DEFAULT_COLOR
				})
			]])
		});
});

vk.updates.hear(/^(перевести другу)\s*$/i, async(context) => {
	let user = acc.users.find(a => a.vk === context.senderId);
	context.send(`Пользователь ${user.nickname}, для перевода вам нужно знать id друга(цифры из профиля).
	Пример команды для перевода: send 144068466 10000`)
});


vk.updates.hear(/send\s(\d+)\s(\d+)/i, async(context) => {
	if(!context.$match[1]) return context.send(`Вы не ввели цифровой ID получателя`);
	if(!context.$match[2]) return context.send(`Сумма перевода не может быть меньше ${minExport}`);

	let user = acc.users.find(a => a.vk == context.senderId);
	let id = Number(context.$match[1]);
	let amount = Number(context.$match[2]);
	let giveUser = acc.users.find(a => a.vk === id)
	if (!giveUser) return context.send(`Пользователь с id ${id} не найден в нашей базе`);
		if(user.balance >= amount*comissionSend && amount >= minExport && giveUser.vk) {
				user.balance = user.balance - (amount * comissionSend);
				giveUser.balance += amount;
				// giveUser.minGame = giveUser.bet + 1;
				user.minCoin = Math.ceil(user.minCoin - amount/1.5);
				giveUser.minCoin = Math.ceil(giveUser.minCoin + amount/2);
				await context.send(`${user.nickname}, Вы успешно перевели ${amount} коинов на страницу vk.com/id${id}`)
				await vk.api.messages.send({
					peer_id: giveUser.vk,
					message: `Пользователь @id${user.vk} (${user.nickname})  перевел вам ${amount} монет`
			});	
	} else if (user.vk === id) {
			context.send(`Ошибка! Вы пытаетесь отправить монеты самому себе`)
	} else if (user.balance < amount*comissionSend) {
		context.send(`Для успешного перевода у вас должна быть сумма с учетом комисси: ${amount*comissionSend} монет`); 
	} else {
		context.send(`Сумма должна быть больше ${minExport} монет`)
	}
});

vk.updates.hear(/^(сбросить)\s*$/i, async(context) => {
	let user = acc.users.find(a => a.vk === context.senderId);
	user.bet = 0;
	user.winGame = 0;
	user.lossGame = 0;
});

// admin команды
vk.updates.hear(/setbalance\s(\d+)\s(\d+)/i, async(context) => {
	let id = Number(context.$match[1]);
	let amount = Number(context.$match[2]);

	let user = acc.users.find(a => a.vk == context.senderId);
		if(user.admin == 1) {
			if(!context.$match[1]) return context.send(`Ошибка #1`);

			let giveUser = acc.users.find(a => a.vk === id)
				giveUser.balance = amount;
			await context.send(`Успешно. Новый баланс: ${giveUser.balance}`)	
	}
});

vk.updates.hear(/unban\s(\d+)\s(\d+)/i, async(context) => {
	let id = Number(context.$match[1]);
	let amount = Number(context.$match[2]);

	let user = acc.users.find(a => a.vk == context.senderId);
		if(user.admin == 1) {
			if(!context.$match[1]) return context.send(`Ошибка #1`);

			let giveUser = acc.users.find(a => a.vk === id)
				giveUser.minCoin = amount;
			await context.send(`Успешно. Ставка для вывода: ${giveUser.minCoin}`)	
	}
});

vk.updates.hear(/givebalance\s(\d+)\s(\d+)/i, async(context) => {
	let id = Number(context.$match[1]);
	let amount = Number(context.$match[2]);

	let user = acc.users.find(a => a.vk == context.senderId);
		if(user.admin == 1) {
			if(!context.$match[1]) return context.send(`Ошибка #1`);

			let giveUser = acc.users.find(a => a.vk === id)
				giveUser.balance += amount;
			await context.send(`Успешно. Выдал: ${amount}. Новый баланс: ${giveUser.balance}`)	
	}
});

vk.updates.hear(/setlevel\s(\d+)\s(\d+)/i, async(context) => {
	let id = Number(context.$match[1]);
	let amount = Number(context.$match[2]);

	let user = acc.users.find(a => a.vk == context.senderId);
		if(user.admin == 1) {
			if(!context.$match[1]) return context.send(`Ошибка #1`);

			let giveUser = acc.users.find(a => a.vk === id)
				giveUser.level = amount;
			await context.send(`Успешно. Новый уровень: ${giveUser.level-1}`);
	}
});

vk.updates.hear(/setfreecoin\s(\d+)\s(\d+)/i, async(context) => {
	let id = Number(context.$match[1]);
	let amount = Number(context.$match[2]);

	let user = acc.users.find(a => a.vk == context.senderId);
		if(user.admin == 1) {
			if(!context.$match[1]) return context.send(`Ошибка #1`);

			let giveUser = acc.users.find(a => a.vk === id)
				giveUser.freecoin = amount;
			await context.send(`Успешно. Новый freecoin: ${giveUser.freecoin}`);
	}
});

vk.updates.hear(/nullbonus\s(\d+)/i, async(context) => {
	let id = Number(context.$match[1]);

	let user = acc.users.find(a => a.vk == context.senderId);
		if(user.admin == 1) {
			if(!context.$match[1]) return context.send(`Ошибка #1`);

			let giveUser = acc.users.find(a => a.vk === id)
				giveUser.date *= 0;
			await context.send(`Успешно. Бонус можно собрать снова.`)	
	}
});

vk.updates.hear(/setnickname\s(\d+)\s(.+)/i, async(context) => {
	let id = Number(context.$match[1]);
	let amount = context.$match[2];
	let giveUser = acc.users.find(a => a.vk === id)
	if (!giveUser) return context.send(`Пользователь с id ${id} не найден в нашей базе`);
	let user = acc.users.find(a => a.vk == context.senderId);
		if(user.admin == 1) {
			if(!context.$match[1]) return context.send(`Ошибка #1`);

			let giveUser = acc.users.find(a => a.vk === id)
				giveUser.nickname = amount;
			await context.send(`Успешно. Новый ник: ${giveUser.nickname}`);
			await vk.api.messages.send({
				peer_id: giveUser.vk,
				message: `Администратор сменил ваш ник на ${amount}`
		});	
	}
});

vk.updates.hear(/^сменитьник\s*$/i, async(context) => {
	context.send('Вы не указали новый ник. Пример команды:\nсменитьник гомогенизированный')
});

vk.updates.hear(/^\s*(?:сменитьник)\s*([^]{3,15})/i, async(context) => {
	let user = acc.users.find(a => a.vk === context.senderId);
	if(!context.$match[1]) return context.send(`${user.nickname}, вы не указали новый ник или количество символов <3 или >15.`)
	user.nickname = context.$match[1];
	await context.send(`Ваш новый ник: ${user.nickname}`)	
});


vk.updates.hear(/^🎲Бонусы|🎲|Бонусы|бонус\s*$/i, async(context) => {
	let user = acc.users.find(a => a.vk === context.senderId);
	if (user.freecoin === 0) {
	await context.send(`Выберите нужный бонус`, {
		keyboard:
		Keyboard.keyboard([
			[
				Keyboard.textButton({
					label: 'Ежедневный',
					color: Keyboard.PRIMARY_COLOR
				}),
				Keyboard.textButton({
					label: 'Каждый час',
					color: Keyboard.POSITIVE_COLOR
				}),
				Keyboard.textButton({
					label: 'Мини Конкурсы',
					color: Keyboard.PRIMARY_COLOR
				})
			],
			[
				Keyboard.textButton({
					label: 'ЛутБокс 1 уровень',
					color: Keyboard.NEGATIVE_COLOR
				})
			],
			[
				Keyboard.textButton({
					label: '🗺️Меню',
					color: Keyboard.DEFAULT_COLOR
				})
			]])
		});
	} else if (user.freecoin === 1 && user.level === 3) {
		await context.send(`Выберите нужный бонус`, {
			keyboard:
			Keyboard.keyboard([
				[
					Keyboard.textButton({
						label: 'Ежедневный',
						color: Keyboard.PRIMARY_COLOR
					}),
					Keyboard.textButton({
						label: 'Каждый час',
						color: Keyboard.POSITIVE_COLOR
					}),
					Keyboard.textButton({
						label: 'Мини Конкурсы',
						color: Keyboard.PRIMARY_COLOR
					})
				],
				[
					Keyboard.textButton({
						label: 'ЛутБокс 2 уровень',
						color: Keyboard.POSITIVE_COLOR
					})
				],
				[
					Keyboard.textButton({
						label: '🗺️Меню',
						color: Keyboard.DEFAULT_COLOR
					})
				]])
			});
	} else if (user.freecoin === 2 && user.level === 6) {
		await context.send(`Выберите нужный бонус`, {
			keyboard:
			Keyboard.keyboard([
				[
					Keyboard.textButton({
						label: 'Ежедневный',
						color: Keyboard.PRIMARY_COLOR
					}),
					Keyboard.textButton({
						label: 'Каждый час',
						color: Keyboard.POSITIVE_COLOR
					}),
					Keyboard.textButton({
						label: 'Мини Конкурсы',
						color: Keyboard.PRIMARY_COLOR
					})
				],
				[
					Keyboard.textButton({
						label: 'ЛутБокс 5 уровень',
						color: Keyboard.POSITIVE_COLOR
					})
				],
				[
					Keyboard.textButton({
						label: '🗺️Меню',
						color: Keyboard.DEFAULT_COLOR
					})
				]])
			});
	} else {
		await context.send(`Выберите нужный бонус`, {
			keyboard:
			Keyboard.keyboard([
				[
					Keyboard.textButton({
						label: 'Ежедневный',
						color: Keyboard.PRIMARY_COLOR
					}),
					Keyboard.textButton({
						label: 'Каждый час',
						color: Keyboard.POSITIVE_COLOR
					}),
					Keyboard.textButton({
						label: 'Мини Конкурсы',
						color: Keyboard.PRIMARY_COLOR
					})
				],
				[
					Keyboard.textButton({
						label: '🗺️Меню',
						color: Keyboard.DEFAULT_COLOR
					})
				]])
			});
	}
});
function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

vk.updates.hear(/^(ЛутБокс 1 уровень)\s*$/i, async(context) => {
	let user = acc.users.find(a => a.vk === context.senderId);
	if (user.level = 2 && user.freecoin === 0) {
		let selectBot = Math.ceil(getRandomInRange(1,9999999)/10000);
		user.freecoin++;
		user.balance = user.balance + selectBot;
		await context.send(`Вам выпал бонус в размере ${selectBot} монет
		\nВаш баланс: ${user.balance}`, {
			keyboard:
			Keyboard.keyboard([
				[
					Keyboard.textButton({
						label: 'Ежедневный',
						color: Keyboard.PRIMARY_COLOR
					}),
					Keyboard.textButton({
						label: 'Каждый час',
						color: Keyboard.POSITIVE_COLOR
					}),
					Keyboard.textButton({
						label: 'Мини Конкурсы',
						color: Keyboard.PRIMARY_COLOR
					})
				],
				[
					Keyboard.textButton({
						label: '🗺️Меню',
						color: Keyboard.DEFAULT_COLOR
					})
				]])
			});
	} else {
		context.send('Вы уже брали этот лутбокс, попробуйте повысить свой уровень');
	}
});

vk.updates.hear(/^(ЛутБокс 2 уровень)\s*$/i, async(context) => {
	let user = acc.users.find(a => a.vk === context.senderId);
	if (user.level >= 3 && user.level <= 5 && user.freecoin === 1) {
		let selectBot = Math.ceil(getRandomInRange(1,99999999)/10000);
		user.freecoin++;
		user.balance = user.balance + selectBot;
		context.send(`Вам выпал бонус в размере ${selectBot} монет
		\nВаш баланс: ${user.balance}`)
	} else {
		context.send('Попробуйте повысить свой уровень');
	}
});

vk.updates.hear(/^(ЛутБокс 5 уровень)\s*$/i, async(context) => {
	let user = acc.users.find(a => a.vk === context.senderId);
	if (user.level >= 6 && user.freecoin === 2) {
		let selectBot = Math.ceil(getRandomInRange(1,99999999)/10000);
		user.freecoin++;
		user.balance = user.balance + selectBot;
		context.send(`Вам выпал бонус в размере ${selectBot} монет
		\nВаш баланс: ${user.balance}`)
	} else {
		context.send('Попробуйте повысить свой уровень');
	}
});

  
vk.updates.hear(/^(разовый)\s*$/i, async(context) => {
	let user = acc.users.find(a => a.vk === context.senderId);
	if (user.freecoin === 0) {
	let testBonus = getRandomInRange(10000, 20000);
	user.minCoin = Math.ceil(user.minCoin + testBonus);
	user.balance = Math.ceil(user.balance + testBonus);
	user.freecoin++;
	await vk.api.messages.send({
		peer_id: context.senderId,

		message: `Вам выпал разовый бонус в размере: ${testBonus}`
		
});
	} else { 
		await vk.api.messages.send({
			peer_id: context.senderId,
	
			message: `🏆Вы уже собрали этот бонус🏆`
			
	});
	}
});


vk.updates.hear(/^(Мини конкурсы)\s*$/i, async(context) => {	
	return context.send(`Вступай в нашу новую беседу, в ней мы проводим всякие интересные мини конкурсы и раздачи. А так же просто общаемся\n
	https://vk.me/join/AJQ1d46ZAhFNTjrm/X_DwhsS`);
});

vk.updates.hear(/^(Конкурс|конкурсы)\s*$/i, async(context) => {	
	return context.send(`Нет активных конкурсов`);
});

vk.updates.hear(/^(каждый час)\s*$/i, async(context) => {
	let user = acc.users.find(a => a.vk === context.senderId);
	var timeInMsW = Math.floor(Date.now() / 1000);
	let teste = Math.floor((3600-(timeInMsW-user.dateHourBonuss))/60);
	let testeSec = Math.floor((3600-(timeInMsW-user.date)));
	if (timeInMsW < user.dateHourBonuss+3600) {
		if (teste >= 1) { 
		context.send(`🏆Бонус будет доступен через ${teste} мин.🏆`)
		} else if ( teste > 0 && teste < 1){
			context.send(`🏆Бонус будет доступен через ${testeSec} сек.🏆`)
		} else {
			context.send(`error #4. Try again later.`);
		}
	} else {
		let selectBot = Math.ceil(getRandomInRange(100,1000));
		user.balance = user.balance + selectBot;
		user.dateHourBonuss = timeInMsW;
		context.send(`Вам выпал бонус в размере ${selectBot} монет
		\nВаш баланс: ${user.balance}`)
	}
});

vk.updates.hear(/^ежедневный\s*$/i, async(context) => {
	let user = acc.users.find(a => a.vk === context.senderId);
	var timeInMsW = Math.floor(Date.now() / 1000);
	let teste = Math.floor((86400-(timeInMsW-user.date))/60/60);
	let testeMin = Math.floor((86400-(timeInMsW-user.date))/60);
	let testeSec = Math.floor(86400-(timeInMsW-user.date))%60;
	if (timeInMsW < user.date+86400) {
		if (teste >= 1) {
		context.send(`🏆Бонус будет доступен через ${teste} ч. ${testeMin%60} мин.🏆`)
		} else {
			context.send(`🏆Бонус будет доступен через ${testeMin} мин. ${testeSec} сек.🏆`)
		}
	} else {
		let selectBot = Math.ceil(getRandomInRange(1000,5000));
		user.balance = Math.ceil(user.balance + selectBot);
		user.date = timeInMsW;
		// user.minGame = user.bet + 5;
		user.minCoin = Math.ceil(user.minCoin + selectBot);
		context.send(`Вам выпал ежедневный бонус в размере ${selectBot} монет
		\nВаш баланс: ${user.balance}`)
	}
});

vk.updates.hear(/^(🎁вывод|🎁|выв(?:од|ести)|💱курс|💱|курс)\s*$/i, async(context) => {
	var sendId = context.senderId;
	let user = acc.users.find(a => a.vk === sendId);
	// if(!user.minGame) { user.minGame = 10; }
	if(user.minCoin < 0) { user.minCoin = 5000; }
	const myBalance = Math.ceil(await vkcoin.api.getMyBalance());
	if (user.balance >= minExport && user.balance < myBalance && user.minCoin === 0 || user.admin === 1) {
		await context.send(`[🔹] Вы уверены, что хотите вывести ${user.balance} VKCoins?\n\nPS Не забудьте подписаться =)`, {
			keyboard:
			Keyboard.keyboard([
				[
					Keyboard.textButton({
						label: 'Да, вывести',
						color: Keyboard.NEGATIVE_COLOR
					})
				],
				[
					Keyboard.textButton({
						label: '🗺️Меню',
						color: Keyboard.DEFAULT_COLOR
					})
				]])
			});
} else if (user.minCoin != 0) {
	context.send(`В связи с анти-трейд системой, для вывода нужно сыграть на ${user.minCoin} монет`)
} else if (user.balance < minExport) {
	let sumT = minExport - user.balance;
	return context.send(`[🔸] У вас недостаточно средств! \nДля вывода нехватает: ${sumT}\n\nВаш баланс: ${user.balance}`);
} else {
	return context.send(`Неизвестная ошибка!`);
}
});

vk.updates.hear(/^(да, вывести)\s*$/i, async (context) => {
	let user = acc.users.find(a => a.vk === context.senderId);
	var timeInMsW = Math.floor(Date.now() / 1000);
	let exportBalance = Math.ceil(user.balance * 1000);
	// if (timeInMsW < user.dateWithdraw + 60 && user.admin != 1) {
	//  context.send('Нельзя выводить так часто!')
	if (user.balance < minExport) {
	 let sumT = minExport - user.balance;
	 context.send(`У вас недостаточно средств! \nДля вывода нехватает: ${sumT}`);
	} else if (user.minCoin && user.balance > 0) {
	 context.send(`Для вывода нужно сыграть на ${user.minCoin} монет`)
	} else if (user.balance >= minExport && user.minCoin === 0 || user.admin === 1) {
	 let send = await vkcoin.api.sendPayment(context.senderId, exportBalance, true);
	 if (send) {
	  user.balance *= 0;
	  countExport += exportBalance / 1000;
	  user.coinsExport += exportBalance / 1000;
	  console.log(`User https://vk.com/id${user.vk}/ withdraw: ${exportBalance/1000} VKCoins`);
	  user.dateWithdraw = timeInMsW;
	  await context.send(`Мы отправили вам ${exportBalance/1000} VKCoin, можете проверить!`, {
	   keyboard: Keyboard.keyboard([
		[
		 Keyboard.textButton({
		  label: '🗺️Меню',
		  color: Keyboard.DEFAULT_COLOR
		 })
		]
	   ])
	  });
	 }
	} else {
	 context.send(`Неизвестная ошибка. Попробуйте позже или напишите администратору.`)
	}
   });

async function runPolling() {
    await vkcoin.updates.startPolling(console.log);

    vkcoin.updates.onTransfer((event) => {
        const {
            amount,
            fromId,
            id
        } = event;

        const score = vkcoin.api.formatCoins(amount);

        console.log(
            `Payment received (${id}) from https://vk.com/id${fromId} in the amount of ${score} VKCoins`
        );

        let user = acc.users.find(a => a.vk === fromId);

        if (amount > 1000) {
            user.balance = Math.ceil(amount / 1000) + user.balance;
            countImport += Math.ceil(amount / 1000);
			user.coinsImport = Math.ceil(amount / 1000 + user.coinsImport);
			user.minCoin = Math.ceil(user.minCoin + Math.ceil(amount/1000));

            vk.api.messages.send({
                message: `Поступил платеж (tx: ${id}) от вас в размере ${score} коинов.\nВаш баланс: ${user.balance}`,
                user_id: fromId
            })
        } else {
            vk.api.messages.send({
                message: 'Поступила сумма меньше минимальной.',
                user_id: fromId
            })
        }
    });
}

runPolling().catch(console.error);

vk.updates.hear(/^(🏧пополнить|пополнить|🏧)\s*$/i, async (context) => {
	
    const link = vkcoin.api.getLink(100000000, false);
    context.send(`Вот ваша одноразовая ссылка для пополнения игрового счета: ${link}`);
});

vk.updates.hear(/^(🏧банк|🏧|банк|bank)\s*$/i, async(context) => {
	const myBalance = await vkcoin.api.getMyBalance();
	context.send(`В нашем банке сейчас: ${myBalance/1000} коинов`);
});

vk.updates.hear(/^(стата)\s*$/i, async(context) => {
	let user = acc.users.find(a => a.vk === context.senderId);

	if (user.admin == 1) {
		context.send(`За текущую сессию\nВывели на: ${countExport} коинов\n\nПополнили на: ${countImport}`)
	} else {

	}
});

// Запись 1000 последних транзакции с ботом в файл
vk.updates.hear(/^(транзакции)\s*$/i, async(context) => {
	let user = acc.users.find(a => a.vk === context.senderId);
	let tx = [1];
	const result = await vkcoin.api.getTransactionList(tx);
	if (user.admin == 1) {
		setInterval(async() => {
			fs.writeFileSync("/root/tx.json", JSON.stringify(result, 10, "\t"))
		}, 1500);
	}
	else {

	}
});

vk.updates.start();

// ** end commands **

setInterval(async() => {
	fs.writeFileSync("/root/bot/acc.json", JSON.stringify(acc, 10, "\t"))
}, 1500);