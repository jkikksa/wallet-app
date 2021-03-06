import React, {Component} from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import styled from 'emotion/react';
import {injectGlobal} from 'emotion';
import CardInfo from 'card-info';
import {
  CardsBar,
  Header,
  History,
  Prepaid,
  MobilePayment,
  Withdraw
} from './';

import './fonts.css';

/* eslint-disable */
injectGlobal`
  html,
  body {
    margin: 0;
  }

  #root {
    height: 100%;
    font-family: 'Open Sans';
    color: #000;
  }
`;
/* eslint-enable */

const Wallet = styled.div`
  display: flex;
  min-height: 100%;
  background-color: #fcfcfc;
`;

const CardPane = styled.div`
  flex-grow: 1;
`;

const Workspace = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: 970px;
  padding: 15px;
`;

/**
 * Приложение
 */
class App extends Component {
  /**
   * Конструктор
   * @param {Object} props свойства компонента
   */
  constructor(props) {
    super();

    this.onPaymentSuccess = () => {
      this.updateCardsList();
      this.updateCardHistory();
    };

    this.state = {
      cardsList: this.prepareCardsData(props.data),
      cardHistory: [],
      activeCardIndex: 0,
    };
  }

  componentDidMount() {
    this.updateCardHistory();
  }

  updateCardsList() {
    axios.get('/cards')
        .then((res) => {
          this.setState({
            cardsList: this.prepareCardsData(res.data)
          });
          return res.data;
        })
        .catch((error) => {
          console.log(error);
        });
  }

  updateCardHistory() {
    axios.get('/cards/transactions/')
        .then((res) => {
          const cardHistory = res.data.map((data) => {
            const card = this.state.cardsList.find((it) => it.id === data.cardId);
            return card ? Object.assign({}, data, {card}) : data;
          });
          this.setState({
            cardHistory
          });
          return res.data;
        })
        .catch((error) => {
          console.log(error);
        });
  }

  /**
   * Подготавливает данные карт
   *
   * @param {Object} cardsData данные карт
   * @return {Object[]}
   */
  prepareCardsData(cardsData) {
    return cardsData.map((card) => {
      const cardInfo = new CardInfo(card.cardNumber, {
        banksLogosPath: '/assets/',
        brandsLogosPath: '/assets/'
      });

      return {
        id: card.id,
        balance: card.balance,
        number: cardInfo.numberNice,
        bankName: cardInfo.bankName,
        theme: {
          bgColor: cardInfo.backgroundColor,
          textColor: cardInfo.textColor,
          bankLogoUrl: cardInfo.bankLogoSvg,
          brandLogoUrl: cardInfo.brandLogoSvg,
          bankSmLogoUrl: `/assets/${cardInfo.bankAlias}-history.svg`
        }
      };
    });
  }

  /**
   * Обработчик переключения карты
   *
   * @param {Number} activeCardIndex индекс выбранной карты
   */
  onCardChange(activeCardIndex) {
    this.setState({activeCardIndex});
  }

  /**
   * Рендер компонента
   *
   * @override
   * @return {JSX}
   */
  render() {
    const {cardsList, activeCardIndex, cardHistory} = this.state;
    const activeCard = cardsList[activeCardIndex];

    const inactiveCardsList = cardsList.filter((card, index) => index === activeCardIndex ? false : card);
    const filteredHistory = cardHistory.filter((data) => data.cardId === activeCard.id);

    return (
      <Wallet>
        <CardsBar
          activeCardIndex={activeCardIndex}
          cardsList={cardsList}
          onCardChange={(activeCardIndex) => this.onCardChange(activeCardIndex)} />
        <CardPane>
          <Header activeCard={activeCard} />
          <Workspace>
            <History cardHistory={filteredHistory} />
            <Prepaid
              activeCard={activeCard}
              inactiveCardsList={inactiveCardsList}
              onCardChange={(newActiveCardIndex) => this.onCardChange(newActiveCardIndex)}
              onPaymentSuccess={this.onPaymentSuccess}
            />
            <MobilePayment activeCard={activeCard} onPaymentSuccess={this.onPaymentSuccess}/>
            <Withdraw
              activeCard={activeCard}
              inactiveCardsList={inactiveCardsList}
              onPaymentSuccess={this.onPaymentSuccess}
            />
          </Workspace>
        </CardPane>
      </Wallet>
    );
  }
}

App.propTypes = {
  data: PropTypes.array,
};

export default App;
