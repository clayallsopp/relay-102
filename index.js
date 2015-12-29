let React    = require('react');
let ReactDOM = require('react-dom');
let Relay    = require('react-relay');

class DBExplorer extends React.Component {
  render() {
    let variables = this.props.relay.variables;
    console.log(this.props.store);
    console.log(this.props);

    let currentKey = variables.key;

    return <div>
      <input type='text' placeholder='Key' value={ currentKey } onChange={ this._onChange.bind(this) } />
      <div>Key: { currentKey }</div>
      <div>Value: { this.props.store.valueForKey.value }</div>
    </div>;
  }

  _onChange(ev) {
    let key = ev.target.value;
    this.props.relay.setVariables({
      key
    });
  }
}

DBExplorer = Relay.createContainer(DBExplorer, {
  initialVariables: {
    key: ''
  },
  fragments: {
    store: () => Relay.QL`
      fragment on KeyValueAPI {
        valueForKey(key: $key) {
          key
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
    store: ((Component) => {
      return Relay.QL`
      query root {
        keyValue { ${Component.getFragment('store')} },
      }
    `}),
  };
}

Relay.injectNetworkLayer(
  new Relay.DefaultNetworkLayer('http://www.graphqlHub.com/graphql')
);

let mountNode = document.getElementById('container');
let rootComponent = <Relay.RootContainer
  Component={DBExplorer}
  route={new KeyValueRoute()} />;
ReactDOM.render(rootComponent, mountNode);
