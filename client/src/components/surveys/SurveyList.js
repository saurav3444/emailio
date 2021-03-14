import React, { Component } from 'react'
import { connect } from "react-redux";
import { fetchSurveys } from '../../actions';

class SurveyList extends Component {

    componentDidMount() {
        const a = this.props.fetchSurveys();
    }

    renderSurveys() {

        return this.props.surveys.map(survey => {
            return (
                <div className="card blue darken-1" key={survey._id}>
                    <div className="card-content">
                        <span className="card-title">{survey.title}</span>
                        <p>
                            {survey.body}
                        </p>
                        <p className="right">
                            sent On : {new Date(survey.dateSent).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="card-action">
                        <a>Yes: {survey.yes}</a>
                        <a>No: {survey.no}</a>
                    </div>
                </div>
            );
        })

    }

    render() {
        return (
            <div>
                {this.renderSurveys()}
            </div>
        )
    }
}

function mapStateToProps({ Surveys }) {
    return { Surveys };
}

export default connect(mapStateToProps, { fetchSurveys })(SurveyList);