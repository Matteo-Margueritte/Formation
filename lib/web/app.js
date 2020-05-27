require('!!file-loader?name=[name].[ext]!./index.html')
/* required library for our React app */
var ReactDOM = require('react-dom')
var React = require("react")
var createReactClass = require('create-react-class')
var Qs = require('qs')
var Cookie = require('cookie')

import {Layout, Child, Order, Orders, Header,OrderDetail} from "./src/components";
import {addRemoteProps} from "./src/remote_props";

/* required css for our application */
require('./webflow/orders.css');

var GoTo = (route, params, query) => {
    var qs = Qs.stringify(query)
    var url = routes[route].path(params) + ((qs == '') ? '' : ('?' + qs))
    history.pushState({}, "", url)
    onPathChange()
}

var browserState = {
    goTo: GoTo
}

function onPathChange() {
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
    // if(!route)
    //     return ReactDOM.render(<ErrorPage message={"Not Found"} code={404}/>, document.getElementById('root'))
    // ReactDOM.render(<Child {...browserState}/>, document.getElementById('root'))
    addRemoteProps(browserState).then(
        (props) => {
            browserState = props
            //Log our new browserState
            console.log("After resolve", browserState)
            //Render our components using our remote data
            ReactDOM.render(<Child {...browserState}/>, document.getElementById('root'))
        }, (res) => {
            ReactDOM.render(<ErrorPage message={"Shit happened"} code={res.http_code}/>, document.getElementById('root'))
        })
}

var ErrorPage = createReactClass({
    render() {
        return <h1>{this.props.message}</h1>
    }
})

var routes = {
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
            return r && {handlerPath: [Layout, Header, Order, OrderDetail], order_id: r[1]}
        }
    }
}

window.addEventListener("popstate", ()=>{ onPathChange() })
onPathChange()