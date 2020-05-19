require('!!file-loader?name=[name].[ext]!./index.html')
/* required library for our React app */
var ReactDOM = require('react-dom')
var React = require("react")
var createReactClass = require('create-react-class')
var Qs = require('qs')
var Cookie = require('cookie')

/* required css for our application */
require('./webflow/orders.css');

export var browserState = {}

var Child = createReactClass({
    render() {
        var [ChildHandler,...rest] = this.props.handlerPath
        return <ChildHandler {...this.props} handlerPath={rest} />
    }
})

export default function onPathChange() {
    var path = location.pathname
    var qs = Qs.parse(location.search.slice(1))
    var cookies = Cookie.parse(document.cookie)

    browserState = {
        ...browserState,
        path: path,
        qs: qs,
        cookie: cookies
    }

    var route, routeProps
    //We try to match the requested path to one our our routes
    for(var key in routes) {
        routeProps = routes[key].match(path, qs)
        if(routeProps){
            route = key
            break;
        }
    }

    browserState = {
        ...browserState,
        ...routeProps,
        route: route
    }
    //If we don't have a match, we render an Error component
    if(!route)
        return ReactDOM.render(<ErrorPage message={"Not Found"} code={404}/>, document.getElementById('root'))
    ReactDOM.render(<Child {...browserState}/>, document.getElementById('root'))
}

export var routes = {
    "orders": {
        path: (params) => {
            return "/";
        },
        match: (path, qs) => {
            return (path == "/") && {handlerPath: [Layout, Header, Orders]}
        }
    },
    "order": {
        path: (params) => {
            return "/order/" + params;
        },
        match: (path, qs) => {
            var r = new RegExp("/order/([^/]*)$").exec(path)
            return r && {handlerPath: [Layout, Header, Order], order_id: r[1]}
        }
    }
}

window.addEventListener("popstate", ()=>{ onPathChange() })
onPathChange()

export var Layout = createReactClass({
    render() {
        return <JSXZ in="orders" sel=".layout">
            <Z sel=".header-container">
                <this.props.Child {...this.props}/>
            </Z>
        </JSXZ>
    }
})

export var Header = createReactClass({
    render() {
        return (
            <JSXZ in="orders" sel=".header-container">
                <Z sel=".orders">
                    <this.props.Child {...this.props}/>
                </Z>
            </JSXZ>
        )
    }
})

export var Order = createReactClass({
    render() {
        return (
            <JSXZ in="details" sel=".order">
                {/*<Z sel=".basic-div-block">*/}
                {/*    <this.props.Child {...this.props}/>*/}
                {/*</Z>*/}
                {/*<Z sel=".columns-5">*/}
                {/*    <this.props.Child {...this.props}/>*/}
                {/*</Z>*/}
            </JSXZ>
        )
    }
})

export var Orders = createReactClass( {
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
        <JSXZ in="orders" sel=".orders">
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
