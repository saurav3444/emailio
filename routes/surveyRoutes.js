const _ = require("lodash");
const { Path } = require('path-parser')
const { URL } = require('url');
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const Survey = mongoose.model('surveys');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');
const sgMail = require('@sendgrid/mail')
const keys = require('../config/key');


sgMail.setApiKey(keys.sendGridKey)

module.exports = app => {

    app.get('/api/surveys', requireLogin, async (req, res) => {
        const surveys = await Survey.find({ _user: req.user.id })
            .select({ recipients: false });
        res.send(surveys);
    });


    app.get('/api/surveys/:surveyId/:choice', (req, res) => {
        res.send('Thanks for your response!');
    });

    app.post('/api/surveys/webhooks', (req, res) => {

        const p = new Path('/api/surveys/:surveyId/:choice');

        const events = _.chain(req.body)
            .map(({ email, url }) => {

                const match = p.test(new URL(url).pathname);
                if (match) {
                    return { email: email, surveyId: match.surveyId, choice: match.choice };
                }
            })
            .compact()
            .uniqBy('email', 'surveyId')
            .each(({ surveyId, email, choice }) => {
                Survey.updateOne(
                    {
                        _id: surveyId,
                        recipients: {
                            $elemMatch: { email: email, responded: false }
                        }
                    },
                    {
                        $inc: { [choice]: 1 },
                        $set: { 'recipients.$.responded': true, lastResponded: new Date() },

                    }
                ).exec();
            })
            .value();

        console.log(events)
        res.send({});

    })

    app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {

        const { title, subject, body, recipients } = req.body;

        const recipientListFormatted = recipients.split(',').map(email => email.trim());
        const survey = new Survey({
            title,
            subject,
            body,
            recipients: recipients.split(',').map((email) => ({ email: email.trim() })),
            _user: req.user.id,
            dateSent: Date.now()
        });


        const msg = {

            to: recipientListFormatted,
            from: 'saurav3494@gmail.com',
            subject,
            text: body,
            html: surveyTemplate(survey)
        }

        try {
            await sgMail.sendMultiple(msg);
            await survey.save();
            req.user.credits -= 50;
            const user = await req.user.save();
            res.send(user);
            console.log(recipientListFormatted)
        } catch (err) {
            res.status(422).send(err);
        }
    });
}