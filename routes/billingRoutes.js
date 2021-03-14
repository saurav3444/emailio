const keys = require('../config/key');
const stripe = require('stripe')(keys.stripeSecretKey);
const requireLogin = require('../middlewares/requireLogin');

module.exports = app => {
    app.post('/api/stripe', requireLogin, async (req, res) => {

        const charge = await stripe.charges.create({
            amount: 10000,
            currency: 'INR',
            description: 'Rs100 for 100 credits',
            source: req.body.id
        });

        req.user.credits += 100;
        const user = await req.user.save();

        res.send(user);
    });
};