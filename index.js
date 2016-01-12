var util = require('./util.js'),
    _ = require('lodash'),
    pickInputs = {
        'query': 'query',
        'sort_by': 'sort_by',
        'sort_order': 'sort_order'
    }, pickOutputs = {
        id: { key: 'results', fields: ['id'] },
        name: { key: 'results', fields: ['name'] },
        created_at: { key: 'results', fields: ['created_at'] },
        updated_at: { key: 'results', fields: ['updated_at'] },
        result_type: { key: 'results', fields: ['result_type'] },
        url: { key: 'results', fields: ['url'] }
    };

module.exports = {

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs),
            token = dexter.provider('zendesk').credentials('access_token'),
            username = dexter.provider('zendesk').data('username'),
            subdomain = dexter.provider('zendesk').data('subdomain');

        if (!token || !username || !subdomain)
            return this.fail('A [access_token, username, subdomain] environment variable is required for this module');

        if (validateErrors)
            return this.fail(validateErrors);

        var request = require('request').defaults({
            baseUrl: 'https://' + subdomain + '.zendesk.com/api/v2/'
        });

        request.get({
            uri: '/search.json',
            qs: inputs,
            auth: {
                user: username.concat('/token'),
                pass: token
            },
            json: true
        }, function (err, response, result) {
            if (err || (result && result.error))
                this.fail(err || result);
            else
                this.complete(util.pickOutputs(result, pickOutputs));
        }.bind(this));
    }
};
