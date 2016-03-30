// OpenSourceGoalsTable
//   -- SearchBar
//     -- GoalList
//       -- GoalItem
//   -- ProjectList
//     -- ProjectRow

var GoalItem = React.createClass({
  displayName: 'GoalItem',

  getInitialState: function () {
    return { active: false };
  },
  handleClick: function () {
    var active = !this.state.active;
    this.setState({ active: active });
    this.props.onStateChange({ active: active, goal: this.props.goal });
  },
  render: function () {
    var image_state = this.state.active ? 'color' : 'grayscale';
    return React.createElement('img', {
      onClick: this.handleClick,
      className: 'goal_img',
      src: "images/" + this.props.image + "-" + image_state + ".jpg",
      alt: this.props.goal });
  }
});

var GoalList = React.createClass({
  displayName: 'GoalList',

  getInitialState: function () {
    return { selectedGoals: [] };
  },
  selectGoal: function (goal) {
    var newGoals = this.state.selectedGoals.concat(goal);
    this.setState({ selectedGoals: newGoals });
    return newGoals;
  },
  deselectGoal: function (goal) {
    var index = this.state.selectedGoals.indexOf(goal);
    var newGoals = this.state.selectedGoals.filter((x, i) => i != index);
    this.setState({ selectedGoals: newGoals });
    return newGoals;
  },
  handleGoalStateChange: function (goalItem) {
    if (goalItem.active) {
      var newGoals = this.selectGoal(goalItem.goal);
    } else {
      var newGoals = this.deselectGoal(goalItem.goal);
    }
    this.props.onGoalsChanged(newGoals);
  },
  render: function () {
    var goalItemNodes = this.props.goals.map(function (goalData) {
      return React.createElement(GoalItem, { key: goalData.id,
        image: goalData.image, goal: goalData.goal,
        onStateChange: this.handleGoalStateChange });
    }.bind(this));
    return React.createElement(
      'div',
      { className: 'goalList' },
      goalItemNodes
    );
  }
});

var SearchBar = React.createClass({
  displayName: 'SearchBar',

  getInitialState: function () {
    return { textQuery: '', goalsQuery: [] };
  },
  handleQueryTextChange: function (e) {
    this.setState({ textQuery: e.target.value });
  },
  handleSearch: function (e) {
    // e.preventDefault();
    var textQuery = this.state.textQuery.trim();
    var goalsQuery = this.state.goalsQuery;
    this.props.onSearch({ textQuery: textQuery, goalsQuery: goalsQuery });
  },
  handleSubmit: function (e) {
    e.preventDefault();
    var textQuery = this.state.textQuery.trim();
    var goalsQuery = this.state.goalsQuery;
    this.props.onSearch({ textQuery: textQuery, goalsQuery: goalsQuery });
  },
  handleGoalsChange: function (goals) {
    this.setState({ goalsQuery: goals });
  },
  render: function () {
    return React.createElement(
      'div',
      { id: 'search_bar ui segment' },
      React.createElement(
        'div',
        { className: 'ui action input' },
        React.createElement('input', { type: 'text',
          placeholder: 'Enter search text...',
          value: this.state.textQuery,
          onChange: this.handleQueryTextChange
        }),
        React.createElement(
          'button',
          { onClick: this.handleSearch, className: 'ui button' },
          'Search'
        )
      ),
      React.createElement(GoalList, { goals: this.props.goals, onGoalsChanged: this.handleGoalsChange })
    );
  }
});

