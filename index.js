let React    = require('react');
let ReactDOM = require('react-dom');
let Relay    = require('react-relay');

class SaveKeyMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation GraphQLHubMutationAPI {
      keyValue_setValue
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on SetValueForKeyPayload {
        item {
          value
          id
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        item: this.props.item.id,
      },
    }];
  }

  getVariables() {
   return { id: this.props.item.id, value: this.props.item.value };
  }

  getOptimisticResponse() {
    return {
      item : {
        id : this.props.item.id,
        value : this.props.item.value,
      }
    }
  }
}

class Explorer extends React.Component {
  render() {
    let currentKey = this.props.relay.variables.id;
    let style = {};
    if (this.props.relay.hasOptimisticUpdate(this.props.item.getValue)) {
      style.color = 'red';
    }

    return <div>
      <input type='text' placeholder='Key' value={ currentKey } onChange={ this._onChange.bind(this) } />
      <div>Key: { currentKey }</div>
      <div style={ style }>Value: { this.props.item.getValue.value }</div>
      <hr />
      <input type='text' placeholder='Key' ref='newKey' />
      <input type='text' placeholder='Value' ref='newValue' />
      <input type='button' value='Save' onClick={ this._onClick.bind(this) } />
    </div>;
  }

  _onChange(ev) {
    let id = ev.target.value;
    this.props.relay.setVariables({
      id
    });
  }

  _onClick() {
    let id   = this.refs.newKey.value;
    let value = this.refs.newValue.value;

    Relay.Store.update(
      new SaveKeyMutation({
        item: { id, value },
      })
    );
  }
}

Explorer = Relay.createContainer(Explorer, {
  initialVariables: {
    id: ''
  },
  fragments: {
    item: () => Relay.QL`
      fragment on KeyValueAPI {
        getValue(id: $id) {
          value
          id
        },
      }
    `,
  },
});

class KeyValueRoute extends Relay.Route {
  static routeName = 'KeyValueRoute';
  static queries = {
    item: ((Component) => {
      return Relay.QL`
      query root {
        keyValue { ${Component.getFragment('item')} },
      }
    `}),
  };
}

Relay.injectNetworkLayer(
  new Relay.DefaultNetworkLayer('http://www.graphqlHub.com/graphql')
);

let mountNode = document.getElementById('container');
let rootComponent = <Relay.RootContainer
  Component={Explorer}
  route={new KeyValueRoute()} />;
ReactDOM.render(rootComponent, mountNode);
