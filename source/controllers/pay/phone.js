module.exports = async (ctx) => {
  const id = Number(ctx.params.id);

  if (id > 0) {
    const card = await ctx.Model.getCard(id);
    const data = ctx.request.body;
    const amount = Number(data.sum);
    const balance = Number(card.balance);

    if (typeof card === 'undefined') {
      // throw new Error('Карта не найдена');
      ctx.status = 404;
      ctx.body = ('Карта не найдена');
    }

    if (amount <= balance) {
      await ctx.Model.decreaseBalance(id, amount);
      data.sum = -amount;
      await ctx.Model.createTransaction(data);
      ctx.body = 'Деньги успешно списаны';
    } else {
      // throw new Error('Недостаточно денег на карте');
      // ctx.statusCode = 500;
      ctx.status = 400;
      ctx.body = ('Недостаточно денег на карте');
    }
  } else {
    throw new Error('Id карты должен быть больше 0');
  }
};
