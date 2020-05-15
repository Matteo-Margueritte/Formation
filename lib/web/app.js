require('!!file-loader?name=[name].[ext]!./index.html')
/* required library for our React app */
var ReactDOM = require('react-dom')
var React = require("react")
var createReactClass = require('create-react-class')

/* required css for our application */
require('./webflow/orders.css');


// var OrderList = createReactClass({
//   render() {
//     return (<div>{result}</div>)
//   }
// })

var Page = createReactClass( {
  render(){

    var orders = [
      {remoteid: "000000189", custom: {customer: {full_name: "TOTO & CIE"}, billing_address: "Some where in the world"}, items: 2},
      {remoteid: "000000190", custom: {customer: {full_name: "Looney Toons"}, billing_address: "The Warner Bros Company"}, items: 3},
      {remoteid: "000000191", custom: {customer: {full_name: "Asterix & Obelix"}, billing_address: "Armorique"}, items: 29},
      {remoteid: "000000192", custom: {customer: {full_name: "Lucky Luke"}, billing_address: "A Cowboy doesn't have an address. Sorry"}, items: 0},
    ]
    var result = orders.map((order, index) => (<JSXZ key={index} in="orders" sel=".columns-4">
          <Z sel=".home-order-command-number">
            {order.remoteid}
          </Z>
          <Z sel=".home-order-customer">
            {order.custom.customer.full_name}
            s  </Z>
          <Z sel=".quantity">
            {order.items}
          </Z>
          <Z sel=".home-order-address">
            {order.custom.billing_address}
          </Z>
        </JSXZ>
    ))
    console.warn("before return");
    return (
        <JSXZ in="orders" sel=".container">
          <Z sel=".div-block-3">
            <JSXZ in="orders" sel=".columns-3">
              <Z sel=".leftcolumn"><ChildrenZ></ChildrenZ></Z>
              <Z sel=".middlecolumn"><ChildrenZ></ChildrenZ></Z>
              <Z sel=".middlecolumn"><ChildrenZ></ChildrenZ></Z>
              <Z sel=".middlecolumn"><ChildrenZ></ChildrenZ></Z>
              <Z sel=".middlecolumn"><ChildrenZ></ChildrenZ></Z>
              <Z sel=".rightcolumn"><ChildrenZ></ChildrenZ></Z>
            </JSXZ>
            {result}
          </Z>
        </JSXZ>
    )
  }
})

ReactDOM.render(<Page />, document.getElementById('root'));