var ProjectRow = React.createClass({
  displayName: 'ProjectRow',

  render: function () {
    return React.createElement(
      'div',
      { className: 'item' },
      React.createElement(
        'div',
        { className: 'ui small image' },
        React.createElement('img', { src: this.props.project.img_source })
      ),
      React.createElement(
        'div',
        { className: 'content' },
        React.createElement(
          'div',
          { className: 'header' },
          this.props.project.title
        ),
        React.createElement(
          'div',
          { className: 'meta' },
          React.createElement(
            'span',
            { className: 'project_link' },
            React.createElement(
              'a',
              { href: this.props.project.demo_url },
              'Learn More'
            )
          ),
          '|',
          React.createElement(
            'span',
            { className: 'github_link' },
            React.createElement(
              'a',
              { href: this.props.project.demo_url },
              'See code on Github'
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'description' },
          React.createElement(
            'p',
            null,
            this.props.project.description
          )
        ),
        React.createElement(
          'div',
          { className: 'extra' },
          React.createElement(
            'div',
            { className: 'ui label' },
            'IMAX'
          ),
          React.createElement(
            'div',
            { className: 'ui label' },
            React.createElement('i', { className: 'globe icon' }),
            ' Additional Languages'
          )
        )
      )
    );
  }
});

var ProjectList = React.createClass({
  displayName: 'ProjectList',

  render: function () {
    var projectNodes = this.props.projects.map(function (project, key) {
      var context = {
        title: project["Project Name"],
        description: project["Description"],
        img_source: project["Image URL"],
        tags: project["Related SDGs"],
        demo_url: project["Demo or Website URL"],
        repo_url: project["Code Repository URL"]
      };
      return React.createElement(ProjectRow, { key: key, project: context });
    }.bind(this));
    return React.createElement(
      'div',
      { className: 'ui segment loading' },
      React.createElement(
        'div',
        { id: 'projectList', className: 'ui items' },
        projectNodes
      )
    );
  }
});

var OpenSourceGoalsTable = React.createClass({
  displayName: 'OpenSourceGoalsTable',

  getInitialState: function () {
    return { projects: this.props.projects };
  },
  onAjaxComplete: function (data, two, three) {
    this.setState({ projects: data.params.entries });
  },
  handleSearch: function (params) {
    // TODO create a loading spinner
    // TODO add a label to the blockspring query to make the column names more js-friendly
    return blockspring.runParsed("open-source-sdgs-api", {
      search_text: params.textQuery,
      limit: 10,
      offset: 0,
      goals: params.goalsQuery.join("|")
    }, { "api_key": "br_27539_53bd348e35991a59949c1e737485bc7210f036d7" }, this.onAjaxComplete);
  },
  render: function () {
    return React.createElement(
      'div',
      { className: 'segments' },
      React.createElement(SearchBar, { onSearch: this.handleSearch, goals: this.props.goals }),
      React.createElement(ProjectList, { projects: this.state.projects })
    );
  }
});

var sustainableGoals = [{ id: 1, image: "sdg-icon-01", goal: "1. No Poverty" }, { id: 2, image: "sdg-icon-02", goal: "2. Zero Hunger" }, { id: 3, image: "sdg-icon-03", goal: "3. Good Health and Well-Being" }, { id: 4, image: "sdg-icon-04", goal: "4. Quality Education" }, { id: 5, image: "sdg-icon-05", goal: "5. Gender Equality" }, { id: 6, image: "sdg-icon-06", goal: "6. Clean Water and Sanitation" }, { id: 7, image: "sdg-icon-07", goal: "7. Affordable and Clean Energy" }, { id: 8, image: "sdg-icon-08", goal: "8. Decent Work and Economic Growth" }, { id: 9, image: "sdg-icon-09", goal: "9. Industry, Innovation and Infrastructure" }, { id: 10, image: "sdg-icon-10", goal: "10. Reduced Inequalities" }, { id: 11, image: "sdg-icon-11", goal: "11. Sustainable Cities and Communities" }, { id: 12, image: "sdg-icon-12", goal: "12. Responsible Consumption and Production" }, { id: 13, image: "sdg-icon-13", goal: "13. Climate Action" }, { id: 14, image: "sdg-icon-14", goal: "14. Life Below Water" }, { id: 15, image: "sdg-icon-15", goal: "15. Life on Land" }, { id: 16, image: "sdg-icon-16", goal: "16. Peace, Justice and Strong Institutions" }, { id: 17, image: "sdg-icon-17", goal: "17. Partnerships for the Goals" }];

var projects = [{
  "Project Name": "Example Project",
  "Description": "Project Drawdown is a research and communications organization that aims to describe when and how humanity can reach climate drawdown - the point at which greenhouse gas concentrations in the atmosphere begin to decline on a year-to-year basis. We are conducting a global analysis of 100 climate solutions and their potential financial and climate impact over the next 30 years and making this information widely available through an internationally published book, online interactive platform and open-source database.",
  "Image URL": "http://www.kobotoolbox.org/sites/toolbox/files/images/features/kc_map.png",
  "Related SDGs": "9. Industry, Innovation and Infrastructure",
  "Demo or Website URL": "https://www.google.com",
  "Code Repository URL": "https://www.github.com"
}, {
  "Project Name": "Super Project",
  "Description": "Project Drawdown is a research and communications organization that aims to describe when and how humanity can reach climate drawdown - the point at which greenhouse gas concentrations in the atmosphere begin to decline on a year-to-year basis. We are conducting a global analysis of 100 climate solutions and their potential financial and climate impact over the next 30 years and making this information widely available through an internationally published book, online interactive platform and open-source database.",
  "Image URL": "http://www.kobotoolbox.org/sites/toolbox/files/images/features/kc_map.png",
  "Related SDGs": "9. Industry, Innovation and Infrastructure",
  "Demo or Website URL": "https://www.google.com",
  "Code Repository URL": "https://www.github.com"
}];

ReactDOM.render(React.createElement(OpenSourceGoalsTable, { projects: projects, goals: sustainableGoals }), document.getElementById("container"));