require('!!file-loader?name=[name].[ext]!../index.html')
/* required library for our React app */
var ReactDOM = require('react-dom')
var React = require("react")
var createReactClass = require('create-react-class')
var Qs = require('qs')
var Cookie = require('cookie')

import {Layout, Child, Order, Orders, Header,OrderDetail} from "./components";
import {addRemoteProps} from "./remote_props";

/* required css for our application */
require('../webflow/orders.css');

var GoTo = (route, params, query) => {
    var qs = Qs.stringify(query)
    var url = routes[route].path(params) + ((qs == '') ? '' : ('?' + qs))
    history.pushState({}, "", url)
    onPathChange()
}

var propsToReload = []

var ReloadProps = (propsList, query = {}) => {
    propsToReload = propsToReload.concat(propsList)
    onPathChange(query)
}

var browserState = {
    goTo: GoTo,
    reloadProps: ReloadProps
}

function onPathChange(query = {}) {
    var path = location.pathname
    var qs = Qs.parse(location.search.slice(1))
    var cookies = Cookie.parse(document.cookie)

    console.log(location.search)
    console.error(qs)
    browserState = {
        ...browserState,
        path: path,
        qs: qs,
        query: query,
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
        route: route,
    }

    propsToReload.forEach(propsName => {
        if (browserState.hasOwnProperty(propsName))
            browserState[propsName] = null
    })
    propsToReload = []

    addRemoteProps(browserState).then(
        (props) => {
            browserState = props
            //Log our new browserState
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