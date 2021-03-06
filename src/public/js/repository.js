import React from 'react';
import PropTypes from 'prop-types';

/**
 * Repository class
 **/
export class Repository extends React.Component { // eslint-disable-line no-unused-vars
  /**
   * contructor - The constructor
   *
   * @param {object} props - The properties
   * @return {void}
   **/
  constructor(props) {
    super(props);
    this.state = {};
    for (const pullRequest of this.props.repository.pull_requests) {
      this.state[pullRequest.title] = {fetched: false};
    }
    this.handleChange = this.handleChange.bind(this);
  }

  /**
   * componentDidMount - after component mount
   *
   * @return {void}
   **/
  componentDidMount() {
    this.props.repository.pull_requests.forEach((pullRequest) => {
      const getPullRequest = new Request(`/v1/${this.props.repository.full_name}/pull/${pullRequest.number}`, {
        method: 'GET',
      });
      fetch(getPullRequest)
        .then((res) => res.json())
        .then((result) => {
          const pullRequestData = result.pull_request;
          pullRequestData.fetched = true;
          this.setState({[pullRequestData.title]: pullRequestData});
        }).catch(function(e) {
          console.log(`error: ${e}`);
        });
    });
  }

  /**
   * handleChange - handles changes
   *
   * @param {object} event - The event
   * @return {void}
   **/
  handleChange(event) {
    const updateRepository = new Request(`/v1/${event.target.name}/`, {
      method: 'PUT',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({'checked': event.target.checked}),
    });
    fetch(updateRepository);
  }

  /**
   * render - renders
   * @return {object} - The element to be renderd
   **/
  render() {
    const pullRequests = [];
    for (const pullRequest of Object.keys(this.state)) {
      const pullRequestData = this.state[pullRequest];
      if (!pullRequestData.fetched) {
        continue;
      }
      let className = 'pullRequestLine gray';
      let title = 'Not mergeable';
      let content = pullRequestData.title;
      if (pullRequestData.mergeable) {
        className = 'pullRequestLine red';
        title = 'Changes requested will not be merged';
        if (pullRequestData.stats.coefficient > 0) {
          className = 'pullRequestLine green';
          title = 'Will be merged automatically';
          content = <div className="pullRequestListItem"><div>{pullRequestData.title}</div><div>merge on {new Date(pullRequestData.times.merge_date * 1000 || 0).toISOString()}</div></div>;
        }
      }
      pullRequests.push(<li key={pullRequestData.title} className={className} title={title}>{content}</li>);
    }
    const pullRequestsTag = <ul>{pullRequests}</ul>;

    return (<div key={this.props.repository.full_name} className="repository">
      <div className="repositoryName">{this.props.repository.full_name}</div>
      <div className="switcher">
        <label className="switch">
          <input type="checkbox" defaultChecked={this.props.repository.configured} name={this.props.repository.full_name} onClick={(e) => this.handleChange(e)}/>
          <span className="slider round"></span>
        </label>
      </div>
      {pullRequestsTag}
    </div>
    );
  }
}

Repository.propTypes = {
  repository: PropTypes.object,
};
