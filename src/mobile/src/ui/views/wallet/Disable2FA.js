import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import authenticator from 'authenticator';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { navigator } from 'libs/navigation';
import { resetWallet, set2FAStatus } from 'shared-modules/actions/settings';
import { generateAlert } from 'shared-modules/actions/alerts';
import { getTwoFactorAuthKeyFromKeychain } from 'libs/keychain';
import WithBackPressGoToHome from 'ui/components/BackPressGoToHome';
import Fonts from 'ui/theme/fonts';
import CustomTextInput from 'ui/components/CustomTextInput';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topWrapper: {
        flex: 1.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midWrapper: {
        flex: 1.6,
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    generalText: {
        fontFamily: Fonts.secondary,
        fontSize: Styling.fontSize4,
        textAlign: 'center',
        paddingBottom: height / 10,
        backgroundColor: 'transparent',
    },
});

/** Disable Two Factor Authentication component */
class Disable2FA extends Component {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        set2FAStatus: PropTypes.func.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
    };

    constructor() {
        super();
        this.state = {
            token: '',
        };
        this.goBack = this.goBack.bind(this);
        this.disable2FA = this.disable2FA.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('Disable2FA');
    }

    /**
     * Attempts to disable 2FA, fails if the token is not correct
     */
    disable2FA() {
        return getTwoFactorAuthKeyFromKeychain(this.props.password)
            .then((key) => {
                const verified = authenticator.verifyToken(key, this.state.token);
                if (verified) {
                    this.props.set2FAStatus(false);
                    this.goBack();
                    this.timeout = setTimeout(() => {
                        this.props.generateAlert(
                            'success',
                            '2FA is now disabled',
                            'You have successfully disabled Two Factor Authentication.',
                        );
                    }, 300);
                } else {
                    this.props.generateAlert('error', 'Wrong code', 'The code you entered is not correct.');
                }
            })
            .catch((err) => console.error(err)); // eslint-disable-line no-console
    }

    /**
     * Navigates to home screen
     *
     * @method goBack
     */
    goBack() {
        navigator.pop(this.props.componentId);
    }

    render() {
        const { t, theme } = this.props;
        const backgroundColor = { backgroundColor: theme.body.bg };
        const textColor = { color: theme.body.color };

        return (
            <View style={[styles.container, backgroundColor]}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topWrapper}>
                            <AnimatedComponent
                                animationInType={['slideInRight', 'fadeIn']}
                                animationOutType={['slideOutLeft', 'fadeOut']}
                                delay={400}
                            >
                                <Icon name="iota" size={width / 8} color={theme.body.color} />
                            </AnimatedComponent>
                        </View>
                        <View style={styles.midWrapper}>
                            <AnimatedComponent
                                animationInType={['slideInRight', 'fadeIn']}
                                animationOutType={['slideOutLeft', 'fadeOut']}
                                delay={266}
                            >
                                <Text style={[styles.generalText, textColor]}>Enter your token to disable 2FA</Text>
                            </AnimatedComponent>
                            <AnimatedComponent
                                animationInType={['slideInRight', 'fadeIn']}
                                animationOutType={['slideOutLeft', 'fadeOut']}
                                delay={133}
                            >
                                <CustomTextInput
                                    label="Token"
                                    onChangeText={(token) => this.setState({ token })}
                                    containerStyle={{ width: Styling.contentWidth }}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically
                                    returnKeyType="done"
                                    value={this.state.token}
                                    keyboardType="numeric"
                                    theme={theme}
                                />
                            </AnimatedComponent>
                        </View>
                        <View style={styles.bottomContainer}>
                            <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                                <DualFooterButtons
                                    onLeftButtonPress={this.goBack}
                                    onRightButtonPress={this.disable2FA}
                                    leftButtonText={t('global:cancel')}
                                    rightButtonText={t('done')}
                                />
                            </AnimatedComponent>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    password: state.wallet.password,
});

const mapDispatchToProps = {
    resetWallet,
    generateAlert,
    set2FAStatus,
};

export default WithBackPressGoToHome()(
    withNamespaces(['resetWalletRequirePassword', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Disable2FA)),
);
