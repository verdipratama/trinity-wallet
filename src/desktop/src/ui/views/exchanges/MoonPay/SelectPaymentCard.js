import head from 'lodash/head';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import toUpper from 'lodash/toUpper';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { selectPaymentCard } from 'actions/exchanges/MoonPay';
import { getCustomerPaymentCards, getSelectedPaymentCard } from 'selectors/exchanges/MoonPay';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';
import Icon from 'ui/components/Icon';
import Select from 'ui/components/input/Select';

import css from './index.scss';

/** MoonPay select payment card screen component */
class SelectPaymentCard extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        selectedPaymentCard: PropTypes.object,
        /** @ignore */
        paymentCards: PropTypes.array.isRequired,
        /** @ignore */
        selectPaymentCard: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    static options = [
        {
            title: 'moonpay:storedPaymentCard',
            redirectUrl: 'review-purchase',
        },
        {
            title: 'moonpay:addACreditOrDebitCard',
            redirectUrl: 'user-basic-info',
        },
    ];

    constructor(props) {
        super(props);

        this.state = {
            selectedPaymentCard: isEmpty(props.selectedPaymentCard)
                ? head(props.paymentCards)
                : props.selectedPaymentCard,
            selectedOptionIndex: 0,
        };
    }

    /**
     * Formats card info for dropdown options
     *
     * @method formatCardInfo
     *
     * @param {object} cardInfo
     *
     * @returns {object}
     */
    formatCardInfo(cardInfo) {
        const { brand, id, lastDigits } = cardInfo;

        return {
            id,
            text: `${toUpper(brand)} **** **** **** ${lastDigits}`,
        };
    }

    /**
     * Renders payment card option row
     *
     * @method renderOptionRow
     *
     * @param {number} rowIndex
     * @param {boolean} isSelected
     * @param {object} option
     */
    renderOptionRow(rowIndex, isSelected, option) {
        const { t } = this.props;

        return (
            <span
                key={rowIndex}
                className={css.option}
                onClick={() => this.setState({ selectedOptionIndex: rowIndex })}
            >
                <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => this.setState({ selectedOptionIndex: rowIndex })}
                />
                <span>{t(option.title)}</span>
            </span>
        );
    }

    /**
     * Renders payment card options
     *
     * @method renderOptions
     *
     * @returns {void}
     */
    renderOptions() {
        const { t } = this.props;
        const { selectedOptionIndex } = this.state;

        const selectedPaymentCard = this.formatCardInfo(this.state.selectedPaymentCard);
        const paymentCards = map(this.props.paymentCards, this.formatCardInfo);

        return map(SelectPaymentCard.options, (option, index) => {
            const isSelected = selectedOptionIndex === index;

            if (index) {
                return this.renderOptionRow(index, isSelected, option);
            }

            return (
                <section key={index}>
                    {this.renderOptionRow(index, isSelected, option)}
                    {isSelected && (
                        <Select
                            label={t('moonpay:card')}
                            value={selectedPaymentCard.text}
                            onChange={(paymentCardText) => {
                                const paymentCard = find(paymentCards, { text: paymentCardText });

                                this.setState({
                                    selectedPaymentCard: find(this.props.paymentCards, {
                                        id: paymentCard.id,
                                    }),
                                });
                            }}
                            options={paymentCards.map((item) => ({ value: item, label: item }))}
                        />
                    )}
                </section>
            );
        });
    }

    render() {
        const { t } = this.props;

        return (
            <form>
                <Icon icon="moonpay" size={200} />
                <section className={css.long}>
                    <Info displayIcon={false}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '28px' }}> {t('moonpay:selectPaymentMethod')}</p>
                            <p
                                style={{
                                    paddingTop: '20px',
                                }}
                            >
                                {t('moonpay:pleaseChooseFromTheOptionsBelow')}
                            </p>
                        </div>
                    </Info>
                    <div className={css.cards}>{this.renderOptions()}</div>
                </section>
                <footer className={css.choiceDefault}>
                    <div>
                        <Button
                            id="to-cancel"
                            onClick={() => this.props.history.goBack()}
                            className="square"
                            variant="dark"
                        >
                            {t('global:goBack')}
                        </Button>
                        <Button
                            id="to-transfer-funds"
                            onClick={() => {
                                this.props.history.push('/exchanges/moonpay/add-amount');
                                this.props.selectPaymentCard(this.state.selectedPaymentCard.id);
                            }}
                            className="square"
                            variant="primary"
                        >
                            {t('global:continue')}
                        </Button>
                    </div>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    isUpdatingCustomer: state.exchanges.moonpay.isUpdatingCustomer,
    hasErrorUpdatingCustomer: state.exchanges.moonpay.hasErrorUpdatingCustomer,
    selectedPaymentCard: getSelectedPaymentCard(state),
    paymentCards: getCustomerPaymentCards(state),
});

const mapDispatchToProps = {
    selectPaymentCard,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withTranslation()(SelectPaymentCard));
