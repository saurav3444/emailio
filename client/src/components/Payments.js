import React, { Component } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { connect } from 'react-redux'
import * as actions from '../actions'

class Payments extends Component {
    render() {
        return (
            <StripeCheckout
                name="Emailio"
                description="Rs 100 for 100 credits"
                amount={10000}
                token={token => this.props.handleToken(token)}
                stripeKey={process.env.REACT_APP_STRIPE_KEY}
                currency='INR'
            >
                <button className='btn'>
                    ADD CREDITS
            </button>
            </StripeCheckout>
        );
    }
}

export default connect(null, actions)(Payments);